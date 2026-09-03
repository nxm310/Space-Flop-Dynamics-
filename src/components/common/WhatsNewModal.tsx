import React, { useState } from 'react';
import {
  Sparkles,
  X,
  LayoutGrid,
  Users,
  Pencil,
  Terminal,
  Rocket
} from 'lucide-react';
import { audio } from '../../services/audioService';

export const CURRENT_APP_VERSION = '1.12.0';
export const STORAGE_KEY_LAST_SEEN_VERSION = 'sc_last_seen_changelog_version';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_SEEN_VERSION) === CURRENT_APP_VERSION;
  });

  if (!isOpen) return null;

  const handleClose = () => {
    audio.playClick();
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY_LAST_SEEN_VERSION, CURRENT_APP_VERSION);
    }
    onClose();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audio.playClick();
    const checked = e.target.checked;
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem(STORAGE_KEY_LAST_SEEN_VERSION, CURRENT_APP_VERSION);
    } else {
      localStorage.removeItem(STORAGE_KEY_LAST_SEEN_VERSION);
    }
  };

  const updates = [
    {
      version: 'Opération 7 • Version 1.12.0',
      date: 'Dernière mise à jour (Actuelle)',
      badge: 'Majeure',
      badgeColor: 'emerald',
      title: 'Graphiques en Barres Minerais & Gemmes + Qualité Maximale',
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
      points: [
        '📈 Nouveaux Graphiques en Barres : Deux histogrammes interactifs dédiés (Minerais & Métaux en SCU vs Gemmes en unités) combinant barres de qualité maximale et courbes de volume.',
        '⭐ Affichage Qualité Maximale dans la Synthèse : Chaque carte de matière première affiche désormais instantanément la qualité maximale possédée en plus de la moyenne.',
        '💎 Unités Gemmes Authentiques : Les quantités de gemmes sont désormais clairement affichées en "unités" (au lieu de SCU).',
        '⚡ Sélecteur Simplifié : Remplacement de l\'ancien mode cartes par le nouvel accès direct aux "Graphiques".'
      ]
    },
    {
      version: 'Opération 4 • Version 1.9.0',
      date: 'Étape précédente',
      badge: 'Majeure',
      badgeColor: 'purple',
      title: 'Recentrage sur le Stock, Blueprints & Commandes Clients',
      icon: <LayoutGrid className="w-5 h-5 text-purple-400" />,
      points: [
        '🧹 Retrait des onglets superflus Minage Brut et Raffinerie.',
        '📊 Tableau de bord restructuré avec valorisation globale et flux direct vers les commandes.'
      ]
    },
    {
      version: 'Opération 3 • Version 1.8.0',
      date: 'Ergonomie HUD',
      badge: 'Majeure',
      badgeColor: 'emerald',
      title: 'Header HUD Supérieur sur 2 Lignes & Ergonomie Responsive',
      icon: <LayoutGrid className="w-5 h-5 text-emerald-400" />,
      points: [
        '🚀 Nouveau Header HUD 2 Lignes avec barre de statut/télémétrie et barre de navigation dédiée.',
        '📑 Menu Déroulant Clients & Tri par Sous-Composants de Blueprints.'
      ]
    },
    {
      version: 'Opération 2 • Version 1.7.0',
      date: 'Clients & Commerce',
      badge: 'Majeure',
      badgeColor: 'amber',
      title: 'Répertoire Clients & Correction Visuelle des Prix aUEC',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      points: [
        '👥 Fiches Clients 360° avec historique complet des commandes, factions et contacts.',
        '🛠️ Correction d\'espacement des champs de prix aUEC.'
      ]
    },
    {
      version: 'Opération 1 • Version 1.6.0',
      date: 'Minerais & Recettes',
      badge: 'Majeure',
      badgeColor: 'cyan',
      title: 'Édition Complète des Minerais & Expansion Blueprints Dédupliquée',
      icon: <Pencil className="w-5 h-5 text-sc-cyan" />,
      points: [
        '✏️ Édition directe des lots de minerais (nom, quantité, qualité, propriétaire, notes).',
        '🛡️ 50+ Recettes Star Citizen officielles sans aucun doublon.'
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
                  v{CURRENT_APP_VERSION} • Star Citizen 4.10+ LIVE
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

        {/* Footer with "Don't show again until next update" Checkbox */}
        <div className="p-4 border-t border-slate-800 bg-[#090e18] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          {/* Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-300 hover:text-slate-100 transition-colors text-xs">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sc-cyan focus:ring-sc-cyan focus:ring-offset-0 cursor-pointer accent-cyan-400"
            />
            <span className="text-slate-300">
              Ne plus afficher jusqu'à la prochaine mise à jour
            </span>
          </label>

          {/* Action Button */}
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
