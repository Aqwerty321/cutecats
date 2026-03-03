'use client';

import { useCallback, useRef, useState } from 'react';
import { ROOM_COPY, ROOM_PORTAL_HINTS, SECRET_COPY, useWorld } from '@/lib';
import { DetailedCat } from '../../DetailedCat';
import { GlassPanel } from '../../GlassPanel';
import { RoomPortal } from '../../RoomPortal';
import { Secret } from '../../Secret';
import { WanderingCats } from '../../WanderingCatHint';
import { PlayEffectsLayer } from './PlayEffectsLayer';
import { PlayToysLayer } from './PlayToysLayer';
import { usePlayRoomState } from './usePlayRoomState';

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
    addSparkle,
    addHeart,
    handleDraggablePositionChange,
    setBubblePositions,
    interactableObjects,
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
      addHeart(x, y);
      addSparkle(x + 4, y - 8);
    },
    [petCat, addHeart, addSparkle]
  );

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
        onToyClick={addSparkle}
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

      <GlassPanel glowColor="lilac" className="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-3" variant="vivid" elevation={2}>
        <p className="text-sm" style={{ color: 'var(--arcade-ink-strong)' }}>
          {copy.helper}
        </p>
      </GlassPanel>

      <Secret id="playroom-fidget" revealCondition="drags" threshold={10} className="absolute right-8 top-20 z-30">
        <span className="arcade-label">{SECRET_COPY['playroom-fidget'].label}</span>
      </Secret>

      <Secret id="playroom-master" revealCondition="drags" threshold={30} className="absolute bottom-20 right-8 z-30">
        <span className="arcade-label animate-pulse-glow">{SECRET_COPY['playroom-master'].label}</span>
      </Secret>
    </div>
  );
}
