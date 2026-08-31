import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  accent?: 'cyan' | 'gold' | 'green' | 'red' | 'purple';
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  accent = 'cyan',
  trend,
  trendPositive = true,
  onClick
}) => {
  const accentClasses = {
    cyan: {
      border: 'hover:border-sc-cyan/60',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      glow: 'group-hover:shadow-neon-cyan',
      bar: 'bg-cyan-400'
    },
    gold: {
      border: 'hover:border-sc-gold/60',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'group-hover:shadow-neon-gold',
      bar: 'bg-amber-400'
    },
    green: {
      border: 'hover:border-sc-green/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'group-hover:shadow-neon-green',
      bar: 'bg-emerald-400'
    },
    red: {
      border: 'hover:border-sc-red/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'group-hover:shadow-neon-red',
      bar: 'bg-rose-400'
    },
    purple: {
      border: 'hover:border-sc-purple/60',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      glow: 'group-hover:shadow-purple-500/30',
      bar: 'bg-purple-400'
    }
  };

  const currentAccent = accentClasses[accent];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-sc-card/80 backdrop-blur-md border border-sc-border rounded-xl p-5 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:bg-sc-card' : ''
      } ${currentAccent.border} ${currentAccent.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono tracking-wider uppercase text-slate-400">{title}</p>
          <h4 className="text-2xl font-bold font-sans text-slate-100 mt-1.5 tracking-tight">{value}</h4>
          {subValue && <p className="text-xs font-mono text-slate-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${currentAccent.iconBg} transition-transform group-hover:scale-110 duration-200`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-mono">
          <span className={trendPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {trendPositive ? '▲' : '▼'} {trend}
          </span>
        </div>
      )}

      {/* Futuristic corner accent */}
      <div className={`absolute top-0 right-0 w-2 h-2 rounded-tr-xl ${currentAccent.bar} opacity-40 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};
