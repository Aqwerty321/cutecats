export interface MotionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface MotionVector {
  x: number;
  y: number;
}

export interface MotionState extends MotionVector {
  vx: number;
  vy: number;
}

export interface MotionConfig {
  acceleration: number;
  damping: number;
  maxSpeed: number;
  arrivalRadius: number;
  maxStep: number;
  facingHysteresis: number;
}

export const DEFAULT_MOTION_CONFIG: MotionConfig = {
  acceleration: 8,
  damping: 0.86,
  maxSpeed: 20,
  arrivalRadius: 2,
  maxStep: 1.4,
  facingHysteresis: 0.24,
};

export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function arrivalSpeed(distance: number, maxSpeed: number, arrivalRadius: number): number {
  if (distance <= arrivalRadius) {
    return 0;
  }

  const eased = clamp((distance - arrivalRadius) / (arrivalRadius * 4), 0.08, 1);
  return maxSpeed * eased;
}

export function resolveFacing(
  current: 'left' | 'right',
  velocityX: number,
  hysteresis: number
): 'left' | 'right' {
  if (Math.abs(velocityX) < hysteresis) {
    return current;
  }
  return velocityX > 0 ? 'right' : 'left';
}

export function integrateMotion(
  state: MotionState,
  target: MotionVector,
  bounds: MotionBounds,
  dtSeconds: number,
  config: MotionConfig = DEFAULT_MOTION_CONFIG
): MotionState {
  const dt = Math.max(0.0001, Math.min(0.05, dtSeconds));

  const dx = target.x - state.x;
  const dy = target.y - state.y;
  const distance = Math.hypot(dx, dy);

  let vx = state.vx;
  let vy = state.vy;

  if (distance > 0.0001) {
    const desiredSpeed = arrivalSpeed(distance, config.maxSpeed, config.arrivalRadius);
    const invDistance = 1 / distance;
    const desiredVx = dx * invDistance * desiredSpeed;
    const desiredVy = dy * invDistance * desiredSpeed;

    const steer = config.acceleration * dt;
    vx += (desiredVx - vx) * steer;
    vy += (desiredVy - vy) * steer;
  }

  const damping = Math.pow(config.damping, dt * 60);
  vx *= damping;
  vy *= damping;

  let stepX = vx * dt;
  let stepY = vy * dt;
  const stepDistance = Math.hypot(stepX, stepY);

  if (stepDistance > config.maxStep) {
    const stepScale = config.maxStep / stepDistance;
    stepX *= stepScale;
    stepY *= stepScale;
  }

  const x = clamp(state.x + stepX, bounds.minX, bounds.maxX);
  const y = clamp(state.y + stepY, bounds.minY, bounds.maxY);

  if (x === bounds.minX || x === bounds.maxX) {
    vx *= 0.45;
  }
  if (y === bounds.minY || y === bounds.maxY) {
    vy *= 0.45;
  }

  return { x, y, vx, vy };
}

export function smoothValue(current: number, target: number, dampFactor: number, dtSeconds: number): number {
  const weight = 1 - Math.exp(-Math.max(0.0001, dampFactor) * dtSeconds);
  return current + (target - current) * weight;
}
