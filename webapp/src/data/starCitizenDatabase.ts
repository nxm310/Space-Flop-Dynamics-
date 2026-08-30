export interface SCItemDefinition {
  id: string;
  name: string;
  category: 'Armement Vaisseau' | 'Composant Vaisseau' | 'Arme FPS' | 'Armure FPS' | 'Utilitaire & Équipement' | 'Minerai Raffiné' | 'Minerai Brut' | 'Gemme FPS' | 'Salvage & Matériaux';
  subCategory?: string;
  defaultUnit: 'SCU' | 'cSCU' | 'µSCU' | 'Unités';
  unitValueUEC?: number;
  description?: string;
  manufacturer?: string;
  suggestedMaterials?: { name: string; quantity: number; unit: string }[];
  suggestedCraftTimeMinutes?: number;
}

export const STAR_CITIZEN_DATABASE: SCItemDefinition[] = [
  // ==========================================
  // --- MINERAIS RAFFINÉS ---
  // ==========================================
  {
    id: 'sc-min-01',
    name: 'Quantainium Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Carburant Quantum & Exotique',
    defaultUnit: 'SCU',
    unitValueUEC: 88000,
    description: 'Matériau instable hautement énergétique indispensable aux moteurs Quantum et composants militaires.'
  },
  {
    id: 'sc-min-02',
    name: 'Bexalite Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Minerai Rare',
    defaultUnit: 'SCU',
    unitValueUEC: 44000,
    description: 'Minéral lourd utilisé dans les supraconducteurs et les générateurs de bouclier de pointe.'
  },
  {
    id: 'sc-min-03',
    name: 'Taranite Raffinée',
    category: 'Minerai Raffiné',
    subCategory: 'Minerai Rare',
    defaultUnit: 'SCU',
    unitValueUEC: 32000,
    description: 'Composé cristallin réfractaire pour les blindages thermiques et canons laser haute puissance.'
  },
  {
    id: 'sc-min-04',
    name: 'Laranite Raffinée',
    category: 'Minerai Raffiné',
    subCategory: 'Minerai Précieux',
    defaultUnit: 'SCU',
    unitValueUEC: 28500,
    description: 'Métal rare très recherché pour l’avionique spatiale et les alliages aérospatiaux.'
  },
  {
    id: 'sc-min-05',
    name: 'Agricium Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Minerai Industriel',
    defaultUnit: 'SCU',
    unitValueUEC: 25000,
    description: 'Élément supraconducteur essentiel pour les bobines électromagnétiques et les armes laser.'
  },
  {
    id: 'sc-min-06',
    name: 'Hephaestanite Raffinée',
    category: 'Minerai Raffiné',
    subCategory: 'Minerai Volcanique',
    defaultUnit: 'SCU',
    unitValueUEC: 15500,
    description: 'Minéral pyrogène utilisé dans la fabrication d’explosifs et de générateurs thermiques.'
  },
  {
    id: 'sc-min-07',
    name: 'Gold (Or Raffiné)',
    category: 'Minerai Raffiné',
    subCategory: 'Métal Précieux',
    defaultUnit: 'SCU',
    unitValueUEC: 22000,
    description: 'Excellente conductivité électrique pour les circuits imprimés et connecteurs d’armes.'
  },
  {
    id: 'sc-min-08',
    name: 'Titanium Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Métal Industriel Lourd',
    defaultUnit: 'SCU',
    unitValueUEC: 8200,
    description: 'Métal structural à haute résistance pour coques de vaisseaux et armures lourdes.'
  },
  {
    id: 'sc-min-09',
    name: 'Beryl Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Silicate',
    defaultUnit: 'SCU',
    unitValueUEC: 4200,
    description: 'Matériau d’isolation thermique et optique pour capteurs.'
  },
  {
    id: 'sc-min-10',
    name: 'Copper (Cuivre Raffiné)',
    category: 'Minerai Raffiné',
    subCategory: 'Métal Conducteur',
    defaultUnit: 'SCU',
    unitValueUEC: 4500,
    description: 'Composant de base pour les faisceaux de câblage et circuits électriques.'
  },
  {
    id: 'sc-min-11',
    name: 'Tungsten Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Métal Réfractaire',
    defaultUnit: 'SCU',
    unitValueUEC: 3800,
    description: 'Noyau lourd pour projectiles balistiques perforants et pièces de moteur.'
  },
  {
    id: 'sc-min-12',
    name: 'Diamond (Diamant Industriel)',
    category: 'Minerai Raffiné',
    subCategory: 'Carbone Cristallin',
    defaultUnit: 'SCU',
    unitValueUEC: 6800,
    description: 'Utilisé pour les têtes de forage et le renforcement des verres de cockpit.'
  },
  {
    id: 'sc-min-13',
    name: 'Corundum Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Oxyde d’Aluminium',
    defaultUnit: 'SCU',
    unitValueUEC: 2500,
    description: 'Abrasif industriel et céramique de blindage.'
  },
  {
    id: 'sc-min-14',
    name: 'Quartz Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Silicate',
    defaultUnit: 'SCU',
    unitValueUEC: 1800,
    description: 'Composant pour les oscillateurs et les résonateurs de fréquence.'
  },
  {
    id: 'sc-min-15',
    name: 'Aluminum Raffiné',
    category: 'Minerai Raffiné',
    subCategory: 'Métal Léger',
    defaultUnit: 'SCU',
    unitValueUEC: 1200,
    description: 'Alliage léger pour composants secondaires.'
  },

  // ==========================================
  // --- SALVAGE & MATÉRIAUX ---
  // ==========================================
  {
    id: 'sc-sal-01',
    name: 'RMC (Recycled Material Composite)',
    category: 'Salvage & Matériaux',
    defaultUnit: 'SCU',
    unitValueUEC: 14500,
    description: 'Matériau composite de coque recyclé via Vulture ou Reclaimer.'
  },
  {
    id: 'sc-sal-02',
    name: 'Construction Materials (Matériaux de Structure)',
    category: 'Salvage & Matériaux',
    defaultUnit: 'SCU',
    unitValueUEC: 7500,
    description: 'Composants structurels compactés issus du désossage de vaisseaux.'
  },
  {
    id: 'sc-sal-03',
    name: 'Superconducteurs Composite',
    category: 'Salvage & Matériaux',
    defaultUnit: 'SCU',
    unitValueUEC: 25000,
    description: 'Alliage récupéré sur les épaves militaires.'
  },

  // ==========================================
  // --- GEMMES FPS ---
  // ==========================================
  {
    id: 'sc-gem-01',
    name: 'Hadanite (Gemme)',
    category: 'Gemme FPS',
    defaultUnit: 'cSCU',
    unitValueUEC: 275,
    description: 'Gemme minable à la main ou en ROC, très forte valeur énergétique.'
  },
  {
    id: 'sc-gem-02',
    name: 'Aphorite (Gemme)',
    category: 'Gemme FPS',
    defaultUnit: 'cSCU',
    unitValueUEC: 152
  },
  {
    id: 'sc-gem-03',
    name: 'Dolivine (Gemme)',
    category: 'Gemme FPS',
    defaultUnit: 'cSCU',
    unitValueUEC: 130
  },
  {
    id: 'sc-gem-04',
    name: 'Janalite (Gemme Légendaire)',
    category: 'Gemme FPS',
    defaultUnit: 'cSCU',
    unitValueUEC: 2600,
    description: 'Gemme ultra-rare trouvée dans les grottes profondes.'
  },

  // ==========================================
  // --- ARMEMENT DE VAISSEAU (SIZE 1 À 7) ---
  // ==========================================
  {
    id: 'sc-bp-w01',
    name: 'Behring S7 Laser Cannon (Omnisky)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 145000,
    suggestedCraftTimeMinutes: 50,
    description: 'Canon laser lourd taille 7 pour vaisseaux capitaux et corvettes.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 18, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 28, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 45, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 20, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w02',
    name: 'Klaus & Werner CF-337 Panther Laser Repeater (Size 3)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 48000,
    suggestedCraftTimeMinutes: 25,
    description: 'Répéteur laser taille 3 de référence pour chasseurs légers et moyens.',
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 6, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w03',
    name: 'Klaus & Werner CF-447 Rhino Laser Repeater (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 78000,
    suggestedCraftTimeMinutes: 35,
    description: 'Répéteur laser lourd taille 4 pour chasseurs lourds et canonnières.',
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 14, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 22, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 6, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w04',
    name: 'Klaus & Werner CF-557 Galdiseen Laser Repeater (Size 5)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 115000,
    suggestedCraftTimeMinutes: 45,
    description: 'Répéteur laser taille 5 dévastateur contre les grandes cibles.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 10, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 20, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 30, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w05',
    name: 'Behring AD4B Ballistic Gatling (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 85000,
    suggestedCraftTimeMinutes: 30,
    description: 'Gatling balistique taille 4 à cadence infernale et forte pénétration de bouclier.',
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 25, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 20, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 15, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w06',
    name: 'Behring AD5B Ballistic Gatling (Size 5)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 135000,
    suggestedCraftTimeMinutes: 50,
    description: 'Gatling balistique taille 5 surpuissante équipée sur Corsair et Redeemer.',
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 40, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 35, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 10, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w07',
    name: 'Apocalypse Arms Revenant Ballistic Gatling (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Apocalypse Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 82000,
    suggestedCraftTimeMinutes: 30,
    description: 'Canon rotatif balistique lourd taille 4.',
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 22, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 18, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w08',
    name: 'Amon & Reese Omnisky IX Laser Cannon (Size 3)',
    category: 'Armement Vaisseau',
    manufacturer: 'Amon & Reese Co.',
    defaultUnit: 'Unités',
    unitValueUEC: 52000,
    suggestedCraftTimeMinutes: 25,
    description: 'Canon laser haute vélocité taille 3 pour tirs de précision.',
    suggestedMaterials: [
      { name: 'Taranite Raffinée', quantity: 8, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 6, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w09',
    name: 'Amon & Reese Omnisky XII Laser Cannon (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Amon & Reese Co.',
    defaultUnit: 'Unités',
    unitValueUEC: 84000,
    suggestedCraftTimeMinutes: 35,
    description: 'Canon laser taille 4 à longue portée et gros dégâts alpha.',
    suggestedMaterials: [
      { name: 'Taranite Raffinée', quantity: 14, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 18, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-w10',
    name: 'Gallenson Tactical Tarantula GT-870 Ballistic Cannon (Size 3)',
    category: 'Armement Vaisseau',
    manufacturer: 'Gallenson Tactical Systems',
    defaultUnit: 'Unités',
    unitValueUEC: 46000,
    suggestedCraftTimeMinutes: 20,
    description: 'Canon balistique taille 3 semi-automatique percutant.',
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' }
    ]
  },

  // ==========================================
  // --- COMPOSANTS DE VAISSEAU ---
  // ==========================================
  {
    id: 'sc-bp-c01',
    name: 'Générateur de Bouclier FR-86 (Size 3 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Générateur de Bouclier',
    manufacturer: 'Basilisk Armor',
    defaultUnit: 'Unités',
    unitValueUEC: 190000,
    suggestedCraftTimeMinutes: 60,
    description: 'Bouclier lourd taille 3 à régénération instantanée de grade militaire.',
    suggestedMaterials: [
      { name: 'Laranite Raffinée', quantity: 20, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 14, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 30, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c02',
    name: 'Générateur de Bouclier FR-76 (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Générateur de Bouclier',
    manufacturer: 'Basilisk Armor',
    defaultUnit: 'Unités',
    unitValueUEC: 98000,
    suggestedCraftTimeMinutes: 40,
    description: 'Bouclier moyen taille 2 militaire, régénération ultra-rapide.',
    suggestedMaterials: [
      { name: 'Laranite Raffinée', quantity: 10, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 6, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 15, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c03',
    name: 'Générateur de Bouclier FR-66 (Size 1 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Générateur de Bouclier',
    manufacturer: 'Basilisk Armor',
    defaultUnit: 'Unités',
    unitValueUEC: 48000,
    suggestedCraftTimeMinutes: 20,
    description: 'Bouclier léger taille 1 militaire pour intercepteurs et chasseurs légers.',
    suggestedMaterials: [
      { name: 'Laranite Raffinée', quantity: 4, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 3, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 8, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c04',
    name: 'Quantum Drive Crossfield (Size 2 Militaire Rapide)',
    category: 'Composant Vaisseau',
    subCategory: 'Moteur Quantum Drive',
    manufacturer: 'RSI Components',
    defaultUnit: 'Unités',
    unitValueUEC: 260000,
    suggestedCraftTimeMinutes: 75,
    description: 'Le moteur de saut militaire de référence pour traverser Stanton et Pyro à vitesse maximale.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 30, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 10, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c05',
    name: 'Quantum Drive Atlas (Size 1 Civil Longue Portée)',
    category: 'Composant Vaisseau',
    subCategory: 'Moteur Quantum Drive',
    manufacturer: 'RSI Components',
    defaultUnit: 'Unités',
    unitValueUEC: 58000,
    suggestedCraftTimeMinutes: 25,
    description: 'Moteur de saut équilibré entre vitesse et consommation pour vaisseaux taille 1.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 6, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c06',
    name: 'Quantum Drive TS-2 (Size 3 Militaire Lourd)',
    category: 'Composant Vaisseau',
    subCategory: 'Moteur Quantum Drive',
    manufacturer: 'RSI Components',
    defaultUnit: 'Unités',
    unitValueUEC: 395000,
    suggestedCraftTimeMinutes: 90,
    description: 'Propulseur de saut lourd pour frégates, corvettes et vaisseaux de ligne.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 50, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 30, unit: 'SCU' },
      { name: 'Gold (Or Raffiné)', quantity: 15, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c07',
    name: 'Générateur d’Énergie JS-300 (Size 1 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Power Plant',
    manufacturer: 'Juno Starwerx',
    defaultUnit: 'Unités',
    unitValueUEC: 52000,
    suggestedCraftTimeMinutes: 25,
    description: 'Générateur d’énergie taille 1 à haut rendement et faible signature thermique.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 5, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c08',
    name: 'Générateur d’Énergie JS-400 (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Power Plant',
    manufacturer: 'Juno Starwerx',
    defaultUnit: 'Unités',
    unitValueUEC: 105000,
    suggestedCraftTimeMinutes: 45,
    description: 'Générateur d’énergie militaire taille 2 alimentant boucliers lourds et tourelles.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 15, unit: 'SCU' },
      { name: 'Gold (Or Raffiné)', quantity: 6, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-c09',
    name: 'Refroidisseur Ultra-Flow (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Cooler',
    manufacturer: 'Aegis Dynamics',
    defaultUnit: 'Unités',
    unitValueUEC: 88000,
    suggestedCraftTimeMinutes: 35,
    description: 'Système de refroidissement cryogénique haute performance pour tirs continus.',
    suggestedMaterials: [
      { name: 'Beryl Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Aluminum Raffiné', quantity: 10, unit: 'SCU' }
    ]
  },

  // ==========================================
  // --- ARMES FPS ---
  // ==========================================
  {
    id: 'sc-bp-f01',
    name: 'Fusil d’Assaut Behring P4-AR',
    category: 'Arme FPS',
    subCategory: 'Fusil d’Assaut Balistique',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 28000,
    suggestedCraftTimeMinutes: 15,
    description: 'Fusil d’assaut standard des forces de sécurité de l’UEE, fiable en toute condition.',
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 3, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 2, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 2, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-f02',
    name: 'Fusil de Précision Behring P6-LR',
    category: 'Arme FPS',
    subCategory: 'Fusil de Précision Balistique',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 45000,
    suggestedCraftTimeMinutes: 25,
    description: 'Fusil de précision lourd capable de neutraliser une cible à travers les blindages lourds.',
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 5, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'Diamond (Diamant Industriel)', quantity: 2, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-f03',
    name: 'Fusil d’Assaut Klaus & Werner Gallant Energy Rifle',
    category: 'Arme FPS',
    subCategory: 'Fusil d’Assaut Laser',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 32000,
    suggestedCraftTimeMinutes: 18,
    description: 'Fusil d’assaut laser à tir en rafale 3 coups avec accumulateur thermique.',
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 3, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 3, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 2, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-f04',
    name: 'Mitrailleuse Légère Gemini F55 LMG',
    category: 'Arme FPS',
    subCategory: 'Mitrailleuse Balistique',
    manufacturer: 'Gemini',
    defaultUnit: 'Unités',
    unitValueUEC: 42000,
    suggestedCraftTimeMinutes: 22,
    description: 'Mitrailleuse lourde rotative à très haute cadence de tir.',
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 6, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 5, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 4, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-f05',
    name: 'Mitraillette Gemini C54 SMG',
    category: 'Arme FPS',
    subCategory: 'SMG Balistique',
    manufacturer: 'Gemini',
    defaultUnit: 'Unités',
    unitValueUEC: 22000,
    suggestedCraftTimeMinutes: 12,
    description: 'Arme compacte de combat rapproché à cadence ultrarapide.',
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 2, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 2, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-f06',
    name: 'Fusil à Pompe Kastak Arms Devastator',
    category: 'Arme FPS',
    subCategory: 'Fusil à Pompe Plasma',
    manufacturer: 'Kastak Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 36000,
    suggestedCraftTimeMinutes: 15,
    description: 'Fusil à pompe énergétique projetant des gerbes de plasma surchauffé.',
    suggestedMaterials: [
      { name: 'Hephaestanite Raffinée', quantity: 4, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 4, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-f07',
    name: 'Lance-Roquettes Apocalypse Arms Animus',
    category: 'Arme FPS',
    subCategory: 'Lance-Missiles Lourd',
    manufacturer: 'Apocalypse Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 75000,
    suggestedCraftTimeMinutes: 35,
    description: 'Lanceur d’ogives guidées anti-véhicules et anti-vaisseaux.',
    suggestedMaterials: [
      { name: 'Hephaestanite Raffinée', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 6, unit: 'SCU' }
    ]
  },

  // ==========================================
  // --- ARMURES FPS (LÉGÈRES, MOYENNES, LOURDES) ---
  // ==========================================
  {
    id: 'sc-bp-a01',
    name: 'Ensemble Armure Lourde ADP-mk4 (Plastron + Casque + Jambes)',
    category: 'Armure FPS',
    subCategory: 'Armure Lourde Militaire',
    manufacturer: 'Clark Defense Systems',
    defaultUnit: 'Unités',
    unitValueUEC: 65000,
    suggestedCraftTimeMinutes: 30,
    description: 'Armure de combat lourd avec blindage composite Titanium résistant aux impacts balistiques.',
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 8, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 4, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-a02',
    name: 'Ensemble Armure Lourde Morozov-SH (Spécial Environnement Extrême)',
    category: 'Armure FPS',
    subCategory: 'Armure Lourde Survie',
    manufacturer: 'Roussimoff Technologies',
    defaultUnit: 'Unités',
    unitValueUEC: 72000,
    suggestedCraftTimeMinutes: 35,
    description: 'Blindage lourd avec régulation thermique pour Pyro et planètes gelées.',
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Beryl Raffiné', quantity: 6, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 8, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-a03',
    name: 'Ensemble Armure Moyenne TrueDef-Pro',
    category: 'Armure FPS',
    subCategory: 'Armure Moyenne Polyvalente',
    manufacturer: 'Clark Defense Systems',
    defaultUnit: 'Unités',
    unitValueUEC: 45000,
    suggestedCraftTimeMinutes: 20,
    description: 'Compromis parfait entre protection balistique et mobilité tactique.',
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 6, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 5, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-a04',
    name: 'Ensemble Armure Légère Stoneskin',
    category: 'Armure FPS',
    subCategory: 'Armure Légère Recon',
    manufacturer: 'Kastak Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 30000,
    suggestedCraftTimeMinutes: 15,
    description: 'Armure ultra-légère conçue pour les tireurs d’élite et pilotes.',
    suggestedMaterials: [
      { name: 'Aluminum Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 3, unit: 'SCU' }
    ]
  },

  // ==========================================
  // --- UTILITAIRES & ÉQUIPEMENTS ---
  // ==========================================
  {
    id: 'sc-bp-u01',
    name: 'Multi-Tool Pyro RRS avec Rayon Tracteur & Tête de Minage Helix',
    category: 'Utilitaire & Équipement',
    subCategory: 'Outil Polyvalent FPS',
    manufacturer: 'Pyrotechnic Amalgamated',
    defaultUnit: 'Unités',
    unitValueUEC: 25000,
    suggestedCraftTimeMinutes: 12,
    description: 'Outil de poche indispensable pour le minage de grottes, le déplacement de caisses SCU et la réparation.',
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 2, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 3, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 2, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-u02',
    name: 'Pistolet Médical CureLife ParaMed MedGun',
    category: 'Utilitaire & Équipement',
    subCategory: 'Dispositif Médical',
    manufacturer: 'CureLife',
    defaultUnit: 'Unités',
    unitValueUEC: 22000,
    suggestedCraftTimeMinutes: 10,
    description: 'Pistolet d’injection médicale pour stabiliser les blessures et ranimer les alliés à terre.',
    suggestedMaterials: [
      { name: 'Copper (Cuivre Raffiné)', quantity: 2, unit: 'SCU' },
      { name: 'Aluminum Raffiné', quantity: 3, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-u03',
    name: 'Rayon Tracteur Lourd MaxLift (2H Tractor Beam)',
    category: 'Utilitaire & Équipement',
    subCategory: 'Outil Industriel Lourd',
    manufacturer: 'Greycat Industrial',
    defaultUnit: 'Unités',
    unitValueUEC: 38000,
    suggestedCraftTimeMinutes: 15,
    description: 'Manipulateur à deux mains capable de soulever des conteneurs de 32 SCU et véhicules légers.',
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 5, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 4, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-u04',
    name: 'Tête de Minage Laser Helix Size 1 (Prospector)',
    category: 'Utilitaire & Équipement',
    subCategory: 'Tête de Minage Laser',
    manufacturer: 'Shubin Interstellar',
    defaultUnit: 'Unités',
    unitValueUEC: 68000,
    suggestedCraftTimeMinutes: 25,
    description: 'Tête de minage laser de référence pour briser les gisements denses de Quantainium.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 6, unit: 'SCU' },
      { name: 'Diamond (Diamant Industriel)', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 12, unit: 'SCU' }
    ]
  },
  {
    id: 'sc-bp-u05',
    name: 'Tête de Minage Laser Lancet Size 2 (ARGO MOLE)',
    category: 'Utilitaire & Équipement',
    subCategory: 'Tête de Minage Laser',
    manufacturer: 'Shubin Interstellar',
    defaultUnit: 'Unités',
    unitValueUEC: 110000,
    suggestedCraftTimeMinutes: 40,
    description: 'Tête de minage taille 2 à réduction d’instabilité pour extraction en équipage.',
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Diamond (Diamant Industriel)', quantity: 15, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 8, unit: 'SCU' }
    ]
  }
];

export function searchStarCitizenItems(query: string, categoryFilter?: string, maxResults = 12): SCItemDefinition[] {
  if (!query || query.trim().length === 0) return [];
  const cleanQ = query.toLowerCase().trim();

  return STAR_CITIZEN_DATABASE.filter(item => {
    if (categoryFilter && categoryFilter !== 'Tous' && item.category !== categoryFilter) {
      return false;
    }
    return (
      item.name.toLowerCase().includes(cleanQ) ||
      (item.manufacturer && item.manufacturer.toLowerCase().includes(cleanQ)) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(cleanQ)) ||
      (item.description && item.description.toLowerCase().includes(cleanQ))
    );
  }).slice(0, maxResults);
}

