/**
 * WorldRenderer — The Living World
 * 
 * Renders the current room based on world state.
 * Handles the living background that responds to world mood.
 */
'use client';

import { useWorld } from '@/lib';
import { RoomTransition } from './RoomTransition';
import { SanctuaryRoom } from './rooms/SanctuaryRoom';
import { PlayRoom } from './rooms/PlayRoom';
import { GalleryRoom } from './rooms/GalleryRoom';
import { DreamRoom } from './rooms/DreamRoom';

export function WorldRenderer() {
  const { state } = useWorld();

  const renderCurrentRoom = () => {
    switch (state.currentRoom) {
      case 'sanctuary':
        return <SanctuaryRoom />;
      case 'playroom':
        return <PlayRoom />;
      case 'gallery':
        return <GalleryRoom />;
      case 'dream':
        return <DreamRoom />;
      default:
        return <SanctuaryRoom />;
    }
  };

  return (
    <RoomTransition>
      <div data-testid={`room-${state.currentRoom}`}>{renderCurrentRoom()}</div>
    </RoomTransition>
  );
}
