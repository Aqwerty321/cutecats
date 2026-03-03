export function LivingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,233,247,1) 0%, rgba(255,213,240,1) 34%, rgba(211,247,255,1) 72%, rgba(255,247,200,1) 100%)',
        }}
      />

      <div
        className="absolute animate-drift delay-1"
        style={{
          width: '60vmax',
          height: '60vmax',
          left: '-10%',
          top: '-18%',
          background: 'radial-gradient(circle, rgba(255,78,159,0.4) 0%, transparent 72%)',
          opacity: 0.48,
          filter: 'blur(60px)',
          animationDuration: '24s',
        }}
      />

      <div
        className="absolute animate-drift delay-2"
        style={{
          width: '54vmax',
          height: '54vmax',
          right: '-12%',
          top: '10%',
          background: 'radial-gradient(circle, rgba(15,184,218,0.38) 0%, transparent 72%)',
          opacity: 0.42,
          filter: 'blur(72px)',
          animationDirection: 'reverse',
          animationDuration: '30s',
        }}
      />

      <div
        className="absolute animate-drift delay-3"
        style={{
          width: '52vmax',
          height: '52vmax',
          left: '18%',
          bottom: '-24%',
          background: 'radial-gradient(circle, rgba(255,187,34,0.32) 0%, transparent 72%)',
          opacity: 0.4,
          filter: 'blur(68px)',
          animationDuration: '34s',
        }}
      />

      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(175deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 52%)' }}
      />
    </div>
  );
}
