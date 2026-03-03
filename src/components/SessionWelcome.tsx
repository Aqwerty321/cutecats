'use client';

import { useEffect, useState } from 'react';
import { useWorld } from '@/lib';
import { GlassPanel } from './GlassPanel';

export function SessionWelcome() {
  const { state } = useWorld();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (state.temporal.previousVisits === 0 || dismissed) {
      return;
    }

    const showTimer = setTimeout(() => setVisible(true), 1000);
    const hideTimer = setTimeout(() => setVisible(false), 7800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [dismissed, state.temporal.previousVisits]);

  if (!visible || dismissed || state.temporal.previousVisits === 0) {
    return null;
  }

  const visits = state.temporal.previousVisits;
  const line =
    visits === 1
      ? 'Welcome back. The arcade cats remember your route.'
      : visits < 5
        ? 'Return detected. Trust level is rising.'
        : visits < 10
          ? 'Regular visitor status confirmed.'
          : 'You are now part of the sanctuary rhythm.';

  return (
    <div
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: `translateX(-50%) translateY(${visible ? 0 : -12}px)` }}
      onClick={() => setDismissed(true)}
      data-testid="session-welcome"
    >
      <GlassPanel glowColor="lilac" className="cursor-pointer px-5 py-3" variant="vivid" elevation={2}>
        <p className="text-sm" style={{ color: 'var(--arcade-ink-strong)' }}>
          {line}
        </p>
      </GlassPanel>
    </div>
  );
}
