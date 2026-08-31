import React from 'react';
import { OrderStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'gold' | 'green' | 'red' | 'purple' | 'slate' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    orange: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700/60'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tracking-wider uppercase transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'draft':
      return <Badge variant="slate">Brouillon</Badge>;
    case 'pending_resources':
      return <Badge variant="orange">Ressources Manquantes</Badge>;
    case 'refining':
      return <Badge variant="gold">En Raffinage</Badge>;
    case 'in_production':
      return <Badge variant="cyan">En Fabrication</Badge>;
    case 'ready':
      return <Badge variant="purple">Prêt à Livrer</Badge>;
    case 'completed':
      return <Badge variant="green">Livré & Terminé</Badge>;
    case 'cancelled':
      return <Badge variant="red">Annulé</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};
