import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SelectMineralModal } from '../common/SelectMineralModal';
import { Blueprint, BlueprintCategory, BlueprintIngredient } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { BLUEPRINT_CATEGORIES } from '../../data/blueprintsData';
import { Scroll, Plus, Trash2, Sparkles, Search, Edit3 } from 'lucide-react';
import { audio } from '../../services/audioService';

interface CustomBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlueprint: (blueprint: Blueprint) => void;
  blueprintToEdit?: Blueprint | null;
}

export const CustomBlueprintModal: React.FC<CustomBlueprintModalProps> = ({
  isOpen,
  onClose,
  onAddBlueprint,
  blueprintToEdit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BlueprintCategory>('vaisseau');
  const [typeLabel, setTypeLabel] = useState('Composant Personnalisé');
  const [subtype, setSubtype] = useState('Tier 1');
  const [grade, setGrade] = useState('A');
  const [craftTimeSeconds, setCraftTimeSeconds] = useState<number>(600);
  const [marketEstimatedAUEC, setMarketEstimatedAUEC] = useState<number>(15000);
  const [description, setDescription] = useState('');
  const [selectedIngredientModalIndex, setSelectedIngredientModalIndex] = useState<number | null>(null);

  // Ingredients list
  const [ingredients, setIngredients] = useState<BlueprintIngredient[]>([
    { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.0 },
    { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.0 }
  ]);

  // Synchronize state when opening modal
  useEffect(() => {
    if (isOpen) {
      if (blueprintToEdit) {
        setName(blueprintToEdit.name || '');
        setCategory(blueprintToEdit.category || 'vaisseau');
        setTypeLabel(blueprintToEdit.typeLabel || 'Composant');
        setSubtype(blueprintToEdit.subtype || '');
        setGrade(blueprintToEdit.grade || '');
        setCraftTimeSeconds(blueprintToEdit.craftTimeSeconds || 600);
        setMarketEstimatedAUEC(blueprintToEdit.marketEstimatedAUEC || 15000);
        setDescription(blueprintToEdit.description || '');
        setIngredients(blueprintToEdit.ingredients && blueprintToEdit.ingredients.length > 0 ? [...blueprintToEdit.ingredients] : [
          { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.0 }
        ]);
      } else {
        setName('');
        setCategory('vaisseau');
        setTypeLabel('Composant Personnalisé');
        setSubtype('Tier 1');
        setGrade('A');
        setCraftTimeSeconds(600);
        setMarketEstimatedAUEC(15000);
        setDescription('');
        setIngredients([
          { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.0 },
          { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.0 }
        ]);
      }
    }
  }, [isOpen, blueprintToEdit]);

  const handleAddIngredient = () => {
    audio.playClick();
    const newIdx = ingredients.length;
    setIngredients([
      ...ingredients,
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.0 }
    ]);
    setSelectedIngredientModalIndex(newIdx);
  };

  const handleRemoveIngredient = (index: number) => {
    audio.playClick();
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof BlueprintIngredient, value: string | number) => {
    const updated = [...ingredients];
    if (field === 'resourceId') {
      const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === value);
      updated[index].resourceId = String(value);
      updated[index].resourceName = mineral ? mineral.name : String(value);
    } else if (field === 'quantitySCU') {
      updated[index].quantitySCU = Number(value);
    }
    setIngredients(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;

    audio.playSuccess();
    const bpToSave: Blueprint = {
      id: blueprintToEdit ? blueprintToEdit.id : `custom_bp_${Date.now()}`,
      name: name.trim(),
      category,
      typeLabel: typeLabel.trim() || 'Composant',
      subtype: subtype.trim() || undefined,
      grade: grade.trim() || undefined,
      craftTimeSeconds: Number(craftTimeSeconds),
      marketEstimatedAUEC: Number(marketEstimatedAUEC),
      description: description.trim() || undefined,
      ingredients,
      isCustom: true
    };

    onAddBlueprint(bpToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={blueprintToEdit ? `Modifier le Blueprint : ${blueprintToEdit.name}` : "Créer un Blueprint Personnalisé"}
      subtitle={blueprintToEdit ? "Ajustez les composants, le temps de fabrication et les ingrédients requis" : "Définissez une nouvelle recette de fabrication avec ses ingrédients et caractéristiques"}
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
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
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
              type="number"
              min="10"
              value={craftTimeSeconds}
              onChange={(e) => setCraftTimeSeconds(parseInt(e.target.value) || 60)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold">
              Ingrédients & Minerais Requis ({ingredients.length})
            </h4>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-2.5 py-1 rounded-md bg-sc-cyan/15 hover:bg-sc-cyan/25 border border-sc-cyan/30 text-sc-cyan text-[11px] font-mono uppercase flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un minerai
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-sc-panel rounded-xl border border-slate-800 hover:border-sc-cyan/40 transition-colors">
                <div className="flex-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setSelectedIngredientModalIndex(idx);
                    }}
                    className="flex-1 px-3 py-2 bg-[#090e18] hover:bg-slate-800 border border-sc-border hover:border-sc-cyan rounded-lg text-xs font-mono text-left flex items-center justify-between gap-2 group transition-all"
                    title="Cliquer pour ouvrir le grand catalogue complet des minerais et ingrédients"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-sc-cyan shadow-neon-cyan shrink-0" />
                      <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors truncate">
                        {STAR_CITIZEN_MINERALS.find(m => m.id === ing.resourceId)?.displayName || ing.resourceName || 'Choisir un ingrédient...'}
                      </span>
                      {STAR_CITIZEN_MINERALS.find(m => m.id === ing.resourceId)?.group && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 hidden sm:inline">
                          {STAR_CITIZEN_MINERALS.find(m => m.id === ing.resourceId)?.group === 'Gem' ? '💎 Gemme' : STAR_CITIZEN_MINERALS.find(m => m.id === ing.resourceId)?.group}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-sc-cyan font-bold shrink-0 flex items-center gap-1 group-hover:underline bg-sc-cyan/10 px-2 py-0.5 rounded border border-sc-cyan/30">
                      <span>Parcourir</span>
                      <Search className="w-3 h-3" />
                    </span>
                  </button>
                </div>

                <div className="w-32">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0.01"
                      required
                      value={ing.quantitySCU}
                      onChange={(e) => handleIngredientChange(idx, 'quantitySCU', parseFloat(e.target.value) || 0.1)}
                      className="w-full pl-2.5 pr-12 py-2 bg-sc-card border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-sc-cyan"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-slate-500 font-bold pointer-events-none">
                      {STAR_CITIZEN_MINERALS.find(m => m.id === ing.resourceId)?.group === 'Gem' ? 'unités' : 'SCU'}
                    </span>
                  </div>
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
            ))}
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
              type="number"
              value={marketEstimatedAUEC}
              onChange={(e) => setMarketEstimatedAUEC(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none"
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

      {/* Select Mineral / Ingredient Pop-up Modal */}
      <SelectMineralModal
        isOpen={selectedIngredientModalIndex !== null}
        onClose={() => setSelectedIngredientModalIndex(null)}
        onSelectMineral={(selectedMin) => {
          if (selectedIngredientModalIndex !== null) {
            handleIngredientChange(selectedIngredientModalIndex, 'resourceId', selectedMin.id);
            setSelectedIngredientModalIndex(null);
          }
        }}
        currentSelectedId={selectedIngredientModalIndex !== null ? ingredients[selectedIngredientModalIndex]?.resourceId : undefined}
        title="Sélectionner l'Ingrédient / Minerai Requis"
        subtitle="Choisissez la matière première à inclure dans votre recette de fabrication"
      />
    </Modal>
  );
};
