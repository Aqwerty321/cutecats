/**
 * LivingBackground — The Breathing Atmosphere
 * 
 * Creates an immersive, slowly-evolving mesh gradient backdrop.
 * Motion is subliminal, like watching clouds drift or lava lamp blobs.
 * 
 * Server Component — No client JS needed, pure CSS animation
 */

export function LivingBackground() {
  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base gradient layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            135deg,
            var(--color-lilac-start) 0%,
            var(--color-peach-start) 35%,
            var(--color-mint-end) 70%,
            var(--color-lilac-end) 100%
          )`
        }}
      />
      
      {/* Floating blob 1 — Lilac */}
      <div 
        className="absolute animate-drift delay-1"
        style={{
          width: '60vmax',
          height: '60vmax',
          left: '-10%',
          top: '-20%',
          background: `radial-gradient(
            ellipse at center,
            var(--color-lilac-start) 0%,
            transparent 70%
          )`,
          opacity: 0.7,
          filter: 'blur(60px)',
          animationDuration: '25s',
        }}
      />
      
      {/* Floating blob 2 — Peach */}
      <div 
        className="absolute animate-drift delay-2"
        style={{
          width: '50vmax',
          height: '50vmax',
          right: '-15%',
          top: '10%',
          background: `radial-gradient(
            ellipse at center,
            var(--color-peach-start) 0%,
            transparent 70%
          )`,
          opacity: 0.6,
          filter: 'blur(80px)',
          animationDuration: '30s',
          animationDirection: 'reverse',
        }}
      />
      
      {/* Floating blob 3 — Mint */}
      <div 
        className="absolute animate-drift delay-3"
        style={{
          width: '55vmax',
          height: '55vmax',
          left: '20%',
          bottom: '-25%',
          background: `radial-gradient(
            ellipse at center,
            var(--color-mint-start) 0%,
            transparent 70%
          )`,
          opacity: 0.5,
          filter: 'blur(70px)',
          animationDuration: '35s',
        }}
      />
      
      {/* Floating blob 4 — Secondary Lilac */}
      <div 
        className="absolute animate-drift delay-4"
        style={{
          width: '40vmax',
          height: '40vmax',
          right: '10%',
          bottom: '5%',
          background: `radial-gradient(
            ellipse at center,
            var(--color-lilac-end) 0%,
            transparent 70%
          )`,
          opacity: 0.4,
          filter: 'blur(50px)',
          animationDuration: '28s',
          animationDirection: 'reverse',
        }}
      />
      
      {/* Subtle light beam effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 40%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
}
