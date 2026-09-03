import React, { useState, useMemo } from 'react';
import { RefinedStockItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import {
  BarChart3,
  TrendingUp,
  Award,
  Boxes,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface MineralsChartsViewProps {
  stock: RefinedStockItem[];
  onSelectMineral?: (mineralName: string) => void;
}

interface ResourceStat {
  mineralId: string;
  name: string;
  group: string;
  totalQuantity: number;
  lotCount: number;
  avgQuality: number;
  maxQuality: number;
  minQuality: number;
  unit: 'SCU' | 'unités';
  isGem: boolean;
}

export const MineralsChartsView: React.FC<MineralsChartsViewProps> = ({
  stock,
  onSelectMineral
}) => {
  const [chartSortBy, setChartSortBy] = useState<'qty_desc' | 'quality_desc' | 'name_asc'>('qty_desc');
  const [hoveredResource, setHoveredResource] = useState<ResourceStat | null>(null);

  // Helper to extract quality from an item
  const getItemQuality = (item: RefinedStockItem): number => {
    if (!item.notes) return 0;
    const match = item.notes.match(/Qualit[eé]:?\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Helper to check if item is a gem
  const isGemItem = (item: RefinedStockItem): boolean => {
    if (item.notes?.includes('Gemme') || item.notes?.includes('Gemmes') || item.notes?.includes('Minable Geo') || item.notes?.includes('Minage Géo') || item.notes?.includes('Minage Geo')) return true;
    const min = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
    return min?.group === 'Gem' || min?.isFpsMineable === true;
  };

  // Group and compute statistics for minerals vs gems
  const { mineralsStats, gemsStats } = useMemo(() => {
    const minMap = new Map<string, ResourceStat>();
    const gemMap = new Map<string, ResourceStat>();

    stock.forEach(item => {
      const isGem = isGemItem(item);
      const targetMap = isGem ? gemMap : minMap;
      const minInfo = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
      const qual = getItemQuality(item);

      if (!targetMap.has(item.mineralId)) {
        targetMap.set(item.mineralId, {
          mineralId: item.mineralId,
          name: item.mineralName,
          group: minInfo?.group || (isGem ? 'Gem' : 'Mineral'),
          totalQuantity: 0,
          lotCount: 0,
          avgQuality: 0,
          maxQuality: qual > 0 ? qual : 0,
          minQuality: qual > 0 ? qual : 9999,
          unit: isGem ? 'unités' : 'SCU',
          isGem
        });
      }

      const entry = targetMap.get(item.mineralId)!;
      entry.totalQuantity += item.quantitySCU;
      entry.lotCount += 1;

      if (qual > 0) {
        entry.avgQuality = Math.round((entry.avgQuality * (entry.lotCount - 1) + qual) / entry.lotCount);
        if (qual > entry.maxQuality) entry.maxQuality = qual;
        if (qual < entry.minQuality) entry.minQuality = qual;
      }
    });

    const sortFn = (a: ResourceStat, b: ResourceStat) => {
      if (chartSortBy === 'qty_desc') return b.totalQuantity - a.totalQuantity;
      if (chartSortBy === 'quality_desc') return (b.maxQuality || b.avgQuality) - (a.maxQuality || a.avgQuality);
      return a.name.localeCompare(b.name, 'fr');
    };

    const mineralsList = Array.from(minMap.values()).map(m => ({
      ...m,
      minQuality: m.minQuality === 9999 ? 0 : m.minQuality
    })).sort(sortFn);

    const gemsList = Array.from(gemMap.values()).map(g => ({
      ...g,
      minQuality: g.minQuality === 9999 ? 0 : g.minQuality
    })).sort(sortFn);

    return { mineralsStats: mineralsList, gemsStats: gemsList };
  }, [stock, chartSortBy]);

  // Overall KPIs
  const totalMineralsSCU = mineralsStats.reduce((acc, m) => acc + m.totalQuantity, 0);
  const totalGemsUnits = gemsStats.reduce((acc, g) => acc + g.totalQuantity, 0);

  const bestMineral = [...mineralsStats].sort((a, b) => b.maxQuality - a.maxQuality)[0];
  const bestGem = [...gemsStats].sort((a, b) => b.maxQuality - a.maxQuality)[0];

  // Helper renderer for dual-axis bar & line chart
  const renderDualChart = (
    title: string,
    subtitle: string,
    data: ResourceStat[],
    theme: 'cyan' | 'purple',
    unitLabel: string
  ) => {
    if (data.length === 0) {
      return (
        <div className="bg-sc-card/70 border border-sc-border rounded-xl p-8 text-center space-y-2">
          <Boxes className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300 font-sans uppercase">{title}</h4>
          <p className="text-xs text-slate-500 font-mono">Aucune donnee disponible pour ce graphique.</p>
        </div>
      );
    }

    const svgWidth = 900;
    const svgHeight = 360;
    const padding = { top: 40, right: 60, bottom: 85, left: 60 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const maxQualityValue = 1000;
    const maxQuantityValue = Math.max(...data.map(d => d.totalQuantity), 10);

    const barWidth = Math.max(16, Math.min(48, (chartWidth / data.length) * 0.58));
    const stepX = chartWidth / data.length;

    // Line points for quantity
    const quantityPoints = data.map((d, i) => {
      const x = padding.left + i * stepX + stepX / 2;
      const yRatio = d.totalQuantity / maxQuantityValue;
      const y = padding.top + chartHeight - yRatio * chartHeight;
      return { x, y, val: d.totalQuantity, name: d.name };
    });

    const linePathD = quantityPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const isPurple = theme === 'purple';
    const barGradientId = `barGrad_${theme}`;
    const barColor = isPurple ? '#a855f7' : '#06b6d4';
    const barHoverColor = isPurple ? '#c084fc' : '#22d3ee';
    const lineColor = isPurple ? '#ec4899' : '#f97316';

    return (
      <div className="bg-sc-card/90 border border-sc-border rounded-2xl p-5 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isPurple ? 'bg-purple-400 shadow-neon-purple' : 'bg-sc-cyan shadow-neon-cyan'}`} />
              <h3 className="text-base font-bold font-sans tracking-wide text-slate-100 uppercase">
                {title}
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {subtitle} • {data.length} matiere(s) en stock
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: barColor }} />
              <span className="text-slate-300 font-bold">Qualite Max (Barres)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5" style={{ backgroundColor: lineColor }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lineColor }} />
              <span className="text-slate-300 font-bold">Quantite {unitLabel} (Ligne)</span>
            </div>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[720px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none font-mono">
              <defs>
                <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPurple ? '#c084fc' : '#22d3ee'} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={isPurple ? '#6b21a8' : '#0e7490'} stopOpacity="0.4" />
                </linearGradient>
                <filter id={`glow_${theme}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines & Left Axis (Quality: 0 to 1000) */}
              {[0, 250, 500, 750, 1000].map(val => {
                const y = padding.top + chartHeight - (val / maxQualityValue) * chartHeight;
                return (
                  <g key={`grid_left_${val}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray={val === 0 ? 'none' : '3 3'}
                      strokeWidth={val === 0 ? '1.5' : '1'}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Right Axis Labels (Quantity: 0 to maxQuantity) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const val = Math.round(ratio * maxQuantityValue);
                const y = padding.top + chartHeight - ratio * chartHeight;
                return (
                  <text
                    key={`grid_right_${idx}`}
                    x={svgWidth - padding.right + 10}
                    y={y + 4}
                    textAnchor="start"
                    fill={lineColor}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {val.toLocaleString('fr-FR')} {idx === 4 ? unitLabel : ''}
                  </text>
                );
              })}

              {/* Bar Columns (Quality) */}
              {data.map((d, i) => {
                const centerBarX = padding.left + i * stepX + stepX / 2;
                const barX = centerBarX - barWidth / 2;
                const qValue = d.maxQuality || d.avgQuality || 0;
                const barH = (qValue / maxQualityValue) * chartHeight;
                const barY = padding.top + chartHeight - barH;
                const isHovered = hoveredResource?.mineralId === d.mineralId;

                return (
                  <g
                    key={`bar_${d.mineralId}`}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredResource(d)}
                    onMouseLeave={() => setHoveredResource(null)}
                    onClick={() => onSelectMineral && onSelectMineral(d.name)}
                  >
                    {/* Bar Background Click Area */}
                    <rect
                      x={padding.left + i * stepX}
                      y={padding.top}
                      width={stepX}
                      height={chartHeight}
                      fill="transparent"
                    />

                    {/* Quality Bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={Math.max(barH, 4)}
                      rx="4"
                      fill={isHovered ? barHoverColor : `url(#${barGradientId})`}
                      stroke={isHovered ? '#ffffff' : barColor}
                      strokeWidth={isHovered ? '1.5' : '1'}
                      filter={isHovered ? `url(#glow_${theme})` : undefined}
                    />

                    {/* Quality Number Label on top of Bar */}
                    {qValue > 0 && (
                      <text
                        x={centerBarX}
                        y={barY - 6}
                        textAnchor="middle"
                        fill={isHovered ? '#ffffff' : isPurple ? '#e9d5ff' : '#cffafe'}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {qValue}
                      </text>
                    )}

                    {/* X-Axis Resource Label */}
                    <text
                      x={centerBarX}
                      y={padding.top + chartHeight + 20}
                      textAnchor="end"
                      transform={`rotate(-40, ${centerBarX}, ${padding.top + chartHeight + 20})`}
                      fill={isHovered ? (isPurple ? '#c084fc' : '#22d3ee') : '#94a3b8'}
                      fontSize="10.5"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {d.name.length > 15 ? `${d.name.substring(0, 13)}...` : d.name}
                    </text>
                  </g>
                );
              })}

              {/* Quantity Line & Data Points (Red/Orange Trend Line) */}
              {quantityPoints.length > 1 && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none drop-shadow-md"
                />
              )}

              {/* Connected Dots & Value on Quantity Line */}
              {quantityPoints.map((pt, i) => {
                const resource = data[i];
                const isHovered = hoveredResource?.mineralId === resource.mineralId;

                return (
                  <g
                    key={`dot_${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredResource(resource)}
                    onMouseLeave={() => setHoveredResource(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#ffffff' : lineColor}
                      stroke="#090e18"
                      strokeWidth="2"
                    />

                    {/* Quantity Value Badge near dot */}
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      textAnchor="middle"
                      fill={lineColor}
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {pt.val < 10 ? pt.val.toFixed(1) : Math.round(pt.val)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Active Resource Hover Details Bar */}
        {hoveredResource && (
          <div className="p-3 rounded-xl bg-[#090e18] border border-sc-cyan/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sc-cyan shadow-neon-cyan" />
              <strong className="text-slate-100 text-sm font-sans">{hoveredResource.name}</strong>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {hoveredResource.group}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-500">Volume Total : </span>
                <strong className="text-sc-cyan">
                  {hoveredResource.totalQuantity.toLocaleString('fr-FR', { maximumFractionDigits: 3 })} {hoveredResource.unit}
                </strong>
                <span className="text-slate-500 text-[10px] ml-1">({hoveredResource.lotCount} lot{hoveredResource.lotCount > 1 ? 's' : ''})</span>
              </div>

              {hoveredResource.maxQuality > 0 && (
                <div>
                  <span className="text-slate-500">Qualite Max : </span>
                  <strong className="text-amber-300">Q: {hoveredResource.maxQuality}</strong>
                </div>
              )}

              {hoveredResource.avgQuality > 0 && (
                <div>
                  <span className="text-slate-500">Moyenne : </span>
                  <strong className="text-emerald-300">Q: {hoveredResource.avgQuality}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Sort Selector */}
      <div className="bg-sc-card/70 border border-sc-border rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sc-cyan" />
          <div>
            <h3 className="text-sm font-bold font-sans uppercase text-slate-100">
              Analyse Graphique des Gisements & Stocks
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Histogrammes de qualite maximale et courbes de volume par matiere premiere
            </p>
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-mono text-slate-400">Trier par :</span>
          <select
            value={chartSortBy}
            onChange={(e) => {
              audio.playClick();
              setChartSortBy(e.target.value as any);
            }}
            className="px-2.5 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="qty_desc">Quantite en stock (Plus grand ➔ Plus petit)</option>
            <option value="quality_desc">Qualite maximale (Plus haute ➔ Plus basse)</option>
            <option value="name_asc">Nom alphabetique (A ➔ Z)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Minerals SCU */}
        <div className="p-3.5 bg-sc-card/80 border border-sc-border rounded-xl flex items-center justify-between font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Minerais en Stock</span>
            <span className="text-xl font-bold text-sc-cyan">
              {totalMineralsSCU.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} SCU
            </span>
            <span className="text-[10px] text-slate-500 block">{mineralsStats.length} especes minerales</span>
          </div>
          <Boxes className="w-8 h-8 text-sc-cyan/40" />
        </div>

        {/* Best Mineral Quality */}
        <div className="p-3.5 bg-sc-card/80 border border-sc-border rounded-xl flex items-center justify-between font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Qualite Max Minerai</span>
            <span className="text-xl font-bold text-amber-300">
              {bestMineral && bestMineral.maxQuality > 0 ? `Q: ${bestMineral.maxQuality}` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
              {bestMineral ? bestMineral.name : 'Aucun'}
            </span>
          </div>
          <Award className="w-8 h-8 text-amber-400/40" />
        </div>

        {/* Total Gems Units */}
        <div className="p-3.5 bg-sc-card/80 border border-purple-900/40 rounded-xl flex items-center justify-between font-mono">
          <div>
            <span className="text-[10px] text-purple-300 block uppercase tracking-wider">Gemmes en Stock</span>
            <span className="text-xl font-bold text-purple-400">
              {totalGemsUnits.toLocaleString('fr-FR')} unites
            </span>
            <span className="text-[10px] text-purple-300/60 block">{gemsStats.length} varietes de gemmes</span>
          </div>
          <Sparkles className="w-8 h-8 text-purple-400/40" />
        </div>

        {/* Best Gem Quality */}
        <div className="p-3.5 bg-sc-card/80 border border-purple-900/40 rounded-xl flex items-center justify-between font-mono">
          <div>
            <span className="text-[10px] text-purple-300 block uppercase tracking-wider">Qualite Max Gemme</span>
            <span className="text-xl font-bold text-amber-300">
              {bestGem && bestGem.maxQuality > 0 ? `Q: ${bestGem.maxQuality}` : '—'}
            </span>
            <span className="text-[10px] text-purple-300/80 truncate block max-w-[140px]">
              {bestGem ? bestGem.name : 'Aucune'}
            </span>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-400/40" />
        </div>
      </div>

      {/* GRAPH 1: MINERAIS & METAUX */}
      {renderDualChart(
        'Graphique 1 • Minerais & Metaux (Minage Vaisseaux)',
        'Qualite maximale (barres bleues) et volume total (courbe orange en SCU)',
        mineralsStats,
        'cyan',
        'SCU'
      )}

      {/* GRAPH 2: GEMMES */}
      {renderDualChart(
        'Graphique 2 • Gemmes (Minage FPS & Recolte)',
        'Qualite maximale (barres violettes) et quantite totale (courbe rose en unites)',
        gemsStats,
        'purple',
        'unites'
      )}
    </div>
  );
};
