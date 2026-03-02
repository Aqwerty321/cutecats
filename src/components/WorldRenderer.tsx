/**
 * WorldRenderer — The Living World
 * 
 * Renders the current room based on world state.
 * Handles the living background that responds to world mood.
 */
'use client';

import { useWorld } from '@/lib';
import { 
  SanctuaryRoom, 
  PlayRoom, 
  GalleryRoom, 
  DreamRoom,
  RoomTransition,
} from '@/components';

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
      {renderCurrentRoom()}
    </RoomTransition>
  );
}
