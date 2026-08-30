import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Hammer, 
  Layers, 
  ScrollText, 
  PackageCheck, 
  BookOpen, 
  Radio, 
  Settings, 
  Zap, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenHostSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHostSettings }) => {
  const { activeTab, setActiveTab, telemetry, isAgentConnected, orders, inventory, blueprints, refreshAgentData } = useApp();

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const inStockCount = inventory.filter(i => i.quantity > 0).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/30 bg-slate-950/90 backdrop-blur-md">
      {/* Top Telemetry & PC Sync Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isAgentConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-400">Agent PC Hôte :</span>
            <span className={isAgentConnected ? 'text-emerald-300 font-bold' : 'text-amber-400'}>
              {isAgentConnected ? 'CONNECTÉ (Port 5500)' : 'MODE AUTONOME'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Star Citizen Live :</span>
            <span className={telemetry?.game_running ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {telemetry?.game_running ? `En Jeu (${telemetry.current_location})` : 'Jeu Fermé'}
            </span>
          </div>

          {telemetry?.current_ship && telemetry.current_ship !== 'Aucun' && (
            <div className="hidden md:flex items-center space-x-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Vaisseau :</span>
              <span className="text-amber-300 font-semibold">{telemetry.current_ship}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <button
            onClick={refreshAgentData}
            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-0.5 rounded border border-cyan-500/40 text-[11px] font-mono transition-all"
            title="Rafraîchir les données de l'ordinateur"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Sync Live</span>
          </button>

          <button
            onClick={onOpenHostSettings}
            className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-0.5 rounded border border-slate-700 text-[11px] font-mono transition-all"
            title="Configurer l'emplacement Star Citizen"
          >
            <Settings className="w-3 h-3 text-slate-400" />
            <span>⚙️ Config SC</span>
          </button>

          <span className="hidden lg:inline text-cyan-400/80 font-bold tracking-wider text-[11px]">
            BUILD : {telemetry?.version || '4.9.188'}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-800 p-0.5 shadow-lg shadow-cyan-950">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Hammer className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-orbitron font-bold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-teal-300">
                MASTER CRAFTER
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                HÔTE ATELIER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Gestionnaire de Fabrications, Stocks de Minerais & Commandes Clients
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {/* Tab 1: Stocks & Minerals */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-bold tracking-wide flex items-center space-x-1.5 transition-all ${
              activeTab === 'inventory'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Stocks Minerais</span>
            {inStockCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'inventory' ? 'bg-black text-cyan-300' : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}>
                {inStockCount}
              </span>
            )}
          </button>

          {/* Tab 2: Owned Blueprints */}
          <button
            onClick={() => setActiveTab('blueprints')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-bold tracking-wide flex items-center space-x-1.5 transition-all ${
              activeTab === 'blueprints'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>2. Mes Blueprints ({blueprints.length})</span>
          </button>

          {/* Tab 3: Orders Management */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-bold tracking-wide flex items-center space-x-1.5 transition-all relative ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>3. Commandes Clients</span>
            {activeOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'
              }`}>
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Tab 4: Global SC Database */}
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-rajdhani font-bold tracking-wide flex items-center space-x-1.5 transition-all ${
              activeTab === 'database'
                ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">4. Base Web SC</span>
            <span className="sm:hidden">Base SC</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
