import * as XLSX from 'xlsx';

export interface ExtractedStockItem {
  name: string;
  quantity: number;
  unit: string;
  qualityTier: string;
  purityPercent?: number;
  extractionType: string;
  recommendedShip: string;
  notes?: string;
  unitValueUEC?: number;
}

/**
 * Deduce default extraction type / ship if missing in Excel.
 */
export function deduceExtractionInfo(materialName: string, rawType?: string): {
  extractionType: string;
  recommendedShip: string;
} {
  const customType = (rawType || '').trim();
  const name = (materialName || '').toLowerCase().trim();

  // If user has exact type in file (e.g. "Minable Vaisseau", "Minable Géo", "Salvage"...)
  if (customType) {
    let ship = 'MISC Prospector / ARGO MOLE';
    const lowerType = customType.toLowerCase();
    if (lowerType.includes('géo') || lowerType.includes('geo') || lowerType.includes('roc') || lowerType.includes('terrestre')) {
      ship = 'Greycat ROC / ROC-DS';
    } else if (lowerType.includes('vaisseau') || lowerType.includes('spatial')) {
      ship = 'MISC Prospector / ARGO MOLE';
    } else if (lowerType.includes('fps') || lowerType.includes('manuel') || lowerType.includes('grotte')) {
      ship = 'Multi-Tool Pyro RRS Mining';
    } else if (lowerType.includes('salvage') || lowerType.includes('coque') || lowerType.includes('scraping')) {
      ship = 'Drake Vulture / Aegis Reclaimer';
    } else if (lowerType.includes('structurel') || lowerType.includes('cm')) {
      ship = 'Aegis Reclaimer';
    }
    return {
      extractionType: customType,
      recommendedShip: ship
    };
  }

  // Deduce based on material name
  if (name.includes('rmc') || name.includes('recycled') || name.includes('recyclé') || name.includes('scraping')) {
    return {
      extractionType: 'Salvage Coque (RMC)',
      recommendedShip: 'Drake Vulture / Aegis Reclaimer'
    };
  }

  if (name.includes('construction') || name.includes('cm') || name.includes('structurel') || name.includes('fractur')) {
    return {
      extractionType: 'Salvage Structurel (CM)',
      recommendedShip: 'Aegis Reclaimer'
    };
  }

  if (name.includes('hadanite') || name.includes('aphorite') || name.includes('dolivine')) {
    return {
      extractionType: 'Minable Géo (Véhicule / Sol)',
      recommendedShip: 'Greycat ROC / ROC-DS'
    };
  }

  if (name.includes('janalite')) {
    return {
      extractionType: 'Minable FPS (Grottes)',
      recommendedShip: 'Multi-Tool Pyro Mining Head'
    };
  }

  if (name.includes('hydrogen') || name.includes('hydrogène') || name.includes('quantum fuel') || name.includes('gaz')) {
    return {
      extractionType: 'Collecte Carburant',
      recommendedShip: 'MISC Starfarer'
    };
  }

  // Default space mining ores (Quantainium, Bexalite, Taranite, Laranite, Agricium, Gold, Titanium...)
  return {
    extractionType: 'Minable Vaisseau',
    recommendedShip: 'MISC Prospector / ARGO MOLE'
  };
}

/**
 * Parse an Excel (.xlsx / .xls) or CSV / Text file into structured Star Citizen inventory items.
 * Strictly respects the file's Quality, Purity and Type columns.
 */
