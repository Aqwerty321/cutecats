'use client';

import { Draggable } from '../Draggable';

interface FoodBowlProps {
  initialX?: number;
  initialY?: number;
  fillLevel?: number; // 0 to 1
}

export function FoodBowl({ initialX = 20, initialY = 80, fillLevel = 1 }: FoodBowlProps) {
  return (
    <Draggable initialX={initialX} initialY={initialY} id="food-bowl-1">
      <div 
        className="relative w-16 h-12 group cursor-grab active:cursor-grabbing"
        data-object-type="food"
        data-object-id="food-bowl-1"
      >
        {/* Bowl Shadow */}
        <div className="absolute bottom-0 left-1 w-14 h-3 bg-black/10 rounded-full blur-sm" />
        
        {/* Bowl Body */}
        <svg viewBox="0 0 64 48" className="w-full h-full drop-shadow-sm">
          {/* Back rim */}
          <ellipse cx="32" cy="16" rx="28" ry="8" fill="#E2E8F0" />
          
          {/* Food */}
          {fillLevel > 0 && (
            <ellipse 
              cx="32" 
              cy="18" 
              rx="24" 
              ry="6" 
              fill="#A0522D" 
              className="transition-all duration-500"
              style={{ transform: `scale(${0.5 + fillLevel * 0.5})`, transformOrigin: 'center' }}
            />
          )}
          
          {/* Front Body */}
          <path 
            d="M 4 16 Q 4 44 32 44 Q 60 44 60 16" 
            fill="#F8FAFC" 
            stroke="#CBD5E1" 
            strokeWidth="2"
          />
          
          {/* Front Rim Highlight */}
          <path 
            d="M 4 16 Q 32 24 60 16" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="2" 
            opacity="0.5"
          />
        </svg>
        
        {/* Label on hover */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-2 py-1 rounded text-xs font-medium pointer-events-none whitespace-nowrap">
          Kibble
        </div>
      </div>
    </Draggable>
  );
}
