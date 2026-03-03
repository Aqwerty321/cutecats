'use client';

import { Draggable } from '../../Draggable';
import { YarnBall, BubbleField, GlassCard } from '../../toys';
import type { PlayToy } from './types';

interface PlayToysLayerProps {
  toys: PlayToy[];
  onPositionChange: (id: string, x: number, y: number) => void;
  onBubblesChange: (bubbles: Array<{ id: string; x: number; y: number; type: string }>) => void;
  onToyClick: (x: number, y: number) => void;
}

export function PlayToysLayer({
  toys,
  onPositionChange,
  onBubblesChange,
  onToyClick,
}: PlayToysLayerProps) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 5 }}>
        <BubbleField count={15} onBubblesChange={onBubblesChange} />
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
            onPositionChange={onPositionChange}
          >
            <div
              className="cursor-pointer"
              onClick={() => onToyClick(toy.x, toy.y)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onToyClick(toy.x, toy.y);
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

        <Draggable id="card-1" initialX={18} initialY={60} mass={1.2}>
          <GlassCard color="lilac" size="small" />
        </Draggable>
        <Draggable id="card-2" initialX={82} initialY={65} mass={1.2}>
          <GlassCard color="peach" size="medium" />
        </Draggable>
      </div>
    </>
  );
}

