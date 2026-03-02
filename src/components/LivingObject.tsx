/**
 * Living Object — Physical Things in the World
 * 
 * Each object rendered based on physics state.
 */
'use client';

import { memo } from 'react';
import type { WorldObject } from '@/lib/world-objects';

interface LivingObjectProps {
  object: WorldObject;
  onInteract?: (id: string) => void;
}

export const LivingObject = memo(function LivingObject({ object, onInteract }: LivingObjectProps) {
  const { body, type, color, size, rotation, opacity, unwindAmount, glowIntensity } = object;
  
  const baseStyle = {
    position: 'absolute' as const,
    left: `${body.position.x}%`,
    top: `${body.position.y}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity,
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
  };
  
  switch (type) {
    case 'yarn':
      return (
        <div
          style={baseStyle}
          onClick={() => onInteract?.(body.id)}
          onMouseDown={() => onInteract?.(body.id)}
        >
          <svg width={size} height={size} viewBox="0 0 60 60">
            <defs>
              <radialGradient id={`yarn-${body.id}`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor={lightenColor(color, 30)} />
                <stop offset="50%" stopColor={color} />
                <stop offset="100%" stopColor={darkenColor(color, 20)} />
              </radialGradient>
            </defs>
            <circle cx="30" cy="30" r="26" fill={`url(#yarn-${body.id})`} />
            <g stroke={darkenColor(color, 30)} strokeWidth="2" fill="none" opacity="0.6">
              <path d="M 15 20 Q 30 15 45 25" />
              <path d="M 12 35 Q 25 45 48 30" />
              <path d="M 20 45 Q 35 50 42 40" />
            </g>
            <ellipse cx="20" cy="18" rx="8" ry="5" fill="white" opacity="0.4" />
            {/* Unwind trail */}
            {unwindAmount && unwindAmount > 0 && (
              <path
                d={`M 50 45 Q ${55 + unwindAmount * 15} ${50 + unwindAmount * 10} ${48 + unwindAmount * 20} ${60 + unwindAmount * 15}`}
                stroke={color}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity={unwindAmount}
              />
            )}
          </svg>
        </div>
      );
      
    case 'pebble':
      return (
        <div style={baseStyle} onClick={() => onInteract?.(body.id)}>
          <svg width={size} height={size} viewBox="0 0 24 24">
            <defs>
              <radialGradient id={`pebble-${body.id}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor={lightenColor(color, 40)} />
                <stop offset="100%" stopColor={color} />
              </radialGradient>
            </defs>
            <ellipse
              cx="12"
              cy="12"
              rx="10"
              ry="8"
              fill={`url(#pebble-${body.id})`}
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
            />
            <ellipse cx="8" cy="9" rx="3" ry="2" fill="white" opacity="0.5" />
          </svg>
        </div>
      );
      
    case 'cushion':
      return (
        <div style={baseStyle} onClick={() => onInteract?.(body.id)}>
          <svg width={size} height={size * 0.6} viewBox="0 0 80 48">
            <defs>
              <radialGradient id={`cushion-${body.id}`} cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor={lightenColor(color, 20)} />
                <stop offset="100%" stopColor={color} />
              </radialGradient>
            </defs>
            <ellipse
              cx="40"
              cy="30"
              rx="38"
              ry="16"
              fill={`url(#cushion-${body.id})`}
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
            />
            <ellipse cx="25" cy="25" rx="10" ry="5" fill="white" opacity="0.3" />
          </svg>
        </div>
      );
      
    case 'orb':
      return (
        <div 
          style={{
            ...baseStyle,
            filter: `blur(${1 - (glowIntensity || 0.5)}px) drop-shadow(0 0 ${10 * (glowIntensity || 0.5)}px ${color})`,
          }}
        >
          <svg width={size} height={size} viewBox="0 0 40 40">
            <defs>
              <radialGradient id={`orb-${body.id}`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                <stop offset="50%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="15" fill={`url(#orb-${body.id})`} />
            <circle cx="14" cy="14" r="4" fill="white" opacity="0.7" />
          </svg>
        </div>
      );
      
    case 'paper':
      return (
        <div style={baseStyle}>
          <svg width={size} height={size * 0.7} viewBox="0 0 40 28">
            <polygon
              points="2,2 38,4 36,26 4,24"
              fill={color}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <line x1="8" y1="10" x2="32" y2="11" stroke="#ddd" strokeWidth="1" opacity="0.5" />
            <line x1="8" y1="16" x2="28" y2="17" stroke="#ddd" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      );
      
    case 'bubble':
      return (
        <div 
          style={{
            ...baseStyle,
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          <svg width={size} height={size} viewBox="0 0 40 40">
            <defs>
              <radialGradient id={`bubble-${body.id}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="70%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </radialGradient>
            </defs>
            <circle
              cx="20"
              cy="20"
              r="16"
              fill={`url(#bubble-${body.id})`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            <ellipse cx="12" cy="13" rx="5" ry="3" fill="white" opacity="0.6" transform="rotate(-30 12 13)" />
          </svg>
        </div>
      );
      
    case 'mote':
      return (
        <div
          style={{
            ...baseStyle,
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          <svg width={size} height={size} viewBox="0 0 10 10">
            <circle
              cx="5"
              cy="5"
              r="4"
              fill={color}
              filter={`drop-shadow(0 0 3px ${color})`}
            />
          </svg>
        </div>
      );
      
    default:
      return null;
  }
});

function lightenColor(color: string, percent: number): string {
  if (color.startsWith('rgba')) return color;
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  if (color.startsWith('rgba')) return color;
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
