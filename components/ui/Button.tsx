'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'orange' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = 'cyan',
  size = 'md',
  href,
  icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-300 select-none group focus:outline-none';

  const sizeClasses = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2.5',
    lg: 'text-base px-8 py-4 gap-3',
  }[size];

  const variantClasses = {
    cyan: 'bg-cyan text-background hover:bg-white hover:text-background shadow-[0_0_20px_rgba(0,213,255,0.4)] hover:shadow-[0_0_30px_rgba(0,213,255,0.7)]',
    orange: 'bg-orange text-background hover:bg-white hover:text-background shadow-[0_0_20px_rgba(255,116,56,0.4)] hover:shadow-[0_0_30px_rgba(255,116,56,0.7)]',
    outline: 'border border-cyan/50 text-cyan hover:bg-cyan/10 hover:border-cyan hover:shadow-[0_0_15px_rgba(0,213,255,0.25)]',
    ghost: 'border border-tactical-border text-secondaryText hover:text-white hover:border-tactical-borderLight hover:bg-surface/50',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  }[variant];

  const content = (
    <>
      {/* Corner cut accents */}
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-60" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-60" />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && iconPosition === 'left' && <span className="transition-transform group-hover:-translate-x-0.5">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} clip-tactical ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} clip-tactical ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}

