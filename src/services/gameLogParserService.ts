import { Blueprint } from '../types';
import { StorageService } from './storageService';

export interface ParsedGameLogBlueprint {
  rawName: string;
  matchedBlueprint?: Blueprint;
  isAlreadyUnlocked: boolean;
  status: 'matched_new' | 'matched_already_unlocked' | 'unmatched_custom';
  timestamp?: string;
  sourceFile: string;
  originalLine: string;
}

export interface GameLogAnalysisResult {
  playerHandle?: string;
  accountId?: string;
  gameVersion?: string;
  sessionDates: string[];
  totalLogFilesParsed: number;
  totalLinesScanned: number;
  blueprintsFound: ParsedGameLogBlueprint[];
  rawLogLinesWithKeywords: string[];
  matchedCount: number;
  newMatchesCount: number;
  alreadyUnlockedCount: number;
  unmatchedCustomCount: number;
}

export interface ParseProgressInfo {
  currentFileIndex: number;
  totalFiles: number;
  currentFileName: string;
  linesScanned: number;
  blueprintsCount: number;
  percent: number;
}

export class GameLogParserService {
  /**
   * Normalizes text for lenient fuzzy keyword matching
   */
  public static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[\-_/\\()\[\]":;,.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Cleans extracted raw blueprint names (removes quotes, trailing colons, bracket tags, etc.)
   */
  public static cleanBlueprintName(name: string): string {
    return name
      .replace(/^["'\s:\-[\]]+/, '')
      .replace(/["'\s:\-[\]]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tries to find matching official or custom blueprint for a raw name or line
   */
  public static findMatchingBlueprint(rawText: string, allBlueprints: Blueprint[]): Blueprint | undefined {
    const normRaw = this.normalizeString(rawText);
    if (!normRaw || normRaw.length < 2) return undefined;

    // 1. Exact or normalized exact match
    const exact = allBlueprints.find(b => {
      const normBName = this.normalizeString(b.name);
      const normBId = this.normalizeString(b.id);
      return normBName === normRaw || normBId === normRaw;
    });
    if (exact) return exact;

    // 2. Direct string containment
    const contains = allBlueprints.find(b => {
      const normBName = this.normalizeString(b.name);
      return (normRaw.length >= 4 && normBName.includes(normRaw)) || (normBName.length >= 4 && normRaw.includes(normBName));
    });
    if (contains) return contains;

    // 3. Keyword matching
    const rawTokens = normRaw.split(' ').filter(t => t.length >= 2);
    if (rawTokens.length > 0) {
      let bestMatch: Blueprint | undefined;
      let maxMatches = 0;

      for (const bp of allBlueprints) {
        const bpTokens = new Set(this.normalizeString(bp.name).split(' '));
        let matchCount = 0;
        for (const token of rawTokens) {
          if (bpTokens.has(token)) matchCount++;
        }

        const hasKeycode = rawTokens.some(t => 
          /^(ad4b|ad5b|js300|ts2|fr76|fr66|fr86|seeker|dominator|strikeforce|voyager|expedition|atlas|siren|spectre|p8sc|c54|fs9|karna|custodian|demeco|klaus|morozov|defiance|aril|pyro)/i.test(t)
          && (bpTokens.has(t) || bp.id.toLowerCase().includes(t))
        );

        if (hasKeycode && matchCount >= 1) {
          return bp;
        }

        if (matchCount > maxMatches && matchCount >= 2) {
          maxMatches = matchCount;
          bestMatch = bp;
        }
      }

      if (bestMatch) return bestMatch;
    }

    return undefined;
  }

  /**
   * Extracts timestamp from a log line if available
   */
  private static extractTimestamp(line: string): string | undefined {
    const match = line.match(/<([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?Z?)>/i);
    return match ? match[1] : undefined;
  }

  /**
   * Fast Non-Blocking Asynchronous Parser for massive Game.log files & backups
   * Yields event loop periodically so the UI NEVER hangs or crashes
   */
  public static async parseLogFilesAsync(
    files: { name: string; getText: () => Promise<string> }[],
    onProgress?: (info: ParseProgressInfo) => void
  ): Promise<GameLogAnalysisResult> {
    const allBlueprints = StorageService.getAllBlueprints();
    const unlockedIds = new Set(StorageService.getUnlockedBlueprintIds());

    let detectedHandle: string | undefined;
    let detectedAccountId: string | undefined;
    let detectedGameVersion: string | undefined;
    const sessionDatesSet = new Set<string>();
    let totalLines = 0;

    const rawBlueprintsMap = new Map<string, { rawName: string; matchedBp?: Blueprint; timestamp?: string; sourceFile: string; originalLine: string }>();
    const rawKeywordLines: string[] = [];

    // Pre-compiled regexes
    const pReceivedNotification = /Received Blueprint:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pGenericNotification = /notification\s*["']([^"'\r\n]+)["']/i;
    const pUnlockedBlueprint = /(?:\[Blueprint\]|Blueprint|Plan)\s*(?:Unlocked|Received|Learned|Added|Item|Reçu|Débloqué)?:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pCraftingRecipe = /(?:Crafting recipe|Recette)\s*(?:learned|unlocked|added|acquired|débloquée|apprise)?:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pBlueprintId = /(?:blueprint|recipe)_([a-zA-Z0-9_\-]+)/i;

    const handleRegexes = [
      /Player Handle:\s*([^\s\r\n,]+)/i,
      /AccountLogin:\s*([^\s\r\n,]+)/i,
      /LocalPlayer\s*[:=]\s*([^\s\r\n,]+)/i,
      /DisplayName\s*[:=]\s*([^\s\r\n,]+)/i,
      /CIG\s*Account:\s*([^\s\r\n,]+)/i
    ];

    const accountIdRegex = /AccountId:\s*([^\s\r\n,]+)|GEID:\s*(\d+)/i;
    const versionRegex = /Star Citizen\s+([0-9a-zA-Z._-]+(?:\s+LIVE)?)/i;
    const sessionDateRegex = /<([0-9]{4}-[0-9]{2}-[0-9]{2})T/;

    const totalFileCount = files.length;

    for (let fIdx = 0; fIdx < totalFileCount; fIdx++) {
      const fileEntry = files[fIdx];
      const content = await fileEntry.getText();
      const lines = content.split(/\r?\n/);
      const fileLineCount = lines.length;
      totalLines += fileLineCount;

      // Process in chunks of 2,500 lines to never block the main browser thread
      const CHUNK_SIZE = 2500;
      for (let i = 0; i < fileLineCount; i += CHUNK_SIZE) {
        const chunkEnd = Math.min(i + CHUNK_SIZE, fileLineCount);

        for (let j = i; j < chunkEnd; j++) {
          const line = lines[j];
          if (!line || line.length < 5) continue;

          const lowerLine = line.toLowerCase();

          // ULTRA FAST PRE-FILTER: Discard 99.8% of noise debug lines instantly without regex
          const isInteresting =
            lowerLine.includes('blueprint') ||
            lowerLine.includes('received') ||
            lowerLine.includes('crafting') ||
            lowerLine.includes('recipe') ||
            lowerLine.includes('recette') ||
            lowerLine.includes('notification') ||
            lowerLine.includes('plan') ||
            lowerLine.includes('unlocked') ||
            lowerLine.includes('player handle') ||
            lowerLine.includes('accountlogin') ||
            lowerLine.includes('star citizen') ||
            lowerLine.includes('geid');

          if (!isInteresting) continue;

          // Date extraction
          const dateMatch = line.match(sessionDateRegex);
          if (dateMatch && dateMatch[1]) {
            sessionDatesSet.add(dateMatch[1]);
          }

          // Handle extraction
          if (!detectedHandle) {
            for (const hr of handleRegexes) {
              const hm = line.match(hr);
              if (hm && hm[1] && hm[1] !== 'null' && hm[1] !== 'Unknown') {
                detectedHandle = hm[1].trim();
                break;
              }
            }
          }

          // Account ID
          if (!detectedAccountId) {
            const am = line.match(accountIdRegex);
            if (am) {
              detectedAccountId = (am[1] || am[2])?.trim();
            }
          }

          // Version
          if (!detectedGameVersion) {
            const vm = line.match(versionRegex);
            if (vm && vm[1]) {
              detectedGameVersion = vm[1].trim();
            }
          }

          const hasBlueprintKeyword =
            lowerLine.includes('blueprint') ||
            lowerLine.includes('received') ||
            lowerLine.includes('crafting') ||
            lowerLine.includes('recipe') ||
            lowerLine.includes('plan') ||
            lowerLine.includes('recette') ||
            lowerLine.includes('unlocked');

          if (hasBlueprintKeyword) {
            if (rawKeywordLines.length < 300) {
              rawKeywordLines.push(line.trim());
            }

            let extractedRawName: string | null = null;
            let matchedBpDirect: Blueprint | undefined;
            const timestamp = this.extractTimestamp(line);

            // 1. Notification Received Blueprint
            if (lowerLine.includes('received blueprint')) {
              const m = line.match(pReceivedNotification);
              if (m && m[1]) {
                extractedRawName = this.cleanBlueprintName(m[1]);
              }
            }

            // 2. Generic Notification with blueprint inside
            if (!extractedRawName && lowerLine.includes('notification')) {
              const mNotif = line.match(pGenericNotification);
              if (mNotif && mNotif[1]) {
                const inner = mNotif[1];
                if (/blueprint|plan|recipe|recette/i.test(inner)) {
                  extractedRawName = this.cleanBlueprintName(inner.replace(/^(?:Received Blueprint|Plan reçu|Recette|Blueprint):\s*/i, ''));
                }
              }
            }

            // 3. Unlocked Blueprint
            if (!extractedRawName && (lowerLine.includes('blueprint') || lowerLine.includes('crafting recipe') || lowerLine.includes('recette'))) {
              const m2 = line.match(pUnlockedBlueprint) || line.match(pCraftingRecipe);
              if (m2 && m2[1]) {
                extractedRawName = this.cleanBlueprintName(m2[1]);
              }
            }

            // 4. Tag identifier blueprint_
            if (!extractedRawName && lowerLine.includes('blueprint_')) {
              const m3 = line.match(pBlueprintId);
              if (m3 && m3[1]) {
                extractedRawName = this.cleanBlueprintName(m3[1].replace(/_/g, ' '));
              }
            }

            // 5. Deep Scan on all known blueprints
            const directMatch = this.findMatchingBlueprint(line, allBlueprints);
            if (directMatch) {
              matchedBpDirect = directMatch;
              if (!extractedRawName) {
                extractedRawName = directMatch.name;
              }
            }

            // Register detected item
            if (extractedRawName && extractedRawName.length >= 2 && !extractedRawName.toLowerCase().startsWith('error')) {
              const finalMatched = matchedBpDirect || this.findMatchingBlueprint(extractedRawName, allBlueprints);
              const key = finalMatched ? `bp_${finalMatched.id}` : `raw_${this.normalizeString(extractedRawName)}`;

              if (!rawBlueprintsMap.has(key)) {
                rawBlueprintsMap.set(key, {
                  rawName: finalMatched ? finalMatched.name : extractedRawName,
                  matchedBp: finalMatched,
                  timestamp,
                  sourceFile: fileEntry.name,
                  originalLine: line.trim()
                });
              }
            }
          }
        }

        // Yield to browser UI thread
        await new Promise(resolve => setTimeout(resolve, 0));

        if (onProgress) {
          const percent = Math.round(((fIdx + chunkEnd / fileLineCount) / totalFileCount) * 100);
          onProgress({
            currentFileIndex: fIdx + 1,
            totalFiles: totalFileCount,
            currentFileName: fileEntry.name,
            linesScanned: totalLines,
            blueprintsCount: rawBlueprintsMap.size,
            percent: Math.min(percent, 99)
          });
        }
      }
    }

    // Process extracted blueprints against catalog
    const blueprintsFound: ParsedGameLogBlueprint[] = [];
    let matchedCount = 0;
    let newMatchesCount = 0;
    let alreadyUnlockedCount = 0;
    let unmatchedCustomCount = 0;

    rawBlueprintsMap.forEach(({ rawName, matchedBp, timestamp, sourceFile, originalLine }) => {
      const matched = matchedBp || this.findMatchingBlueprint(rawName, allBlueprints);
      const isAlreadyUnlocked = matched ? unlockedIds.has(matched.id) : false;

      let status: 'matched_new' | 'matched_already_unlocked' | 'unmatched_custom' = 'unmatched_custom';

      if (matched) {
        matchedCount++;
        if (isAlreadyUnlocked) {
          alreadyUnlockedCount++;
          status = 'matched_already_unlocked';
        } else {
          newMatchesCount++;
          status = 'matched_new';
        }
      } else {
        unmatchedCustomCount++;
        status = 'unmatched_custom';
      }

      blueprintsFound.push({
        rawName,
        matchedBlueprint: matched,
        isAlreadyUnlocked,
        status,
        timestamp,
        sourceFile,
        originalLine
      });
    });

    // Sort: new matches first, then unmatched, then already unlocked
    blueprintsFound.sort((a, b) => {
      const score = (s: string) => s === 'matched_new' ? 0 : s === 'unmatched_custom' ? 1 : 2;
      return score(a.status) - score(b.status);
    });

    if (onProgress) {
      onProgress({
        currentFileIndex: totalFileCount,
        totalFiles: totalFileCount,
        currentFileName: 'Terminé',
        linesScanned: totalLines,
        blueprintsCount: blueprintsFound.length,
        percent: 100
      });
    }

    return {
      playerHandle: detectedHandle,
      accountId: detectedAccountId,
      gameVersion: detectedGameVersion,
      sessionDates: Array.from(sessionDatesSet).sort().reverse(),
      totalLogFilesParsed: totalFileCount,
      totalLinesScanned: totalLines,
      blueprintsFound,
      rawLogLinesWithKeywords: rawKeywordLines,
      matchedCount,
      newMatchesCount,
      alreadyUnlockedCount,
      unmatchedCustomCount
    };
  }

  /**
   * Auto-activates ALL activatable blueprints from both detected blueprints AND raw keyword lines
   */
  public static autoActivateAllFoundBlueprints(result: GameLogAnalysisResult): {
    activatedCount: number;
    totalWorkshopCount: number;
    activatedBlueprints: Blueprint[];
  } {
    const allBlueprints = StorageService.getAllBlueprints();
    const idsToUnlock = new Set<string>();
    const activatedList: Blueprint[] = [];

    // 1. Collect from parsed blueprints
    result.blueprintsFound.forEach(b => {
      if (b.matchedBlueprint) {
        idsToUnlock.add(b.matchedBlueprint.id);
      }
    });

    // 2. Collect from all raw keyword lines (exhaustive sweep)
    result.rawLogLinesWithKeywords.forEach(line => {
      const matched = this.findMatchingBlueprint(line, allBlueprints);
      if (matched) {
        idsToUnlock.add(matched.id);
      }
    });

    const idsArray = Array.from(idsToUnlock);
    const { addedCount, totalCount } = StorageService.unlockBlueprintIds(idsArray);

    idsArray.forEach(id => {
      const bp = allBlueprints.find(b => b.id === id);
      if (bp) activatedList.push(bp);
    });

    return {
      activatedCount: addedCount,
      totalWorkshopCount: totalCount,
      activatedBlueprints: activatedList
    };
  }
}
