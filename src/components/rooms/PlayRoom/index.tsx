'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ROOM_COPY, ROOM_PORTAL_HINTS, SECRET_COPY, useWorld } from '@/lib';
import { DetailedCat } from '../../DetailedCat';
import { GlassPanel } from '../../GlassPanel';
import { RoomPortal } from '../../RoomPortal';
import { Secret } from '../../Secret';
import { WanderingCats } from '../../WanderingCatHint';
import { PlayEffectsLayer } from './PlayEffectsLayer';
import { PlayToysLayer } from './PlayToysLayer';
import { usePlayRoomState } from './usePlayRoomState';

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function PlayRoom() {
  const { petCat, catsInCurrentRoom, canAccessDreamRoom } = useWorld();
  const copy = ROOM_COPY.playroom;
  const hints = ROOM_PORTAL_HINTS.playroom;
  const cats = catsInCurrentRoom;

  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const {
    toys,
    sparkles,
    hearts,
    toasts,
    comboMultiplier,
    activeToyStatus,
    metrics,
    handleDraggablePositionChange,
    setBubblePositions,
    handleToyInteraction,
    addPetFeedback,
    interactableObjects,
    hintPulse,
  } = usePlayRoomState();

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handlePetCat = useCallback(
    (catId: string, x: number, y: number) => {
      petCat(catId);
      addPetFeedback(x, y);
    },
    [petCat, addPetFeedback]
  );

  const nearestCatByPoint = useCallback(
    (x: number, y: number) => {
      let best: (typeof cats)[number] | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const cat of cats) {
        const distance = Math.hypot(cat.position.x - x, cat.position.y - y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = cat;
        }
      }
      return { cat: best, distance: bestDistance };
    },
    [cats]
  );

  const emitToyEvent = useCallback(
    (event: Parameters<typeof handleToyInteraction>[0]) => {
      const nearest = nearestCatByPoint(event.x, event.y);
      const ownerCatId = nearest.cat && nearest.distance < 20 ? nearest.cat.id : null;
      const intensityBoost = ownerCatId ? 0.22 : 0;

      handleToyInteraction({
        ...event,
        ownerCatId,
        intensity: clamp(event.intensity + intensityBoost, 0.1, 3),
      });

      if (event.type === 'ball' && ownerCatId && nearest.cat) {
        handleToyInteraction({
          id: event.id,
          type: 'ball',
          source: 'ball-bat',
          x: nearest.cat.position.x,
          y: nearest.cat.position.y,
          ownerCatId,
          velocity: event.velocity,
          intensity: clamp(event.intensity + 0.35, 0.2, 3),
        });
      }

      if (event.type === 'yarn' && ownerCatId && nearest.cat) {
        handleToyInteraction({
          id: event.id,
          type: 'yarn',
          source: 'toss',
          x: nearest.cat.position.x,
          y: nearest.cat.position.y,
          ownerCatId,
          velocity: event.velocity,
          intensity: clamp(event.intensity + 0.28, 0.2, 3),
        });
      }
    },
    [handleToyInteraction, nearestCatByPoint]
  );

  const comboLabel = useMemo(() => `x${comboMultiplier.toFixed(0)}`, [comboMultiplier]);

  return (
    <div
      ref={containerRef}
      data-testid="playroom-room"
      className="relative min-h-screen min-h-dvh overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <RoomPortal to="sanctuary" position="left" hint={hints.sanctuary} glowColor="lilac" />
      <RoomPortal to="gallery" position="right" hint={hints.gallery} glowColor="mint" />
      {canAccessDreamRoom && (
        <RoomPortal to="dream" position="bottom" hint={hints.dream} glowColor="peach" requiresAccess />
      )}

      <WanderingCats />

      <header className="absolute left-1/2 top-6 z-10 -translate-x-1/2 text-center">
        <p className="arcade-label">{copy.subtitle}</p>
        <h2 data-testid="room-title-playroom" className="arcade-display mt-2 text-3xl md:text-4xl">
          {copy.title}
        </h2>
      </header>

      <PlayToysLayer
        toys={toys}
        onPositionChange={handleDraggablePositionChange}
        onBubblesChange={setBubblePositions}
        onToyInteraction={emitToyEvent}
      />

      {cats.map((cat) => (
        <DetailedCat
          key={cat.id}
          cat={cat}
          onPet={() => handlePetCat(cat.id, cat.position.x, cat.position.y)}
          bounds={{ minX: 12, maxX: 88, minY: 30, maxY: 82 }}
          cursorPosition={cursorPos}
          objects={interactableObjects}
        />
      ))}

      <PlayEffectsLayer sparkles={sparkles} hearts={hearts} />

      <GlassPanel
        glowColor="lilac"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-3"
        variant="vivid"
        elevation={2}
      >
        <div className="text-sm text-center" style={{ color: 'var(--arcade-ink-strong)' }}>
          <p data-testid="playroom-helper-text">{copy.helper}</p>
          <p className="mt-1" data-testid="playroom-status-text">
            Arcade Plus: {activeToyStatus}
          </p>
          <p className="mt-1 font-semibold" data-testid="playroom-combo-meter">
            Combo meter {comboLabel}
          </p>
          <p className="mt-1 text-xs" style={{ opacity: 0.82 }} data-testid="playroom-metrics">
            Yarn {metrics.yarnChases} | Ball {metrics.ballBats} | Bubbles {metrics.bubblePops} | Cards {metrics.cardTeases}
          </p>
        </div>
      </GlassPanel>

      <div className="absolute right-6 top-20 z-40 pointer-events-none" data-testid="playroom-toasts">
        {toasts.slice(-3).map((toast, index) => (
          <div
            key={toast.id}
            className="arcade-panel arcade-panel-soft mb-2 px-3 py-2 text-xs"
            style={{
              color: 'var(--arcade-ink-strong)',
              opacity: 0.9 - index * 0.16,
              transform: `translateY(${index * 2}px) scale(${1 - index * 0.03})`,
            }}
            data-testid="playroom-event-toast"
          >
            {toast.message}
          </div>
        ))}
      </div>

      <Secret id="playroom-fidget" revealCondition="drags" threshold={10} className="absolute right-8 top-20 z-30">
        <span className="arcade-label" style={{ opacity: 0.9 + hintPulse * 0.08 }}>
          {SECRET_COPY['playroom-fidget'].label}
        </span>
      </Secret>

      <Secret id="playroom-master" revealCondition="drags" threshold={30} className="absolute bottom-20 right-8 z-30">
        <span className="arcade-label animate-pulse-glow">{SECRET_COPY['playroom-master'].label}</span>
      </Secret>
    </div>
  );
}
