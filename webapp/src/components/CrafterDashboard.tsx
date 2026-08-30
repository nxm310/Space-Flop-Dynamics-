import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatus, Blueprint, MaterialRequirement, Order, DiscountType, InventoryItem } from '../types';
import { AutocompleteSearch } from './AutocompleteSearch';
import { SCItemDefinition } from '../data/starCitizenDatabase';
import { parseStockFile, ExtractedStockItem, deduceExtractionInfo } from '../utils/excelExtractor';
import { 
  ShieldCheck, 
  Hammer, 
  Layers, 
  Package, 
  Flame, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Coins, 
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
  Wrench,
  Check,
  FileUp,
  AlertCircle,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface CrafterDashboardProps {
  onOpenCreateRequestModal: () => void;
}

type SortField = 'name' | 'quantity' | 'quality' | 'type';
type SortDirection = 'asc' | 'desc';

interface StockEditState {
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

export const CrafterDashboard: React.FC<CrafterDashboardProps> = ({ onOpenCreateRequestModal }) => {
  const { 
    inventory, 
    blueprints, 
    orders, 
    telemetry, 
    updateOrderStatus, 
    updateOrderPrice,
    updateInventoryItem, 
    importExtractedItems,
    resetInventory,
    addBlueprint, 
    deleteBlueprint,
    refreshAgentData 
  } = useApp();
  const { isHost } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'inventory' | 'blueprints' | 'telemetry'>('orders');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Table Sorting state (default alphabetical A-Z on name)
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Edit stock modal state
  const [editingItem, setEditingItem] = useState<StockEditState | null>(null);

  // Extracted file import preview modal state
  const [extractedPreviewItems, setExtractedPreviewItems] = useState<ExtractedStockItem[]>([]);
  const [extractedFileName, setExtractedFileName] = useState<string>('');
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>('');

  // Price adjustment modal for host
  const [editingPriceOrder, setEditingPriceOrder] = useState<Order | null>(null);
  const [adjDiscountType, setAdjDiscountType] = useState<DiscountType>('percent');
  const [adjDiscountValue, setAdjDiscountValue] = useState<number>(20);
  const [adjCustomPrice, setAdjCustomPrice] = useState<number>(0);
  const [adjReason, setAdjReason] = useState<string>('Remise Membre Guilde');

  // New blueprint modal
  const [isNewBlueprintOpen, setIsNewBlueprintOpen] = useState<boolean>(false);
  const [newBpName, setNewBpName] = useState<string>('');
  const [newBpCategory, setNewBpCategory] = useState<string>('Armement Vaisseau');
  const [newBpDescription, setNewBpDescription] = useState<string>('');
  const [newBpCraftTime, setNewBpCraftTime] = useState<number>(30);
  const [newBpFee, setNewBpFee] = useState<number>(50000);
  const [newBpMaterials, setNewBpMaterials] = useState<MaterialRequirement[]>([
    { name: 'Quantainium Raffiné', quantity: 10, unit: 'SCU' }
  ]);

  if (!isHost) {
    return (
      <div className="scifi-card rounded-xl p-12 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-orbitron font-bold text-xl text-white">Accès Réservé à l'Hôte Artisan</h2>
        <p className="text-xs text-slate-400 font-mono">
          Seul le compte Crafter principal peut gérer les stocks, les recettes et valider les commandes.
        </p>
      </div>
    );
  }

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted inventory list
  const sortedInventory = useMemo(() => {
    const activeItems = inventory.filter(i => i.quantity > 0);
    return [...activeItems].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
      } else if (sortField === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortField === 'quality') {
        comparison = (a.qualityTier || '').localeCompare(b.qualityTier || '', 'fr', { sensitivity: 'base' });
      } else if (sortField === 'type') {
        const typeA = a.extractionType || '';
        const typeB = b.extractionType || '';
        comparison = typeA.localeCompare(typeB, 'fr', { sensitivity: 'base' });
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [inventory, sortField, sortDirection]);

  // Handle Reset of Inventory Stocks
  const handleConfirmReset = async (mode: 'empty' | 'zero' = 'empty') => {
    await resetInventory(mode);
    setIsResetModalOpen(false);
    setFeedbackMsg('✓ Tous les stocks de minerais ont été réinitialisés à zéro.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Handle Excel / CSV File Extraction
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

  // Confirm Import of Extracted Items
  const handleConfirmBatchImport = async () => {
    if (extractedPreviewItems.length === 0) return;

    await importExtractedItems(extractedPreviewItems);
    setFeedbackMsg(`✓ ${extractedPreviewItems.length} matériaux extraits et enregistrés dans vos stocks !`);
    setExtractedPreviewItems([]);
    setExtractedFileName('');
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  // Stock edit submit
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalName = editingItem.name?.trim() || editingItem.attachedFileName || 'Fichier Ressource';
    const deduced = deduceExtractionInfo(finalName, editingItem.extractionType);

    try {
      await updateInventoryItem({
        name: finalName,
        quantity: editingItem.quantity !== undefined ? editingItem.quantity : 1,
        unit: editingItem.unit || 'SCU',
        category: editingItem.category || 'Ressource',
        unitValueUEC: editingItem.unitValueUEC || 10000,
        qualityTier: editingItem.qualityTier || 'Standard',
        purityPercent: editingItem.purityPercent,
        recommendedShip: editingItem.recommendedShip || deduced.recommendedShip,
        extractionType: editingItem.extractionType || deduced.extractionType,
        attachedFileType: editingItem.attachedFileType || (editingItem.googleDriveUrl ? 'link' : 'none'),
        attachedFileName: editingItem.attachedFileName,
        attachedFileData: editingItem.attachedFileData,
        googleDriveUrl: editingItem.googleDriveUrl,
        notes: editingItem.notes
      });

      setFeedbackMsg(`✓ Ressource « ${finalName} » enregistrée avec succès.`);
      setEditingItem(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Error saving stock:', err);
      setFeedbackMsg('❌ Erreur lors de l\'enregistrement.');
    }
  };

  // Handle single file upload inside edit modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    let fileType: 'pdf' | 'excel' | 'image' | 'none' = 'none';
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) fileType = 'pdf';
    else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) fileType = 'excel';
    else if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) fileType = 'image';

    const defaultName = editingItem.name?.trim() ? editingItem.name : file.name.replace(/\.[^/.]+$/, "");
    const deduced = deduceExtractionInfo(defaultName);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setEditingItem(prev => prev ? {
        ...prev,
        name: defaultName,
        recommendedShip: prev.recommendedShip || deduced.recommendedShip,
        extractionType: prev.extractionType || deduced.extractionType,
        attachedFileType: fileType,
        attachedFileName: file.name,
        attachedFileData: dataUrl
      } : null);
    };
    reader.readAsDataURL(file);
  };

  // Price adjustment submit
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
    setEditingPriceOrder(null);
  };

  const handleOpenPriceModal = (ord: Order) => {
    setEditingPriceOrder(ord);
    setAdjDiscountType(ord.discountType || 'percent');
    setAdjDiscountValue(ord.discountValue || 20);
    setAdjCustomPrice(ord.totalFeeUEC);
    setAdjReason(ord.discountReason || 'Remise Membre Guilde');
  };

  // Autocomplete callback for Blueprint item selection
  const handleBlueprintPresetSelect = (item: SCItemDefinition) => {
    setNewBpName(item.name);
    if (item.category) setNewBpCategory(item.category as any);
    if (item.description) setNewBpDescription(item.description);
    if (item.unitValueUEC) setNewBpFee(item.unitValueUEC);
    if (item.suggestedCraftTimeMinutes) setNewBpCraftTime(item.suggestedCraftTimeMinutes);
    if (item.suggestedMaterials && item.suggestedMaterials.length > 0) {
      setNewBpMaterials(item.suggestedMaterials);
    }
  };

  // Add material row in new blueprint
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

  // Submit new blueprint
  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBpName.trim()) return;

    await addBlueprint({
      name: newBpName,
      category: newBpCategory,
      description: newBpDescription || 'Fabrication sur mesure.',
      requiredMaterials: newBpMaterials,
      craftTimeMinutes: newBpCraftTime,
      feeUEC: newBpFee,
      available: true
    });

    setIsNewBlueprintOpen(false);
    setNewBpName('');
    setNewBpDescription('');
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-60 inline-block ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400 inline-block ml-1 font-bold" />
      : <ArrowDown className="w-3.5 h-3.5 text-cyan-400 inline-block ml-1 font-bold" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="scifi-card rounded-xl p-6 relative overflow-hidden border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>Console de Contrôle Master Crafter</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
              Atelier Artisanal de l'Hôte
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 font-rajdhani text-base">
              Extraction fidèle des fichiers Excel (.xlsx) / CSV avec respect strict des qualités, types (Minable Vaisseau / Minable Géo) et tri interactif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshAgentData}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync PC Direct</span>
            </button>

            <button
              onClick={onOpenCreateRequestModal}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-rajdhani font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>Demander du Minerai</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fadeIn">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{feedbackMsg}</span>
            </span>
            <button onClick={() => setFeedbackMsg('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sub-navigation tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-rajdhani font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'orders'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Gestion des Commandes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-rajdhani font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'inventory'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stocks & Extraction ({inventory.filter(i => i.quantity > 0).length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('blueprints')}
            className={`px-4 py-2 rounded-lg text-xs font-rajdhani font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'blueprints'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>Éditeur de Plans ({blueprints.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`px-4 py-2 rounded-lg text-xs font-rajdhani font-bold flex items-center space-x-2 transition-all ${
              activeSubTab === 'telemetry'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Logs & Télémétrie SC Live</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ORDERS MANAGEMENT */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-orbitron font-bold text-lg text-white">
              Commandes des Joueurs en Attente & Traitement
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} commande(s) active(s)
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => {
              const basePrice = ord.baseFeeUEC || ord.totalFeeUEC;
              const hasDiscount = ord.totalFeeUEC < basePrice;

              return (
                <div
                  key={ord.id}
                  className="scifi-card rounded-xl p-5 border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-3">
                      <span className="font-orbitron font-bold text-base text-white">
                        {ord.quantity}x {ord.blueprintName}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        ID: #{ord.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Client : <strong className="text-white">{ord.clientName}</strong></span>
                      <span>Lieu de livraison : <strong className="text-amber-300">{ord.deliveryLocation}</strong></span>

                      <span className={`px-2 py-0.2 rounded border text-[10px] font-bold ${
                        ord.mineralQuality === 'maximum_purity'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                          : ord.mineralQuality === 'high_grade'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        💎 {ord.mineralQuality === 'maximum_purity' ? 'Pureté Maximale (x1.5)' : ord.mineralQuality === 'high_grade' ? 'Haute Qualité (x1.25)' : 'Qualité Standard'}
                      </span>
                      
                      <div className="flex items-center space-x-1.5">
                        <span>Tarif :</span>
                        {hasDiscount && (
                          <span className="line-through text-slate-500">{basePrice.toLocaleString()} aUEC</span>
                        )}
                        <span className="text-amber-400 font-bold">
                          {ord.totalFeeUEC === 0 ? '0 aUEC (OFFERT)' : `${ord.totalFeeUEC.toLocaleString()} aUEC`}
                        </span>

                        {ord.discountReason && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px]">
                            {ord.discountReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {ord.notes && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2 rounded border border-slate-800">
                        Note client : « {ord.notes} »
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleOpenPriceModal(ord)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center space-x-1 transition-all"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modifier Prix / Remise</span>
                    </button>

                    {ord.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'accepted')}
                          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-rose-900 font-mono text-xs"
                        >
                          Refuser
                        </button>
                      </>
                    )}

                    {ord.status === 'accepted' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'crafting')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Lancer la Fabrication</span>
                      </button>
                    )}

                    {ord.status === 'crafting' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'ready')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Signaler Prêt en Station</span>
                      </button>
                    )}

                    {ord.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'delivered')}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-white text-black font-mono font-bold text-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Valider la Remise (Livré)</span>
                      </button>
                    )}

                    {ord.status === 'delivered' && (
                      <span className="px-3 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono text-xs">
                        Terminée
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INVENTORY & FILE EXTRACTION */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-orbitron font-bold text-lg text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Stocks Minerais, Qualités & Types d'Extraction</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Classé par ordre alphabétique. Cliquez sur les en-têtes (Matériau, Quantité, Qualité, Type) pour trier.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Extract from Excel/CSV File */}
              <label className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-rajdhani font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950 cursor-pointer transition-all">
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
                onClick={() => setEditingItem({
                  name: '',
                  quantity: 10,
                  unit: 'SCU',
                  qualityTier: 'Standard',
                  extractionType: 'Minable Vaisseau',
                  attachedFileType: 'none',
                  googleDriveUrl: '',
                  notes: ''
                })}
                className="px-3.5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-950 transition-all"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Ajout Manuel</span>
              </button>

              {/* Reset Stocks Button */}
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-3 py-2.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center space-x-1.5 transition-all"
                title="Vider et réinitialiser tous les stocks"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset des Stocks</span>
              </button>
            </div>
          </div>

          {/* Parse Error Notification */}
          {parseError && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Stock Table with Interactive Sorting Headers (NO Location Column) */}
          <div className="scifi-card rounded-xl overflow-hidden border-slate-800">
            {sortedInventory.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="font-orbitron font-bold text-base text-slate-300">
                  Aucun minerai en stock actuellement
                </h4>
                <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                  Cliquez sur <strong>« Extraire depuis Fichier Excel (.xlsx / .csv) »</strong> pour importer vos données de minage avec leurs qualités et types respectifs.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                    <tr>
                      {/* Sortable Header: Material Name */}
                      <th 
                        onClick={() => handleSort('name')}
                        className="py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par nom de matériau (A-Z / Z-A)"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Matériau / Minerai</span>
                          {renderSortIndicator('name')}
                        </div>
                      </th>

                      {/* Sortable Header: Quantity */}
                      <th 
                        onClick={() => handleSort('quantity')}
                        className="py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par quantité en stock"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Quantité en Stock</span>
                          {renderSortIndicator('quantity')}
                        </div>
                      </th>

                      {/* Sortable Header: Quality */}
                      <th 
                        onClick={() => handleSort('quality')}
                        className="py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par qualité / pureté"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Qualité / Pureté</span>
                          {renderSortIndicator('quality')}
                        </div>
                      </th>

                      {/* Sortable Header: Type / Extraction */}
                      <th 
                        onClick={() => handleSort('type')}
                        className="py-3 px-4 cursor-pointer hover:text-cyan-300 transition-colors"
                        title="Trier par type d'extraction (Minable Vaisseau, Minable Géo...)"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Type & Vaisseau / Outil</span>
                          {renderSortIndicator('type')}
                        </div>
                      </th>

                      <th className="py-3 px-4">Fichier / Drive</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {sortedInventory.map((item) => {
                      const deduced = deduceExtractionInfo(item.name, item.extractionType);
                      const displayType = item.extractionType || deduced.extractionType;
                      const displayShip = item.recommendedShip || deduced.recommendedShip;

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          {/* Name */}
                          <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                            <span className="text-sm font-semibold">{item.name}</span>
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-4 font-bold text-cyan-300 text-sm">
                            {item.quantity.toLocaleString()} {item.unit}
                          </td>

                          {/* Quality (Strictly Respects Table Content) */}
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded text-xs font-bold border inline-block bg-purple-950/60 text-purple-200 border-purple-500/40">
                              {item.qualityTier || 'Standard'}
                              {item.purityPercent !== undefined ? ` (${item.purityPercent}%)` : ''}
                            </span>
                          </td>

                          {/* Type & Ship / Tool */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                displayType.toLowerCase().includes('géo') || displayType.toLowerCase().includes('geo')
                                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                                  : displayType.toLowerCase().includes('vaisseau')
                                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
                                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {displayType}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-400 text-[11px] mt-0.5">
                              <Rocket className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{displayShip}</span>
                            </div>
                          </td>

                          {/* File / Drive link */}
                          <td className="py-3 px-4">
                            {item.googleDriveUrl ? (
                              <a
                                href={item.googleDriveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-[11px]"
                              >
                                <LinkIcon className="w-3 h-3 text-sky-400" />
                                <span>Drive</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              </a>
                            ) : item.attachedFileName ? (
                              <a
                                href={item.attachedFileData || '#'}
                                download={item.attachedFileName}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px]"
                              >
                                {item.attachedFileType === 'excel' ? (
                                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <FileText className="w-3 h-3 text-rose-400" />
                                )}
                                <span className="truncate max-w-[90px]">{item.attachedFileName}</span>
                              </a>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setEditingItem({
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
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono inline-flex items-center space-x-1 border border-slate-700"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Modifier</span>
                            </button>
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

      {/* SUB-TAB 3: BLUEPRINTS MANAGER */}
      {activeSubTab === 'blueprints' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-orbitron font-bold text-lg text-white">
                Gestionnaire des Plans & Recettes de Fabrication
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Tapez les 3 premières lettres pour charger automatiquement les objets officiels Star Citizen.
              </p>
            </div>

            <button
              onClick={() => setIsNewBlueprintOpen(true)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-950"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Nouveau Blueprint</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blueprints.map((bp) => (
              <div key={bp.id} className="scifi-card rounded-xl p-5 border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {bp.category}
                    </span>
                    <h4 className="font-orbitron font-bold text-base text-white mt-1">
                      {bp.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => deleteBlueprint(bp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Supprimer ce blueprint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Ingrédients Requis :</span>
                  {bp.requiredMaterials.map((mat, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono py-0.5 px-2 bg-slate-900 rounded">
                      <span className="text-slate-300">{mat.name}</span>
                      <span className="text-amber-400 font-bold">{mat.quantity} {mat.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
                  <span>Temps : {bp.craftTimeMinutes} min</span>
                  <span className="text-amber-400 font-bold">{bp.feeUEC.toLocaleString()} aUEC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TELEMETRY & LOGS */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="scifi-card rounded-xl p-5 border-cyan-500/30">
            <h3 className="font-orbitron font-bold text-base text-white mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Télémétrie Star Citizen Extraite du PC</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">STATUT JEU</span>
                <span className={`font-bold text-sm flex items-center space-x-1.5 ${telemetry?.game_running ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${telemetry?.game_running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{telemetry?.game_running ? 'En Jeu (Actif)' : 'Hors Ligne'}</span>
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SHARD SERVEUR</span>
                <span className="text-cyan-300 font-bold text-xs truncate block">{telemetry?.server_shard || 'Non connecté'}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LOCALISATION ACTUELLE</span>
                <span className="text-amber-300 font-bold text-sm">{telemetry?.current_location || 'En orbite'}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">VAISSEAU DÉTECTÉ</span>
                <span className="text-emerald-300 font-bold text-sm truncate block">{telemetry?.current_ship || 'Aucun'}</span>
              </div>
            </div>
          </div>

          <div className="scifi-card rounded-xl p-5 border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Flux des événements en direct (Game.log)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Taille du log : {telemetry?.log_file_size ? `${(telemetry.log_file_size / 1024).toFixed(1)} KB` : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 font-mono text-xs h-72 overflow-y-auto space-y-1.5">
              {telemetry?.recent_events && telemetry.recent_events.length > 0 ? (
                telemetry.recent_events.map((evt, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-slate-300">
                    <span className="text-cyan-500/70 font-semibold select-none">[{evt.time}]</span>
                    <span className="text-amber-400 font-semibold select-none">&lt;{evt.category}&gt;</span>
                    <span className="text-slate-300 break-all">{evt.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic py-8 text-center">
                  En attente d'événements Star Citizen...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW & IMPORT EXTRACTED EXCEL / CSV ITEMS (NO LOCATION) */}
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
              <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
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
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmBatchImport}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-rajdhani font-bold text-sm shadow-lg shadow-emerald-950 flex items-center space-x-2"
              >
                <Check className="w-4 h-4 text-black" />
                <span>Importer les {extractedPreviewItems.length} Matériaux dans mes Stocks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adjust Order Price (Host Control) */}
      {editingPriceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-xl p-6 border-amber-500/50 shadow-2xl relative">
            <button
              onClick={() => setEditingPriceOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-950/80 rounded-lg border border-amber-500/40">
                <Tag className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">
                  Ajuster le Prix / Remise
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  Commande #{editingPriceOrder.id} • {editingPriceOrder.blueprintName}
                </span>
              </div>
            </div>

            <form onSubmit={handleSavePriceAdjustment} className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Prix standard de base :</span>
                <span className="font-bold text-white text-sm">
                  {(editingPriceOrder.baseFeeUEC || editingPriceOrder.totalFeeUEC).toLocaleString()} aUEC
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Type d'ajustement :</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('none')}
                    className={`py-2 px-1 rounded text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'none' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('percent')}
                    className={`py-2 px-1 rounded text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'percent' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    Remise %
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('free')}
                    className={`py-2 px-1 rounded text-center text-[11px] font-bold transition-all ${
                      adjDiscountType === 'free' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    100% Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjDiscountType('custom')}
                    className={`py-2 px-1 rounded text-center text-[11px] font-bold transition-all ${
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
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-amber-400 font-bold"
                    />
                    <div className="flex space-x-1">
                      {[10, 20, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setAdjDiscountValue(pct)}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 text-xs"
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
                  <label className="block text-slate-400 mb-1">Nouveau montant total en aUEC :</label>
                  <input
                    type="number"
                    min="0"
                    value={adjCustomPrice}
                    onChange={(e) => setAdjCustomPrice(parseInt(e.target.value) || 0)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-purple-300 font-bold text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Motif / Justification affichée au client :</label>
                <input
                  type="text"
                  placeholder="Ex: Tarif Membre Escouade, Geste commercial, Troc de minerais..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/40 flex justify-between items-center">
                <span className="text-slate-400">Nouveau Prix Facturé :</span>
                <span className="font-orbitron font-bold text-amber-400 text-base">
                  {adjDiscountType === 'free'
                    ? '0 aUEC (OFFERT)'
                    : adjDiscountType === 'custom'
                    ? `${adjCustomPrice.toLocaleString()} aUEC`
                    : adjDiscountType === 'percent'
                    ? `${Math.max(
                        0,
                        (editingPriceOrder.baseFeeUEC || editingPriceOrder.totalFeeUEC) -
                          Math.round(
                            ((editingPriceOrder.baseFeeUEC || editingPriceOrder.totalFeeUEC) *
                              adjDiscountValue) /
                              100
                          )
                      ).toLocaleString()} aUEC`
                    : `${(editingPriceOrder.baseFeeUEC || editingPriceOrder.totalFeeUEC).toLocaleString()} aUEC`}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold font-rajdhani text-sm shadow-lg shadow-amber-950"
              >
                Appliquer le Tarif Modifié
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Stock Manually (NO LOCATION) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="scifi-card max-w-lg w-full rounded-xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-orbitron font-bold text-base text-white mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Ajouter / Mettre à Jour une Ressource</span>
            </h3>

            <form onSubmit={handleSaveStock} className="space-y-4 font-mono text-xs">
              <AutocompleteSearch
                label="Nom du minerai / matériau (Base Star Citizen) :"
                value={editingItem.name}
                onChange={(val) => {
                  const deduced = deduceExtractionInfo(val, editingItem.extractionType);
                  setEditingItem({
                    ...editingItem,
                    name: val,
                    recommendedShip: deduced.recommendedShip,
                    extractionType: deduced.extractionType
                  });
                }}
                onSelect={(item) => {
                  const deduced = deduceExtractionInfo(item.name, editingItem.extractionType);
                  setEditingItem({
                    ...editingItem,
                    name: item.name,
                    unit: item.defaultUnit || 'SCU',
                    recommendedShip: deduced.recommendedShip,
                    extractionType: deduced.extractionType
                  });
                }}
                placeholder="Tapez 3 lettres (ex: Quan, Bex, RMC, Lara, Gold)..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Quantité en Stock :</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Unité :</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
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
                    value={editingItem.qualityTier || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, qualityTier: e.target.value })}
                    placeholder="Ex: 85%, Standard, Pur, Haute..."
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Type d'Extraction :</label>
                  <select
                    value={editingItem.extractionType || 'Minable Vaisseau'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const deduced = deduceExtractionInfo(editingItem.name, newType);
                      setEditingItem({
                        ...editingItem,
                        extractionType: newType,
                        recommendedShip: deduced.recommendedShip
                      });
                    }}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-bold"
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
                    <span>Lien Google Drive / Google Sheets :</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={editingItem.googleDriveUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, googleDriveUrl: e.target.value })}
                      placeholder="https://docs.google.com/spreadsheets/..."
                      className="w-full py-1.5 px-3 bg-slate-950 border border-slate-700 rounded text-sky-300 text-xs"
                    />
                    {editingItem.googleDriveUrl && (
                      <a
                        href={editingItem.googleDriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded bg-sky-950 border border-sky-500/40 text-sky-300 hover:bg-sky-900"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 flex items-center space-x-1">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fichier Personnel Joint (PDF, Excel, Image) :</span>
                  </label>
                  
                  {editingItem.attachedFileName ? (
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-emerald-500/30">
                      <div className="flex items-center space-x-2 truncate">
                        {editingItem.attachedFileType === 'excel' ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-slate-200 text-xs truncate">{editingItem.attachedFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, attachedFileName: undefined, attachedFileData: undefined, attachedFileType: 'none' })}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileUpload}
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyan-500 file:text-black file:font-bold hover:file:bg-cyan-400 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full scifi-button py-2.5 rounded-lg text-cyan-200 font-bold font-rajdhani text-sm mt-2"
              >
                Enregistrer la Ressource
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Blueprint with Autocomplete */}
      {isNewBlueprintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="scifi-card max-w-xl w-full rounded-xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewBlueprintOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">
              Créer un Nouveau Blueprint
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Recherchez un objet Star Citizen pour charger automatiquement la recette suggérée.
            </p>

            <form onSubmit={handleCreateBlueprint} className="space-y-4 font-mono text-xs">
              <AutocompleteSearch
                label="Nom de l'objet / arme / composant :"
                value={newBpName}
                onChange={(val) => setNewBpName(val)}
                onSelect={handleBlueprintPresetSelect}
                placeholder="Tapez 3 lettres (ex: Behring, CF-337, FR-86, Crossfield, P6-LR, Citadel)..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Catégorie :</label>
                  <select
                    value={newBpCategory}
                    onChange={(e) => setNewBpCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500"
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
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Frais de Fabrication (aUEC) :</label>
                <input
                  type="number"
                  value={newBpFee}
                  onChange={(e) => setNewBpFee(parseInt(e.target.value) || 10000)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description :</label>
                <textarea
                  rows={2}
                  value={newBpDescription}
                  onChange={(e) => setNewBpDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-300 font-bold uppercase text-[10px]">
                    Minerais / Matériaux nécessaires :
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
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
                          placeholder="Rechercher minerai (ex: Quantainium, Bexalite...)"
                        />
                      </div>
                      <input
                        type="number"
                        value={mat.quantity}
                        onChange={(e) => handleUpdateMaterialRow(i, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-16 py-2 px-2 bg-slate-900 border border-slate-700 rounded text-white text-center"
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
                className="w-full scifi-button py-3 rounded-lg text-cyan-200 font-bold font-rajdhani text-sm mt-4"
              >
                Enregistrer le Blueprint
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Reset of Inventory Stocks */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-2xl p-6 border-rose-500/50 shadow-2xl relative">
            <button
              onClick={() => setIsResetModalOpen(false)}
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
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReset('empty')}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-950"
              >
                Confirmer le Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
