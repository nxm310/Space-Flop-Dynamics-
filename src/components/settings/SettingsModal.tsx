import React from 'react';
import { Modal } from '../common/Modal';
import { AppSettings } from '../../types';
import { Settings, Volume2, VolumeX, Palette, Globe, RotateCcw } from 'lucide-react';
import { audio } from '../../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDemoData
}) => {
  const handleToggleSound = () => {
    const updated = !settings.soundEnabled;
    audio.setEnabled(updated);
    if (updated) audio.playClick();
    onUpdateSettings({ ...settings, soundEnabled: updated });
  };

  const handleAccentChange = (accent: AppSettings['themeAccent']) => {
    audio.playSelect();
    onUpdateSettings({ ...settings, themeAccent: accent });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres de l'Application"
      subtitle="Personnalisation de l'interface, effets sonores et version Star Citizen"
      icon={<Settings className="w-5 h-5 text-sc-cyan" />}
      maxWidth="md"
    >
      <div className="space-y-5 font-sans">
        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-sc-card/60 rounded-xl border border-sc-border">
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-sc-cyan" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-sans">Effets Sonores Sci-Fi</h4>
              <p className="text-xs font-mono text-slate-400">Bips et signaux HUD de Star Citizen</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.soundEnabled ? 'bg-sc-cyan' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-1 ${
                settings.soundEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Theme Accent Color */}
        <div className="p-3.5 bg-sc-card/60 rounded-xl border border-sc-border space-y-2.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-sc-cyan" />
            <h4 className="text-sm font-bold text-slate-100 font-sans">Couleur d'Accent HUD</h4>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {[
              { id: 'cyan', label: 'Drake Cyan', color: 'bg-cyan-400' },
              { id: 'gold', label: 'Anvil Gold', color: 'bg-amber-400' },
              { id: 'green', label: 'Crusader Green', color: 'bg-emerald-400' },
              { id: 'red', label: 'Aegis Red', color: 'bg-rose-500' },
              { id: 'purple', label: 'Banu Purple', color: 'bg-purple-400' }
            ].map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleAccentChange(theme.id as AppSettings['themeAccent'])}
                className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                  settings.themeAccent === theme.id
                    ? 'border-sc-cyan bg-sc-panel shadow-neon-cyan ring-1 ring-sc-cyan'
                    : 'border-slate-800 bg-sc-panel/50 hover:bg-sc-panel'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${theme.color} shadow-sm`} />
                <span className="text-[10px] font-mono text-slate-300 truncate w-full text-center">
                  {theme.label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Game Version & API Source */}
        <div className="p-3.5 bg-sc-card/60 rounded-xl border border-sc-border space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sc-cyan" />
            <h4 className="text-sm font-bold text-slate-100 font-sans">Source de Données Star Citizen</h4>
          </div>
          <p className="text-xs font-mono text-slate-400">
            API : <code className="text-sc-cyan">api.star-citizen.wiki</code> (OpenAPI 3.0)
          </p>
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
            <span>Version de jeu ciblée :</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sc-cyan border border-slate-700">
              {settings.gameVersion}
            </span>
          </div>
        </div>

        {/* Reset / Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              audio.playSuccess();
              onResetDemoData();
              onClose();
            }}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-sc-panel border border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
