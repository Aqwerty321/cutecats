'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDiscoveryMilestones, useWorld } from '@/lib';

interface Toast {
  id: string;
  message: string;
  icon: string;
}

export function DiscoveryToast() {
  const { state } = useWorld();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const shownRef = useRef<Set<string>>(new Set());

  const pushToast = useCallback((toast: Toast) => {
    if (shownRef.current.has(toast.id)) {
      return;
    }

    shownRef.current.add(toast.id);
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 4200);
  }, []);

  useEffect(() => {
    const milestones = getDiscoveryMilestones(state);
    milestones.forEach((item) => pushToast(item));
  }, [pushToast, state]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2" data-testid="discovery-toast-stack">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid={`discovery-toast-${toast.id}`}
          className="arcade-panel arcade-panel-vivid rounded-full px-4 py-2"
          style={{ animation: 'fade-in-up 0.45s ease-out' }}
        >
          <span className="mr-2 text-xs font-bold uppercase" style={{ color: 'var(--arcade-ink-muted)' }}>
            {toast.icon}
          </span>
          <span className="text-sm" style={{ color: 'var(--arcade-ink-strong)' }}>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
