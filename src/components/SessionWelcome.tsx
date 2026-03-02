/**
 * SessionWelcome — Return Visitor Recognition
 * 
 * A gentle acknowledgment for returning visitors.
 * Shows once per session, then fades away.
 */
'use client';

import { useState, useEffect } from 'react';
import { useWorld } from '@/lib';
import { GlassPanel } from './GlassPanel';

export function SessionWelcome() {
  const { state } = useWorld();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show for returning visitors
  useEffect(() => {
    if (state.temporal.previousVisits > 0 && !isDismissed) {
      const showTimer = setTimeout(() => setIsVisible(true), 1500);
      const hideTimer = setTimeout(() => setIsVisible(false), 8000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [state.temporal.previousVisits, isDismissed]);

  if (!isVisible || isDismissed || state.temporal.previousVisits === 0) {
    return null;
  }

  const getMessage = () => {
    const visits = state.temporal.previousVisits;
    if (visits === 1) return "Welcome back. The cats remember you.";
    if (visits < 5) return "You've returned again. This brings them joy.";
    if (visits < 10) return "A familiar presence. The sanctuary knows you.";
    return "You are part of this world now.";
  };

  return (
    <div 
      className="fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateX(-50%) translateY(${isVisible ? 0 : -20}px)`,
      }}
      onClick={() => setIsDismissed(true)}
    >
      <GlassPanel 
        glowColor="lilac"
        className="px-6 py-4 cursor-pointer"
      >
        <p 
          className="text-sm text-center"
          style={{ color: 'var(--color-void)', opacity: 0.8 }}
        >
          {getMessage()}
        </p>
      </GlassPanel>
    </div>
  );
}
