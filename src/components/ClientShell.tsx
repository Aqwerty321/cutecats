/**
 * ClientShell — Client-side World Components
 * 
 * Wraps all client-side interactive layers that need world state.
 * Separated from layout for proper server/client component boundaries.
 */
'use client';

import { AdaptiveBackground } from './AdaptiveBackground';
import { DiscoveryToast } from './DiscoveryToast';
import { IdleStateOverlay } from './IdleStateOverlay';
import { SessionWelcome } from './SessionWelcome';
import { SoftCursor } from './SoftCursor';
import { WorldRenderer } from './WorldRenderer';

export function ClientShell() {
  return (
    <>
      {/* Mood-responsive background */}
      <AdaptiveBackground />

      {/* Custom cursor */}
      <SoftCursor color="lilac" />

      {/* Main world renderer with rooms */}
      <WorldRenderer />

      {/* Cross-room overlays */}
      <SessionWelcome />
      <DiscoveryToast />
      <IdleStateOverlay />
    </>
  );
}
