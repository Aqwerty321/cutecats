/**
 * Dream Room — Hidden Sanctuary
 * 
 * Not immediately accessible.
 * Unlocked through gentle exploration and time.
 * 
 * This is the emotional payoff.
 * Fewer interactions, deeper feeling.
 * Personal, intimate, soft.
 */
'use client';

import { useEffect, useState } from 'react';
import { useWorld } from '@/lib';
import { GlassPanel } from '../GlassPanel';
import { SanctuaryCat } from '../SanctuaryCat';
import { RoomPortal } from '../RoomPortal';
import { Secret } from '../Secret';

export function DreamRoom() {
  const { state, petCat, catsInCurrentRoom } = useWorld();
  const cats = catsInCurrentRoom();
  
  // Blossom lives here
  const blossom = state.cats.find(c => c.id === 'blossom');
  
  // Slowly reveal content
  const [revealStage, setRevealStage] = useState(0);
  
  useEffect(() => {
    // Gradually reveal content
    const timers = [
      setTimeout(() => setRevealStage(1), 1000),
      setTimeout(() => setRevealStage(2), 3000),
      setTimeout(() => setRevealStage(3), 6000),
      setTimeout(() => setRevealStage(4), 10000),
    ];
    
    return () => timers.forEach(clearTimeout);
  }, []);

  // Dream messages that appear over time
  const dreamMessages = [
    "You found the quiet place.",
    "Not many come here.",
    "The cats brought you.",
    "Stay as long as you need.",
    "There is nothing to do here.",
    "That's the point.",
  ];

  return (
    <div 
      className="relative min-h-screen min-h-dvh flex flex-col items-center justify-center p-8 overflow-hidden"
      style={{
        // Deeper, dreamier colors
        background: 'linear-gradient(180deg, rgba(45,43,56,0.1) 0%, rgba(224,195,252,0.15) 100%)',
      }}
    >
      {/* Very subtle exit - dreams are hard to leave */}
      <RoomPortal to="sanctuary" position="top" hint="Wake..." glowColor="lilac" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'rgba(255, 255, 255, 0.4)',
              animationDuration: `${15 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Dream content - fades in slowly */}
      <div 
        className="relative z-10 flex flex-col items-center gap-12 transition-opacity duration-1000"
        style={{ opacity: revealStage >= 1 ? 1 : 0 }}
      >
        {/* Blossom - the dream keeper */}
        {blossom && (
          <div 
            className="transition-all duration-1000"
            style={{ 
              opacity: revealStage >= 2 ? 1 : 0,
              transform: revealStage >= 2 ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            <GlassPanel
              glowColor="peach"
              enableFloat
              className="p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div onClick={() => petCat(blossom.id)}>
                <SanctuaryCat 
                  variant={blossom.variant}
                  size={180}
                />
              </div>
              <p 
                className="mt-4 text-center font-medium opacity-70"
                style={{ color: 'var(--color-void)' }}
              >
                {blossom.name}
              </p>
              <p 
                className="text-center text-xs opacity-40 mt-1"
                style={{ color: 'var(--color-void)' }}
              >
                Keeper of Dreams
              </p>
            </GlassPanel>
          </div>
        )}

        {/* Dream messages */}
        <div 
          className="max-w-md text-center space-y-4 transition-opacity duration-1000"
          style={{ opacity: revealStage >= 3 ? 1 : 0 }}
        >
          {dreamMessages.slice(0, Math.min(revealStage, dreamMessages.length)).map((msg, i) => (
            <p 
              key={i}
              className="text-base leading-relaxed transition-opacity duration-1000"
              style={{ 
                color: 'var(--color-void)', 
                opacity: 0.6 - (i * 0.08),
                animationDelay: `${i * 2}s`,
              }}
            >
              {msg}
            </p>
          ))}
        </div>

        {/* Stats reflection (personal touch) */}
        {revealStage >= 4 && (
          <GlassPanel
            glowColor="lilac"
            className="p-6 text-center transition-opacity duration-1000"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <p 
              className="text-sm opacity-60 mb-4"
              style={{ color: 'var(--color-void)' }}
            >
              Your time here
            </p>
            
            <div 
              className="space-y-2 text-xs opacity-50"
              style={{ color: 'var(--color-void)' }}
            >
              <p>
                {Math.floor(state.temporal.sessionDuration / 60000)} minutes this visit
              </p>
              <p>
                {state.discovery.petCount} gentle touches
              </p>
              <p>
                {state.discovery.dragCount} playful moments
              </p>
              <p>
                {state.discovery.followedCatCount} paths followed
              </p>
              {state.temporal.previousVisits > 0 && (
                <p className="mt-4 opacity-70">
                  You&apos;ve returned {state.temporal.previousVisits} time{state.temporal.previousVisits > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <p 
              className="mt-6 text-sm opacity-70"
              style={{ color: 'var(--color-void)' }}
            >
              Thank you for being here.
            </p>
          </GlassPanel>
        )}

        {/* Dream room exclusive secrets */}
        <Secret id="dream-deep" revealCondition="time" threshold={300} className="text-center">
          <span className="text-xs" style={{ color: 'var(--color-lilac)', opacity: 0.5 }}>
            ✧ Dreamer ✧<br />
            <span className="opacity-70">You stayed in the quiet.</span>
          </span>
        </Secret>
      </div>

      {/* Secret: True explorer - found dream room */}
      <Secret id="dream-found" revealCondition="always" className="absolute top-20 right-8">
        <span className="text-xs" style={{ color: 'var(--color-peach)', opacity: 0.4 }}>
          ✧ True Explorer ✧
        </span>
      </Secret>

      {/* Secret: Soul touched - 25+ pets total */}
      <Secret id="dream-touched" revealCondition="pets" threshold={25} className="absolute bottom-24 left-8">
        <span className="text-xs" style={{ color: 'var(--color-mint)', opacity: 0.5 }}>
          The cats have shared their warmth with you.
        </span>
      </Secret>

      {/* Very gentle instruction */}
      <p 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-20 transition-opacity duration-1000"
        style={{ 
          color: 'var(--color-void)',
          opacity: revealStage >= 4 ? 0.3 : 0,
        }}
      >
        Drift upward when ready
      </p>
    </div>
  );
}
