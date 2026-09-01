import React from 'react';
import {
  Sparkles,
  X,
  CheckSquare,
  BookOpen,
  Trash2,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    audio.playClick();
    onClose();
  };

  const updates = [
    {
      version: 'Opération 5 • Version 1.5',
      date: 'Dernière mise à jour',
      badge: 'Nouveau',
      badgeColor: 'cyan',
      title: 'Atelier Blueprints Personnel & Tri Multi-Colonnes',
      icon: <CheckSquare className="w-5 h-5 text-sc-cyan" />,
      points: [
        '🌟 Onglet Dédié "Mes Blueprints (Mon Atelier)" : Consultez uniquement les blueprints que vous possédez ou fabriquez régulièrement.',
        '☑️ Deux modes d\'ajout : Cochez directement la case sur la fiche d\'un blueprint ou sélectionnez-le depuis la liste déroulante par catégorie.',
        '🔄 Tri Interactif des Minerais par En-tête : Cliquez sur les colonnes du tableau pour trier par Nom (A-Z/Z-A), Type (Geo/Vaisseau), Qualité, Quantité SCU, Valeur aUEC ou Notes.',
        '💾 Persistance automatique : Votre sélection de blueprints et vos préférences sont sauvegardées en local.'
      ]
    },
    {
      version: 'Opération 4 • Version 1.4',
      date: 'Étape précédente',
      badge: 'Blueprints',
      badgeColor: 'purple',
      title: 'Expansion Massive des Blueprints & Guide Datamining',
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      points: [
        '📦 40+ Recettes Officielles Star Citizen : Composants (Atlas, VK-00, XL-1, FR-66/76/86), Armes (CF-337, AD4B, FS-9, P6-LR, Railgun), Armures et Boîtes de fret (1 à 32 SCU).',
        '🔬 Hub Sources & Datamining : Accès direct aux bases communautaires (SC-Craft.tools, scunpacked-data, SPViewer, Erkul, UEX Corp).',
        '📥 Importateur de Packs JSON : Importez et partagez des catalogues complets de blueprints communautaires.'
      ]
    },
    {
      version: 'Opération 3 • Version 1.3',
      date: 'Maintenance & Périphérie',
      badge: 'Système',
      badgeColor: 'amber',
      title: 'Démarrage Vierge 100% Propre & Réinitialisation Globale',
      icon: <Trash2 className="w-5 h-5 text-amber-400" />,
      points: [
        '✨ État Initial 100% Vierge : L\'application démarre propre sans fausse donnée de démonstration pour tous les nouveaux visiteurs.',
        '🛡️ Réinitialisation Sécurisée dans Paramètres : Possibilité de vider instantanément toutes les tables (stocks, cales, raffinerie, commandes) avec dialogue de confirmation.'
      ]
    },
    {
      version: 'Opération 2 • Version 1.2',
      date: 'Gestion Commerciale',
      badge: 'Commandes',
      badgeColor: 'emerald',
      title: 'Carnet de Commandes & Dépôts Clients Ségrégués',
      icon: <ClipboardList className="w-5 h-5 text-emerald-400" />,
      points: [
        '💼 Gestion Complète des Commandes : Fiches clients, devis chiffrés en aUEC, acomptes, acomptes versés et dates d\'échéance.',
        '⛏️ Distinction des Minerais Clients : Gestion isolée des stocks personnels et des minerais apportés par vos clients.',
        '⚙️ Lancement en Fabrication : Vérification automatique de la disponibilité des minerais et déduction lors du passage en production.'
      ]
    },
    {
      version: 'Opération 1 • Version 1.1',
      date: 'Interface & Déploiement',
      badge: 'Cockpit HUD',
      badgeColor: 'cyan',
      title: 'Refonte de l\'En-tête HUD & Hébergement Live GitHub Pages',
      icon: <LayoutDashboard className="w-5 h-5 text-sc-cyan" />,
      points: [
        '🛰️ Bandeau Supérieur Épuré MobiGlas : Navigation rapide, statut du jeu, volume total des cales et effets sonores interactifs.',
        '🌐 Déploiement en Ligne Automatisé : Hébergement web rapide et accessible depuis n\'importe quel appareil via GitHub Pages.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#070b13] border border-sc-cyan/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden font-sans">
        
        {/* Header with holographic glow */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-sc-cyan/15 via-[#0b1220] to-transparent flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sc-cyan/20 border border-sc-cyan/40 flex items-center justify-center shadow-neon-cyan shrink-0">
              <Sparkles className="w-5 h-5 text-sc-cyan animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sc-cyan bg-sc-cyan/10 px-2 py-0.5 rounded border border-sc-cyan/30">
                  Journal des Mises à Jour
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Star Citizen 4.10+ LIVE
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wide mt-0.5">
                Dernières Nouveautés & Évolutions
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          <p className="text-xs font-mono text-slate-400">
            Voici le récapitulatif détaillé des améliorations apportées sur vos <strong className="text-sc-cyan">5 dernières opérations</strong> :
          </p>

          <div className="space-y-3">
            {updates.map((up, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-sc-card/70 border border-sc-border hover:border-sc-cyan/40 transition-all space-y-2.5 relative overflow-hidden group"
              >
                {/* Header row of the card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {up.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {up.version}
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                          up.badgeColor === 'cyan'
                            ? 'bg-sc-cyan/15 text-sc-cyan border-sc-cyan/30'
                            : up.badgeColor === 'purple'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                            : up.badgeColor === 'emerald'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800'
                        }`}>
                          {up.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 font-sans mt-0.5">
                        {up.title}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Points list */}
                <ul className="space-y-1.5 pt-1 pl-1 text-xs font-mono text-slate-300">
                  {up.points.map((pt, pIdx) => (
                    <li key={pIdx} className="leading-relaxed flex items-start gap-2">
                      <span className="text-sc-cyan shrink-0 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#090e18] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Application synchronisée avec votre dépôt GitHub</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-cyan transition-all"
          >
            <Rocket className="w-4 h-4" />
            <span>Accéder à l'Application</span>
          </button>
        </div>

      </div>
    </div>
  );
};
