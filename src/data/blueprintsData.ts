import { Blueprint, BlueprintCategory } from '../types';

export const STAR_CITIZEN_BLUEPRINTS: Blueprint[] = [
  // ==========================================
  // 1. VAISSEAU & COMPOSANTS (QUANTUM, SHIELDS, POWER, COOLERS, MINING HEADS)
  // ==========================================
  {
    id: 'bp_qd_atlas_s1',
    key: 'BP_CRAFT_QD_ATLAS_S1',
    name: 'Atlas Quantum Drive (S1)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Civilian Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1800,
    description: 'Le moteur quantique S1 le plus équilibré et prisé pour les chasseurs légers et explorateurs.',
    marketEstimatedAUEC: 18500,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.2 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 0.8 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.5 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 1.5 }
    ],
    dismantleReturns: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 0.6 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.2 }
    ]
  },
  {
    id: 'bp_qd_vk00_s1',
    key: 'BP_CRAFT_QD_VK00_S1',
    name: 'VK-00 Quantum Drive (S1)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2400,
    description: 'Le moteur quantique S1 le plus rapide de Stanton, consommation élevée.',
    marketEstimatedAUEC: 43500,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 2.5 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.8 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 1.2 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 3.0 }
    ]
  },
  {
    id: 'bp_qd_spectre_s1',
    key: 'BP_CRAFT_QD_SPECTRE_S1',
    name: 'Spectre Quantum Drive (S1)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Stealth Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2000,
    description: 'Moteur quantique S1 à signature radar et thermique extrêmement basse.',
    marketEstimatedAUEC: 28000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.5 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 1.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_qd_crossfield_s2',
    key: 'BP_CRAFT_QD_CROSSFIELD_S2',
    name: 'Crossfield Quantum Drive (S2)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3600,
    description: 'Moteur militaire S2 de référence pour Cutlass, Freelancer, Zeus et Connie.',
    marketEstimatedAUEC: 86000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 4.8 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 3.2 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 2.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 6.0 }
    ]
  },
  {
    id: 'bp_qd_xl1_s2',
    key: 'BP_CRAFT_QD_XL1_S2',
    name: 'XL-1 Quantum Drive (S2)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A+',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 4200,
    description: 'Le propulseur quantique S2 le plus véloce du Verse.',
    marketEstimatedAUEC: 115000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 6.5 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 4.0 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 2.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_qd_ts2_s3',
    key: 'BP_CRAFT_QD_TS2_S3',
    name: 'TS-2 Quantum Drive (S3)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 7200,
    description: 'Propulseur quantique lourd S3 pour vaisseaux capitaux (Carrack, Hammerhead, 890J).',
    marketEstimatedAUEC: 260000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 18.0 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 12.0 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 10.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 25.0 }
    ]
  },
  {
    id: 'bp_shield_fr66_s1',
    key: 'BP_CRAFT_SHIELD_FR66_S1',
    name: 'FR-66 Shield Generator (S1)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1500,
    description: 'Générateur de bouclier militaire à régénération rapide pour chasseurs légers.',
    marketEstimatedAUEC: 19500,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 1.6 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.0 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.8 }
    ]
  },
  {
    id: 'bp_shield_mirage_s1',
    key: 'BP_CRAFT_SHIELD_MIRAGE_S1',
    name: 'Mirage Shield Generator (S1)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Stealth Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1400,
    description: 'Bouclier furtif à très faible signature EM/IR pour Sabre et Eclipse.',
    marketEstimatedAUEC: 22000,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 1.2 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 1.8 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 2.2 }
    ]
  },
  {
    id: 'bp_shield_fr76_s2',
    key: 'BP_CRAFT_SHIELD_FR76_S2',
    name: 'FR-76 Shield Generator (S2)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3200,
    description: 'Bouclier militaire moyen à régénération ultra rapide (Vanguard, Corsair, Freelancer).',
    marketEstimatedAUEC: 48000,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 3.8 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 2.5 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 4.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 5.0 }
    ]
  },
  {
    id: 'bp_shield_fr86_s3',
    key: 'BP_CRAFT_SHIELD_FR86_S3',
    name: 'FR-86 Shield Generator (S3)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 6500,
    description: 'Bouclier militaire lourd S3 capable d\'encaisser des tirs de torpilles massifs.',
    marketEstimatedAUEC: 185000,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 12.0 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 8.0 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 6.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 15.0 }
    ]
  },
  {
    id: 'bp_power_js300_s1',
    key: 'BP_CRAFT_POWER_JS300_S1',
    name: 'JS-300 Power Plant (S1)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1600,
    description: 'Génératrice d\'énergie militaire haute performance fournissant une puissance stable sans surchauffe.',
    marketEstimatedAUEC: 24500,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.5 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 1.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.2 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.8 }
    ]
  },
  {
    id: 'bp_power_js400_s2',
    key: 'BP_CRAFT_POWER_JS400_S2',
    name: 'JS-400 Power Plant (S2)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3400,
    description: 'Génératrice militaire moyenne pour vaisseaux multicoques et plates-formes d\'armes lourdes.',
    marketEstimatedAUEC: 56000,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 3.5 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 2.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 5.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.5 }
    ]
  },
  {
    id: 'bp_cooler_glacier_s1',
    key: 'BP_CRAFT_COOLER_GLACIER_S1',
    name: 'Glacier Cooler (S1)',
    category: 'vaisseau',
    typeLabel: 'Cooler',
    subtype: 'Industrial Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1200,
    description: 'Refroidisseur ultra endurant conçu pour dissiper la chaleur des lasers à haute cadence.',
    marketEstimatedAUEC: 15500,
    ingredients: [
      { resourceId: 'ice', resourceName: 'Ice', quantitySCU: 2.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 3.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.5 }
    ]
  },
  {
    id: 'bp_cooler_avalanche_s2',
    key: 'BP_CRAFT_COOLER_AVALANCHE_S2',
    name: 'Avalanche Cooler (S2)',
    category: 'vaisseau',
    typeLabel: 'Cooler',
    subtype: 'Industrial Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 2800,
    description: 'Refroidisseur industriel moyen pour les tourelles intensives et propulseurs de saut.',
    marketEstimatedAUEC: 38000,
    ingredients: [
      { resourceId: 'ice', resourceName: 'Ice', quantitySCU: 6.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 7.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 3.5 }
    ]
  },
  {
    id: 'bp_mining_helix_s1',
    key: 'BP_CRAFT_MINING_HELIX_S1',
    name: 'Helix I Mining Laser (S1)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2400,
    description: 'Tête de minage Prospector à très haute puissance de pénétration pour fracturer les filons de Quantainium.',
    marketEstimatedAUEC: 45000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 2.2 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 3.0 },
      { resourceId: 'beryl', resourceName: 'Beryl', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_mining_lancet_s1',
    key: 'BP_CRAFT_MINING_LANCET_S1',
    name: 'Lancet MH1 Mining Laser (S1)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2200,
    description: 'Tête de minage de précision réduisant drastiquement l\'instabilité et la résistance des roches.',
    marketEstimatedAUEC: 32000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 1.5 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 2.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 3.0 }
    ]
  },
  {
    id: 'bp_mining_helix_s2',
    key: 'BP_CRAFT_MINING_HELIX_S2',
    name: 'Helix II Mining Laser (S2)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 4800,
    description: 'Tête de minage lourde pour tourelle ARGO MOLE, capable de briser des astéroïdes géants.',
    marketEstimatedAUEC: 110000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 5.5 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 4.2 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 7.0 },
      { resourceId: 'beryl', resourceName: 'Beryl', quantitySCU: 4.5 }
    ]
  },

  // ==========================================
  // 2. ARMES DE VAISSEAU (REPETEURS, CANONS, GATLINGS, DISTORSION)
  // ==========================================
  {
    id: 'bp_weap_cf117_s1',
    key: 'BP_CRAFT_WEAP_CF117_S1',
    name: 'CF-117 Bulldog Laser Repeater (S1)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon',
    grade: 'Standard',
    size: 1,
    craftTimeSeconds: 900,
    description: 'Répéteur laser S1 haute cadence compact pour chasseurs légers.',
    marketEstimatedAUEC: 8500,
    ingredients: [
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.2 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 0.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.0 }
    ]
  },
  {
    id: 'bp_weap_cf227_s2',
    key: 'BP_CRAFT_WEAP_CF227_S2',
    name: 'CF-227 Badger Laser Repeater (S2)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon',
    grade: 'Standard',
    size: 2,
    craftTimeSeconds: 1400,
    description: 'Répéteur laser de référence pour les dogfights spatiaux.',
    marketEstimatedAUEC: 14200,
    ingredients: [
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.2 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 1.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.8 }
    ]
  },
  {
    id: 'bp_weap_cf337_s3',
    key: 'BP_CRAFT_WEAP_CF337_S3',
    name: 'CF-337 Panther Laser Repeater (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon',
    grade: 'Military',
    size: 3,
    craftTimeSeconds: 2200,
    description: 'Le canon laser polyvalent par excellence pour Gladius, Hornet et Sabre.',
    marketEstimatedAUEC: 22500,
    ingredients: [
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 3.5 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 2.4 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 2.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.8 }
    ]
  },
  {
    id: 'bp_weap_cf447_s4',
    key: 'BP_CRAFT_WEAP_CF447_S4',
    name: 'CF-447 Rhino Laser Repeater (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon',
    grade: 'Military Heavy',
    size: 4,
    craftTimeSeconds: 3800,
    description: 'Répéteur lourd S4 délivrant un barrage d\'énergie dévastateur (Vanguard, Corsair, Connie).',
    marketEstimatedAUEC: 45000,
    ingredients: [
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 6.0 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 4.2 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 5.0 }
    ]
  },
  {
    id: 'bp_weap_omnisky_ix_s3',
    key: 'BP_CRAFT_WEAP_OMNISKY_IX_S3',
    name: 'Omnisky IX Laser Cannon (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Cannon',
    subtype: 'Energy Weapon',
    grade: 'Precision Military',
    size: 3,
    craftTimeSeconds: 2400,
    description: 'Canon laser longue portée infligeant de lourds dégâts par salve.',
    marketEstimatedAUEC: 24000,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 3.6 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.4, isItem: true, itemQuantity: 40 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.4 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.0 }
    ]
  },
  {
    id: 'bp_weap_omnisky_xii_s4',
    key: 'BP_CRAFT_WEAP_OMNISKY_XII_S4',
    name: 'Omnisky XII Laser Cannon (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Cannon',
    subtype: 'Precision Military',
    grade: 'Military Heavy',
    size: 4,
    craftTimeSeconds: 4200,
    description: 'Canon laser S4 à puissance de perforation extrême pour le tir de précision.',
    marketEstimatedAUEC: 52000,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 6.5 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.8, isItem: true, itemQuantity: 80 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 7.5 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 5.5 }
    ]
  },
  {
    id: 'bp_weap_ad4b_s4',
    key: 'BP_CRAFT_WEAP_AD4B_S4',
    name: 'AD4B Ballistic Gatling (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Ballistic Gatling',
    subtype: 'Ballistic Weapon',
    grade: 'Heavy Ballistic',
    size: 4,
    craftTimeSeconds: 3900,
    description: 'Gatling balistique lourde avec réserve de munitions massive pénétrant les boucliers.',
    marketEstimatedAUEC: 48000,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 8.0 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 6.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 3.0 }
    ]
  },
  {
    id: 'bp_weap_ad5b_s5',
    key: 'BP_CRAFT_WEAP_AD5B_S5',
    name: 'AD5B Ballistic Gatling (S5)',
    category: 'armes_vaisseau',
    typeLabel: 'Ballistic Gatling',
    subtype: 'Ballistic Weapon',
    grade: 'Capital Ballistic',
    size: 5,
    craftTimeSeconds: 6800,
    description: 'La monstrueuse Gatling S5 conçue pour déchiqueter les coques de corvettes et vaisseaux capitaux.',
    marketEstimatedAUEC: 98000,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 16.0 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 12.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 9.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 6.5 }
    ]
  },
  {
    id: 'bp_weap_dist_xj3_s3',
    key: 'BP_CRAFT_WEAP_DIST_XJ3_S3',
    name: 'DR-Model-XJ3 Distortion Repeater (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Distortion Repeater',
    subtype: 'Distortion Weapon',
    grade: 'Tactical',
    size: 3,
    craftTimeSeconds: 2100,
    description: 'Arme tactique de distorsion coupant instantanément les générateurs et réacteurs ennemis.',
    marketEstimatedAUEC: 21000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 0.8 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 3.0 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 2.5 }
    ]
  },

  // ==========================================
  // 3. ARMES FPS (ASSAULT, SNIPERS, LMG, SMG, SHOTGUNS, PISTOLS, HEAVY)
  // ==========================================
  {
    id: 'bp_fps_p4ar',
    key: 'BP_CRAFT_FPS_P4AR',
    name: 'Fusil d\'Assaut Behring P4-AR',
    category: 'armes_fps',
    typeLabel: 'Assault Rifle',
    subtype: 'Ballistic Kinetic',
    grade: 'Military',
    craftTimeSeconds: 600,
    description: 'Le fusil d\'assaut 5.56mm standard de l\'UEE Marines, fiable et tout-terrain.',
    marketEstimatedAUEC: 3200,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.4 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_fps_gallant',
    key: 'BP_CRAFT_FPS_GALLANT',
    name: 'Fusil Laser Klaus & Werner Gallant',
    category: 'armes_fps',
    typeLabel: 'Assault Rifle',
    subtype: 'Energy Weapon',
    grade: 'Standard',
    craftTimeSeconds: 650,
    description: 'Fusil d\'assaut à rafales d\'énergie précis avec batterie à recharge rapide.',
    marketEstimatedAUEC: 3600,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 0.3 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.25 }
    ]
  },
  {
    id: 'bp_fps_karna',
    key: 'BP_CRAFT_FPS_KARNA',
    name: 'Fusil Plasma Kastak Arms Karna',
    category: 'armes_fps',
    typeLabel: 'Assault Rifle',
    subtype: 'Plasma Energy',
    grade: 'Heavy Infantry',
    craftTimeSeconds: 850,
    description: 'Fusil d\'assaut hybride tirant des charges de plasma surchauffé avec tir chargé secondaire.',
    marketEstimatedAUEC: 5400,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 0.4 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.1, isItem: true, itemQuantity: 10 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_fps_fs9_lmg',
    key: 'BP_CRAFT_FPS_FS9',
    name: 'Mitrailleuse Légère Behring FS-9 LMG',
    category: 'armes_fps',
    typeLabel: 'Light Machine Gun',
    subtype: 'Ballistic Kinetic',
    grade: 'Heavy Squad',
    craftTimeSeconds: 900,
    description: 'Mitrailleuse d\'escouade avec chargeur tambour de 120 coups pour tir de suppression.',
    marketEstimatedAUEC: 4800,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.8 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_fps_p6lr_sniper',
    key: 'BP_CRAFT_FPS_P6LR',
    name: 'Fusil de Précision Behring P6-LR Sniper',
    category: 'armes_fps',
    typeLabel: 'Sniper Rifle',
    subtype: 'Anti-Materiel Ballistic',
    grade: 'Special Forces',
    craftTimeSeconds: 1200,
    description: 'Fusil sniper lourd antimatière capable d\'abattre des cibles lourdement blindées à plus d\'un kilomètre.',
    marketEstimatedAUEC: 6800,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.6 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.15, isItem: true, itemQuantity: 15 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_fps_arrowhead_sniper',
    key: 'BP_CRAFT_FPS_ARROWHEAD',
    name: 'Sniper Laser Klaus & Werner Arrowhead',
    category: 'armes_fps',
    typeLabel: 'Sniper Rifle',
    subtype: 'Energy Sniper',
    grade: 'Precision',
    craftTimeSeconds: 1100,
    description: 'Fusil de sniper énergétique tirant des traits laser à vélocité quasi instantanée.',
    marketEstimatedAUEC: 6200,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 0.5 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_fps_c54_smg',
    key: 'BP_CRAFT_FPS_C54',
    name: 'Pistolet-Mitrailleur Gemini C54 SMG',
    category: 'armes_fps',
    typeLabel: 'Submachine Gun',
    subtype: 'Ballistic CQC',
    grade: 'Standard',
    craftTimeSeconds: 500,
    description: 'SMG compact à très haute cadence pour le combat en milieu clos (CQC à bord des épaves).',
    marketEstimatedAUEC: 2800,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.3 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.15 }
    ]
  },
  {
    id: 'bp_fps_devastator_shotgun',
    key: 'BP_CRAFT_FPS_DEVASTATOR',
    name: 'Fusil à Pompe Kastak Arms Devastator',
    category: 'armes_fps',
    typeLabel: 'Shotgun',
    subtype: 'Plasma Energy',
    grade: 'Heavy Assault',
    craftTimeSeconds: 700,
    description: 'Fusil à pompe à dispersion plasma capable de vaporiser un ennemi à courte portée.',
    marketEstimatedAUEC: 3900,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 0.35 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.3 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.08, isItem: true, itemQuantity: 8 }
    ]
  },
  {
    id: 'bp_fps_arclight_pistol',
    key: 'BP_CRAFT_FPS_ARCLIGHT',
    name: 'Pistolet Laser Klaus & Werner Arclight',
    category: 'armes_fps',
    typeLabel: 'Pistol',
    subtype: 'Energy Sidearm',
    grade: 'Civilian & Security',
    craftTimeSeconds: 300,
    description: 'L\'arme de poing énergétique la plus populaire de l\'Empire Uni de la Terre.',
    marketEstimatedAUEC: 1200,
    ingredients: [
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.15 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.1 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_fps_railgun_scourge',
    key: 'BP_CRAFT_FPS_SCOURGE_RAILGUN',
    name: 'Canon Électromagnétique Apocalypse Arms Scourge Railgun',
    category: 'armes_fps',
    typeLabel: 'Heavy Weapon',
    subtype: 'Anti-Vehicle Railgun',
    grade: 'Heavy Anti-Vehicle',
    craftTimeSeconds: 2400,
    description: 'Arme lourde d\'infanterie tirant des slugs accélérés par champ magnétique détruisant vaisseaux et véhicules blindés.',
    marketEstimatedAUEC: 18000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 0.5 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 1.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.5 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.2 }
    ]
  },
  {
    id: 'bp_fps_animus_missile',
    key: 'BP_CRAFT_FPS_ANIMUS_LAUNCHER',
    name: 'Lance-Missiles Apocalypse Arms Animus',
    category: 'armes_fps',
    typeLabel: 'Heavy Weapon',
    subtype: 'Anti-Air Missile Launcher',
    grade: 'Heavy Ordinance',
    craftTimeSeconds: 2200,
    description: 'Lance-missiles portable à guidage optique et radar pour neutraliser les vaisseaux en vol stationnaire.',
    marketEstimatedAUEC: 16500,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.4 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 1.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.8 }
    ]
  },

  // ==========================================
  // 4. ARMURES FPS & COMBINAISONS (DEFIANCE, ORC-MKX, CITADEL, SUITS)
  // ==========================================
  {
    id: 'bp_arm_heavy_defiance_helm',
    key: 'BP_CRAFT_ARM_DEFIANCE_HELM',
    name: 'Casque Lourd Defiance Helmet',
    category: 'armures',
    typeLabel: 'Armor Heavy',
    subtype: 'Helmet',
    grade: 'Heavy Combat (40% DR)',
    craftTimeSeconds: 450,
    description: 'Casque tactique lourd avec visière renforcée et filtration atmosphérique extrême.',
    marketEstimatedAUEC: 2200,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.3 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.15 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.2 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_core',
    key: 'BP_CRAFT_ARM_DEFIANCE_CORE',
    name: 'Plastron Lourd Defiance Core',
    category: 'armures',
    typeLabel: 'Armor Heavy',
    subtype: 'Torso Core',
    grade: 'Heavy Combat (40% DR)',
    craftTimeSeconds: 800,
    description: 'Plastron lourd multicouche absorbant 40% des impacts balistiques et lasers.',
    marketEstimatedAUEC: 4200,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.7 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.5 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.6 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_arms',
    key: 'BP_CRAFT_ARM_DEFIANCE_ARMS',
    name: 'Brassards Lourds Defiance Arms',
    category: 'armures',
    typeLabel: 'Armor Heavy',
    subtype: 'Arms',
    grade: 'Heavy Combat (40% DR)',
    craftTimeSeconds: 350,
    description: 'Protection intégrale des bras avec points d\'attache magnétiques pour chargeurs.',
    marketEstimatedAUEC: 1800,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.25 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_legs',
    key: 'BP_CRAFT_ARM_DEFIANCE_LEGS',
    name: 'Jambières Lourdes Defiance Legs',
    category: 'armures',
    typeLabel: 'Armor Heavy',
    subtype: 'Legs',
    grade: 'Heavy Combat (40% DR)',
    craftTimeSeconds: 400,
    description: 'Jambières renforcées intégrant des servomoteurs pour porter des charges lourdes.',
    marketEstimatedAUEC: 2000,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.35 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_arm_medium_orcmkx_core',
    key: 'BP_CRAFT_ARM_ORCMKX_CORE',
    name: 'Plastron Moyen ORC-mkX Core',
    category: 'armures',
    typeLabel: 'Armor Medium',
    subtype: 'Torso Core',
    grade: 'Medium Combat (30% DR)',
    craftTimeSeconds: 600,
    description: 'L\'armure moyenne la plus équilibrée entre mobilité et protection (30% réduction de dégâts).',
    marketEstimatedAUEC: 3100,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.4 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.5 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_arm_suit_novikov',
    key: 'BP_CRAFT_ARM_SUIT_NOVIKOV',
    name: 'Combinaison Environnementale Novikov',
    category: 'armures',
    typeLabel: 'Hazard Suit',
    subtype: 'Thermal Suit',
    grade: 'Extreme Cold (-200°C)',
    craftTimeSeconds: 950,
    description: 'Combinaison thermique intégrale spécialisée pour les lunes glacées comme microTech et Calliope.',
    marketEstimatedAUEC: 7500,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.8 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.6 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.5 }
    ]
  },
  {
    id: 'bp_arm_suit_pembroke',
    key: 'BP_CRAFT_ARM_SUIT_PEMBROKE',
    name: 'Combinaison Environnementale Pembroke',
    category: 'armures',
    typeLabel: 'Hazard Suit',
    subtype: 'Thermal Suit',
    grade: 'Extreme Heat (+250°C)',
    craftTimeSeconds: 950,
    description: 'Combinaison anti-chaleur conçue pour les forages sur Arial et dans le système Pyro.',
    marketEstimatedAUEC: 7500,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.9 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.7 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.5 }
    ]
  },
  {
    id: 'bp_arm_backpack_arden',
    key: 'BP_CRAFT_ARM_BACKPACK_ARDEN',
    name: 'Sac à Dos Lourd Arden-CL Backpack',
    category: 'armures',
    typeLabel: 'Backpack',
    subtype: 'Heavy Backpack (75k µSCU)',
    grade: 'Expedition',
    craftTimeSeconds: 300,
    description: 'Sac à dos grand volume pour transporter gemmes, chargeurs et caisses de butin.',
    marketEstimatedAUEC: 1500,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.3 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.2 }
    ]
  },

  // ==========================================
  // 5. OUTILS, CONSOMMABLES & GADGETS (MULTI-TOOL, TRACTEUR, MINAGE, SOINS, PIRATAGE)
  // ==========================================
  {
    id: 'bp_tool_pyro_multitool',
    key: 'BP_CRAFT_TOOL_MULTITOOL',
    name: 'Greycat Pyro RYT Multi-Tool',
    category: 'outils',
    typeLabel: 'Multi-Tool',
    subtype: 'Essential Tool',
    grade: 'Standard',
    craftTimeSeconds: 300,
    description: 'L\'outil indispensable pour tout citoyen : accepte modules tracteur, minage, découpe et soin.',
    marketEstimatedAUEC: 1200,
    ingredients: [
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.1 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_tool_mod_tractor',
    key: 'BP_CRAFT_TOOL_MOD_TRACTOR',
    name: 'Module Rayon Tracteur TruHold',
    category: 'outils',
    typeLabel: 'TractorBeam',
    subtype: 'Multi-Tool Attachment',
    grade: 'Standard',
    craftTimeSeconds: 200,
    description: 'Accessoire rayon tracteur pour déplacer caisses, minerais et conteneurs de cargaison.',
    marketEstimatedAUEC: 800,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 0.05 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.1 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.08 }
    ]
  },
  {
    id: 'bp_tool_mod_salvage_cambio',
    key: 'BP_CRAFT_TOOL_MOD_SALVAGE',
    name: 'Module Recyclage & Réparation Cambio-SRT',
    category: 'outils',
    typeLabel: 'Salvage Tool',
    subtype: 'Multi-Tool Attachment',
    grade: 'Standard',
    craftTimeSeconds: 250,
    description: 'Embout pour décaper les coques de vaisseaux et réparer les blindages avec du RMC.',
    marketEstimatedAUEC: 950,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.06 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.12 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_tool_mod_mining_orebit',
    key: 'BP_CRAFT_TOOL_MOD_MINING_OREBIT',
    name: 'Module Minier OreBit pour Multi-Tool',
    category: 'outils',
    typeLabel: 'Mining Head',
    subtype: 'Multi-Tool Attachment',
    grade: 'Standard',
    craftTimeSeconds: 220,
    description: 'Embout laser de fracturation pour gemmes FPS (Hadanite, Dolivine, Aphorite, Janalite).',
    marketEstimatedAUEC: 850,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.08 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 0.06 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_tool_gadget_boremax',
    key: 'BP_CRAFT_MINING_GADGET_BOREMAX',
    name: 'Gadget Minier BoreMax',
    category: 'outils',
    typeLabel: 'Mining Modifier',
    subtype: 'Deployable Gadget',
    grade: 'Pro Mining',
    craftTimeSeconds: 400,
    description: 'Gadget à fixer sur les gisements récalcitrants pour augmenter la zone verte de fracture de 40%.',
    marketEstimatedAUEC: 2500,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.2 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.15 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.25 }
    ]
  },
  {
    id: 'bp_tool_gadget_sabir21',
    key: 'BP_CRAFT_MINING_GADGET_SABIR',
    name: 'Gadget Minier Sabir 21',
    category: 'outils',
    typeLabel: 'Mining Modifier',
    subtype: 'Deployable Gadget',
    grade: 'Precision Mining',
    craftTimeSeconds: 420,
    description: 'Gadget réduisant de 75% l\'instabilité thermique des roches hautement volatiles (Quantainium).',
    marketEstimatedAUEC: 2800,
    ingredients: [
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.3 },
      { resourceId: 'beryl', resourceName: 'Beryl', quantitySCU: 0.2 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.25 }
    ]
  },
  {
    id: 'bp_tool_medpen_hemocore',
    key: 'BP_CRAFT_CONSUMABLE_MEDPEN',
    name: 'Injecteur Médical HemoCore MedPen (Lot de 5)',
    category: 'outils',
    typeLabel: 'Consumable',
    subtype: 'Medical',
    grade: 'Standard',
    craftTimeSeconds: 120,
    description: 'Injecteur d\'urgence restaurant la santé et stoppant les hémorragies au combat.',
    marketEstimatedAUEC: 500,
    ingredients: [
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.05 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.04 }
    ]
  },
  {
    id: 'bp_tool_tigerclaw',
    key: 'BP_CRAFT_TOOL_TIGERCLAW',
    name: 'Puce Cryptographique Tigerclaw (Hacking)',
    category: 'outils',
    typeLabel: 'Cryptokey',
    subtype: 'Hacking Device',
    grade: 'Infiltration',
    craftTimeSeconds: 500,
    description: 'Puce d\'infiltration utilisée pour effacer le Statut Criminel (CrimeStat) dans les Security Posts (SP-Kareah).',
    marketEstimatedAUEC: 4500,
    ingredients: [
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 0.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.3 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.15 }
    ]
  },

  // ==========================================
  // 6. COMPOSANTS INDUSTRIELS, CONTENEURS & MATÉRIAUX (1 SCU à 32 SCU, ORE PODS, RMC)
  // ==========================================
  {
    id: 'bp_mat_scu_container_1',
    key: 'BP_CRAFT_CONTAINER_1SCU',
    name: 'Boîte de Fret Sécurisée (1 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Container',
    subtype: 'Cargo Box',
    grade: 'Industrial',
    craftTimeSeconds: 180,
    description: 'Conteneur métallique 1 SCU standard magnétisable sur grille cargo avec serrure codée.',
    marketEstimatedAUEC: 950,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.6 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_mat_scu_container_2',
    key: 'BP_CRAFT_CONTAINER_2SCU',
    name: 'Caisse de Fret Standard (2 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Container',
    subtype: 'Cargo Box',
    grade: 'Industrial',
    craftTimeSeconds: 240,
    description: 'Caisse cargo moyenne 2 SCU idéale pour stocker des minerais raffinés ou armes en soute.',
    marketEstimatedAUEC: 1800,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 1.1 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.7 }
    ]
  },
  {
    id: 'bp_mat_scu_container_8',
    key: 'BP_CRAFT_CONTAINER_8SCU',
    name: 'Conteneur Cargo Lourd (8 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Container',
    subtype: 'Cargo Box',
    grade: 'Industrial Heavy',
    craftTimeSeconds: 600,
    description: 'Grande caisse de fret de 8 SCU avec renforts d\'amarrage pour minerais raffinés et pièces.',
    marketEstimatedAUEC: 6200,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 3.5 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 2.5 }
    ]
  },
  {
    id: 'bp_mat_scu_container_16',
    key: 'BP_CRAFT_CONTAINER_16SCU',
    name: 'Grand Conteneur Cargo (16 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Container',
    subtype: 'Cargo Box',
    grade: 'Industrial SuperHeavy',
    craftTimeSeconds: 900,
    description: 'Conteneur standardisé 16 SCU compatible avec les ascenseurs de fret (Freight Elevators 3.24+).',
    marketEstimatedAUEC: 11800,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 6.5 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 4.5 }
    ]
  },
  {
    id: 'bp_mat_scu_container_32',
    key: 'BP_CRAFT_CONTAINER_32SCU',
    name: 'Conteneur Cargo Géant (32 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Container',
    subtype: 'Cargo Box',
    grade: 'Mass Transport',
    craftTimeSeconds: 1500,
    description: 'Le plus grand conteneur de fret standard du jeu (32 SCU) pour les transporteurs Taurus, C2 Hercules et Hull-C.',
    marketEstimatedAUEC: 22000,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 7.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 12.0 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_mat_ore_pod_32',
    key: 'BP_CRAFT_ORE_POD_32',
    name: 'Caisson Minier Détachable MISC Ore Pod (32 SCU)',
    category: 'composants_industriels',
    typeLabel: 'Mining Pod',
    subtype: 'Detachable Ore Pod',
    grade: 'Mining Industrial',
    craftTimeSeconds: 1800,
    description: 'Poche de stockage minier détachable pour MISC Prospector permettant d\'éjecter et remplacer sa soute pleine dans l\'espace.',
    marketEstimatedAUEC: 28000,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 6.0 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 8.0 }
    ]
  }
];

export const BLUEPRINT_CATEGORIES: { key: BlueprintCategory; label: string; icon: string; description: string }[] = [
  { key: 'vaisseau', label: 'Vaisseaux & Composants', icon: 'Rocket', description: 'Générateurs, boucliers, propulseurs quantiques, refroidisseurs, têtes minières' },
  { key: 'armes_vaisseau', label: 'Armes de Vaisseau', icon: 'Crosshair', description: 'Répéteurs lasers, canons lourds, gatlings balistiques, distorsion' },
  { key: 'armes_fps', label: 'Armes FPS', icon: 'Sword', description: 'Fusils d\'assaut, mitrailleuses lourdes, snipers, SMG, railguns' },
  { key: 'armures', label: 'Armures & Combinaisons', icon: 'Shield', description: 'Casques, plastrons, brassards, jambières, tenues thermiques, sacs' },
  { key: 'outils', label: 'Outils & Équipements', icon: 'Wrench', description: 'Multi-tool, modules tracteurs, gadgets de minage, soins, hacking' },
  { key: 'composants_industriels', label: 'Matériaux & Cargo', icon: 'Box', description: 'Boîtes de fret 1 à 32 SCU, caissons miniers Ore Pods, plaques de blindage' }
];
