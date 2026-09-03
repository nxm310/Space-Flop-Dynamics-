import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SelectMineralModal } from '../common/SelectMineralModal';
import { Blueprint, BlueprintCategory, BlueprintIngredient, MineralInfo, RefinedStockItem } from '../../types';
import { BLUEPRINT_CATEGORIES } from '../../data/blueprintsData';
import { StorageService } from '../../services/storageService';
import { Scroll, Plus, Trash2, Sparkles, Search, Edit3, Layers } from 'lucide-react';
import { audio } from '../../services/audioService';

interface EditableIngredient {
  resourceId: string;
  resourceName: string;
  quantityStr: string;
}

interface CustomBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlueprint: (blueprint: Blueprint) => void;
  blueprintToEdit?: Blueprint | null;
  stock?: RefinedStockItem[];
}

export const CustomBlueprintModal: React.FC<CustomBlueprintModalProps> = ({
  isOpen,
  onClose,
  onAddBlueprint,
  blueprintToEdit,
  stock = []
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BlueprintCategory>('vaisseau');
  const [typeLabel, setTypeLabel] = useState('Composant Personnalisé');
  const [subtype, setSubtype] = useState('Tier 1');
  const [grade, setGrade] = useState('A');
  const [craftTimeStr, setCraftTimeStr] = useState('600');
  const [marketEstimatedAUECStr, setMarketEstimatedAUECStr] = useState('15000');
  const [description, setDescription] = useState('');
  
  // Ingredient mineral selection modal state
  const [selectedIngredientModalIndex, setSelectedIngredientModalIndex] = useState<number | null>(null);

  // Editable ingredients list with unconstrained string quantities
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([
    { resourceId: 'quantainium', resourceName: 'Quantainium', quantityStr: '1' }
  ]);

  // Synchronize state when opening modal
  useEffect(() => {
    if (isOpen) {
      const allMinerals = StorageService.getAllMinerals(stock);

      if (blueprintToEdit) {
        setName(blueprintToEdit.name || '');
        setCategory(blueprintToEdit.category || 'vaisseau');
        setTypeLabel(blueprintToEdit.typeLabel || 'Composant');
        setSubtype(blueprintToEdit.subtype || '');
        setGrade(blueprintToEdit.grade || '');
        setCraftTimeStr(String(blueprintToEdit.craftTimeSeconds || 600));
        setMarketEstimatedAUECStr(String(blueprintToEdit.marketEstimatedAUEC || 15000));
        setDescription(blueprintToEdit.description || '');
        setIngredients(
          blueprintToEdit.ingredients && blueprintToEdit.ingredients.length > 0
            ? blueprintToEdit.ingredients.map(ing => {
                const match = allMinerals.find(
                  m => m.id.toLowerCase() === ing.resourceId.toLowerCase() || m.name.toLowerCase() === ing.resourceName.toLowerCase()
                );
                return {
                  resourceId: match ? match.id : ing.resourceId,
                  resourceName: match ? (match.displayName || match.name) : ing.resourceName,
                  quantityStr: String(ing.quantitySCU)
                };
              })
            : [{ resourceId: 'quantainium', resourceName: 'Quantainium', quantityStr: '1' }]
        );
      } else {
        setName('');
        setCategory('vaisseau');
        setTypeLabel('Composant Personnalisé');
        setSubtype('Tier 1');
        setGrade('A');
        setCraftTimeStr('600');
        setMarketEstimatedAUECStr('15000');
        setDescription('');
        setIngredients([
          { resourceId: 'quantainium', resourceName: 'Quantainium', quantityStr: '1' },
          { resourceId: 'titanium', resourceName: 'Titane', quantityStr: '2' }
        ]);
      }
    }
  }, [isOpen, blueprintToEdit, stock]);

  const handleAddIngredient = () => {
    audio.playClick();
    const newIdx = ingredients.length;
    setIngredients([
      ...ingredients,
      { resourceId: 'copper', resourceName: 'Cuivre', quantityStr: '1' }
    ]);
    setSelectedIngredientModalIndex(newIdx);
  };

  const handleRemoveIngredient = (index: number) => {
    audio.playClick();
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSelectMineralForIngredient = (index: number, selectedMin: MineralInfo) => {
    audio.playSuccess();
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        resourceId: selectedMin.id,
        resourceName: selectedMin.displayName || selectedMin.name
      };
      return updated;
    });
    setSelectedIngredientModalIndex(null);
  };

  const handleIngredientQtyChange = (index: number, val: string) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantityStr: val
      };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;

    audio.playSuccess();

    // Parse ingredients with free format support (handles commas, decimals, empty inputs safely)
    const finalIngredients: BlueprintIngredient[] = ingredients.map(ing => {
      const normalized = ing.quantityStr.replace(',', '.').trim();
      const parsed = parseFloat(normalized);
      const validQty = isNaN(parsed) || parsed <= 0 ? 1 : parsed;
      return {
        resourceId: ing.resourceId,
        resourceName: ing.resourceName,
        quantitySCU: Number(validQty.toFixed(3))
      };
    });

    const parsedCraftTime = parseInt(craftTimeStr.trim(), 10);
    const craftTimeSeconds = isNaN(parsedCraftTime) || parsedCraftTime <= 0 ? 60 : parsedCraftTime;

    const parsedAUEC = parseInt(marketEstimatedAUECStr.replace(/\s/g, '').trim(), 10);
    const marketEstimatedAUEC = isNaN(parsedAUEC) || parsedAUEC < 0 ? 0 : parsedAUEC;

    const bpToSave: Blueprint = {
      id: blueprintToEdit ? blueprintToEdit.id : `custom_bp_${Date.now()}`,
      name: name.trim(),
      category,
      typeLabel: typeLabel.trim() || 'Composant',
      subtype: subtype.trim() || undefined,
      grade: grade.trim() || undefined,
      craftTimeSeconds,
      marketEstimatedAUEC,
      description: description.trim() || undefined,
      ingredients: finalIngredients,
      isCustom: true
    };

    onAddBlueprint(bpToSave);
    onClose();
  };

  const allMinerals = StorageService.getAllMinerals(stock);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={blueprintToEdit ? `Modifier le Blueprint : ${blueprintToEdit.name}` : "Créer un Blueprint Personnalisé"}
        subtitle={blueprintToEdit ? "Ajustez les composants, le temps de fabrication et les ingrédients requis" : "Définissez une nouvelle recette de fabrication avec toutes les matières de la base commune"}
        icon={blueprintToEdit ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Scroll className="w-5 h-5 text-sc-cyan" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Nom de l'item fabriqué *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Canon Laser Supercharged S4..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlueprintCategory)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none cursor-pointer"
              >
                {BLUEPRINT_CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Label, Subtype, Grade, Craft Time */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Type / Rôle
              </label>
              <input
                type="text"
                placeholder="Ex: Shield Generator"
                value={typeLabel}
                onChange={(e) => setTypeLabel(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Sous-type
              </label>
              <input
                type="text"
                placeholder="Ex: Military"
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Grade
              </label>
              <input
                type="text"
                placeholder="Ex: A, B, 1"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Temps (sec)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="600"
                value={craftTimeStr}
                onChange={(e) => setCraftTimeStr(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Ingredients Section - Connected to Common Database */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Ingrédients & Minerais Requis ({ingredients.length})</span>
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Accès à tous les minerais, métaux, gemmes et possibilité de créer vos matières personnalisées
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-2.5 py-1 rounded-md bg-sc-cyan/15 hover:bg-sc-cyan/25 border border-sc-cyan/30 text-sc-cyan text-[11px] font-mono uppercase flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un minerai
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {ingredients.map((ing, idx) => {
                const matchedMineral = allMinerals.find(
                  m => m.id.toLowerCase() === ing.resourceId.toLowerCase() || m.name.toLowerCase() === ing.resourceName.toLowerCase()
                );
                const isGem = matchedMineral?.group === 'Gem' || matchedMineral?.isFpsMineable;

                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-sc-panel rounded-xl border border-slate-800 hover:border-sc-cyan/40 transition-colors">
                    <div className="flex-1 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick();
                          setSelectedIngredientModalIndex(idx);
                        }}
                        className="flex-1 px-3 py-2 bg-[#090e18] hover:bg-slate-800 border border-sc-border hover:border-sc-cyan rounded-lg text-xs font-mono text-left flex items-center justify-between gap-2 group transition-all"
                        title="Cliquer pour parcourir toute la base commune ou créer un nouveau minerai"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isGem ? 'bg-purple-400 shadow-neon-purple' : 'bg-sc-cyan shadow-neon-cyan'}`} />
                          <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors truncate">
                            {matchedMineral?.displayName || ing.resourceName || 'Choisir un minerai...'}
                          </span>
                          {matchedMineral?.group && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 hidden sm:inline">
                              {isGem ? '💎 Gemme' : matchedMineral.group}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-sc-cyan font-bold shrink-0 flex items-center gap-1 group-hover:underline bg-sc-cyan/10 px-2 py-0.5 rounded border border-sc-cyan/30">
                          <span>Base Commune</span>
                          <Search className="w-3 h-3" />
                        </span>
                      </button>
                    </div>

                    {/* Free-format Quantity Input without spinner arrows */}
                    <div className="w-32 relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={ing.quantityStr}
                        onChange={(e) => handleIngredientQtyChange(idx, e.target.value)}
                        className="w-full pl-2.5 pr-14 py-2 bg-sc-card border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-slate-400 font-bold pointer-events-none select-none">
                        {isGem ? 'unités' : 'SCU'}
                      </span>
                    </div>

                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Retirer cet ingrédient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Description / Notes
              </label>
              <input
                type="text"
                placeholder="Ex: Canon sur mesure optimisé pour les combats en atmosphère..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Prix Estimé (aUEC)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="15000"
                value={marketEstimatedAUECStr}
                onChange={(e) => setMarketEstimatedAUECStr(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sc-border">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              {blueprintToEdit ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {blueprintToEdit ? "Sauvegarder les Modifications" : "Enregistrer le Blueprint"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Pop-up de sélection de la BASE COMMUNE DE MINERAIS avec création personnalisée */}
      <SelectMineralModal
        isOpen={selectedIngredientModalIndex !== null}
        onClose={() => setSelectedIngredientModalIndex(null)}
        onSelectMineral={(selectedMin) => {
          if (selectedIngredientModalIndex !== null) {
            handleSelectMineralForIngredient(selectedIngredientModalIndex, selectedMin);
          }
        }}
        currentSelectedId={selectedIngredientModalIndex !== null ? ingredients[selectedIngredientModalIndex]?.resourceId : undefined}
        stock={stock}
        title="Base Commune des Minerais & Ingrédients"
        subtitle="Explorez toutes les matières galactiques ou créez un nouveau minerai sous le même format"
      />
    </>
  );
};
