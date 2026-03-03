import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoomTransition } from '@/components/RoomTransition';

const mockState = { isTransitioning: false };

vi.mock('@/lib', () => ({
  useWorld: () => ({ state: mockState }),
}));

describe('RoomTransition', () => {
  it('renders children when not transitioning', () => {
    mockState.isTransitioning = false;
    render(
      <RoomTransition>
        <div>room-content</div>
      </RoomTransition>
    );

    expect(screen.getByText('room-content')).toBeInTheDocument();
  });

  it('keeps children mounted while transition styles apply', () => {
    mockState.isTransitioning = true;
    render(
      <RoomTransition>
        <div>room-content</div>
      </RoomTransition>
    );

    expect(screen.getByText('room-content')).toBeInTheDocument();
  });
});

