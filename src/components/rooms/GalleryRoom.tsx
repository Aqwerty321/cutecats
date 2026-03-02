/**
 * Gallery Room — Cat Companions
 * 
 * Each cat is a CHARACTER with mood and behaviors.
 * Interacting with a cat alters the world:
 * - background speed
 * - color palette  
 * - ambient motion
 */
'use client';

import { useCallback } from 'react';
import { useWorld, CatMood, CatState } from '@/lib';
import { GlassPanel } from '../GlassPanel';
import { SanctuaryCat } from '../SanctuaryCat';
import { RoomPortal } from '../RoomPortal';
import { WanderingCats } from '../WanderingCatHint';
import { Secret } from '../Secret';

/** Cat personality descriptions */
const CAT_PERSONALITIES: Record<string, {
  description: string;
  influence: string;
  favoriteThing: string;
}> = {
  mochi: {
    description: 'Gentle and steady. Mochi brings peace wherever they go.',
    influence: 'Calms the world',
    favoriteThing: 'Warm sunbeams',
  },
  lavender: {
    description: 'Ever curious. Lavender notices everything, questions nothing.',
    influence: 'Awakens wonder',
    favoriteThing: 'New corners to explore',
  },
  sage: {
    description: 'Boundless energy wrapped in soft fur. Sage plays with joy.',
    influence: 'Quickens the heart',
    favoriteThing: 'Yarn, always yarn',
  },
  blossom: {
    description: 'Dreams in colors we cannot see. Blossom exists between worlds.',
    influence: 'Softens reality',
    favoriteThing: 'Twilight hours',
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
  const personality = CAT_PERSONALITIES[cat.id] || {
    description: 'A mysterious companion.',
    influence: 'Unknown',
    favoriteThing: 'Secrets',
  };

  const moodEmoji: Record<CatMood, string> = {
    calm: '☁',
    playful: '✧',
    sleepy: '☽',
    curious: '◎',
    affectionate: '♥',
  };

  return (
    <GlassPanel
      glowColor={cat.variant === 'cream' ? 'peach' : cat.variant === 'mint' ? 'mint' : 'lilac'}
      enableTilt
      className={`p-6 cursor-pointer transition-all duration-500 ${isSelected ? 'scale-105' : 'scale-100'}`}
      style={{
        minWidth: isSelected ? '280px' : '200px',
      }}
    >
      <div onClick={onSelect}>
        {/* Cat avatar */}
        <div onClick={(e) => { e.stopPropagation(); onPet(); }}>
          <SanctuaryCat 
            variant={cat.variant}
            size={isSelected ? 160 : 120}
          />
        </div>

        {/* Name and mood */}
        <div className="mt-4 text-center">
          <h3 
            className="font-medium text-lg"
            style={{ color: 'var(--color-void)' }}
          >
            {cat.name}
          </h3>
          <p 
            className="text-sm opacity-60 mt-1"
            style={{ color: 'var(--color-void)' }}
          >
            {moodEmoji[cat.mood]} {cat.mood}
          </p>
        </div>

        {/* Expanded details when selected */}
        {isSelected && (
          <div 
            className="mt-4 text-center animate-in fade-in duration-500"
            style={{ color: 'var(--color-void)' }}
          >
            <p className="text-sm opacity-70 leading-relaxed">
              {personality.description}
            </p>
            
            <div className="mt-4 space-y-2 text-xs opacity-50">
              <p>✦ {personality.influence}</p>
              <p>♡ {personality.favoriteThing}</p>
              <p>Pets received: {cat.petCount}</p>
            </div>

            {/* Mood influence buttons (subtle) */}
            <div className="mt-4 flex justify-center gap-2">
              {(['calm', 'playful', 'curious'] as CatMood[]).map(mood => (
                <button
                  key={mood}
                  onClick={(e) => { e.stopPropagation(); onSetMood(mood); }}
                  className="w-8 h-8 rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    background: cat.mood === mood 
                      ? 'var(--glass-highlight)' 
                      : 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--glass-border)',
                  }}
                  title={`Set mood to ${mood}`}
                >
                  <span className="text-xs">{moodEmoji[mood]}</span>
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
  const [selectedCat, setSelectedCat] = React.useState<string | null>(null);

  // Get all cats (not just current room - this is the gallery of ALL companions)
  const allCats = state.cats;

  const handleSetMood = useCallback((catId: string, mood: CatMood) => {
    dispatch({ type: 'CAT_MOOD_CHANGE', catId, mood });
    dispatch({ type: 'SET_WORLD_MOOD', mood });
  }, [dispatch]);

  return (
    <div className="relative min-h-screen min-h-dvh flex flex-col items-center justify-center p-8 gap-8 overflow-hidden">
      {/* Navigation */}
      <RoomPortal to="sanctuary" position="left" hint="Return to sanctuary..." glowColor="lilac" />
      <RoomPortal to="playroom" position="right" hint="Time to play..." glowColor="peach" />
      {canAccessDreamRoom() && (
        <RoomPortal to="dream" position="bottom" hint="Enter the dream..." glowColor="mint" requiresAccess />
      )}
      
      <WanderingCats />

      {/* Room header */}
      <header className="text-center mb-4 relative z-10">
        <h2 
          className="text-3xl md:text-4xl font-medium tracking-tight"
          style={{ color: 'var(--color-void)' }}
        >
          Companions
        </h2>
        <p 
          className="mt-3 text-base opacity-60"
          style={{ color: 'var(--color-void)' }}
        >
          Each cat shapes the world in their own way
        </p>
      </header>

      {/* Cat gallery */}
      <section className="flex flex-wrap items-start justify-center gap-6 md:gap-8 relative z-10 max-w-5xl">
        {allCats.map((cat) => (
          <CatProfile
            key={cat.id}
            cat={cat}
            onPet={() => petCat(cat.id)}
            onSetMood={(mood) => handleSetMood(cat.id, mood)}
            isSelected={selectedCat === cat.id}
            onSelect={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
          />
        ))}
      </section>

      {/* World mood indicator */}
      <GlassPanel 
        glowColor="lilac"
        className="mt-8 px-6 py-4 text-center"
      >
        <p 
          className="text-sm opacity-70"
          style={{ color: 'var(--color-void)' }}
        >
          World feels: <span className="font-medium">{state.worldMood}</span>
        </p>
        <p 
          className="text-xs opacity-50 mt-1"
          style={{ color: 'var(--color-void)' }}
        >
          Motion: {Math.round(state.motionSpeed * 100)}% · Warmth: {Math.round(state.colorTemperature * 100)}%
        </p>
      </GlassPanel>

      {/* Hint about dream room */}
      {!canAccessDreamRoom() && state.discovery.visitedRooms.size >= 2 && (
        <p 
          className="mt-8 text-xs opacity-30 text-center max-w-sm"
          style={{ color: 'var(--color-void)' }}
        >
          The cats sense something deeper awaits...
          <br />
          <span className="opacity-50">
            (Visit all rooms and show kindness)
          </span>
        </p>
      )}

      {/* Secret: Friend of cats - appears after petting all 4 cats */}
      <Secret id="gallery-friend" revealCondition="pets" threshold={15} className="absolute top-8 right-8">
        <span className="text-xs" style={{ color: 'var(--color-mint)', opacity: 0.5 }}>
          ✧ Friend of Cats ✧
        </span>
      </Secret>

      {/* Secret: Observer - appears after 2 minutes in gallery */}
      <Secret id="gallery-observer" revealCondition="time" threshold={120} className="absolute bottom-8 left-8">
        <span className="text-xs" style={{ color: 'var(--color-lilac)', opacity: 0.4 }}>
          You've spent time with each one.
        </span>
      </Secret>

      {/* Secret: Collector - appears after 5th visit total */}
      <Secret id="gallery-collector" revealCondition="visits" threshold={5} className="absolute top-20 left-4">
        <span className="text-xs" style={{ color: 'var(--color-peach)', opacity: 0.4 }}>
          The gallery remembers all your visits.
        </span>
      </Secret>
    </div>
  );
}

// Need React for useState
import React from 'react';
