import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SanctuaryCat } from '@/components/SanctuaryCat';
import { InteractiveCat } from '@/components/InteractiveCat';
import { AutonomousCat } from '@/components/AutonomousCat';
import { LivingCat } from '@/components/LivingCat';
import { DetailedCatVisual } from '@/components/DetailedCat/DetailedCatVisual';
import { createCatAgent } from '@/lib/cat-agent';
import type { CatState } from '@/lib/world-types';

const baseCat: CatState = {
  id: 'cloud',
  name: 'Cloud',
  variant: 'lilac',
  mood: 'curious',
  currentRoom: 'playroom',
  position: { x: 50, y: 50 },
  petCount: 0,
  lastInteraction: 0,
  isWandering: false,
  favoriteSpot: { room: 'playroom', x: 50, y: 50 },
};

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('cat renderer eye layers and tail anchors', () => {
  it('renders layered eyes and tail root patch for DetailedCat visual', () => {
    render(
      <DetailedCatVisual
        variant="lilac"
        name="Cloud"
        moodLabel="curious"
        behavior="idle"
        facing="right"
        blinkState={1}
        walkBob={0}
        tailWag={8}
        breathe={0}
        eyeExpression={{
          eyeWhite: '#fff',
          iris: '#7a57aa',
          pupil: '#221733',
          highlight: '#fff',
          blinkRatio: 1,
          focusOffset: 1,
          eyelidOpacity: 0.1,
          microSaccadeSpeed: 1,
        }}
        eyeOffset={{ x: 0, y: 0 }}
        isHovered={false}
        isPetted={false}
        showHeart={false}
      />
    );

    expect(screen.getByTestId('detailed-cat-eye-left-sclera')).toBeInTheDocument();
    expect(screen.getByTestId('detailed-cat-eye-left-pupil')).toBeInTheDocument();
    expect(screen.getByTestId('detailed-cat-eye-left-highlight')).toBeInTheDocument();
    expect(screen.getByTestId('detailed-cat-tail-root')).toBeInTheDocument();
  });

  it('renders layered eyes and tail root patch for SanctuaryCat', () => {
    render(<SanctuaryCat size={120} variant="mint" />);

    expect(screen.getByTestId('sanctuary-cat-eye-left-sclera')).toBeInTheDocument();
    expect(screen.getByTestId('sanctuary-cat-eye-left-pupil')).toBeInTheDocument();
    expect(screen.getByTestId('sanctuary-cat-eye-left-highlight')).toBeInTheDocument();
    expect(screen.getByTestId('sanctuary-cat-tail-root')).toBeInTheDocument();
  });

  it('renders layered eyes and tail root patch for InteractiveCat', () => {
    render(<InteractiveCat cat={baseCat} containerBounds={{ width: 900, height: 600 }} />);

    expect(screen.getByTestId('interactive-cat-eye-left-sclera')).toBeInTheDocument();
    expect(screen.getByTestId('interactive-cat-eye-left-pupil')).toBeInTheDocument();
    expect(screen.getByTestId('interactive-cat-eye-left-highlight')).toBeInTheDocument();
    expect(screen.getByTestId('interactive-cat-tail-root')).toBeInTheDocument();
  });

  it('renders layered eyes and tail root patch for AutonomousCat', () => {
    render(<AutonomousCat cat={baseCat} />);

    expect(screen.getByTestId('autonomous-cat-eye-left-sclera')).toBeInTheDocument();
    expect(screen.getByTestId('autonomous-cat-eye-left-pupil')).toBeInTheDocument();
    expect(screen.getByTestId('autonomous-cat-eye-left-highlight')).toBeInTheDocument();
    expect(screen.getByTestId('autonomous-cat-tail-root')).toBeInTheDocument();
  });

  it('renders layered eyes and tail root patch for LivingCat', () => {
    const living = createCatAgent('fern', 'Fern', 'mint', 40, 58);
    living.currentBehavior = 'idle';

    render(<LivingCat cat={living} />);

    expect(screen.getByTestId('living-cat-eye-left-sclera')).toBeInTheDocument();
    expect(screen.getByTestId('living-cat-eye-left-pupil')).toBeInTheDocument();
    expect(screen.getByTestId('living-cat-eye-left-highlight')).toBeInTheDocument();
    expect(screen.getByTestId('living-cat-tail-root')).toBeInTheDocument();
  });
});
