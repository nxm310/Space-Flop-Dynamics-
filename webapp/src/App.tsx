import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CrafterDashboard } from './components/CrafterDashboard';
import { HostSettingsModal } from './components/HostSettingsModal';
import { Shield, Hammer } from 'lucide-react';

const MainContent: React.FC = () => {
  const [isHostSettingsOpen, setIsHostSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col justify-between scifi-grid bg-slate-950 text-slate-100">
      <div>
        {/* Top Master Crafter Navigation */}
        <Navbar onOpenHostSettings={() => setIsHostSettingsOpen(true)} />

        {/* Main Dashboard View */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CrafterDashboard />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/95 py-5 px-4 font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Hammer className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">
              Star Citizen | Console Maître des Fabrications • Gestion des Blueprints, Minerais & Commandes Clients
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-cyan-400/80">Extraction Excel/CSV 100% Fidèle</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Atelier Opérationnel</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Configuration Modals */}
      <HostSettingsModal isOpen={isHostSettingsOpen} onClose={() => setIsHostSettingsOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
