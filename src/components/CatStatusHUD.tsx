'use client';

import { memo } from 'react';

interface CatStatusHUDProps {
  name: string;
  variant: string;
  stats: {
    energy: number;
    hunger: number;
    fun: number;
    affection: number;
  };
  isVisible: boolean;
}

function getBarColor(value: number, type: 'energy' | 'hunger' | 'fun' | 'affection') {
  if (type === 'hunger') {
    return value < 30 ? '#20c997' : value < 70 ? '#f59f00' : '#e03131';
  }
  return value > 70 ? '#20c997' : value > 30 ? '#f59f00' : '#e03131';
}

export const CatStatusHUD = memo(function CatStatusHUD({ name, variant, stats, isVisible }: CatStatusHUDProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-testid="cat-status-hud"
      className="fixed bottom-5 right-5 z-50 pointer-events-none transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="arcade-panel arcade-panel-vivid w-64 rounded-2xl border p-4">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold uppercase"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.55))',
              color: 'var(--arcade-ink-strong)',
            }}
          >
            cat
          </div>
          <div>
            <h3 className="text-lg leading-none" style={{ color: 'var(--arcade-ink-strong)' }}>
              {name}
            </h3>
            <span className="arcade-label">{variant} variant</span>
          </div>
        </div>

        <div className="space-y-3">
          {([
            ['energy', stats.energy],
            ['hunger', stats.hunger],
            ['fun', stats.fun],
            ['affection', stats.affection],
          ] as const).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs font-semibold" style={{ color: 'var(--arcade-ink-muted)' }}>
                <span className="capitalize">{key}</span>
                <span>{Math.round(value)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(57,32,79,0.15)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${value}%`,
                    backgroundColor: key === 'affection' ? 'var(--arcade-accent-pink-500)' : getBarColor(value, key),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
