'use client';

import { useCallback, useRef } from 'react';
import { Draggable } from '../../Draggable';
import { YarnBall, BubbleField, GlassCard } from '../../toys';
import type { PlayInteractionEvent, PlayToy } from './types';

interface PlayToysLayerProps {
  toys: PlayToy[];
  onPositionChange: (id: string, x: number, y: number) => void;
  onBubblesChange: (bubbles: Array<{ id: string; x: number; y: number; type: 'bubble' }>) => void;
  onToyInteraction: (event: Omit<PlayInteractionEvent, 'now'>) => void;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function PlayToysLayer({
  toys,
  onPositionChange,
  onBubblesChange,
  onToyInteraction,
}: PlayToysLayerProps) {
  const livePositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const lastCardTeaseRef = useRef<Record<string, number>>({});

  const updatePosition = useCallback(
    (id: string, x: number, y: number) => {
      livePositionsRef.current[id] = { x, y };
      onPositionChange(id, x, y);

      if (id.startsWith('card-')) {
        const now = Date.now();
        const last = lastCardTeaseRef.current[id] ?? 0;
        if (now - last > 320) {
          lastCardTeaseRef.current[id] = now;
          onToyInteraction({
            id,
            type: 'card',
            source: 'drag-near',
            x,
            y,
            intensity: 0.52,
          });
        }
      }
    },
    [onPositionChange, onToyInteraction]
  );

  return (
    <>
      <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 5 }}>
        <BubbleField
          count={15}
          onBubblesChange={onBubblesChange}
          onBubblePop={(bubble) => {
            onToyInteraction({
              id: bubble.id,
              type: 'bubble',
              source: 'bubble-pop',
              x: bubble.x,
              y: bubble.y,
              intensity: clamp(bubble.size / 52, 0.5, 1.6),
            });
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        {toys.map((toy) => (
          <Draggable
            key={toy.id}
            id={toy.id}
            initialX={toy.x}
            initialY={toy.y}
            mass={toy.type === 'yarn' ? 0.8 : 0.6}
            friction={toy.type === 'yarn' ? 0.92 : 0.88}
            bounce={toy.type === 'yarn' ? 0.7 : 0.85}
            onPositionChange={updatePosition}
            onToss={(velocity) => {
              const speed = Math.hypot(velocity.x, velocity.y);
              const position = livePositionsRef.current[toy.id] ?? { x: toy.x, y: toy.y };
              onToyInteraction({
                id: toy.id,
                type: toy.type,
                source: toy.type === 'ball' ? 'ball-bat' : 'toss',
                x: position.x,
                y: position.y,
                velocity,
                intensity: clamp(speed / 15, 0.45, 2.4),
              });
            }}
          >
            <div
              className="cursor-pointer"
              onClick={() => {
                const position = livePositionsRef.current[toy.id] ?? { x: toy.x, y: toy.y };
                onToyInteraction({
                  id: toy.id,
                  type: toy.type,
                  source: 'click',
                  x: position.x,
                  y: position.y,
                  intensity: toy.type === 'yarn' ? 0.9 : 0.72,
                });
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const position = livePositionsRef.current[toy.id] ?? { x: toy.x, y: toy.y };
                  onToyInteraction({
                    id: toy.id,
                    type: toy.type,
                    source: 'click',
                    x: position.x,
                    y: position.y,
                    intensity: toy.type === 'yarn' ? 0.9 : 0.72,
                  });
                }
              }}
            >
              {toy.type === 'yarn' ? (
                <YarnBall color={toy.color} size={toy.size} />
              ) : (
                <svg width={toy.size} height={toy.size} viewBox="0 0 40 40">
                  <defs>
                    <radialGradient id={`ball-${toy.id}`} cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                      <stop
                        offset="60%"
                        stopColor={toy.color === 'lilac' ? '#C77DFF' : toy.color === 'peach' ? '#FF6B9D' : '#2DD4BF'}
                      />
                      <stop
                        offset="100%"
                        stopColor={toy.color === 'lilac' ? '#9D4EDD' : toy.color === 'peach' ? '#FF4777' : '#14B8A6'}
                      />
                    </radialGradient>
                  </defs>
                  <circle cx="20" cy="20" r="18" fill={`url(#ball-${toy.id})`} />
                </svg>
              )}
            </div>
          </Draggable>
        ))}

        <Draggable
          id="card-1"
          initialX={18}
          initialY={60}
          mass={1.2}
          onPositionChange={updatePosition}
          onToss={(velocity) => {
            const position = livePositionsRef.current['card-1'] ?? { x: 18, y: 60 };
            onToyInteraction({
              id: 'card-1',
              type: 'card',
              source: 'card-tease',
              x: position.x,
              y: position.y,
              velocity,
              intensity: clamp(Math.hypot(velocity.x, velocity.y) / 17, 0.42, 1.8),
            });
          }}
        >
          <div
            className="cursor-pointer"
            onClick={() => {
              const position = livePositionsRef.current['card-1'] ?? { x: 18, y: 60 };
              onToyInteraction({
                id: 'card-1',
                type: 'card',
                source: 'card-tease',
                x: position.x,
                y: position.y,
                intensity: 0.68,
              });
            }}
          >
            <GlassCard color="lilac" size="small" />
          </div>
        </Draggable>

        <Draggable
          id="card-2"
          initialX={82}
          initialY={65}
          mass={1.2}
          onPositionChange={updatePosition}
          onToss={(velocity) => {
            const position = livePositionsRef.current['card-2'] ?? { x: 82, y: 65 };
            onToyInteraction({
              id: 'card-2',
              type: 'card',
              source: 'card-tease',
              x: position.x,
              y: position.y,
              velocity,
              intensity: clamp(Math.hypot(velocity.x, velocity.y) / 17, 0.42, 1.8),
            });
          }}
        >
          <div
            className="cursor-pointer"
            onClick={() => {
              const position = livePositionsRef.current['card-2'] ?? { x: 82, y: 65 };
              onToyInteraction({
                id: 'card-2',
                type: 'card',
                source: 'card-tease',
                x: position.x,
                y: position.y,
                intensity: 0.68,
              });
            }}
          >
            <GlassCard color="peach" size="medium" />
          </div>
        </Draggable>
      </div>
    </>
  );
}
