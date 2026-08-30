import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Hammer, 
  Package, 
  ScrollText, 
  Radio, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  Zap, 
  Flame,
  UserCheck,
  Box
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenHostSettings: () => void;
}

const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenFirebaseConfig, onOpenHostSettings }) => {
  const { currentUser, isAuthenticated, isHost, logout, switchRole } = useAuth();
  const { activeTab, setActiveTab, telemetry, isAgentConnected, orders, resourceRequests } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const activeRequestsCount = resourceRequests.filter(r => r.status === 'open').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-md">
      {/* Top telemetry ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className={`h-2 w-2 rounded-full ${isAgentConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-400">Agent Local :</span>
            <span className={isAgentConnected ? 'text-cyan-300 font-semibold' : 'text-amber-400'}>
              {isAgentConnected ? 'CONNECTÉ (Port 5500)' : 'HORS LIGNE (Mode Cache)'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>SC Live :</span>
            <span className={telemetry?.game_running ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
              {telemetry?.game_running ? `En Jeu (${telemetry.current_location})` : 'Jeu Fermé / En attente'}
            </span>
          </div>

          {telemetry?.current_ship && telemetry.current_ship !== 'Aucun vaisseau actif' && (
            <div className="hidden md:flex items-center space-x-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Vaisseau :</span>
              <span className="text-amber-300">{telemetry.current_ship}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <button
            onClick={onOpenHostSettings}
            className="flex items-center space-x-1 hover:text-cyan-300 transition-colors text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-0.5 rounded border border-cyan-500/40"
            title="Configurer l'emplacement du jeu Star Citizen"
          >
            <Settings className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] font-bold">⚙️ Emplacement SC</span>
          </button>

          <span className="hidden lg:inline text-cyan-400/70 font-semibold tracking-wider">
            VERSION SC : {telemetry?.version || '4.9.188'}
          </span>
          <button
            onClick={onOpenFirebaseConfig}
            className="flex items-center space-x-1 hover:text-cyan-300 transition-colors text-slate-400 hover:bg-slate-800 px-2 py-0.5 rounded"
            title="Configurer Firebase"
          >
            <Settings className="w-3 h-3" />
            <span className="text-[11px]">Firebase</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Hammer className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-orbitron font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">
                AEGIS MOBIGLAS
              </span>
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                CRAFT HUB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Atelier Artisanal & Réquisitions de Minerais
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-semibold tracking-wide flex items-center space-x-2 transition-all ${
              activeTab === 'catalog'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <ScrollText className="w-4 h-4 text-cyan-400" />
            <span>Plans de l'Hôte</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-semibold tracking-wide flex items-center space-x-2 transition-all relative ${
              activeTab === 'requests'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Demandes Minerais</span>
            {activeRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                {activeRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-semibold tracking-wide flex items-center space-x-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm shadow-sky-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Mes Commandes</span>
            <span className="sm:hidden">Commandes</span>
          </button>

          {isHost && (
            <button
              onClick={() => setActiveTab('crafter')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-semibold tracking-wide flex items-center space-x-2 transition-all relative ${
                activeTab === 'crafter'
                  ? 'bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20'
                  : 'text-emerald-400/90 hover:bg-emerald-950/40 hover:text-emerald-300 border border-emerald-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Dashboard Artisan (Hôte)</span>
              <span className="md:hidden">Atelier Hôte</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Quick Role Switcher for instant testing */}
              <div className="hidden xl:flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => switchRole('host_crafter')}
                  className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                    isHost ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Hammer className="w-3 h-3" />
                  <span>Hôte</span>
                </button>
                <button
                  onClick={() => switchRole('member')}
                  className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                    !isHost ? 'bg-[#5865F2] text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Joueur (~50)</span>
                </button>
              </div>

              {/* Discord User badge */}
              <div className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-[#5865F2]/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-none flex items-center space-x-1">
                    <span>{currentUser.displayName}</span>
                    <DiscordIcon className="w-3 h-3 text-[#5865F2]" />
                  </div>
                  <div className="text-[10px] text-[#5865F2] font-mono leading-tight mt-0.5">
                    {currentUser.discordTag || (currentUser.role === 'host_crafter' ? '@HostCrafter' : '@PiloteSC')}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="ml-1 p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Se déconnecter de Discord"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center space-x-2 font-rajdhani shadow-lg shadow-[#5865F2]/25 transition-all"
            >
              <DiscordIcon className="w-4 h-4 text-white" />
              <span>Connexion Discord</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
