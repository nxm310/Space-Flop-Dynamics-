import React, { useState, useRef } from 'react';
import { RefinedStockItem, AppDataBackup } from '../../types';
import { ImportExportService, ImportResult, QuantityImportUnit } from '../../services/importExportService';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles
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
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [quantityUnit, setQuantityUnit] = useState<QuantityImportUnit>('auto');
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
    setCurrentFile(file);
    try {
      const result = await ImportExportService.importMineralsFromFile(file, quantityUnit);
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

  const handleUnitChange = async (newUnit: QuantityImportUnit) => {
    audio.playClick();
    setQuantityUnit(newUnit);
    if (currentFile) {
      const result = await ImportExportService.importMineralsFromFile(currentFile, newUnit);
      setImportResult(result);
    }
  };

  const handleApplyImport = () => {
    if (!importResult || !importResult.success || importResult.data.length === 0) return;
    audio.playSuccess();
    onImportStock(importResult.data, importMode);
    setImportResult(null);
    setCurrentFile(null);
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
          Importez vos tableaux Excel / CSV (support natif du micro-SCU µSCU et SCU) ou sauvegardez votre système
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
                Glissez-déposez un tableau avec quantités en micro-SCU (µSCU) ou SCU
              </p>
            </div>
          </div>

          {/* Micro-SCU conversion info box */}
          <div className="p-3 rounded-xl bg-sc-cyan/10 border border-sc-cyan/30 text-xs font-mono text-slate-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sc-cyan shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-sc-cyan">Conversion micro-SCU (µSCU) activée :</span>
              <p className="text-[11px] text-slate-300">
                Les valeurs en micro-SCU sont automatiquement converties en SCU (<code className="text-sc-cyan">1 SCU = 1 000 000 µSCU</code>, ex: 809 000 µSCU ➔ 0.809 SCU).
              </p>
            </div>
          </div>

          {/* Unit Selector Toggle */}
          <div className="space-y-1.5 font-mono text-xs">
            <span className="text-slate-400 block text-[11px]">Unité des valeurs dans votre fichier :</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'auto', label: 'Auto Détection', hint: 'Auto' },
                { id: 'micro_scu', label: 'micro-SCU (µSCU)', hint: '÷ 1 000 000' },
                { id: 'scu', label: 'SCU Direct', hint: '1 SCU' },
                { id: 'cscu', label: 'centi-SCU (cSCU)', hint: '÷ 100' }
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleUnitChange(u.id as QuantityImportUnit)}
                  className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                    quantityUnit === u.id
                      ? 'bg-sc-cyan/20 border-sc-cyan text-sc-cyan font-bold shadow-neon-cyan'
                      : 'bg-sc-panel border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px]">{u.label}</span>
                  <span className="text-[9px] text-slate-500">{u.hint}</span>
                </button>
              ))}
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
              {currentFile ? currentFile.name : 'Cliquez pour sélectionner un fichier Excel (.xlsx) ou CSV'}
            </p>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Colonnes reconnues : <code className="text-sc-cyan">Matériaux / Minerai</code>, <code className="text-sc-cyan">Type</code>, <code className="text-sc-cyan">Qualité</code>, <code className="text-sc-cyan">Quantité (µSCU ou SCU)</code>, <code className="text-sc-cyan">Notes</code>
            </p>
          </div>

          {/* Download Blank Templates Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-sc-panel/80 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Modèles vierges (µSCU & SCU) :</span>
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
                  {importResult.success && (
                    <span className="text-[10px] text-sc-cyan bg-sc-cyan/10 px-2 py-0.5 rounded border border-sc-cyan/30">
                      Total : {importResult.data.reduce((a, b) => a + b.quantitySCU, 0).toFixed(3)} SCU
                    </span>
                  )}
                </div>

                {/* Errors list */}
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-rose-300 text-[11px] space-y-1 max-h-24 overflow-y-auto">
                    {importResult.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}

                {/* Sample items preview table */}
                {importResult.success && importResult.data.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-900/60 space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-bold block">Aperçu de la conversion (5 premiers lots) :</span>
                    <div className="space-y-1">
                      {importResult.data.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-black/40 text-[11px]">
                          <span className="text-slate-200 font-semibold">{item.mineralName}</span>
                          <span className="text-sc-cyan font-bold">{item.quantitySCU.toFixed(3)} SCU</span>
                          {item.notes && <span className="text-slate-400 truncate max-w-[150px]">{item.notes}</span>}
                        </div>
                      ))}
                    </div>
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
                    Valider l'importation de {importResult.data.length} minerais ({importResult.data.reduce((a, b) => a + b.quantitySCU, 0).toFixed(3)} SCU)
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
                  Téléchargez vos stocks avec colonnes µSCU et SCU pour vos tableurs
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
                  Format .xlsx avec colonnes µSCU et SCU
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
