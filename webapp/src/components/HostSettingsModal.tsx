import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FolderSearch, 
  HardDrive, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  User, 
  Save,
  RefreshCw
} from 'lucide-react';

interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AGENT_API_URL = 'http://127.0.0.1:5500/api';

export const HostSettingsModal: React.FC<HostSettingsModalProps> = ({ isOpen, onClose }) => {
  const { isAgentConnected, refreshAgentData } = useApp();
  const { isHost } = useAuth();

  const [scPath, setScPath] = useState<string>('C:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE');
  const [callsign, setCallsign] = useState<string>('Host-MasterCrafter');
  const [orgName, setOrgName] = useState<string>('Aegis Syndicate');
  const [primaryHangar, setPrimaryHangar] = useState<string>('Lorville / HUR-L1');
  
  const [detectedPaths, setDetectedPaths] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [logFileExists, setLogFileExists] = useState<boolean>(false);
  const [logFileSize, setLogFileSize] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Fetch current agent configuration
  const fetchConfig = async () => {
    if (!isAgentConnected) return;
    try {
      const res = await fetch(`${AGENT_API_URL}/config`);
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setScPath(data.config.sc_install_path || '');
          if (data.config.crafter_profile) {
            setCallsign(data.config.crafter_profile.callsign || 'Host-MasterCrafter');
            setOrgName(data.config.crafter_profile.org || 'Aegis Syndicate');
            setPrimaryHangar(data.config.crafter_profile.primary_hangar || 'Lorville / HUR-L1');
          }
        }
        if (data.detected_installations) {
          setDetectedPaths(data.detected_installations);
        }
        setLogFileExists(data.log_file_exists || false);
        setLogFileSize(data.log_file_size || 0);
      }
    } catch (e) {
      console.warn('Error fetching agent config', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen, isAgentConnected]);

  if (!isOpen) return null;

  // Auto-detection trigger
  const handleAutoDetect = async () => {
    setIsScanning(true);
    await fetchConfig();
    setIsScanning(false);
  };

  // Submit new config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${AGENT_API_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sc_install_path: scPath,
          crafter_profile: {
            callsign,
            org: orgName,
            primary_hangar: primaryHangar
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLogFileExists(data.log_file_exists);
        setLogFileSize(data.log_file_size);
        setIsSaved(true);
        refreshAgentData();
        setTimeout(() => {
          setIsSaved(false);
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error('Error saving config', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="scifi-card max-w-xl w-full rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-500/40 text-cyan-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">
              Configuration de l'Hôte & Star Citizen
            </h3>
            <p className="text-xs font-mono text-cyan-400">
              Paramètres d'emplacement du jeu sur votre PC & Profil Artisan
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 font-mono leading-relaxed">
          Cette fenêtre permet à <strong>n'importe quel joueur qui héberge l'atelier</strong> d'indiquer où se trouve son installation Star Citizen afin que l'agent lise ses propres fichiers en direct.
        </p>

        {isSaved ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-orbitron font-bold text-lg text-emerald-300">
              Configuration Enregistrée avec Succès !
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              L'agent surveille désormais votre dossier Star Citizen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-4 font-mono text-xs">
            {/* Auto-detect button */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <FolderSearch className="w-4 h-4 text-cyan-400" />
                  <span>Détection Automatique Star Citizen :</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  disabled={isScanning}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs flex items-center space-x-1 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scan des disques...' : 'Scanner mes disques'}</span>
                </button>
              </div>

              {detectedPaths && detectedPaths.length > 0 ? (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-emerald-400 block">
                    ✓ {detectedPaths.length} installation(s) Star Citizen détectée(s) :
                  </span>
                  {detectedPaths.map((d, i) => (
                    <div
                      key={i}
                      onClick={() => setScPath(d.path)}
                      className="p-2 rounded bg-slate-950 hover:bg-cyan-950/40 border border-emerald-500/30 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <span className="text-slate-200 font-bold group-hover:text-cyan-300 truncate">
                        {d.path}
                      </span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded shrink-0 ml-2">
                        {(d.log_size / 1024).toFixed(0)} KB (Sélectionner)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 block">
                  Cliquez sur « Scanner mes disques » pour rechercher automatiquement sur C:, D:, E:, F:...
                </span>
              )}
            </div>

            {/* Manual Path Input */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">
                Chemin du dossier Star Citizen (LIVE) :
              </label>
              <input
                type="text"
                required
                value={scPath}
                onChange={(e) => setScPath(e.target.value)}
                placeholder="Ex: C:\Program Files\Roberts Space Industries\StarCitizen\LIVE"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Exemples courants : <code>C:\Program Files\Roberts Space Industries\StarCitizen\LIVE</code> ou <code>D:\SC\StarCitizen\LIVE</code>
              </span>
            </div>

            {/* Path status check badge */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Statut du fichier Game.log :</span>
              {logFileExists ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Trouvé & Valide ({(logFileSize / 1024).toFixed(1)} KB)</span>
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center space-x-1 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>En attente de validation / Fichier introuvable</span>
                </span>
              )}
            </div>

            {/* Crafter Profile Settings */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Profil de l'Hôte & Base d'Opérations</span>
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Callsign / Pseudo SC de l'Hôte :</label>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Organisation / Guilde :</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hangar / Raffinerie Principale :</label>
                <input
                  type="text"
                  value={primaryHangar}
                  onChange={(e) => setPrimaryHangar(e.target.value)}
                  placeholder="Ex: HUR-L1 Green Glade Station ou Lorville"
                  className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full scifi-button py-3 rounded-lg text-cyan-200 font-bold font-rajdhani text-sm shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2 mt-2"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>Enregistrer l'Emplacement & Démarrer la Surveillance</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
