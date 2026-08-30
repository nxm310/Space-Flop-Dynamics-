export interface SCItemDefinition {
  id: string;
  name: string;
  category: 'Vaisseau & Véhicule' | 'Minerai Raffiné' | 'Minerai Brut' | 'Gemme FPS' | 'Salvage & Matériaux' | 'Armement Vaisseau' | 'Composant Vaisseau' | 'Arme FPS' | 'Armure FPS' | 'Utilitaire & Équipement';
  subCategory?: string;
  defaultUnit: 'SCU' | 'cSCU' | 'µSCU' | 'Unités';
  unitValueUEC?: number;
  description?: string;
  manufacturer?: string;
  scuCapacity?: number;
  suggestedMaterials?: { name: string; quantity: number; unit: string }[];
  suggestedCraftTimeMinutes?: number;
}

export const STAR_CITIZEN_DATABASE: SCItemDefinition[] = [
  // --- MINERAIS RAFFINÉS ---
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

  // --- MINERAIS BRUTS ---
  {
    id: 'sc-raw-01',
    name: 'Quantainium Brut (Instable)',
    category: 'Minerai Brut',
    defaultUnit: 'SCU',
    unitValueUEC: 44000,
    description: 'Minerai brut hautement volatile extrait des astéroïdes.'
  },
  {
    id: 'sc-raw-02',
    name: 'Bexalite Brut',
    category: 'Minerai Brut',
    defaultUnit: 'SCU',
    unitValueUEC: 21000
  },
  {
    id: 'sc-raw-03',
    name: 'Taranite Brut',
    category: 'Minerai Brut',
    defaultUnit: 'SCU',
    unitValueUEC: 16000
  },
  {
    id: 'sc-raw-04',
    name: 'Laranite Brut',
    category: 'Minerai Brut',
    defaultUnit: 'SCU',
    unitValueUEC: 14000
  },
  {
    id: 'sc-raw-05',
    name: 'Agricium Brut',
    category: 'Minerai Brut',
    defaultUnit: 'SCU',
    unitValueUEC: 12500
  },

  // --- GEMMES FPS ---
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

  // --- SALVAGE & MATÉRIAUX DE RÉCUPÉRATION ---
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
    name: 'Scrap (Ferraille Industrielle)',
    category: 'Salvage & Matériaux',
    defaultUnit: 'SCU',
    unitValueUEC: 1500
  },
  {
    id: 'sc-sal-04',
    name: 'Superconducteurs Composite',
    category: 'Salvage & Matériaux',
    defaultUnit: 'SCU',
    unitValueUEC: 25000
  },

  // --- ARMEMENT DE VAISSEAUX ---
  {
    id: 'sc-wp-01',
    name: 'Behring S7 Laser Cannon (Omnisky)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 125000,
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 25, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 40, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 45,
    description: 'Canon laser lourd taille 7 pour vaisseaux capitaux.'
  },
  {
    id: 'sc-wp-02',
    name: 'Klaus & Werner CF-337 Panther Laser Repeater (Size 3)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 45000,
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 6, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 25,
    description: 'Répéteur laser taille 3 très populaire pour chasseurs légers et moyens.'
  },
  {
    id: 'sc-wp-03',
    name: 'Klaus & Werner CF-447 Rhino Laser Repeater (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 75000,
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 14, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 20, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 5, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 35
  },
  {
    id: 'sc-wp-04',
    name: 'Klaus & Werner CF-557 Galdiseen Laser Repeater (Size 5)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 110000,
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 10, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 20, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 30, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 45
  },
  {
    id: 'sc-wp-05',
    name: 'Behring AD4B Ballistic Gatling (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 85000,
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 25, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 20, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 15, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 30
  },
  {
    id: 'sc-wp-06',
    name: 'Behring AD5B Ballistic Gatling (Size 5)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 130000,
    suggestedMaterials: [
      { name: 'Tungsten Raffiné', quantity: 40, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 35, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 10, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 50
  },
  {
    id: 'sc-wp-07',
    name: 'Apocalypse Arms Revenant Ballistic Gatling (Size 4)',
    category: 'Armement Vaisseau',
    manufacturer: 'Apocalypse Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 80000
  },

  // --- COMPOSANTS DE VAISSEAU ---
  {
    id: 'sc-comp-01',
    name: 'Générateur de Bouclier FR-86 (Size 3 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Bouclier Industriel / Militaire',
    defaultUnit: 'Unités',
    unitValueUEC: 180000,
    suggestedMaterials: [
      { name: 'Laranite Raffinée', quantity: 20, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 12, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 30, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 60,
    description: 'Bouclier lourd taille 3 à régénération instantanée de grade militaire.'
  },
  {
    id: 'sc-comp-02',
    name: 'Générateur de Bouclier FR-76 (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 95000,
    suggestedMaterials: [
      { name: 'Laranite Raffinée', quantity: 10, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 6, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 15, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 40
  },
  {
    id: 'sc-comp-03',
    name: 'Générateur de Bouclier FR-66 (Size 1 Militaire)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 45000,
    suggestedMaterials: [
      { name: 'Laranite Raffinée', quantity: 4, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 3, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 8, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 20
  },
  {
    id: 'sc-comp-04',
    name: 'Quantum Drive Crossfield (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Moteur de Saut Quantum',
    defaultUnit: 'Unités',
    unitValueUEC: 250000,
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 30, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 10, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 75,
    description: 'Le moteur de saut militaire de référence pour traverser Stanton et Pyro à vitesse maximale.'
  },
  {
    id: 'sc-comp-05',
    name: 'Quantum Drive Atlas (Size 1 Civil Rapide)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 55000,
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 4, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 25
  },
  {
    id: 'sc-comp-06',
    name: 'Quantum Drive TS-2 (Size 3 Militaire Lourd)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 380000,
    suggestedMaterials: [
      { name: 'Quantainium Raffiné', quantity: 50, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 30, unit: 'SCU' },
      { name: 'Gold (Or Raffiné)', quantity: 15, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 90
  },
  {
    id: 'sc-comp-07',
    name: 'Générateur d’Énergie JS-300 (Size 1 Militaire)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 48000
  },
  {
    id: 'sc-comp-08',
    name: 'Générateur d’Énergie JS-400 (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 98000
  },
  {
    id: 'sc-comp-09',
    name: 'Refroidisseur Ultra-Flow (Size 2 Militaire)',
    category: 'Composant Vaisseau',
    defaultUnit: 'Unités',
    unitValueUEC: 75000
  },

  // --- ARMES FPS ---
  {
    id: 'sc-fps-01',
    name: 'Behring P6-LR Sniper Rifle',
    category: 'Arme FPS',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 35000,
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 6, unit: 'SCU' },
      { name: 'Gold (Or Raffiné)', quantity: 2, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 20,
    description: 'Fusil anti-matériel lourd avec optique haute précision.'
  },
  {
    id: 'sc-fps-02',
    name: 'Behring FS-9 LMG (Heavy Light Machine Gun)',
    category: 'Arme FPS',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 28000,
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 4, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 4, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 20
  },
  {
    id: 'sc-fps-03',
    name: 'Behring P4-AR Ballistic Rifle',
    category: 'Arme FPS',
    manufacturer: 'Behring Applied Technology',
    defaultUnit: 'Unités',
    unitValueUEC: 18000,
    suggestedMaterials: [
      { name: 'Titanium Raffiné', quantity: 5, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 3, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 15
  },
  {
    id: 'sc-fps-04',
    name: 'Kastak Arms Karna Plasma Rifle',
    category: 'Arme FPS',
    manufacturer: 'Kastak Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 32000,
    suggestedMaterials: [
      { name: 'Hephaestanite Raffinée', quantity: 5, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 6, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 25
  },
  {
    id: 'sc-fps-05',
    name: 'Kastak Arms Coda Heavy Pistol',
    category: 'Arme FPS',
    manufacturer: 'Kastak Arms',
    defaultUnit: 'Unités',
    unitValueUEC: 12000
  },
  {
    id: 'sc-fps-06',
    name: 'Klaus & Werner Gallant Energy Rifle',
    category: 'Arme FPS',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 22000
  },
  {
    id: 'sc-fps-07',
    name: 'Klaus & Werner Demeco LMG',
    category: 'Arme FPS',
    manufacturer: 'Klaus & Werner',
    defaultUnit: 'Unités',
    unitValueUEC: 30000
  },
  {
    id: 'sc-fps-08',
    name: 'Gemini C54 SMG',
    category: 'Arme FPS',
    manufacturer: 'Gemini',
    defaultUnit: 'Unités',
    unitValueUEC: 16000
  },

  // --- ARMURES FPS ---
  {
    id: 'sc-arm-01',
    name: 'Armure Lourde Citadel Exec (Full Armor Set)',
    category: 'Armure FPS',
    defaultUnit: 'Unités',
    unitValueUEC: 45000,
    suggestedMaterials: [
      { name: 'RMC (Recycled Material Composite)', quantity: 12, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 18, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 8, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 30,
    description: 'Armure lourde de combat urbain offrant la plus haute protection balistique.'
  },
  {
    id: 'sc-arm-02',
    name: 'Armure Lourde Morozov-SH Thule Edition',
    category: 'Armure FPS',
    defaultUnit: 'Unités',
    unitValueUEC: 48000,
    suggestedMaterials: [
      { name: 'RMC (Recycled Material Composite)', quantity: 15, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 20, unit: 'SCU' },
      { name: 'Beryl Raffiné', quantity: 6, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 35
  },
  {
    id: 'sc-arm-03',
    name: 'Armure Moyenne Orc-mkX Core Set',
    category: 'Armure FPS',
    defaultUnit: 'Unités',
    unitValueUEC: 32000,
    suggestedMaterials: [
      { name: 'RMC (Recycled Material Composite)', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 20
  },
  {
    id: 'sc-arm-04',
    name: 'Armure Légère Inquisitor Stealth Edition',
    category: 'Armure FPS',
    defaultUnit: 'Unités',
    unitValueUEC: 26000
  },
  {
    id: 'sc-arm-05',
    name: 'Armure Lourde Defiance Full Set (Pyro Outlaw)',
    category: 'Armure FPS',
    defaultUnit: 'Unités',
    unitValueUEC: 42000
  },

  // --- UTILITAIRES & ÉQUIPEMENT ---
  {
    id: 'sc-ut-01',
    name: 'Multi-Tool Pyro RRS + Attachement Salvage & Mining',
    category: 'Utilitaire & Équipement',
    defaultUnit: 'Unités',
    unitValueUEC: 15000,
    suggestedMaterials: [
      { name: 'RMC (Recycled Material Composite)', quantity: 5, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 5, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 10,
    description: 'Outil polyvalent multifonction avec rayon tracteur haute puissance.'
  },
  {
    id: 'sc-ut-02',
    name: 'Tigerclaw Cryptokey (Hacking Device)',
    category: 'Utilitaire & Équipement',
    defaultUnit: 'Unités',
    unitValueUEC: 12500,
    suggestedMaterials: [
      { name: 'Gold (Or Raffiné)', quantity: 2, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 3, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 10,
    description: 'Carte de décryptage utilisée pour effacer le CrimeStat aux stations de sécurité.'
  },
  {
    id: 'sc-ut-03',
    name: 'MedGun CureLife Paramédical + Cartouches Remplies',
    category: 'Utilitaire & Équipement',
    defaultUnit: 'Unités',
    unitValueUEC: 14000,
    suggestedMaterials: [
      { name: 'Agricium Raffiné', quantity: 2, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 3, unit: 'SCU' }
    ],
    suggestedCraftTimeMinutes: 10
  },
  {
    id: 'sc-ut-04',
    name: 'Pack 10x MedPen Hemozal & OxyPen',
    category: 'Utilitaire & Équipement',
    defaultUnit: 'Unités',
    unitValueUEC: 5000
  },
  // --- VAISSEAUX & VÉHICULES ---
  {
    id: 'sc-ship-01',
    name: 'MISC Prospector',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Vaisseau de Minage Solo',
    manufacturer: 'MISC',
    defaultUnit: 'Unités',
    unitValueUEC: 2061000,
    scuCapacity: 32,
    description: 'Le vaisseau de forage spatial de référence avec laser de minage et 32 SCU de nacelles amovibles.'
  },
  {
    id: 'sc-ship-02',
    name: 'ARGO MOLE',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Vaisseau de Minage Multi-Équipages',
    manufacturer: 'ARGO Astronautics',
    defaultUnit: 'Unités',
    unitValueUEC: 5130000,
    scuCapacity: 96,
    description: 'Vaisseau industriel lourd doté de 3 cabines d’opérateur de minage indépendantes et 96 SCU de capacité.'
  },
  {
    id: 'sc-ship-03',
    name: 'Drake Vulture',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Vaisseau de Salvage Solo',
    manufacturer: 'Drake Interplanetary',
    defaultUnit: 'Unités',
    unitValueUEC: 2600000,
    scuCapacity: 12,
    description: 'Spécialiste du démantèlement et recyclage de coques (RMC) avec rayon grattoir et station de compactage.'
  },
  {
    id: 'sc-ship-04',
    name: 'Aegis Reclaimer',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Vaisseau de Salvage Lourd',
    manufacturer: 'Aegis Dynamics',
    defaultUnit: 'Unités',
    unitValueUEC: 15120000,
    scuCapacity: 420,
    description: 'Béhémoth industriel de recyclage doté d’un broyeur géant et d’une capacité massive de RMC/Construction Materials.'
  },
  {
    id: 'sc-ship-05',
    name: 'Drake Corsair',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Gunship & Exploration Lourde',
    manufacturer: 'Drake Interplanetary',
    defaultUnit: 'Unités',
    unitValueUEC: 6500000,
    scuCapacity: 72,
    description: 'Puissance de feu frontale destructrice (4x S5 + 2x S4) avec soute pour véhicule et quartiers d’équipage.'
  },
  {
    id: 'sc-ship-06',
    name: 'Drake Cutlass Black',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Vaisseau Polyvalent / Cargo',
    manufacturer: 'Drake Interplanetary',
    defaultUnit: 'Unités',
    unitValueUEC: 2100000,
    scuCapacity: 46,
    description: 'Le couteau suisse de Stanton : transport, combat rapproché, et rampe d’accès pour véhicules ROC/Mule.'
  },
  {
    id: 'sc-ship-07',
    name: 'Crusader C2 Hercules Starlifter',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Transport Lourd / Fret Géant',
    manufacturer: 'Crusader Industries',
    defaultUnit: 'Unités',
    unitValueUEC: 19850000,
    scuCapacity: 696,
    description: 'Monstre logistique de 696 SCU capable d’embarquer des chars Nova ou plusieurs dizaines de conteneurs 32 SCU.'
  },
  {
    id: 'sc-ship-08',
    name: 'Aegis Gladius',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Chasseur Léger Militaire',
    manufacturer: 'Aegis Dynamics',
    defaultUnit: 'Unités',
    unitValueUEC: 1169600,
    scuCapacity: 0,
    description: 'Chasseur de supériorité spatiale officiel de la Navy UEE, agile et redoutable en combat tournoyant.'
  },
  {
    id: 'sc-ship-09',
    name: 'Anvil Arrow',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Intercepteur Léger',
    manufacturer: 'Anvil Aerospace',
    defaultUnit: 'Unités',
    unitValueUEC: 975000,
    scuCapacity: 0,
    description: 'Vitesse et maniabilité extrêmes avec ailes repliables pour appontage sur porte-vaisseaux.'
  },
  {
    id: 'sc-ship-10',
    name: 'Anvil Carrack',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Exploration d’Élite / Vaisseau Mère',
    manufacturer: 'Anvil Aerospace',
    defaultUnit: 'Unités',
    unitValueUEC: 26650000,
    scuCapacity: 456,
    description: 'Navire amiral d’exploration avec medbay Tier 2, garage pour rover, hangar snub Pisces et baie de scan longue portée.'
  },
  {
    id: 'sc-ship-11',
    name: 'RSI Constellation Andromeda',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Gunship Multi-Équipage',
    manufacturer: 'Roberts Space Industries',
    defaultUnit: 'Unités',
    unitValueUEC: 8540000,
    scuCapacity: 96,
    description: 'Canonnière légendaire avec batterie de missiles géante, tourelles doubles et chasseur snub P-52 Merlin intégré.'
  },
  {
    id: 'sc-ship-12',
    name: 'Greycat ROC (Remote Ore Collector)',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Véhicule Terrestre Minier',
    manufacturer: 'Greycat Industrial',
    defaultUnit: 'Unités',
    unitValueUEC: 172000,
    scuCapacity: 0.8,
    description: 'Buggy de minage planétaire conçu pour extraire l’Hadanite, l’Aphorite et la Dolivine à même le sol.'
  },
  {
    id: 'sc-ship-13',
    name: 'Ursa Rover',
    category: 'Vaisseau & Véhicule',
    subCategory: 'Véhicule Terrestre Tout-Terrain',
    manufacturer: 'Roberts Space Industries',
    defaultUnit: 'Unités',
    unitValueUEC: 235000,
    scuCapacity: 4,
    description: 'Véhicule 6 roues blindé tout-terrain avec tourelle de défense et espace pour 6 passagers.'
  }
];

// Helper functions for autocomplete search
export const searchStarCitizenItems = (
  query: string, 
  filterCategory?: string, 
  limit: number = 10
): SCItemDefinition[] => {
  if (!query || query.trim().length < 1) return [];

  const clean = query.toLowerCase().trim();
  return STAR_CITIZEN_DATABASE.filter(item => {
    const matchesName = item.name.toLowerCase().includes(clean);
    const matchesDesc = item.description?.toLowerCase().includes(clean) || false;
    const matchesCategory = !filterCategory || filterCategory === 'all' || item.category === filterCategory;
    return (matchesName || matchesDesc) && matchesCategory;
  }).slice(0, limit);
};
