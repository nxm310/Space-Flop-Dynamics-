import React, { useState, useRef } from 'react';
import { RefinedStockItem, AppDataBackup } from '../../types';
import { ImportExportService, ImportResult } from '../../services/importExportService';
import { GameLogParserService, GameLogAnalysisResult } from '../../services/gameLogParserService';
import { StorageService } from '../../services/storageService';
import { Badge } from '../common/Badge';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Terminal,
  Sparkles,
  User,
  Clock,
  Layers,
  Check,
  Copy,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface ImportExportViewProps {
  stock: RefinedStockItem[];
  onImportStock: (items: RefinedStockItem[], mode: 'replace' | 'merge') => void;
  onRestoreBackup: (backup: AppDataBackup) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  stock,
  onImportStock,
  onRestoreBackup,
  onNavigateToTab
}) => {
  // Mineral Import State
  const [importResult, setImportResult] = useState<ImportResult<RefinedStockItem> | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [backupSuccessMessage, setBackupSuccessMessage] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);

  // Game.log Parsing State
  const [logAnalysisResult, setLogAnalysisResult] = useState<GameLogAnalysisResult | null>(null);
  const [isParsingLogs, setIsParsingLogs] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'new' | 'already_unlocked' | 'unmatched'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const logFileInputRef = useRef<HTMLInputElement>(null);

  const GAME_LOG_DEFAULT_PATH = 'C:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log';

  const handleCopyLogPath = () => {
    audio.playClick();
    navigator.clipboard.writeText(GAME_LOG_DEFAULT_PATH);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 3000);
  };

  // Process Game.log upload (Single or Multiple files)
  const handleLogFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    audio.playClick();
    setIsParsingLogs(true);
    setSyncSuccessMessage('');

    try {
      const filePayloads: { name: string; content: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        filePayloads.push({
          name: file.name,
          content: text
        });
      }

      const result = GameLogParserService.parseLogFiles(filePayloads);
      setLogAnalysisResult(result);

      if (result.blueprintsFound.length > 0) {
        audio.playSuccess();
      } else {
        audio.playAlert();
      }
    } catch (err) {
      console.error('Error parsing Game.log:', err);
      audio.playAlert();
    } finally {
      setIsParsingLogs(false);
      if (logFileInputRef.current) logFileInputRef.current.value = '';
    }
  };

  // Sync discovered blueprints to "Mes Blueprints"
  const handleSyncAllDiscoveredBlueprints = () => {
    if (!logAnalysisResult) return;
    audio.playSuccess();

    // Extract all matched blueprint IDs
    const idsToUnlock = logAnalysisResult.blueprintsFound
      .filter(b => b.matchedBlueprint)
      .map(b => b.matchedBlueprint!.id);

    if (idsToUnlock.length > 0) {
      const { addedCount, totalCount } = StorageService.unlockBlueprintIds(idsToUnlock);

      // Re-run parsing analysis against newly updated storage
      const updatedFound = logAnalysisResult.blueprintsFound.map(b => {
        if (b.matchedBlueprint) {
          return {
            ...b,
            isAlreadyUnlocked: true,
            status: 'matched_already_unlocked' as const
          };
        }
        return b;
      });

      setLogAnalysisResult({
        ...logAnalysisResult,
        blueprintsFound: updatedFound,
        newMatchesCount: 0,
        alreadyUnlockedCount: logAnalysisResult.matchedCount
      });

      setSyncSuccessMessage(
        `🎉 ${addedCount} nouveau(x) blueprint(s) ont été synchronisés et activés dans "Mes Blueprints" ! (Total atelier : ${totalCount} blueprints)`
      );
    }
  };

  // Mineral File Upload Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audio.playClick();
    try {
      const result = await ImportExportService.importMineralsFromFile(file);
      setImportResult(result);
      if (result.success) {
        audio.playSuccess();
      } else {
        audio.playAlert();
      }
    } catch {
      audio.playAlert();
    }
  };

  const handleApplyImport = () => {
    if (!importResult || !importResult.success || importResult.data.length === 0) return;
    audio.playSuccess();
    onImportStock(importResult.data, importMode);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackupExportJSON = () => {
    audio.playClick();
    ImportExportService.exportFullBackupJSON();
    setBackupSuccessMessage('Sauvegarde JSON générée et téléchargée avec succès.');
    setTimeout(() => setBackupSuccessMessage(''), 4000);
  };

  const handleBackupImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audio.playClick();
    try {
      const backup = await ImportExportService.importFullBackupJSON(file);
      if (backup) {
        audio.playSuccess();
        onRestoreBackup(backup);
        setBackupSuccessMessage('Toutes les données ont été restaurées depuis le fichier JSON.');
        setTimeout(() => setBackupSuccessMessage(''), 4000);
      } else {
        audio.playAlert();
        alert('Le fichier JSON de sauvegarde est invalide ou corrompu.');
      }
    } catch {
      audio.playAlert();
      alert('Erreur lors de la lecture du fichier JSON.');
    } finally {
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
    }
  };

  // Filtered log blueprints
  const filteredLogBlueprints = logAnalysisResult?.blueprintsFound.filter(bp => {
    if (logStatusFilter === 'new' && bp.status !== 'matched_new') return false;
    if (logStatusFilter === 'already_unlocked' && bp.status !== 'matched_already_unlocked') return false;
    if (logStatusFilter === 'unmatched' && bp.status !== 'unmatched_custom') return false;

    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      const matchName = bp.matchedBlueprint?.name.toLowerCase() || '';
      const rawName = bp.rawName.toLowerCase();
      const cat = bp.matchedBlueprint?.category.toLowerCase() || '';
      return matchName.includes(q) || rawName.includes(q) || cat.includes(q);
    }
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
          <Terminal className="w-7 h-7 text-sc-cyan" />
          Centre d'Import & Export de Données
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Synchronisez vos blueprints via votre <strong>Game.log</strong>, importez vos tableaux Excel/CSV ou effectuez une sauvegarde complète
        </p>
      </div>

      {/* Global Success Notification */}
      {backupSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupSuccessMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: STAR CITIZEN GAME.LOG BLUEPRINT EXTRACTOR (FEATURE MAJEURE) */}
      {/* ========================================================================= */}
      <div className="bg-sc-card border-2 border-sc-cyan/40 shadow-xl shadow-cyan-950/30 rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Holographic Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sc-cyan/15 border border-sc-cyan/30 text-sc-cyan shadow-neon-cyan shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="cyan" size="sm">Nouveau • Module StarEngine</Badge>
                <span className="text-[10px] font-mono text-slate-400">100% Local & Sécurisé</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-100 uppercase mt-0.5">
                Analyseur & Importateur Game.log (Blueprints Débloqués)
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Glissez votre fichier <code className="text-sc-cyan font-bold">Game.log</code> pour extraire instantanément toutes les recettes d'artisanat débloquées dans vos sessions
              </p>
            </div>
          </div>

          {/* Path helper & Copy button */}
          <div className="flex items-center gap-2 bg-[#080d17] border border-slate-800 px-3 py-2 rounded-xl">
            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="text-[11px] font-mono text-slate-300 truncate max-w-[280px] sm:max-w-md" title={GAME_LOG_DEFAULT_PATH}>
              {GAME_LOG_DEFAULT_PATH}
            </div>
            <button
              onClick={handleCopyLogPath}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-sc-cyan/20 border border-slate-700 hover:border-sc-cyan/40 text-slate-300 hover:text-sc-cyan text-xs transition-colors shrink-0"
              title="Copier le chemin dans le presse-papier"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onClick={() => logFileInputRef.current?.click()}
          className="border-2 border-dashed border-sc-cyan/50 hover:border-sc-cyan bg-sc-panel/80 hover:bg-[#0b1424] rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group"
        >
          <input
            ref={logFileInputRef}
            type="file"
            accept=".log, .txt"
            multiple
            onChange={handleLogFilesChange}
            className="hidden"
          />

          {isParsingLogs ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-10 h-10 text-sc-cyan animate-spin" />
              <p className="text-sm font-bold font-sans text-slate-100">
                Analyse des fichiers logs en cours...
              </p>
              <p className="text-xs font-mono text-slate-400">
                Balayage des lignes de déblocage d'artisanat & correspondances avec le catalogue
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-sc-cyan/10 border border-sc-cyan/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-sc-cyan" />
              </div>
              <p className="text-base font-bold text-slate-100 font-sans">
                Cliquez ou glissez-déposez votre <span className="text-sc-cyan">Game.log</span> ici
              </p>
              <p className="text-xs font-mono text-slate-400 max-w-xl mx-auto">
                Astuce : Vous pouvez également sélectionner <strong className="text-slate-200">plusieurs fichiers</strong> dans le dossier <code className="text-purple-300 font-bold">\StarCitizen\LIVE\logbackups\</code> pour importer l'historique de toutes vos sessions passées !
              </p>
            </div>
          )}
        </div>

        {/* Sync Success Message */}
        {syncSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => {
                  audio.playClick();
                  onNavigateToTab('blueprints');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Accéder à Mon Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Analysis Results Display */}
        {logAnalysisResult && (
          <div className="space-y-5 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
            {/* Session & Player Metadata Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#080d17] border border-slate-800 flex items-center gap-3">
                <User className="w-4 h-4 text-sc-cyan shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Pilote Détecté</span>
                  <strong className="text-slate-200 text-sm">{logAnalysisResult.playerHandle || 'Non identifié'}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080d17] border border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Version Jeu</span>
                  <strong className="text-slate-200 text-sm">{logAnalysisResult.gameVersion || 'Star Citizen LIVE'}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080d17] border border-slate-800 flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Fichiers & Lignes</span>
                  <strong className="text-slate-200 text-sm">
                    {logAnalysisResult.totalLogFilesParsed} fichier(s) • {logAnalysisResult.totalLinesScanned.toLocaleString('fr-FR')} lignes
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080d17] border border-slate-800 flex items-center gap-3">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Blueprints Détectés</span>
                  <strong className="text-amber-300 text-sm">
                    {logAnalysisResult.blueprintsFound.length} recettes uniques
                  </strong>
                </div>
              </div>
            </div>

            {/* Action & Filter Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-[#080d17] border border-slate-800">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
                <button
                  onClick={() => {
                    audio.playClick();
                    setLogStatusFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    logStatusFilter === 'all'
                      ? 'bg-sc-cyan text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  Tous ({logAnalysisResult.blueprintsFound.length})
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    setLogStatusFilter('new');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    logStatusFilter === 'new'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60'
                  }`}
                >
                  À Activer ({logAnalysisResult.newMatchesCount})
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    setLogStatusFilter('already_unlocked');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    logStatusFilter === 'already_unlocked'
                      ? 'bg-slate-700 text-slate-100 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  Déjà dans l'Atelier ({logAnalysisResult.alreadyUnlockedCount})
                </button>

                {logAnalysisResult.unmatchedCustomCount > 0 && (
                  <button
                    onClick={() => {
                      audio.playClick();
                      setLogStatusFilter('unmatched');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      logStatusFilter === 'unmatched'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60'
                    }`}
                  >
                    Non répertoriés ({logAnalysisResult.unmatchedCustomCount})
                  </button>
                )}
              </div>

              {/* Search & Sync Buttons */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filtrer un blueprint..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="px-3 py-1.5 bg-[#0b1220] border border-slate-700 focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />

                <button
                  onClick={handleSyncAllDiscoveredBlueprints}
                  disabled={logAnalysisResult.newMatchesCount === 0}
                  className="px-4 py-2 rounded-xl bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Activer {logAnalysisResult.newMatchesCount} dans Mes Blueprints</span>
                </button>
              </div>
            </div>

            {/* Blueprints Table Preview */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#080d17]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0b1220] text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4 font-semibold">#</th>
                    <th className="py-2.5 px-4 font-semibold">Blueprint Extrait du Log</th>
                    <th className="py-2.5 px-4 font-semibold">Correspondance Catalogue</th>
                    <th className="py-2.5 px-4 font-semibold">Statut Atelier</th>
                    <th className="py-2.5 px-4 font-semibold">Horodatage / Fichier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogBlueprints.length > 0 ? (
                    filteredLogBlueprints.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-4">
                          <strong className="text-slate-100 font-sans block">{item.rawName}</strong>
                          <span className="text-[10px] text-slate-500">Source : {item.sourceFile}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          {item.matchedBlueprint ? (
                            <div>
                              <span className="text-sc-cyan font-bold">{item.matchedBlueprint.name}</span>
                              <span className="text-[10px] text-slate-400 block uppercase">
                                {item.matchedBlueprint.category} {item.matchedBlueprint.typeLabel ? `• ${item.matchedBlueprint.typeLabel}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-400 italic text-[11px]">Non catalogué officiel</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {item.status === 'matched_new' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                              ✨ Prêt à activer
                            </span>
                          )}
                          {item.status === 'matched_already_unlocked' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              ✓ Déjà dans l'Atelier
                            </span>
                          )}
                          {item.status === 'unmatched_custom' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
                              Recette personnalisée
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString('fr-FR') : 'Session active'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Aucun blueprint ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: MINERALS & BACKUP EXPORT / IMPORT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: IMPORT EXCEL / CSV */}
        <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Upload className="w-5 h-5 text-sc-cyan" />
            <div>
              <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                Importer un Tableau de Minerais (Excel / CSV)
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Glissez-déposez ou sélectionnez un fichier .xlsx ou .csv
              </p>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-sc-border hover:border-sc-cyan/60 bg-sc-panel/60 hover:bg-sc-panel rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 text-slate-500 group-hover:text-sc-cyan mx-auto mb-2 transition-colors" />
            <p className="text-sm font-semibold text-slate-200 font-sans">
              Cliquez pour sélectionner un fichier Excel (.xlsx) ou CSV
            </p>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Colonnes reconnues : <code className="text-sc-cyan">Minerai / Matériaux</code>, <code className="text-sc-cyan">Type</code>, <code className="text-sc-cyan">Qualité</code>, <code className="text-sc-cyan">Quantité</code>, <code className="text-sc-cyan">Notes</code>
            </p>
          </div>

          {/* Import Result Preview */}
          {importResult && (
            <div className="space-y-3 pt-2">
              <div className={`p-3.5 rounded-xl border font-mono text-xs ${
                importResult.success ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold flex items-center gap-1.5 ${importResult.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {importResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {importResult.data.length} minerais identifiés sur {importResult.totalRows} lignes
                  </span>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-rose-300 text-[11px] space-y-1 max-h-24 overflow-y-auto">
                    {importResult.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>

              {importResult.success && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-sc-cyan focus:ring-sc-cyan"
                      />
                      <span>Fusionner avec le stock existant</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-sc-cyan focus:ring-sc-cyan"
                      />
                      <span className="text-amber-300">Remplacer tout le stock</span>
                    </label>
                  </div>

                  <button
                    onClick={handleApplyImport}
                    className="w-full py-2.5 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-cyan transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider l'importation de {importResult.data.length} minerais
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EXPORT AND FULL BACKUP */}
        <div className="space-y-6">
          {/* Quick Exports Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Exporter Mes Données Actuelles
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Téléchargez vos stocks et commandes pour vos tableurs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  audio.playClick();
                  ImportExportService.exportMineralsToExcel(stock);
                }}
                disabled={stock.length === 0}
                className="p-3.5 rounded-xl border border-sc-border bg-sc-panel hover:bg-slate-800 hover:border-emerald-500/50 text-left transition-all group disabled:opacity-40"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans text-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Stock Minerais (Excel)</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Format .xlsx avec formules et colonnes formatées
                </p>
              </button>

              <button
                onClick={() => {
                  audio.playClick();
                  ImportExportService.exportMineralsToCSV(stock);
                }}
                disabled={stock.length === 0}
                className="p-3.5 rounded-xl border border-sc-border bg-sc-panel hover:bg-slate-800 hover:border-sc-cyan/50 text-left transition-all group disabled:opacity-40"
              >
                <div className="flex items-center gap-2 text-sc-cyan font-bold font-sans text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Stock Minerais (CSV)</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Format standard universel .csv
                </p>
              </button>
            </div>
          </div>

          {/* Full Application Backup & Restore Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <FileCode className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Sauvegarde & Restauration Complète (JSON)
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Sauvegardez l'intégralité de l'application (stocks, commandes, fiches clients)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBackupExportJSON}
                className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 font-mono text-xs uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter Sauvegarde JSON</span>
              </button>

              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="p-3 rounded-xl border border-slate-700 bg-sc-panel hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleBackupImportJSON}
                  className="hidden"
                />
                <Upload className="w-4 h-4" />
                <span>Restaurer JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
