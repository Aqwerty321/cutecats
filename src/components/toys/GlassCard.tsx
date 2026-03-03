'use client';

interface GlassCardProps {
  color?: 'lilac' | 'peach' | 'mint';
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
  small: { width: 60, height: 40 },
  medium: { width: 80, height: 60 },
  large: { width: 100, height: 80 },
} as const;

const GLOW_MAP = {
  lilac: 'var(--arcade-glow-violet)',
  peach: 'var(--arcade-glow-pink)',
  mint: 'var(--arcade-glow-cyan)',
} as const;

export function GlassCard({ color = 'lilac', size = 'medium' }: GlassCardProps) {
  const dimensions = SIZE_MAP[size];
  const glow = GLOW_MAP[color];

  return (
    <div
      className="arcade-panel arcade-panel-soft"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        boxShadow: `var(--arcade-shadow-sm), 0 0 16px ${glow}`,
        cursor: 'grab',
      }}
    >
      <div
        className="absolute inset-2 rounded-lg opacity-35"
        style={{ background: `linear-gradient(130deg, ${glow}, transparent 68%)` }}
      />
    </div>
  );
}
