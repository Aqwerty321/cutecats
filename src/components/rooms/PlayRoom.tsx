/**
 * Playroom — Tactile Joy & Micro-Interactions
 * 
 * A playground full of toys, objects, and cats that interact.
 * Everything moves, reacts, and creates little moments of joy.
 */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useWorld } from '@/lib';
import { Draggable } from '../Draggable';
import { GlassPanel, DetailedCat, FoodBowl, CatBed } from '@/components';
import { RoomPortal } from '../RoomPortal';
import { WanderingCats } from '../WanderingCatHint';
import { YarnBall, BubbleField, GlassCard } from '../toys';
import { Secret } from '../Secret';

// Playground object for cat interaction
interface PlayObject {
  id: string;
  x: number;
  y: number;
  type: 'yarn' | 'ball' | 'feather' | 'mouse' | 'bell' | 'cushion' | 'box';
  color: string;
  size: number;
  rotation: number;
  isWiggling: boolean;
}

export function PlayRoom() {
  const { state, petCat, catsInCurrentRoom, canAccessDreamRoom } = useWorld();
  const cats = catsInCurrentRoom();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track cursor position for cat reactions
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  
  // Track objects for cats to interact with
  const [objects, setObjects] = useState<PlayObject[]>([
    { id: 'yarn-1', x: 25, y: 45, type: 'yarn', color: '#C77DFF', size: 55, rotation: 0, isWiggling: false },
    { id: 'yarn-2', x: 75, y: 40, type: 'yarn', color: '#FF6B9D', size: 50, rotation: 0, isWiggling: false },
    { id: 'yarn-3', x: 55, y: 72, type: 'yarn', color: '#2DD4BF', size: 48, rotation: 0, isWiggling: false },
    { id: 'ball-1', x: 15, y: 65, type: 'ball', color: '#FFB5C5', size: 35, rotation: 0, isWiggling: false },
    { id: 'ball-2', x: 85, y: 55, type: 'ball', color: '#B8F0D8', size: 30, rotation: 0, isWiggling: false },
    { id: 'feather-1', x: 40, y: 35, type: 'feather', color: '#E8D0FF', size: 45, rotation: -15, isWiggling: false },
    { id: 'feather-2', x: 65, y: 30, type: 'feather', color: '#FFD0DC', size: 40, rotation: 20, isWiggling: false },
    { id: 'mouse-1', x: 30, y: 75, type: 'mouse', color: '#D8D8D8', size: 32, rotation: 0, isWiggling: false },
    { id: 'mouse-2', x: 70, y: 78, type: 'mouse', color: '#E8E0D8', size: 28, rotation: 0, isWiggling: false },
    { id: 'bell-1', x: 50, y: 50, type: 'bell', color: '#FFD700', size: 25, rotation: 0, isWiggling: false },
    { id: 'cushion-1', x: 20, y: 82, type: 'cushion', color: '#FFB5C5', size: 70, rotation: 0, isWiggling: false },
    { id: 'cushion-2', x: 80, y: 80, type: 'cushion', color: '#D4A5FF', size: 65, rotation: 0, isWiggling: false },
    { id: 'box-1', x: 45, y: 85, type: 'box', color: '#E8D0C0', size: 50, rotation: 5, isWiggling: false },
  ]);
  
  // Micro-interaction states
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [bounceEffects, setBounceEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [jingleSound, setJingleSound] = useState(false);
  
  // Track bubble positions for cat interaction
  const [bubblePositions, setBubblePositions] = useState<Array<{ id: string; x: number; y: number; type: string }>>([]);
  
  // Track current draggable positions (updated in real-time)
  const [draggablePositions, setDraggablePositions] = useState<Record<string, { x: number; y: number }>>({});
  
  // Handle draggable position updates
  const handleDraggablePositionChange = useCallback((id: string, x: number, y: number) => {
    setDraggablePositions(prev => ({
      ...prev,
      [id]: { x, y }
    }));
  }, []);
  
  // Combine all interactable objects for cats with real-time positions
  const allInteractableObjects = [
    ...objects.map(o => {
      const pos = draggablePositions[o.id];
      return { id: o.id, x: pos?.x ?? o.x, y: pos?.y ?? o.y, type: o.type };
    }),
    ...bubblePositions,
  ];
  
  // Track yarn toss
  const [yarnTossed, setYarnTossed] = useState(false);
  const [pounceText, setPounceText] = useState('');
  const pounceTexts = ['*pounce!*', '*wiggle wiggle*', '*zoom!*', '*batting intensifies*', '✨ got it! ✨'];

  // Handle cursor movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  }, []);

  // Wiggle random objects periodically
  useEffect(() => {
    const wiggleInterval = setInterval(() => {
      setObjects(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        const updated = [...prev];
        if (!updated[idx].isWiggling && updated[idx].type !== 'cushion' && updated[idx].type !== 'box') {
          updated[idx] = { ...updated[idx], isWiggling: true };
          setTimeout(() => {
            setObjects(p => p.map((o, i) => i === idx ? { ...o, isWiggling: false } : o));
          }, 500);
        }
        return updated;
      });
    }, 3000);
    
    return () => clearInterval(wiggleInterval);
  }, []);

  // Add sparkle effect
  const addSparkle = useCallback((x: number, y: number) => {
    const id = Date.now();
    setSparkles(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== id));
    }, 800);
  }, []);

  // Add floating heart
  const addHeart = useCallback((x: number, y: number) => {
    const id = Date.now();
    setFloatingHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 1500);
  }, []);

  // Add bounce effect
  const addBounce = useCallback((x: number, y: number) => {
    const id = Date.now();
    setBounceEffects(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setBounceEffects(prev => prev.filter(b => b.id !== id));
    }, 600);
  }, []);

  // Handle object click
  const handleObjectClick = useCallback((obj: PlayObject) => {
    if (obj.type === 'bell') {
      setJingleSound(true);
      setTimeout(() => setJingleSound(false), 500);
      addSparkle(obj.x, obj.y);
    } else if (obj.type === 'yarn' || obj.type === 'ball') {
      addBounce(obj.x, obj.y);
    } else if (obj.type === 'feather') {
      addSparkle(obj.x, obj.y);
    } else if (obj.type === 'mouse') {
      setObjects(prev => prev.map(o => 
        o.id === obj.id ? { ...o, isWiggling: true } : o
      ));
      setTimeout(() => {
        setObjects(prev => prev.map(o => 
          o.id === obj.id ? { ...o, isWiggling: false } : o
        ));
      }, 300);
    }
  }, [addSparkle, addBounce]);

  // Handle yarn toss
  const handleYarnToss = useCallback(() => {
    setYarnTossed(true);
    setPounceText(pounceTexts[Math.floor(Math.random() * pounceTexts.length)]);
    addSparkle(50, 50);
    setTimeout(() => setYarnTossed(false), 1500);
  }, [addSparkle, pounceTexts]);

  // Handle pet
  const handlePetCat = useCallback((catId: string, x: number, y: number) => {
    petCat(catId);
    addHeart(x, y);
    addSparkle(x + 5, y - 10);
  }, [petCat, addHeart, addSparkle]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen min-h-dvh overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Navigation portals */}
      <RoomPortal to="sanctuary" position="left" hint="Back to calm..." glowColor="lilac" />
      <RoomPortal to="gallery" position="right" hint="Meet the cats..." glowColor="mint" />
      {canAccessDreamRoom() && (
        <RoomPortal to="dream" position="bottom" hint="Something soft awaits..." glowColor="peach" requiresAccess />
      )}
      
      <WanderingCats />

      {/* Room title */}
      <div 
        className="absolute top-6 left-1/2 -translate-x-1/2 text-xl font-medium z-10"
        style={{ 
          color: 'var(--color-void)', 
          textShadow: '0 2px 12px rgba(255,255,255,0.6)',
        }}
      >
        ✧ Playroom ✧
      </div>

      {/* Bubbles floating in background */}
      <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 5 }}>
        <BubbleField count={15} onBubblesChange={setBubblePositions} />
      </div>

      {/* Cushions (background layer) */}
      {objects.filter(o => o.type === 'cushion').map(obj => (
        <div
          key={obj.id}
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
            zIndex: 2,
          }}
          onClick={() => handleObjectClick(obj)}
        >
          <svg width={obj.size} height={obj.size * 0.5} viewBox="0 0 100 50">
            <defs>
              <radialGradient id={`cushion-grad-${obj.id}`} cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="50%" stopColor={obj.color} />
                <stop offset="100%" stopColor={obj.color} stopOpacity="0.8" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="30" rx="48" ry="20" fill={`url(#cushion-grad-${obj.id})`} />
            <ellipse cx="50" cy="25" rx="40" ry="15" fill="white" opacity="0.2" />
          </svg>
        </div>
      ))}

      {/* Box */}
      {objects.filter(o => o.type === 'box').map(obj => (
        <div
          key={obj.id}
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
            zIndex: 3,
          }}
          onClick={() => handleObjectClick(obj)}
        >
          <svg width={obj.size} height={obj.size * 0.7} viewBox="0 0 100 70">
            <rect x="5" y="20" width="90" height="50" rx="3" fill={obj.color} />
            <polygon points="5,20 15,5 85,5 95,20" fill={obj.color} opacity="0.8" />
            <rect x="10" y="25" width="80" height="40" rx="2" fill="#000" opacity="0.15" />
            <line x1="50" y1="5" x2="50" y2="20" stroke="#C0A080" strokeWidth="2" />
          </svg>
        </div>
      ))}

      {/* Draggable toys */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        {/* === REVAMP: Furniture === */}
        <FoodBowl initialX={10} initialY={85} />
        <CatBed initialX={85} initialY={85} color="#FFD1DC" />

        {/* Yarn balls */}
        {objects.filter(o => o.type === 'yarn').map(obj => (
          <Draggable 
            key={obj.id}
            id={obj.id} 
            initialX={obj.x} 
            initialY={obj.y}
            mass={0.8}
            friction={0.92}
            bounce={0.7}
            onToss={handleYarnToss}
            onPositionChange={handleDraggablePositionChange}
          >
            <div 
              className={obj.isWiggling ? 'animate-wiggle' : ''}
              onClick={() => handleObjectClick(obj)}
            >
              <YarnBall color={obj.color.includes('C77DFF') ? 'lilac' : obj.color.includes('FF6B9D') ? 'peach' : 'mint'} size={obj.size} />
            </div>
          </Draggable>
        ))}

        {/* Balls */}
        {objects.filter(o => o.type === 'ball').map(obj => (
          <Draggable 
            key={obj.id}
            id={obj.id} 
            initialX={obj.x} 
            initialY={obj.y}
            mass={0.6}
            friction={0.88}
            bounce={0.85}
            onPositionChange={handleDraggablePositionChange}
          >
            <div 
              className={`cursor-pointer ${obj.isWiggling ? 'animate-wiggle' : ''}`}
              onClick={() => handleObjectClick(obj)}
            >
              <svg width={obj.size} height={obj.size} viewBox="0 0 40 40">
                <defs>
                  <radialGradient id={`ball-${obj.id}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="50%" stopColor={obj.color} />
                    <stop offset="100%" stopColor={obj.color} stopOpacity="0.7" />
                  </radialGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill={`url(#ball-${obj.id})`} />
                <circle cx="14" cy="14" r="5" fill="white" opacity="0.5" />
              </svg>
            </div>
          </Draggable>
        ))}

        {/* Feathers */}
        {objects.filter(o => o.type === 'feather').map(obj => (
          <Draggable 
            key={obj.id}
            id={obj.id} 
            initialX={obj.x} 
            initialY={obj.y}
            mass={0.2}
            friction={0.98}
            bounce={0.3}
            onPositionChange={handleDraggablePositionChange}
          >
            <div 
              className={`cursor-pointer ${obj.isWiggling ? 'animate-float' : ''}`}
              style={{ transform: `rotate(${obj.rotation}deg)` }}
              onClick={() => handleObjectClick(obj)}
            >
              <svg width={obj.size} height={obj.size * 0.4} viewBox="0 0 60 24">
                <path
                  d="M 5 12 Q 30 0 55 12 Q 30 24 5 12"
                  fill={obj.color}
                  opacity="0.8"
                />
                <line x1="5" y1="12" x2="55" y2="12" stroke={obj.color} strokeWidth="2" opacity="0.5" />
                <path d="M 10 12 Q 20 8 30 12" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
              </svg>
            </div>
          </Draggable>
        ))}

        {/* Toy mice */}
        {objects.filter(o => o.type === 'mouse').map(obj => (
          <Draggable 
            key={obj.id}
            id={obj.id} 
            initialX={obj.x} 
            initialY={obj.y}
            mass={0.5}
            friction={0.9}
            bounce={0.5}
            onPositionChange={handleDraggablePositionChange}
          >
            <div 
              className={`cursor-pointer ${obj.isWiggling ? 'animate-shake' : ''}`}
              onClick={() => handleObjectClick(obj)}
            >
              <svg width={obj.size} height={obj.size * 0.7} viewBox="0 0 40 28">
                <ellipse cx="20" cy="16" rx="15" ry="10" fill={obj.color} />
                <circle cx="8" cy="12" r="5" fill={obj.color} opacity="0.8" />
                <circle cx="5" cy="10" r="2" fill="#333" />
                <path d="M 35 16 Q 45 14 40 20" fill="none" stroke={obj.color} strokeWidth="3" strokeLinecap="round" />
                <circle cx="10" cy="8" r="3" fill="#FFB5C5" opacity="0.6" />
              </svg>
            </div>
          </Draggable>
        ))}

        {/* Bell */}
        {objects.filter(o => o.type === 'bell').map(obj => (
          <Draggable 
            key={obj.id}
            id={obj.id} 
            initialX={obj.x} 
            initialY={obj.y}
            mass={0.7}
            friction={0.85}
            bounce={0.6}
            onPositionChange={handleDraggablePositionChange}
          >
            <div 
              className={`cursor-pointer ${jingleSound ? 'animate-jingle' : ''} ${obj.isWiggling ? 'animate-wiggle' : ''}`}
              onClick={() => handleObjectClick(obj)}
            >
              <svg width={obj.size} height={obj.size} viewBox="0 0 30 30">
                <defs>
                  <radialGradient id={`bell-${obj.id}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFACD" />
                    <stop offset="50%" stopColor={obj.color} />
                    <stop offset="100%" stopColor="#DAA520" />
                  </radialGradient>
                </defs>
                <circle cx="15" cy="15" r="12" fill={`url(#bell-${obj.id})`} />
                <circle cx="15" cy="20" r="3" fill="#B8860B" />
                <ellipse cx="11" cy="11" rx="4" ry="3" fill="white" opacity="0.5" />
              </svg>
            </div>
          </Draggable>
        ))}

        {/* Glass cards */}
        <Draggable id="card-1" initialX={18} initialY={60} mass={1.2}>
          <GlassCard color="lilac" size="small" />
        </Draggable>

        <Draggable id="card-2" initialX={82} initialY={65} mass={1.2}>
          <GlassCard color="peach" size="medium" />
        </Draggable>

        <Draggable id="card-3" initialX={42} initialY={88} mass={1.2}>
          <GlassCard color="mint" size="small" />
        </Draggable>
      </div>

      {/* Detailed cats with full interactions */}
      {cats.map((cat) => (
        <DetailedCat
          key={cat.id}
          cat={cat}
          onPet={() => handlePetCat(cat.id, cat.position.x, cat.position.y)}
          bounds={{ minX: 12, maxX: 88, minY: 30, maxY: 82 }}
          cursorPosition={cursorPos}
          objects={allInteractableObjects}
        />
      ))}

      {/* Sparkle effects */}
      {sparkles.map(s => (
        <div
          key={s.id}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: '24px',
            zIndex: 50,
          }}
        >
          ✨
        </div>
      ))}

      {/* Floating hearts */}
      {floatingHearts.map(h => (
        <div
          key={h.id}
          className="absolute pointer-events-none animate-heart-float"
          style={{
            left: `${h.x}%`,
            top: `${h.y}%`,
            fontSize: '20px',
            zIndex: 50,
          }}
        >
          💕
        </div>
      ))}

      {/* Bounce effects */}
      {bounceEffects.map(b => (
        <div
          key={b.id}
          className="absolute pointer-events-none animate-bounce-ring"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(199, 125, 255, 0.5)',
            borderRadius: '50%',
            zIndex: 50,
          }}
        />
      ))}

      {/* Yarn toss sparkle effect handled by addSparkle */}

      {/* Jingle indicator */}
      {jingleSound && (
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 text-xl pointer-events-none z-40 animate-pulse"
          style={{ color: '#FFD700' }}
        >
          🔔 *jingle* 🔔
        </div>
      )}

      {/* Secrets */}
      <Secret id="playroom-fidget" revealCondition="drags" threshold={10} className="absolute top-20 right-8 z-30">
        <span className="text-sm font-medium" style={{ color: '#FF6B9D' }}>
          ✧ Fidgeter ✧
        </span>
      </Secret>

      <Secret id="playroom-master" revealCondition="drags" threshold={30} className="absolute bottom-20 right-8 z-30">
        <span className="text-sm font-medium animate-pulse-glow" style={{ color: '#2DD4BF' }}>
          ✧ Master of Play ✧
        </span>
      </Secret>

      {/* Helpful hint that fades */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm opacity-60 z-10"
        style={{ color: 'var(--color-void)' }}
      >
        drag toys • click objects • pet the cats 🐱
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.2s ease-in-out 3;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 1s ease-in-out infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out 3;
        }
        
        @keyframes jingle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .animate-jingle {
          animation: jingle 0.1s ease-in-out 5;
        }
        
        @keyframes sparkle {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        .animate-sparkle {
          animation: sparkle 0.8s ease-out forwards;
        }
        
        @keyframes heart-float {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
        }
        .animate-heart-float {
          animation: heart-float 1.5s ease-out forwards;
        }
        
        @keyframes bounce-ring {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }
        .animate-bounce-ring {
          animation: bounce-ring 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
