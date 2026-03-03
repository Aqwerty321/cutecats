import type { CatState } from '@/lib';

export type DetailedCatBehavior =
  | 'idle'
  | 'wandering'
  | 'sitting'
  | 'sleeping'
  | 'curious'
  | 'playing'
  | 'grooming';

export interface DetailedCatBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface InteractableObject {
  id: string;
  x: number;
  y: number;
  type: string;
}

export interface DetailedCatProps {
  cat: CatState;
  onPet?: () => void;
  bounds?: DetailedCatBounds;
  cursorPosition?: { x: number; y: number } | null;
  objects?: InteractableObject[];
}

