/**
 * RoomTransition — Morphing Between Spaces
 * 
 * Handles the visual transition when navigating between rooms.
 * No hard cuts. Everything dissolves and reforms.
 */
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useWorld } from '@/lib';

interface RoomTransitionProps {
  children: ReactNode;
}

export function RoomTransition({ children }: RoomTransitionProps) {
  const { state } = useWorld();
  const [isVisible, setIsVisible] = useState(true);
  const [displayedChildren, setDisplayedChildren] = useState(children);

  useEffect(() => {
    if (state.isTransitioning) {
      // Fade out
      setIsVisible(false);
      
      // Swap content mid-transition
      const swapTimer = setTimeout(() => {
        setDisplayedChildren(children);
      }, 400);

      // Fade back in
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 450);

      return () => {
        clearTimeout(swapTimer);
        clearTimeout(showTimer);
      };
    } else {
      setDisplayedChildren(children);
    }
  }, [state.isTransitioning, children, state.currentRoom]);

  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(10px)',
        filter: isVisible ? 'blur(0px)' : 'blur(8px)',
      }}
    >
      {displayedChildren}
    </div>
  );
}
