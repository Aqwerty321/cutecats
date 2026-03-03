'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { seededBool } from '@/lib/deterministic';
import { useAnimationClock } from '@/lib/use-animation-clock';
import type { CatState } from '@/lib';
import type { DetailedCatBehavior, DetailedCatBounds, InteractableObject } from './types';

interface UseDetailedCatBehaviorArgs {
  cat: CatState;
  bounds: DetailedCatBounds;
  cursorPosition: { x: number; y: number } | null;
  objects: InteractableObject[];
  onPet?: () => void;
}

function clampPosition(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useDetailedCatBehavior({
  cat,
  bounds,
  cursorPosition,
  objects,
  onPet,
}: UseDetailedCatBehaviorArgs) {
  const animationMs = useAnimationClock(true);
  const [position, setPosition] = useState(() => ({ x: cat.position.x, y: cat.position.y }));
  const [behavior, setBehavior] = useState<DetailedCatBehavior>('idle');
  const [facing, setFacing] = useState<'left' | 'right'>(() =>
    seededBool(`detailed-facing-${cat.id}`) ? 'left' : 'right'
  );
  const [blinkState, setBlinkState] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [needs, setNeeds] = useState(() => ({
    energy: 60,
    hunger: 20,
    fun: 30,
    affection: 0,
  }));

  const behaviorTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const blink = () => {
      if (behavior !== 'sleeping') {
        setBlinkState(0);
        setTimeout(() => setBlinkState(1), 150);
      }
      setTimeout(blink, 2500 + Math.random() * 3000);
    };

    const timer = setTimeout(blink, 1000 + Math.random() * 2000);
    return () => clearTimeout(timer);
  }, [behavior]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNeeds((prev) => ({
        energy: Math.max(0, prev.energy - 0.2),
        hunger: Math.min(100, prev.hunger + 0.2),
        fun: Math.min(100, prev.fun + 0.15),
        affection: Math.max(0, prev.affection - 0.1),
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const chooseBehavior = useCallback(() => {
    const isTired = needs.energy < 20;
    const isHungry = needs.hunger > 80;
    const isBored = needs.fun > 60;

    if (isTired) {
      setBehavior('sleeping');
      setTarget(null);
      return 7000 + Math.random() * 6000;
    }

    if (cursorPosition && cat.mood === 'curious') {
      const dx = cursorPosition.x - position.x;
      const dy = cursorPosition.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 20) {
        setBehavior('curious');
        setTarget({ x: cursorPosition.x, y: cursorPosition.y });
        return 2000 + Math.random() * 2000;
      }
    }

    if ((isHungry || isBored) && objects.length > 0) {
      const object = objects[Math.floor(Math.random() * objects.length)];
      setBehavior('playing');
      setTarget({ x: object.x, y: object.y });
      return 2500 + Math.random() * 2500;
    }

    const roll = Math.random();
    if (roll < 0.3) {
      setBehavior('wandering');
      setTarget({
        x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      });
      return 3000 + Math.random() * 3000;
    }
    if (roll < 0.5) {
      setBehavior('grooming');
      setTarget(null);
      return 2000 + Math.random() * 2000;
    }
    if (roll < 0.7) {
      setBehavior('sitting');
      setTarget(null);
      return 2500 + Math.random() * 2500;
    }

    setBehavior('idle');
    setTarget(null);
    return 2000 + Math.random() * 2500;
  }, [bounds, cat.mood, cursorPosition, needs.energy, needs.hunger, needs.fun, objects, position.x, position.y]);

  useEffect(() => {
    const run = () => {
      const duration = chooseBehavior();
      behaviorTimerRef.current = setTimeout(run, duration);
    };
    run();
    return () => {
      if (behaviorTimerRef.current) {
        clearTimeout(behaviorTimerRef.current);
      }
    };
  }, [chooseBehavior]);

  useEffect(() => {
    if (!target || (behavior !== 'wandering' && behavior !== 'playing' && behavior !== 'curious')) {
      return;
    }

    const interval = setInterval(() => {
      setPosition((prev) => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 1.5) {
          return prev;
        }

        const speed = behavior === 'playing' ? 0.7 : behavior === 'curious' ? 0.45 : 0.35;
        const next = {
          x: clampPosition(prev.x + (dx / distance) * speed, bounds.minX, bounds.maxX),
          y: clampPosition(prev.y + (dy / distance) * speed, bounds.minY, bounds.maxY),
        };
        setFacing(next.x > prev.x ? 'right' : 'left');
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [behavior, bounds.maxX, bounds.maxY, bounds.minX, bounds.minY, target]);

  const handlePet = useCallback(() => {
    onPet?.();
    setIsPetted(true);
    setShowHeart(true);
    setNeeds((prev) => ({
      energy: Math.min(100, prev.energy + 5),
      hunger: Math.max(0, prev.hunger - 2),
      fun: Math.max(0, prev.fun - 10),
      affection: Math.min(100, prev.affection + 25),
    }));
    setBehavior('curious');
    setTarget(null);

    setTimeout(() => setIsPetted(false), 500);
    setTimeout(() => setShowHeart(false), 1400);
  }, [onPet]);

  const walkBob =
    behavior === 'wandering' || behavior === 'playing' || behavior === 'curious'
      ? Math.sin(animationMs / 110) * 1.8
      : 0;
  const tailWag = Math.sin(animationMs / 220) * (behavior === 'playing' ? 30 : 12);
  const breathe = Math.sin(animationMs / 900) * 0.9;

  const statusText = useMemo(() => {
    if (behavior === 'sleeping') return 'resting';
    if (behavior === 'playing') return 'engaged';
    if (behavior === 'curious') return 'watching';
    if (behavior === 'grooming') return 'grooming';
    return cat.mood;
  }, [behavior, cat.mood]);

  return {
    position,
    behavior,
    facing,
    blinkState,
    isHovered,
    setIsHovered,
    isPetted,
    showHeart,
    handlePet,
    walkBob,
    tailWag,
    breathe,
    statusText,
    needs,
  };
}

