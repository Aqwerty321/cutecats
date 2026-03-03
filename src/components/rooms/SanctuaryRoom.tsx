'use client';

import { useCallback, useRef, useState } from 'react';
import { ROOM_COPY, ROOM_PORTAL_HINTS, SECRET_COPY, useWorld } from '@/lib';
import { DetailedCat } from '../DetailedCat';
import { Draggable } from '../Draggable';
import { GlassPanel } from '../GlassPanel';
import { RoomPortal } from '../RoomPortal';
import { Secret } from '../Secret';
import { WanderingCats } from '../WanderingCatHint';
import { YarnBall } from '../toys';

export function SanctuaryRoom() {
  const { state, petCat, catsInCurrentRoom, canAccessDreamRoom } = useWorld();
  const roomCopy = ROOM_COPY.sanctuary;
  const hints = ROOM_PORTAL_HINTS.sanctuary;

  const cats = catsInCurrentRoom;
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [toyPositions, setToyPositions] = useState<Record<string, { x: number; y: number }>>({});

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setToyPositions((prev) => ({ ...prev, [id]: { x, y } }));
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  }, []);

  const toyDefs = [
    { id: 'sanctuary-yarn-1', x: 30, y: 65, type: 'yarn' },
    { id: 'sanctuary-yarn-2', x: 70, y: 60, type: 'yarn' },
  ];

  const interactableObjects = toyDefs.map((toy) => ({
    id: toy.id,
    x: toyPositions[toy.id]?.x ?? toy.x,
    y: toyPositions[toy.id]?.y ?? toy.y,
    type: toy.type,
  }));

  const sanctuaryStatus = state.temporal.isDeepIdle
    ? 'Deep idle detected. The sanctuary is in quiet mode.'
    : state.discovery.petCount > 5
      ? 'Trust is high. Cats are following your movement patterns.'
      : roomCopy.helper;

  return (
    <div
      ref={containerRef}
      data-testid="sanctuary-room"
      className="relative flex min-h-screen min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden p-8"
      onMouseMove={handleMouseMove}
    >
      <RoomPortal to="playroom" position="right" hint={hints.playroom} glowColor="peach" />
      <RoomPortal to="gallery" position="left" hint={hints.gallery} glowColor="lilac" />
      {canAccessDreamRoom && (
        <RoomPortal to="dream" position="bottom" hint={hints.dream} glowColor="mint" requiresAccess />
      )}

      <WanderingCats />

      <Secret id="sanctuary-patience" revealCondition="time" threshold={180} className="absolute right-5 top-4 z-30">
        <span className="arcade-label">{SECRET_COPY['sanctuary-patience'].label}</span>
      </Secret>

      <header className="relative z-10 text-center">
        <p className="arcade-label">{roomCopy.subtitle}</p>
        <h1 data-testid="room-title-sanctuary" className="arcade-display mt-2 text-5xl md:text-7xl">
          {roomCopy.title}
        </h1>
        <p className="mt-3 text-base md:text-lg" style={{ color: 'var(--arcade-ink)' }}>
          {roomCopy.helper}
        </p>
      </header>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        <Draggable id="sanctuary-yarn-1" initialX={30} initialY={65} mass={0.8} onPositionChange={handlePositionChange}>
          <YarnBall color="lilac" size={52} />
        </Draggable>
        <Draggable id="sanctuary-yarn-2" initialX={70} initialY={60} mass={0.8} onPositionChange={handlePositionChange}>
          <YarnBall color="peach" size={48} />
        </Draggable>
      </div>

      {cats.map((cat) => (
        <DetailedCat
          key={cat.id}
          cat={cat}
          onPet={() => petCat(cat.id)}
          bounds={{ minX: 14, maxX: 86, minY: 50, maxY: 80 }}
          cursorPosition={cursorPos}
          objects={interactableObjects}
        />
      ))}

      {cats.length === 0 && (
        <GlassPanel glowColor="lilac" className="z-10 p-8" variant="vivid" elevation={2}>
          <p className="text-center text-lg" style={{ color: 'var(--arcade-ink-strong)' }}>
            Cats have wandered to another room.
            <br />
            <span className="text-sm" style={{ color: 'var(--arcade-ink-muted)' }}>
              Follow their trail through the portals.
            </span>
          </p>
        </GlassPanel>
      )}

      <GlassPanel className="relative z-10 mt-4 max-w-lg px-7 py-5 text-center" glowColor="peach" variant="soft" elevation={2}>
        <p className="text-base leading-relaxed" style={{ color: 'var(--arcade-ink-strong)' }}>
          {sanctuaryStatus}
        </p>
      </GlassPanel>

      <Secret id="sanctuary-kindness" revealCondition="pets" threshold={10} className="absolute bottom-20 left-8 z-30">
        <span className="arcade-label">{SECRET_COPY['sanctuary-kindness'].label}</span>
      </Secret>

      <Secret id="sanctuary-return" revealCondition="visits" threshold={3} className="absolute left-4 top-20 z-30">
        <span className="arcade-label">{SECRET_COPY['sanctuary-return'].label}</span>
      </Secret>

      {state.discovery.visitedRooms.size === 1 && (
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] animate-pulse-glow" style={{ color: 'var(--arcade-ink-muted)' }}>
          More rooms are active at the edges.
        </p>
      )}

      <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--arcade-ink-subtle)' }}>
        {state.temporal.previousVisits > 0
          ? `Visit cycle ${state.temporal.previousVisits + 1} online`
          : roomCopy.footer}
      </footer>
    </div>
  );
}
