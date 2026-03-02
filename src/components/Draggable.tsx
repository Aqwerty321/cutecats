/**
 * Draggable — Soft Physics Tactile Element
 * 
 * A wrapper that makes any element draggable with soft, heavy physics.
 * Objects have weight and inertia, bounce gently off edges.
 */
'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useWorld } from '@/lib';

interface DraggableProps {
  children: ReactNode;
  /** Unique ID for tracking interactions */
  id: string;
  /** Initial position (percentage of container) */
  initialX?: number;
  initialY?: number;
  /** Mass affects inertia (higher = heavier feel) */
  mass?: number;
  /** Friction (0-1, higher = stops faster) */
  friction?: number;
  /** Bounciness (0-1, higher = more bounce) */
  bounce?: number;
  /** Callback when object is tossed */
  onToss?: (velocity: { x: number; y: number }) => void;
  /** Callback when position changes */
  onPositionChange?: (id: string, x: number, y: number) => void;
  /** Additional styles */
  className?: string;
  style?: CSSProperties;
}

export function Draggable({
  children,
  id,
  initialX = 50,
  initialY = 50,
  mass = 1,
  friction = 0.95,
  bounce = 0.6,
  onToss,
  onPositionChange,
  className = '',
  style,
}: DraggableProps) {
  const { registerDrag } = useWorld();
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<DOMRect | null>(null);
  
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  
  // Report position changes
  useEffect(() => {
    onPositionChange?.(id, position.x, position.y);
  }, [id, position.x, position.y, onPositionChange]);
  
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Physics simulation
  useEffect(() => {
    if (!isSettling) return;

    const simulate = () => {
      const vel = velocityRef.current;
      
      // Apply friction
      vel.x *= friction;
      vel.y *= friction;

      // Update position
      let newX = position.x + vel.x;
      let newY = position.y + vel.y;

      // Bounce off edges (with dampening)
      if (newX < 5) {
        newX = 5;
        vel.x = -vel.x * bounce;
      } else if (newX > 95) {
        newX = 95;
        vel.x = -vel.x * bounce;
      }

      if (newY < 5) {
        newY = 5;
        vel.y = -vel.y * bounce;
      } else if (newY > 95) {
        newY = 95;
        vel.y = -vel.y * bounce;
      }

      setPosition({ x: newX, y: newY });

      // Stop simulation when velocity is negligible
      if (Math.abs(vel.x) < 0.01 && Math.abs(vel.y) < 0.01) {
        setIsSettling(false);
        velocityRef.current = { x: 0, y: 0 };
        return;
      }

      rafRef.current = requestAnimationFrame(simulate);
    };

    rafRef.current = requestAnimationFrame(simulate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isSettling, position, friction, bounce]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!elementRef.current) return;

    setIsDragging(true);
    setIsSettling(false);
    cancelAnimationFrame(rafRef.current);

    const rect = elementRef.current.getBoundingClientRect();
    const parent = elementRef.current.parentElement?.getBoundingClientRect();
    containerRef.current = parent || null;

    dragOffsetRef.current = {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };

    lastPosRef.current = { x: clientX, y: clientY };
    velocityRef.current = { x: 0, y: 0 };

    registerDrag(id);
  }, [id, registerDrag]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    
    // Calculate velocity for physics
    velocityRef.current = {
      x: (clientX - lastPosRef.current.x) / mass * 0.5,
      y: (clientY - lastPosRef.current.y) / mass * 0.5,
    };
    lastPosRef.current = { x: clientX, y: clientY };

    // Convert to percentage of container
    const newX = ((clientX - container.left - dragOffsetRef.current.x) / container.width) * 100;
    const newY = ((clientY - container.top - dragOffsetRef.current.y) / container.height) * 100;

    setPosition({
      x: Math.max(5, Math.min(95, newX)),
      y: Math.max(5, Math.min(95, newY)),
    });
  }, [isDragging, mass]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    
    const vel = velocityRef.current;
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

    // If released with velocity, start physics simulation
    if (speed > 0.5) {
      setIsSettling(true);
      onToss?.(vel);
    }
  }, [isDragging, onToss]);

  // Mouse events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Touch events
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div
      ref={elementRef}
      data-object-id={id}
      className={`absolute cursor-grab select-none pointer-events-auto ${isDragging ? 'cursor-grabbing' : ''} ${className}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${isDragging ? 1.05 : 1})`,
        transition: isDragging ? 'none' : isSettling ? 'none' : 'transform var(--duration-fast) var(--ease-out-expo)',
        willChange: 'left, top, transform',
        zIndex: isDragging ? 100 : 25,
        ...style,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragStart(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
    >
      {children}
    </div>
  );
}
