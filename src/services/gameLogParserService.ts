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

    // 2. Direct string containment (either blueprint contains raw or raw contains blueprint)
    const contains = allBlueprints.find(b => {
      const normBName = this.normalizeString(b.name);
      return (normRaw.length >= 4 && normBName.includes(normRaw)) || (normBName.length >= 4 && normRaw.includes(normBName));
    });
    if (contains) return contains;

    // 3. Significant keyword matching (e.g., AD4B, AD5B, Seeker, Torpedo, Voyager, JS-300, TS-2, P8-SC, C54, FS-9, Morozov, etc.)
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

        // Special priority for specific unique identifiers
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
   * Parses one or multiple Game.log file contents and extracts blueprints & player info
   */
  public static parseLogFiles(files: { name: string; content: string }[]): GameLogAnalysisResult {
    const allBlueprints = StorageService.getAllBlueprints();
    const unlockedIds = new Set(StorageService.getUnlockedBlueprintIds());

    let detectedHandle: string | undefined;
    let detectedAccountId: string | undefined;
    let detectedGameVersion: string | undefined;
    const sessionDatesSet = new Set<string>();
    let totalLines = 0;

    // Map of unique raw blueprint names / matched IDs -> details
    const rawBlueprintsMap = new Map<string, { rawName: string; matchedBp?: Blueprint; timestamp?: string; sourceFile: string; originalLine: string }>();
    const rawKeywordLines: string[] = [];

    // Regex patterns for Blueprints that search ANYWHERE in the line
    const pReceivedNotification = /Received Blueprint:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pGenericNotification = /notification\s*["']([^"'\r\n]+)["']/i;
    const pUnlockedBlueprint = /(?:\[Blueprint\]|Blueprint|Plan)\s*(?:Unlocked|Received|Learned|Added|Item|Reçu|Débloqué)?:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pCraftingRecipe = /(?:Crafting recipe|Recette)\s*(?:learned|unlocked|added|acquired|débloquée|apprise)?:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pBlueprintId = /(?:blueprint|recipe)_([a-zA-Z0-9_\-]+)/i;

    // Regex patterns for Player Handle & Account
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

    for (const file of files) {
      const lines = file.content.split(/\r?\n/);
      totalLines += lines.length;

      for (const line of lines) {
        if (!line || line.trim().length === 0) continue;

        const lowerLine = line.toLowerCase();

        // Check if line contains keywords for capture
        const hasTriggerKeyword =
          lowerLine.includes('blueprint') ||
          lowerLine.includes('received') ||
          lowerLine.includes('crafting') ||
          lowerLine.includes('recipe') ||
          lowerLine.includes('notification') ||
          lowerLine.includes('plan') ||
          lowerLine.includes('recette') ||
          lowerLine.includes('unlocked');

        if (hasTriggerKeyword) {
          if (rawKeywordLines.length < 250) {
            rawKeywordLines.push(line.trim());
          }
        }

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

        // Account ID extraction
        if (!detectedAccountId) {
          const am = line.match(accountIdRegex);
          if (am) {
            detectedAccountId = (am[1] || am[2])?.trim();
          }
        }

        // Version extraction
        if (!detectedGameVersion) {
          const vm = line.match(versionRegex);
          if (vm && vm[1]) {
            detectedGameVersion = vm[1].trim();
          }
        }

        // =================================================================
        // BLUEPRINT EXTRACTION LOGIC
        // =================================================================
        let extractedRawName: string | null = null;
        let matchedBpDirect: Blueprint | undefined;
        const timestamp = this.extractTimestamp(line);

        // Check Pattern 1: Received Blueprint (Notification format)
        if (lowerLine.includes('received blueprint')) {
          const m = line.match(pReceivedNotification);
          if (m && m[1]) {
            extractedRawName = this.cleanBlueprintName(m[1]);
          }
        }

        // Check Pattern 2: Generic Notification with blueprint inside
        if (!extractedRawName && lowerLine.includes('notification')) {
          const mNotif = line.match(pGenericNotification);
          if (mNotif && mNotif[1]) {
            const inner = mNotif[1];
            if (/blueprint|plan|recipe|recette/i.test(inner)) {
              extractedRawName = this.cleanBlueprintName(inner.replace(/^(?:Received Blueprint|Plan reçu|Recette|Blueprint):\s*/i, ''));
            }
          }
        }

        // Check Pattern 3: [Blueprint] Unlocked / Recipe
        if (!extractedRawName && (lowerLine.includes('blueprint') || lowerLine.includes('crafting recipe') || lowerLine.includes('recette'))) {
          const m2 = line.match(pUnlockedBlueprint) || line.match(pCraftingRecipe);
          if (m2 && m2[1]) {
            extractedRawName = this.cleanBlueprintName(m2[1]);
          }
        }

        // Check Pattern 4: ID tag like blueprint_ad4b
        if (!extractedRawName && lowerLine.includes('blueprint_')) {
          const m3 = line.match(pBlueprintId);
          if (m3 && m3[1]) {
            extractedRawName = this.cleanBlueprintName(m3[1].replace(/_/g, ' '));
          }
        }

        // Check Pattern 5: Deep Scan against all known blueprints on ANY line with trigger keywords
        if (hasTriggerKeyword) {
          const directMatch = this.findMatchingBlueprint(line, allBlueprints);
          if (directMatch) {
            matchedBpDirect = directMatch;
            if (!extractedRawName) {
              extractedRawName = directMatch.name;
            }
          }
        }

        // Store unique extracted blueprint
        if (extractedRawName && extractedRawName.length >= 2 && !extractedRawName.toLowerCase().startsWith('error')) {
          const finalMatched = matchedBpDirect || this.findMatchingBlueprint(extractedRawName, allBlueprints);
          const key = finalMatched ? `bp_${finalMatched.id}` : `raw_${this.normalizeString(extractedRawName)}`;

          if (!rawBlueprintsMap.has(key)) {
            rawBlueprintsMap.set(key, {
              rawName: finalMatched ? finalMatched.name : extractedRawName,
              matchedBp: finalMatched,
              timestamp,
              sourceFile: file.name,
              originalLine: line.trim()
            });
          }
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

    return {
      playerHandle: detectedHandle,
      accountId: detectedAccountId,
      gameVersion: detectedGameVersion,
      sessionDates: Array.from(sessionDatesSet).sort().reverse(),
      totalLogFilesParsed: files.length,
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
