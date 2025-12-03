'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/src/shared/lib/utils';
import { Check } from 'lucide-react';

interface Locale {
  code: string;
  label: string;
}

interface LanguageSelectorProps {
  currentLocale: string;
  availableLocales: Locale[];
  onLocaleChange: (locale: string) => void;
  label: string;
}

export function LanguageSelector({
  currentLocale,
  availableLocales,
  onLocaleChange,
  label,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: string) => {
    onLocaleChange(locale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-desktop-body-sm font-medium text-text-primary transition-colors hover:bg-background-2"
        aria-label={label}
      >
        <Image
          src="/images/icons/Property 1=Language.svg"
          alt="Language"
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <span className="uppercase">{currentLocale}</span>
        <Image
          src="/images/icons/Property 1=Arrow-down.svg"
          alt="Language"
          width={20}
          height={20}
          className="h-5 w-5"
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {availableLocales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => handleLocaleChange(loc.code)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left text-desktop-body-sm transition-colors hover:bg-accent-1/5',
                  currentLocale === loc.code
                    ? 'bg-accent-1/10 text-accent-1'
                    : 'text-text-primary'
                )}
              >
                <span>{loc.label}</span>
                {currentLocale === loc.code && (
                  <Check className="h-4 w-4 text-accent-1" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