export async function parseStockFile(file: File): Promise<ExtractedStockItem[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!jsonData || jsonData.length === 0) return [];

  // 1. Identify header row and column indexes
  let headerRowIndex = -1;
  let nameCol = -1;
  let qtyCol = -1;
  let unitCol = -1;
  let qualityCol = -1;
  let typeCol = -1;
  let shipCol = -1;
  let notesCol = -1;

  for (let r = 0; r < Math.min(jsonData.length, 10); r++) {
    const row = jsonData[r];
    if (!row || !Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').toLowerCase().trim();
      
      // Name
      if (cell.includes('nom') || cell.includes('matériau') || cell.includes('materiau') || cell.includes('minerai') || cell.includes('ressource') || cell.includes('material') || cell.includes('item')) {
        nameCol = c;
        headerRowIndex = r;
      } 
      // Quantity
      else if (cell.includes('quantit') || cell.includes('qte') || cell.includes('qty') || cell.includes('scu') || cell.includes('volume') || cell.includes('stock') || cell.includes('amount') || cell.includes('nombre')) {
        qtyCol = c;
      } 
      // Unit
      else if (cell.includes('unit') || cell.includes('mesure')) {
        unitCol = c;
      } 
      // Quality / Purity (Strict match)
      else if (cell.includes('qualit') || cell.includes('puret') || cell.includes('grade') || cell.includes('tier') || cell.includes('purity') || cell.includes('quality') || cell.includes('%')) {
        qualityCol = c;
      } 
      // Type / Method (Minable vaisseau, Minable géo...)
      else if (cell.includes('type') || cell.includes('mode') || cell.includes('catégorie') || cell.includes('categorie') || cell.includes('extraction') || cell.includes('moyen')) {
        typeCol = c;
      }
      // Ship / Tool
      else if (cell.includes('vaisseau') || cell.includes('ship') || cell.includes('vehicule') || cell.includes('outil') || cell.includes('extracteur')) {
        shipCol = c;
      }
      // Notes
      else if (cell.includes('note') || cell.includes('remarque') || cell.includes('desc') || cell.includes('info')) {
        notesCol = c;
      }
    }

    if (nameCol !== -1) break;
  }

  const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;
  if (nameCol === -1) nameCol = 0;
  if (qtyCol === -1) qtyCol = 1;

  const results: ExtractedStockItem[] = [];

  for (let r = startRow; r < jsonData.length; r++) {
    const row = jsonData[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    const rawName = String(row[nameCol] || '').trim();
    if (!rawName || rawName.length < 2) continue;

    // Parse Quantity
    let rawQtyStr = String(row[qtyCol] || '1').trim();
    let detectedUnit = 'SCU';
    if (unitCol !== -1 && row[unitCol]) {
      detectedUnit = String(row[unitCol]).trim();
    } else if (rawQtyStr.toLowerCase().includes('cscu')) {
      detectedUnit = 'cSCU';
    } else if (rawQtyStr.toLowerCase().includes('µscu')) {
      detectedUnit = 'µSCU';
    } else if (rawQtyStr.toLowerCase().includes('unit')) {
      detectedUnit = 'Unités';
    }

    const cleanedQty = rawQtyStr.replace(/[^\d.,]/g, '').replace(',', '.');
    const quantity = parseFloat(cleanedQty) || 1;

    // Strict Quality: take EXACT text/number from file
    let rawQuality = qualityCol !== -1 && row[qualityCol] !== undefined ? String(row[qualityCol]).trim() : '';
    if (!rawQuality) {
      rawQuality = 'Standard';
    }

    // Extract numeric purity % if present in quality
    let purityPercent: number | undefined = undefined;
    const matchPct = rawQuality.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (matchPct) {
      purityPercent = parseFloat(matchPct[1].replace(',', '.'));
    }

    // Strict Type & Ship extraction
    const rawType = typeCol !== -1 && row[typeCol] !== undefined ? String(row[typeCol]).trim() : '';
    const rawShip = shipCol !== -1 && row[shipCol] !== undefined ? String(row[shipCol]).trim() : '';

    const deduced = deduceExtractionInfo(rawName, rawType);
    const extractionType = rawType || deduced.extractionType;
    const recommendedShip = rawShip || deduced.recommendedShip;

    // Notes
    const notes = notesCol !== -1 && row[notesCol] ? String(row[notesCol]).trim() : '';

    results.push({
      name: rawName,
      quantity,
      unit: detectedUnit,
      qualityTier: rawQuality,
      purityPercent,
      extractionType,
      recommendedShip,
      notes
    });
  }

  // Sort alphabetically by Material Name by default
  results.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

  return results;
}
