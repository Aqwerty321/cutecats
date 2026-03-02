/**
 * Sanctuary Room — Entry & Grounding
 * 
 * The first room. Safety, calm, emotional trust.
 * Cats breathe here. Hints suggest depth beyond.
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { useWorld } from '@/lib';
import { GlassPanel, DetailedCat } from '@/components';
import { RoomPortal } from '../RoomPortal';
import { WanderingCats } from '../WanderingCatHint';
import { Secret } from '../Secret';
import { Draggable } from '../Draggable';
import { YarnBall } from '../toys';

export function SanctuaryRoom() {
  const { state, petCat, catsInCurrentRoom, canAccessDreamRoom } = useWorld();
  const cats = catsInCurrentRoom();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track cursor for cat reactions
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  
  // Simple toys for sanctuary
  const [toyPositions, setToyPositions] = useState<Record<string, { x: number; y: number }>>({});
  
  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setToyPositions(prev => ({ ...prev, [id]: { x, y } }));
  }, []);
  
  // Objects for cats to interact with
  const toys = [
    { id: 'sanctuary-yarn-1', x: 30, y: 65, type: 'yarn' },
    { id: 'sanctuary-yarn-2', x: 70, y: 60, type: 'yarn' },
  ];
  
  const interactableObjects = toys.map(t => ({
    id: t.id,
    x: toyPositions[t.id]?.x ?? t.x,
    y: toyPositions[t.id]?.y ?? t.y,
    type: t.type,
  }));
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen min-h-dvh flex flex-col items-center justify-center p-8 gap-8"
      onMouseMove={handleMouseMove}
    >
      {/* Portals to other rooms */}
      <RoomPortal to="playroom" position="right" hint="Something playful..." glowColor="peach" />
      <RoomPortal to="gallery" position="left" hint="Companions..." glowColor="lilac" />
      {canAccessDreamRoom() && (
        <RoomPortal to="dream" position="bottom" hint="Drift deeper..." glowColor="mint" requiresAccess />
      )}
      
      {/* Wandering cats peeking from edges */}
      <WanderingCats />

      {/* Hidden secret - appears after 3 minutes */}
      <Secret id="sanctuary-patience" revealCondition="time" threshold={180} className="absolute top-4 right-4 z-30">
        <span className="text-sm font-medium" style={{ color: '#C77DFF' }}>
          ✧ Patient Soul ✧
        </span>
      </Secret>

      {/* Hero Title */}
      <header className="text-center mb-4 relative z-10">
        <h1 
          className="text-4xl md:text-6xl font-semibold tracking-tight"
          style={{ 
            color: 'var(--color-void)',
            textShadow: '0 4px 20px rgba(199, 125, 255, 0.3)',
          }}
        >
          Purr & Prism
        </h1>
        <p 
          className="mt-4 text-xl"
          style={{ 
            color: 'var(--color-void)',
            opacity: 0.8,
          }}
        >
          A sanctuary. Explore gently. 🐱
        </p>
      </header>

      {/* Draggable yarn balls for cats to play with */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        <Draggable
          id="sanctuary-yarn-1"
          initialX={30}
          initialY={65}
          mass={0.8}
          onPositionChange={handlePositionChange}
        >
          <YarnBall color="lilac" size={50} />
        </Draggable>
        <Draggable
          id="sanctuary-yarn-2"
          initialX={70}
          initialY={60}
          mass={0.8}
          onPositionChange={handlePositionChange}
        >
          <YarnBall color="peach" size={45} />
        </Draggable>
      </div>

      {/* Detailed cats that roam freely */}
      {cats.map((cat) => (
        <DetailedCat
          key={cat.id}
          cat={cat}
          onPet={() => petCat(cat.id)}
          bounds={{ minX: 15, maxX: 85, minY: 50, maxY: 78 }}
          cursorPosition={cursorPos}
          objects={interactableObjects}
        />
      ))}

      {/* Empty state hint */}
      {cats.length === 0 && (
        <GlassPanel glowColor="lilac" className="p-8 z-10">
          <p 
            className="text-center text-lg"
            style={{ color: 'var(--color-void)' }}
          >
            The cats have wandered off... 🐾<br />
            <span className="text-sm opacity-70">Follow them?</span>
          </p>
        </GlassPanel>
      )}

      {/* Ambient Message */}
      <GlassPanel 
        glowColor="peach"
        className="mt-8 px-8 py-6 max-w-md text-center relative z-10"
      >
        <p 
          className="text-lg leading-relaxed"
          style={{ color: 'var(--color-void)' }}
        >
          {state.temporal.isDeepIdle 
            ? "The world grows quiet. The cats sleep. Time stretches gently... 🌙"
            : state.discovery.petCount > 5
              ? "The cats feel your presence. They trust you. 💕"
              : "Take your time. Touch things. Follow the cats. ✨"}
        </p>
      </GlassPanel>

      {/* Secret - appears after 10 pets */}
      <Secret id="sanctuary-kindness" revealCondition="pets" threshold={10} className="absolute bottom-20 left-8 z-30">
        <span className="text-sm font-medium" style={{ color: '#C77DFF' }}>
          The cats remember your gentleness. 💜
        </span>
      </Secret>

      {/* Secret - appears on 3rd visit */}
      <Secret id="sanctuary-return" revealCondition="visits" threshold={3} className="absolute top-20 left-4 z-30">
        <span className="text-sm font-medium" style={{ color: '#FF6B9D' }}>
          This place knows you now. 🏠
        </span>
      </Secret>

      {/* Subtle hint about more */}
      {state.discovery.visitedRooms.size === 1 && (
        <p 
          className="mt-8 text-base animate-pulse-glow"
          style={{ color: 'var(--color-void)', opacity: 0.7 }}
        >
          ✨ There is more beyond the edges... ✨
        </p>
      )}

      {/* Footer whisper */}
      <footer 
        className="mt-8 text-sm"
        style={{ color: 'var(--color-void)', opacity: 0.6 }}
      >
        {state.temporal.previousVisits > 0 
          ? `Welcome back. Visit ${state.temporal.previousVisits + 1}. 🌸`
          : "Move slowly. Stay as long as you need. 🍃"}
      </footer>
    </div>
  );
}
