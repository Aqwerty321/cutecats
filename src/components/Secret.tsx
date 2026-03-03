/**
 * Secret - Hidden discoverable element.
 */
'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useWorld } from '@/lib';

interface SecretProps {
  id: string;
  revealCondition: 'pets' | 'drags' | 'time' | 'idle' | 'visits' | 'always';
  threshold?: number;
  children: ReactNode;
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
  const dispatchScheduledRef = useRef(false);

  const wasDiscovered = state.discovery.secretsFound.has(id);

  const shouldReveal = useMemo(() => {
    if (wasDiscovered) {
      return true;
    }

    switch (revealCondition) {
      case 'pets':
        return state.discovery.petCount >= threshold;
      case 'drags':
        return state.discovery.dragCount >= threshold;
      case 'time':
        return state.temporal.sessionDuration >= threshold * 1000;
      case 'idle':
        return state.temporal.isDeepIdle;
      case 'visits':
        return state.temporal.previousVisits >= threshold;
      case 'always':
        return true;
      default:
        return false;
    }
  }, [
    wasDiscovered,
    revealCondition,
    state.discovery.petCount,
    state.discovery.dragCount,
    state.temporal.sessionDuration,
    state.temporal.isDeepIdle,
    state.temporal.previousVisits,
    threshold,
  ]);

  useEffect(() => {
    if (!shouldReveal || wasDiscovered || dispatchScheduledRef.current) {
      return;
    }

    dispatchScheduledRef.current = true;
    const timer = setTimeout(() => {
      dispatch({ type: 'DISCOVER_SECRET', secretId: id });
    }, 1000);

    return () => clearTimeout(timer);
  }, [shouldReveal, wasDiscovered, dispatch, id]);

  if (!shouldReveal) {
    return null;
  }

  return (
    <div
      data-testid={`secret-${id}`}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: wasDiscovered ? 0.84 : 1,
        animation: wasDiscovered ? 'none' : 'pulse-glow 2.4s ease-in-out',
        color: 'var(--arcade-ink-strong)',
        textShadow: '0 1px 6px rgba(255,255,255,0.45)',
      }}
    >
      {children}
    </div>
  );
}
