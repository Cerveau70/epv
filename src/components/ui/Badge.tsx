
import React from 'react';
import { StatutProspect } from '../../types.js';

interface BadgeProps {
  status: StatutProspect | string;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', id }) => {
  const getStyles = () => {
    switch (status) {
      case StatutProspect.PROSPECT:
        return 'bg-brand-blue-light/10 text-brand-blue-medium border border-brand-blue-light/30';
      case StatutProspect.PRE_INSCRIT:
        return 'bg-brand-gold/10 text-brand-blue-deep border border-brand-gold/30';
      case StatutProspect.INSCRIT:
        return 'bg-brand-green/10 text-brand-green border border-brand-green/20';
      case StatutProspect.ARCHIVE:
        return 'bg-brand-muted/10 text-brand-muted border border-brand-border';
      default:
        return 'bg-brand-pale text-brand-dark border border-brand-border';
    }
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 animate-pulse" />
      {status}
    </span>
  );
};
