import { RefinedStockItem } from '../types';
import { STAR_CITIZEN_MINERALS } from '../data/mineralsData';

export const GEM_MINERAL_NAMES = new Set([
  'aphorite',
  'hadanite',
  'dolivine',
  'janalite',
  'beradom',
  'feynmaline',
  'glacosite',
  'carinite',
  'sadaryx',
  'jaclium',
  'jaclium_ore',
  'jaclium (ore)',
  'saldynium',
  'saldynium_ore',
  'saldynium (ore)',
  'mevium',
  'prota',
  'kavinite',
  'kallinite',
  'atropine'
]);

/**
 * Checks if a mineral is a Gem / FPS mineable resource.
 */
export function isGemMineral(
  mineralIdOrName?: string,
  notes?: string,
  group?: string,
  isFpsMineable?: boolean
): boolean {
  if (group === 'Gem' || isFpsMineable === true) return true;
  if (notes) {
    const lowerNotes = notes.toLowerCase();
    if (
      lowerNotes.includes('gemme') ||
      lowerNotes.includes('gem') ||
      lowerNotes.includes('minable geo') ||
      lowerNotes.includes('minage géo') ||
      lowerNotes.includes('minage geo') ||
      lowerNotes.includes('géo') ||
      lowerNotes.includes('fps')
    ) {
      return true;
    }
  }

  if (!mineralIdOrName) return false;
  const clean = mineralIdOrName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  if (GEM_MINERAL_NAMES.has(clean) || GEM_MINERAL_NAMES.has(mineralIdOrName.toLowerCase().trim())) return true;

  const minInfo = STAR_CITIZEN_MINERALS.find(
    m => m.id.toLowerCase() === clean || m.name.toLowerCase() === mineralIdOrName.toLowerCase().trim()
  );
  if (minInfo && (minInfo.group === 'Gem' || minInfo.isFpsMineable)) {
    return true;
  }

  return false;
}

/**
 * Extracts quality number (0-1000) from stock item notes or quality property.
 */
export function extractQuality(item: RefinedStockItem | { quality?: number; notes?: string }): number | undefined {
  if ('quality' in item && item.quality !== undefined && item.quality !== null && !isNaN(Number(item.quality))) {
    return Number(item.quality);
  }
  if (item.notes) {
    const match = item.notes.match(/Qualit[eé]:?\s*(\d+(?:[.,]\d+)?)/i);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  return undefined;
}

/**
 * Determines if a stock item meets the Star Citizen crafting quality requirement (Quality >= 500).
 */
export function isCraftEligibleQuality(quality: number | undefined): boolean {
  if (quality === undefined) return true; // unrated items default to eligible
  return quality >= 500;
}

/**
 * Checks if a refined stock item is personal and has quality >= 500 for crafting.
 */
export function isStockItemCraftEligible(item: RefinedStockItem): boolean {
  if (item.ownerType !== 'personal') return false;
  const qual = extractQuality(item);
  return isCraftEligibleQuality(qual);
}

/**
 * Normalizes a stock item's quantitySCU.
 * If the item is a Gem (Aphorite, Hadanite, Dolivine, etc.) and quantitySCU is an integer >= 1 (e.g. 85, 99, 50),
 * it converts it from cSCU count to true SCU (85 cSCU = 0.85 SCU).
 */
export function normalizeStockItem(item: RefinedStockItem): RefinedStockItem {
  const isGem = isGemMineral(item.mineralId || item.mineralName, item.notes);
  if (isGem && item.quantitySCU >= 1) {
    return {
      ...item,
      quantitySCU: Number((item.quantitySCU / 100).toFixed(4))
    };
  }
  return item;
}

/**
 * Normalizes an entire stock list to ensure gem counts are correctly in SCU.
 */
export function normalizeStockList(stock: RefinedStockItem[]): RefinedStockItem[] {
  return (stock || []).map(normalizeStockItem);
}

/**
 * Formats a mineral quantity appropriately depending on whether it is a Gem (cSCU / units) or Ship Mineral (SCU).
 */
export function formatMineralQuantity(
  qtySCU: number,
  isGem: boolean
): { primary: string; secondary: string; rawCscu: number; rawScu: number } {
  const rawCscu = Math.round(qtySCU * 100);
  const rawScu = Number(qtySCU.toFixed(3));

  if (isGem) {
    return {
      primary: `${rawCscu.toLocaleString('fr-FR')} cSCU`,
      secondary: `${rawScu.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} SCU`,
      rawCscu,
      rawScu
    };
  } else {
    return {
      primary: `${rawScu.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} SCU`,
      secondary: `${rawCscu.toLocaleString('fr-FR')} cSCU`,
      rawCscu,
      rawScu
    };
  }
}
