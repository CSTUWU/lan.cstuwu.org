'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'orange' | 'olive' | 'sand' | 'outline' | 'ghost' | 'danger';
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
    cyan: 'bg-olive text-black hover:bg-olive-light border border-olive-light/50 font-bold shadow-[0_2px_12px_rgba(255,208,0,0.35)] active:translate-y-0.5',
    olive: 'bg-olive text-black hover:bg-olive-light border border-olive-light/50 font-bold shadow-[0_2px_12px_rgba(255,208,0,0.35)] active:translate-y-0.5',
    orange: 'bg-sand text-military-black hover:bg-sand-light border border-sand-light/60 font-bold shadow-[0_2px_12px_rgba(194,178,138,0.25)] active:translate-y-0.5',
    sand: 'bg-sand text-military-black hover:bg-sand-light border border-sand-light/60 font-bold shadow-[0_2px_12px_rgba(194,178,138,0.25)] active:translate-y-0.5',
    outline: 'border border-gunmetal text-sand hover:bg-olive/20 hover:border-olive-light/60 hover:text-tacticalWhite shadow-sm',
    ghost: 'border border-gunmetal/60 text-mutedText hover:text-tacticalWhite hover:border-gunmetal hover:bg-darkGreen/40',
    danger: 'bg-red-900/90 text-tacticalWhite border border-red-700/60 hover:bg-red-800 shadow-[0_2px_10px_rgba(153,27,27,0.4)]',
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

