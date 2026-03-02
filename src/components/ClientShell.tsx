/**
 * ClientShell — Client-side World Components
 * 
 * Wraps all client-side interactive layers that need world state.
 * Separated from layout for proper server/client component boundaries.
 */
'use client';

import { WorldProvider } from '@/lib';
import { AdaptiveBackground } from './AdaptiveBackground';
import { SoftCursor } from './SoftCursor';
import { WorldRenderer } from './WorldRenderer';

export function ClientShell() {
  return (
    <WorldProvider>
      {/* Mood-responsive background */}
      <AdaptiveBackground />
      
      {/* Custom cursor */}
      <SoftCursor color="lilac" />
      
      {/* Main world renderer with rooms */}
      <WorldRenderer />
    </WorldProvider>
  );
}
