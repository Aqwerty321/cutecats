import type { RoomId, CatMood, WorldState } from "./world-types";

export interface RoomNarrative {
  title: string;
  subtitle: string;
  helper: string;
  footer: string;
}

export const ROOM_COPY: Record<RoomId, RoomNarrative> = {
  sanctuary: {
    title: "Purr & Prism",
    subtitle: "Candy Arcade Sanctuary",
    helper: "Move softly, pet the cats, and follow curious footsteps.",
    footer: "The sanctuary rewards patience and gentle play.",
  },
  playroom: {
    title: "Playroom Circuit",
    subtitle: "Arcade toys, bubbles, and chaos in balance",
    helper: "Drag toys, pop bubbles, and energize the room.",
    footer: "Every playful action nudges the cats into new moods.",
  },
  gallery: {
    title: "Companion Gallery",
    subtitle: "Meet each cat and tune the world mood",
    helper: "Select a companion card and explore their personality.",
    footer: "Affection, curiosity, and calm are all collectible states.",
  },
  dream: {
    title: "Dream Arcade",
    subtitle: "Unlocked by trust, stillness, and return",
    helper: "Stay, breathe, and let the world settle.",
    footer: "When you are ready, drift back toward the sanctuary.",
  },
};

export const ROOM_PORTAL_HINTS: Record<RoomId, Partial<Record<RoomId, string>>> = {
  sanctuary: {
    playroom: 'Follow the neon toys',
    gallery: 'Meet the full cast',
    dream: 'Descend into dream mode',
  },
  playroom: {
    sanctuary: 'Return to soft calm',
    gallery: 'Browse companion cards',
    dream: 'Drop into the dream floor',
  },
  gallery: {
    sanctuary: 'Back to sanctuary',
    playroom: 'Play loop online',
    dream: 'Enter dream arcade',
  },
  dream: {
    sanctuary: 'Wake to sanctuary',
  },
};

export interface SecretCopy {
  label: string;
}

export const SECRET_COPY: Record<string, SecretCopy> = {
  "sanctuary-patience": { label: "Patient Soul" },
  "sanctuary-kindness": { label: "Kindness Logged" },
  "sanctuary-return": { label: "Regular Visitor" },
  "playroom-fidget": { label: "Fidget Runner" },
  "playroom-master": { label: "Arcade Master" },
  "gallery-friend": { label: "Friend of Cats" },
  "gallery-observer": { label: "Quiet Observer" },
  "gallery-collector": { label: "Memory Collector" },
  "dream-deep": { label: "Dream Keeper" },
  "dream-found": { label: "True Explorer" },
  "dream-touched": { label: "Warmth Shared" },
};

export interface ToastMilestone {
  id: string;
  icon: string;
  message: string;
}

export function getDiscoveryMilestones(state: WorldState): ToastMilestone[] {
  const milestones: ToastMilestone[] = [];

  if (state.discovery.petCount === 1) {
    milestones.push({ id: "first-pet", icon: "heart", message: "First trust unlocked." });
  }
  if (state.discovery.petCount === 5) {
    milestones.push({ id: "five-pets", icon: "bond", message: "Companions are opening up." });
  }
  if (state.discovery.petCount === 10) {
    milestones.push({ id: "ten-pets", icon: "shine", message: "Affection level increased." });
  }
  if (state.discovery.dragCount === 1) {
    milestones.push({ id: "first-drag", icon: "toy", message: "Play system online." });
  }
  if (state.discovery.dragCount === 10) {
    milestones.push({ id: "ten-drags", icon: "spark", message: "Arcade flow detected." });
  }
  if (
    state.discovery.visitedRooms.has("sanctuary") &&
    state.discovery.visitedRooms.has("playroom") &&
    state.discovery.visitedRooms.has("gallery")
  ) {
    milestones.push({ id: "explorer", icon: "map", message: "All core rooms discovered." });
  }
  if (state.discovery.followedCatCount === 1) {
    milestones.push({ id: "first-follow", icon: "path", message: "You followed a cat trail." });
  }
  if (state.discovery.deepIdleReached) {
    milestones.push({ id: "deep-idle", icon: "moon", message: "Stillness resonance reached." });
  }

  const canDream =
    state.discovery.visitedRooms.size >= 3 &&
    (state.discovery.petCount >= 5 || state.discovery.deepIdleReached);

  if (canDream) {
    milestones.push({ id: "dream-unlocked", icon: "dream", message: "Dream Arcade portal unlocked." });
  }

  return milestones;
}

export const MOOD_LABEL: Record<CatMood, string> = {
  calm: "Calm",
  playful: "Playful",
  sleepy: "Sleepy",
  curious: "Curious",
  affectionate: "Affectionate",
};
