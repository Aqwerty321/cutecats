'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { seededBool } from '@/lib/deterministic';
import { useAnimationClock } from '@/lib/use-animation-clock';
import {
  DEFAULT_MOTION_CONFIG,
  integrateMotion,
  resolveFacing,
  smoothValue,
  type MotionState,
} from '@/lib/motion';
import type { CatState } from '@/lib';
import { getEyeExpression, normalizeFocus } from '../cat-visuals';
import type { DetailedCatBehavior, DetailedCatBounds, InteractableObject } from './types';

interface UseDetailedCatBehaviorArgs {
  cat: CatState;
  bounds: DetailedCatBounds;
  cursorPosition: { x: number; y: number } | null;
  objects: InteractableObject[];
  onPet?: () => void;
}

interface CatTarget {
  x: number;
  y: number;
  objectId?: string;
  objectType?: string;
  intensity?: number;
  activeUntil?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function moodRoll(mood: CatState['mood']): number {
  if (mood === 'playful') {
    return 0.62;
  }
  if (mood === 'curious') {
    return 0.56;
  }
  if (mood === 'sleepy') {
    return 0.25;
  }
  if (mood === 'affectionate') {
    return 0.4;
  }
  return 0.34;
}

function findLiveObject(
  objects: InteractableObject[],
  now: number,
  position: { x: number; y: number },
  lastToyId: string | null,
  repeatCooldownUntil: number
): InteractableObject | null {
  let bestScore = Number.NEGATIVE_INFINITY;
  let winner: InteractableObject | null = null;

  for (const object of objects) {
    const activeUntil = object.activeUntil ?? 0;
    const comboWindowUntil = object.comboWindowUntil ?? 0;
    const cooldownUntil = object.cooldownUntil ?? 0;
    const isLive = activeUntil > now || comboWindowUntil > now || (object.intensity ?? 0) > 0.7;

    if (!isLive || cooldownUntil > now) {
      continue;
    }

    const distance = Math.hypot(object.x - position.x, object.y - position.y);
    const intensity = object.intensity ?? 0.5;
    const impulse = object.lastImpulse ?? 0;
    const proximity = clamp(1 - distance / 45, 0, 1);
    const repeatPenalty = lastToyId === object.id && repeatCooldownUntil > now ? 0.55 : 0;
    const typeBonus = object.type === 'yarn' ? 0.28 : object.type === 'ball' ? 0.22 : 0.15;

    const score = intensity * 1.15 + proximity * 0.65 + impulse * 0.3 + typeBonus - repeatPenalty;
    if (score > bestScore) {
      bestScore = score;
      winner = object;
    }
  }

  return winner;
}

export function useDetailedCatBehavior({
  cat,
  bounds,
  cursorPosition,
  objects,
  onPet,
}: UseDetailedCatBehaviorArgs) {
  const clockMs = useAnimationClock(true);
  const [position, setPosition] = useState(() => ({ x: cat.position.x, y: cat.position.y }));
  const [behavior, setBehavior] = useState<DetailedCatBehavior>('idle');
  const [facing, setFacing] = useState<'left' | 'right'>(() =>
    seededBool(`detailed-facing-${cat.id}`) ? 'left' : 'right'
  );
  const [blinkState, setBlinkState] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [target, setTarget] = useState<CatTarget | null>(null);
  const [needs, setNeeds] = useState(() => ({
    energy: 60,
    hunger: 20,
    fun: 30,
    affection: 0,
  }));
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const behaviorRef = useRef(behavior);
  const positionRef = useRef(position);
  const targetRef = useRef<CatTarget | null>(target);
  const cursorRef = useRef(cursorPosition);
  const objectsRef = useRef(objects);
  const needsRef = useRef(needs);
  const facingRef = useRef(facing);

  const motionRef = useRef<MotionState>({ x: cat.position.x, y: cat.position.y, vx: 0, vy: 0 });
  const eyeRef = useRef({ x: 0, y: 0 });
  const behaviorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const behaviorAgeRef = useRef<number>(0);
  const memoryRef = useRef<{ lastToyId: string | null; repeatCooldownUntil: number }>({
    lastToyId: null,
    repeatCooldownUntil: 0,
  });

  useEffect(() => {
    behaviorRef.current = behavior;
  }, [behavior]);

  useEffect(() => {
    if (!behaviorAgeRef.current) {
      behaviorAgeRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    cursorRef.current = cursorPosition;
  }, [cursorPosition]);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  useEffect(() => {
    needsRef.current = needs;
  }, [needs]);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

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
    const now = Date.now();
    const currentPosition = positionRef.current;
    const nextNeeds = needsRef.current;
    const nextCursor = cursorRef.current;
    const nextObjects = objectsRef.current;
    const memory = memoryRef.current;

    const isTired = nextNeeds.energy < 20;
    const isHungry = nextNeeds.hunger > 80;
    const isBored = nextNeeds.fun > 60;

    const setBehaviorWithAge = (nextBehavior: DetailedCatBehavior) => {
      setBehavior(nextBehavior);
      behaviorAgeRef.current = now;
    };

    if (isTired) {
      setBehaviorWithAge('sleeping');
      setTarget(null);
      return 7000 + Math.random() * 6000;
    }

    const liveObject = findLiveObject(
      nextObjects,
      now,
      currentPosition,
      memory.lastToyId,
      memory.repeatCooldownUntil
    );

    if (liveObject) {
      setBehaviorWithAge('playing');
      setTarget({
        x: liveObject.x,
        y: liveObject.y,
        objectId: liveObject.id,
        objectType: liveObject.type,
        intensity: liveObject.intensity,
        activeUntil: liveObject.activeUntil,
      });
      return 1800 + Math.random() * 1600;
    }

    if (nextCursor && cat.mood === 'curious') {
      const distance = Math.hypot(nextCursor.x - currentPosition.x, nextCursor.y - currentPosition.y);
      if (distance < 20) {
        setBehaviorWithAge('curious');
        setTarget({ x: nextCursor.x, y: nextCursor.y, intensity: 0.8 });
        return 1600 + Math.random() * 1600;
      }
    }

    if ((isHungry || isBored) && nextObjects.length > 0 && Math.random() < moodRoll(cat.mood)) {
      const object = nextObjects[Math.floor(Math.random() * nextObjects.length)];
      setBehaviorWithAge('playing');
      setTarget({ x: object.x, y: object.y, objectId: object.id, objectType: object.type, intensity: 0.6 });
      return 2200 + Math.random() * 1800;
    }

    const roll = Math.random();
    if (roll < 0.34) {
      setBehaviorWithAge('wandering');
      setTarget({
        x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
        intensity: 0.35,
      });
      return 2600 + Math.random() * 2200;
    }

    if (roll < 0.56) {
      setBehaviorWithAge('grooming');
      setTarget(null);
      return 2200 + Math.random() * 1800;
    }

    if (roll < 0.76) {
      setBehaviorWithAge('sitting');
      setTarget(null);
      return 2200 + Math.random() * 2200;
    }

    setBehaviorWithAge('idle');
    setTarget(null);
    return 1800 + Math.random() * 2100;
  }, [bounds.maxX, bounds.maxY, bounds.minX, bounds.minY, cat.mood]);

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
    const scheduleBlink = () => {
      const expression = getEyeExpression({ mood: cat.mood, behavior: behaviorRef.current, variant: cat.variant });
      const cadence = behaviorRef.current === 'sleeping' ? 6800 : 2200;
      const jitter = behaviorRef.current === 'sleeping' ? 1600 : 2600;
      const interval = cadence + Math.random() * jitter;

      blinkTimerRef.current = setTimeout(() => {
        if (behaviorRef.current !== 'sleeping') {
          setBlinkState(0.12);
          blinkCloseRef.current = setTimeout(() => setBlinkState(expression.blinkRatio), 160);
        }
        scheduleBlink();
      }, interval);
    };

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }
      if (blinkCloseRef.current) {
        clearTimeout(blinkCloseRef.current);
      }
    };
  }, [cat.mood, cat.variant]);

  useEffect(() => {
    const update = (now: number) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = now;
      }

      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      const currentBehavior = behaviorRef.current;
      const liveCursor = cursorRef.current;
      const nextTarget = targetRef.current;

      const moving =
        currentBehavior === 'wandering' ||
        currentBehavior === 'playing' ||
        currentBehavior === 'curious';

      let activeTarget = nextTarget;
      if (currentBehavior === 'curious' && liveCursor) {
        activeTarget = {
          x: liveCursor.x,
          y: liveCursor.y,
          intensity: 0.85,
        };
      }

      const motionConfig = {
        ...DEFAULT_MOTION_CONFIG,
        acceleration: currentBehavior === 'playing' ? 10 : currentBehavior === 'curious' ? 8.6 : 7,
        maxSpeed: reducedMotion
          ? currentBehavior === 'playing'
            ? 12
            : 9
          : currentBehavior === 'playing'
            ? 21
            : currentBehavior === 'curious'
              ? 16
              : 13,
        arrivalRadius: currentBehavior === 'playing' ? 1.5 : 2.1,
        maxStep: reducedMotion ? 1.2 : 1.55,
      };

      if (moving && activeTarget) {
        const nextMotion = integrateMotion(motionRef.current, activeTarget, bounds, dt, motionConfig);
        motionRef.current = nextMotion;
        setPosition({ x: nextMotion.x, y: nextMotion.y });

        const nextFacing = resolveFacing(facingRef.current, nextMotion.vx, motionConfig.facingHysteresis);
        if (nextFacing !== facingRef.current) {
          facingRef.current = nextFacing;
          setFacing(nextFacing);
        }

        const distance = Math.hypot(activeTarget.x - nextMotion.x, activeTarget.y - nextMotion.y);
        if (distance < motionConfig.arrivalRadius + 0.35 && nextTarget?.objectId) {
          memoryRef.current = {
            lastToyId: nextTarget.objectId,
            repeatCooldownUntil: Date.now() + 2600,
          };
        }

        if (distance < motionConfig.arrivalRadius + 0.2 && Date.now() - behaviorAgeRef.current > 850) {
          if (currentBehavior === 'playing') {
            setBehavior('idle');
          }
          if (currentBehavior !== 'curious') {
            setTarget(null);
          }
        }
      } else {
        motionRef.current = {
          ...motionRef.current,
          vx: smoothValue(motionRef.current.vx, 0, 8, dt),
          vy: smoothValue(motionRef.current.vy, 0, 8, dt),
        };
      }

      const expression = getEyeExpression({
        mood: cat.mood,
        behavior: currentBehavior,
        variant: cat.variant,
        isHovered,
        isPetted,
      });

      const focusPoint = liveCursor ?? activeTarget ?? {
        x: motionRef.current.x + (facingRef.current === 'left' ? -2 : 2),
        y: motionRef.current.y - 1,
      };
      const normalized = normalizeFocus(
        focusPoint.x - motionRef.current.x,
        focusPoint.y - motionRef.current.y,
        reducedMotion ? 1.8 : 2.8
      );
      const saccade = Math.sin(now / (280 / expression.microSaccadeSpeed) + cat.id.length) * 0.18;
      const blinkCompensation = expression.blinkRatio < 0.2 ? 0.25 : 1;

      eyeRef.current = {
        x: smoothValue(
          eyeRef.current.x,
          (normalized.x + saccade) * expression.focusOffset * blinkCompensation,
          reducedMotion ? 6 : 11,
          dt
        ),
        y: smoothValue(
          eyeRef.current.y,
          normalized.y * expression.focusOffset * blinkCompensation,
          reducedMotion ? 6 : 11,
          dt
        ),
      };

      setEyeOffset({ x: eyeRef.current.x, y: eyeRef.current.y });

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = 0;
    };
  }, [
    bounds,
    cat.id.length,
    cat.mood,
    cat.variant,
    isHovered,
    isPetted,
    reducedMotion,
  ]);

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

    if (petReleaseTimerRef.current) {
      clearTimeout(petReleaseTimerRef.current);
    }
    if (heartReleaseTimerRef.current) {
      clearTimeout(heartReleaseTimerRef.current);
    }

    petReleaseTimerRef.current = setTimeout(() => setIsPetted(false), 550);
    heartReleaseTimerRef.current = setTimeout(() => setShowHeart(false), 1400);
  }, [onPet]);

  useEffect(() => {
    return () => {
      if (petReleaseTimerRef.current) {
        clearTimeout(petReleaseTimerRef.current);
      }
      if (heartReleaseTimerRef.current) {
        clearTimeout(heartReleaseTimerRef.current);
      }
    };
  }, []);

  const walkBob =
    behavior === 'wandering' || behavior === 'playing' || behavior === 'curious'
      ? Math.sin((clockMs / 100) * (reducedMotion ? 0.5 : 1)) * (reducedMotion ? 0.9 : 1.8)
      : 0;
  const tailWag =
    Math.sin((clockMs / 220) * (reducedMotion ? 0.55 : 1)) *
    (behavior === 'playing' ? (reducedMotion ? 14 : 30) : reducedMotion ? 7 : 12);
  const breathe = Math.sin(clockMs / 900) * (reducedMotion ? 0.4 : 0.9);

  const eyeExpression = useMemo(
    () =>
      getEyeExpression({
        mood: cat.mood,
        behavior,
        variant: cat.variant,
        isHovered,
        isPetted,
        isSleeping: behavior === 'sleeping',
      }),
    [behavior, cat.mood, cat.variant, isHovered, isPetted]
  );

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
    eyeExpression,
    eyeOffset,
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


