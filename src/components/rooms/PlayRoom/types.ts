export interface PlayToy {
  id: string;
  x: number;
  y: number;
  type: 'yarn' | 'ball';
  color: 'lilac' | 'peach' | 'mint';
  size: number;
}

export interface EffectPoint {
  id: number;
  x: number;
  y: number;
}

