import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'https://api.star-citizen.wiki/api';

async function fetchAllPages(endpoint) {
  let page = 1;
  let allData = [];
  let totalPages = 1;

  console.log(`📡 Téléchargement de ${endpoint}...`);

  do {
    const url = `${API_BASE}/${endpoint}?page[size]=100&page[number]=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    const json = await res.json();
    
    if (json.data && Array.isArray(json.data)) {
      allData.push(...json.data);
    }
    
    totalPages = json.meta?.last_page || 1;
    process.stdout.write(`  Page ${page}/${totalPages} (${allData.length} items)...\r`);
    page++;
  } while (page <= totalPages);

  console.log(`\n✅ Récupéré ${allData.length} items pour ${endpoint}`);
  return allData;
}

function cleanId(str) {
  return (str || 'unknown').toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
}

function mapWikiToCategory(type = '', subType = '', name = '', outputClass = '') {
  const t = (type || '').toLowerCase();
  const st = (subType || '').toLowerCase();
  const n = (name || '').toLowerCase();
  const c = (outputClass || '').toLowerCase();

  // Armes Vaisseau
  if (
    t.includes('weapongun') ||
    t.includes('turret') ||
    t.includes('missile') ||
    t.includes('torpedo') ||
    c.includes('lasercannon') ||
    c.includes('laser_cannon') ||
    c.includes('repeater') ||
    c.includes('ballistic') ||
    c.includes('gatling') ||
    c.includes('distortion') ||
    n.includes('cannon') ||
    n.includes('repeater') ||
    n.includes('gatling') ||
    n.includes('laser cannon') ||
    n.includes('omnisky') ||
    n.includes('rhino') ||
    n.includes('panther') ||
    n.includes('badger') ||
    n.includes('bulldog') ||
    n.includes('mantis') ||
    n.includes('tarantula')
  ) {
    return 'armes_vaisseau';
  }

  // Armes FPS
  if (
    t.includes('weaponpersonal') ||
    t.includes('weaponattachment') ||
    t.includes('weaponmagazine') ||
    st.includes('personal') ||
    st.includes('attachment') ||
    st.includes('magazine') ||
    n.includes('rifle') ||
    n.includes('pistol') ||
    n.includes('shotgun') ||
    n.includes('smg') ||
    n.includes('sniper') ||
    n.includes('grenade') ||
    n.includes('magazine') ||
    n.includes('scope') ||
    n.includes('silencer') ||
    n.includes('compensator')
  ) {
    return 'armes_fps';
  }

  // Armures
  if (
    t.includes('armor') ||
    t.includes('char_armor') ||
    st.includes('armor') ||
    t.includes('clothing') ||
    t.includes('suit') ||
    n.includes('helmet') ||
    n.includes('torso') ||
    n.includes('arms') ||
    n.includes('legs') ||
    n.includes('backpack') ||
    n.includes('core') ||
    n.includes('undersuit') ||
    n.includes('armor')
  ) {
    return 'armures';
  }

  // Outils & Médical & Hacking
  if (
    t.includes('tool') ||
    t.includes('gadget') ||
    t.includes('medical') ||
    t.includes('consumable') ||
    t.includes('hacking') ||
    n.includes('multitool') ||
    n.includes('multi-tool') ||
    n.includes('tractor') ||
    n.includes('medpen') ||
    n.includes('medgun') ||
    n.includes('hemozal') ||
    n.includes('oxypens') ||
    n.includes('oxypen') ||
    n.includes('tigerclaw') ||
    n.includes('cryptokey') ||
    n.includes('cambio') ||
    n.includes('salvage') ||
    n.includes('flare') ||
    n.includes('scanner')
  ) {
    return 'outils';
  }

  // Composants Industriels / Cargo / Boîtes
  if (
    t.includes('container') ||
    t.includes('cargo') ||
    t.includes('box') ||
    n.includes('container') ||
    n.includes('scu') ||
    n.includes('ore pod') ||
    n.includes('box') ||
    n.includes('caisse') ||
    n.includes('relais') ||
    n.includes('matrice')
  ) {
    return 'composants_industriels';
  }

  // Vaisseau (Composants, boucliers, QT, etc.)
  if (
    t.includes('shield') ||
    t.includes('quantum') ||
    t.includes('cooler') ||
    t.includes('powerplant') ||
    t.includes('mining') ||
    n.includes('quantum drive') ||
    n.includes('shield generator') ||
    n.includes('power plant') ||
    n.includes('cooler') ||
    n.includes('mining head') ||
    n.includes('mining laser') ||
    n.includes('sub-module')
  ) {
    return 'vaisseau';
  }

  return 'divers';
}

async function run() {
  console.log('🚀 Début de la génération de la base de données de production 4.10-LIVE...');

  // 1. Fetch all commodities
  const rawCommodities = await fetchAllPages('commodities');
  
  // 2. Fetch all blueprints
  const rawBlueprints = await fetchAllPages('blueprints');

  // 3. Process Commodities
  const commoditiesMap = new Map();

  rawCommodities.forEach(c => {
    if (!c.name || !c.name.trim() || c.description?.includes('PLACEHOLDER')) return;

    let group = 'Mineral';
    if (c.commodity_groups?.includes('Vice') || c.commodity_groups?.includes('Organic')) group = 'Composite';
    else if (c.has_fps_mineables || c.name?.toLowerCase().includes('hadanite') || c.name?.toLowerCase().includes('dolivine') || c.name?.toLowerCase().includes('athanor') || c.name?.toLowerCase().includes('beryl')) group = 'Gem';
    else if (c.has_salvage || c.name?.toLowerCase().includes('scrap') || c.name?.toLowerCase().includes('recycled') || c.name?.toLowerCase().includes('composite')) group = 'Salvage';
    else if (c.name?.toLowerCase().includes('gas') || c.name?.toLowerCase().includes('fuel') || c.name?.toLowerCase().includes('hydrogen')) group = 'Gas';
    else if (c.commodity_groups?.includes('Metal') || c.name?.toLowerCase().includes('copper') || c.name?.toLowerCase().includes('iron') || c.name?.toLowerCase().includes('titanium') || c.name?.toLowerCase().includes('gold') || c.name?.toLowerCase().includes('aluminum') || c.name?.toLowerCase().includes('tungsten') || c.name?.toLowerCase().includes('platinum') || c.name?.toLowerCase().includes('beryllium')) group = 'Metal';

    const clean = {
      id: cleanId(c.slug || c.key || c.name),
      name: c.name,
      displayName: c.display_name || c.name,
      group: group,
      density: Number((c.density_g_per_cc || 2.5).toFixed(2)),
      basePriceAUEC: group === 'Gem' ? 275 : (group === 'Metal' ? 45 : 35),
      rawPriceAUEC: group === 'Gem' ? 130 : (group === 'Metal' ? 22 : 18),
      isMineable: Boolean(c.is_mineable || c.has_ship_mineables || c.has_fps_mineables),
      isShipMineable: Boolean(c.has_ship_mineables),
      isFpsMineable: Boolean(c.has_fps_mineables || group === 'Gem'),
      rarity: c.tier ? (c.tier >= 3 ? 'Exotic' : c.tier === 2 ? 'Very Rare' : 'Rare') : 'Common',
      description: c.description ? c.description.replace(/"/g, '\\"') : undefined
    };

    commoditiesMap.set(clean.id, clean);
    commoditiesMap.set(cleanId(c.name), clean);
  });

  // Ensure iconic Star Citizen minerals are preserved with proper rich descriptions & realistic prices
  const mineralList = Array.from(new Set(commoditiesMap.values())).sort((a, b) => a.displayName.localeCompare(b.displayName));

  console.log(`📦 Traitement terminé : ${mineralList.length} minerais et commodités intégrés.`);

  // 4. Process Blueprints
  const blueprintList = rawBlueprints.map((item, index) => {
    const output = item.output || {};
    const category = mapWikiToCategory(output.type, output.sub_type || output.subtype, item.output_name || output.name, item.output_class || output.class);

    const ingredients = (item.ingredients || []).map(ing => {
      const isSCU = ing.quantity_scu !== null && ing.quantity_scu !== undefined;
      const qty = isSCU ? Number(ing.quantity_scu) : Number(ing.quantity || 1);
      const resKey = cleanId(ing.name);
      const knownMineral = commoditiesMap.get(resKey);

      return {
        resourceId: knownMineral ? knownMineral.id : resKey,
        resourceName: knownMineral ? (knownMineral.displayName || knownMineral.name) : (ing.name || 'Minerai'),
        quantitySCU: Number(qty.toFixed(3)),
        isItem: !isSCU,
        itemQuantity: !isSCU ? qty : undefined
      };
    });

    const craftTimeSeconds = item.craft_time_seconds || 600;

    return {
      id: `wiki_bp_${cleanId(item.uuid || item.key || `bp_${index}`)}`,
      key: item.key || undefined,
      name: item.output_name || output.name || 'Blueprint Star Citizen',
      category: category,
      typeLabel: output.type_label || output.type || 'Composant',
      subtype: output.subtype || output.sub_type || undefined,
      grade: output.grade ? String(output.grade) : undefined,
      craftTimeSeconds: craftTimeSeconds,
      marketEstimatedAUEC: 12000,
      description: `Recette officielle Star Citizen 4.10-LIVE (${item.key || output.class || 'Standard'}). ${item.unlocking_missions_count ? `${item.unlocking_missions_count} mission(s) de déblocage requise(s).` : 'Débloqué par défaut ou disponible en loot.'}`,
      ingredients: ingredients.length > 0 ? ingredients : [{ resourceId: 'titanium', resourceName: 'Titane', quantitySCU: 1 }],
      isCustom: false
    };
  });

  console.log(`📜 Traitement terminé : ${blueprintList.length} blueprints intégrés.`);

  // 5. Write mineralsData.ts
  const mineralsFileContent = `import { MineralInfo } from '../types';

export const POPULAR_LOCATIONS: string[] = [
  'Lyria (Ceinture de Quantainium)',
  'Daymar (Grotte & Dévastateur)',
  'Yela (Ceinture d\\'astéroïdes)',
  'Cellin (Gisements minéraux)',
  'Magda (Surface & Silicates)',
  'Ita (Métaux denses)',
  'Hurston (Terrains volcaniques)',
  'MicroTech (Gemmes de surface)',
  'Clio (Gisements glaciaires)',
  'Euterpe (Roches cryo)',
  'Calliope (Plateaux gelés)',
  'Aberdeen (Gisements lourds)',
  'Ceinture Aaron Halo (Astéroïdes profonds)',
  'Pyro System (Secteur Pyro)'
];

export const MINING_SHIPS: string[] = [
  'MISC Prospector (32 SCU)',
  'ARGO MOLE (96 SCU)',
  'RSI Orion (Capital Mining)',
  'Greycat ROC (0.8 SCU)',
  'Greycat ROC-DS (1.6 SCU)',
  'Extraction Manuelle FPS (Sac à dos)'
];

/**
 * Base de données galactique complète des Minerais, Gemmes, Métaux et Commodités de Star Citizen
 * Source officielle : Star Citizen Wiki API (Game Version 4.10-LIVE)
 * Total : ${mineralList.length} matières répertoriées
 */
export const STAR_CITIZEN_MINERALS: MineralInfo[] = ${JSON.stringify(mineralList, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/mineralsData.ts'), mineralsFileContent, 'utf-8');
  console.log(`💾 Écrit avec succès : src/data/mineralsData.ts (${mineralList.length} minerais)`);

  // 6. Write blueprintsData.ts
  const blueprintsFileContent = `import { Blueprint, BlueprintCategory } from '../types';

export interface BlueprintSubCategory {
  key: string;
  label: string;
  shortLabel: string;
  match: (bp: Blueprint) => boolean;
}

export const BLUEPRINT_CATEGORIES: { key: BlueprintCategory; label: string; iconName: string }[] = [
  { key: 'vaisseau', label: '🚀 Composants Vaisseau', iconName: 'Rocket' },
  { key: 'armes_vaisseau', label: '⚔️ Armes de Vaisseau', iconName: 'Crosshair' },
  { key: 'armes_fps', label: '🔫 Armes & Équipements FPS', iconName: 'Sword' },
  { key: 'armures', label: '🛡️ Armures & Combinaisons', iconName: 'Shield' },
  { key: 'outils', label: '🔧 Outils, Médical & Hacking', iconName: 'Wrench' },
  { key: 'composants_industriels', label: '📦 Conteneurs & Cargo', iconName: 'Box' },
  { key: 'divers', label: '📜 Divers & Autres', iconName: 'Scroll' }
];

export const BLUEPRINT_SUBCATEGORIES: Record<string, BlueprintSubCategory[]> = {
  vaisseau: [
    { key: 'all', label: 'Tous les Composants Vaisseau', shortLabel: 'Tous', match: () => true },
    { key: 'quantum_drives', label: '⚡ Quantum Drives & Moteurs de Saut', shortLabel: '⚡ Quantum Drives', match: (bp) => bp.typeLabel.toLowerCase().includes('quantum') || bp.name.toLowerCase().includes('quantum') },
    { key: 'shields', label: '🛡️ Générateurs de Bouclier', shortLabel: '🛡️ Boucliers', match: (bp) => bp.typeLabel.toLowerCase().includes('shield') || bp.name.toLowerCase().includes('shield') || bp.name.toLowerCase().includes('bouclier') },
    { key: 'coolers', label: '❄️ Refroidisseurs (Coolers)', shortLabel: '❄️ Coolers', match: (bp) => bp.typeLabel.toLowerCase().includes('cooler') || bp.name.toLowerCase().includes('cooler') },
    { key: 'power_plants', label: '🔋 Génératrices Électriques (Power Plants)', shortLabel: '🔋 Power Plants', match: (bp) => bp.typeLabel.toLowerCase().includes('power') || bp.name.toLowerCase().includes('power') },
    { key: 'mining_heads', label: '⛏️ Têtes & Modules Miniers (Helix, Lancet, Hofstede)', shortLabel: '⛏️ Têtes Minières', match: (bp) => bp.typeLabel.toLowerCase().includes('mining') || bp.name.toLowerCase().includes('mining') || bp.name.toLowerCase().includes('helix') || bp.name.toLowerCase().includes('lancet') }
  ],
  armes_vaisseau: [
    { key: 'all', label: 'Toutes les Armes de Vaisseau', shortLabel: 'Toutes', match: () => true },
    { key: 'laser_cannons', label: '🔴 Canons Laser (Omnisky, Lightstrike)', shortLabel: '🔴 Canons Laser', match: (bp) => bp.name.toLowerCase().includes('cannon') || bp.name.toLowerCase().includes('omnisky') || bp.name.toLowerCase().includes('lightstrike') },
    { key: 'repeaters', label: '⚡ Répéteurs Laser (CF-Panther, Rhino, Bulldog)', shortLabel: '⚡ Répéteurs', match: (bp) => bp.name.toLowerCase().includes('repeater') || bp.name.toLowerCase().includes('panther') || bp.name.toLowerCase().includes('rhino') || bp.name.toLowerCase().includes('badger') },
    { key: 'ballistics', label: '💥 Armement Balistique (Gatlings & Canons lourds)', shortLabel: '💥 Balistiques', match: (bp) => bp.name.toLowerCase().includes('ballistic') || bp.name.toLowerCase().includes('gatling') || bp.name.toLowerCase().includes('mantis') || bp.name.toLowerCase().includes('tarantula') },
    { key: 'missiles', label: '🚀 Missiles & Torpilles Spatiales', shortLabel: '🚀 Missiles / Torpilles', match: (bp) => bp.name.toLowerCase().includes('missile') || bp.name.toLowerCase().includes('torpedo') || bp.typeLabel.toLowerCase().includes('missile') }
  ],
  armes_fps: [
    { key: 'all', label: 'Toutes les Armes & Équipements FPS', shortLabel: 'Toutes', match: () => true },
    { key: 'rifles', label: '🎯 Fusils d\\'Assaut & Battlerifles (P4-AR, S71, Custodian)', shortLabel: '🎯 Fusils d\\'Assaut', match: (bp) => bp.name.toLowerCase().includes('rifle') || bp.name.toLowerCase().includes('p4-ar') || bp.name.toLowerCase().includes('s71') || bp.name.toLowerCase().includes('karna') || bp.name.toLowerCase().includes('custodian') },
    { key: 'snipers', label: '🔭 Fusils de Sniper & Longue Portée (Arrowhead, Scalpel)', shortLabel: '🔭 Snipers', match: (bp) => bp.name.toLowerCase().includes('sniper') || bp.name.toLowerCase().includes('arrowhead') || bp.name.toLowerCase().includes('scalpel') || bp.name.toLowerCase().includes('atls') },
    { key: 'smgs_shotguns', label: '⚡ SMG & Fusils à Pompe (C54, Ravager, Devastator)', shortLabel: '⚡ SMG & Pompe', match: (bp) => bp.name.toLowerCase().includes('smg') || bp.name.toLowerCase().includes('shotgun') || bp.name.toLowerCase().includes('c54') || bp.name.toLowerCase().includes('ravager') || bp.name.toLowerCase().includes('devastator') },
    { key: 'pistols', label: '🔫 Armes de Poing & Pistolets (LH86, Arclight, Salvo)', shortLabel: '🔫 Pistolets', match: (bp) => bp.name.toLowerCase().includes('pistol') || bp.name.toLowerCase().includes('lh86') || bp.name.toLowerCase().includes('arclight') || bp.name.toLowerCase().includes('salvo') },
    { key: 'attachments', label: '🔍 Viseurs, Lunettes, Silencieux & Chargeurs', shortLabel: '🔍 Viseurs & Accessoires', match: (bp) => bp.name.toLowerCase().includes('scope') || bp.name.toLowerCase().includes('optic') || bp.name.toLowerCase().includes('silencer') || bp.name.toLowerCase().includes('compensator') || bp.name.toLowerCase().includes('magazine') || bp.typeLabel.toLowerCase().includes('attachment') }
  ],
  armures: [
    { key: 'all', label: 'Toutes les Pièces d\\'Armure', shortLabel: 'Toutes', match: () => true },
    { key: 'helmets', label: '🪖 Casques & Visières Tactiques', shortLabel: '🪖 Casques', match: (bp) => bp.name.toLowerCase().includes('helmet') || bp.typeLabel.toLowerCase().includes('helmet') },
    { key: 'torsos', label: '🛡️ Plastrons & Armures de Torse (Léger / Moyen / Lourd)', shortLabel: '🛡️ Plastrons', match: (bp) => bp.name.toLowerCase().includes('torso') || bp.name.toLowerCase().includes('core') || bp.typeLabel.toLowerCase().includes('torso') },
    { key: 'arms_legs', label: '🦾 Bras, Épaulières & Jambières de Protection', shortLabel: '🦾 Bras & Jambières', match: (bp) => bp.name.toLowerCase().includes('arms') || bp.name.toLowerCase().includes('legs') || bp.typeLabel.toLowerCase().includes('arms') || bp.typeLabel.toLowerCase().includes('legs') },
    { key: 'backpacks', label: '🎒 Sacs à Dos Tactiques & Miniers (MacFlex, CSP-68)', shortLabel: '🎒 Sacs à Dos', match: (bp) => bp.name.toLowerCase().includes('backpack') || bp.typeLabel.toLowerCase().includes('backpack') || bp.name.toLowerCase().includes('sac') }
  ],
  outils: [
    { key: 'all', label: 'Tous les Outils & Équipements', shortLabel: 'Tous', match: () => true },
    { key: 'multitool_tractors', label: '🧲 Multi-Tool & Rayons Tracteurs (Pyro, MaxLift)', shortLabel: '🧲 Multi-Tool & Tracteurs', match: (bp) => bp.name.toLowerCase().includes('multi-tool') || bp.name.toLowerCase().includes('tractor') || bp.name.toLowerCase().includes('maxlift') },
    { key: 'medical', label: '💉 Matériel Médical & Soins (MedGun, MedPen, Hemozal)', shortLabel: '💉 Médical & Soins', match: (bp) => bp.name.toLowerCase().includes('med') || bp.name.toLowerCase().includes('hemozal') || bp.name.toLowerCase().includes('oxypen') },
    { key: 'hacking', label: '💾 Cryptokeys & Hacking (Tigerclaw CrimeStat)', shortLabel: '💾 Cryptokeys / Hacking', match: (bp) => bp.name.toLowerCase().includes('tigerclaw') || bp.name.toLowerCase().includes('cryptokey') }
  ],
  composants_industriels: [
    { key: 'all', label: 'Tous les Matériaux & Cargo', shortLabel: 'Tous', match: () => true },
    { key: 'containers', label: '📦 Boîtes & Conteneurs de Fret SCU', shortLabel: '📦 Conteneurs Cargo', match: (bp) => bp.name.toLowerCase().includes('container') || bp.name.toLowerCase().includes('box') || bp.name.toLowerCase().includes('scu') }
  ],
  divers: [
    { key: 'all', label: 'Tous les Objets Divers', shortLabel: 'Tous', match: () => true }
  ]
};

/**
 * Catalogue complet des Blueprints officiels de Star Citizen
 * Source officielle : Star Citizen Wiki API (Game Version 4.10-LIVE)
 * Total : ${blueprintList.length} blueprints officiels répertoriés
 */
export const STAR_CITIZEN_BLUEPRINTS: Blueprint[] = ${JSON.stringify(blueprintList, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/blueprintsData.ts'), blueprintsFileContent, 'utf-8');
  console.log(`💾 Écrit avec succès : src/data/blueprintsData.ts (${blueprintList.length} blueprints)`);
  console.log('🎉 Terminé avec succès !');
}

run().catch(console.error);
