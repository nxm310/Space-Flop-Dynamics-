import React, { useState, useRef } from 'react';
import { RefinedStockItem, AppDataBackup } from '../../types';
import { ImportExportService, ImportResult } from '../../services/importExportService';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface ImportExportViewProps {
  stock: RefinedStockItem[];
  onImportStock: (items: RefinedStockItem[], mode: 'replace' | 'merge') => void;
  onRestoreBackup: (backup: AppDataBackup) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  stock,
  onImportStock,
  onRestoreBackup
}) => {
  const [importResult, setImportResult] = useState<ImportResult<RefinedStockItem> | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-sc-cyan" />
          Centre d'Import & Export de Données
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Importez vos tableaux Excel / CSV ou sauvegardez l'intégralité de votre système
        </p>
      </div>

      {/* Success Notification */}
      {backupSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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

                {/* Errors list */}
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
                  {/* Mode Selector */}
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

                  {/* Confirm Import Button */}
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
          </div>
        </div>
      </div>
    </div>
  );
};
