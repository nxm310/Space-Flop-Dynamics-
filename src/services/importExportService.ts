import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RefinedStockItem, CustomerOrder, RawCargoItem, AppDataBackup } from '../types';
import { STAR_CITIZEN_MINERALS } from '../data/mineralsData';
import { StorageService } from './storageService';

export type QuantityImportUnit = 'micro_scu' | 'scu' | 'cscu' | 'auto';

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
  detectedUnit?: QuantityImportUnit;
}

export class ImportExportService {
  // =========================================================================
  // REFINED MINERALS EXPORT
  // =========================================================================

  static exportMineralsToCSV(items: RefinedStockItem[], filename = 'star_citizen_minerais.csv') {
    const data = items.map(item => {
      const mineralInfo = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
      const estPrice = Math.round(item.quantitySCU * 100 * (mineralInfo?.basePriceAUEC || 15));
      const microScu = Math.round(item.quantitySCU * 1_000_000);

      return {
        'Matériaux': item.mineralName,
        'Quantité (µSCU)': microScu,
        'Quantité (SCU)': item.quantitySCU,
        'Type_Proprietaire': item.ownerType === 'client' ? 'Client' : 'Personnel',
        'Nom_Client': item.clientName || '',
        'Groupe': mineralInfo?.group || 'Mineral',
        'Valeur_Estimee_aUEC': estPrice,
        'Derniere_Mise_A_Jour': item.lastUpdated,
        'Notes': item.notes || ''
      };
    });

    const csv = Papa.unparse(data);
    this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  static exportMineralsToExcel(items: RefinedStockItem[], filename = 'star_citizen_minerais.xlsx') {
    const data = items.map(item => {
      const mineralInfo = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
      const estPrice = Math.round(item.quantitySCU * 100 * (mineralInfo?.basePriceAUEC || 15));
      const microScu = Math.round(item.quantitySCU * 1_000_000);

      return {
        'ID': item.id,
        'Matériaux': item.mineralName,
        'Quantité (µSCU)': microScu,
        'Quantité (SCU)': item.quantitySCU,
        'Propriétaire': item.ownerType === 'client' ? 'Client' : 'Personnel',
        'Nom Client': item.clientName || '',
        'Groupe': mineralInfo?.group || 'Mineral',
        'Prix Unitaire aUEC/cSCU': mineralInfo?.basePriceAUEC || 15,
        'Valeur Estimée aUEC': estPrice,
        'Dernière MAJ': new Date(item.lastUpdated).toLocaleString('fr-FR'),
        'Notes': item.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Minerais');

    // Auto width for columns
    const maxCols = 11;
    const colWidths = Array(maxCols).fill({ wch: 18 });
    colWidths[1] = { wch: 22 }; // Minerai
    colWidths[2] = { wch: 20 }; // Quantité µSCU
    colWidths[3] = { wch: 16 }; // Quantité SCU
    colWidths[5] = { wch: 25 }; // Nom client
    colWidths[10] = { wch: 35 }; // Notes
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  }

  // =========================================================================
  // REFINED MINERALS IMPORT (SUPPORTS MICRO-SCU, SCU, CSCU & AUTO)
  // =========================================================================

  static async importMineralsFromFile(
    file: File,
    unit: QuantityImportUnit = 'auto'
  ): Promise<ImportResult<RefinedStockItem>> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return this.importMineralsFromCSV(file, unit);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return this.importMineralsFromExcel(file, unit);
    } else {
      return {
        success: false,
        data: [],
        errors: ['Format de fichier non pris en charge. Veuillez utiliser un fichier .csv ou .xlsx.'],
        totalRows: 0,
        detectedUnit: unit
      };
    }
  }

  private static importMineralsFromCSV(
    file: File,
    unit: QuantityImportUnit
  ): Promise<ImportResult<RefinedStockItem>> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, unknown>[];
          const parsed = this.parseMineralRows(rows, unit);
          resolve(parsed);
        },
        error: (err) => {
          resolve({
            success: false,
            data: [],
            errors: [`Erreur de lecture CSV : ${err.message}`],
            totalRows: 0,
            detectedUnit: unit
          });
        }
      });
    });
  }

  private static async importMineralsFromExcel(
    file: File,
    unit: QuantityImportUnit
  ): Promise<ImportResult<RefinedStockItem>> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      return this.parseMineralRows(rows, unit);
    } catch (e: unknown) {
      return {
        success: false,
        data: [],
        errors: [`Erreur lors de la lecture du fichier Excel : ${(e as Error).message}`],
        totalRows: 0,
        detectedUnit: unit
      };
    }
  }

  static parseMineralRows(
    rows: Record<string, unknown>[],
    unit: QuantityImportUnit = 'auto'
  ): ImportResult<RefinedStockItem> {
    const items: RefinedStockItem[] = [];
    const errors: string[] = [];
    let detectedEffectiveUnit: QuantityImportUnit = unit;

    rows.forEach((row, idx) => {
      // 1. Find mineral name column with flexible French / English headers
      const rawName = (
        row['Matériaux'] ||
        row['Materiaux'] ||
        row['Matériau'] ||
        row['Materiau'] ||
        row['Minerai'] ||
        row['minerai'] ||
        row['Mineral'] ||
        row['mineral'] ||
        row['Nom'] ||
        row['nom'] ||
        row['Material'] ||
        row['material'] ||
        ''
      ) as string;

      if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
        errors.push(`Ligne ${idx + 2} : Nom du minerai manquant.`);
        return;
      }

      let cleanName = rawName.trim();
      if (cleanName.toLowerCase() === 'quantanium') {
        cleanName = 'Quantainium';
      }

      const matchedMineral = STAR_CITIZEN_MINERALS.find(m =>
        m.name.toLowerCase() === cleanName.toLowerCase() ||
        m.displayName.toLowerCase().includes(cleanName.toLowerCase()) ||
        cleanName.toLowerCase().includes(m.name.toLowerCase())
      );

      const mineralId = matchedMineral ? matchedMineral.id : cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const mineralName = matchedMineral ? matchedMineral.name : cleanName;

      // 2. Quantity column & unit detection
      let rawQtyVal: unknown = undefined;
      let columnExplicitUnit: 'micro_scu' | 'cscu' | 'scu' | null = null;

      // Check micro-SCU specific column headers
      for (const k of Object.keys(row)) {
        const lk = k.toLowerCase();
        if (lk.includes('µscu') || lk.includes('uscu') || lk.includes('micro')) {
          rawQtyVal = row[k];
          columnExplicitUnit = 'micro_scu';
          break;
        }
      }

      // Check cSCU specific column headers
      if (rawQtyVal === undefined) {
        for (const k of Object.keys(row)) {
          const lk = k.toLowerCase();
          if (lk.includes('cscu') || lk.includes('centi')) {
            rawQtyVal = row[k];
            columnExplicitUnit = 'cscu';
            break;
          }
        }
      }

      // Check standard SCU or generic quantity headers
      if (rawQtyVal === undefined) {
        const standardKeys = [
          'Quantité (SCU)', 'Quantite_SCU', 'Quantité', 'Quantite',
          'SCU', 'scu', 'quantity', 'Quantity', 'Montant', 'montant', 'Amount', 'amount'
        ];
        for (const sk of standardKeys) {
          if (row[sk] !== undefined && row[sk] !== null && String(row[sk]).trim() !== '') {
            rawQtyVal = row[sk];
            break;
          }
        }
      }

      if (rawQtyVal === undefined || rawQtyVal === null) {
        errors.push(`Ligne ${idx + 2} (${cleanName}) : Quantité manquante.`);
        return;
      }

      const cleanedQtyStr = String(rawQtyVal).replace(/\s/g, '').replace(',', '.');
      const rawNum = parseFloat(cleanedQtyStr);

      if (isNaN(rawNum) || rawNum <= 0) {
        errors.push(`Ligne ${idx + 2} (${cleanName}) : Quantité invalide (${rawQtyVal}).`);
        return;
      }

      // Determine effective unit
      let effectiveUnit = unit;
      if (effectiveUnit === 'auto') {
        if (columnExplicitUnit === 'micro_scu') {
          effectiveUnit = 'micro_scu';
        } else if (columnExplicitUnit === 'cscu') {
          effectiveUnit = 'cscu';
        } else if (rawNum >= 1000) {
          // Large integer numbers like 809000, 182000, 1000000 are micro-SCU (µSCU)
          effectiveUnit = 'micro_scu';
        } else {
          effectiveUnit = 'scu';
        }
      }
      detectedEffectiveUnit = effectiveUnit;

      // Convert to SCU float
      let finalSCU = 0;
      if (effectiveUnit === 'micro_scu') {
        // 1 SCU = 1 000 000 µSCU
        finalSCU = rawNum / 1_000_000;
      } else if (effectiveUnit === 'cscu') {
        // 1 SCU = 100 cSCU
        finalSCU = rawNum / 100;
      } else {
        // Direct SCU
        finalSCU = rawNum;
      }

      // 3. Quality & Extraction Type parsing
      const rawType = (row['Type'] || row['type'] || '') as string;
      const rawQuality = (row['Qualité'] || row['Qualite'] || row['Quality'] || row['quality'] || '') as string;

      // 4. Owner Type & Client Name
      const rawOwner = String(row['Type_Proprietaire'] || row['Propriétaire'] || row['Owner'] || row['owner'] || 'Personnel').toLowerCase();
      const isClient = rawOwner.includes('client') || rawOwner.includes('depot') || rawOwner.includes('dépôt');
      const clientName = (row['Nom_Client'] || row['Nom Client'] || row['Client'] || row['client'] || '') as string;

      // 5. Notes & Metadata
      const rawNotes = (row['Notes'] || row['notes'] || row['Commentaire'] || Object.values(row)[4] || '') as string;
      const notesParts = [
        rawNotes && typeof rawNotes === 'string' ? rawNotes.trim() : '',
        rawQuality ? `Qualité: ${rawQuality}` : '',
        rawType ? rawType.trim() : '',
        effectiveUnit === 'micro_scu' ? `(${rawNum.toLocaleString('fr-FR')} µSCU)` : ''
      ].filter(Boolean);

      const id = (row['ID'] || row['id'] || `stock-imp-${Date.now()}-${idx}`) as string;

      items.push({
        id,
        mineralId,
        mineralName,
        quantitySCU: Number(finalSCU.toFixed(6)), // Support high precision up to 6 decimals
        ownerType: isClient ? 'client' : 'personal',
        clientName: isClient ? clientName.trim() || 'Client Inconnu' : undefined,
        lastUpdated: new Date().toISOString(),
        notes: notesParts.length > 0 ? notesParts.join(' • ') : undefined
      });
    });

    return {
      success: items.length > 0,
      data: items,
      errors,
      totalRows: rows.length,
      detectedUnit: detectedEffectiveUnit
    };
  }

  // =========================================================================
  // ORDERS EXPORT
  // =========================================================================

  static exportOrdersToCSV(orders: CustomerOrder[], filename = 'star_citizen_commandes.csv') {
    const data = orders.map(order => {
      const itemsSummary = order.items.map(i => `${i.quantity}x ${i.blueprintName}`).join(' | ');
      const clientMinerals = order.clientSuppliedMinerals.map(m => `${m.quantitySCU} SCU ${m.mineralName}`).join(' | ');

      return {
        'Numero_Commande': order.orderNumber,
        'Client': order.clientName,
        'Organisation': order.clientOrg || '',
        'Contact': order.clientContact || '',
        'Statut': order.status,
        'Items_Commandes': itemsSummary,
        'Minerais_Apportes_Client': clientMinerals || 'Aucun',
        'Prix_Total_aUEC': order.totalPriceAUEC,
        'Est_Paye': order.isPaid ? 'Oui' : 'Non',
        'Date_Creation': order.createdAt,
        'Date_Echeance': order.dueDate || '',
        'Notes': order.notes || ''
      };
    });

    const csv = Papa.unparse(data);
    this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  static exportOrdersToExcel(orders: CustomerOrder[], filename = 'star_citizen_commandes.xlsx') {
    const data = orders.map(order => {
      const itemsSummary = order.items.map(i => `${i.quantity}x ${i.blueprintName}`).join(' | ');
      const clientMinerals = order.clientSuppliedMinerals.map(m => `${m.quantitySCU} SCU ${m.mineralName}`).join(' | ');

      return {
        'N° Commande': order.orderNumber,
        'Client': order.clientName,
        'Organisation': order.clientOrg || '',
        'Contact': order.clientContact || '',
        'Statut': order.status,
        'Items': itemsSummary,
        'Minerais Client': clientMinerals || 'Aucun',
        'Prix Total aUEC': order.totalPriceAUEC,
        'Payé': order.isPaid ? 'Oui' : 'Non',
        'Date Création': new Date(order.createdAt).toLocaleString('fr-FR'),
        'Date Échéance': order.dueDate ? new Date(order.dueDate).toLocaleDateString('fr-FR') : '',
        'Notes': order.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Carnet Commandes');

    worksheet['!cols'] = [
      { wch: 15 }, // N°
      { wch: 20 }, // Client
      { wch: 22 }, // Org
      { wch: 20 }, // Contact
      { wch: 15 }, // Statut
      { wch: 35 }, // Items
      { wch: 30 }, // Minerais
      { wch: 16 }, // Prix
      { wch: 10 }, // Paye
      { wch: 14 }, // Date
      { wch: 14 }, // Echeance
      { wch: 30 }  // Notes
    ];

    XLSX.writeFile(workbook, filename);
  }

  // =========================================================================
  // RAW MINING CARGO EXPORT
  // =========================================================================

  static exportRawCargoToExcel(cargo: RawCargoItem[], filename = 'star_citizen_minage_brut.xlsx') {
    const data = cargo.map(c => ({
      'ID': c.id,
      'Minerai': c.mineralName,
      'Quantité (µSCU)': Math.round(c.quantitySCU * 1_000_000),
      'Quantité (SCU)': c.quantitySCU,
      'Pureté (%)': `${c.purityPercentage}%`,
      'Vaisseau': c.ship,
      'Lieu Extraction': c.location,
      'Date Extraction': new Date(c.extractedAt).toLocaleString('fr-FR'),
      'Notes': c.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Minage Brut');
    XLSX.writeFile(workbook, filename);
  }

  // =========================================================================
  // TEMPLATES DOWNLOAD (WITH MICRO-SCU AND SCU COLUMNS)
  // =========================================================================

  static downloadMineralsTemplateCSV() {
    const sample = [
      {
        'Matériaux': 'Quantainium',
        'Type': 'Minable Vaisseaux',
        'Qualité': '850',
        'Quantité (µSCU)': 809000,
        'Type_Proprietaire': 'Personnel',
        'Nom_Client': '',
        'Notes': 'QV Breaker - Stock raffiné'
      },
      {
        'Matériaux': 'Hadanite',
        'Type': 'Minable Geo',
        'Qualité': '720',
        'Quantité (µSCU)': 99000,
        'Type_Proprietaire': 'Personnel',
        'Nom_Client': '',
        'Notes': 'ROC Mining Daymar'
      },
      {
        'Matériaux': 'Agricium',
        'Type': 'Minable Vaisseaux',
        'Qualité': '640',
        'Quantité (µSCU)': 15000000,
        'Type_Proprietaire': 'Client',
        'Nom_Client': 'Capitaine Jax',
        'Notes': 'Dépôt client pour canons laser'
      },
      {
        'Matériaux': 'Janalite',
        'Type': 'Minable Geo',
        'Qualité': '980',
        'Quantité (µSCU)': 50000,
        'Type_Proprietaire': 'Personnel',
        'Nom_Client': '',
        'Notes': 'Grotte MicroTech'
      }
    ];

    const csv = Papa.unparse(sample);
    this.downloadFile(csv, 'modele_import_minerais_micro_scu.csv', 'text/csv;charset=utf-8;');
  }

  static downloadMineralsTemplateExcel() {
    const sample = [
      {
        'Matériaux': 'Quantainium',
        'Type': 'Minable Vaisseaux',
        'Qualité': 850,
        'Quantité (µSCU)': 809000,
        'Quantité (SCU)': 0.809,
        'Propriétaire': 'Personnel',
        'Nom Client': '',
        'Notes': 'QV Breaker - 1 SCU = 1 000 000 µSCU'
      },
      {
        'Matériaux': 'Hadanite',
        'Type': 'Minable Geo',
        'Qualité': 720,
        'Quantité (µSCU)': 99000,
        'Quantité (SCU)': 0.099,
        'Propriétaire': 'Personnel',
        'Nom Client': '',
        'Notes': 'ROC Mining'
      },
      {
        'Matériaux': 'Agricium',
        'Type': 'Minable Vaisseaux',
        'Qualité': 640,
        'Quantité (µSCU)': 15000000,
        'Quantité (SCU)': 15.0,
        'Propriétaire': 'Client',
        'Nom Client': 'Capitaine Jax',
        'Notes': 'Dépôt client'
      },
      {
        'Matériaux': 'Beryl',
        'Type': 'Minable Vaisseaux',
        'Qualité': 530,
        'Quantité (µSCU)': 2500000,
        'Quantité (SCU)': 2.5,
        'Propriétaire': 'Personnel',
        'Nom Client': '',
        'Notes': 'Prospector Yela'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modèle Minerais µSCU');
    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 22 },
      { wch: 35 }
    ];
    XLSX.writeFile(workbook, 'modele_import_minerais_micro_scu.xlsx');
  }

  // =========================================================================
  // FULL JSON BACKUP & RESTORE
  // =========================================================================

  static exportFullBackupJSON() {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      rawCargo: StorageService.getRawCargo(),
      refinedStock: StorageService.getRefinedStock(),
      refineryJobs: StorageService.getRefineryJobs(),
      customBlueprints: StorageService.getCustomBlueprints(),
      orders: StorageService.getOrders(),
      settings: StorageService.getSettings()
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    this.downloadFile(jsonStr, `star_citizen_backup_${dateStr}.json`, 'application/json;charset=utf-8;');
  }

  static async importFullBackupJSON(file: File): Promise<AppDataBackup | null> {
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as AppDataBackup;
      if (backup && (backup.refinedStock || backup.rawCargo || backup.orders || backup.refineryJobs)) {
        StorageService.importFullBackup(backup);
        return backup;
      }
      return null;
    } catch {
      return null;
    }
  }

  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
