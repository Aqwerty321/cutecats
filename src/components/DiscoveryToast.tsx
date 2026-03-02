/**
 * DiscoveryToast — Quiet Celebration of Discoveries
 * 
 * Subtle notifications when the user discovers something new.
 * Never loud, never urgent. Just a gentle acknowledgment.
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorld } from '@/lib';

interface Toast {
  id: string;
  message: string;
  icon: string;
}

export function DiscoveryToast() {
  const { state } = useWorld();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const shownToastsRef = useRef<Set<string>>(new Set());

  const addToast = useCallback((id: string, message: string, icon: string) => {
    if (shownToastsRef.current.has(id)) return;
    
    shownToastsRef.current.add(id);
    setToasts(prev => [...prev, { id, message, icon }]);

    // Auto-remove after delay
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Watch for discoverable moments
  useEffect(() => {
    // First pet
    if (state.discovery.petCount === 1) {
      addToast('first-pet', 'The cat purrs softly...', '♥');
    }
    
    // 5 pets
    if (state.discovery.petCount === 5) {
      addToast('five-pets', 'Trust grows', '✧');
    }
    
    // 10 pets - unlocks affectionate mood
    if (state.discovery.petCount === 10) {
      addToast('ten-pets', 'A bond forms', '❋');
    }

    // First drag
    if (state.discovery.dragCount === 1) {
      addToast('first-drag', 'Playful...', '◈');
    }

    // 10 drags
    if (state.discovery.dragCount === 10) {
      addToast('ten-drags', 'Joy in motion', '✦');
    }

    // Visited all main rooms
    if (state.discovery.visitedRooms.size === 3 && 
        state.discovery.visitedRooms.has('sanctuary') &&
        state.discovery.visitedRooms.has('playroom') &&
        state.discovery.visitedRooms.has('gallery')) {
      addToast('explorer', 'You have seen much...', '◎');
    }

    // First cat follow
    if (state.discovery.followedCatCount === 1) {
      addToast('first-follow', 'Following their lead', '→');
    }

    // Deep idle reached
    if (state.discovery.deepIdleReached) {
      addToast('deep-idle', 'Stillness has its rewards', '☽');
    }

    // Dream room unlocked (check if conditions are met)
    const canDream = state.discovery.visitedRooms.size >= 3 &&
                     (state.discovery.petCount >= 5 || state.discovery.deepIdleReached);
    if (canDream) {
      addToast('dream-unlocked', 'Something new awaits below...', '✧');
    }

  }, [
    state.discovery.petCount, 
    state.discovery.dragCount, 
    state.discovery.visitedRooms.size,
    state.discovery.followedCatCount,
    state.discovery.deepIdleReached,
    addToast,
  ]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="px-4 py-2 rounded-full transition-all duration-500"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 16px var(--glass-shadow)',
            color: 'var(--color-void)',
            opacity: 0.9,
            animation: 'fadeInUp 0.5s ease-out',
          }}
        >
          <span className="mr-2 opacity-70">{toast.icon}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 0.9;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
