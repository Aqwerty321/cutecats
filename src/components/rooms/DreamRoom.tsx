'use client';

import { useEffect, useMemo, useState } from 'react';
import { ROOM_COPY, ROOM_PORTAL_HINTS, SECRET_COPY, useWorld } from '@/lib';
import { seededNumber } from '@/lib/deterministic';
import { GlassPanel } from '../GlassPanel';
import { RoomPortal } from '../RoomPortal';
import { SanctuaryCat } from '../SanctuaryCat';
import { Secret } from '../Secret';

interface DreamParticle {
  id: number;
  width: number;
  height: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

function buildDreamParticles(count: number): DreamParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    width: seededNumber(`dream-width-${index}`, 2, 6),
    height: seededNumber(`dream-height-${index}`, 2, 6),
    left: seededNumber(`dream-left-${index}`, 0, 100),
    top: seededNumber(`dream-top-${index}`, 0, 100),
    duration: seededNumber(`dream-duration-${index}`, 14, 34),
    delay: seededNumber(`dream-delay-${index}`, 0, 10),
  }));
}

export function DreamRoom() {
  const { state, petCat } = useWorld();
  const blossom = state.cats.find((cat) => cat.id === 'blossom');
  const [revealStage, setRevealStage] = useState(0);
  const copy = ROOM_COPY.dream;
  const hints = ROOM_PORTAL_HINTS.dream;

  const particles = useMemo(() => buildDreamParticles(22), []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealStage(1), 900),
      setTimeout(() => setRevealStage(2), 2600),
      setTimeout(() => setRevealStage(3), 5200),
      setTimeout(() => setRevealStage(4), 8800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const dreamMessages = [
    'Dream channel opened.',
    'The quiet layer is now visible.',
    'You reached this room through trust and attention.',
    'Nothing is urgent here.',
    'Stay as long as needed.',
  ];

  return (
    <div
      data-testid="dream-room"
      className="relative flex min-h-screen min-h-dvh flex-col items-center justify-center overflow-hidden p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(24,12,46,0.32) 0%, rgba(143,75,255,0.2) 48%, rgba(15,184,218,0.16) 100%)',
      }}
    >
      <RoomPortal to="sanctuary" position="top" hint={hints.sanctuary} glowColor="lilac" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              width: particle.width,
              height: particle.height,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              background: 'rgba(255,255,255,0.55)',
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 flex flex-col items-center gap-10 transition-opacity duration-1000"
        style={{ opacity: revealStage >= 1 ? 1 : 0 }}
      >
        <header className="text-center">
          <p className="arcade-label" style={{ color: 'rgba(255,248,255,0.8)' }}>
            {copy.subtitle}
          </p>
          <h2 data-testid="room-title-dream" className="arcade-display mt-2 text-4xl" style={{ color: 'var(--arcade-inverse)' }}>
            {copy.title}
          </h2>
        </header>

        {blossom && (
          <div
            className="transition-all duration-1000"
            style={{ opacity: revealStage >= 2 ? 1 : 0, transform: revealStage >= 2 ? 'scale(1)' : 'scale(0.93)' }}
          >
            <GlassPanel glowColor="peach" className="p-8" variant="dream" enableFloat elevation={3}>
              <div onClick={() => petCat(blossom.id)}>
                <SanctuaryCat variant={blossom.variant} size={176} />
              </div>
              <p className="mt-4 text-center text-sm font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--arcade-inverse)' }}>
                {blossom.name}
              </p>
              <p className="text-center text-xs" style={{ color: 'rgba(255,248,255,0.72)' }}>
                Keeper of dream mode
              </p>
            </GlassPanel>
          </div>
        )}

        <div className="max-w-md space-y-3 text-center" style={{ opacity: revealStage >= 3 ? 1 : 0 }}>
          {dreamMessages.slice(0, Math.min(revealStage + 1, dreamMessages.length)).map((message, index) => (
            <p key={message} className="text-sm leading-relaxed" style={{ color: `rgba(255,248,255,${0.92 - index * 0.12})` }}>
              {message}
            </p>
          ))}
        </div>

        {revealStage >= 4 && (
          <GlassPanel glowColor="lilac" className="p-6 text-center" variant="dream" elevation={3}>
            <p className="arcade-label" style={{ color: 'rgba(255,248,255,0.74)' }}>
              Session metrics
            </p>
            <div className="mt-3 space-y-1 text-xs" style={{ color: 'rgba(255,248,255,0.82)' }}>
              <p>{Math.floor(state.temporal.sessionDuration / 60000)} minutes this visit</p>
              <p>{state.discovery.petCount} gentle touches</p>
              <p>{state.discovery.dragCount} playful actions</p>
              <p>{state.discovery.followedCatCount} cat trails followed</p>
              {state.temporal.previousVisits > 0 && (
                <p>
                  Returned {state.temporal.previousVisits} time{state.temporal.previousVisits > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </GlassPanel>
        )}

        <Secret id="dream-deep" revealCondition="time" threshold={300} className="text-center">
          <span className="arcade-label">{SECRET_COPY['dream-deep'].label}</span>
        </Secret>
      </div>

      <Secret id="dream-found" revealCondition="always" className="absolute right-8 top-20">
        <span className="arcade-label">{SECRET_COPY['dream-found'].label}</span>
      </Secret>

      <Secret id="dream-touched" revealCondition="pets" threshold={25} className="absolute bottom-24 left-8">
        <span className="arcade-label">{SECRET_COPY['dream-touched'].label}</span>
      </Secret>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(255,248,255,0.62)' }}>
        {copy.footer}
      </p>
    </div>
  );
}
