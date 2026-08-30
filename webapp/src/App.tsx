import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BlueprintCatalog } from './components/BlueprintCatalog';
import { ResourceRequestsView } from './components/ResourceRequestsView';
import { PlayerOrdersView } from './components/PlayerOrdersView';
import { CrafterDashboard } from './components/CrafterDashboard';
import { AuthModal } from './components/AuthModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { CreateResourceRequestModal } from './components/CreateResourceRequestModal';
import { HostSettingsModal } from './components/HostSettingsModal';
import { Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState<boolean>(false);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState<boolean>(false);
  const [isHostSettingsOpen, setIsHostSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col justify-between scifi-grid bg-slate-950 text-slate-100">
      <div>
        {/* Navigation */}
        <Navbar
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenFirebaseConfig={() => setIsFirebaseOpen(true)}
          onOpenHostSettings={() => setIsHostSettingsOpen(true)}
        />

        {/* View container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'catalog' && <BlueprintCatalog />}
          {activeTab === 'requests' && (
            <ResourceRequestsView onOpenCreateModal={() => setIsCreateRequestOpen(true)} />
          )}
          {activeTab === 'orders' && <PlayerOrdersView />}
          {activeTab === 'crafter' && (
            <CrafterDashboard onOpenCreateRequestModal={() => setIsCreateRequestOpen(true)} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/90 py-6 px-4 font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">
              Star Citizen Companion Hub • Détection multi-disques & surveillance en direct
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-cyan-400/80">Architecture Multi-Joueurs (Capacité : ~50 Membres)</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Système Opérationnel</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <FirebaseConfigModal isOpen={isFirebaseOpen} onClose={() => setIsFirebaseOpen(false)} />
      <CreateResourceRequestModal isOpen={isCreateRequestOpen} onClose={() => setIsCreateRequestOpen(false)} />
      <HostSettingsModal isOpen={isHostSettingsOpen} onClose={() => setIsHostSettingsOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
