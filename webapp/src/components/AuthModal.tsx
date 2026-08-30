import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, CheckCircle2, ShieldAlert, Sparkles, User, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Official Discord SVG Logo Component
const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithDiscord, isLoading } = useAuth();

  const [discordTag, setDiscordTag] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('member');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!discordTag.trim()) {
      setError('Veuillez entrer votre pseudo ou tag Discord.');
      return;
    }

    const cleanTag = discordTag.trim().startsWith('@') ? discordTag.trim() : `@${discordTag.trim()}`;
    const name = displayName.trim() || cleanTag.replace('@', '').split('#')[0];

    const ok = await loginWithDiscord(cleanTag, name, role);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } else {
      setError('Erreur lors de la connexion Discord.');
    }
  };

  const handleQuickDiscordLogin = async (tag: string, name: string, userRole: UserRole, avatar: string) => {
    const ok = await loginWithDiscord(tag, name, userRole, avatar);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="scifi-card max-w-md w-full rounded-2xl p-6 border-[#5865F2]/50 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-[#5865F2]/20 rounded-xl border border-[#5865F2]/40 text-[#5865F2]">
            <DiscordIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">
              Connexion via Discord
            </h3>
            <span className="text-xs font-mono text-[#5865F2]">
              Authentification & Profil Joueur Star Citizen
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-orbitron font-bold text-lg text-emerald-300">
              Connecté avec succès via Discord !
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              Bienvenue sur le hub d'artisanat Star Citizen.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">
                  Votre Pseudo ou Tag Discord :
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5865F2]">
                    <DiscordIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Falcon_42 ou StarPilot#1234"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Nom en jeu / Callsign SC (Optionnel) :
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ex: Ghost_Rider"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#5865F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Rôle :</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-[#5865F2]"
                >
                  <option value="member">Membre Joueur (~50 Pilotes)</option>
                  <option value="host_crafter">Hôte / Master Crafter</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-rajdhani font-bold text-sm shadow-lg shadow-[#5865F2]/25 flex items-center justify-center space-x-2 transition-all"
              >
                <DiscordIcon className="w-5 h-5 text-white" />
                <span>{isLoading ? 'Connexion en cours...' : 'Rejoindre avec Discord'}</span>
              </button>
            </form>

            {/* Quick Demo Discord accounts */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Ou tester en 1-Clic avec un profil Discord de démo :
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDiscordLogin(
                      'HostCrafter#0001',
                      'Master Crafter (Hôte)',
                      'host_crafter',
                      'https://cdn.discordapp.com/embed/avatars/0.png'
                    )
                  }
                  className="p-2 rounded-lg bg-slate-900 hover:bg-[#5865F2]/20 border border-[#5865F2]/40 text-left transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt="Host"
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <strong className="block text-white text-xs font-sans">★ Hôte Artisan</strong>
                      <span className="text-[10px] text-[#5865F2] font-mono">@HostCrafter</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickDiscordLogin(
                      'StarPilot#4242',
                      'StarPilot_Max',
                      'member',
                      'https://cdn.discordapp.com/embed/avatars/1.png'
                    )
                  }
                  className="p-2 rounded-lg bg-slate-900 hover:bg-sky-500/20 border border-sky-500/40 text-left transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/1.png"
                      alt="Player"
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <strong className="block text-white text-xs font-sans">Joueur Membre</strong>
                      <span className="text-[10px] text-sky-400 font-mono">@StarPilot</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
