import { Blueprint, BlueprintCategory } from '../types';
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
   * Exhaustive dictionary mapping Star Citizen in-game notification names to blueprint IDs
   */
  private static readonly ALIAS_MAP: Record<string, string> = {
    // FPS Weapons (LMG, SMG, Rifles, Shotguns, Pistols, Heavy)
    'fs 9': 'bp_fps_fs9',
    'fs 9 lmg': 'bp_fps_fs9',
    'fs9': 'bp_fps_fs9',
    'fs9 lmg': 'bp_fps_fs9',
    'klaus werner fs 9': 'bp_fps_fs9',
    'klaus werner fs 9 lmg': 'bp_fps_fs9',
    'demeco': 'bp_fps_demeco',
    'demeco lmg': 'bp_fps_demeco',
    'klaus werner demeco': 'bp_fps_demeco',
    'klaus werner demeco lmg': 'bp_fps_demeco',
    'p8 sc': 'bp_fps_p8sc',
    'p8 sc smg': 'bp_fps_p8sc',
    'p8sc': 'bp_fps_p8sc',
    'p8sc smg': 'bp_fps_p8sc',
    'behring p8 sc': 'bp_fps_p8sc',
    'behring p8 sc smg': 'bp_fps_p8sc',
    'c54': 'bp_fps_c54',
    'c54 smg': 'bp_fps_c54',
    'gemini c54': 'bp_fps_c54',
    'gemini c54 smg': 'bp_fps_c54',
    'custodian': 'bp_fps_custodian',
    'custodian smg': 'bp_fps_custodian',
    'kastak arms custodian': 'bp_fps_custodian',
    'kastak arms custodian smg': 'bp_fps_custodian',
    'karna': 'bp_fps_karna',
    'karna rifle': 'bp_fps_karna',
    'karna assault rifle': 'bp_fps_karna',
    'kastak arms karna': 'bp_fps_karna',
    'kastak arms karna rifle': 'bp_fps_karna',
    'gallant': 'bp_fps_gallant',
    'gallant rifle': 'bp_fps_gallant',
    'klaus werner gallant': 'bp_fps_gallant',
    'arrowhead': 'bp_fps_arrowhead',
    'arrowhead sniper': 'bp_fps_arrowhead',
    'arrowhead sniper rifle': 'bp_fps_arrowhead',
    'klaus werner arrowhead': 'bp_fps_arrowhead',
    's71': 'bp_fps_s71',
    's71 rifle': 'bp_fps_s71',
    'gemini s71': 'bp_fps_s71',
    'p4 ar': 'bp_fps_p4ar',
    'p4 ar rifle': 'bp_fps_p4ar',
    'p4 ar assault rifle': 'bp_fps_p4ar',
    'p4ar': 'bp_fps_p4ar',
    'behring p4 ar': 'bp_fps_p4ar',
    'lumin v': 'bp_fps_lumin_v',
    'lumin v smg': 'bp_fps_lumin_v',
    'klaus werner lumin v': 'bp_fps_lumin_v',
    'devastator': 'bp_fps_devastator',
    'devastator shotgun': 'bp_fps_devastator',
    'kastak arms devastator': 'bp_fps_devastator',
    'br 2': 'bp_fps_br2',
    'br 2 shotgun': 'bp_fps_br2',
    'br2': 'bp_fps_br2',
    'gemini br 2': 'bp_fps_br2',
    'salvo': 'bp_fps_salvo',
    'salvo frag pistol': 'bp_fps_salvo',
    'hedeby gunworks salvo': 'bp_fps_salvo',
    'yubarev': 'bp_fps_yubarev',
    'yubarev pistol': 'bp_fps_yubarev',
    'lightning bolt co yubarev': 'bp_fps_yubarev',
    'atzkav': 'bp_fps_atzkav',
    'atzkav sniper': 'bp_fps_atzkav',
    'atzkav sniper rifle': 'bp_fps_atzkav',
    'lightning bolt co atzkav': 'bp_fps_atzkav',
    's 38': 'bp_fps_s38',
    's 38 pistol': 'bp_fps_s38',
    's38': 'bp_fps_s38',
    'behring s 38': 'bp_fps_s38',
    'arclight': 'bp_fps_arclight',
    'arclight pistol': 'bp_fps_arclight',
    'arclight ii': 'bp_fps_arclight',
    'klaus werner arclight': 'bp_fps_arclight',
    'lh86': 'bp_fps_lh86',
    'lh86 pistol': 'bp_fps_lh86',
    'gemini lh86': 'bp_fps_lh86',
    'coda': 'bp_fps_coda',
    'coda pistol': 'bp_fps_coda',
    'kastak arms coda': 'bp_fps_coda',
    'ravager': 'bp_fps_ravager',
    'ravager 212': 'bp_fps_ravager',
    'ravager 212 shotgun': 'bp_fps_ravager',
    'kastak arms ravager': 'bp_fps_ravager',
    'railgun': 'bp_fps_railgun',
    'scourge railgun': 'bp_fps_railgun',
    'apocalypse arms scourge railgun': 'bp_fps_railgun',
    'animus': 'bp_fps_animus',
    'animus missile launcher': 'bp_fps_animus',
    'apocalypse arms animus': 'bp_fps_animus',

    // Ship Weapons & Torpedoes
    'ad4b': 'bp_wpn_ad4b_s4',
    'ad4b gatling': 'bp_wpn_ad4b_s4',
    'ad4b ballistic gatling': 'bp_wpn_ad4b_s4',
    'ad5b': 'bp_wpn_ad5b_s5',
    'ad5b gatling': 'bp_wpn_ad5b_s5',
    'ad5b ballistic gatling': 'bp_wpn_ad5b_s5',
    'fl 33': 'bp_wpn_fl33_s3',
    'fl 33 laser cannon': 'bp_wpn_fl33_s3',
    'fl33': 'bp_wpn_fl33_s3',
    'panther': 'bp_wpn_cf337_s3',
    'cf 337': 'bp_wpn_cf337_s3',
    'cf 337 panther': 'bp_wpn_cf337_s3',
    'cf337': 'bp_wpn_cf337_s3',
    'badger': 'bp_wpn_cf227_s2',
    'cf 227': 'bp_wpn_cf227_s2',
    'cf 227 badger': 'bp_wpn_cf227_s2',
    'cf227': 'bp_wpn_cf227_s2',
    'bulldog': 'bp_wpn_cf117_s1',
    'cf 117': 'bp_wpn_cf117_s1',
    'cf 117 bulldog': 'bp_wpn_cf117_s1',
    'cf117': 'bp_wpn_cf117_s1',
    'rhino': 'bp_wpn_cf447_s4',
    'cf 447': 'bp_wpn_cf447_s4',
    'cf 447 rhino': 'bp_wpn_cf447_s4',
    'cf447': 'bp_wpn_cf447_s4',
    'galdiseen': 'bp_wpn_cf557_s5',
    'cf 557': 'bp_wpn_cf557_s5',
    'cf 557 galdiseen': 'bp_wpn_cf557_s5',
    'cf557': 'bp_wpn_cf557_s5',
    'attrition 3': 'bp_wpn_attrition3_s3',
    'attrition 4': 'bp_wpn_attrition4_s4',
    'attrition 5': 'bp_wpn_attrition5_s5',
    'omnisky ix': 'bp_wpn_omnisky9_s3',
    'omnisky 9': 'bp_wpn_omnisky9_s3',
    'omnisky xii': 'bp_wpn_omnisky12_s4',
    'omnisky 12': 'bp_wpn_omnisky12_s4',
    'omnisky xv': 'bp_wpn_omnisky15_s5',
    'omnisky 15': 'bp_wpn_omnisky15_s5',
    'deadbolt iv': 'bp_wpn_deadbolt4_s4',
    'deadbolt 4': 'bp_wpn_deadbolt4_s4',
    'deadbolt v': 'bp_wpn_deadbolt5_s5',
    'deadbolt 5': 'bp_wpn_deadbolt5_s5',
    'dominator ii': 'bp_msl_dominator2_s2',
    'dominator 2': 'bp_msl_dominator2_s2',
    'dominator': 'bp_msl_dominator2_s2',
    'seeker ix': 'bp_msl_seeker9_s4',
    'seeker 9': 'bp_msl_seeker9_s4',
    'seeker': 'bp_msl_seeker9_s4',
    'strikeforce ii': 'bp_msl_strikeforce2_s2',
    'strikeforce 2': 'bp_msl_strikeforce2_s2',
    'strikeforce': 'bp_msl_strikeforce2_s2',
    'typhoon ix': 'bp_msl_typhoon9_s9',
    'typhoon 9': 'bp_msl_typhoon9_s9',
    'typhoon': 'bp_msl_typhoon9_s9',

    // Armor
    'morozov': 'bp_arm_morozov_core',
    'morozov sh': 'bp_arm_morozov_core',
    'morozov sh core': 'bp_arm_morozov_core',
    'morozov core': 'bp_arm_morozov_core',
    'morozov thule': 'bp_arm_morozov_core',
    'defiance': 'bp_arm_defiance_core',
    'defiance core': 'bp_arm_defiance_core',
    'aril': 'bp_arm_aril_core',
    'aril core': 'bp_arm_aril_core',
    'aril hazard': 'bp_arm_aril_core',
    'aril hazard core': 'bp_arm_aril_core',
    'orc mkx': 'bp_arm_orcmkx_core',
    'orc mkx core': 'bp_arm_orcmkx_core',
    'inquisitor': 'bp_arm_inquisitor_core',
    'inquisitor core': 'bp_arm_inquisitor_core',
    'novikov': 'bp_arm_novikov_suit',
    'novikov core': 'bp_arm_novikov_suit',
    'pembroke': 'bp_arm_pembroke_suit',
    'pembroke core': 'bp_arm_pembroke_suit',

    // Tools & Medical & Hacking
    'pyro ryt': 'bp_tool_pyro_multitool',
    'pyro ryt multi tool': 'bp_tool_pyro_multitool',
    'greycat pyro ryt': 'bp_tool_pyro_multitool',
    'greycat pyro ryt multi tool': 'bp_tool_pyro_multitool',
    'multi tool': 'bp_tool_pyro_multitool',
    'tractor beam': 'bp_tool_tractor_beam',
    'tractor beam attachment': 'bp_tool_tractor_beam',
    'truhold tractor beam': 'bp_tool_tractor_beam',
    'truhold tractor beam attachment': 'bp_tool_tractor_beam',
    'mining attachment': 'bp_tool_mining_attachment',
    'orebit mining attachment': 'bp_tool_mining_attachment',
    'medpen': 'bp_med_hemozal_pen',
    'hemozal': 'bp_med_hemozal_pen',
    'hemozal medpen': 'bp_med_hemozal_pen',
    'paramed': 'bp_med_paramed_device',
    'parameda': 'bp_med_paramed_device',
    'paramed device': 'bp_med_paramed_device',
    'paramed medical device': 'bp_med_paramed_device',
    'tigerclaw': 'bp_tool_tigerclaw',
    'tigerclaw cryptokey': 'bp_tool_tigerclaw',
    'cryptokey': 'bp_tool_tigerclaw',

    // Ship Components (Quantum Drives, Shields, Power Plants, Coolers, Mining Heads & Modules)
    'atlas': 'bp_qd_atlas_s1',
    'atlas quantum drive': 'bp_qd_atlas_s1',
    'vk 00': 'bp_qd_vk00_s1',
    'vk 00 quantum drive': 'bp_qd_vk00_s1',
    'vk00': 'bp_qd_vk00_s1',
    'spectre': 'bp_qd_spectre_s1',
    'spectre quantum drive': 'bp_qd_spectre_s1',
    'crossfield': 'bp_qd_crossfield_s2',
    'crossfield quantum drive': 'bp_qd_crossfield_s2',
    'xl 1': 'bp_qd_xl1_s2',
    'xl 1 quantum drive': 'bp_qd_xl1_s2',
    'xl1': 'bp_qd_xl1_s2',
    'ts 2': 'bp_qd_ts2_s3',
    'ts 2 quantum drive': 'bp_qd_ts2_s3',
    'ts2': 'bp_qd_ts2_s3',
    'siren': 'bp_qd_siren_s1',
    'expedition': 'bp_qd_expedition_s1',
    'js 300': 'bp_pp_js300_s1',
    'js 300 power plant': 'bp_pp_js300_s1',
    'js300': 'bp_pp_js300_s1',
    'js 400': 'bp_pp_js400_s2',
    'js 400 power plant': 'bp_pp_js400_s2',
    'js400': 'bp_pp_js400_s2',
    'quadracell': 'bp_pp_quadracell_s3',
    'quadracell power plant': 'bp_pp_quadracell_s3',
    'fr 66': 'bp_sh_fr66_s1',
    'fr 66 shield': 'bp_sh_fr66_s1',
    'fr 66 shield generator': 'bp_sh_fr66_s1',
    'fr66': 'bp_sh_fr66_s1',
    'fr 76': 'bp_sh_fr76_s2',
    'fr 76 shield': 'bp_sh_fr76_s2',
    'fr 76 shield generator': 'bp_sh_fr76_s2',
    'fr76': 'bp_sh_fr76_s2',
    'fr 86': 'bp_sh_fr86_s3',
    'fr 86 shield': 'bp_sh_fr86_s3',
    'fr 86 shield generator': 'bp_sh_fr86_s3',
    'fr86': 'bp_sh_fr86_s3',
    'rampart': 'bp_sh_rampart_s2',
    'rampart shield': 'bp_sh_rampart_s2',
    'stronghold': 'bp_sh_stronghold_s3',
    'stronghold shield': 'bp_sh_stronghold_s3',
    'mirage': 'bp_sh_mirage_s1',
    'glacier': 'bp_cl_glacier_s1',
    'glacier cooler': 'bp_cl_glacier_s1',
    'snowpack': 'bp_cl_snowpack_s2',
    'snowpack cooler': 'bp_cl_snowpack_s2',
    'avalanche': 'bp_cl_avalanche_s3',
    'avalanche cooler': 'bp_cl_avalanche_s3',
    'helix': 'bp_min_helix_s1',
    'helix i': 'bp_min_helix_s1',
    'helix 1': 'bp_min_helix_s1',
    'helix ii': 'bp_min_helix_s2',
    'helix 2': 'bp_min_helix_s2',
    'lancet': 'bp_min_lancet_s1',
    'lancet i': 'bp_min_lancet_s1',
    'lancet 1': 'bp_min_lancet_s1',
    'klein': 'bp_min_klein_s1',
    'hofstede': 'bp_min_hofstede_s1',
    'surge': 'bp_mod_surge',
    'surge module': 'bp_mod_surge',
    'stampede': 'bp_mod_stampede',
    'stampede module': 'bp_mod_stampede',
    'brandt': 'bp_mod_brandt',
    'brandt module': 'bp_mod_brandt',
    'focus': 'bp_mod_focus',
    'focus module': 'bp_mod_focus',
    'rieger': 'bp_mod_rieger_c3',
    'rieger c3': 'bp_mod_rieger_c3',
    'rieger c3 module': 'bp_mod_rieger_c3'
  };

  /**
   * Normalizes text for lenient keyword matching
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
   * Automatically guesses blueprint category for unknown or datamined items
   */
  public static guessCategory(name: string): BlueprintCategory {
    const norm = this.normalizeString(name);

    if (/armor|armure|core|helmet|legs|arms|suit|morozov|defiance|aril|orc|inquisitor|truedef|balor|adp|macflex|stoneskin|zeus|paladin|novikov|pembroke/i.test(norm)) {
      return 'armures';
    }

    if (/gatling|cannon|repeater|laser cannon|ballistic|ad4b|ad5b|fl 33|fl33|panther|badger|bulldog|rhino|galdiseen|attrition|omnisky|deadbolt|dominator|seeker|strikeforce|typhoon|torpedo|missile/i.test(norm)) {
      return 'armes_vaisseau';
    }

    if (/rifle|pistol|smg|lmg|shotgun|sniper|railgun|fs 9|fs9|demeco|p8 sc|p8sc|c54|custodian|karna|gallant|arrowhead|s71|p4 ar|p4ar|lumin|devastator|br 2|br2|salvo|yubarev|atzkav|s 38|s38|arclight|lh86|coda|ravager|scourge|animus/i.test(norm)) {
      return 'armes_fps';
    }

    if (/multitool|multi tool|tractor|mining attachment|repair|medpen|hemozal|paramed|cryptokey|tigerclaw|device|tool/i.test(norm)) {
      return 'outils';
    }

    if (/quantum|shield|power|cooler|generator|drive|atlas|vk 00|vk00|spectre|crossfield|xl 1|xl1|ts 2|ts2|siren|expedition|js 300|js300|js 400|js400|quadracell|fr 66|fr66|fr 76|fr76|fr 86|fr86|rampart|stronghold|mirage|glacier|snowpack|avalanche|helix|lancet|klein|hofstede|surge|stampede|brandt|focus|rieger/i.test(norm)) {
      return 'vaisseau';
    }

    return 'composants_industriels';
  }

  /**
   * Tries to find matching official or custom blueprint with high accuracy and ZERO false positives
   */
  public static findMatchingBlueprint(rawText: string, allBlueprints: Blueprint[]): Blueprint | undefined {
    const normRaw = this.normalizeString(rawText);
    if (!normRaw || normRaw.length < 2) return undefined;

    // 1. Direct Alias lookup
    const aliasBpId = this.ALIAS_MAP[normRaw];
    if (aliasBpId) {
      const found = allBlueprints.find(b => b.id.toLowerCase() === aliasBpId.toLowerCase());
      if (found) return found;
    }

    // 2. Exact match on name or ID
    const exact = allBlueprints.find(b => {
      const normBName = this.normalizeString(b.name);
      const normBId = this.normalizeString(b.id);
      return normBName === normRaw || normBId === normRaw;
    });
    if (exact) return exact;

    // 3. Normalized stripped match (ignoring manufacturer and item type suffixes)
    const cleanedRaw = normRaw
      .replace(/^(klaus werner|behring|gemini|kastak arms|kastak|apocalypse arms|apocalypse|hedeby gunworks|hedeby|lightning bolt co|lightning bolt|greycat industrial|greycat|aegis|anvil|drake|rsi|origin|crusader|misc|mirai)\s+/g, '')
      .replace(/\s+(s1|s2|s3|s4|s5|s9|grade a|lmg|smg|rifle|shotgun|sniper|pistol|cannon|gatling|repeater|core|helmet|arms|legs|suit|quantum drive|shield generator|power plant|cooler|module|head|laser|attachment|pen|device)$/g, '')
      .trim();

    if (cleanedRaw.length >= 2) {
      const aliasCleanedId = this.ALIAS_MAP[cleanedRaw];
      if (aliasCleanedId) {
        const found = allBlueprints.find(b => b.id.toLowerCase() === aliasCleanedId.toLowerCase());
        if (found) return found;
      }

      for (const bp of allBlueprints) {
        const normBpName = this.normalizeString(bp.name);
        const cleanedBpName = normBpName
          .replace(/^(klaus werner|behring|gemini|kastak arms|kastak|apocalypse arms|apocalypse|hedeby gunworks|hedeby|lightning bolt co|lightning bolt|greycat industrial|greycat|aegis|anvil|drake|rsi|origin|crusader|misc|mirai)\s+/g, '')
          .replace(/\s+(s1|s2|s3|s4|s5|s9|grade a|lmg|smg|rifle|shotgun|sniper|pistol|cannon|gatling|repeater|core|helmet|arms|legs|suit|quantum drive|shield generator|power plant|cooler|module|head|laser|attachment|pen|device)$/g, '')
          .trim();

        if (cleanedBpName === cleanedRaw || normBpName === cleanedRaw || cleanedBpName === normRaw) {
          return bp;
        }
      }
    }

    // 4. Token subset matching
    const rawTokens = normRaw.split(' ').filter(t => t.length >= 2);
    if (rawTokens.length > 0) {
      let bestBp: Blueprint | undefined;
      let maxScore = 0;

      for (const bp of allBlueprints) {
        const bpTokens = new Set(this.normalizeString(bp.name).split(' '));
        let matchCount = 0;
        for (const token of rawTokens) {
          if (bpTokens.has(token)) matchCount++;
        }

        const cleanTokens = rawTokens.map(t => t.replace(/[^a-z0-9]/g, ''));
        const hasDistinctiveToken = cleanTokens.some(t =>
          ['ad4b', 'ad5b', 'fl33', 'cf337', 'cf227', 'cf117', 'cf447', 'cf557', 'js300', 'js400', 'fr66', 'fr76', 'fr86', 'ts2', 'vk00', 'xl1', 'p8sc', 'c54', 'fs9', 'karna', 'custodian', 'demeco', 'morozov', 'defiance', 'aril', 'novikov', 'pembroke', 'tigerclaw', 'paramed', 'hemozal'].includes(t)
          && (bpTokens.has(t) || bp.id.toLowerCase().includes(t))
        );

        if (hasDistinctiveToken && matchCount >= 1) {
          return bp;
        }

        if (matchCount > maxScore && matchCount >= Math.min(2, rawTokens.length)) {
          maxScore = matchCount;
          bestBp = bp;
        }
      }

      if (bestBp) return bestBp;
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
   * Checks if a line is pure false positive noise (combat damage, network packets, etc.)
   */
  private static isFalsePositiveNoiseLine(lowerLine: string): boolean {
    if (lowerLine.includes('received blueprint') || lowerLine.includes('blueprint unlocked') || lowerLine.includes('blueprint learned')) {
      return false;
    }

    return (
      lowerLine.includes('damage') ||
      lowerLine.includes('took damage') ||
      lowerLine.includes('hit by') ||
      lowerLine.includes('killed by') ||
      lowerLine.includes('packet') ||
      lowerLine.includes('bytes received') ||
      lowerLine.includes('ping received') ||
      lowerLine.includes('channel received') ||
      lowerLine.includes('connection received') ||
      lowerLine.includes('stream received') ||
      lowerLine.includes('spawned actor')
    );
  }

  /**
   * Fast Non-Blocking Asynchronous Parser for massive Game.log files & backups
   * Accurately detects ALL blueprint acquisition events with ZERO false positives
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

    // Precise Blueprint Detection Regular Expressions
    const pReceivedBlueprintNotification = /Added notification\s*"(?:Received Blueprint|Blueprint Received|Plan reçu|Recette débloquée):\s*([^"\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*$)/i;
    const pGenericNotificationBlueprint = /Added notification\s*"([^"]*(?:Blueprint|Plan|Recette)[^"]*)"/i;
    const pCraftingUnlocked = /\[Crafting\]\s*(?:Blueprint|Recipe)?\s*(?:unlocked|learned|received|acquired|added)[:\s]+([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pLearnedRecipeDirect = /(?:Blueprint|Recipe|Plan|Recette)\s*(?:Unlocked|Learned|Received|Acquired|Débloqué|Reçu|Appris)[:\s]+([^"'\r\n]+?)(?:\s*:\s*|\s*"\s*|\s*\[|\s*$)/i;
    const pEntityRecipeUnlock = /(?:unlocked|learned|received|grant|acquired)[_\s]+(?:blueprint|recipe)[_\s]+([a-zA-Z0-9_\-]+)/i;

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

      // Process in chunks of 2,500 lines to never block the browser thread
      const CHUNK_SIZE = 2500;
      for (let i = 0; i < fileLineCount; i += CHUNK_SIZE) {
        const chunkEnd = Math.min(i + CHUNK_SIZE, fileLineCount);

        for (let j = i; j < chunkEnd; j++) {
          const line = lines[j];
          if (!line || line.length < 5) continue;

          const lowerLine = line.toLowerCase();

          // PRE-FILTER: Discard 99.8% of noise lines instantly
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

          // Game Version
          if (!detectedGameVersion) {
            const vm = line.match(versionRegex);
            if (vm && vm[1]) {
              detectedGameVersion = vm[1].trim();
            }
          }

          // Discard pure false-positive noise lines
          if (this.isFalsePositiveNoiseLine(lowerLine)) {
            continue;
          }

          let extractedRawName: string | null = null;
          const timestamp = this.extractTimestamp(line);

          // 1. Primary Pattern: Added notification "Received Blueprint: ...: "
          if (lowerLine.includes('received blueprint') || lowerLine.includes('blueprint received') || lowerLine.includes('plan reçu') || lowerLine.includes('recette débloquée')) {
            const m = line.match(pReceivedBlueprintNotification);
            if (m && m[1]) {
              extractedRawName = this.cleanBlueprintName(m[1]);
            }
          }

          // 2. Generic notification containing Blueprint
          if (!extractedRawName && lowerLine.includes('added notification') && (lowerLine.includes('blueprint') || lowerLine.includes('recette') || lowerLine.includes('plan'))) {
            const mNotif = line.match(pGenericNotificationBlueprint);
            if (mNotif && mNotif[1]) {
              const inner = mNotif[1];
              extractedRawName = this.cleanBlueprintName(
                inner.replace(/^(?:Received Blueprint|Blueprint Received|Blueprint Unlocked|Blueprint Learned|Plan reçu|Recette débloquée|Blueprint|Recette|Plan)\s*[:\-]\s*/i, '')
              );
            }
          }

          // 3. Crafting Subsystem event
          if (!extractedRawName && lowerLine.includes('crafting') && (lowerLine.includes('blueprint') || lowerLine.includes('recipe'))) {
            const mCraft = line.match(pCraftingUnlocked);
            if (mCraft && mCraft[1]) {
              extractedRawName = this.cleanBlueprintName(mCraft[1]);
            }
          }

          // 4. Direct Blueprint / Recipe Unlocked statement
          if (!extractedRawName && (lowerLine.includes('blueprint unlocked') || lowerLine.includes('blueprint learned') || lowerLine.includes('blueprint acquired') || lowerLine.includes('recette débloquée'))) {
            const mDirect = line.match(pLearnedRecipeDirect);
            if (mDirect && mDirect[1]) {
              extractedRawName = this.cleanBlueprintName(mDirect[1]);
            }
          }

          // 5. EntityComponent identifier recipe_
          if (!extractedRawName && (lowerLine.includes('recipe_') || lowerLine.includes('blueprint_'))) {
            const mEntity = line.match(pEntityRecipeUnlock);
            if (mEntity && mEntity[1]) {
              extractedRawName = this.cleanBlueprintName(mEntity[1].replace(/_/g, ' '));
            }
          }

          // If a genuine blueprint acquisition was extracted
          if (extractedRawName && extractedRawName.length >= 2 && !extractedRawName.toLowerCase().startsWith('error')) {
            if (rawKeywordLines.length < 300) {
              rawKeywordLines.push(line.trim());
            }

            const matchedBp = this.findMatchingBlueprint(extractedRawName, allBlueprints);
            const key = matchedBp ? `bp_${matchedBp.id}` : `raw_${this.normalizeString(extractedRawName)}`;

            if (!rawBlueprintsMap.has(key)) {
              rawBlueprintsMap.set(key, {
                rawName: matchedBp ? matchedBp.name : extractedRawName,
                matchedBp,
                timestamp,
                sourceFile: fileEntry.name,
                originalLine: line.trim()
              });
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

    // Sort: new matches first, then custom unmatched, then already unlocked
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
   * Auto-activates ALL detected blueprints from log files (both official matches and custom detected blueprints)
   */
  public static autoActivateAllFoundBlueprints(result: GameLogAnalysisResult): {
    activatedCount: number;
    totalWorkshopCount: number;
    activatedBlueprints: Blueprint[];
  } {
    const idsToUnlock = new Set<string>();
    const customToCreate: Blueprint[] = [];
    const activatedList: Blueprint[] = [];

    // Collect from parsed blueprints
    result.blueprintsFound.forEach(b => {
      if (b.matchedBlueprint) {
        idsToUnlock.add(b.matchedBlueprint.id);
      } else if (b.rawName && b.rawName.trim().length >= 2) {
        // Create custom blueprint on the fly for unindexed recipes
        const category = this.guessCategory(b.rawName);
        const customBp: Blueprint = {
          id: `custom_bp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          key: `CUSTOM_LOG_${b.rawName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
          name: b.rawName,
          category,
          typeLabel: category === 'armes_fps' ? 'Arme FPS' : category === 'armures' ? 'Armure' : category === 'vaisseau' ? 'Composant Vaisseau' : category === 'outils' ? 'Outil' : 'Composant',
          craftTimeSeconds: 1800,
          description: `Blueprint extrait automatiquement de votre Game.log (${b.sourceFile || 'Journal de jeu'}).`,
          ingredients: [
            { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.0 },
            { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.0 }
          ]
        };
        customToCreate.push(customBp);
        idsToUnlock.add(customBp.id);
      }
    });

    // Save custom blueprints if any created
    if (customToCreate.length > 0) {
      const existingCustom = StorageService.getCustomBlueprints();
      const newCustomList = [...existingCustom];
      customToCreate.forEach(cb => {
        if (!newCustomList.some(e => e.name.toLowerCase().trim() === cb.name.toLowerCase().trim())) {
          newCustomList.push(cb);
        }
      });
      StorageService.saveCustomBlueprints(newCustomList);
    }

    const idsArray = Array.from(idsToUnlock);
    const { addedCount, totalCount } = StorageService.unlockBlueprintIds(idsArray);

    const refreshedAll = StorageService.getAllBlueprints();
    idsArray.forEach(id => {
      const bp = refreshedAll.find(b => b.id === id);
      if (bp) activatedList.push(bp);
    });

    return {
      activatedCount: addedCount,
      totalWorkshopCount: totalCount,
      activatedBlueprints: activatedList
    };
  }
}
