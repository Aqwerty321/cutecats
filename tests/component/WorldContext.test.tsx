import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorldProvider, useWorld } from '@/lib';

function Probe() {
  const { canAccessDreamRoom, catsInCurrentRoom } = useWorld();
  return (
    <div>
      <span data-testid="dream-access">{String(canAccessDreamRoom)}</span>
      <span data-testid="cat-count">{catsInCurrentRoom.length}</span>
    </div>
  );
}

describe('WorldProvider selectors', () => {
  it('exposes stable value selectors', () => {
    render(
      <WorldProvider>
        <Probe />
      </WorldProvider>
    );

    expect(screen.getByTestId('dream-access')).toHaveTextContent('false');
    expect(Number(screen.getByTestId('cat-count').textContent)).toBeGreaterThan(0);
  });
});

