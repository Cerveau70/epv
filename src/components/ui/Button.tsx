
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = "px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 active:scale-98 cursor-pointer flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-blue-deep text-white hover:bg-brand-blue-medium hover:shadow-premium hover:-translate-y-0.5 focus:ring-brand-blue-light/50",
    secondary: "bg-brand-pale text-brand-blue-deep border border-brand-border hover:bg-brand-border/10 hover:-translate-y-0.5 focus:ring-brand-blue-light/20",
    cta: "bg-brand-gold text-brand-blue-deep font-bold shadow-[0_4px_16px_rgba(245,166,35,0.30)] hover:bg-[#f0b030] hover:shadow-[0_8px_28px_rgba(245,166,35,0.45)] hover:-translate-y-0.5 active:translate-y-0 focus:ring-brand-gold/40 border border-brand-gold/70",
    ghost: "bg-transparent text-brand-blue-deep hover:bg-brand-pale focus:ring-brand-blue-light/20"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
