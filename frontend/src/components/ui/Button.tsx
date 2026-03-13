import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
    'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500 shadow-sm',
    secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
    outline:
    'border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 focus:ring-slate-400 shadow-sm',
    ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-400'
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5'
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}>

      {icon && <span className="mr-2 -ml-1">{icon}</span>}
      {children}
    </button>);

}