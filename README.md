# Star Citizen — Mining, Refinery & Blueprint Order Manager 🚀⛏️

Application Web complète (SPA) pour gérer vos sessions de minage brut, vos opérations de raffinage en temps réel, vos stocks de minerais raffinés (personnels et dépôts clients), vos plans de fabrication (Blueprints officiels Star Citizen) ainsi qu'un carnet de commandes complet avec calcul des coûts, intégration des apports miniers clients, et import/export Excel & CSV.

---

## 🌟 Fonctionnalités Principales

### 1. ⛏️ Minage Brut & Cargaisons Extraites
- Enregistrement des sessions de minage (Prospector, ARGO MOLE, Greycat ROC, Minage à pied FPS).
- Calcul automatique du volume brut (SCU / cSCU), de la pureté (%) et de la valeur marchande estimée en aUEC.
- Bouton direct **"Envoyer en Raffinerie"** pré-remplissant instantanément l'ordre de traitement.

### 2. 🏭 Centre de Raffinage en Temps Réel
- Calculateur de rendement & rentabilité :
  - Choix de la méthode (Dinyx Solventation 93%, Pyrometric Chromanalysis 90%, Cormack 88%, Ferron Exchange 85%, Gencore, Electrostatic...).
  - Choix de la station avec bonus officiels (CRU-L1, ARC-L1, HUR-L1, HUR-L2, MIC-L1, Pyro Gateway, Ruin Station...).
  - Calcul du rendement total, des coûts en aUEC, du temps de traitement et du bénéfice net estimé.
- Minuteurs et barres de progression en direct.
- Bouton **"Collecter au Stock"** transférant automatiquement les minerais raffinés dans votre inventaire.

### 3. 📦 Gestion des Stocks de Minerais (Perso & Clients)
- Séparation stricte et claire entre :
  - **Mon Stock Personnel** (vos propres réserves de fabrication/vente).
  - **Dépôts Clients** (minerais apportés par des clients pour leurs commandes).
- Boutons d'ajustement rapide (+1, -1, +5 SCU).
- Filtrage instantané par famille (Métaux, Minéraux, Gemmes FPS, Composites/Salvage).
- Calcul de la valeur marchande totale du stock en aUEC.

### 4. 📜 Atelier de Fabrication & Blueprints
- Catalogue de plus de 1 600 plans officiels Star Citizen issus de l'API `api.star-citizen.wiki`.
- Catégories complètes :
  - 🚀 **Vaisseaux & Composants** (Moteurs quantiques Atlas/VK-00, Boucliers FR-66/FR-76, Génératrices, Refroidisseurs)
  - ⚔️ **Armes de Vaisseau** (Canons lasers Omnisky, Répéteurs Panther, Gatlings AD4B, Têtes de minage Helix)
  - 🔫 **Armes & FPS** (Fusils P4-AR, FS-9 LMG, SMG Custodian, Snipers Arrowhead, Pistolets, Chargeurs)
  - 🦺 **Armures & Combinaisons** (Armures lourdes Defiance, Sacs à dos Novikov)
  - 🔧 **Outils & Équipements** (Pyro Multi-Tool, Modules tracteurs, Gadgets de minage, Medpens)
  - 🧱 **Matériaux & Cargo** (Caisses de fret 1 à 32 SCU)
- **Vérificateur de faisabilité en temps réel** : pastille verte/rouge comparant automatiquement les minerais requis avec vos stocks actuels.
- Création de **Blueprints personnalisés** sur mesure.
- Bouton rapide **"Créer une commande"** pré-remplissant le bon de commande.

### 5. 📋 Carnet de Commandes & Dépôts Clients
- Enregistrement des commandes avec nom du client, organisation, contact et date d'échéance.
- Sélection des items avec menu déroulant autocomplété dès les premières lettres.
- **Minerais apportés par le client** : saisie des minerais fournis par le client avec calcul automatique du reste à prélever sur votre stock.
- Bouton **"Le client fournit tout"** pour un remplissage en 1 clic.
- Paramétrage des coûts de main d'œuvre et frais de service en aUEC.
- Action **"Lancer la Fabrication (Déduire stocks)"** : déduit automatiquement les quantités exactes des réserves client et personnelles.
- Célébration par confettis et mise à jour du statut lors de la livraison.

### 6. 📊 Importation & Exportation (Excel / CSV / JSON)
- Importation facile de tableaux Excel (`.xlsx`) ou CSV avec prévisualisation et options de fusion/remplacement.
- Exportation en 1 clic au format Excel (`.xlsx`) et CSV :
  - Inventaire des minerais
  - Carnet de commandes complet
  - Historique de minage brut
- Téléchargement de modèles types vierges au format Excel et CSV.
- Sauvegarde et restauration complète de l'application en JSON.

### 7. 🔊 Design HUD & Ambiance Sci-Fi
- Thème sombre Star Citizen (Glassmorphism, accents néon personnalisables).
- Effets sonores intégrés via Web Audio API (aucun fichier audio externe requis, désactivable en un clic).
- 100% réactif sur écran PC, tablette ou smartphone dans votre cockpit.

---

## 🚀 Hébergement sur GitHub Pages

L'application est configurée pour fonctionner de manière autonome sur **GitHub Pages**.

### Déploiement automatique via GitHub Actions (Recommandé) :
1. Créez un dépôt sur votre compte GitHub (par exemple `star-citizen-manager`).
2. Poussez le code sur la branche `main` ou `master` :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Star Citizen Manager"
   git remote add origin https://github.com/VOTRE_PSEUDO/star-citizen-manager.git
   git branch -M main
   git push -u origin main
   ```
3. Sur GitHub, rendez-vous dans **Settings** ➔ **Pages** :
   - Sous **Build and deployment**, choisissez **GitHub Actions** comme source.
4. Le workflow `.github/workflows/deploy.yml` compilera et déploiera automatiquement le site en ligne !

---

## 💻 Démarrage Local

Pour lancer l'application sur votre machine en développement :

```bash
# Installation des dépendances (déjà fait)
npm install

# Lancement du serveur de développement Vite
npm run dev

# Construction du bundle statique de production
npm run build

# Prévisualisation de la version de production
npm run preview
```
