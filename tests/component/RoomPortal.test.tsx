import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoomPortal } from '@/components/RoomPortal';

const navigateTo = vi.fn();
const mockState = {
  currentRoom: 'sanctuary',
};
let mockCanAccessDream = false;

vi.mock('@/lib', () => ({
  useWorld: () => ({
    state: mockState,
    navigateTo,
    canAccessDreamRoom: mockCanAccessDream,
  }),
}));

describe('RoomPortal', () => {
  it('navigates when clicked for accessible rooms', () => {
    mockState.currentRoom = 'sanctuary';
    render(<RoomPortal to="playroom" position="right" />);
    fireEvent.click(screen.getByRole('button', { name: /go to playroom/i }));
    expect(navigateTo).toHaveBeenCalledWith('playroom');
  });

  it('hides dream portal when access is blocked', () => {
    mockCanAccessDream = false;
    render(<RoomPortal to="dream" position="bottom" requiresAccess />);
    expect(screen.queryByRole('button', { name: /go to dream/i })).not.toBeInTheDocument();
  });
});
