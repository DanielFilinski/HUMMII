'use client';

import { useState } from 'react';
import { PrimaryButton } from '@/src/shared/ui/button/PrimaryButton';
import { Typography } from '@/src/shared/ui/typography/Typography';

export default function TestButtonPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Typography variant="h1" className="mb-8">
          PrimaryButton - Тест всех состояний
        </Typography>

        {/* Default State */}
        <div className="space-y-3 p-6 bg-background-card rounded-lg border border-border-primary">
          <Typography variant="h3" color="accent">
            1. Default State
          </Typography>
          <Typography variant="bodySm" color="secondary">
            Фон: bg-accent-primary (#3A971E) | Текст: color=&apos;inverse&apos; (#FFFFFF)
          </Typography>
          <PrimaryButton>Default Button</PrimaryButton>
        </div>

        {/* Hover State */}
        <div className="space-y-3 p-6 bg-background-card rounded-lg border border-border-primary">
          <Typography variant="h3" color="accent">
            2. Hover State
          </Typography>
          <Typography variant="bodySm" color="secondary">
            Фон: bg-accent-secondary (#67AD51) | Текст: color=&apos;inverse&apos; (#FFFFFF)
          </Typography>
          <Typography variant="note" color="tertiary">
            Наведите мышь на кнопку ↓
          </Typography>
          <PrimaryButton>Hover me</PrimaryButton>
        </div>

        {/* Pressed State */}
        <div className="space-y-3 p-6 bg-background-card rounded-lg border border-border-primary">
          <Typography variant="h3" color="accent">
            3. Pressed State (Active)
          </Typography>
          <Typography variant="bodySm" color="secondary">
            Фон: bg-background-secondary (#E1F7DB) | Текст: text-primary (#2A2A0F)
          </Typography>
          <Typography variant="note" color="tertiary">
            Кликните и удерживайте кнопку ↓
          </Typography>
          <PrimaryButton>Press and hold</PrimaryButton>
        </div>

        {/* Loading State */}
        <div className="space-y-3 p-6 bg-background-card rounded-lg border border-border-primary">
          <Typography variant="h3" color="accent">
            4. Loading State
          </Typography>
          <Typography variant="bodySm" color="secondary">
            Фон: bg-background-secondary (#E1F7DB) | Текст: color=&apos;primary&apos; (#2A2A0F)
          </Typography>
          <div className="flex gap-4 items-center">
            <PrimaryButton isLoading={isLoading} onClick={handleLoadingTest}>
              {isLoading ? 'Loading...' : 'Test Loading'}
            </PrimaryButton>
            <Typography variant="note" color="tertiary">
              {isLoading ? '⏳ Loading active' : 'Click to test loading'}
            </Typography>
          </div>
        </div>

        {/* Disabled State */}
        <div className="space-y-3 p-6 bg-background-card rounded-lg border border-border-primary">
          <Typography variant="h3" color="accent">
            5. Disabled State
          </Typography>
          <Typography variant="bodySm" color="secondary">
            Фон: bg-accent-disabled (#DBDBDB) | Текст: color=&apos;inverse&apos; (#FFFFFF)
          </Typography>
          <PrimaryButton disabled>Disabled Button</PrimaryButton>
        </div>

        {/* All States Together */}
        <div className="space-y-3 p-6 bg-background-tertiary rounded-lg border-2 border-accent-primary">
          <Typography variant="h2" color="accent">
            Все состояния вместе
          </Typography>
          <div className="flex flex-wrap gap-4">
            <PrimaryButton>Default</PrimaryButton>
            <PrimaryButton isLoading>Loading</PrimaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
          </div>
        </div>

        {/* Color Reference */}
        <div className="space-y-3 p-6 bg-background-card rounded-lg border border-border-primary">
          <Typography variant="h3" color="accent">
            Справочник цветов
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="bodySm" weight="semibold">
                Фоны:
              </Typography>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-accent-primary rounded border"></div>
                  <Typography variant="note" color="secondary">
                    accent-primary #3A971E
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-accent-secondary rounded border"></div>
                  <Typography variant="note" color="secondary">
                    accent-secondary #67AD51
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-background-secondary rounded border"></div>
                  <Typography variant="note" color="secondary">
                    background-secondary #E1F7DB
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-accent-disabled rounded border"></div>
                  <Typography variant="note" color="secondary">
                    accent-disabled #DBDBDB
                  </Typography>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="bodySm" weight="semibold">
                Текст:
              </Typography>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-accent-primary rounded border flex items-center justify-center">
                    <Typography variant="h3" color="inverse">A</Typography>
                  </div>
                  <Typography variant="note" color="secondary">
                    text-inverse #FFFFFF
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-background-secondary rounded border flex items-center justify-center">
                    <Typography variant="h3" color="primary">A</Typography>
                  </div>
                  <Typography variant="note" color="secondary">
                    text-primary #2A2A0F
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
