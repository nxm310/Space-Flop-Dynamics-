import React, { useState } from 'react';
import { getSavedFirebaseConfig, saveFirebaseConfig } from '../services/firebaseConfig';
import { FirebaseConfigState } from '../types';
import { Settings, X, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<FirebaseConfigState>(getSavedFirebaseConfig());
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({ ...config, isConfigured: !!(config.apiKey && config.projectId) });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="scifi-card max-w-lg w-full rounded-xl p-6 border-cyan-500/50 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-cyan-950/80 rounded-lg border border-cyan-500/40">
            <Settings className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">
              Configuration Cloud Firebase
            </h3>
            <p className="text-xs font-mono text-cyan-400">
              Synchronisation multi-joueurs (~50 joueurs)
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 font-mono leading-relaxed">
          Par défaut, l'application fonctionne déjà en direct avec votre agent Python local (Port 5500) et un stockage persistant.
          Si vous souhaitez héberger la base de données sur Firebase pour vos 50 joueurs, collez votre configuration ci-dessous :
        </p>

        {isSaved ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-orbitron font-bold text-emerald-300">Configuration Enregistrée !</h4>
            <p className="text-xs text-slate-300">Rechargement de la session...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">API Key :</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Project ID :</label>
                <input
                  type="text"
                  placeholder="sc-craft-hub"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Auth Domain :</label>
                <input
                  type="text"
                  placeholder="sc-craft-hub.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">App ID :</label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abcdef"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Storage Bucket :</label>
                <input
                  type="text"
                  placeholder="sc-craft-hub.appspot.com"
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>Console Firebase (Gratuit)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                className="scifi-button py-2 px-5 rounded-lg text-cyan-200 font-bold font-rajdhani text-xs"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
