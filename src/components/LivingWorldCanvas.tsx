/**
 * Living World Canvas — The Stage Where Everything Exists
 * 
 * This is the main container that renders the entire living world simulation.
 * Handles the animation loop, cursor tracking, and brings together all the pieces.
 */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { LivingCat } from './LivingCat';
import { LivingObject } from './LivingObject';
import {
  createLivingWorld,
  updateLivingWorld,
  handleCursorMove,
  handleCursorInteraction,
  saveWorldMemory,
  loadWorldMemory,
  type LivingWorldState
} from '@/lib/living-world';

export function LivingWorldCanvas() {
  const [world, setWorld] = useState<LivingWorldState | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(true);
  
  // Initialize world on mount
  useEffect(() => {
    const memory = loadWorldMemory();
    const initialWorld = createLivingWorld(memory);
    setWorld(initialWorld);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Save memory on unmount
      if (world) {
        saveWorldMemory(world);
      }
    };
  }, []);
  
  // Main simulation loop
  useEffect(() => {
    if (!world) return;
    
    const simulate = (time: number) => {
      const deltaTime = Math.min((time - lastTimeRef.current) / 16.67, 3); // Normalize to ~60fps, cap at 3x
      lastTimeRef.current = time;
      
      // Only update if visible (but still track time for catch-up)
      if (isVisibleRef.current) {
        setWorld(prevWorld => {
          if (!prevWorld) return prevWorld;
          return updateLivingWorld(prevWorld, deltaTime);
        });
      }
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(simulate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [world !== null]);
  
  // Handle visibility changes
  useEffect(() => {
    const handleVisibility = () => {
      const wasHidden = !isVisibleRef.current;
      isVisibleRef.current = document.visibilityState === 'visible';
      
      // Catch-up logic when returning
      if (wasHidden && isVisibleRef.current && world) {
        // Cats moved around while you were away
        setWorld(prev => {
          if (!prev) return prev;
          // Run a few extra update cycles to simulate time passing
          let updated = prev;
          for (let i = 0; i < 30; i++) {
            updated = updateLivingWorld(updated, 1);
          }
          return updated;
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [world]);
  
  // Save periodically
  useEffect(() => {
    if (!world) return;
    
    const saveInterval = setInterval(() => {
      saveWorldMemory(world);
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [world]);
  
  // Handle cursor movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setWorld(prev => prev ? handleCursorMove(prev, x, y) : prev);
  }, []);
  
  // Handle interactions
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setWorld(prev => prev ? handleCursorInteraction(prev, x, y) : prev);
  }, []);
  
  // Handle object-specific interactions
  const handleObjectInteract = useCallback((objectId: string) => {
    setWorld(prev => {
      if (!prev) return prev;
      const object = prev.objects.find(o => o.body.id === objectId);
      if (!object) return prev;
      
      // Apply a small force to the object
      const forceX = (Math.random() - 0.5) * 2;
      const forceY = -Math.random() * 1.5;
      
      return {
        ...prev,
        objects: prev.objects.map(o => {
          if (o.body.id === objectId) {
            return {
              ...o,
              body: {
                ...o.body,
                velocity: {
                  x: o.body.velocity.x + forceX,
                  y: o.body.velocity.y + forceY
                }
              }
            };
          }
          return o;
        })
      };
    });
  }, []);
  
  if (!world) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-300 animate-pulse">...</div>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        background: `linear-gradient(to bottom, 
          hsl(${250 + world.timeOfDay * 20}, 70%, ${85 + world.timeOfDay * 10}%), 
          hsl(${280 + world.timeOfDay * 15}, 60%, ${90 + world.timeOfDay * 5}%), 
          hsl(${320 + world.timeOfDay * 10}, 50%, ${92 + world.timeOfDay * 3}%)
        )`,
        cursor: 'none',
      }}
    >
      {/* Custom cursor */}
      {world.cursorPosition && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: `${world.cursorPosition.x}%`,
            top: `${world.cursorPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div 
            className="w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 70%)',
              boxShadow: `
                0 0 20px rgba(199, 125, 255, 0.5),
                0 0 40px rgba(199, 125, 255, 0.3),
                0 0 60px rgba(199, 125, 255, 0.15)
              `,
            }}
          />
        </div>
      )}
      
      {/* Ambient glow overlay */}
      {world.cursorPosition && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at ${world.cursorPosition.x}% ${world.cursorPosition.y}%, 
              rgba(199, 125, 255, ${0.05 * world.ambientGlow}) 0%, 
              transparent 30%
            )`,
          }}
        />
      )}
      
      {/* Ground line hint */}
      <div
        className="fixed left-0 right-0 h-px pointer-events-none"
        style={{
          top: '85%',
          background: 'linear-gradient(to right, transparent, rgba(199, 125, 255, 0.1), transparent)',
        }}
      />
      
      {/* Render all objects */}
      {world.objects
        .filter(o => o.type !== 'mote')
        .map(object => (
          <LivingObject
            key={object.body.id}
            object={object}
            onInteract={handleObjectInteract}
          />
        ))}
      
      {/* Render motes (dust particles) on top of other objects but below cats */}
      {world.objects
        .filter(o => o.type === 'mote')
        .map(object => (
          <LivingObject key={object.body.id} object={object} />
        ))}
      
      {/* Render all cats */}
      {world.cats.map(cat => (
        <LivingCat key={cat.id} cat={cat} />
      ))}
      
      {/* Subtle ambient particles */}
      <AmbientParticles density={world.motionDensity} />
      
      {/* CSS animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateY(-8px) rotate(2deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(5px, -3px); }
          50% { transform: translate(-3px, 5px); }
          75% { transform: translate(4px, 2px); }
        }
      `}</style>
    </div>
  );
}

// Ambient floating particles for atmosphere
function AmbientParticles({ density }: { density: number }) {
  const particles = Array.from({ length: Math.floor(15 * density) }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 12,
  }));
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(199, 125, 255, 0.3) 0%, transparent 70%)`,
            animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
