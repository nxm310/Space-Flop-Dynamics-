import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Blueprint, RefinedStockItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import {
  Scroll,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  Hammer,
  ClipboardList,
  Layers
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface BlueprintDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: Blueprint | null;
  stock: RefinedStockItem[];
  onCraftNow: (blueprint: Blueprint, quantity: number) => void;
  onCreateOrder: (blueprint: Blueprint) => void;
}

export const BlueprintDetailsModal: React.FC<BlueprintDetailsModalProps> = ({
  isOpen,
  onClose,
  blueprint,
  stock,
  onCraftNow,
  onCreateOrder
}) => {
  const [craftQuantity, setCraftQuantity] = useState<number>(1);

  if (!blueprint) return null;

  // Check ingredient availability across personal stock + client stock
  const ingredientStatus = blueprint.ingredients.map(ing => {
    const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === ing.resourceId || m.name.toLowerCase() === ing.resourceName.toLowerCase());
    const totalRequired = ing.quantitySCU * craftQuantity;

    // Personal stock available
    const personalStockItem = stock.find(s => s.ownerType === 'personal' && (s.mineralId === ing.resourceId || s.mineralName.toLowerCase() === ing.resourceName.toLowerCase()));
    const personalAvailable = personalStockItem ? personalStockItem.quantitySCU : 0;

    // Client stock available
    const clientStockItems = stock.filter(s => s.ownerType === 'client' && (s.mineralId === ing.resourceId || s.mineralName.toLowerCase() === ing.resourceName.toLowerCase()));
    const clientAvailable = clientStockItems.reduce((acc, s) => acc + s.quantitySCU, 0);

    const totalAvailable = personalAvailable + clientAvailable;
    const isAvailable = totalAvailable >= totalRequired;
    const missing = Math.max(0, totalRequired - totalAvailable);

    return {
      ...ing,
      mineral,
      totalRequired,
      personalAvailable,
      clientAvailable,
      totalAvailable,
      isAvailable,
      missing
    };
  });

  const allIngredientsAvailable = ingredientStatus.every(i => i.isAvailable);

  const formatCraftTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    return `${hours}h ${remMins}m`;
  };

  const handleCraft = () => {
    audio.playSuccess();
    onCraftNow(blueprint, craftQuantity);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={blueprint.name}
      subtitle={`Spécifications & Ingrédients de Fabrication (${blueprint.typeLabel})`}
      icon={<Scroll className="w-5 h-5 text-sc-cyan" />}
      maxWidth="3xl"
    >
      <div className="space-y-5 font-sans">
        {/* Top Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-sc-card/70 border border-sc-border rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan">{blueprint.typeLabel}</Badge>
            {blueprint.subtype && <Badge variant="slate">{blueprint.subtype}</Badge>}
            {blueprint.grade && <Badge variant="gold">Grade {blueprint.grade}</Badge>}
            {blueprint.size !== undefined && <Badge variant="purple">Size {blueprint.size}</Badge>}
            {blueprint.isCustom && <Badge variant="orange">Personnalisé</Badge>}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sc-cyan" />
              {formatCraftTime(blueprint.craftTimeSeconds * craftQuantity)}
            </span>
            {blueprint.marketEstimatedAUEC && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Coins className="w-4 h-4" />
                ~{(blueprint.marketEstimatedAUEC * craftQuantity).toLocaleString('fr-FR')} aUEC
              </span>
            )}
          </div>
        </div>

        {blueprint.description && (
          <p className="text-xs text-slate-300 font-sans leading-relaxed bg-sc-panel/40 p-3 rounded-lg border border-slate-800">
            {blueprint.description}
          </p>
        )}

        {/* Quantity to Craft Selector */}
        <div className="flex items-center justify-between p-3 bg-sc-panel rounded-lg border border-sc-border">
          <span className="text-xs font-mono tracking-wider uppercase text-slate-300">
            Quantité d'unités à fabriquer :
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCraftQuantity(Math.max(1, craftQuantity - 1))}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-bold font-mono text-sc-cyan">
              {craftQuantity}
            </span>
            <button
              onClick={() => setCraftQuantity(craftQuantity + 1)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Ingredients & Feasibility Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Ingrédients & Vérification des Stocks en Direct
            </h4>
            <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
              allIngredientsAvailable ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {allIngredientsAvailable ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Ressources suffisantes
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Ressources manquantes
                </>
              )}
            </span>
          </div>

          <div className="space-y-2">
            {ingredientStatus.map((ing, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-colors ${
                  ing.isAvailable
                    ? 'bg-sc-panel border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${ing.isAvailable ? 'bg-emerald-400 shadow-neon-green' : 'bg-rose-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{ing.resourceName}</span>
                      {ing.isItem && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-300">
                          {ing.itemQuantity ? `${ing.itemQuantity * craftQuantity} unités` : 'Item'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Requis : <strong className="text-slate-200">{ing.totalRequired.toFixed(2)} SCU</strong> ({Math.round(ing.totalRequired * 100)} cSCU)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Stock Disponible</span>
                    <span className={`font-bold ${ing.isAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {ing.totalAvailable.toFixed(2)} SCU
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      (Perso: {ing.personalAvailable.toFixed(2)} | Client: {ing.clientAvailable.toFixed(2)})
                    </span>
                  </div>

                  {!ing.isAvailable && (
                    <div className="px-2 py-1 rounded bg-rose-900/40 border border-rose-700/60 text-rose-300 text-[10px] font-bold">
                      Manque {ing.missing.toFixed(2)} SCU
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dismantle Returns if any */}
        {blueprint.dismantleReturns && blueprint.dismantleReturns.length > 0 && (
          <div className="p-3 bg-sc-card/40 rounded-lg border border-sc-border text-xs font-mono">
            <span className="text-slate-400 block mb-1">♻ Recyclage / Démantèlement :</span>
            <div className="flex flex-wrap gap-2 text-slate-300">
              {blueprint.dismantleReturns.map((ret, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {ret.quantitySCU * craftQuantity} SCU {ret.resourceName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sc-border">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onCreateOrder(blueprint);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-sc-cyan/40 bg-sc-cyan/15 hover:bg-sc-cyan/25 text-sc-cyan text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Créer une commande client
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Fermer
            </button>

            <button
              type="button"
              disabled={!allIngredientsAvailable}
              onClick={handleCraft}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
                allIngredientsAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400 shadow-neon-green'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Hammer className="w-4 h-4" />
              Fabriquer maintenant
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
