import { Blueprint } from '../types';
import { StorageService } from './storageService';

export interface ParsedGameLogBlueprint {
  rawName: string;
  matchedBlueprint?: Blueprint;
  isAlreadyUnlocked: boolean;
  status: 'matched_new' | 'matched_already_unlocked' | 'unmatched_custom';
  timestamp?: string;
  sourceFile: string;
}

export interface GameLogAnalysisResult {
  playerHandle?: string;
  accountId?: string;
  gameVersion?: string;
  sessionDates: string[];
  totalLogFilesParsed: number;
  totalLinesScanned: number;
  blueprintsFound: ParsedGameLogBlueprint[];
  matchedCount: number;
  newMatchesCount: number;
  alreadyUnlockedCount: number;
  unmatchedCustomCount: number;
}

export class GameLogParserService {
  /**
   * Normalizes text for lenient fuzzy keyword matching
   */
  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[\-_/\\()\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tries to find matching official or custom blueprint for a raw name
   */
  private static findMatchingBlueprint(rawName: string, allBlueprints: Blueprint[]): Blueprint | undefined {
    const normRaw = this.normalizeString(rawName);

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
      return normRaw.includes(normBName) || normBName.includes(normRaw);
    });
    if (contains) return contains;

    // 3. Significant keyword matching (e.g., AD4B, AD5B, Seeker, Torpedo, Voyager, P8-SC, C54, FS-9)
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

    // Map of unique raw blueprint names to avoid duplicate occurrences across log lines
    const rawBlueprintsMap = new Map<string, { rawName: string; timestamp?: string; sourceFile: string }>();

    // Regex patterns for Blueprints
    // Examples in Star Citizen Game.log:
    // <2026-09-02T14:32:10.123Z> [Notice] Received Blueprint: Behring AD4B Ballistic Gatling: ...
    // <2026-09-02T14:32:10.123Z> Received Blueprint: Torpedo Size 9 Seeker:
    // [Blueprint] Unlocked item: Pyro RRS Core
    // Crafting recipe learned: Gemini C54 SMG
    const blueprintPatterns = [
      /(?:<([^>]+)>)?\s*(?:\[[^\]]*\])?\s*Received Blueprint:\s*([^:\r\n]+)/i,
      /(?:<([^>]+)>)?\s*\[Blueprint\]\s*(?:Unlocked|Received|Learned|Added)\s*(?:item|recipe)?:\s*([^:\r\n]+)/i,
      /(?:<([^>]+)>)?\s*Crafting recipe (?:learned|unlocked|added):\s*([^:\r\n]+)/i,
      /(?:<([^>]+)>)?\s*Blueprint\s+([A-Za-z0-9_\- ]+)\s+(?:unlocked|added to inventory|received)/i
    ];

    // Regex patterns for Player / Session
    const handleRegexes = [
      /Player Handle:\s*([^\s\r\n,]+)/i,
      /AccountLogin:\s*([^\s\r\n,]+)/i,
      /LocalPlayer:\s*([^\s\r\n,]+)/i,
      /DisplayName:\s*([^\s\r\n,]+)/i
    ];

    const accountIdRegex = /AccountId:\s*([^\s\r\n,]+)|GEID:\s*(\d+)/i;
    const versionRegex = /Star Citizen\s+([0-9a-zA-Z._-]+(?:\s+LIVE)?)/i;
    const timestampRegex = /<([0-9]{4}-[0-9]{2}-[0-9]{2})T/;

    for (const file of files) {
      const lines = file.content.split(/\r?\n/);
      totalLines += lines.length;

      for (const line of lines) {
        if (!line || line.trim().length === 0) continue;

        // Session date extraction
        const dateMatch = line.match(timestampRegex);
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

        // Blueprint unlock extraction
        for (const pattern of blueprintPatterns) {
          const match = line.match(pattern);
          if (match) {
            const timestamp = match[1] ? match[1].trim() : undefined;
            const rawName = (match[2] || match[1]).replace(/[:[\]]/g, '').trim();

            if (rawName && rawName.length >= 2 && !rawName.toLowerCase().startsWith('error')) {
              const key = this.normalizeString(rawName);
              if (!rawBlueprintsMap.has(key)) {
                rawBlueprintsMap.set(key, {
                  rawName,
                  timestamp,
                  sourceFile: file.name
                });
              }
            }
            break;
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

    rawBlueprintsMap.forEach(({ rawName, timestamp, sourceFile }) => {
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
        sourceFile
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
      matchedCount,
      newMatchesCount,
      alreadyUnlockedCount,
      unmatchedCustomCount
    };
  }
}
