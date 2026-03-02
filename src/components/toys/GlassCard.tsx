/**
 * GlassCard — Small Tossable Glass Piece
 * 
 * A smaller glass element that can be stacked and arranged.
 * Purely tactile, no content.
 */
'use client';

interface GlassCardProps {
  /** Color glow */
  color?: 'lilac' | 'peach' | 'mint';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
  small: { width: 60, height: 40 },
  medium: { width: 80, height: 60 },
  large: { width: 100, height: 80 },
} as const;

const GLOW_MAP = {
  lilac: 'var(--glow-lilac)',
  peach: 'var(--glow-peach)',
  mint: 'var(--glow-mint)',
} as const;

export function GlassCard({
  color = 'lilac',
  size = 'medium',
}: GlassCardProps) {
  const dimensions = SIZE_MAP[size];
  const glow = GLOW_MAP[color];

  return (
    <div
      className="glass"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        boxShadow: `0 8px 32px var(--glass-shadow), 0 0 20px ${glow}`,
        cursor: 'grab',
      }}
    >
      {/* Decorative inner shape */}
      <div
        className="absolute inset-2 rounded-lg opacity-30"
        style={{
          background: `linear-gradient(135deg, ${glow}, transparent)`,
        }}
      />
    </div>
  );
}
