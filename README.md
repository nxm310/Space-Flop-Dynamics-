# Star Citizen - Hub d'Artisanat, Minerais & Approvisionnement

Plateforme complète pour Star Citizen combinant un **Agent Local Python** (extraction en direct des données de votre PC) et une **Application Web Multi-Joueurs** (gestion de catalogue de plans, commandes de craft et réquisition de minerais auprès d'environ 50 joueurs).

---

## 🚀 Démarrage Rapide

### 1. Lancement Global (en 1 Clic)
Double-cliquez simplement sur le fichier :
- **`run_all.bat`** : Lance simultanément l'Agent Local Python et l'Interface Web React.

### 2. Ou Lancement Séparé :
- **Agent Local Python** : Double-cliquez sur `run_local_agent.bat` (ou `cd local_agent && python agent_server.py`).
  - Accessible sur : `http://127.0.0.1:5500`
- **Application Web** : Double-cliquez sur `run_webapp.bat` (ou `cd webapp && npm run dev`).
  - Accessible sur : `http://localhost:5173`

---

## 🎯 Fonctionnalités Principales

### 1. Rôle Unique de l'Hôte (Master Crafter)
- **Catalogue Centralisé des Plans** : L'hôte expose l'ensemble de ses plans connus (Armes FPS, Canons de vaisseaux, Modules de saut Quantum S2, Armures lourdes, Modules utilitaires).
- **Gestion des Stocks en Direct** : Suivi des minerais raffinés (Quantainium, Bexalite, Laranite, Taranite, RMC, Gold, Titanium, etc.) extraits et modifiables.
- **Demandes de Ressources (Quêtes de Minerais)** : L'hôte peut publier des appels de matières premières nécessaires aux crafts avec quantité cible, rémunération par SCU en aUEC, et station de livraison.
- **Traitement des Commandes** : Workflow complet pour accepter, lancer la fabrication, signaler la mise à disposition en station et valider la remise.
- **Télémétrie en Direct** : Surveillance passive du fichier `D:\SC\StarCitizen\LIVE\Game.log` (Version du jeu, Shard serveur, Localisation actuelle, Vaisseau actif, flux de logs).

### 2. Espace Membres (~50 Joueurs)
- **Consultation des Plans** : Visualisation des technologies fabriquables, comparaison avec les stocks actuels de l'hôte et durée de fabrication.
- **Passage de Commandes** : Choix de l'objet, option d'apport personnel des minerais (réduction des frais de service de 60%), sélection de la station de livraison.
- **Participation aux Appels d'Offres** : Possibilité de déclarer des livraisons de minerais pour approvisionner l'atelier et toucher les récompenses.
- **Suivi en Temps Réel** : Badges et chronologie de fabrication (`En attente` $\rightarrow$ `Accepté` $\rightarrow$ `En fabrication` $\rightarrow$ `Prêt en station` $\rightarrow$ `Livré`).

---

## 🔐 Authentification & Multi-Joueurs (Firebase)

- **Mode Hors-Ligne / Local Intégré** : L'application fonctionne immédiatement sans configuration requise grâce au stockage local synchronisé avec l'Agent Python. Des comptes de démonstration (Hôte & Joueur) sont disponibles en 1 clic.
- **Connexion Firebase Cloud** :
  1. Créez un projet gratuit sur [console.firebase.google.com](https://console.firebase.google.com).
  2. Activez l'authentification **Email/Mot de passe** et créez une base **Firestore**.
  3. Cliquez sur le bouton **Firebase** en haut à droite de l'application Web pour coller vos clés API.

---

## 📁 Architecture des Fichiers

```
star citizen/
├── local_agent/              # Agent compagnon Python (Client PC Hôte)
│   ├── sc_log_watcher.py     # Surveillance en direct du Game.log Star Citizen
│   ├── inventory_engine.py   # Moteur de calcul des minerais, plans et quêtes
│   ├── agent_server.py       # Serveur API REST local (Port 5500, sans dépendance lourde)
│   ├── test_agent.py         # Tests unitaires de parsing du Game.log
│   └── config.json           # Chemin D:\SC\StarCitizen\LIVE et configuration
│
├── webapp/                   # Interface Web React + Tailwind (MobiGlas Style)
│   ├── src/
│   │   ├── components/       # BlueprintCatalog, CrafterDashboard, ResourceRequests...
│   │   ├── context/          # AuthContext & AppContext
│   │   └── services/         # FirebaseConfig
│   ├── index.html
│   └── package.json
│
├── run_all.bat               # Lanceur global
├── run_local_agent.bat       # Lanceur Agent Python
└── run_webapp.bat            # Lanceur Web App
```
