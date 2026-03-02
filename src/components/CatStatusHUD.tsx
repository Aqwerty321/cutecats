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

export const CatStatusHUD = memo(function CatStatusHUD({ 
  name, 
  variant, 
  stats, 
  isVisible 
}: CatStatusHUDProps) {
  if (!isVisible) return null;

  const getBarColor = (value: number, type: 'energy' | 'hunger' | 'fun' | 'affection') => {
    if (type === 'hunger') {
      // Hunger: Low is good (green), High is bad (red)
      return value < 30 ? '#4ADE80' : value < 70 ? '#FACC15' : '#EF4444';
    }
    // Others: High is good (green), Low is bad (red)
    return value > 70 ? '#4ADE80' : value > 30 ? '#FACC15' : '#EF4444';
  };

  return (
    <div 
      className="fixed z-50 pointer-events-none transition-opacity duration-300"
      style={{ 
        opacity: isVisible ? 1 : 0,
        bottom: '20px',
        right: '20px',
      }}
    >
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 w-64 transform transition-transform duration-300 translate-y-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl shadow-inner">
            🐱
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-none">{name}</h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{variant} Cat</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Energy */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Energy</span>
              <span>{Math.round(stats.energy)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${stats.energy}%`,
                  backgroundColor: getBarColor(stats.energy, 'energy')
                }}
              />
            </div>
          </div>

          {/* Hunger */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Hunger</span>
              <span>{Math.round(stats.hunger)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${stats.hunger}%`,
                  backgroundColor: getBarColor(stats.hunger, 'hunger')
                }}
              />
            </div>
          </div>

          {/* Fun */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Fun</span>
              <span>{Math.round(stats.fun)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${stats.fun}%`,
                  backgroundColor: getBarColor(stats.fun, 'fun')
                }}
              />
            </div>
          </div>

          {/* Affection */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Affection</span>
              <span>{Math.round(stats.affection)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-pink-300 to-rose-400"
                style={{ width: `${stats.affection}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
