/**
 * Secret — Hidden Discoverable Element
 * 
 * Invisible until certain conditions are met.
 * Reveals with delight when found.
 */
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useWorld } from '@/lib';

interface SecretProps {
  /** Unique ID for tracking discovery */
  id: string;
  /** Conditions to reveal the secret */
  revealCondition: 'pets' | 'drags' | 'time' | 'idle' | 'visits' | 'always';
  /** Threshold for numeric conditions */
  threshold?: number;
  /** Content to reveal */
  children: ReactNode;
  /** Position */
  className?: string;
}

export function Secret({
  id,
  revealCondition,
  threshold = 5,
  children,
  className = '',
}: SecretProps) {
  const { state, dispatch } = useWorld();
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  // Check if already discovered
  const wasDiscovered = state.discovery.secretsFound.has(id);

  useEffect(() => {
    let shouldReveal = wasDiscovered;

    if (!shouldReveal) {
      switch (revealCondition) {
        case 'pets':
          shouldReveal = state.discovery.petCount >= threshold;
          break;
        case 'drags':
          shouldReveal = state.discovery.dragCount >= threshold;
          break;
        case 'time':
          shouldReveal = state.temporal.sessionDuration >= threshold * 1000;
          break;
        case 'idle':
          shouldReveal = state.temporal.isDeepIdle;
          break;
        case 'visits':
          shouldReveal = state.temporal.previousVisits >= threshold;
          break;
        case 'always':
          shouldReveal = true;
          break;
      }
    }

    if (shouldReveal && !isRevealed) {
      setIsRevealed(true);
      
      // Mark as discovered after a moment
      if (!wasDiscovered) {
        setTimeout(() => {
          dispatch({ type: 'DISCOVER_SECRET', secretId: id });
          setHasBeenSeen(true);
        }, 1000);
      }
    }
  }, [
    state.discovery.petCount,
    state.discovery.dragCount,
    state.temporal.sessionDuration,
    state.temporal.isDeepIdle,
    state.temporal.previousVisits,
    revealCondition,
    threshold,
    isRevealed,
    wasDiscovered,
    dispatch,
    id,
  ]);

  if (!isRevealed) return null;

  return (
    <div 
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: hasBeenSeen || wasDiscovered ? 0.8 : 1,
        animation: !wasDiscovered ? 'pulse-glow 2s ease-in-out' : 'none',
      }}
    >
      {children}
    </div>
  );
}
