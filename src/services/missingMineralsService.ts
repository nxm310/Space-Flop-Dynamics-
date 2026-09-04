import { CustomerOrder, RefinedStockItem, MineralInfo, OrderStatus } from '../types';
import { StorageService } from './storageService';

export interface AffectedOrderInfo {
  orderId: string;
  orderNumber: string;
  clientName: string;
  status: OrderStatus;
  dueDate?: string;
  grossRequiredSCU: number;
  clientSuppliedSCU: number;
  personalNeededSCU: number;
}

export interface MissingMineralSummary {
  mineralId: string;
  mineralName: string;
  group: string;
  totalRequiredSCU: number;       // Gross required across active orders
  totalClientSuppliedSCU: number; // Supplied by clients across active orders
  personalNeededSCU: number;      // Net needed from personal stock
  personalStockSCU: number;       // Current available in personal stock
  missingSCU: number;             // Deficit (personalNeededSCU - personalStockSCU) > 0
  affectedOrders: AffectedOrderInfo[];
}

export interface MissingMineralsReport {
  missingMinerals: MissingMineralSummary[];
  totalMissingTypesCount: number;
  totalMissingSCU: number;
  totalAffectedOrdersCount: number;
  activeOrdersCount: number;
}

/**
 * Calcule le bilan précis des minerais manquants pour l'ensemble des commandes en cours,
 * en se basant sur le stock personnel de l'utilisateur comme source de vérité.
 */
