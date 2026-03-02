/**
 * Bubble — Floaty, Poppable Delight
 * 
 * Soft bubbles that float gently and pop with satisfaction.
 * Each pop spawns smaller bubbles.
 */
'use client';

import { useState, useCallback, useEffect } from 'react';

interface BubbleProps {
  /** Size in pixels */
  size?: number;
  /** Color tint */
  color?: 'lilac' | 'peach' | 'mint';
  /** Called when bubble is popped */
  onPop?: () => void;
  /** Initial position (percentage) */
  initialX?: number;
  initialY?: number;
  /** Float animation delay */
  delay?: number;
}

const BUBBLE_COLORS = {
  lilac: {
    fill: 'rgba(199, 125, 255, 0.25)',
    stroke: 'rgba(199, 125, 255, 0.6)',
    highlight: 'rgba(255, 255, 255, 0.8)',
    glow: 'rgba(199, 125, 255, 0.4)',
  },
  peach: {
    fill: 'rgba(255, 107, 157, 0.25)',
    stroke: 'rgba(255, 107, 157, 0.6)',
    highlight: 'rgba(255, 255, 255, 0.8)',
    glow: 'rgba(255, 107, 157, 0.4)',
  },
  mint: {
    fill: 'rgba(45, 212, 191, 0.25)',
    stroke: 'rgba(45, 212, 191, 0.6)',
    highlight: 'rgba(255, 255, 255, 0.8)',
    glow: 'rgba(45, 212, 191, 0.4)',
  },
} as const;

export function Bubble({
  size = 40,
  color = 'lilac',
  onPop,
  delay = 0,
}: BubbleProps) {
  const [isPopped, setIsPopped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colors = BUBBLE_COLORS[color];

  const handlePop = useCallback(() => {
    if (isPopped) return;
    setIsPopped(true);
    onPop?.();
  }, [isPopped, onPop]);

  if (isPopped) {
    return null;
  }

  return (
    <div
      className="cursor-pointer transition-transform duration-200"
      style={{
        width: size,
        height: size,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        animation: `float 6s var(--ease-viscous) infinite`,
        animationDelay: `${delay}s`,
      }}
      onClick={handlePop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
      >
        {/* Main bubble */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1"
        />
        
        {/* Primary highlight */}
        <ellipse
          cx="14"
          cy="14"
          rx="6"
          ry="4"
          fill={colors.highlight}
          transform="rotate(-30 14 14)"
        />
        
        {/* Secondary highlight */}
        <circle
          cx="26"
          cy="26"
          r="2"
          fill={colors.highlight}
          opacity="0.4"
        />
        
        {/* Rainbow refraction */}
        <ellipse
          cx="20"
          cy="28"
          rx="8"
          ry="3"
          fill="url(#rainbow)"
          opacity="0.2"
        />
        
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0C3FC" />
            <stop offset="50%" stopColor="#FBC2EB" />
            <stop offset="100%" stopColor="#84FAB0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * BubbleField — A cluster of bubbles that regenerate
 */
interface BubbleFieldProps {
  count?: number;
  onBubblesChange?: (bubbles: Array<{ id: string; x: number; y: number; type: string }>) => void;
}

export function BubbleField({ count = 8, onBubblesChange }: BubbleFieldProps) {
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: 'lilac' | 'peach' | 'mint';
    delay: number;
  }>>([]);

  // Initialize bubbles
  useEffect(() => {
    const colors: Array<'lilac' | 'peach' | 'mint'> = ['lilac', 'peach', 'mint'];
    const initialBubbles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 30 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3,
    }));
    setBubbles(initialBubbles);
  }, [count]);

  // Notify parent of bubble positions for cat interaction
  useEffect(() => {
    if (onBubblesChange) {
      onBubblesChange(bubbles.map(b => ({
        id: `bubble-${b.id}`,
        x: b.x,
        y: b.y,
        type: 'bubble',
      })));
    }
  }, [bubbles, onBubblesChange]);

  const handlePop = useCallback((id: number) => {
    // Remove popped bubble
    setBubbles(prev => prev.filter(b => b.id !== id));

    // Spawn new bubble after a delay
    setTimeout(() => {
      const colors: Array<'lilac' | 'peach' | 'mint'> = ['lilac', 'peach', 'mint'];
      setBubbles(prev => [...prev, {
        id: Date.now(),
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 30 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: 0,
      }]);
    }, 3000 + Math.random() * 5000);
  }, []);

  return (
    <>
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          data-object-id={`bubble-${bubble.id}`}
          className="absolute pointer-events-auto"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => handlePop(bubble.id)}
        >
          <Bubble
            size={bubble.size}
            color={bubble.color}
            delay={bubble.delay}
            onPop={() => handlePop(bubble.id)}
          />
        </div>
      ))}
    </>
  );
}
