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
  type ReactNode,
} from 'react';
import { WorldState, WorldAction, RoomId, CatMood, createInitialState } from './world-types';
import { worldReducer, canAccessDream } from './world-reducer';

interface WorldContextValue {
  state: WorldState;
  dispatch: React.Dispatch<WorldAction>;
  /** Navigate to a room with transition */
  navigateTo: (room: RoomId) => void;
  /** Pet a cat */
  petCat: (catId: string) => void;
  /** Follow a wandering cat to their room */
  followCat: (catId: string) => void;
  /** Register a drag interaction */
  registerDrag: (objectId: string) => void;
  /** Check if dream room is accessible */
  canAccessDreamRoom: () => boolean;
  /** Get cats in current room */
  catsInCurrentRoom: () => WorldState['cats'];
  /** Get cats that are wandering away */
  wanderingCats: () => WorldState['cats'];
}

const WorldContext = createContext<WorldContextValue | null>(null);

const STORAGE_KEY = 'purr-prism-world';

interface WorldProviderProps {
  children: ReactNode;
}

export function WorldProvider({ children }: WorldProviderProps) {
  const [state, dispatch] = useReducer(worldReducer, null, (): WorldState => {
    // Initialize with saved state if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Restore Sets from arrays with proper typing
          const restored: WorldState = {
            ...createInitialState(),
            discovery: {
              ...createInitialState().discovery,
              visitedRooms: new Set<RoomId>(parsed.discovery?.visitedRooms || ['sanctuary']),
              secretsFound: new Set<string>(parsed.discovery?.secretsFound || []),
              discoveredObjects: new Set<string>(parsed.discovery?.discoveredObjects || []),
              petCount: parsed.discovery?.petCount || 0,
              dragCount: parsed.discovery?.dragCount || 0,
              followedCatCount: parsed.discovery?.followedCatCount || 0,
              deepIdleReached: parsed.discovery?.deepIdleReached || false,
            },
            temporal: {
              ...createInitialState().temporal,
              previousVisits: (parsed.temporal?.previousVisits || 0) + 1,
              lastVisit: parsed.temporal?.sessionStart || null,
            },
          };
          return restored;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return createInitialState();
  });

  const lastInteractionRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  // Track idle time
  useEffect(() => {
    const handleActivity = () => {
      lastInteractionRef.current = Date.now();
      if (state.temporal.isIdle) {
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
  }, [state.temporal.isIdle]);

  // Main tick loop - updates idle time, session duration, cat behaviors
  // Use refs to track state without causing re-renders
  const isDeepIdleRef = useRef(false);
  
  useEffect(() => {
    isDeepIdleRef.current = state.temporal.isDeepIdle;
  }, [state.temporal.isDeepIdle]);
  
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const idleTime = now - lastInteractionRef.current;
      const sessionDuration = now - sessionStartRef.current;

      // Batch updates to reduce re-renders
      dispatch({ type: 'UPDATE_IDLE', idleTime });
      dispatch({ type: 'UPDATE_SESSION', duration: sessionDuration });

      // Trigger deep idle state change only when crossing thresholds
      if (idleTime > 120000 && !isDeepIdleRef.current) {
        dispatch({ type: 'SET_DEEP_IDLE', isDeep: true });
      } else if (idleTime < 5000 && isDeepIdleRef.current) {
        dispatch({ type: 'SET_DEEP_IDLE', isDeep: false });
      }
    };

    const interval = setInterval(tick, 2000); // Slower tick to reduce updates
    return () => clearInterval(interval);
  }, []); // Empty deps - runs once, uses refs for state

  // Persist state on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
        // Ignore storage errors
      }
    }
  }, [state.discovery, state.temporal.previousVisits]);

  const navigateTo = useCallback((room: RoomId) => {
    dispatch({ type: 'NAVIGATE_TO', room });
    // Complete transition after animation
    setTimeout(() => {
      dispatch({ type: 'TRANSITION_COMPLETE' });
    }, 800);
  }, []);

  const petCat = useCallback((catId: string) => {
    dispatch({ type: 'PET_CAT', catId });
  }, []);

  const followCat = useCallback((catId: string) => {
    dispatch({ type: 'FOLLOW_CAT', catId });
    setTimeout(() => {
      dispatch({ type: 'TRANSITION_COMPLETE' });
    }, 800);
  }, []);

  const registerDrag = useCallback((objectId: string) => {
    dispatch({ type: 'DRAG_OBJECT', objectId });
    if (!state.discovery.discoveredObjects.has(objectId)) {
      dispatch({ type: 'DISCOVER_OBJECT', objectId });
    }
  }, [state.discovery.discoveredObjects]);

  const canAccessDreamRoom = useCallback(() => {
    return canAccessDream(state);
  }, [state.discovery.petCount, state.discovery.secretsFound.size]);

  const catsInCurrentRoom = useCallback(() => {
    // Sanctuary and Playroom share cats - they can roam between both
    if (state.currentRoom === 'sanctuary' || state.currentRoom === 'playroom') {
      return state.cats.filter(cat => 
        cat.currentRoom === 'sanctuary' || cat.currentRoom === 'playroom'
      );
    }
    return state.cats.filter(cat => cat.currentRoom === state.currentRoom);
  }, [state.cats, state.currentRoom]);

  const wanderingCats = useCallback(() => {
    return state.cats.filter(cat => 
      cat.isWandering && cat.currentRoom !== state.currentRoom
    );
  }, [state.cats, state.currentRoom]);

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

  return (
    <WorldContext.Provider value={value}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorld must be used within a WorldProvider');
  }
  return context;
}

export { canAccessDream };
