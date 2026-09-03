import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Blueprint, BlueprintCategory, BlueprintIngredient, RefinedStockItem } from '../../types';
import { BLUEPRINT_CATEGORIES } from '../../data/blueprintsData';
import { Scroll, Plus, Trash2, Sparkles, Search, Edit3, ShieldCheck, AlertCircle, Boxes, Award } from 'lucide-react';
import { audio } from '../../services/audioService';

interface EditableIngredient {
  resourceId: string;
  resourceName: string;
  quantityStr: string;
}

interface PersonalMineralOption {
  mineralId: string;
  mineralName: string;
  totalSCU: number;
  lotsCount: number;
  maxQuality: number;
  isGem: boolean;
  notesSample: string;
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
  
  // Personal mineral selection modal state
  const [selectedIngredientModalIndex, setSelectedIngredientModalIndex] = useState<number | null>(null);
  const [mineralSearchQuery, setMineralSearchQuery] = useState('');

  // Extract and group strictly the user's PERSONAL validated mineral stock
  const personalMineralOptions = useMemo<PersonalMineralOption[]>(() => {
    const personalItems = stock.filter(s => s.ownerType === 'personal');
    const map = new Map<string, PersonalMineralOption>();

    personalItems.forEach(item => {
      const key = item.mineralId.toLowerCase().trim();
      const existing = map.get(key);
      const isGem = Boolean(
        item.notes?.toLowerCase().includes('gem') ||
        item.notes?.toLowerCase().includes('minable geo') ||
        item.notes?.toLowerCase().includes('minage géo') ||
        item.notes?.toLowerCase().includes('minage geo')
      );

      // Extract quality if specified in notes (e.g. "Qualité: 98")
      const match = item.notes?.match(/Qualit[eé]:?\s*(\d+)/i);
      const quality = match ? parseInt(match[1], 10) : 0;

      if (existing) {
        existing.totalSCU = Number((existing.totalSCU + item.quantitySCU).toFixed(3));
        existing.lotsCount += 1;
        if (quality > existing.maxQuality) existing.maxQuality = quality;
      } else {
        map.set(key, {
          mineralId: item.mineralId,
          mineralName: item.mineralName,
          totalSCU: Number(item.quantitySCU.toFixed(3)),
          lotsCount: 1,
          maxQuality: quality,
          isGem,
          notesSample: item.notes || ''
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.mineralName.localeCompare(b.mineralName));
  }, [stock]);

  // Editable ingredients list with unconstrained string quantities
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([
    { resourceId: 'quantainium', resourceName: 'Quantainium', quantityStr: '1' }
  ]);

  // Synchronize state when opening modal
  useEffect(() => {
    if (isOpen) {
      setMineralSearchQuery('');
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
                // Match against user's personal stock first
                const personalMatch = personalMineralOptions.find(
                  p => p.mineralId.toLowerCase() === ing.resourceId.toLowerCase() || p.mineralName.toLowerCase() === ing.resourceName.toLowerCase()
                );
                return {
                  resourceId: personalMatch ? personalMatch.mineralId : ing.resourceId,
                  resourceName: personalMatch ? personalMatch.mineralName : ing.resourceName,
                  quantityStr: String(ing.quantitySCU)
                };
              })
            : [{
                resourceId: personalMineralOptions[0]?.mineralId || 'quantainium',
                resourceName: personalMineralOptions[0]?.mineralName || 'Quantainium',
                quantityStr: '1'
              }]
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
        
        // Default to the first minerals present in user's personal stock if available
        if (personalMineralOptions.length >= 2) {
          setIngredients([
            { resourceId: personalMineralOptions[0].mineralId, resourceName: personalMineralOptions[0].mineralName, quantityStr: '1' },
            { resourceId: personalMineralOptions[1].mineralId, resourceName: personalMineralOptions[1].mineralName, quantityStr: '2' }
          ]);
        } else if (personalMineralOptions.length === 1) {
          setIngredients([
            { resourceId: personalMineralOptions[0].mineralId, resourceName: personalMineralOptions[0].mineralName, quantityStr: '1' }
          ]);
        } else {
          setIngredients([
            { resourceId: 'quantainium', resourceName: 'Quantainium', quantityStr: '1' }
          ]);
        }
      }
    }
  }, [isOpen, blueprintToEdit, personalMineralOptions]);

  const handleAddIngredient = () => {
    audio.playClick();
    const newIdx = ingredients.length;
    // Choose next unused personal mineral or first available
    const unusedPersonal = personalMineralOptions.find(p => !ingredients.some(i => i.resourceId === p.mineralId));
    const fallback = unusedPersonal || personalMineralOptions[0] || { mineralId: 'quantainium', mineralName: 'Quantainium' };

    setIngredients([
      ...ingredients,
      { resourceId: fallback.mineralId, resourceName: fallback.mineralName, quantityStr: '1' }
    ]);
    setSelectedIngredientModalIndex(newIdx);
  };

  const handleRemoveIngredient = (index: number) => {
    audio.playClick();
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSelectPersonalMineral = (index: number, personalMin: PersonalMineralOption) => {
    audio.playSuccess();
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        resourceId: personalMin.mineralId,
        resourceName: personalMin.mineralName
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

  // Filtered personal minerals based on search inside the selection modal
  const filteredPersonalMinerals = useMemo(() => {
    if (!mineralSearchQuery.trim()) return personalMineralOptions;
    const q = mineralSearchQuery.toLowerCase().trim();
    return personalMineralOptions.filter(
      p => p.mineralName.toLowerCase().includes(q) || p.mineralId.toLowerCase().includes(q) || p.notesSample.toLowerCase().includes(q)
    );
  }, [personalMineralOptions, mineralSearchQuery]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={blueprintToEdit ? `Modifier le Blueprint : ${blueprintToEdit.name}` : "Créer un Blueprint Personnalisé"}
        subtitle={blueprintToEdit ? "Ajustez les composants, le temps de fabrication et vos ingrédients personnels requis" : "Définissez une nouvelle recette de fabrication avec les minerais de votre stock personnel"}
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

          {/* Ingredients Section - Strictly from Personal Stock */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ingrédients Requis (Issus de Mon Stock Personnel : {personalMineralOptions.length} minerais)</span>
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Seuls les minerais validés présents dans votre stock personnel sont référencés
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
                const matchedPersonal = personalMineralOptions.find(
                  p => p.mineralId.toLowerCase() === ing.resourceId.toLowerCase() || p.mineralName.toLowerCase() === ing.resourceName.toLowerCase()
                );
                const isGem = matchedPersonal ? matchedPersonal.isGem : false;

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
                        title="Cliquer pour choisir un minerai issu de votre stock personnel"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isGem ? 'bg-purple-400 shadow-neon-purple' : 'bg-emerald-400 shadow-neon-green'}`} />
                          <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors truncate">
                            {matchedPersonal ? matchedPersonal.mineralName : ing.resourceName || 'Choisir un minerai personnel...'}
                          </span>
                          {matchedPersonal && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700 shrink-0 hidden sm:inline">
                              Stock: {matchedPersonal.totalSCU.toFixed(1)} {isGem ? 'unités' : 'SCU'}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-sc-cyan font-bold shrink-0 flex items-center gap-1 group-hover:underline bg-sc-cyan/10 px-2 py-0.5 rounded border border-sc-cyan/30">
                          <span>Mon Stock</span>
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

      {/* Pop-up de sélection STRICTEMENT limitée au Stock Personnel */}
      <Modal
        isOpen={selectedIngredientModalIndex !== null}
        onClose={() => setSelectedIngredientModalIndex(null)}
        title="Minerais de Mon Stock Personnel"
        subtitle="Sélectionnez un minerai validé issu exclusivement de votre stock personnel"
        icon={<Boxes className="w-5 h-5 text-emerald-400" />}
        maxWidth="2xl"
      >
        <div className="space-y-4 font-sans">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher dans mes minerais personnels (nom, identifiant, notes)..."
              value={mineralSearchQuery}
              onChange={(e) => setMineralSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              autoFocus
            />
          </div>

          {/* Personal Minerals Grid */}
          {filteredPersonalMinerals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {filteredPersonalMinerals.map((item) => {
                const isSelected = selectedIngredientModalIndex !== null && ingredients[selectedIngredientModalIndex]?.resourceId === item.mineralId;

                return (
                  <button
                    key={item.mineralId}
                    type="button"
                    onClick={() => {
                      if (selectedIngredientModalIndex !== null) {
                        handleSelectPersonalMineral(selectedIngredientModalIndex, item);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all group ${
                      isSelected
                        ? 'bg-sc-cyan/15 border-sc-cyan shadow-neon-cyan/20 ring-1 ring-sc-cyan'
                        : 'bg-sc-card/80 hover:bg-slate-800/90 border-sc-border hover:border-emerald-400/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`w-2 h-2 rounded-full ${item.isGem ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            {item.isGem ? '💎 Gemme' : '⛏️ Minerai'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-sc-cyan transition-colors">
                          {item.mineralName}
                        </h4>
                      </div>

                      {item.maxQuality > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>Q:{item.maxQuality}%</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <span className="text-emerald-400 font-bold">
                        {item.totalSCU.toFixed(2)} {item.isGem ? 'unités' : 'SCU'}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {item.lotsCount} lot(s) en stock
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-[#090e18] border border-slate-800 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">
                {personalMineralOptions.length === 0
                  ? "Aucun minerai dans votre stock personnel validé"
                  : "Aucun minerai ne correspond à votre recherche"}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {personalMineralOptions.length === 0
                  ? "Ajoutez ou validez des lots de minerais personnels dans l'onglet 'Stock Minerais' pour les référencer dans vos blueprints."
                  : "Vérifiez l'orthographe du minerai recherché."}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end pt-3 border-t border-sc-border">
            <button
              type="button"
              onClick={() => setSelectedIngredientModalIndex(null)}
              className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono uppercase tracking-wider"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
