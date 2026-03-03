/**
 * World Context Provider
 *
 * The heart of the sanctuary. Provides global state to all rooms,
 * handles temporal tracking, and persists discovery progress.
 */
'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { WorldState, WorldAction, RoomId, createInitialState } from './world-types';
import { worldReducer, canAccessDream } from './world-reducer';

interface WorldContextValue {
  state: WorldState;
  dispatch: React.Dispatch<WorldAction>;
  navigateTo: (room: RoomId) => void;
  petCat: (catId: string) => void;
  followCat: (catId: string) => void;
  registerDrag: (objectId: string) => void;
  canAccessDreamRoom: boolean;
  catsInCurrentRoom: WorldState['cats'];
  wanderingCats: WorldState['cats'];
}

const WorldContext = createContext<WorldContextValue | null>(null);

const STORAGE_KEY = 'purr-prism-world';
const TRANSITION_MS = 800;
const DEEP_IDLE_MS = 120000;
const WAKE_IDLE_MS = 5000;

interface WorldProviderProps {
  children: ReactNode;
}

function restoreStateFromStorage(): WorldState {
  const baseState = createInitialState();

  if (typeof window === 'undefined') {
    return baseState;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return baseState;
    }

    const parsed = JSON.parse(saved);

    return {
      ...baseState,
      discovery: {
        ...baseState.discovery,
        visitedRooms: new Set<RoomId>(parsed.discovery?.visitedRooms || ['sanctuary']),
        secretsFound: new Set<string>(parsed.discovery?.secretsFound || []),
        discoveredObjects: new Set<string>(parsed.discovery?.discoveredObjects || []),
        petCount: parsed.discovery?.petCount || 0,
        dragCount: parsed.discovery?.dragCount || 0,
        followedCatCount: parsed.discovery?.followedCatCount || 0,
        deepIdleReached: parsed.discovery?.deepIdleReached || false,
      },
      temporal: {
        ...baseState.temporal,
        previousVisits: (parsed.temporal?.previousVisits || 0) + 1,
        lastVisit: parsed.temporal?.sessionStart || null,
      },
    };
  } catch {
    return baseState;
  }
}

export function WorldProvider({ children }: WorldProviderProps) {
  const [state, dispatch] = useReducer(worldReducer, undefined, restoreStateFromStorage);

  const lastInteractionRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);
  const isDeepIdleRef = useRef(false);

  useEffect(() => {
    const now = Date.now();
    if (!lastInteractionRef.current) {
      lastInteractionRef.current = now;
    }
    if (!sessionStartRef.current) {
      sessionStartRef.current = now;
    }
  }, []);

  useEffect(() => {
    isIdleRef.current = state.temporal.isIdle;
    isDeepIdleRef.current = state.temporal.isDeepIdle;
  }, [state.temporal.isIdle, state.temporal.isDeepIdle]);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const scheduleTransitionComplete = useCallback(() => {
    clearTransitionTimer();
    transitionTimerRef.current = setTimeout(() => {
      dispatch({ type: 'TRANSITION_COMPLETE' });
      transitionTimerRef.current = null;
    }, TRANSITION_MS);
  }, [clearTransitionTimer]);

  useEffect(() => {
    return () => {
      clearTransitionTimer();
    };
  }, [clearTransitionTimer]);

  useEffect(() => {
    const handleActivity = () => {
      lastInteractionRef.current = Date.now();
      if (isIdleRef.current) {
        dispatch({ type: 'UPDATE_IDLE', idleTime: 0 });
      }
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (!lastInteractionRef.current) {
        lastInteractionRef.current = now;
      }
      if (!sessionStartRef.current) {
        sessionStartRef.current = now;
      }

      const idleTime = now - lastInteractionRef.current;
      const sessionDuration = now - sessionStartRef.current;

      dispatch({ type: 'UPDATE_IDLE', idleTime });
      dispatch({ type: 'UPDATE_SESSION', duration: sessionDuration });
      dispatch({ type: 'TICK' });

      if (idleTime > DEEP_IDLE_MS && !isDeepIdleRef.current) {
        dispatch({ type: 'SET_DEEP_IDLE', isDeep: true });
      } else if (idleTime < WAKE_IDLE_MS && isDeepIdleRef.current) {
        dispatch({ type: 'SET_DEEP_IDLE', isDeep: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const toSave = {
        discovery: {
          visitedRooms: [...state.discovery.visitedRooms],
          secretsFound: [...state.discovery.secretsFound],
          discoveredObjects: [...state.discovery.discoveredObjects],
          petCount: state.discovery.petCount,
          dragCount: state.discovery.dragCount,
          followedCatCount: state.discovery.followedCatCount,
          deepIdleReached: state.discovery.deepIdleReached,
        },
        temporal: {
          previousVisits: state.temporal.previousVisits,
          sessionStart: sessionStartRef.current,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage errors.
    }
  }, [state.discovery, state.temporal.previousVisits]);

  const navigateTo = useCallback(
    (room: RoomId) => {
      dispatch({ type: 'NAVIGATE_TO', room });
      scheduleTransitionComplete();
    },
    [scheduleTransitionComplete]
  );

  const petCat = useCallback((catId: string) => {
    dispatch({ type: 'PET_CAT', catId });
  }, []);

  const followCat = useCallback(
    (catId: string) => {
      dispatch({ type: 'FOLLOW_CAT', catId });
      scheduleTransitionComplete();
    },
    [scheduleTransitionComplete]
  );

  const registerDrag = useCallback((objectId: string) => {
    dispatch({ type: 'DRAG_OBJECT', objectId });
    dispatch({ type: 'DISCOVER_OBJECT', objectId });
  }, []);

  const canAccessDreamRoom = useMemo(() => canAccessDream(state), [state]);

  const catsInCurrentRoom = useMemo(() => {
    if (state.currentRoom === 'sanctuary' || state.currentRoom === 'playroom') {
      return state.cats.filter(
        (cat) => cat.currentRoom === 'sanctuary' || cat.currentRoom === 'playroom'
      );
    }

    return state.cats.filter((cat) => cat.currentRoom === state.currentRoom);
  }, [state.cats, state.currentRoom]);

  const wanderingCats = useMemo(
    () => state.cats.filter((cat) => cat.isWandering && cat.currentRoom !== state.currentRoom),
    [state.cats, state.currentRoom]
  );

  const value: WorldContextValue = {
    state,
    dispatch,
    navigateTo,
    petCat,
    followCat,
    registerDrag,
    canAccessDreamRoom,
    catsInCurrentRoom,
    wanderingCats,
  };

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorld must be used within a WorldProvider');
  }
  return context;
}

export { canAccessDream };