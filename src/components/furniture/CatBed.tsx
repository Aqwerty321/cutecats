'use client';

import { Draggable } from '../Draggable';

interface CatBedProps {
  initialX?: number;
  initialY?: number;
  color?: string;
}

export function CatBed({ initialX = 80, initialY = 80, color = '#FFD1DC' }: CatBedProps) {
  return (
    <Draggable initialX={initialX} initialY={initialY} id="cat-bed-1">
      <div 
        className="relative w-24 h-20 group cursor-grab active:cursor-grabbing"
        data-object-type="bed"
        data-object-id="cat-bed-1"
      >
        {/* Shadow */}
        <div className="absolute bottom-0 left-2 w-20 h-4 bg-black/10 rounded-full blur-md" />
        
        <svg viewBox="0 0 96 80" className="w-full h-full drop-shadow-sm">
          {/* Back Cushion */}
          <path 
            d="M 10 40 Q 10 10 48 10 Q 86 10 86 40 L 86 60 Q 86 70 48 70 Q 10 70 10 60 Z" 
            fill={color} 
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="1"
          />
          
          {/* Inner Cushion */}
          <ellipse cx="48" cy="45" rx="30" ry="15" fill="#FFF0F5" />
          
          {/* Front Rim */}
          <path 
            d="M 10 40 Q 10 75 48 75 Q 86 75 86 40 Q 86 55 48 55 Q 10 55 10 40" 
            fill={color}
            filter="brightness(0.9)"
          />
          
          {/* Stitching details */}
          <path 
            d="M 20 45 Q 48 60 76 45" 
            fill="none" 
            stroke="rgba(0,0,0,0.1)" 
            strokeWidth="1" 
            strokeDasharray="2 2"
          />
        </svg>

        {/* Label */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-2 py-1 rounded text-xs font-medium pointer-events-none whitespace-nowrap">
          Cozy Bed
        </div>
      </div>
    </Draggable>
  );
}
