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
   * Tries to find matching official or custom blueprint for a raw name
   */
  public static findMatchingBlueprint(rawName: string, allBlueprints: Blueprint[]): Blueprint | undefined {
    const normRaw = this.normalizeString(rawName);
    if (!normRaw || normRaw.length < 2) return undefined;

    // 1. Exact or normalized exact match
    const exact = allBlueprints.find(b => {
      const normBName = this.normalizeString(b.name);
      const normBId = this.normalizeString(b.id);
      return normBName === normRaw || normBId === normRaw;
    });
    if (exact) return exact;

    // 2. Contains match (either blueprint contains raw or raw contains blueprint)
    const contains = allBlueprints.find(b => {
      const normBName = this.normalizeString(b.name);
      return normRaw.includes(normBName) || (normBName.length > 5 && normBName.includes(normRaw));
    });
    if (contains) return contains;

    // 3. Significant keyword matching (e.g., AD4B, AD5B, Seeker, Torpedo, Voyager, P8-SC, C54, FS-9, Morozov, etc.)
    const rawTokens = normRaw.split(' ').filter(t => t.length >= 3);
    if (rawTokens.length > 0) {
      let bestMatch: Blueprint | undefined;
      let maxMatches = 0;

      for (const bp of allBlueprints) {
        const bpTokens = new Set(this.normalizeString(bp.name).split(' '));
        let matchCount = 0;
        for (const token of rawTokens) {
          if (bpTokens.has(token)) matchCount++;
        }

        // Special priority for specific unique identifiers (AD4B, AD5B, JS-300, TS-2, Seeker, Strikeforce, etc.)
        const hasKeycode = rawTokens.some(t => 
          /^(ad4b|ad5b|js300|ts2|fr76|fr66|fr86|seeker|dominator|strikeforce|voyager|expedition|atlas|siren|spectre|p8sc|c54|fs9|karna|custodian|demeco|klaus)/i.test(t)
          && bpTokens.has(t)
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
   * Cleans extracted raw blueprint names (removes quotes, trailing colons, bracket tags, etc.)
   */
  private static cleanBlueprintName(name: string): string {
    return name
      .replace(/^["'\s:\-[\]]+/, '')
      .replace(/["'\s:\-[\]]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
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

    // Map of unique raw blueprint names -> details
    const rawBlueprintsMap = new Map<string, { rawName: string; timestamp?: string; sourceFile: string; originalLine: string }>();
    const rawKeywordLines: string[] = [];

    // Regex patterns for Blueprints that search ANYWHERE in the line (flexible & resilient)
    // 1. Standard Star Citizen notification: Added notification "Received Blueprint: <Name>: " [<ID>]
    const pReceivedNotification = /Received Blueprint:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    
    // 2. Direct unlock line variants
    const pUnlockedBlueprint = /(?:\[Blueprint\]|Blueprint)\s*(?:Unlocked|Received|Learned|Added|Item)?:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pCraftingRecipe = /Crafting recipe\s*(?:learned|unlocked|added|acquired)?:\s*([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    
    // 3. Generic blueprint prefix or tag (e.g. blueprint_ad4b_gatling or unlock_blueprint)
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

        // Check if line contains keywords for debug capture
        if (
          lowerLine.includes('blueprint') ||
          lowerLine.includes('received') ||
          lowerLine.includes('crafting') ||
          lowerLine.includes('recipe')
        ) {
          if (rawKeywordLines.length < 150) {
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
        const timestamp = this.extractTimestamp(line);

        // Check Pattern 1: Received Blueprint (Notification format)
        if (lowerLine.includes('received blueprint')) {
          const m = line.match(pReceivedNotification);
          if (m && m[1]) {
            extractedRawName = this.cleanBlueprintName(m[1]);
          }
        }

        // Check Pattern 2: [Blueprint] Unlocked / Recipe
        if (!extractedRawName && (lowerLine.includes('blueprint') || lowerLine.includes('crafting recipe'))) {
          const m2 = line.match(pUnlockedBlueprint) || line.match(pCraftingRecipe);
          if (m2 && m2[1]) {
            extractedRawName = this.cleanBlueprintName(m2[1]);
          }
        }

        // Check Pattern 3: ID tag like blueprint_ad4b
        if (!extractedRawName && lowerLine.includes('blueprint_')) {
          const m3 = line.match(pBlueprintId);
          if (m3 && m3[1]) {
            extractedRawName = this.cleanBlueprintName(m3[1].replace(/_/g, ' '));
          }
        }

        // Check Pattern 4: Fallback scan — if the line mentions "blueprint" and any known blueprint keyword
        if (!extractedRawName && lowerLine.includes('blueprint')) {
          for (const bp of allBlueprints) {
            const bpNorm = this.normalizeString(bp.name);
            if (bpNorm.length >= 4 && lowerLine.includes(bpNorm)) {
              extractedRawName = bp.name;
              break;
            }
          }
        }

        // Store unique extracted blueprint
        if (extractedRawName && extractedRawName.length >= 2 && !extractedRawName.toLowerCase().startsWith('error')) {
          const key = this.normalizeString(extractedRawName);
          if (!rawBlueprintsMap.has(key)) {
            rawBlueprintsMap.set(key, {
              rawName: extractedRawName,
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

    rawBlueprintsMap.forEach(({ rawName, timestamp, sourceFile, originalLine }) => {
      const matched = this.findMatchingBlueprint(rawName, allBlueprints);
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
}
