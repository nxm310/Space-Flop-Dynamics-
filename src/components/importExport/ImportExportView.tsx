import React, { useState, useRef } from 'react';
import { RefinedStockItem, AppDataBackup } from '../../types';
import { ImportExportService, ImportResult } from '../../services/importExportService';
import { StorageService } from '../../services/storageService';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface ImportExportViewProps {
  stock: RefinedStockItem[];
  onImportStock: (items: RefinedStockItem[], mode: 'replace' | 'merge') => void;
  onRestoreBackup: (backup: AppDataBackup) => void;
  onResetDemoData: () => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  stock,
  onImportStock,
  onRestoreBackup,
  onResetDemoData
}) => {
  const [importResult, setImportResult] = useState<ImportResult<RefinedStockItem> | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
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
    if (!importResult || !importResult.success) return;
    audio.playSuccess();
    onImportStock(importResult.data, importMode);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackupExportJSON = () => {
    audio.playClick();
    const backup = StorageService.exportFullBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `star_citizen_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audio.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string) as AppDataBackup;
        const ok = StorageService.importFullBackup(backup);
        if (ok) {
          audio.playSuccess();
          onRestoreBackup(backup);
          setBackupSuccessMessage('Sauvegarde restaurée avec succès !');
          setTimeout(() => setBackupSuccessMessage(''), 4000);
        } else {
          audio.playAlert();
        }
      } catch {
        audio.playAlert();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-sc-cyan" />
          Importation, Exportation & Gestion des Données
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Importez vos tableaux Excel/CSV de minerais, téléchargez vos inventaires et sauvegardez l'état de votre application
        </p>
      </div>

      {backupSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{backupSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
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
              Colonnes reconnues : <code className="text-sc-cyan">Minerai</code>, <code className="text-sc-cyan">Quantité (SCU)</code>, <code className="text-sc-cyan">Propriétaire</code>, <code className="text-sc-cyan">Nom Client</code>, <code className="text-sc-cyan">Notes</code>
            </p>
          </div>

          {/* Download Templates Bar & User CSV Quick Load */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-sc-panel/80 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Modèles vierges à télécharger :</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    audio.playClick();
                    ImportExportService.downloadMineralsTemplateExcel();
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Modèle Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    audio.playClick();
                    ImportExportService.downloadMineralsTemplateCSV();
                  }}
                  className="px-2.5 py-1 rounded bg-sc-cyan/15 hover:bg-sc-cyan/25 border border-sc-cyan/30 text-sc-cyan flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Modèle CSV
                </button>
              </div>
            </div>

            {/* Quick Load User Mineral File (257 entries) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sc-cyan/10 via-sc-card to-cyan-950/20 border border-sc-cyan/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <div className="flex items-center gap-2 text-slate-200 font-bold">
                  <Sparkles className="w-4 h-4 text-sc-cyan" />
                  <span>Mon Fichier de Minerais Enregistré (257 lots)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quantainium, Janalite, Feynmaline, Dolivine, Hadanite, Beryl, Savrilium, Aslarite, etc.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="./mes_minerais.csv"
                  download="mes_minerais.csv"
                  onClick={() => audio.playClick()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-sc-cyan" />
                  <span>Télécharger CSV</span>
                </a>
                <button
                  onClick={() => {
                    audio.playSuccess();
                    const userStock = StorageService.getUserPreloadedStock();
                    onImportStock(userStock, 'replace');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Charger dans mon stock</span>
                </button>
              </div>
            </div>
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
                  <div className="text-amber-300 text-[11px] space-y-0.5 max-h-24 overflow-y-auto mb-2">
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>⚠ {err}</p>
                    ))}
                    {importResult.errors.length > 5 && (
                      <p>...et {importResult.errors.length - 5} autre(s) avertissement(s)</p>
                    )}
                  </div>
                )}

                {/* Import Mode Options */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-sc-cyan"
                    />
                    <span>Fusionner avec le stock existant</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-sc-cyan"
                    />
                    <span className="text-amber-400">Remplacer tout le stock</span>
                  </label>
                </div>
              </div>

              {/* Confirm Import Button */}
              {importResult.success && (
                <button
                  onClick={handleApplyImport}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400 shadow-neon-green text-xs font-mono uppercase tracking-wider transition-all duration-200"
                >
                  Valider l'importation de {importResult.data.length} minerais
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EXPORT & BACKUP */}
        <div className="space-y-6">
          {/* Export Options Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Exporter les Données
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
                  Sauvegardez l'intégralité de l'application (stocks, commandes, raffinerie)
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

            {/* Reset / Demo Data */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Données de démonstration :</span>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser avec données démo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          audio.playSuccess();
          onResetDemoData();
        }}
        title="Réinitialiser avec les données de démo ?"
        message="Cette action remplacera toutes vos données actuelles par les données types réalistes de Star Citizen. Êtes-vous sûr ?"
        variant="warning"
      />
    </div>
  );
};
