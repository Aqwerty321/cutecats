'use client';

import { useCallback, useState } from 'react';
import { CatMood, CatState, MOOD_LABEL, ROOM_COPY, ROOM_PORTAL_HINTS, SECRET_COPY, useWorld } from '@/lib';
import { GlassPanel } from '../GlassPanel';
import { RoomPortal } from '../RoomPortal';
import { SanctuaryCat } from '../SanctuaryCat';
import { Secret } from '../Secret';
import { WanderingCats } from '../WanderingCatHint';

const CAT_PERSONALITIES: Record<string, { description: string; influence: string; favoriteThing: string }> = {
  mochi: {
    description: 'Reliable, calm, and always ready to anchor the room.',
    influence: 'Stabilizes ambient motion',
    favoriteThing: 'Warm color gradients',
  },
  lavender: {
    description: 'Curious explorer that keeps portal routes alive.',
    influence: 'Increases world curiosity',
    favoriteThing: 'Hidden corners',
  },
  sage: {
    description: 'Fast mover that amplifies playful interactions.',
    influence: 'Raises motion energy',
    favoriteThing: 'Rolling toys',
  },
  blossom: {
    description: 'Dream-linked companion tuned to quiet states.',
    influence: 'Unlocks dream mood transitions',
    favoriteThing: 'Long pauses',
  },
};

interface CatProfileProps {
  cat: CatState;
  onPet: () => void;
  onSetMood: (mood: CatMood) => void;
  isSelected: boolean;
  onSelect: () => void;
}

function CatProfile({ cat, onPet, onSetMood, isSelected, onSelect }: CatProfileProps) {
  const details = CAT_PERSONALITIES[cat.id] ?? {
    description: 'An unpredictable companion with hidden routines.',
    influence: 'Unknown',
    favoriteThing: 'Secrets',
  };

  return (
    <GlassPanel
      glowColor={cat.variant === 'cream' ? 'peach' : cat.variant === 'mint' ? 'mint' : 'lilac'}
      enableTilt={false}
      className={`cursor-pointer p-6 transition-all duration-500 ${isSelected ? 'scale-105' : 'scale-100'}`}
      style={{ minWidth: isSelected ? '280px' : '210px' }}
      variant={isSelected ? 'vivid' : 'soft'}
      elevation={isSelected ? 3 : 2}
    >
      <div onClick={onSelect}>
        <div
          onClick={(event) => {
            event.stopPropagation();
            onPet();
          }}
          style={{
            transform: `scaleX(${cat.id.charCodeAt(0) % 2 === 0 ? -1 : 1})`,
            transition: 'transform var(--duration-slow) var(--ease-fluid)',
          }}
        >
          <SanctuaryCat variant={cat.variant} size={isSelected ? 160 : 118} />
        </div>

        <div className="mt-3 text-center">
          <h3 className="text-xl">{cat.name}</h3>
          <p className="text-sm" style={{ color: 'var(--arcade-ink-muted)' }}>
            {MOOD_LABEL[cat.mood]} mode
          </p>
        </div>

        {isSelected && (
          <div className="mt-4 text-center" style={{ color: 'var(--arcade-ink-strong)' }}>
            <p className="text-sm leading-relaxed">{details.description}</p>
            <div className="mt-3 space-y-1 text-xs" style={{ color: 'var(--arcade-ink-muted)' }}>
              <p>{details.influence}</p>
              <p>{details.favoriteThing}</p>
              <p>Pets received: {cat.petCount}</p>
            </div>

            <div className="mt-3 flex justify-center gap-2">
              {(['calm', 'playful', 'curious'] as CatMood[]).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSetMood(mood);
                  }}
                  className="arcade-focus-ring h-8 w-8 rounded-full text-xs font-bold"
                  style={{
                    background: cat.mood === mood ? 'var(--arcade-accent-violet-500)' : 'rgba(255,255,255,0.65)',
                    border: '1px solid var(--arcade-border-soft)',
                    color: cat.mood === mood ? 'white' : 'var(--arcade-ink-strong)',
                  }}
                  title={`Set mood to ${mood}`}
                >
                  {mood.slice(0, 1).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

export function GalleryRoom() {
  const { state, petCat, dispatch, canAccessDreamRoom } = useWorld();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const copy = ROOM_COPY.gallery;
  const hints = ROOM_PORTAL_HINTS.gallery;

  const handleSetMood = useCallback(
    (catId: string, mood: CatMood) => {
      dispatch({ type: 'CAT_MOOD_CHANGE', catId, mood });
      dispatch({ type: 'SET_WORLD_MOOD', mood });
    },
    [dispatch]
  );

  return (
    <div data-testid="gallery-room" className="relative flex min-h-screen min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden p-8">
      <RoomPortal to="sanctuary" position="left" hint={hints.sanctuary} glowColor="lilac" />
      <RoomPortal to="playroom" position="right" hint={hints.playroom} glowColor="peach" />
      {canAccessDreamRoom && (
        <RoomPortal to="dream" position="bottom" hint={hints.dream} glowColor="mint" requiresAccess />
      )}

      <WanderingCats />

      <header className="relative z-10 text-center">
        <p className="arcade-label">{copy.subtitle}</p>
        <h2 data-testid="room-title-gallery" className="arcade-display mt-2 text-3xl md:text-4xl">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--arcade-ink-muted)' }}>
          {copy.helper}
        </p>
      </header>

      <section className="relative z-10 flex max-w-5xl flex-wrap items-start justify-center gap-6 md:gap-8">
        {state.cats.map((cat) => (
          <CatProfile
            key={cat.id}
            cat={cat}
            onPet={() => petCat(cat.id)}
            onSetMood={(mood) => handleSetMood(cat.id, mood)}
            isSelected={selectedCat === cat.id}
            onSelect={() => setSelectedCat((current) => (current === cat.id ? null : cat.id))}
          />
        ))}
      </section>

      <GlassPanel glowColor="lilac" className="mt-4 px-6 py-4 text-center" variant="soft" elevation={2}>
        <p className="text-sm" style={{ color: 'var(--arcade-ink-strong)' }}>
          World mood: <span className="font-bold">{MOOD_LABEL[state.worldMood]}</span>
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--arcade-ink-muted)' }}>
          Motion {Math.round(state.motionSpeed * 100)}% | Warmth {Math.round(state.colorTemperature * 100)}%
        </p>
      </GlassPanel>

      {!canAccessDreamRoom && state.discovery.visitedRooms.size >= 2 && (
        <p className="max-w-sm text-center text-xs" style={{ color: 'var(--arcade-ink-subtle)' }}>
          Dream access requires all core rooms plus kindness or deep idle.
        </p>
      )}

      <Secret id="gallery-friend" revealCondition="pets" threshold={15} className="absolute right-8 top-8">
        <span className="arcade-label">{SECRET_COPY['gallery-friend'].label}</span>
      </Secret>

      <Secret id="gallery-observer" revealCondition="time" threshold={120} className="absolute bottom-8 left-8">
        <span className="arcade-label">{SECRET_COPY['gallery-observer'].label}</span>
      </Secret>

      <Secret id="gallery-collector" revealCondition="visits" threshold={5} className="absolute left-4 top-20">
        <span className="arcade-label">{SECRET_COPY['gallery-collector'].label}</span>
      </Secret>
    </div>
  );
}
