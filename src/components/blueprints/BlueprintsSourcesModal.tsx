import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  ExternalLink,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { Blueprint } from '../../types';
import { audio } from '../../services/audioService';

interface BlueprintsSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBlueprints: (importedBps: Blueprint[]) => void;
}

export const BlueprintsSourcesModal: React.FC<BlueprintsSourcesModalProps> = ({
  isOpen,
  onClose,
  onImportBlueprints
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; count: number; message: string } | null>(null);

  const sources = [
    {
      name: 'SC-Craft.tools',
      url: 'https://sc-craft.tools',
      tag: 'Spécialisé Crafting',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'La base de données communautaire de référence pour toutes les recettes de fabrication (ingrédients, temps de craft, fabricateurs de vaisseaux).'
    },
    {
      name: 'Erkul Games (erkul.games)',
      url: 'https://erkul.games',
      tag: 'Composants & DPS',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'Calculateur d\'armement et de composants de vaisseaux (boucliers, propulseurs quantiques, génératrices, répéteurs lasers).'
    },
    {
      name: 'UEX Corp (uexcorp.space)',
      url: 'https://uexcorp.space',
      tag: 'Économie & Raffinage',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'Suivi des cours des minerais en direct, stations de raffinage, prix d\'achat/vente et terminaux de fabrication.'
    },
    {
      name: 'Star Citizen Wiki API (api.star-citizen.wiki)',
      url: 'https://docs.star-citizen.wiki',
      tag: 'API REST Publique',
      tagColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      description: 'API officielle de la communauté avec endpoints OpenAPI 3.0 interrogeables en direct.'
    }
  ];

  const handleDownloadSampleJSON = () => {
    audio.playClick();
    const sampleBlueprints: Partial<Blueprint>[] = [
      {
        id: 'custom_bp_example_1',
        name: 'Omnisky IX Laser Cannon (S3)',
        category: 'armes_vaisseau',
        typeLabel: 'Laser Cannon',
        subtype: 'Precision Military',
        grade: 'A',
        size: 3,
        craftTimeSeconds: 2400,
        marketEstimatedAUEC: 24000,
        description: 'Exemple de blueprint personnalisable.',
        ingredients: [
          { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 3.6 },
          { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.4 },
          { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.4, isItem: true, itemQuantity: 40 }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sampleBlueprints, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele_blueprints_star_citizen.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audio.playClick();
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const itemsArray: any[] = Array.isArray(data) ? data : data.blueprints || data.data || [];
      if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
        throw new Error('Format de fichier JSON non reconnu ou vide.');
      }

      const validBps: Blueprint[] = itemsArray.map((item, index) => {
        return {
          id: item.id || `custom_import_${Date.now()}_${index}`,
          key: item.key || item.name?.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
          name: item.name || item.output_name || `Blueprint #${index + 1}`,
          category: item.category || 'divers',
          typeLabel: item.typeLabel || item.type || 'Composant',
          subtype: item.subtype || item.sub_type || 'Standard',
          grade: item.grade || 'Standard',
          size: typeof item.size === 'number' ? item.size : undefined,
          craftTimeSeconds: typeof item.craftTimeSeconds === 'number' ? item.craftTimeSeconds : 600,
          description: item.description || 'Blueprint importé.',
          marketEstimatedAUEC: typeof item.marketEstimatedAUEC === 'number' ? item.marketEstimatedAUEC : undefined,
          ingredients: Array.isArray(item.ingredients) ? item.ingredients.map((ing: any) => ({
            resourceId: ing.resourceId || ing.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'metal',
            resourceName: ing.resourceName || ing.name || 'Matériau',
            quantitySCU: typeof ing.quantitySCU === 'number' ? ing.quantitySCU : (typeof ing.quantity === 'number' ? ing.quantity / 100 : 0.5),
            isItem: Boolean(ing.isItem),
            itemQuantity: typeof ing.itemQuantity === 'number' ? ing.itemQuantity : undefined
          })) : []
        };
      });

      if (validBps.length > 0) {
        audio.playSuccess();
        onImportBlueprints(validBps);
        setImportStatus({
          success: true,
          count: validBps.length,
          message: `${validBps.length} plan(s) de fabrication importé(s) avec succès dans votre atelier !`
        });
      } else {
        throw new Error('Aucun blueprint valide extrait.');
      }
    } catch (err: any) {
      audio.playAlert();
      setImportStatus({
        success: false,
        count: 0,
        message: err.message || 'Erreur de lecture du fichier JSON.'
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sources de Données & Datamining des Blueprints"
      subtitle="Où récupérer de nouvelles recettes de fabrication pour enrichir votre atelier"
      icon={<BookOpen className="w-5 h-5 text-sc-cyan" />}
      maxWidth="lg"
    >
      <div className="space-y-5 font-sans">
        {/* Notice why official API has few recipes */}
        <div className="p-3.5 bg-sc-cyan/10 border border-sc-cyan/30 rounded-xl text-xs font-mono text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sc-cyan uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Pourquoi l'API officielle Star Citizen a peu de recettes de craft ?</span>
          </div>
          <p className="leading-relaxed">
            Le système de craft / fabrication dans Star Citizen évolue activement (3.24 / 4.0). L'API officielle de Wiki indexe principalement les caractéristiques des objets (stats, prix d'achat en magasin), tandis que les <strong>recettes de fabrication complètes</strong> (ratios de minerais nécessaires, temps de fabrication) sont actuellement extraites par <em>datamining</em> dans les fichiers du jeu par la communauté.
          </p>
        </div>

        {/* Community Sources Grid */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-sc-cyan" />
            <span>Sites communautaires & Datamining recommandés :</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-sc-card/70 hover:bg-sc-card border border-sc-border hover:border-sc-cyan/50 rounded-xl transition-all group block space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 group-hover:text-sc-cyan text-xs flex items-center gap-1.5">
                    <span>{src.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sc-cyan" />
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${src.tagColor}`}>
                    {src.tag}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  {src.description}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Import / Export Custom Blueprints Pack */}
        <div className="p-4 bg-sc-panel/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
                Importer ou Exporter vos packs de Blueprints (JSON)
              </h4>
            </div>
          </div>

          <p className="text-xs font-mono text-slate-400">
            Vous pouvez télécharger des listes de blueprints créées par vous ou la communauté et les intégrer en un clic :
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-purple-300" />
              <span>Importer un fichier JSON de Blueprints</span>
            </button>

            <button
              onClick={handleDownloadSampleJSON}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sc-cyan" />
              <span>Télécharger Modèle JSON</span>
            </button>
          </div>

          {importStatus && (
            <div className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
              importStatus.success ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}>
              {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2 flex items-center justify-end border-t border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-sc-panel border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
