import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Secret } from '@/components/Secret';

const dispatch = vi.fn();
const mockState = {
  discovery: {
    petCount: 0,
    dragCount: 0,
    secretsFound: new Set<string>(),
  },
  temporal: {
    sessionDuration: 0,
    isDeepIdle: false,
    previousVisits: 0,
  },
};

vi.mock('@/lib', () => ({
  useWorld: () => ({ state: mockState, dispatch }),
}));

describe('Secret', () => {
  afterEach(() => {
    dispatch.mockReset();
    mockState.discovery.secretsFound = new Set<string>();
  });

  it('stays hidden before threshold', () => {
    mockState.discovery.petCount = 1;
    render(
      <Secret id="pet-secret" revealCondition="pets" threshold={3}>
        <div>hidden-message</div>
      </Secret>
    );
    expect(screen.queryByText('hidden-message')).not.toBeInTheDocument();
  });

  it('reveals and dispatches discovery once threshold is met', () => {
    vi.useFakeTimers();
    mockState.discovery.petCount = 3;

    render(
      <Secret id="pet-secret" revealCondition="pets" threshold={3}>
        <div>secret-message</div>
      </Secret>
    );

    expect(screen.getByText('secret-message')).toBeInTheDocument();
    vi.advanceTimersByTime(1000);
    expect(dispatch).toHaveBeenCalledWith({ type: 'DISCOVER_SECRET', secretId: 'pet-secret' });
    vi.useRealTimers();
  });
});

