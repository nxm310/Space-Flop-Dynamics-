import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Blueprint, DiscountType, MineralQualityTier, MINERAL_QUALITY_OPTIONS } from '../types';
import { 
  ScrollText, 
  Search, 
  Clock, 
  Coins, 
  Send, 
  X,
  Crosshair,
  Target,
  ShieldAlert,
  Zap,
  Wrench,
  Sparkles,
  Percent,
  Gift,
  CheckCircle,
  Tag,
  Gem,
  Award
} from 'lucide-react';

export const BlueprintCatalog: React.FC = () => {
  const { blueprints, inventory, createOrder } = useApp();
  const { currentUser, isHost } = useAuth();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);

  // Modal Order state
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [userProvidesMaterials, setUserProvidesMaterials] = useState<boolean>(false);
  const [mineralQuality, setMineralQuality] = useState<MineralQualityTier>('standard');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('HUR-L1 Green Glade Station');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(20);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const categories = ['all', ...Array.from(new Set(blueprints.map(b => b.category)))];

  const filteredBlueprints = blueprints.filter(bp => {
    const matchesSearch = bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || bp.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getHostMaterialStock = (matName: string): number => {
    const found = inventory.find(i => i.name.toLowerCase() === matName.toLowerCase());
    return found ? found.quantity : 0;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'armement vaisseau': return <Crosshair className="w-5 h-5 text-cyan-400" />;
      case 'composant vaisseau': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'arme fps': return <Target className="w-5 h-5 text-rose-400" />;
      case 'armure fps': return <ShieldAlert className="w-5 h-5 text-purple-400" />;
      case 'utilitaire':
      case 'utilitaire & équipement': return <Wrench className="w-5 h-5 text-emerald-400" />;
      default: return <ScrollText className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleOpenOrderModal = (bp: Blueprint) => {
    setSelectedBlueprint(bp);
    setOrderQuantity(1);
    setUserProvidesMaterials(false);
    setMineralQuality('standard');
    setDiscountType('none');
    setDiscountReason('');
    setOrderNotes('');
    setOrderSuccess(false);
  };

  // Calculation of base and final price with mineral quality multiplier
  const calculatePricing = () => {
    if (!selectedBlueprint) return { baseTotal: 0, finalTotal: 0, discountPercent: 0, qualityMult: 1.0, qualityUnitFee: 0 };

    const selectedQualityObj = MINERAL_QUALITY_OPTIONS.find(q => q.tier === mineralQuality) || MINERAL_QUALITY_OPTIONS[0];
    const qualityMult = selectedQualityObj.multiplier;

    const standardUnitFee = selectedBlueprint.feeUEC;
    // Apply quality multiplier to standard craft fee
    const qualityAdjustedUnit = Math.round(standardUnitFee * qualityMult);

    // Apply material supply rebate (-60% if client brings materials)
    const baseEffectiveUnit = userProvidesMaterials ? Math.round(qualityAdjustedUnit * 0.4) : qualityAdjustedUnit;
    const baseTotal = baseEffectiveUnit * orderQuantity;

    let finalTotal = baseTotal;
    let effectivePercent = 0;

    if (discountType === 'free') {
      finalTotal = 0;
      effectivePercent = 100;
    } else if (discountType === 'percent') {
      effectivePercent = Math.min(100, Math.max(0, customDiscountPercent));
      const discountAmt = Math.round((baseTotal * effectivePercent) / 100);
      finalTotal = Math.max(0, baseTotal - discountAmt);
    }

    return { baseTotal, finalTotal, discountPercent: effectivePercent, qualityMult, qualityUnitFee: qualityAdjustedUnit };
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlueprint || !currentUser) return;

    const { baseTotal, finalTotal, discountPercent, qualityMult } = calculatePricing();

    const success = await createOrder({
      blueprintId: selectedBlueprint.id,
      blueprintName: selectedBlueprint.name,
      clientId: currentUser.uid,
      clientName: currentUser.displayName,
      clientEmail: currentUser.email,
      quantity: orderQuantity,
      userProvidesMaterials,
      mineralQuality,
      qualityMultiplier: qualityMult,
      baseFeeUEC: baseTotal,
      discountType,
      discountValue: discountType === 'percent' ? discountPercent : discountType === 'free' ? 100 : 0,
      discountReason: discountReason || (discountType === 'free' ? 'Offert par la guilde' : discountType === 'percent' ? `Remise ${discountPercent}%` : ''),
      totalFeeUEC: finalTotal,
      deliveryLocation,
      notes: orderNotes
    });

    if (success) {
      setOrderSuccess(true);
      setTimeout(() => {
        setSelectedBlueprint(null);
        setOrderSuccess(false);
      }, 1500);
    }
  };

  const { baseTotal, finalTotal, discountPercent, qualityMult, qualityUnitFee } = calculatePricing();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="scifi-card rounded-xl p-6 relative overflow-hidden border-cyan-500/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Répertoire Officiel de Fabrication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
              Catalogue des Plans de l'Hôte
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 font-rajdhani text-base">
              Explorez l'ensemble des technologies, armes, armures et composants que l'artisan peut manufacturer pour vous.
              Passez commande directement avec vos ressources ou celles de l'atelier.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs font-mono">
            <div className="text-center px-2">
              <span className="text-slate-400 block text-[10px]">PLANS CONNUS</span>
              <span className="text-cyan-300 font-bold text-lg">{blueprints.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-slate-400 block text-[10px]">MINERAIS EN STOCK</span>
              <span className="text-amber-400 font-bold text-lg">
                {inventory.filter(i => i.quantity > 0).length} types
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un plan, composant, arme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat === 'all' ? 'Toutes Catégories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBlueprints.map((bp) => {
          return (
            <div
              key={bp.id}
              className="scifi-card rounded-xl p-5 flex flex-col justify-between relative group hover:border-cyan-400/60 transition-all"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80">
                    {getCategoryIcon(bp.category)}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/30">
                    {bp.category}
                  </span>
                </div>

                <h3 className="font-orbitron font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                  {bp.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {bp.description}
                </p>

                {/* Craft specs */}
                <div className="grid grid-cols-2 gap-2 my-4 py-2.5 px-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{bp.craftTimeMinutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-400 justify-end">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="font-bold">{bp.feeUEC.toLocaleString()} aUEC</span>
                  </div>
                </div>

                {/* Required Minerals Breakdown */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Matériaux Requis (par unité) :
                  </span>
                  {bp.requiredMaterials.map((mat, idx) => {
                    const hostStock = getHostMaterialStock(mat.name);
                    const hasEnough = hostStock >= mat.quantity;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/60"
                      >
                        <span className="text-slate-200 font-medium">{mat.name}</span>
                        <div className="flex items-center space-x-2 font-mono text-[11px]">
                          <span className="text-slate-400">{mat.quantity} {mat.unit}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] ${
                              hasEnough ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}
                            title={`Stock hôte : ${hostStock} ${mat.unit}`}
                          >
                            {hasEnough ? `Stock : ${hostStock}` : `Manque : ${mat.quantity - hostStock}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenOrderModal(bp)}
                  className="w-full scifi-button py-2.5 px-4 rounded-lg text-xs font-rajdhani font-bold text-cyan-200 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Commander la Fabrication</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Modal with Pricing Adjustments */}
      {selectedBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="scifi-card max-w-lg w-full rounded-xl p-6 border-cyan-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBlueprint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-cyan-950/80 rounded-lg border border-cyan-500/40">
                {getCategoryIcon(selectedBlueprint.category)}
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Commander : {selectedBlueprint.name}
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  Tarif de base unitaire : {selectedBlueprint.feeUEC.toLocaleString()} aUEC
                </span>
              </div>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-orbitron font-bold text-lg text-emerald-300">
                  Commande transmise à l'Hôte !
                </h4>
                <p className="text-xs text-slate-300">
                  Vous pouvez suivre son avancement en direct dans l'onglet « Mes Commandes ».
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Quantité souhaitée :
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-lg hover:border-cyan-500"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-lg hover:border-cyan-500"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Mineral Quality Selector */}
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
                      <Gem className="w-4 h-4 text-cyan-400" />
                      <span>Qualité & Pureté des Minerais / Matériaux :</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      Impact Prix : x{qualityMult}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {MINERAL_QUALITY_OPTIONS.map((opt) => {
                      const isSelected = mineralQuality === opt.tier;

                      return (
                        <div
                          key={opt.tier}
                          onClick={() => setMineralQuality(opt.tier)}
                          className={`p-2.5 rounded-lg cursor-pointer transition-all border flex flex-col justify-between ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950'
                              : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                                {opt.label}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                opt.multiplier === 1.0 ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                opt.multiplier === 1.25 ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' :
                                'bg-purple-950 text-purple-300 border-purple-500/40'
                              }`}>
                                x{opt.multiplier}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {opt.description}
                            </p>
                          </div>

                          <span className="text-[9px] text-slate-500 mt-2 block font-sans">
                            {opt.purityRange}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Material supply option */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userProvidesMaterials}
                      onChange={(e) => setUserProvidesMaterials(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        J'apporte les minerais / matériaux moi-même
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Réduit les frais de base de 60% (remise sur fourniture de matières premières).
                      </span>
                    </div>
                  </label>
                </div>

                {/* Pricing / Discount options */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-cyan-500/30 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                    <Tag className="w-4 h-4" />
                    <span>Option de Tarification / Remise Spéciale :</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setDiscountType('none'); }}
                      className={`p-2 rounded text-center transition-all ${
                        discountType === 'none'
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      Prix Standard
                    </button>

                    <button
                      type="button"
                      onClick={() => { setDiscountType('percent'); setCustomDiscountPercent(20); }}
                      className={`p-2 rounded text-center transition-all ${
                        discountType === 'percent'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      Remise (%)
                    </button>

                    <button
                      type="button"
                      onClick={() => { setDiscountType('free'); }}
                      className={`p-2 rounded text-center transition-all ${
                        discountType === 'free'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      100% Gratuit
                    </button>
                  </div>

                  {discountType === 'percent' && (
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-slate-400">Pourcentage :</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customDiscountPercent}
                        onChange={(e) => setCustomDiscountPercent(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="w-20 py-1 px-2 bg-slate-950 border border-slate-700 rounded text-amber-400 font-bold text-center"
                      />
                      <span className="text-amber-400 font-bold">%</span>
                      <span className="text-[10px] text-slate-400">(ex: Membre Guilde)</span>
                    </div>
                  )}

                  {discountType !== 'none' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Motif de la remise (ex: Remise Membre Org, Allié, Troc...)"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Delivery Location */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Lieu de livraison souhaité :
                  </label>
                  <select
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-cyan-500"
                  >
                    <option value="HUR-L1 Green Glade Station">HUR-L1 Green Glade Station</option>
                    <option value="Everus Harbor (Hurston Orbit)">Everus Harbor (Hurston Orbit)</option>
                    <option value="Port Tressler (MicroTech)">Port Tressler (MicroTech)</option>
                    <option value="Baijini Point (ArcCorp)">Baijini Point (ArcCorp)</option>
                    <option value="Seraphim Station (Crusader)">Seraphim Station (Crusader)</option>
                    <option value="Grim HEX (Yela)">Grim HEX (Yela)</option>
                    <option value="Pyro Jump Point">Pyro Jump Point Station</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Instructions particulières :
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dispo ce soir à partir de 21h sur Discord"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500"
                  />
                </div>

                {/* Total Fee Preview with Default Price, Quality & Discounts */}
                <div className="p-3 bg-slate-950 rounded-lg border border-cyan-500/30 font-mono space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Prix unitaire (Qualité : {MINERAL_QUALITY_OPTIONS.find(q => q.tier === mineralQuality)?.label}) :</span>
                    <span className="text-slate-200">
                      {qualityUnitFee.toLocaleString()} aUEC
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Sous-total base ({orderQuantity} unité{orderQuantity > 1 ? 's' : ''}) :</span>
                    <span className={finalTotal < baseTotal ? 'line-through text-slate-500 font-semibold' : 'text-slate-200 font-bold'}>
                      {baseTotal.toLocaleString()} aUEC
                    </span>
                  </div>

                  {finalTotal < baseTotal && (
                    <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                      <span>Remise appliquée ({discountType === 'free' ? 'Gratuit / 100%' : `-${discountPercent}%`}) :</span>
                      <span>-{(baseTotal - finalTotal).toLocaleString()} aUEC</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
                    <span className="text-slate-300 font-bold">Total Net à Régler :</span>
                    <span className="font-orbitron font-bold text-amber-400 text-base flex items-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>{finalTotal === 0 ? '0 aUEC (OFFERT)' : `${finalTotal.toLocaleString()} aUEC`}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full scifi-button py-3 rounded-lg text-sm font-rajdhani font-bold text-cyan-200 shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Confirmer la Commande</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
