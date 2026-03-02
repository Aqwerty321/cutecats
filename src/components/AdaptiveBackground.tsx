/**
 * AdaptiveBackground — Mood-Responsive Atmosphere
 * 
 * The background responds to the world's emotional state.
 * Colors shift, motion changes, energy transforms.
 * 
 * Client Component — Needs world state access
 */
'use client';

import { useWorld } from '@/lib';

export function AdaptiveBackground() {
  const { state } = useWorld();
  
  // Mood-based color adjustments
  const moodColors = {
    calm: {
      primary: 'var(--color-lilac-start)',
      secondary: 'var(--color-peach-start)',
      tertiary: 'var(--color-mint-end)',
    },
    playful: {
      primary: 'var(--color-peach-start)',
      secondary: 'var(--color-mint-start)',
      tertiary: 'var(--color-lilac-end)',
    },
    sleepy: {
      primary: '#C7B8EA',
      secondary: '#B8C7EA',
      tertiary: '#C7EAE3',
    },
    curious: {
      primary: 'var(--color-mint-start)',
      secondary: 'var(--color-lilac-start)',
      tertiary: 'var(--color-peach-end)',
    },
    affectionate: {
      primary: 'var(--color-peach-start)',
      secondary: '#FFD4E5',
      tertiary: 'var(--color-lilac-start)',
    },
  };

  const colors = moodColors[state.worldMood];
  const animationSpeed = 25 / state.motionSpeed; // Slower motion = higher duration

  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden transition-all duration-1000"
      aria-hidden="true"
      style={{
        filter: state.temporal.isDeepIdle ? 'saturate(0.7) brightness(0.9)' : 'none',
      }}
    >
      {/* Base gradient layer */}
      <div 
        className="absolute inset-0 transition-all duration-2000"
        style={{
          background: `linear-gradient(
            135deg,
            ${colors.primary} 0%,
            ${colors.secondary} 35%,
            ${colors.tertiary} 70%,
            ${colors.primary} 100%
          )`,
        }}
      />
      
      {/* Floating blob 1 */}
      <div 
        className="absolute animate-drift delay-1"
        style={{
          width: '60vmax',
          height: '60vmax',
          left: '-10%',
          top: '-20%',
          background: `radial-gradient(
            ellipse at center,
            ${colors.primary} 0%,
            transparent 70%
          )`,
          opacity: state.temporal.isDeepIdle ? 0.4 : 0.7,
          filter: 'blur(60px)',
          animationDuration: `${animationSpeed}s`,
          transition: 'opacity 2s ease',
        }}
      />
      
      {/* Floating blob 2 */}
      <div 
        className="absolute animate-drift delay-2"
        style={{
          width: '50vmax',
          height: '50vmax',
          right: '-15%',
          top: '10%',
          background: `radial-gradient(
            ellipse at center,
            ${colors.secondary} 0%,
            transparent 70%
          )`,
          opacity: state.temporal.isDeepIdle ? 0.3 : 0.6,
          filter: 'blur(80px)',
          animationDuration: `${animationSpeed * 1.2}s`,
          animationDirection: 'reverse',
          transition: 'opacity 2s ease',
        }}
      />
      
      {/* Floating blob 3 */}
      <div 
        className="absolute animate-drift delay-3"
        style={{
          width: '55vmax',
          height: '55vmax',
          left: '20%',
          bottom: '-25%',
          background: `radial-gradient(
            ellipse at center,
            ${colors.tertiary} 0%,
            transparent 70%
          )`,
          opacity: state.temporal.isDeepIdle ? 0.25 : 0.5,
          filter: 'blur(70px)',
          animationDuration: `${animationSpeed * 1.4}s`,
          transition: 'opacity 2s ease',
        }}
      />
      
      {/* Floating blob 4 */}
      <div 
        className="absolute animate-drift delay-4"
        style={{
          width: '40vmax',
          height: '40vmax',
          right: '10%',
          bottom: '5%',
          background: `radial-gradient(
            ellipse at center,
            ${colors.primary} 0%,
            transparent 70%
          )`,
          opacity: state.temporal.isDeepIdle ? 0.2 : 0.4,
          filter: 'blur(50px)',
          animationDuration: `${animationSpeed * 1.1}s`,
          animationDirection: 'reverse',
          transition: 'opacity 2s ease',
        }}
      />
      
      {/* Light beam effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            160deg,
            rgba(255, 255, 255, ${state.temporal.isDeepIdle ? 0.05 : 0.1}) 0%,
            transparent 40%,
            transparent 100%
          )`,
        }}
      />

      {/* Deep idle overlay - dreamlike */}
      {state.temporal.isDeepIdle && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-2000"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(45,43,56,0.1) 100%)',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}
