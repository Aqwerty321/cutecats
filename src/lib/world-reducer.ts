/**
 * World Reducer
 * 
 * Manages all state transitions for the sanctuary world.
 * Every interaction leaves a trace.
 */

import { WorldState, WorldAction, CatMood } from './world-types';

export function worldReducer(state: WorldState, action: WorldAction): WorldState {
  switch (action.type) {
    case 'NAVIGATE_TO': {
      if (action.room === state.currentRoom || state.isTransitioning) {
        return state;
      }
      
      // Can only access dream room if conditions are met
      if (action.room === 'dream' && !canAccessDream(state)) {
        return state;
      }

      return {
        ...state,
        previousRoom: state.currentRoom,
        currentRoom: action.room,
        isTransitioning: true,
        discovery: {
          ...state.discovery,
          visitedRooms: new Set([...state.discovery.visitedRooms, action.room]),
        },
      };
    }

    case 'TRANSITION_COMPLETE': {
      return {
        ...state,
        isTransitioning: false,
      };
    }

    case 'PET_CAT': {
      const cats = state.cats.map(cat => {
        if (cat.id !== action.catId) return cat;
        
        const newPetCount = cat.petCount + 1;
        let newMood: CatMood = cat.mood;
        
        // Mood evolution based on pets
        if (newPetCount >= 10) {
          newMood = 'affectionate';
        } else if (newPetCount >= 5) {
          newMood = 'calm';
        } else if (newPetCount >= 2) {
          newMood = 'curious';
        }

        return {
          ...cat,
          petCount: newPetCount,
          mood: newMood,
          lastInteraction: Date.now(),
        };
      });

      // Calculate world mood based on all cats
      const avgMood = calculateWorldMood(cats);

      return {
        ...state,
        cats,
        worldMood: avgMood,
        discovery: {
          ...state.discovery,
          petCount: state.discovery.petCount + 1,
        },
        temporal: {
          ...state.temporal,
          idleTime: 0,
          isIdle: false,
          isDeepIdle: false,
        },
      };
    }

    case 'CAT_WANDER': {
      const cats = state.cats.map(cat => {
        if (cat.id !== action.catId) return cat;
        return {
          ...cat,
          currentRoom: action.toRoom,
          position: action.position,
          isWandering: true,
        };
      });

      return { ...state, cats };
    }

    case 'CAT_MOOD_CHANGE': {
      const cats = state.cats.map(cat => {
        if (cat.id !== action.catId) return cat;
        return { ...cat, mood: action.mood };
      });

      return {
        ...state,
        cats,
        worldMood: calculateWorldMood(cats),
      };
    }

    case 'FOLLOW_CAT': {
      const cat = state.cats.find(c => c.id === action.catId);
      if (!cat || cat.currentRoom === state.currentRoom) {
        return state;
      }

      return {
        ...state,
        previousRoom: state.currentRoom,
        currentRoom: cat.currentRoom,
        isTransitioning: true,
        discovery: {
          ...state.discovery,
          followedCatCount: state.discovery.followedCatCount + 1,
          visitedRooms: new Set([...state.discovery.visitedRooms, cat.currentRoom]),
        },
      };
    }

    case 'DRAG_OBJECT': {
      return {
        ...state,
        discovery: {
          ...state.discovery,
          dragCount: state.discovery.dragCount + 1,
        },
        temporal: {
          ...state.temporal,
          idleTime: 0,
          isIdle: false,
        },
      };
    }

    case 'DISCOVER_SECRET': {
      return {
        ...state,
        discovery: {
          ...state.discovery,
          secretsFound: new Set([...state.discovery.secretsFound, action.secretId]),
        },
      };
    }

    case 'DISCOVER_OBJECT': {
      return {
        ...state,
        discovery: {
          ...state.discovery,
          discoveredObjects: new Set([...state.discovery.discoveredObjects, action.objectId]),
        },
      };
    }

    case 'UPDATE_IDLE': {
      const isIdle = action.idleTime > 10000; // 10 seconds
      const isDeepIdle = action.idleTime > 120000; // 2 minutes

      return {
        ...state,
        temporal: {
          ...state.temporal,
          idleTime: action.idleTime,
          isIdle,
          isDeepIdle,
        },
        discovery: {
          ...state.discovery,
          deepIdleReached: state.discovery.deepIdleReached || isDeepIdle,
        },
      };
    }

    case 'SET_DEEP_IDLE': {
      // Cats get sleepy when user is idle
      const cats = action.isDeep
        ? state.cats.map(cat => ({
            ...cat,
            mood: 'sleepy' as CatMood,
          }))
        : state.cats;

      return {
        ...state,
        cats,
        worldMood: action.isDeep ? 'sleepy' : state.worldMood,
        motionSpeed: action.isDeep ? 0.3 : 1,
        colorTemperature: action.isDeep ? 0.2 : state.colorTemperature,
      };
    }

    case 'UPDATE_SESSION': {
      return {
        ...state,
        temporal: {
          ...state.temporal,
          sessionDuration: action.duration,
        },
      };
    }

    case 'SET_WORLD_MOOD': {
      const moodToSpeed: Record<CatMood, number> = {
        calm: 1,
        playful: 1.3,
        sleepy: 0.5,
        curious: 1.1,
        affectionate: 0.8,
      };

      const moodToTemp: Record<CatMood, number> = {
        calm: 0.5,
        playful: 0.7,
        sleepy: 0.2,
        curious: 0.6,
        affectionate: 0.4,
      };

      return {
        ...state,
        worldMood: action.mood,
        motionSpeed: moodToSpeed[action.mood],
        colorTemperature: moodToTemp[action.mood],
      };
    }

    case 'TICK': {
      // Called every frame - handle cat wandering logic
      const now = Date.now();
      const cats = state.cats.map(cat => {
        // Random chance to start wandering if not interacted with recently
        const timeSinceInteraction = now - cat.lastInteraction;
        
        if (cat.isWandering) {
          // Small chance to stop wandering
          if (Math.random() < 0.001) {
            return { ...cat, isWandering: false };
          }
        } else if (timeSinceInteraction > 30000 && Math.random() < 0.0005) {
          // After 30s of no interaction, cats might wander
          const rooms: Array<'sanctuary' | 'playroom' | 'gallery'> = ['sanctuary', 'playroom', 'gallery'];
          const otherRooms = rooms.filter(r => r !== cat.currentRoom);
          const targetRoom = otherRooms[Math.floor(Math.random() * otherRooms.length)];
          
          return {
            ...cat,
            isWandering: true,
            currentRoom: targetRoom,
            position: {
              x: 20 + Math.random() * 60,
              y: 30 + Math.random() * 40,
            },
          };
        }
        
        return cat;
      });

      return { ...state, cats };
    }

    default:
      return state;
  }
}

function calculateWorldMood(cats: WorldState['cats']): CatMood {
  const moodPriority: CatMood[] = ['affectionate', 'sleepy', 'playful', 'curious', 'calm'];
  
  for (const mood of moodPriority) {
    if (cats.some(cat => cat.mood === mood)) {
      return mood;
    }
  }
  
  return 'calm';
}

function canAccessDream(state: WorldState): boolean {
  // Dream room unlocks when:
  // 1. User has visited all other rooms
  // 2. AND (has petted cats 5+ times OR reached deep idle)
  const hasVisitedAll = 
    state.discovery.visitedRooms.has('sanctuary') &&
    state.discovery.visitedRooms.has('playroom') &&
    state.discovery.visitedRooms.has('gallery');
  
  const hasPettedEnough = state.discovery.petCount >= 5;
  const hasIdled = state.discovery.deepIdleReached;
  
  return hasVisitedAll && (hasPettedEnough || hasIdled);
}

export { canAccessDream };
