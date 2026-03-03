import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiscoveryToast } from '@/components/DiscoveryToast';

const mockState = {
  discovery: {
    petCount: 0,
    dragCount: 0,
    visitedRooms: new Set(['sanctuary']),
    followedCatCount: 0,
    deepIdleReached: false,
  },
};

vi.mock('@/lib', () => ({
  getDiscoveryMilestones: (state: typeof mockState) => {
    if (state.discovery.petCount === 1) {
      return [{ id: 'first-pet', icon: 'heart', message: 'First trust unlocked.' }];
    }
    return [];
  },
  useWorld: () => ({ state: mockState }),
}));

describe('DiscoveryToast', () => {
  it('shows first pet toast milestone', () => {
    mockState.discovery.petCount = 1;

    render(<DiscoveryToast />);

    expect(screen.getByText('First trust unlocked.')).toBeInTheDocument();
  });
});
