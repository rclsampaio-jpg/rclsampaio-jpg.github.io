import { motion } from 'motion/react';

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'monochrome';
  size?: number;
  className?: string;
  lang?: 'pt' | 'en' | 'es';
}

export function RenaSerIcon({ size = 48, className = '', animate = true }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <img
        src="/assets/images/logo.png"
        alt="RenaSer Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function RenaSerLogo({
  variant = 'vertical',
  size = 64,
  className = '',
  lang = 'pt'
}: LogoProps) {
  const tagline = {
    pt: 'LEMBRE-SE DE QUEM VOCÊ É.',
    en: 'REMEMBER WHO YOU ARE.',
    es: 'RECUERDA QUIÉN ERES.'
  }[lang];

  if (variant === 'icon') {
    return <RenaSerIcon size={size} className={className} />;
  }

  if (variant === 'monochrome') {
    return (
      <div className={`flex items-center gap-3 font-display select-none ${className}`}>
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 100 100"
          fill="none"
          className="text-slate-900 dark:text-white shrink-0"
        >
          <path
            d="M 50,15 C 32,15 22,28 30,42 C 38,54 62,56 64,68 C 66,78 54,85 45,85 C 35,85 28,78 30,70"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 38,25 C 45,28 46,34 44,38 C 42,42 46,44 50,45 C 56,46 54,55 48,60"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="text-xl sm:text-2xl tracking-[0.25em] font-light text-slate-900 dark:text-white uppercase leading-none">
          Rena<span className="font-medium text-slate-950 dark:text-white">S</span>er
        </span>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        <RenaSerIcon size={size} />
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-display tracking-[0.22em] font-light uppercase leading-none text-slate-900 dark:text-[#FAF6F2]">
            Rena<span className="text-[#B76E79] font-medium">S</span>er
          </h1>
          <span className="text-[7.5px] sm:text-[8px] tracking-[0.3em] font-sans uppercase text-slate-400 dark:text-[#EBB4A0] mt-1 font-semibold">
            {tagline}
          </span>
        </div>
      </div>
    );
  }

  // Default: vertical / stacked
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <RenaSerIcon size={size * 1.2} />
      <h1 className="text-2xl sm:text-3.5xl md:text-4xl font-display tracking-[0.26em] font-light uppercase leading-none mt-4 text-slate-900 dark:text-[#FAF6F2]">
        Rena<span className="text-[#B76E79] font-normal">S</span>er
      </h1>
      <p className="text-[9px] sm:text-[10px] tracking-[0.38em] font-sans uppercase text-slate-400 dark:text-[#EBB4A0] mt-3 font-semibold">
        {tagline}
      </p>
    </div>
  );
}
