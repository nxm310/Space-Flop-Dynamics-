import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Blueprint, 
  MaterialRequirement, 
  Order, 
  DiscountType, 
  InventoryItem, 
  MineralQualityTier,
  MINERAL_QUALITY_OPTIONS 
} from '../types';
import { STAR_CITIZEN_DATABASE, SCItemDefinition } from '../data/starCitizenDatabase';
import { AutocompleteSearch } from './AutocompleteSearch';
import { parseStockFile, ExtractedStockItem, deduceExtractionInfo } from '../utils/excelExtractor';
import { 
  Hammer, 
  Layers, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Terminal, 
  RefreshCw, 
  X,
  Play,
  CheckCircle2,
  Truck,
  Sparkles,
  Tag,
  FileText,
  FileSpreadsheet,
  ExternalLink,
  Paperclip,
  Upload,
  Link as LinkIcon,
  Rocket,
  Check,
  FileUp,
  AlertCircle,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Coins,
  Clock,
  MapPin,
  Flame,
  ShieldCheck,
  Search,
  BookOpen,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

type SortField = 'name' | 'quantity' | 'quality' | 'type';
type SortDirection = 'asc' | 'desc';

interface StockEditState {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  unitValueUEC?: number;
  qualityTier?: string;
  purityPercent?: number;
  recommendedShip?: string;
  extractionType?: string;
  attachedFileType?: 'pdf' | 'excel' | 'image' | 'link' | 'none';
  attachedFileName?: string;
  attachedFileData?: string;
  googleDriveUrl?: string;
  notes?: string;
}

export const CrafterDashboard: React.FC = () => {
  const { 
    inventory, 
    blueprints, 
    orders, 
    telemetry, 
    activeTab,
    setActiveTab,
    updateInventoryItem, 
    deleteInventoryItem,
    importExtractedItems,
    resetInventory,
    addBlueprint, 
    updateBlueprint,
    deleteBlueprint,
    importBlueprintFromDatabase,
    resetBlueprints,
    createOrder,
    updateOrderStatus, 
    updateOrderPrice,
    deleteOrder,
    resetOrders,
    refreshAgentData 
  } = useApp();

  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // ----------------------------------------------------
  // TAB 1: STOCKS & MINERALS STATE
  // ----------------------------------------------------
  const [stockSortField, setStockSortField] = useState<SortField>('name');
  const [stockSortDirection, setStockSortDirection] = useState<SortDirection>('asc');
  const [isResetStockModalOpen, setIsResetStockModalOpen] = useState<boolean>(false);
  const [editingStockItem, setEditingStockItem] = useState<StockEditState | null>(null);
  const [extractedPreviewItems, setExtractedPreviewItems] = useState<ExtractedStockItem[]>([]);
  const [extractedFileName, setExtractedFileName] = useState<string>('');
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>('');

  // ----------------------------------------------------
  // TAB 2: OWNED BLUEPRINTS STATE
  // ----------------------------------------------------
  const [isResetBpModalOpen, setIsResetBpModalOpen] = useState<boolean>(false);
  const [isNewBlueprintOpen, setIsNewBlueprintOpen] = useState<boolean>(false);
  const [bpSearchQuery, setBpSearchQuery] = useState<string>('');
  const [bpCategoryFilter, setBpCategoryFilter] = useState<string>('Tous');

  // Blueprint form state
  const [newBpName, setNewBpName] = useState<string>('');
  const [newBpCategory, setNewBpCategory] = useState<string>('Armement Vaisseau');
  const [newBpManufacturer, setNewBpManufacturer] = useState<string>('Behring Applied Technology');
  const [newBpDescription, setNewBpDescription] = useState<string>('');
  const [newBpCraftTime, setNewBpCraftTime] = useState<number>(30);
  const [newBpFee, setNewBpFee] = useState<number>(50000);
  const [newBpMaterials, setNewBpMaterials] = useState<MaterialRequirement[]>([
    { name: 'Quantainium Raffiné', quantity: 10, unit: 'SCU' }
  ]);

  // ----------------------------------------------------
  // TAB 3: ORDERS MANAGEMENT STATE
  // ----------------------------------------------------
  const [isResetOrdersModalOpen, setIsResetOrdersModalOpen] = useState<boolean>(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [editingPriceOrder, setEditingPriceOrder] = useState<Order | null>(null);
  
  // New Order Form state
  const [orderClientName, setOrderClientName] = useState<string>('');
  const [orderBlueprintName, setOrderBlueprintName] = useState<string>('');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderMineralQuality, setOrderMineralQuality] = useState<MineralQualityTier>('standard');
  const [orderClientProvidesMinerals, setOrderClientProvidesMinerals] = useState<boolean>(false);
  const [orderMineralContributionPercent, setOrderMineralContributionPercent] = useState<number>(100);
  const [orderDiscountType, setOrderDiscountType] = useState<DiscountType>('none');
  const [orderDiscountValue, setOrderDiscountValue] = useState<number>(0);
  const [orderCustomPrice, setOrderCustomPrice] = useState<number>(0);
  const [orderDiscountReason, setOrderDiscountReason] = useState<string>('');
  const [orderDeliveryLocation, setOrderDeliveryLocation] = useState<string>('HUR-L1 Green Glade');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Price adjustment modal state
  const [adjDiscountType, setAdjDiscountType] = useState<DiscountType>('percent');
  const [adjDiscountValue, setAdjDiscountValue] = useState<number>(20);
  const [adjCustomPrice, setAdjCustomPrice] = useState<number>(0);
  const [adjReason, setAdjReason] = useState<string>('Remise Membre Guilde');

  // ----------------------------------------------------
  // TAB 4: GLOBAL STAR CITIZEN DATABASE STATE
  // ----------------------------------------------------
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');
  const [dbCategoryFilter, setDbCategoryFilter] = useState<string>('Tous');

  // ====================================================
  // HANDLERS & HELPERS
  // ====================================================
  const handleStockSort = (field: SortField) => {
    if (stockSortField === field) {
      setStockSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setStockSortField(field);
      setStockSortDirection('asc');
    }
  };

  const sortedInventory = useMemo(() => {
    const activeItems = inventory.filter(i => i.quantity > 0);
    return [...activeItems].sort((a, b) => {
      let comparison = 0;
      if (stockSortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
      } else if (stockSortField === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (stockSortField === 'quality') {
        comparison = (a.qualityTier || '').localeCompare(b.qualityTier || '', 'fr', { sensitivity: 'base' });
      } else if (stockSortField === 'type') {
        const typeA = a.extractionType || '';
        const typeB = b.extractionType || '';
        comparison = typeA.localeCompare(typeB, 'fr', { sensitivity: 'base' });
      }
      return stockSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [inventory, stockSortField, stockSortDirection]);

  const renderSortIndicator = (field: SortField) => {
    if (stockSortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 opacity-60 inline-block ml-1" />;
    }
    return stockSortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400 inline-block ml-1 font-bold" />
      : <ArrowDown className="w-3.5 h-3.5 text-cyan-400 inline-block ml-1 font-bold" />;
  };

  // Handle Excel Extraction
  const handleFileExtraction = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError('');
    setIsParsingFile(true);
    setExtractedFileName(file.name);

    try {
      const parsedItems = await parseStockFile(file);
      if (parsedItems.length === 0) {
        setParseError('Aucun matériau détecté dans ce fichier. Vérifiez les colonnes (Nom, Quantité, Qualité, Type).');
      } else {
        setExtractedPreviewItems(parsedItems);
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setParseError('Erreur de lecture du fichier Excel/CSV : ' + (err.message || 'Format non reconnu'));
    } finally {
      setIsParsingFile(false);
      e.target.value = '';
    }
  };

  // Confirm Batch Import
  const handleConfirmBatchImport = async () => {
    if (extractedPreviewItems.length === 0) return;
    await importExtractedItems(extractedPreviewItems);
    setFeedbackMsg(`✓ ${extractedPreviewItems.length} matériaux extraits et enregistrés fidèlement dans vos stocks !`);
    setExtractedPreviewItems([]);
    setExtractedFileName('');
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  // Stock edit submit
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockItem) return;

    const finalName = editingStockItem.name?.trim() || editingStockItem.attachedFileName || 'Fichier Ressource';
    const deduced = deduceExtractionInfo(finalName, editingStockItem.extractionType);

    try {
      await updateInventoryItem({
        name: finalName,
        quantity: editingStockItem.quantity !== undefined ? editingStockItem.quantity : 1,
        unit: editingStockItem.unit || 'SCU',
        category: editingStockItem.category || 'Ressource',
        unitValueUEC: editingStockItem.unitValueUEC || 10000,
        qualityTier: editingStockItem.qualityTier || 'Standard',
        purityPercent: editingStockItem.purityPercent,
        recommendedShip: editingStockItem.recommendedShip || deduced.recommendedShip,
        extractionType: editingStockItem.extractionType || deduced.extractionType,
        attachedFileType: editingStockItem.attachedFileType || (editingStockItem.googleDriveUrl ? 'link' : 'none'),
        attachedFileName: editingStockItem.attachedFileName,
        attachedFileData: editingStockItem.attachedFileData,
        googleDriveUrl: editingStockItem.googleDriveUrl,
        notes: editingStockItem.notes
      });

      setFeedbackMsg(`✓ Ressource « ${finalName} » enregistrée avec succès.`);
      setEditingStockItem(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Error saving stock:', err);
      setFeedbackMsg('❌ Erreur lors de l\'enregistrement.');
    }
  };

  // Blueprint preset selection from autocomplete
  const handleBlueprintPresetSelect = (item: SCItemDefinition) => {
    setNewBpName(item.name);
    if (item.category) setNewBpCategory(item.category as any);
    if (item.manufacturer) setNewBpManufacturer(item.manufacturer);
    if (item.description) setNewBpDescription(item.description);
    if (item.unitValueUEC) setNewBpFee(item.unitValueUEC);
    if (item.suggestedCraftTimeMinutes) setNewBpCraftTime(item.suggestedCraftTimeMinutes);
    if (item.suggestedMaterials && item.suggestedMaterials.length > 0) {
      setNewBpMaterials(item.suggestedMaterials);
    }
  };

  // Create new blueprint
  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBpName.trim()) return;

    await addBlueprint({
      name: newBpName.trim(),
      category: newBpCategory,
      manufacturer: newBpManufacturer,
      description: newBpDescription || 'Fabrication sur mesure.',
      requiredMaterials: newBpMaterials,
      craftTimeMinutes: newBpCraftTime,
      feeUEC: newBpFee,
      available: true
    });

    setFeedbackMsg(`✓ Blueprint « ${newBpName} » ajouté à vos plans connus !`);
    setIsNewBlueprintOpen(false);
    setNewBpName('');
    setNewBpDescription('');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Add material row
  const handleAddMaterialRow = () => {
    setNewBpMaterials(prev => [...prev, { name: 'Titanium Raffiné', quantity: 5, unit: 'SCU' }]);
  };

  const handleUpdateMaterialRow = (index: number, field: keyof MaterialRequirement, value: any) => {
    setNewBpMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveMaterialRow = (index: number) => {
    setNewBpMaterials(prev => prev.filter((_, i) => i !== index));
  };

  // Create client order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderClientName.trim() || !orderBlueprintName.trim()) return;

    await createOrder({
      clientName: orderClientName.trim(),
      blueprintName: orderBlueprintName.trim(),
      quantity: orderQuantity,
      mineralQuality: orderMineralQuality,
      userProvidesMaterials: orderClientProvidesMinerals,
      materialContributionPercent: orderClientProvidesMinerals ? orderMineralContributionPercent : 0,
      discountType: orderDiscountType,
      discountValue: orderDiscountValue,
      discountReason: orderDiscountReason,
      customPrice: orderCustomPrice,
      deliveryLocation: orderDeliveryLocation,
      notes: orderNotes
    });

    setFeedbackMsg(`✓ Commande client pour « ${orderClientName} » créée avec succès !`);
    setIsNewOrderModalOpen(false);
    setOrderClientName('');
    setOrderBlueprintName('');
    setOrderQuantity(1);
    setOrderNotes('');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Open price adjustment modal
  const handleOpenPriceModal = (ord: Order) => {
    setEditingPriceOrder(ord);
    setAdjDiscountType(ord.discountType || 'percent');
    setAdjDiscountValue(ord.discountValue || 20);
    setAdjCustomPrice(ord.totalFeeUEC);
    setAdjReason(ord.discountReason || 'Remise Membre Guilde');
  };

  const handleSavePriceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceOrder) return;

    await updateOrderPrice(
      editingPriceOrder.id,
      adjDiscountType,
      adjDiscountValue,
      adjReason,
      adjCustomPrice
    );
    setFeedbackMsg(`✓ Tarif de la commande #${editingPriceOrder.id} mis à jour.`);
    setEditingPriceOrder(null);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Filtered Owned Blueprints
  const filteredOwnedBlueprints = useMemo(() => {
    return blueprints.filter(bp => {
      const matchCat = bpCategoryFilter === 'Tous' || bp.category === bpCategoryFilter;
      const matchSearch = bp.name.toLowerCase().includes(bpSearchQuery.toLowerCase()) ||
        (bp.manufacturer && bp.manufacturer.toLowerCase().includes(bpSearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [blueprints, bpCategoryFilter, bpSearchQuery]);

  // Filtered Global Star Citizen Database
  const filteredGlobalDatabase = useMemo(() => {
    return STAR_CITIZEN_DATABASE.filter(item => {
      const matchCat = dbCategoryFilter === 'Tous' || item.category === dbCategoryFilter;
      const matchSearch = item.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(dbSearchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(dbSearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [dbCategoryFilter, dbSearchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Alert */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-sm font-mono flex items-center justify-between shadow-xl shadow-emerald-950 animate-fadeIn">
          <span className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </span>
          <button onClick={() => setFeedbackMsg('')} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: STOCKS & MINERAIS (WITH EXCEL EXTRACTOR & RESET) */}
      {/* ==================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="scifi-card rounded-2xl p-6 border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                  <Layers className="w-4 h-4" />
                  <span>Gestion des Stocks de Minerais & Matériaux</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
                  Stocks & Extraction de Fichiers
                </h2>
                <p className="text-sm text-slate-300 font-rajdhani text-base mt-1">
                  Extrayez vos fichiers Excel/CSV ligne par ligne avec respect fidèle des quantités, qualités et types d'extraction Star Citizen.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Extract from Excel File */}
                <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-rajdhani font-bold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-950 cursor-pointer transition-all">
                  <FileUp className="w-4 h-4 text-white" />
                  <span>{isParsingFile ? 'Lecture en cours...' : 'Extraire depuis Fichier Excel (.xlsx / .csv)'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv"
                    onChange={handleFileExtraction}
                    className="hidden"
                  />
                </label>

                {/* Manual Add Resource */}
                <button
                  onClick={() => setEditingStockItem({
                    name: '',
                    quantity: 10,
                    unit: 'SCU',
                    qualityTier: 'Standard',
                    extractionType: 'Minable Vaisseau',
                    attachedFileType: 'none',
                    googleDriveUrl: '',
                    notes: ''
                  })}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-bold text-sm flex items-center space-x-1.5 shadow-md shadow-cyan-950 transition-all"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Ajout Manuel</span>
                </button>

                {/* Reset Stocks Button */}
                <button
                  onClick={() => setIsResetStockModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-rose-950"
                  title="Vider et réinitialiser tous les stocks de minerais"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset Stocks</span>
                </button>
              </div>
            </div>
          </div>

          {/* Parse Error Notification */}
          {parseError && (
            <div className="p-3.5 bg-rose-950/90 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Stock Table with Interactive Sorting Headers */}
          <div className="scifi-card rounded-2xl overflow-hidden border-slate-800">
            {sortedInventory.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Layers className="w-14 h-14 text-slate-600 mx-auto" />
                <h4 className="font-orbitron font-bold text-lg text-slate-300">
                  Aucun minerai en stock actuellement
                </h4>
                <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                  Cliquez sur <strong>« Extraire depuis Fichier Excel (.xlsx / .csv) »</strong> ci-dessus pour importer votre tableau de raffinage ou ajoutez une ressource manuellement.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/95 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800 select-none">
                    <tr>
                      {/* Sortable: Material Name */}
                      <th 
                        onClick={() => handleStockSort('name')}
                        className="py-3.5 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par nom de matériau (A-Z / Z-A)"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Matériau / Minerai</span>
                          {renderSortIndicator('name')}
                        </div>
                      </th>

                      {/* Sortable: Quantity */}
                      <th 
                        onClick={() => handleStockSort('quantity')}
                        className="py-3.5 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par volume en stock"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Quantité en Stock</span>
                          {renderSortIndicator('quantity')}
                        </div>
                      </th>

                      {/* Sortable: Quality */}
                      <th 
                        onClick={() => handleStockSort('quality')}
                        className="py-3.5 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par niveau de pureté"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Qualité / Pureté Réelle</span>
                          {renderSortIndicator('quality')}
                        </div>
                      </th>

                      {/* Sortable: Type */}
                      <th 
                        onClick={() => handleStockSort('type')}
                        className="py-3.5 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par type d'extraction"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Type & Vaisseau / Outil</span>
                          {renderSortIndicator('type')}
                        </div>
                      </th>

                      <th className="py-3.5 px-4">Fichier / Drive</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-200">
                    {sortedInventory.map((item) => {
                      const deduced = deduceExtractionInfo(item.name, item.extractionType);
                      const displayType = item.extractionType || deduced.extractionType;
                      const displayShip = item.recommendedShip || deduced.recommendedShip;

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                          {/* Name */}
                          <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                            <span className="text-sm font-semibold">{item.name}</span>
                          </td>

                          {/* Quantity */}
                          <td className="py-3.5 px-4 font-bold text-cyan-300 text-sm">
                            {item.quantity.toLocaleString()} {item.unit}
                          </td>

                          {/* Quality */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded text-xs font-bold border inline-block bg-purple-950/70 text-purple-200 border-purple-500/40">
                              {item.qualityTier || 'Standard'}
                              {item.purityPercent !== undefined ? ` (${item.purityPercent}%)` : ''}
                            </span>
                          </td>

                          {/* Type & Ship */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              displayType.toLowerCase().includes('géo') || displayType.toLowerCase().includes('geo')
                                ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                                : displayType.toLowerCase().includes('vaisseau')
                                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
                                : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {displayType}
                            </span>
                            <div className="text-slate-400 text-[11px] mt-0.5 flex items-center space-x-1">
                              <Rocket className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{displayShip}</span>
                            </div>
                          </td>

                          {/* File / Drive */}
                          <td className="py-3.5 px-4">
                            {item.googleDriveUrl ? (
                              <a
                                href={item.googleDriveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-[11px]"
                              >
                                <LinkIcon className="w-3 h-3 text-sky-400" />
                                <span>Drive</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              </a>
                            ) : item.attachedFileName ? (
                              <a
                                href={item.attachedFileData || '#'}
                                download={item.attachedFileName}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px]"
                              >
                                {item.attachedFileType === 'excel' ? (
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                                )}
                                <span className="truncate max-w-[100px]">{item.attachedFileName}</span>
                              </a>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setEditingStockItem({
                                  id: item.id,
                                  name: item.name,
                                  quantity: item.quantity,
                                  unit: item.unit,
                                  category: item.category,
                                  unitValueUEC: item.unitValueUEC,
                                  qualityTier: item.qualityTier,
                                  purityPercent: item.purityPercent,
                                  recommendedShip: item.recommendedShip,
                                  extractionType: item.extractionType,
                                  attachedFileType: item.attachedFileType,
                                  attachedFileName: item.attachedFileName,
                                  attachedFileData: item.attachedFileData,
                                  googleDriveUrl: item.googleDriveUrl,
                                  notes: item.notes
                                })}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                                title="Modifier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteInventoryItem(item.id)}
                                className="p-1.5 rounded bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: MES BLUEPRINTS POSSÉDÉS (WITH CARDS & RESET) */}
      {/* ==================================================== */}
      {activeTab === 'blueprints' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="scifi-card rounded-2xl p-6 border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                  <Hammer className="w-4 h-4" />
                  <span>Catalogue de Fabrication de l'Atelier</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
                  Mes Blueprints Possédés ({blueprints.length})
                </h2>
                <p className="text-sm text-slate-300 font-rajdhani text-base mt-1">
                  Les recettes et technologies que vous maîtrisez. Ajoutez-en depuis la base web ou créez-en de nouvelles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsNewBlueprintOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-cyan-950 transition-all"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Nouveau Blueprint</span>
                </button>

                <button
                  onClick={() => setActiveTab('database')}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-rajdhani font-bold text-sm flex items-center space-x-1.5 shadow-md shadow-teal-950 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Importer depuis la Base Web SC</span>
                </button>

                <button
                  onClick={() => setIsResetBpModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-rose-950"
                  title="Réinitialiser les blueprints à l'état par défaut"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset Plans</span>
                </button>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'arme, composant, bouclier, constructeur..."
                  value={bpSearchQuery}
                  onChange={(e) => setBpSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
                <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
                {['Tous', 'Armement Vaisseau', 'Composant Vaisseau', 'Arme FPS', 'Armure FPS', 'Utilitaire & Équipement'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBpCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                      bpCategoryFilter === cat
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Holographic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOwnedBlueprints.map((bp) => (
              <div key={bp.id} className="scifi-card rounded-2xl p-5 border-slate-800 space-y-4 flex flex-col justify-between hover:border-cyan-500/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-bold">
                        {bp.category}
                      </span>
                      {bp.manufacturer && (
                        <span className="text-[10px] font-mono text-slate-400 ml-2">
                          {bp.manufacturer}
                        </span>
                      )}
                      <h4 className="font-orbitron font-bold text-base text-white mt-1.5 leading-snug">
                        {bp.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => deleteBlueprint(bp.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Supprimer ce blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-rajdhani line-clamp-2">
                    {bp.description}
                  </p>

                  {/* Required Materials Recipe */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                      Minerais / Ingrédients Requis :
                    </span>
                    <div className="space-y-1">
                      {bp.requiredMaterials.map((mat, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono py-1 px-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                          <span className="text-slate-300 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{mat.name}</span>
                          </span>
                          <span className="text-amber-400 font-bold">{mat.quantity} {mat.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-slate-800 text-slate-400">
                  <span className="flex items-center space-x-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{bp.craftTimeMinutes} min</span>
                  </span>
                  <span className="text-amber-400 font-bold text-sm">
                    {bp.feeUEC.toLocaleString()} aUEC
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: COMMANDES CLIENTS (WITH MINERAL PARTICIPATION) */}
      {/* ==================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="scifi-card rounded-2xl p-6 border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
                  <Package className="w-4 h-4" />
                  <span>Registre des Commandes & Demandeurs</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
                  Commandes Clients & Fabrications ({orders.length})
                </h2>
                <p className="text-sm text-slate-300 font-rajdhani text-base mt-1">
                  Enregistrez les demandes avec nom du demandeur, participation aux minerais, niveau de pureté et prix personnalisé.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsNewOrderModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-rajdhani font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-amber-950 transition-all"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Nouvelle Commande Client</span>
                </button>

                <button
                  onClick={() => setIsResetOrdersModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-rose-950"
                  title="Vider l'historique des commandes"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset Commandes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="scifi-card rounded-2xl p-12 text-center space-y-3 border-slate-800">
                <Package className="w-14 h-14 text-slate-600 mx-auto" />
                <h4 className="font-orbitron font-bold text-lg text-slate-300">
                  Aucune commande enregistrée
                </h4>
                <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                  Cliquez sur <strong>« Nouvelle Commande Client »</strong> ci-dessus pour inscrire un demandeur et lancer la fabrication.
                </p>
              </div>
            ) : (
              orders.map((ord) => {
                const basePrice = ord.baseFeeUEC || ord.totalFeeUEC;
                const hasDiscount = ord.totalFeeUEC < basePrice;

                return (
                  <div
                    key={ord.id}
                    className="scifi-card rounded-2xl p-5 border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-amber-500/40"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-orbitron font-bold text-lg text-white">
                          {ord.quantity}x {ord.blueprintName}
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                          ID: #{ord.id}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${
                          ord.status === 'pending'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : ord.status === 'accepted'
                            ? 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                            : ord.status === 'crafting'
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 animate-pulse'
                            : ord.status === 'ready'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {ord.status === 'pending' && '⏳ En Attente'}
                          {ord.status === 'accepted' && '📋 Acceptée'}
                          {ord.status === 'crafting' && '⚙️ En Fabrication'}
                          {ord.status === 'ready' && '📦 Prêt en Station'}
                          {ord.status === 'delivered' && '✓ Livrée / Terminée'}
                          {ord.status === 'cancelled' && '❌ Annulée'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Demandeur : <strong className="text-white text-sm">{ord.clientName}</strong></span>
                        <span>Livraison : <strong className="text-amber-300">{ord.deliveryLocation}</strong></span>

                        {/* Mineral Quality Badge */}
                        <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold ${
                          ord.mineralQuality === 'maximum_purity'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                            : ord.mineralQuality === 'high_grade'
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          💎 {ord.mineralQuality === 'maximum_purity' ? 'Pureté Maximale (x1.5)' : ord.mineralQuality === 'high_grade' ? 'Haute Qualité (x1.25)' : 'Qualité Standard'}
                        </span>

                        {/* Material Contribution Badge */}
                        {ord.userProvidesMaterials && (
                          <span className="px-2.5 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/40 text-[11px] font-bold">
                            ⛏️ Apport Minerais : {ord.materialContributionPercent || 100}%
                          </span>
                        )}
                        
                        {/* Price Display */}
                        <div className="flex items-center space-x-1.5">
                          <span>Facturation :</span>
                          {hasDiscount && (
                            <span className="line-through text-slate-500">{basePrice.toLocaleString()} aUEC</span>
                          )}
                          <span className="text-amber-400 font-bold text-sm">
                            {ord.totalFeeUEC === 0 ? '0 aUEC (OFFERT)' : `${ord.totalFeeUEC.toLocaleString()} aUEC`}
                          </span>

                          {ord.discountReason && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              {ord.discountReason}
                            </span>
                          )}
                        </div>
                      </div>

                      {ord.notes && (
                        <p className="text-xs text-slate-300 italic bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                          Note / Particularités : « {ord.notes} »
                        </p>
                      )}
                    </div>

                    {/* Step Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <button
                        onClick={() => handleOpenPriceModal(ord)}
                        className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center space-x-1 transition-all"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Modifier Prix</span>
                      </button>

                      {ord.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'accepted')}
                            className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accepter</span>
                          </button>
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                            className="px-3 py-2 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-rose-900 font-mono text-xs"
                          >
                            Refuser
                          </button>
                        </>
                      )}

                      {ord.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'crafting')}
                          className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Lancer Fabrication</span>
                        </button>
                      )}

                      {ord.status === 'crafting' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'ready')}
                          className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center space-x-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Signaler Prêt en Station</span>
                        </button>
                      )}

                      {ord.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-white text-black font-mono font-bold text-xs flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Valider la Remise (Livré)</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteOrder(ord.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                        title="Supprimer la commande"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: ENCYCLOPÉDIE GLOBALE DES BLUEPRINTS SC (WEB) */}
      {/* ==================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="scifi-card rounded-2xl p-6 border-teal-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-teal-400 font-mono text-xs uppercase tracking-widest">
                  <BookOpen className="w-4 h-4" />
                  <span>Base de Données Web Star Citizen</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
                  Encyclopédie des Recettes & Objets ({filteredGlobalDatabase.length})
                </h2>
                <p className="text-sm text-slate-300 font-rajdhani text-base mt-1">
                  Explorez toutes les technologies officielles Star Citizen et ajoutez-les en 1 clic à vos Blueprints possédés.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('blueprints')}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-cyan-950 transition-all"
                >
                  <Hammer className="w-4 h-4" />
                  <span>Retour à Mes Blueprints</span>
                </button>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'arme, bouclier S1-S3, quantum drive, armure, minerais..."
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-teal-400"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
                <Filter className="w-4 h-4 text-teal-400 shrink-0" />
                {['Tous', 'Armement Vaisseau', 'Composant Vaisseau', 'Arme FPS', 'Armure FPS', 'Utilitaire & Équipement', 'Minerai Raffiné', 'Salvage & Matériaux'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDbCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                      dbCategoryFilter === cat
                        ? 'bg-teal-500 text-black font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Database Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGlobalDatabase.map((item) => {
              const isAlreadyOwned = blueprints.some(b => b.name.toLowerCase() === item.name.toLowerCase());

              return (
                <div key={item.id} className="scifi-card rounded-2xl p-5 border-slate-800 space-y-4 flex flex-col justify-between hover:border-teal-500/50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700 font-bold">
                          {item.category}
                        </span>
                        {item.manufacturer && (
                          <span className="text-[10px] font-mono text-slate-400 ml-2">
                            {item.manufacturer}
                          </span>
                        )}
                        <h4 className="font-orbitron font-bold text-base text-white mt-1.5 leading-snug">
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-rajdhani line-clamp-2">
                      {item.description || 'Composant officiel Star Citizen.'}
                    </p>

                    {/* Suggested Materials Recipe if present */}
                    {item.suggestedMaterials && item.suggestedMaterials.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                          Recette Recommandée :
                        </span>
                        <div className="space-y-1">
                          {item.suggestedMaterials.map((mat, i) => (
                            <div key={i} className="flex justify-between text-xs font-mono py-0.5 px-2 bg-slate-900 rounded border border-slate-800/80">
                              <span className="text-slate-300">{mat.name}</span>
                              <span className="text-amber-400 font-bold">{mat.quantity} {mat.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Temps : {item.suggestedCraftTimeMinutes || 30} min</span>
                      <span className="text-amber-400 font-bold">{item.unitValueUEC?.toLocaleString() || 50000} aUEC</span>
                    </div>

                    {isAlreadyOwned ? (
                      <div className="w-full py-2 rounded-xl bg-slate-900 text-emerald-400 border border-emerald-500/40 text-center font-mono text-xs font-bold flex items-center justify-center space-x-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Déjà dans vos Blueprints</span>
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          await importBlueprintFromDatabase(item);
                          setFeedbackMsg(`✓ Blueprint « ${item.name} » ajouté à votre atelier !`);
                          setTimeout(() => setFeedbackMsg(''), 4000);
                        }}
                        className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-rajdhani font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-teal-950 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter à Mes Blueprints Possédés</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: PREVIEW & IMPORT EXTRACTED EXCEL / CSV ITEMS */}
      {/* ==================================================== */}
      {extractedPreviewItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="scifi-card max-w-4xl w-full rounded-2xl p-6 border-emerald-500/50 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-950/90 rounded-xl border border-emerald-500/40 text-emerald-400">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-xl text-white">
                      Extraction Réussie du Fichier Excel
                    </h3>
                    <p className="text-xs font-mono text-emerald-400">
                      Fichier : <strong>{extractedFileName}</strong> • <strong>{extractedPreviewItems.length} matériau(x) extrait(s) (Tri A-Z)</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setExtractedPreviewItems([]); setExtractedFileName(''); }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-mono mb-4">
                Les colonnes Matériaux, Quantités, Qualités exactes et Types d'extraction (Minable Vaisseau / Minable Géo) ont été extraites fidèlement :
              </p>

              {/* Extraction Preview Table */}
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Matériau (Ordre A-Z)</th>
                      <th className="py-2.5 px-3">Quantité</th>
                      <th className="py-2.5 px-3">Qualité / Pureté</th>
                      <th className="py-2.5 px-3">Type & Vaisseau / Outil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {extractedPreviewItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span>{item.name}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-cyan-300">
                          {item.quantity.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-200 font-bold">
                            {item.qualityTier} {item.purityPercent !== undefined ? `(${item.purityPercent}%)` : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5 text-amber-300 font-semibold">
                            <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-[11px] text-cyan-300">
                              {item.extractionType}
                            </span>
                            <span className="text-slate-400 text-[11px]">({item.recommendedShip})</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setExtractedPreviewItems([]); setExtractedFileName(''); }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmBatchImport}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-rajdhani font-bold text-sm shadow-lg shadow-emerald-950 flex items-center space-x-2"
              >
                <Check className="w-4 h-4 text-black" />
                <span>Importer les {extractedPreviewItems.length} Matériaux dans mes Stocks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: RESET DES STOCKS */}
      {/* ==================================================== */}
      {isResetStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-2xl p-6 border-rose-500/50 shadow-2xl relative">
            <button
              onClick={() => setIsResetStockModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-950/80 rounded-xl border border-rose-500/40 text-rose-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Réinitialiser les Stocks
                </h3>
                <span className="text-xs font-mono text-rose-400">
                  Remise à zéro des minerais
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-5 font-mono leading-relaxed">
              Êtes-vous certain de vouloir vider tous les stocks de minerais et matériaux actuels ? Vous pourrez réimporter votre fichier Excel à tout moment.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsResetStockModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetInventory('empty');
                  setIsResetStockModalOpen(false);
                  setFeedbackMsg('✓ Tous les stocks de minerais ont été réinitialisés à zéro.');
                  setTimeout(() => setFeedbackMsg(''), 4000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-950"
              >
                Confirmer le Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: RESET DES BLUEPRINTS */}
      {/* ==================================================== */}
      {isResetBpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-2xl p-6 border-rose-500/50 shadow-2xl relative">
            <button
              onClick={() => setIsResetBpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-950/80 rounded-xl border border-rose-500/40 text-rose-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Réinitialiser les Blueprints
                </h3>
                <span className="text-xs font-mono text-rose-400">
                  Restauration du catalogue par défaut
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-5 font-mono leading-relaxed">
              Êtes-vous certain de vouloir restaurer les plans de fabrication par défaut de l'atelier ?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsResetBpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetBlueprints();
                  setIsResetBpModalOpen(false);
                  setFeedbackMsg('✓ Les blueprints ont été restaurés à leur configuration initiale.');
                  setTimeout(() => setFeedbackMsg(''), 4000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-950"
              >
                Confirmer le Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: RESET DES COMMANDES */}
      {/* ==================================================== */}
      {isResetOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-2xl p-6 border-rose-500/50 shadow-2xl relative">
            <button
              onClick={() => setIsResetOrdersModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-950/80 rounded-xl border border-rose-500/40 text-rose-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Réinitialiser les Commandes
                </h3>
                <span className="text-xs font-mono text-rose-400">
                  Effacement du registre des commandes
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-5 font-mono leading-relaxed">
              Êtes-vous certain de vouloir effacer l'ensemble des commandes clients actuelles ?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsResetOrdersModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetOrders();
                  setIsResetOrdersModalOpen(false);
                  setFeedbackMsg('✓ Le registre des commandes a été réinitialisé.');
                  setTimeout(() => setFeedbackMsg(''), 4000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-950"
              >
                Confirmer le Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: FORMULAIRE DE CRÉATION DE COMMANDE CLIENT */}
      {/* ==================================================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="scifi-card max-w-xl w-full rounded-2xl p-6 border-amber-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewOrderModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-500/40 text-amber-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Nouvelle Commande de Fabrication
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  Enregistrement d'une demande client
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 font-mono text-xs">
              {/* Client Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nom du Demandeur (Joueur / Client / Escouade) : *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: @StarPilot_Max, Ghost_Miner, Commander_Vance..."
                  value={orderClientName}
                  onChange={(e) => setOrderClientName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:border-amber-400"
                />
              </div>

              {/* Blueprint Selector with Autocomplete */}
              <AutocompleteSearch
                label="Objet / Technologie à Fabriquer (Base Star Citizen) : *"
                value={orderBlueprintName}
                onChange={(val) => setOrderBlueprintName(val)}
                onSelect={(item) => setOrderBlueprintName(item.name)}
                placeholder="Rechercher par nom (ex: Behring S7, Crossfield, FR-86, P6-LR...)"
              />

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block text-slate-400 mb-1">Quantité d'unités :</label>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                {/* Mineral Quality Selection */}
                <div>
                  <label className="block text-slate-400 mb-1">Qualité / Pureté Minerais :</label>
                  <select
                    value={orderMineralQuality}
                    onChange={(e) => setOrderMineralQuality(e.target.value as MineralQualityTier)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="standard">Standard (x1.0)</option>
                    <option value="high_grade">Haute Qualité (x1.25)</option>
                    <option value="maximum_purity">Pureté Maximale (x1.5)</option>
                  </select>
                </div>
              </div>

              {/* Mineral Contribution by Client */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-teal-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-teal-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orderClientProvidesMinerals}
                      onChange={(e) => setOrderClientProvidesMinerals(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-0"
                    />
                    <span>Le demandeur participe / apporte ses propres minerais</span>
                  </label>
                </div>

                {orderClientProvidesMinerals && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Part de minerais fournie par le demandeur :</span>
                      <span className="text-teal-400 font-bold">{orderMineralContributionPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={orderMineralContributionPercent}
                      onChange={(e) => setOrderMineralContributionPercent(parseInt(e.target.value))}
                      className="w-full accent-teal-400"
                    />
                    <p className="text-[11px] text-teal-400/90 italic">
                      💡 Une réduction proportionnelle des frais de fabrication (-60% pour 100% de minerais) sera appliquée automatiquement.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Station */}
              <div>
                <label className="block text-slate-400 mb-1">Lieu / Station de Livraison :</label>
                <select
                  value={orderDeliveryLocation}
                  onChange={(e) => setOrderDeliveryLocation(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-amber-300"
                >
                  <option value="HUR-L1 Green Glade">HUR-L1 Green Glade (Raffinerie Principale)</option>
                  <option value="CRU-L1 Ambitious Dream">CRU-L1 Ambitious Dream</option>
                  <option value="ARC-L1 Wide Forest">ARC-L1 Wide Forest</option>
                  <option value="MIC-L1 Shallow Frontier">MIC-L1 Shallow Frontier</option>
                  <option value="Everus Harbor (Hurston)">Everus Harbor (Hurston)</option>
                  <option value="Port Tressler (MicroTech)">Port Tressler (MicroTech)</option>
                  <option value="Baijini Point (ArcCorp)">Baijini Point (ArcCorp)</option>
                  <option value="Seraphim Station (Crusader)">Seraphim Station (Crusader)</option>
                  <option value="Grim HEX (Ceilings)">Grim HEX (Hors-la-loi)</option>
                  <option value="Pyro Gateway (Pyro)">Pyro Gateway (Système Pyro)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 mb-1">Particularités / Notes de fabrication :</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Armement à monter sur Corsair en urgence, client a livré 30 SCU Quantainium..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold font-rajdhani text-base shadow-lg shadow-amber-950 mt-2"
              >
                Enregistrer la Commande Client
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: AJUSTEMENT DE PRIX D'UNE COMMANDE */}
      {/* ==================================================== */}
      {editingPriceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-2xl p-6 border-amber-500/50 shadow-2xl relative">
            <button
              onClick={() => setEditingPriceOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-500/40 text-amber-400">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">
                  Ajuster Tarif / Remise
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  Client : {editingPriceOrder.clientName} • #{editingPriceOrder.id}
                </span>
              </div>
            </div>

            <form onSubmit={handleSavePriceAdjustment} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Type d'ajustement :</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('none')}
                    className={`py-2 px-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'none' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('percent')}
                    className={`py-2 px-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'percent' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Remise %
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('free')}
                    className={`py-2 px-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'free' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    100% Offert
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('custom')}
                    className={`py-2 px-1 rounded-lg text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'custom' ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Prix Fixe
                  </button>
                </div>
              </div>

              {adjDiscountType === 'percent' && (
                <div>
                  <label className="block text-slate-400 mb-1">Pourcentage de réduction (%) :</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={adjDiscountValue}
                      onChange={(e) => setAdjDiscountValue(parseInt(e.target.value) || 0)}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-bold"
                    />
                    <div className="flex space-x-1">
                      {[20, 50, 60].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setAdjDiscountValue(pct)}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 text-xs"
                        >
                          -{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adjDiscountType === 'custom' && (
                <div>
                  <label className="block text-slate-400 mb-1">Montant facturé en aUEC :</label>
                  <input
                    type="number"
                    min="0"
                    value={adjCustomPrice}
                    onChange={(e) => setAdjCustomPrice(parseInt(e.target.value) || 0)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-purple-300 font-bold text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Motif affiché :</label>
                <input
                  type="text"
                  placeholder="Ex: Tarif Membre Escouade, Geste commercial, Troc..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold font-rajdhani text-sm shadow-lg shadow-amber-950"
              >
                Appliquer le Tarif Modifié
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 7: CRÉATION D'UN NOUVEAU BLUEPRINT */}
      {/* ==================================================== */}
      {isNewBlueprintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="scifi-card max-w-xl w-full rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewBlueprintOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">
              Créer un Nouveau Blueprint de Fabrication
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Tapez 2 lettres pour pré-remplir les données officielles depuis la base Star Citizen.
            </p>

            <form onSubmit={handleCreateBlueprint} className="space-y-4 font-mono text-xs">
              <AutocompleteSearch
                label="Nom du plan / technologie : *"
                value={newBpName}
                onChange={(val) => setNewBpName(val)}
                onSelect={handleBlueprintPresetSelect}
                placeholder="Rechercher (ex: Behring S7, Panther CF-337, Crossfield, ADP-mk4...)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Catégorie :</label>
                  <select
                    value={newBpCategory}
                    onChange={(e) => setNewBpCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Armement Vaisseau">Armement Vaisseau</option>
                    <option value="Composant Vaisseau">Composant Vaisseau</option>
                    <option value="Arme FPS">Arme FPS</option>
                    <option value="Armure FPS">Armure FPS</option>
                    <option value="Utilitaire & Équipement">Utilitaire & Équipement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Durée (minutes) :</label>
                  <input
                    type="number"
                    value={newBpCraftTime}
                    onChange={(e) => setNewBpCraftTime(parseInt(e.target.value) || 10)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Frais Suggérés (aUEC) :</label>
                <input
                  type="number"
                  value={newBpFee}
                  onChange={(e) => setNewBpFee(parseInt(e.target.value) || 50000)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description :</label>
                <textarea
                  rows={2}
                  value={newBpDescription}
                  onChange={(e) => setNewBpDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-300 font-bold uppercase text-[10px]">
                    Ingrédients Requis :
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter ingrédient</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newBpMaterials.map((mat, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <AutocompleteSearch
                          value={mat.name}
                          onChange={(val) => handleUpdateMaterialRow(i, 'name', val)}
                          onSelect={(item) => handleUpdateMaterialRow(i, 'unit', item.defaultUnit || 'SCU')}
                          placeholder="Minerai (ex: Quantainium, Bexalite...)"
                        />
                      </div>
                      <input
                        type="number"
                        value={mat.quantity}
                        onChange={(e) => handleUpdateMaterialRow(i, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-16 py-2 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center font-bold"
                      />
                      <span className="text-slate-400 text-[11px] w-12">{mat.unit}</span>
                      {newBpMaterials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialRow(i)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full scifi-button py-3 rounded-xl text-cyan-200 font-bold font-rajdhani text-sm mt-4"
              >
                Enregistrer le Blueprint dans mon Atelier
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 8: AJOUT / ÉDITION MANUELLE DE RESSOURCE */}
      {/* ==================================================== */}
      {editingStockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="scifi-card max-w-lg w-full rounded-2xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStockItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-orbitron font-bold text-base text-white mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Ajouter / Modifier une Ressource</span>
            </h3>

            <form onSubmit={handleSaveStock} className="space-y-4 font-mono text-xs">
              <AutocompleteSearch
                label="Nom du minerai / matériau (Base Star Citizen) :"
                value={editingStockItem.name}
                onChange={(val) => {
                  const deduced = deduceExtractionInfo(val, editingStockItem.extractionType);
                  setEditingStockItem({
                    ...editingStockItem,
                    name: val,
                    recommendedShip: deduced.recommendedShip,
                    extractionType: deduced.extractionType
                  });
                }}
                onSelect={(item) => {
                  const deduced = deduceExtractionInfo(item.name, editingStockItem.extractionType);
                  setEditingStockItem({
                    ...editingStockItem,
                    name: item.name,
                    unit: item.defaultUnit || 'SCU',
                    recommendedShip: deduced.recommendedShip,
                    extractionType: deduced.extractionType
                  });
                }}
                placeholder="Tapez 2 lettres (ex: Quan, Bex, RMC, Lara, Gold)..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Quantité en Stock :</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingStockItem.quantity}
                    onChange={(e) => setEditingStockItem({ ...editingStockItem, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Unité :</label>
                  <select
                    value={editingStockItem.unit}
                    onChange={(e) => setEditingStockItem({ ...editingStockItem, unit: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="SCU">SCU</option>
                    <option value="cSCU">cSCU</option>
                    <option value="µSCU">µSCU</option>
                    <option value="Unités">Unités</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Qualité / Pureté :</label>
                  <input
                    type="text"
                    value={editingStockItem.qualityTier || ''}
                    onChange={(e) => setEditingStockItem({ ...editingStockItem, qualityTier: e.target.value })}
                    placeholder="Ex: 852, 796, 99.2%, Standard, Pur..."
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Type d'Extraction :</label>
                  <select
                    value={editingStockItem.extractionType || 'Minable Vaisseau'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const deduced = deduceExtractionInfo(editingStockItem.name, newType);
                      setEditingStockItem({
                        ...editingStockItem,
                        extractionType: newType,
                        recommendedShip: deduced.recommendedShip
                      });
                    }}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-bold"
                  >
                    <option value="Minable Vaisseau">🚀 Minable Vaisseau</option>
                    <option value="Minable Géo">🚜 Minable Géo (Véhicule)</option>
                    <option value="Minable FPS">⛏️ Minable FPS (Manuel)</option>
                    <option value="Salvage Coque (RMC)">🛠️ Salvage Coque (RMC)</option>
                    <option value="Salvage Structurel (CM)">🏗️ Salvage Structurel (CM)</option>
                    <option value="Collecte Carburant">⛽ Collecte Carburant</option>
                  </select>
                </div>
              </div>

              {/* Personal File Attachment & Google Drive Link */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-3">
                <span className="text-cyan-400 font-bold flex items-center space-x-1.5 text-xs">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  <span>Fichier Joint & Lien Google Drive (Optionnel)</span>
                </span>

                <div>
                  <label className="block text-slate-400 mb-1 flex items-center space-x-1">
                    <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Lien Google Sheets / Drive :</span>
                  </label>
                  <input
                    type="url"
                    value={editingStockItem.googleDriveUrl || ''}
                    onChange={(e) => setEditingStockItem({ ...editingStockItem, googleDriveUrl: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/..."
                    className="w-full py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sky-300 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full scifi-button py-2.5 rounded-xl text-cyan-200 font-bold font-rajdhani text-sm mt-2"
              >
                Enregistrer la Ressource
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
