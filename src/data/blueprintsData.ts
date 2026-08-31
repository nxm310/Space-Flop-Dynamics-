import { Blueprint } from '../types';

export const STAR_CITIZEN_BLUEPRINTS: Blueprint[] = [
  // ==========================================
  // VAISSEAU & COMPOSANTS
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
    id: 'bp_qd_crossfield_s2',
    key: 'BP_CRAFT_QD_CROSSFIELD_S2',
    name: 'Crossfield Quantum Drive (S2)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3600,
    description: 'Moteur militaire S2 de référence pour Cutlass, Freelancer, Connie.',
    marketEstimatedAUEC: 86000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 4.8 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 3.2 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 2.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 6.0 }
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
    description: 'Générateur de bouclier militaire à rechargement rapide.',
    marketEstimatedAUEC: 19500,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 1.6 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.0 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.8 }
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
    description: 'Bouclier militaire moyen à régénération ultra rapide.',
    marketEstimatedAUEC: 48000,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 3.8 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 2.9 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 1.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.5 }
    ]
  },
  {
    id: 'bp_cooler_js300_s1',
    key: 'BP_CRAFT_COOLER_JS300_S1',
    name: 'JS-300 Power Plant (S1)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1600,
    description: 'Centrale énergétique compacte militaire à très haut débit.',
    marketEstimatedAUEC: 22000,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.4 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 1.0 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 1.5 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 2.2 }
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
    description: 'Refroidisseur industriel robuste à très grande capacité de dissipation thermique.',
    marketEstimatedAUEC: 16000,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 1.1 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.4 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 3.5 }
    ]
  },

  // ==========================================
  // ARMES VAISSEAU
  // ==========================================
  {
    id: 'bp_weap_omnisky_ix_s3',
    key: 'BP_CRAFT_AMRS_LaserCannon_S3',
    name: 'Omnisky IX Laser Cannon (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Gun',
    subtype: 'Laser Cannon',
    grade: '1',
    size: 3,
    craftTimeSeconds: 2200,
    description: 'Canon laser Amon & Reese haute précision et dégâts alpha élevés.',
    marketEstimatedAUEC: 17500,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 1.8 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.2, isItem: true, itemQuantity: 20 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.2 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 1.5 }
    ]
  },
  {
    id: 'bp_weap_omnisky_xii_s4',
    key: 'BP_CRAFT_AMRS_LaserCannon_S4',
    name: 'Omnisky XII Laser Cannon (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Gun',
    subtype: 'Laser Cannon',
    grade: '1',
    size: 4,
    craftTimeSeconds: 3400,
    description: 'Canon laser S4 dévastateur pour vaisseaux de combat moyens et lourds.',
    marketEstimatedAUEC: 38000,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 2.8 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.41, isItem: true, itemQuantity: 41 },
      { resourceId: 'dolivine', resourceName: 'Dolivine', quantitySCU: 0.41, isItem: true, itemQuantity: 41 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.5 }
    ]
  },
  {
    id: 'bp_weap_omnisky_xv_s5',
    key: 'BP_CRAFT_AMRS_LaserCannon_S5',
    name: 'Omnisky XV Laser Cannon (S5)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Gun',
    subtype: 'Laser Cannon',
    grade: '1',
    size: 5,
    craftTimeSeconds: 5160,
    description: 'Arme lourde S5 pour Connie, 600i, Vanguard et vaisseaux de ligne.',
    marketEstimatedAUEC: 75000,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 3.74 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.75, isItem: true, itemQuantity: 75 },
      { resourceId: 'dolivine', resourceName: 'Dolivine', quantitySCU: 0.75, isItem: true, itemQuantity: 75 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 6.0 }
    ]
  },
  {
    id: 'bp_weap_cf337_panther_s3',
    key: 'BP_CRAFT_KLWE_LaserRepeater_S3',
    name: 'CF-337 Panther Laser Repeater (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Gun',
    subtype: 'Laser Repeater',
    grade: '1',
    size: 3,
    craftTimeSeconds: 1900,
    description: 'Répéteur laser Klaus & Werner S3 standard pour combat rapproché et dogfight.',
    marketEstimatedAUEC: 16000,
    ingredients: [
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 1.5 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.5 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 1.2 }
    ]
  },
  {
    id: 'bp_weap_ad4b_s4',
    key: 'BP_CRAFT_GATS_BallisticGatling_S4',
    name: 'AD4B Ballistic Gatling (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Gun',
    subtype: 'Ballistic Gatling',
    grade: '1',
    size: 4,
    craftTimeSeconds: 3200,
    description: 'Mitrailleuse lourde balistique S4 perçante avec grande réserve de munitions.',
    marketEstimatedAUEC: 42000,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 4.2 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 2.0 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 5.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.8 }
    ]
  },
  {
    id: 'bp_weap_helix_s1',
    key: 'BP_CRAFT_MINING_HELIX_S1',
    name: 'Helix I Mining Laser (S1)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Mining',
    subtype: 'Mining Laser Head',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2800,
    description: 'Tête de minage Prospector la plus puissante pour briser les roches les plus dures.',
    marketEstimatedAUEC: 45000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 2.2 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.8 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.3, isItem: true, itemQuantity: 30 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.5 }
    ]
  },
  {
    id: 'bp_weap_helix_s2',
    key: 'BP_CRAFT_MINING_HELIX_S2',
    name: 'Helix II Mining Laser (S2)',
    category: 'armes_vaisseau',
    typeLabel: 'Weapon Mining',
    subtype: 'Mining Laser Head',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 4200,
    description: 'Tête de minage S2 pour tourelle ARGO MOLE.',
    marketEstimatedAUEC: 110000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 4.5 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 3.5 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.6, isItem: true, itemQuantity: 60 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 3.0 }
    ]
  },

  // ==========================================
  // ARMES FPS & ÉQUIPEMENTS
  // ==========================================
  {
    id: 'bp_fps_p4ar',
    key: 'BP_CRAFT_FPS_P4AR',
    name: 'Fusil d\'assaut Behring P4-AR',
    category: 'armes_fps',
    typeLabel: 'FPS Weapon',
    subtype: 'Assault Rifle',
    grade: 'Standard',
    craftTimeSeconds: 450,
    description: 'Fusil d\'assaut balistique polyvalent 5.56mm, cadence modulable et grande fiabilité.',
    marketEstimatedAUEC: 4200,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.4 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.2 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_fps_fs9',
    key: 'BP_CRAFT_FPS_FS9',
    name: 'Mitrailleuse Behring FS-9 LMG',
    category: 'armes_fps',
    typeLabel: 'FPS Weapon',
    subtype: 'LMG',
    grade: 'Military',
    craftTimeSeconds: 700,
    description: 'Mitrailleuse lourde d\'escouade, chargeur tambour de 120 cartouches, très prisée pour les bunkers.',
    marketEstimatedAUEC: 7800,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.6 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_fps_custodian',
    key: 'BP_CRAFT_FPS_CUSTODIAN',
    name: 'SMG Kastak Arms Custodian',
    category: 'armes_fps',
    typeLabel: 'FPS Weapon',
    subtype: 'Energy SMG',
    grade: 'Standard',
    craftTimeSeconds: 500,
    description: 'Pistolet-mitrailleur énergétique à cadence folle avec batterie haute capacité.',
    marketEstimatedAUEC: 4800,
    ingredients: [
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 0.3 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.4 },
      { resourceId: 'aphorite', resourceName: 'Aphorite', quantitySCU: 0.1, isItem: true, itemQuantity: 10 }
    ]
  },
  {
    id: 'bp_fps_arrowhead',
    key: 'BP_CRAFT_FPS_ARROWHEAD',
    name: 'Fusil de Sniper Klaus & Werner Arrowhead',
    category: 'armes_fps',
    typeLabel: 'FPS Weapon',
    subtype: 'Energy Sniper',
    grade: 'Precision',
    craftTimeSeconds: 850,
    description: 'Sniper énergétique longue portée à tir chargé pour élimination instantanée à travers armures.',
    marketEstimatedAUEC: 8900,
    ingredients: [
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 0.5 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.4 },
      { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.15, isItem: true, itemQuantity: 15 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_fps_lh86',
    key: 'BP_CRAFT_FPS_LH86',
    name: 'Pistolet Kastak Arms LH86',
    category: 'armes_fps',
    typeLabel: 'FPS Weapon',
    subtype: 'Ballistic Pistol',
    grade: 'Standard',
    craftTimeSeconds: 250,
    description: 'Arme de poing balistique compacte et robuste, excellente arme secondaire.',
    marketEstimatedAUEC: 1400,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.15 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_fps_mag_p4ar',
    key: 'BP_CRAFT_FPS_MAG_P4AR',
    name: 'Chargeur P4-AR (30 coups)',
    category: 'armes_fps',
    typeLabel: 'Weapon Attachment',
    subtype: 'Magazine',
    grade: 'Standard',
    craftTimeSeconds: 60,
    description: 'Chargeur 5.56 standard pour fusil d\'assaut P4-AR.',
    marketEstimatedAUEC: 250,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.05 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.02 }
    ]
  },
  {
    id: 'bp_fps_mag_fs9',
    key: 'BP_CRAFT_FPS_MAG_FS9',
    name: 'Chargeur FS-9 Tambour (120 coups)',
    category: 'armes_fps',
    typeLabel: 'Weapon Attachment',
    subtype: 'Magazine',
    grade: 'Standard',
    craftTimeSeconds: 90,
    description: 'Chargeur lourd à haute capacité pour mitrailleuse FS-9.',
    marketEstimatedAUEC: 550,
    ingredients: [
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.12 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.05 }
    ]
  },

  // ==========================================
  // ARMURES & COMBINAISONS
  // ==========================================
  {
    id: 'bp_arm_heavy_defiance_core',
    key: 'BP_CRAFT_ARM_DEFIANCE_CORE',
    name: 'Plastron Lourd Defiance Core',
    category: 'armures',
    typeLabel: 'Torso Armor',
    subtype: 'Heavy Armor (40% Damage Red.)',
    grade: 'Military Heavy',
    craftTimeSeconds: 900,
    description: 'Blindage thoracique lourd offrant une réduction de dégâts maximale de 40%.',
    marketEstimatedAUEC: 6500,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.6 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.8 },
      { resourceId: 'rmc', resourceName: 'Recycled Material Composite', quantitySCU: 1.0 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_helm',
    key: 'BP_CRAFT_ARM_DEFIANCE_HELM',
    name: 'Casque Lourd Defiance Helmet',
    category: 'armures',
    typeLabel: 'Helmet Armor',
    subtype: 'Heavy Armor',
    grade: 'Military Heavy',
    craftTimeSeconds: 600,
    description: 'Casque intégral renforcé avec filtration d\'atmosphère extrême et HUD tactique.',
    marketEstimatedAUEC: 3800,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.3 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.2 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_arms',
    key: 'BP_CRAFT_ARM_DEFIANCE_ARMS',
    name: 'Brassards Lourds Defiance Arms',
    category: 'armures',
    typeLabel: 'Arm Armor',
    subtype: 'Heavy Armor',
    grade: 'Military Heavy',
    craftTimeSeconds: 500,
    description: 'Protection d\'avant-bras et d\'épaules blindée composite.',
    marketEstimatedAUEC: 2900,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.25 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.35 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_legs',
    key: 'BP_CRAFT_ARM_DEFIANCE_LEGS',
    name: 'Jambières Lourdes Defiance Legs',
    category: 'armures',
    typeLabel: 'Leg Armor',
    subtype: 'Heavy Armor',
    grade: 'Military Heavy',
    craftTimeSeconds: 550,
    description: 'Jambières blindées articulées avec fixation de magnétisme au sol.',
    marketEstimatedAUEC: 3100,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.3 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.5 }
    ]
  },
  {
    id: 'bp_arm_heavy_backpack_novikov',
    key: 'BP_CRAFT_ARM_BACKPACK_NOVIKOV',
    name: 'Sac à dos d\'Exploration Novikov (Heavy)',
    category: 'armures',
    typeLabel: 'Backpack',
    subtype: 'Heavy Backpack (120 µSCU)',
    grade: 'Explorer Heavy',
    craftTimeSeconds: 800,
    description: 'Sac à dos ultra résistant pour conditions extrêmes et stockage minier intensif.',
    marketEstimatedAUEC: 5200,
    ingredients: [
      { resourceId: 'rmc', resourceName: 'Recycled Material Composite', quantitySCU: 0.8 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.3 }
    ]
  },

  // ==========================================
  // OUTILS & ÉQUIPEMENTS
  // ==========================================
  {
    id: 'bp_tool_multitool_pyro',
    key: 'BP_CRAFT_TOOL_PYRO_MULTITOOL',
    name: 'Outil Multifonction Greycat Pyro RYT Multi-Tool',
    category: 'outils',
    typeLabel: 'Tool',
    subtype: 'Hand Tool',
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
    id: 'bp_tool_mod_mining_orebit',
    key: 'BP_CRAFT_TOOL_MOD_MINING_OREBIT',
    name: 'Module Minier OreBit pour Multi-Tool',
    category: 'outils',
    typeLabel: 'Weapon Mining',
    subtype: 'Multi-Tool Attachment',
    grade: 'Standard',
    craftTimeSeconds: 220,
    description: 'Embout laser de fracturation pour gemmes FPS (Hadanite, Dolivine, Aphorite).',
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
      { resourceId: 'rmc', resourceName: 'Recycled Material Composite', quantitySCU: 0.05 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.02 }
    ]
  },

  // ==========================================
  // COMPOSANTS INDUSTRIELS & MATÉRIAUX
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
    description: 'Conteneur métallique 1 SCU standard magnétisable sur grille cargo.',
    marketEstimatedAUEC: 950,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.6 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.4 }
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
  }
];

export const BLUEPRINT_CATEGORIES: { key: import('../types').BlueprintCategory; label: string; icon: string; description: string }[] = [
  { key: 'vaisseau', label: 'Vaisseau & Composants', icon: 'Rocket', description: 'Générateurs, boucliers, propulseurs quantiques, refroidisseurs' },
  { key: 'armes_vaisseau', label: 'Armes de Vaisseau', icon: 'Crosshair', description: 'Canons lasers, répéteurs, mitrailleuses balistiques, têtes de minage' },
  { key: 'armes_fps', label: 'Armes & FPS', icon: 'Sword', description: 'Fusils d\'assaut, mitrailleuses lourdes, snipers, chargeurs' },
  { key: 'armures', label: 'Armures & Combinaisons', icon: 'Shield', description: 'Casques, plastrons, brassards, jambières, sacs à dos' },
  { key: 'outils', label: 'Outils & Équipements', icon: 'Wrench', description: 'Multi-tool, modules tracteurs, gadgets de minage, soins' },
  { key: 'composants_industriels', label: 'Matériaux & Cargo', icon: 'Box', description: 'Boîtes de fret 1 à 32 SCU, plaques composites, pièces détachées' }
];
