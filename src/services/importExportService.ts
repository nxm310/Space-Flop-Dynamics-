import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RefinedStockItem, CustomerOrder, RawCargoItem, AppDataBackup, Blueprint, ClientProfile } from '../types';
import { STAR_CITIZEN_MINERALS } from '../data/mineralsData';
import { StorageService } from './storageService';

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
}

export class ImportExportService {
  // =========================================================================
  // REFINED MINERALS EXPORT
  // =========================================================================

  static exportMineralsToCSV(items: RefinedStockItem[], filename = 'star_citizen_minerais.csv') {
    const data = items.map(item => {
      const mineralInfo = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
      const unitValue = mineralInfo?.basePriceAUEC || 0;
      const totalValue = Math.round(item.quantitySCU * unitValue * 100); // 1 SCU = 100 cSCU

      return {
        'ID': item.id,
        'Minerai': item.mineralName,
        'Type_Proprietaire': item.ownerType === 'personal' ? 'Personnel' : 'Client',
        'Nom_Client': item.clientName || '',
        'Quantite_SCU': item.quantitySCU,
        'Quantite_cSCU': Math.round(item.quantitySCU * 100),
        'Valeur_Unitaire_aUEC': unitValue,
        'Valeur_Totale_Estimee_aUEC': totalValue,
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
      const unitValue = mineralInfo?.basePriceAUEC || 0;
      const totalValue = Math.round(item.quantitySCU * unitValue * 100);

      return {
        'ID': item.id,
        'Minerai': item.mineralName,
        'Propriétaire': item.ownerType === 'personal' ? 'Personnel' : 'Client',
        'Nom Client': item.clientName || '',
        'Quantité (SCU)': item.quantitySCU,
        'Quantité (cSCU)': Math.round(item.quantitySCU * 100),
        'Valeur aUEC/cSCU': unitValue,
        'Valeur Totale aUEC': totalValue,
        'Dernière M.À.J': new Date(item.lastUpdated).toLocaleString('fr-FR'),
        'Notes': item.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Minerais');

    // Auto width for columns
    const maxCols = 10;
    const colWidths = Array(maxCols).fill({ wch: 18 });
    colWidths[1] = { wch: 22 }; // Minerai
    colWidths[3] = { wch: 25 }; // Nom client
    colWidths[9] = { wch: 35 }; // Notes
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  }

  // =========================================================================
  // REFINED MINERALS IMPORT
  // =========================================================================

  static async importMineralsFromFile(file: File): Promise<ImportResult<RefinedStockItem>> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return this.importMineralsFromCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return this.importMineralsFromExcel(file);
    } else {
      return {
        success: false,
        data: [],
        errors: ['Format de fichier non pris en charge. Veuillez utiliser un fichier .csv ou .xlsx.'],
        totalRows: 0
      };
    }
  }

  private static importMineralsFromCSV(file: File): Promise<ImportResult<RefinedStockItem>> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, unknown>[];
          const parsed = this.parseMineralRows(rows);
          resolve(parsed);
        },
        error: (err) => {
          resolve({
            success: false,
            data: [],
            errors: [`Erreur de lecture CSV : ${err.message}`],
            totalRows: 0
          });
        }
      });
    });
  }

  private static async importMineralsFromExcel(file: File): Promise<ImportResult<RefinedStockItem>> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      return this.parseMineralRows(rows);
    } catch (e: unknown) {
      return {
        success: false,
        data: [],
        errors: [`Erreur lors de la lecture du fichier Excel : ${(e as Error).message}`],
        totalRows: 0
      };
    }
  }

  private static parseMineralRows(rows: Record<string, unknown>[]): ImportResult<RefinedStockItem> {
    const items: RefinedStockItem[] = [];
    const errors: string[] = [];

    rows.forEach((row, idx) => {
      // Find mineral name column with flexible headers
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

      // Quantity parsing (supports French comma format e.g. "0,809")
      let qty = 0;
      const rawQty = row['Quantité'] || row['Quantite'] || row['Quantite_SCU'] || row['Quantité (SCU)'] || row['SCU'] || row['scu'] || row['quantity'] || row['Quantity'];
      if (rawQty !== undefined && rawQty !== null) {
        qty = parseFloat(String(rawQty).replace(',', '.'));
      } else {
        const rawCscu = row['Quantite_cSCU'] || row['Quantité (cSCU)'] || row['cSCU'] || row['cscu'];
        if (rawCscu !== undefined) {
          qty = parseFloat(String(rawCscu).replace(',', '.')) / 100;
        }
      }

      if (isNaN(qty) || qty <= 0) {
        errors.push(`Ligne ${idx + 2} (${cleanName}) : Quantité invalide (${rawQty}).`);
        return;
      }

      // Quality & Type parsing
      let rawType = (row['Type'] || row['type'] || row['Catégorie'] || row['Categorie'] || row['Catégorie_Minerai'] || row['Group'] || row['group'] || '') as string;
      const rawQuality = (row['Qualité'] || row['Qualite'] || row['Quality'] || row['quality'] || '') as string;

      // Transform any "minage géo", "minage geo", "géo", "geo", "minable géo", "minable geo", "fps" into "Gemme"
      if (rawType) {
        const lowerType = rawType.toLowerCase();
        if (
          lowerType.includes('minage géo') ||
          lowerType.includes('minage geo') ||
          lowerType.includes('minable géo') ||
          lowerType.includes('minable geo') ||
          lowerType.includes('géo') ||
          lowerType.includes('geo') ||
          lowerType.includes('fps') ||
          lowerType.includes('gem')
        ) {
          rawType = 'Gemme';
        }
      } else if (matchedMineral?.group === 'Gem' || matchedMineral?.isFpsMineable) {
        rawType = 'Gemme';
      }

      // Owner Type & Client Name
      const rawOwner = String(row['Type_Proprietaire'] || row['Propriétaire'] || row['Owner'] || row['owner'] || 'Personnel').toLowerCase();
      const isClient = rawOwner.includes('client') || rawOwner.includes('depot') || rawOwner.includes('dépôt');
      const clientName = (row['Nom_Client'] || row['Nom Client'] || row['Client'] || row['client'] || '') as string;

      let cleanNotes = (row['Notes'] || row['notes'] || row['Commentaire'] || Object.values(row)[4] || '') as string;
      if (cleanNotes && typeof cleanNotes === 'string') {
        cleanNotes = cleanNotes
          .replace(/minage g[ée]o/gi, 'Gemme')
          .replace(/minable g[ée]o/gi, 'Gemme')
          .replace(/g[ée]o\s*fps/gi, 'Gemme')
          .trim();
      }

      const notesParts = [
        cleanNotes && typeof cleanNotes === 'string' ? cleanNotes.trim() : '',
        rawQuality ? `Qualité: ${rawQuality}` : '',
        rawType ? rawType.trim() : ''
      ].filter(Boolean);

      const id = (row['ID'] || row['id'] || `stock-imp-${Date.now()}-${idx}`) as string;

      items.push({
        id,
        mineralId,
        mineralName,
        quantitySCU: Number(qty.toFixed(3)),
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
      totalRows: rows.length
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
        'Items Commandés': itemsSummary,
        'Minerais Fournis Client': clientMinerals || 'Aucun',
        'Prix Total (aUEC)': order.totalPriceAUEC,
        'Payé': order.isPaid ? 'OUI' : 'NON',
        'Créé le': new Date(order.createdAt).toLocaleDateString('fr-FR'),
        'Échéance': order.dueDate ? new Date(order.dueDate).toLocaleDateString('fr-FR') : '',
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
  // TEMPLATES DOWNLOAD
  // =========================================================================

  static downloadMineralsTemplateCSV() {
    const sample = [
      {
        'Minerai': 'Quantainium',
        'Type_Proprietaire': 'Personnel',
        'Nom_Client': '',
        'Quantite_SCU': 32.0,
        'Notes': 'Stock raffiné personnel'
      },
      {
        'Minerai': 'Agricium',
        'Type_Proprietaire': 'Client',
        'Nom_Client': 'Capitaine Jax',
        'Quantite_SCU': 15.0,
        'Notes': 'Apporté pour fabrication canons laser'
      },
      {
        'Minerai': 'Laranite',
        'Type_Proprietaire': 'Personnel',
        'Nom_Client': '',
        'Quantite_SCU': 25.5,
        'Notes': ''
      },
      {
        'Minerai': 'Hadanite',
        'Type_Proprietaire': 'Personnel',
        'Nom_Client': '',
        'Quantite_SCU': 1.2,
        'Notes': 'Gemmes FPS minées'
      }
    ];

    const csv = Papa.unparse(sample);
    this.downloadFile(csv, 'modele_import_minerais_star_citizen.csv', 'text/csv;charset=utf-8;');
  }

  static downloadMineralsTemplateExcel() {
    const sample = [
      {
        'Minerai': 'Quantainium',
        'Propriétaire': 'Personnel',
        'Nom Client': '',
        'Quantité (SCU)': 32.0,
        'Notes': 'Stock raffiné personnel'
      },
      {
        'Minerai': 'Agricium',
        'Propriétaire': 'Client',
        'Nom Client': 'Capitaine Jax',
        'Quantité (SCU)': 15.0,
        'Notes': 'Apporté pour fabrication canons laser'
      },
      {
        'Minerai': 'Laranite',
        'Propriétaire': 'Personnel',
        'Nom Client': '',
        'Quantité (SCU)': 25.5,
        'Notes': ''
      },
      {
        'Minerai': 'Hadanite',
        'Propriétaire': 'Personnel',
        'Nom Client': '',
        'Quantité (SCU)': 1.2,
        'Notes': 'Gemmes FPS'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modèle Minerais');
    worksheet['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 30 }];
    XLSX.writeFile(workbook, 'modele_import_minerais_star_citizen.xlsx');
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

  // =========================================================================
  // INDIVIDUAL SECTION JSON EXPORTS & IMPORTS
  // =========================================================================

  // 1. MINERALS JSON
  static exportMineralsToJSON(items: RefinedStockItem[], filename?: string) {
    const dateStr = new Date().toISOString().split('T')[0];
    const data = {
      section: 'minerals',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      count: items.length,
      refinedStock: items
    };
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, filename || `star_citizen_stock_minerais_${dateStr}.json`, 'application/json;charset=utf-8;');
  }

  static async importMineralsFromJSON(file: File): Promise<ImportResult<RefinedStockItem>> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let rows: any[] = [];

      if (Array.isArray(parsed)) {
        rows = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.refinedStock)) rows = parsed.refinedStock;
        else if (Array.isArray(parsed.minerals)) rows = parsed.minerals;
        else if (Array.isArray(parsed.data)) rows = parsed.data;
        else if (Array.isArray(parsed.items)) rows = parsed.items;
      }

      const validItems: RefinedStockItem[] = [];
      const errors: string[] = [];

      rows.forEach((row, idx) => {
        const mineralName = String(row.mineralName || row.name || row.displayName || row.Minerai || '').trim();
        const mineralId = String(row.mineralId || row.id || mineralName.toLowerCase()).trim();
        const quantity = parseFloat(String(row.quantitySCU !== undefined ? row.quantitySCU : row.quantity !== undefined ? row.quantity : row.Quantite_SCU || 0));

        if (!mineralName || isNaN(quantity) || quantity <= 0) {
          errors.push(`Ligne ${idx + 1}: Données de minerai invalides.`);
          return;
        }

        const ownerType: 'personal' | 'client' = row.ownerType === 'client' || row.Type_Proprietaire === 'Client' ? 'client' : 'personal';
        const clientName = row.clientName || row.Nom_Client || undefined;
        const notes = row.notes || row.Notes || undefined;

        validItems.push({
          id: `stock-json-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          mineralId,
          mineralName,
          quantitySCU: Number(quantity.toFixed(3)),
          ownerType,
          clientName,
          lastUpdated: row.lastUpdated || new Date().toISOString(),
          notes
        });
      });

      return {
        success: validItems.length > 0,
        data: validItems,
        errors,
        totalRows: rows.length
      };
    } catch (e: any) {
      return {
        success: false,
        data: [],
        errors: [`Erreur de lecture du fichier JSON : ${e?.message || 'Format JSON invalide'}`],
        totalRows: 0
      };
    }
  }

  // 2. BLUEPRINTS JSON
  static exportBlueprintsToJSON(
    customBlueprints: Blueprint[],
    unlockedIds: string[],
    clientBlueprintIds: string[],
    filename?: string
  ) {
    const dateStr = new Date().toISOString().split('T')[0];
    const data = {
      section: 'blueprints',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      counts: {
        customBlueprints: customBlueprints.length,
        unlockedWorkshop: unlockedIds.length,
        clientBlueprints: clientBlueprintIds.length
      },
      customBlueprints,
      unlockedIds,
      clientBlueprintIds
    };
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, filename || `star_citizen_blueprints_${dateStr}.json`, 'application/json;charset=utf-8;');
  }

  static async importBlueprintsFromJSON(file: File): Promise<{
    success: boolean;
    customBlueprints: Blueprint[];
    unlockedIds: string[];
    clientBlueprintIds: string[];
    errors: string[];
    totalCount: number;
  }> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let customBps: Blueprint[] = [];
      let unlockedIds: string[] = [];
      let clientIds: string[] = [];

      if (Array.isArray(parsed)) {
        customBps = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.customBlueprints)) customBps = parsed.customBlueprints;
        else if (Array.isArray(parsed.blueprints)) customBps = parsed.blueprints;

        if (Array.isArray(parsed.unlockedIds)) unlockedIds = parsed.unlockedIds;
        else if (Array.isArray(parsed.unlockedBlueprintIds)) unlockedIds = parsed.unlockedBlueprintIds;

        if (Array.isArray(parsed.clientBlueprintIds)) clientIds = parsed.clientBlueprintIds;
        else if (Array.isArray(parsed.clientIds)) clientIds = parsed.clientIds;
      }

      return {
        success: customBps.length > 0 || unlockedIds.length > 0 || clientIds.length > 0,
        customBlueprints: customBps,
        unlockedIds,
        clientBlueprintIds: clientIds,
        errors: [],
        totalCount: customBps.length + unlockedIds.length + clientIds.length
      };
    } catch (e: any) {
      return {
        success: false,
        customBlueprints: [],
        unlockedIds: [],
        clientBlueprintIds: [],
        errors: [`Erreur de lecture du JSON de blueprints : ${e?.message || 'Format invalide'}`],
        totalCount: 0
      };
    }
  }

  // 3. ORDERS JSON
  static exportOrdersToJSON(
    orders: CustomerOrder[],
    clients: ClientProfile[],
    filename?: string
  ) {
    const dateStr = new Date().toISOString().split('T')[0];
    const data = {
      section: 'orders',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      counts: {
        orders: orders.length,
        clients: clients.length
      },
      orders,
      clients
    };
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, filename || `star_citizen_commandes_${dateStr}.json`, 'application/json;charset=utf-8;');
  }

  static async importOrdersFromJSON(file: File): Promise<{
    success: boolean;
    orders: CustomerOrder[];
    clients: ClientProfile[];
    errors: string[];
    totalOrders: number;
    totalClients: number;
  }> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let orders: CustomerOrder[] = [];
      let clients: ClientProfile[] = [];

      if (Array.isArray(parsed)) {
        orders = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.orders)) orders = parsed.orders;
        if (Array.isArray(parsed.clients)) clients = parsed.clients;
      }

      return {
        success: orders.length > 0 || clients.length > 0,
        orders,
        clients,
        errors: [],
        totalOrders: orders.length,
        totalClients: clients.length
      };
    } catch (e: any) {
      return {
        success: false,
        orders: [],
        clients: [],
        errors: [`Erreur de lecture du JSON de commandes : ${e?.message || 'Format invalide'}`],
        totalOrders: 0,
        totalClients: 0
      };
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
