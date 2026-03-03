'use client';

import { type ReactNode } from 'react';
import { useWorld } from '@/lib';

interface RoomTransitionProps {
  children: ReactNode;
}

export function RoomTransition({ children }: RoomTransitionProps) {
  const { state } = useWorld();
  const active = !state.isTransitioning;

  return (
    <div
      data-testid="room-transition"
      className="transition-all duration-500 ease-out"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1) translateY(0)' : 'scale(0.985) translateY(8px)',
        filter: active ? 'blur(0)' : 'blur(6px) saturate(0.8)',
      }}
    >
      {children}
    </div>
  );
}