export function calculateMissingMinerals(
  orders: CustomerOrder[],
  stock: RefinedStockItem[]
): MissingMineralsReport {
  // 1. Filtrer les commandes actives (exclure les commandes terminées et annulées)
  const activeOrders = (orders || []).filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  // 2. Base unifiée de tous les minerais connus (officiels + personnalisés + ceux en stock)
  const allKnownMinerals = StorageService.getAllMinerals(stock);
  const mineralMap = new Map<string, MineralInfo>();
  allKnownMinerals.forEach(m => {
    mineralMap.set(m.id.toLowerCase().trim(), m);
    mineralMap.set(m.name.toLowerCase().trim(), m);
  });

  // 3. Stock personnel de l'utilisateur (base de données de référence du joueur)
  const personalStockItems = (stock || []).filter(s => s.ownerType === 'personal');

  // Fonction de recherche & sommation du stock personnel pour un minerai donné
  const getPersonalStockFor = (resId: string, resName: string): number => {
    const idKey = (resId || '').toLowerCase().trim();
    const nameKey = (resName || '').toLowerCase().trim();
    const cleanNameKey = nameKey.replace(/\s*\(.*?\)/g, '').trim();

    return personalStockItems
      .filter(s => {
        const sId = (s.mineralId || '').toLowerCase().trim();
        const sName = (s.mineralName || '').toLowerCase().trim();
        const sCleanName = sName.replace(/\s*\(.*?\)/g, '').trim();

        if (idKey && (sId === idKey || sName === idKey)) return true;
        if (nameKey && (sId === nameKey || sName === nameKey)) return true;
        if (cleanNameKey && (sCleanName === cleanNameKey)) return true;
        return false;
      })
      .reduce((sum, s) => sum + s.quantitySCU, 0);
  };

  // 4. Agréger les besoins bruts et les dépôts clients commande par commande
  const demandMap = new Map<string, {
    mineralId: string;
    mineralName: string;
    group: string;
    totalRequiredSCU: number;
    totalClientSuppliedSCU: number;
    personalNeededSCU: number;
    affectedOrders: AffectedOrderInfo[];
  }>();

  activeOrders.forEach(order => {
    // A. Calcul des ingrédients bruts requis pour cette commande
    const orderIngs = new Map<string, { resId: string; resName: string; grossSCU: number }>();
    (order.items || []).forEach(item => {
      (item.requiredIngredients || []).forEach(ing => {
        const key = (ing.resourceId || ing.resourceName || '').toLowerCase().trim();
        if (!key) return;
        const existing = orderIngs.get(key) || {
          resId: ing.resourceId || ing.resourceName,
          resName: ing.resourceName || ing.resourceId,
          grossSCU: 0
        };
        existing.grossSCU += (ing.quantitySCU || 0) * (item.quantity || 1);
        orderIngs.set(key, existing);
      });
    });

    // B. Dépôts fournis par le client sur cette commande
    const orderClientDeps = new Map<string, number>();
    (order.clientSuppliedMinerals || []).forEach(dep => {
      const key = (dep.mineralId || dep.mineralName || '').toLowerCase().trim();
      if (!key) return;
      orderClientDeps.set(key, (orderClientDeps.get(key) || 0) + (dep.quantitySCU || 0));
    });

    // C. Déduire le dépôt client et enregistrer le besoin net personnel pour cette commande
    orderIngs.forEach((ingDemand, key) => {
      const gross = ingDemand.grossSCU;
      const clientSupplied = orderClientDeps.get(key) || 0;
      const netFromPersonal = Math.max(0, gross - clientSupplied);

      if (!demandMap.has(key)) {
        const info = mineralMap.get(key) ||
          mineralMap.get((ingDemand.resId || '').toLowerCase().trim()) ||
          mineralMap.get((ingDemand.resName || '').toLowerCase().trim());

        demandMap.set(key, {
          mineralId: ingDemand.resId || key,
          mineralName: info?.displayName || info?.name || ingDemand.resName,
          group: info?.group || 'Mineral',
          totalRequiredSCU: 0,
          totalClientSuppliedSCU: 0,
          personalNeededSCU: 0,
          affectedOrders: []
        });
      }

      const demand = demandMap.get(key)!;
      demand.totalRequiredSCU += gross;
      demand.totalClientSuppliedSCU += Math.min(gross, clientSupplied);
      demand.personalNeededSCU += netFromPersonal;

      if (netFromPersonal > 0) {
        demand.affectedOrders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientName: order.clientName,
          status: order.status,
          dueDate: order.dueDate,
          grossRequiredSCU: Number(gross.toFixed(3)),
          clientSuppliedSCU: Number(clientSupplied.toFixed(3)),
          personalNeededSCU: Number(netFromPersonal.toFixed(3))
        });
      }
    });
  });

  // 5. Comparer avec le stock personnel de l'utilisateur pour identifier les manques réels
  const missingMinerals: MissingMineralSummary[] = [];

  demandMap.forEach((demand) => {
    const personalStock = getPersonalStockFor(demand.mineralId, demand.mineralName);
    const missing = Math.max(0, Number((demand.personalNeededSCU - personalStock).toFixed(3)));

    if (missing > 0) {
      missingMinerals.push({
        mineralId: demand.mineralId,
        mineralName: demand.mineralName,
        group: demand.group,
        totalRequiredSCU: Number(demand.totalRequiredSCU.toFixed(3)),
        totalClientSuppliedSCU: Number(demand.totalClientSuppliedSCU.toFixed(3)),
        personalNeededSCU: Number(demand.personalNeededSCU.toFixed(3)),
        personalStockSCU: Number(personalStock.toFixed(3)),
        missingSCU: missing,
        affectedOrders: demand.affectedOrders
      });
    }
  });

  // Trier par volume manquant décroissant
  missingMinerals.sort((a, b) => b.missingSCU - a.missingSCU);

  const totalMissingSCU = missingMinerals.reduce((sum, m) => sum + m.missingSCU, 0);
  const affectedOrdersSet = new Set(missingMinerals.flatMap(m => m.affectedOrders.map(o => o.orderId)));

  return {
    missingMinerals,
    totalMissingTypesCount: missingMinerals.length,
    totalMissingSCU: Number(totalMissingSCU.toFixed(3)),
    totalAffectedOrdersCount: affectedOrdersSet.size,
    activeOrdersCount: activeOrders.length
  };
}
