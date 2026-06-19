
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, id }) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl border border-brand-border/60 shadow-premium hover:shadow-premium-lg transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-99' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
