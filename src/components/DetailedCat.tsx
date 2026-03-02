/**
 * Detailed Cat — Large, Fluffy, Animated Cat
 * 
 * Full-sized cat with animated fur, expressions, and micro-interactions.
 * Uses refs to avoid infinite re-render loops.
 */
'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import type { CatState } from '@/lib/world-types';
import { CatStatusHUD } from './CatStatusHUD';

interface DetailedCatProps {
  cat: CatState;
  onPet?: () => void;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
  cursorPosition?: { x: number; y: number } | null;
  objects?: Array<{ id: string; x: number; y: number; type: string }>;
}

type CatBehavior = 'idle' | 'wandering' | 'sitting' | 'sleeping' | 'curious' | 'playing' | 'grooming' | 'eating' | 'loafing';

const POSE_ASSET_1 = "M49.12.15c.55.3.63.72.55,2.71-.23,5.2-1.91,11.48-3.68,13.69-.27.35-.47.66-.43.69s-.01.32-.11.62c-.33,1.08-.41,1.59-.53,3.46-.26,4.47.68,10.36,2.06,12.77.47.84,1.43,1.88,2.08,2.26.68.39,1.66.5,2.31.24.27-.1,1.47-.43,2.66-.74,1.21-.3,2.92-.78,3.8-1.06,3.3-1.08,5.16-1.45,11.16-2.27,5.9-.81,9.31-1.4,18.3-3.17,5.22-1.03,9.65-1.73,13.49-2.15,8.93-.97,13.92-1.16,19.12-.73,4,.33,8.16.78,10.87,1.16,6.25.87,13.96,2.81,20,4.99,2.25.82,10.05,4.27,14.53,6.43,8.58,4.15,14.33,6.38,21.27,8.28,3.46.94,8.66,1.14,13.02.47,2.83-.43,4.7-1.17,7.83-3.12,5.15-3.19,7.29-4.34,9.25-4.99,2.22-.75,3.62-.81,5.26-.24s2.84,1.61,3.51,3.02c.38.8.44,1.06.48,1.95.08,1.95-.5,3.42-2.09,5.21-2.45,2.75-4.23,4.19-6.64,5.34-2.27,1.08-7,2.37-10.77,2.93-1.29.19-1.92.36-2.87.74-3.54,1.46-5.34,2.02-8.97,2.8-3.84.81-7.83,1.06-15.72.98-4.83-.05-5.57-.08-6.74-.31-2.15-.39-5.52-1.36-9.12-2.59-1.86-.63-3.39-1.14-3.42-1.11-.01.02.02,1.19.08,2.6.23,4.62-.14,6.66-2.09,11.54-1.21,3.03-2.39,5.28-4.11,7.85-1.61,2.4-2.01,3.74-2.01,6.85,0,1.95.04,2.32.38,3.98.47,2.2,1.03,4,1.9,6,.86,1.97,2.58,5.31,4.09,7.87,1.35,2.29,1.64,2.93,2.08,4.46.68,2.34.85,3.49.86,5.71,0,1.88-.04,2.25-.33,3.58-.54,2.32-1.53,5.19-2.57,7.38-1.42,3-1.8,4.19-2.29,7.31-.49,3.03-1.1,4.59-2.21,5.59-1.06.98-2.75,1.66-5.56,2.27-1.43.3-1.64.32-5.08.32-3.29-.01-3.68-.02-4.72-.27-1.41-.32-2.57-.9-3.03-1.49-.29-.36-.37-.6-.41-1.17-.05-.63-.01-.81.35-1.52.79-1.54,2.34-2.84,4.03-3.37.42-.13,1.23-.3,1.82-.37s1.12-.2,1.18-.27c.07-.08.35-.92.61-1.85.27-.94.87-2.69,1.34-3.88.98-2.53,1.4-4.04,1.49-5.45.05-.86.02-1.12-.2-1.72-.3-.79-.37-.86-3.69-3.95-2.07-1.92-2.92-2.59-8.14-6.44-1.33-.98-2.1-1.65-2.47-2.13-.3-.38-.57-.69-.6-.69-.24,0-.63,1.7-1.36,5.87-.8,4.59-.87,4.9-1.72,7.55-1.24,3.86-1.92,5.14-4.01,7.56-1.55,1.82-3.12,3.09-6.98,5.66-3.9,2.59-4.85,3.37-5.77,4.66-2.57,3.61-4.33,5.56-5.56,6.15-.67.32-.81.35-3.06.43-1.52.06-3.07.2-4.37.42-1.84.29-2.25.31-4.36.25s-2.45-.1-3.67-.43c-1.85-.5-2.71-.97-3.08-1.68-.39-.75-.22-1.34.9-2.99.93-1.37,1.39-1.89,2.49-2.76,1.14-.91,2.31-1.46,4.22-1.96,2.59-.69,4.44-1.61,5.41-2.68.25-.29.86-1.15,1.35-1.91.5-.76,1.55-2.38,2.34-3.6,2.09-3.19,4.15-7.29,4.91-9.81.84-2.74.72-4-1-11.1-1.21-4.98-1.24-5.25-1.24-8.9,0-2.98.01-3.15.31-4.22l.3-1.1-.79.06c-3.18.27-5.25.56-7.54,1.04-3.61.74-9.42,1.9-10.39,2.07-.62.11-2.06.43-3.17.7-2.51.65-7.12,1.67-8.72,1.94-.98.17-2.11.2-6.33.2-2.83.01-5.69-.05-6.34-.11-.67-.07-1.39-.11-1.6-.07-.37.05-.38.07-.31.53s-.51,6.45-.99,10.19c-.13.98-.35,2.63-.48,3.64-.36,2.75-.5,5.44-.61,11.41-.1,5.36-.14,5.94-.66,8.78-.1.55-.23,1.73-.3,2.63-.33,4.41-.5,5.42-1.09,6.69-.48,1.03-1.02,1.55-2.15,2.08-2.19,1.02-4.09,1.21-10.38,1.05-3.82-.08-4.16-.12-4.68-.35-1.03-.47-1.18-1.39-.56-3.35.79-2.45,1.42-3.45,3.74-5.89,2.54-2.66,2.92-3.68,2.53-6.87-.5-4.27-1.18-7.4-2.22-10.25-.35-.93-.85-2.46-1.14-3.41-.27-.94-.56-1.77-.62-1.83s-.53.62-1.18,1.77c-1.31,2.33-2.03,3.43-3.7,5.66-2.99,4-5.05,7.12-7.06,10.6-.61,1.08-1.31,2.26-1.57,2.63-.68,1.05-2.07,2.43-3.44,3.44-1.42,1.05-1.84,1.59-2.96,3.85-.37.74-.85,1.54-1.06,1.79-.22.24-.59.69-.84,1-1.17,1.46-4,2.04-9.77,1.98-1.96-.01-3.05.04-4.06.18-1.45.2-1.88.17-2.46-.22-.39-.26-.75-.88-.75-1.3,0-.88,1.64-3.18,3.42-4.79,1.45-1.31,1.78-1.55,3.62-2.64.88-.51,1.85-1.17,2.16-1.45.85-.76,1.4-1.96,2.45-5.29.5-1.61,1.3-4,1.79-5.32,1.61-4.43,3.09-10.23,3.81-14.88.61-3.98.69-5.15.75-10.84l.06-5.41-.66-1.1c-.82-1.4-2.41-4.28-3.11-5.66-1.91-3.82-4.5-11.45-5.39-15.88-.48-2.39-.63-3.52-1.03-7.41-.68-6.62-1.36-10.61-2.56-15-.82-2.99-1.24-4.99-1.79-8.5-.78-4.95-1.08-7.87-1.27-12.53-.1-2.4-.16-2.98-.42-3.94-.42-1.54-.72-2.13-1.78-3.52C1.17,18.71,0,15.98,0,14.44c0-.62.36-2.4.66-3.3.11-.33.51-1.27.9-2.09.74-1.6,1.05-2.51,1.42-4.28.13-.61.37-1.35.51-1.66.65-1.28,1.41-1.35,4.28-.42,3.01.98,3.58,1.1,5.2,1.11,1.31,0,1.55-.04,2.93-.44,3.05-.9,4.73-1.14,6.56-.9,1.02.13,4.05.86,5.87,1.41,2.19.66,3.46.88,5.33.96l1.82.07.99-.72c2.15-1.55,4.09-2.31,9.04-3.55,2.84-.72,3.14-.75,3.62-.49h0Z";

const POSE_ASSET_2 = "M208.39.12c1.92.41,3.98,1.97,5.57,4.23,1.35,1.92,2.77,5.42,3.5,8.63.18.82.61,2.49.94,3.7,1.36,4.98,1.49,6.11,1.41,12.34-.06,4.89-.06,4.92-.98,8.39-.66,2.5-2.63,8.11-3.52,10.04-.18.39-.48,1.06-.66,1.49-1.41,3.35-4.97,9.21-7.63,12.55-2.01,2.52-4.64,4.89-8.6,7.75-2.93,2.11-8.02,4.83-14.17,7.54-7.77,3.44-11.92,6.19-13.45,8.91l-.41.73.5.82c1.31,2.17,3.5,6.73,5.02,10.44,2.27,5.58,3.39,8.99,4.23,12.9.23,1.09.55,2.56.7,3.29.16.72.59,2.84.96,4.72,1.6,8.16,1.85,9.21,2.96,12.26.99,2.7,2.06,5.02,2.77,5.96.33.45,1.49,1.74,2.57,2.87,2.1,2.2,2.76,3.05,3.29,4.24.69,1.59.79,2.74.49,5.85-.31,3.08-.33,4.53-.19,8.79.12,3.61.11,4.62-.05,7.35-.11,1.73-.25,4.37-.31,5.85-.12,2.98-.39,4.71-.91,5.79-.91,1.92-4.55,3.73-8.52,4.22-2.4.3-4.44-.62-5.09-2.29-.17-.45-.2-.8-.16-1.96.11-2.4.79-3.94,2.43-5.54.5-.49,1-1.04,1.1-1.24.27-.53.24-1.68-.12-3.46-.18-.86-.45-2.46-.63-3.57-.35-2.26-1.06-4.98-1.59-6.03-.61-1.19-1.8-2.88-2.33-3.26-1.3-.94-3.2-1.76-5.83-2.49-4.18-1.16-10.08-3.43-13.12-5.04-1.17-.63-2.46-1.47-4.13-2.68-.54-.39-2.04-1.48-3.35-2.43-3.13-2.26-4.01-2.94-5.66-4.33-1.58-1.31-2.28-2.06-2.87-2.96l-.41-.63-.87,4.34c-1.8,9-1.95,9.79-2.13,12.47-.26,3.81-.5,5.38-1.09,6.99-.88,2.47-1.79,3.51-5.48,6.3-5.16,3.88-6.4,4.78-7.4,5.41-.6.37-1.65,1.05-2.34,1.49-1.29.85-6.94,3.78-8.42,4.37-1.43.57-3.17.81-7.86,1.12-2.75.18-3.57.14-4.96-.2-1.84-.45-2.74-1.49-3.18-3.7-.26-1.25-.24-2.19.06-3.15.31-.99.65-1.34,1.97-2.04,1.18-.63,1.9-.81,4.03-1.06,2.17-.25,3.33-.59,5.4-1.59,1.91-.93,3.09-1.78,4.66-3.32,1.53-1.51,2.25-2.37,3.64-4.34.68-.96,1.46-2.01,1.73-2.33.73-.86.9-1.25.9-2.1,0-1.03-.51-2.69-1.84-6-.62-1.52-1.31-3.3-1.57-3.94-.24-.65-.76-1.94-1.16-2.87s-.98-2.32-1.29-3.07c-.45-1.08-.62-1.37-.8-1.36-.12.01-.88.16-1.71.32-6.56,1.35-7.44,1.46-9.86,1.33-2.77-.17-12.38-.13-13.38.04-1.21.22-1.98.47-2.38.79-.32.26-.33.3-.16.57.67,1.05,1.02,4.93.63,7.1-.2,1.12-.7,3.33-1.03,4.54-.39,1.47-.5,2.28-.36,2.8.31,1.17,1.84,3.05,3.82,4.7,1,.84,3.3,3.58,3.97,4.74,1.27,2.22,1.22,4.04-.2,7.85-.98,2.62-1.71,4.18-2.39,5.13-.78,1.09-1.21,1.48-2.15,1.94-.76.37-.91.41-1.61.35-.98-.07-1.76-.39-2.44-1.03-1.11-1.03-1.58-2.32-1.74-4.84-.16-2.29-.31-3.11-.72-3.95-.37-.76-1.12-1.43-3.26-2.93-1.79-1.24-3.01-2.23-3.85-3.11-1.08-1.14-2.39-2.78-2.94-3.69-.69-1.14-1.54-3.15-1.94-4.66l-.37-1.37.02-4.24c.06-7.74-.23-9.07-2.22-10.13-.92-.49-1.86-.7-3.85-.86-.88-.07-2.39-.22-3.35-.32-2.38-.25-5.6-.25-6.99,0-.6.11-1.43.2-1.89.2-.49,0-.8.05-.8.13,0,.31-3.72,5.27-6.02,8.05-1.86,2.23-3.36,4.22-4.65,6.14-1.91,2.88-4.37,5.81-6.54,7.77-1.54,1.41-4.64,3.94-5.9,4.83-2.4,1.67-3.43,2.52-4.85,3.99-.87.9-1.72,1.9-2.03,2.4-1.39,2.26-2.87,4.42-3.29,4.83-.97.93-2.08,1.29-4.05,1.29-1.34,0-3.39.18-5.75.49-3.52.48-4.53.41-6.23-.43C.6,175.46,0,174.81,0,174.15c0-1.08.87-2.21,2.83-3.7,1.9-1.46,2.46-1.8,4.73-2.94,2.35-1.17,3.21-1.8,4.27-3.13,1.51-1.88,2.58-3.03,3.54-3.8.75-.61,1.19-1.08,1.66-1.78.76-1.16,1.48-2.49,1.91-3.52.18-.43.73-1.61,1.22-2.63.5-1.02,1.1-2.31,1.35-2.87s.81-1.83,1.25-2.81c.43-.99,1.25-2.95,1.82-4.36.56-1.41,1.51-3.73,2.1-5.14,1.67-4.01,2.66-6.56,2.88-7.44.55-2.19.47-3.79-.37-7.01-.3-1.15-.65-2.54-.76-3.11-.62-2.77-1.35-10.49-1.48-15.53-.13-4.83-.38-6.97-1.1-9.02-1.09-3.13-2.14-4.68-5.66-8.39-.91-.96-1.14-1.3-1.88-2.75-1.73-3.44-2.28-4.96-2.54-7.13-.24-1.97.05-6,.56-8.02.27-1.08.94-2.81,1.73-4.49.72-1.54,1.11-2.83.97-3.19-.04-.12-.43-.61-.86-1.11-1-1.16-1.45-2.01-1.9-3.57-.45-1.59-.61-2.49-.61-3.39.01-2.04.86-3.17,2.4-3.18,1.49,0,5.41,1.39,7.58,2.69,1.45.87,1.79.99,2.69,1,3.87.04,14.91-.11,15.93-.22,2.02-.2,2.08-.23,3.24-1.47,1.66-1.76,3.17-2.8,4.91-3.38,1.23-.42,2.11-.45,2.47-.1.22.23.27.45.35,1.55.23,3.21.1,4.93-.5,6.67-.45,1.3-.17,2.71,1.33,6.63.5,1.35,1.02,2.71,1.12,3.05.36,1.14.84,3.52,1.09,5.46.06.49.12.57.33.57.14,0,.74.16,1.34.36,1.54.5,5.68,1.18,7.25,1.19.44,0,1.84-.13,3.11-.3,7.04-.9,10.96-.67,19.97,1.14,4.5.91,9.38,1.29,13.61,1.08,2.65-.14,3.94-.31,6.54-.84,3.73-.78,7.63-1.43,10.94-1.85,1.9-.24,4.09-.54,4.84-.66.75-.13,3.31-.45,5.68-.72s5.38-.61,6.69-.78c4.79-.61,11.96-.7,14.1-.19,2.22.54,4.59,1.42,6.71,2.51l2.1,1.09,1.15-1.11c.63-.61,1.45-1.33,1.82-1.6,1-.74,3.6-2.38,4.95-3.12.66-.36,1.67-.93,2.27-1.28.59-.35,1.8-1.02,2.69-1.49,3.43-1.85,4.05-2.21,5.41-3.19.79-.55,1.97-1.33,2.63-1.73,1.97-1.18,7.23-4.83,8.7-6.02,1.08-.87,5.9-5.81,7.13-7.28,1.98-2.37,3.26-4.56,4.74-8.12.87-2.1,1.08-2.94,1.57-6.28.42-2.95.5-5.79.24-8.39-.26-2.52-.78-6.58-.91-7.19-.36-1.61-1.22-7.56-1.33-9.13-.19-2.71-.1-4.99.26-6.05.35-1.06,1.28-2.06,2.2-2.38.81-.27,2.44-.35,3.42-.14Z";

const POSE_ASSET_3 = "M16.87.06c1.9.26,5.1,1.84,7.27,3.58,1.44,1.16,4.3,3.96,5.59,5.49,3.8,4.47,6.12,9.1,6.92,13.75.44,2.65.46,5.42.07,8.99-.39,3.41-.34,7,.11,9.05.5,2.31,1.86,5.37,3.66,8.29,2.46,3.95,3.23,4.66,7.11,6.6,1.93.96,2.93,1.58,7.7,4.69,1.62,1.07,3.3,2.14,3.74,2.39.43.26,1.63,1.01,2.66,1.67,2.37,1.51,3.49,2.07,5.03,2.56.75.24,1.35.5,1.53.67.28.26.48.29,3.75.62,7.94.79,11.75.91,14.91.41,5.56-.86,7.37-1.02,10.41-.93,3.53.1,10.01.95,15.9,2.06,5.18.99,12.91,2.13,17.12,2.55,1.3.12,3.42.36,4.71.51s2.98.33,3.8.4c.81.07,2.42.22,3.57.34,4.18.43,4.41.42,7.54-.17,2.74-.52,4.1-.51,9.6.11,2.27.25,9.44,1.33,11.32,1.7,3.74.74,9.39.71,16.1-.07,3.24-.37,3.55-.46,7.54-2.21,3.73-1.62,5.43-2.07,7.78-2.09,1.76,0,5.99-.44,7.19-.76,1.38-.35,1.79-.62,4.01-2.8,2.3-2.24,3.66-3.32,5.07-4.05,1.16-.59,1.87-.69,2.26-.33.15.14.31.4.34.57.09.42-.29,2.13-.96,4.26-.71,2.24-.91,3.28-.91,4.75,0,.87.05,1.2.16,1.3.09.07.33.62.51,1.22.41,1.29,1.13,2.63,2.31,4.24.93,1.28,1.7,2.11,3.06,3.3,1.37,1.21,1.73,1.98,2.4,5.19.39,1.81.42,1.92,1.41,3.86,1.12,2.2,1.61,3.39,1.89,4.58.32,1.35.06,2.91-.67,3.99-.31.46-.52.62-1.47,1.09-1.27.62-1.72,1.04-2.69,2.46-1.04,1.53-1.69,1.85-4.09,2.03-.92.07-1.81.1-1.98.07-.18-.03-1.53-.11-2.99-.17-3.98-.16-5.5-.35-8.33-1.03-1.54-.37-2.11-.4-3.2-.16-.98.23-4.15,1.35-4.75,1.69-.65.36-.98,1.03-1.04,2.11-.07,1.18.17,2.27,1.11,5.16,1.01,3.1,1.25,4.31,1.47,7.56.06.92.11,2.15.11,2.74,0,1.32.28,3.31.59,4.13.12.33.7,1.3,1.28,2.17s1.47,2.24,1.98,3.08c2.07,3.39,3.29,4.86,5.24,6.35,2,1.52,3.2,2.55,4.14,3.55,1.02,1.07,3.16,3.74,4.51,5.62,1.42,1.98,3.96,5.37,4.57,6.12.95,1.15,2.56,2.73,4.16,4.13,2.45,2.12,2.71,2.32,4,3.08,2.68,1.59,3.13,1.9,4.39,3.16s1.77,2,2.05,3.05c.19.69.19,1.01.03,1.56-.16.6-1.19,1.68-2.02,2.12-1.87.99-4.99,1.83-6.83,1.83-1.25,0-2.97-.27-3.67-.57-2.18-.93-5.56-4.35-8.63-8.75-1.96-2.79-3.39-4.26-8.31-8.58-2.12-1.87-3.97-3.12-6.36-4.32-1.64-.83-2.91-1.6-4.92-2.99-2.24-1.56-3.68-2.79-6.64-5.68-1.28-1.26-2.81-2.65-3.4-3.12s-1.53-1.22-2.07-1.68c-1.42-1.18-2.59-1.7-6.2-2.73-5.47-1.58-6.92-2.01-8.28-2.45-1.92-.61-3.44-.92-5.59-1.08-2.05-.16-3.42-.03-5.57.5-2.96.75-7.02,3.03-9.05,5.08-1.12,1.15-1.81,2.13-3.23,4.68-1.15,2.05-1.71,3.33-2.07,4.65-.28,1.01-1.79,5.14-2.44,6.63-.23.53-.77,1.66-1.21,2.49-1.42,2.73-2.46,5.78-2.55,7.54-.06.85-.03.93.27,1.37.17.25.87.96,1.56,1.59,3.1,2.78,3.5,3.32,3.5,4.64,0,1.17-.37,1.73-1.43,2.21-1.27.56-4.64.77-6.37.4-.99-.2-3.76-1.3-4.71-1.86-1.56-.93-2.56-1.95-3.19-3.23-.62-1.33-.73-1.93-.73-4.49,0-2.07.03-2.49.32-3.91.17-.87.43-2.38.58-3.34.25-1.64.77-3.63,1.29-4.97.35-.9.56-1.78.75-3.37.1-.82.44-2.68.75-4.14.82-3.9.91-5.33.54-8.84-.06-.59-.18-2.04-.27-3.22-.1-1.49-.2-2.18-.31-2.24-.35-.24-1.52,0-3.36.69-3.45,1.29-5.41,1.51-15.33,1.71-3.53.08-5.91.18-7.52.34-1.29.12-3.31.27-4.48.34-2.98.16-4.94.42-6.7.86-2.74.69-4.3,1.54-8.08,4.39-4.93,3.7-8.46,7.01-11.5,10.76-2.18,2.7-2.35,3.04-2.36,4.68v1.13s.67,1.27.67,1.27c.7,1.34,2.22,3.47,3.2,4.48.84.88,5.2,4.97,5.99,5.61,1.01.83,1.11.87,3.07,1.5,3.3,1.05,5.52,2.38,6.21,3.74.29.57.63,1.97.63,2.62,0,1.49-.99,2.04-4.31,2.45-1.68.2-2.28.18-5.27-.17-2.2-.26-3.27-.5-4.88-1.09-2.94-1.05-5.12-2.48-7.26-4.75-.77-.82-2-2.2-2.72-3.07-2.1-2.49-3.93-4.39-5.78-5.96-.94-.79-2.19-1.86-2.78-2.37s-1.83-1.53-2.73-2.27c-2.45-1.98-2.74-2.42-2.73-4.03.01-1.49.7-3.06,2.3-5.19,1.46-1.97,1.96-3.13,2.15-5.06.19-1.87.07-3.95-.4-6.19-.87-4.25-1.2-5.61-1.37-5.61-.37,0-3.24,1.85-4.35,2.8-1.29,1.11-2.38,1.83-3.34,2.2-1.17.45-3.37.95-5.57,1.28-6.83,1.02-8.58,1.35-11.08,2.06-2.68.77-5,1.79-6.89,3.05-1.54,1.03-2.62,2.23-6.58,7.43-1.39,1.83-3.79,6.25-4.43,8.16-.33,1-.36,1.25-.44,3.29-.1,2.42-.33,3.55-1.02,5.27-.58,1.46-1.88,3.22-2.77,3.74-1.03.6-2.82.87-4.14.62-.86-.16-2.87-.95-3.49-1.37-.88-.6-3.05-2.55-3.33-3-.58-.94-.1-2.31,1.68-4.89,1.61-2.34,1.85-2.76,2.12-3.9.09-.34.37-1.38.63-2.31.26-.94.65-2.34.85-3.12s.7-2.52,1.11-3.86c.84-2.78,1.55-5.36,1.88-6.86.84-3.74,1.44-6.02,2-7.65,1.09-3.15,2.07-5,3.21-6.02,1.32-1.18,4.6-2.52,8.07-3.28,3.56-.78,5.92-2,9.21-4.75,1.84-1.54,4.98-5.49,6.03-7.59.53-1.05,1.39-3.32,1.83-4.78.78-2.71,1.08-4.55,1.3-8.21.16-2.44.34-3.48.9-5.05.61-1.73,1.42-3.16,3.04-5.31,3.21-4.29,3.82-5.88,3.38-8.88-.24-1.62-1.03-3.87-1.92-5.42-.34-.6-.71-1.3-.82-1.55-.51-1.22-2.15-3.03-4.51-4.92-.81-.65-1.72-1.41-2.04-1.69s-1.17-.95-1.88-1.49c-.71-.52-1.81-1.38-2.44-1.89s-1.46-1.19-1.87-1.52c-1.02-.79-3.33-2.97-4.08-3.83-3.46-4-7.12-11.12-8.49-16.52-.63-2.51-.74-3.47-.75-6.63,0-2.9.01-3.07.36-5.05.48-2.64.71-5.07.79-8.14.07-2.65-.02-3.81-.44-5.18-.67-2.19-1.9-4.32-4.18-7.17-1.77-2.21-2.97-4.72-2.97-6.21,0-1.89,2.01-3.08,4.64-2.72h0Z";

const COLOR_VARIANTS: Record<string, { primary: string; secondary: string; accent: string; dark: string; fur: string }> = {
  cream: { primary: '#FFE4D6', secondary: '#FFD4C4', accent: '#FFB494', dark: '#E8A070', fur: '#FFF0E8' },
  peach: { primary: '#FFD0DC', secondary: '#FFC0D0', accent: '#FF90A8', dark: '#E87090', fur: '#FFE8EE' },
  lilac: { primary: '#E8D0FF', secondary: '#D8B8FF', accent: '#C090FF', dark: '#A060E0', fur: '#F4E8FF' },
  mint: { primary: '#B8F0D8', secondary: '#90E8C8', accent: '#60D0A8', dark: '#40B088', fur: '#D8FFF0' },
};

export const DetailedCat = memo(function DetailedCat({ 
  cat, 
  onPet,
  bounds = { minX: 10, maxX: 90, minY: 40, maxY: 80 },
  cursorPosition,
  objects = [],
}: DetailedCatProps) {
  const colors = COLOR_VARIANTS[cat.variant] || COLOR_VARIANTS.cream;
  
  // Easing function - cubic bezier ease-in-out
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  
  // Use refs for movement to avoid re-renders
  const posRef = useRef({ x: cat.position.x, y: cat.position.y });
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const objectsRef = useRef(objects);
  const targetObjectRef = useRef<string | null>(null);
  
  // Easing animation refs
  const moveStartRef = useRef({ x: cat.position.x, y: cat.position.y });
  const moveEndRef = useRef({ x: cat.position.x, y: cat.position.y });
  const moveProgressRef = useRef(1); // 0 to 1, starts complete
  const moveDurationRef = useRef(2000); // ms for full movement
  
  // Keep objects ref updated
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);
  
  // Render state (minimal updates)
  const [renderPos, setRenderPos] = useState({ x: cat.position.x, y: cat.position.y });
  const [behavior, setBehavior] = useState<CatBehavior>('wandering');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [blinkOpen, setBlinkOpen] = useState(true);
  // Random phase offsets to desync cats
  const [tailPhase, setTailPhase] = useState(() => Math.random() * Math.PI * 2);
  const [furPhase, setFurPhase] = useState(() => Math.random() * Math.PI * 2);
  const [earTwitch, setEarTwitch] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [emote, setEmote] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isPouncing, setIsPouncing] = useState(false);

  // === REVAMP: Needs System ===
  const [needs, setNeeds] = useState({ 
    energy: 60 + Math.random() * 40, // 0-100 (100 = energetic)
    hunger: Math.random() * 50,      // 0-100 (0 = full, 100 = starving)
    fun: 50 + Math.random() * 50,    // 0-100 (100 = bored)
    affection: 0                     // 0-100 (100 = loves you)
  });

  // === REVAMP: Interaction State ===
  const [interactionState, setInteractionState] = useState({
    isBeingPetted: false,
    isDangling: false,
    pettingIntensity: 0,
    isDragging: false
  });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef<{x: number, y: number} | null>(null);
  const pettingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // === REVAMP: Visual State ===
  const [squash, setSquash] = useState({ x: 1, y: 1 });
  const [isLoafing, setIsLoafing] = useState(false);
  
  // Seeded random based on cat ID - each cat gets unique randomness
  const seededRandom = useCallback(() => {
    // Simple seeded random using cat.id hash
    const hash = cat.id.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
    const seed = (hash + Date.now()) % 2147483647;
    return ((seed * 16807) % 2147483647) / 2147483647;
  }, [cat.id]);
  
  // Random personality - each cat has unique timing based on their ID (computed once)
  const personalityRef = useRef(() => {
    const hash = cat.id.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
    const r1 = ((hash * 16807) % 2147483647) / 2147483647;
    const r2 = (((hash + 1) * 16807) % 2147483647) / 2147483647;
    const r3 = (((hash + 2) * 16807) % 2147483647) / 2147483647;
    return {
      speedMultiplier: 0.6 + r1 * 0.8, // 0.6 to 1.4
      animSpeed: 0.7 + r2 * 0.6, // 0.7 to 1.3
      laziness: r3, // 0 to 1 - affects how often they move
      toyPreference: Math.floor(r1 * 1000), // Used to pick different toys
    };
  });
  // Compute personality once
  const personality = personalityRef.current();
  
  const animFrameRef = useRef<number>(0);
  const behaviorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find a random object to chase - NOT nearest, each cat picks differently
  const findRandomObject = useCallback(() => {
    const currentObjects = objectsRef.current;
    if (!currentObjects || currentObjects.length === 0) return null;
    
    // Use cat's toy preference to pick a consistent but different object
    const preference = personality.toyPreference;
    const index = (preference + Math.floor(Math.random() * 3)) % currentObjects.length;
    return currentObjects[index];
  }, []);

  // Ref for cursor position
  const cursorRef = useRef(cursorPosition);
  useEffect(() => {
    cursorRef.current = cursorPosition;
  }, [cursorPosition]);

  // Behavior decision (stable, no physics dependencies)
  const pickNewBehavior = useCallback(() => {
    // Use seeded random mixed with regular random for variety but uniqueness
    const rand = (Math.random() + seededRandom()) / 2;
    
    // === REVAMP: Needs-Driven Logic ===
    
    // 1. Sleep if tired (Energy < 20)
    if (needs.energy < 20) {
      // Look for bed
      const bed = objectsRef.current.find(o => o.type === 'bed');
      if (bed) {
        // Target slightly above center to sit "in" the bed
        targetRef.current = { x: bed.x, y: bed.y - 2 };
        targetObjectRef.current = bed.id;
        moveEndRef.current = { x: -999, y: -999 };
        setBehavior('wandering'); // Walk to bed
        setEmote('*sleepy*');
        setTimeout(() => setEmote(null), 2000);
        return 5000; // Time to walk there
      }
      
      // No bed? Sleep on floor
      setBehavior('sleeping');
      setEmote('*yawn*');
      setTimeout(() => setEmote(null), 2000);
      return 15000 + Math.random() * 10000; // Long sleep to recover
    }

    // 2. Eat if hungry (Hunger > 70)
    if (needs.hunger > 70) {
      const food = objectsRef.current.find(o => o.type === 'food');
      if (food) {
        // Target left or right of the bowl, not inside it
        const offset = Math.random() > 0.5 ? 12 : -12;
        targetRef.current = { x: food.x + offset, y: food.y };
        targetObjectRef.current = food.id;
        moveEndRef.current = { x: -999, y: -999 }; // Force move
        setBehavior('wandering'); // Walk to food
        setEmote('*hungry*');
        setTimeout(() => setEmote(null), 2000);
        return 5000;
      }
    }

    // 3. Play if bored (Fun > 70)
    if (needs.fun > 70) {
       const chosenObject = findRandomObject();
       if (chosenObject) {
          // Target slightly to the side to avoid clipping
          const offset = Math.random() > 0.5 ? 12 : -12;
          targetRef.current = { x: chosenObject.x + offset, y: chosenObject.y };
          targetObjectRef.current = chosenObject.id;
          moveEndRef.current = { x: -999, y: -999 };
          setBehavior('playing');
          setEmote('*zoom!*');
          setTimeout(() => setEmote(null), 1000);
          return 6000 + Math.random() * 4000;
       }
    }

    // If already chasing a toy, keep chasing it until we reach it!
    if (targetObjectRef.current && behavior === 'playing' && moveProgressRef.current < 1) {
      // Still chasing - don't switch targets, just extend the timer
      return 2000 + Math.random() * 1500;
    }
    
    // === REVAMP: Zoomies ===
    // If high energy (>80) and low fun (<30), trigger zoomies!
    if (needs.energy > 80 && needs.fun < 30 && rand < 0.3) {
       setBehavior('playing');
       setEmote('⚡ ZOOMIES! ⚡');
       setTimeout(() => setEmote(null), 2000);
       
       // Pick a random spot far away
       targetRef.current = {
          x: Math.random() * 100,
          y: Math.random() * 100
       };
       moveEndRef.current = { x: -999, y: -999 };
       
       // Super fast!
       return 1500; 
    }

    // Lazier cats chase less often (15-35% based on laziness)
    const chaseChance = 0.15 + (1 - personality.laziness) * 0.20;
    const chosenObject = findRandomObject();
    if (chosenObject && rand < chaseChance) {
      // Target slightly to the side of the toy to avoid clipping
      const offset = Math.random() > 0.5 ? 12 : -12;
      targetRef.current = { x: chosenObject.x + offset, y: chosenObject.y };
      targetObjectRef.current = chosenObject.id;
      // Reset movement for new target
      moveEndRef.current = { x: -999, y: -999 }; // Force new movement to start
      setBehavior('playing');
      setEmote('*ooh!*');
      setTimeout(() => setEmote(null), 1000);
      return 6000 + Math.random() * 4000; // Longer duration to reach toy
    }
    
    // === REVAMP: Social Logic ===
    // 5% chance to find another cat and say hi
    if (rand > 0.95) {
       // Find other cats in DOM
       const otherCats = Array.from(document.querySelectorAll('[data-cat-id]'))
          .filter(el => el.getAttribute('data-cat-id') !== cat.id);
       
       if (otherCats.length > 0) {
          const randomCat = otherCats[Math.floor(Math.random() * otherCats.length)] as HTMLElement;
          const rect = randomCat.getBoundingClientRect();
          // Convert to percentage (approximate)
          const parentRect = randomCat.parentElement?.getBoundingClientRect();
          if (parentRect) {
             const targetX = ((rect.left + rect.width/2 - parentRect.left) / parentRect.width) * 100;
             const targetY = ((rect.top + rect.height/2 - parentRect.top) / parentRect.height) * 100;
             
             // Stand nearby, not inside the other cat
             const offset = Math.random() > 0.5 ? 12 : -12;
             targetRef.current = { x: targetX + offset, y: targetY };
             moveEndRef.current = { x: -999, y: -999 };
             setBehavior('curious');
             setEmote('*sniff*');
             setTimeout(() => setEmote(null), 2000);
             return 4000;
          }
       }
    }

    // Cats no longer follow cursor - they just do their own thing
    
    let newBehavior: CatBehavior;
    let duration: number;
    
    // Much more likely to sleep, sit, or idle
    if (rand < 0.25) {
      // 25% sleep
      newBehavior = 'sleeping';
      duration = 8000 + Math.random() * 10000;
      setEmote('*zzz*');
    } else if (rand < 0.45) {
      // 20% sitting
      newBehavior = 'sitting';
      duration = 5000 + Math.random() * 5000;
      targetRef.current = null;
    } else if (rand < 0.60) {
      // 15% idle
      newBehavior = 'idle';
      duration = 4000 + Math.random() * 4000;
      targetRef.current = null;
    } else if (rand < 0.70) {
      // 10% grooming
      newBehavior = 'grooming';
      duration = 3000 + Math.random() * 2000;
      setEmote('*groom groom*');
    } else if (rand < 0.90) {
      // 20% gentle wandering (short distance)
      newBehavior = 'wandering';
      duration = 4000 + Math.random() * 3000;
      targetRef.current = {
        x: posRef.current.x + (Math.random() - 0.5) * 20,
        y: posRef.current.y + (Math.random() - 0.5) * 10,
      };
      targetRef.current.x = Math.max(bounds.minX, Math.min(bounds.maxX, targetRef.current.x));
      targetRef.current.y = Math.max(bounds.minY, Math.min(bounds.maxY, targetRef.current.y));
    } else {
      // 10% playful exploration
      newBehavior = 'playing';
      duration = 3000 + Math.random() * 2000;
      targetRef.current = {
        x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      };
      setEmote('*la la la~*');
    }
    
    setBehavior(newBehavior);
    
    // === REVAMP: Loafing Logic ===
    // If sitting, 50% chance to loaf
    if (newBehavior === 'sitting') {
       setIsLoafing(Math.random() > 0.5);
    } else {
       setIsLoafing(false);
    }

    // Clear emote after a bit
    setTimeout(() => setEmote(null), 2500);
    
    return duration;
  }, [cat.mood, bounds, findRandomObject, seededRandom, behavior]);

  // Store pickNewBehavior in a ref to avoid dependency issues
  const pickNewBehaviorRef = useRef(pickNewBehavior);
  pickNewBehaviorRef.current = pickNewBehavior;
  
  // Start behavior loop - immediately try to find something to do
  useEffect(() => {
    // Set an initial random target to get the cat moving
    targetRef.current = {
      x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
    };
    
    const scheduleBehavior = () => {
      const duration = pickNewBehaviorRef.current();
      // Add random variance to duration based on personality
      const variance = 0.8 + Math.random() * 0.4;
      behaviorTimeoutRef.current = setTimeout(scheduleBehavior, (duration || 2000) * variance);
    };
    
    // Much longer random initial delay (0.5 to 4 seconds) to desync cats
    const initialDelay = 500 + Math.random() * 3500;
    behaviorTimeoutRef.current = setTimeout(scheduleBehavior, initialDelay);
    
    return () => {
      if (behaviorTimeoutRef.current) clearTimeout(behaviorTimeoutRef.current);
    };
  }, [bounds]);

  // Physics & animation loop
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      // Skip movement logic if dragging
      if (interactionState.isDragging) {
         setRenderPos(prev => prev); // Force re-render if needed, but position is handled by mouse move
         animFrameRef.current = requestAnimationFrame(animate);
         return;
      }
      
      // === REVAMP: Needs Decay ===
      setNeeds(prev => {
        // Recover energy while sleeping
        if (behavior === 'sleeping') {
          return { ...prev, energy: Math.min(100, prev.energy + 0.05 * dt) };
        }
        // Decay otherwise
        return {
          energy: Math.max(0, prev.energy - 0.01 * dt),
          hunger: Math.min(100, prev.hunger + 0.015 * dt),
          fun: Math.max(0, prev.fun - 0.02 * dt),
          affection: Math.max(0, prev.affection - 0.005 * dt)
        };
      });

      // Update phases with personality-based speed
      setTailPhase(p => p + 0.06 * dt * personality.animSpeed);
      setFurPhase(p => p + 0.025 * dt * personality.animSpeed);
      
      const pos = posRef.current;
      const target = targetRef.current;
      
      // Move toward target using easing interpolation
      if (target && (behavior === 'wandering' || behavior === 'playing' || behavior === 'curious')) {
        // Check if target has changed (new destination)
        const targetChanged = target.x !== moveEndRef.current.x || target.y !== moveEndRef.current.y;
        
        // Start new movement if target changed or we finished previous movement
        if (targetChanged || moveProgressRef.current >= 1) {
          const dx = target.x - pos.x;
          const dy = target.y - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 2) {
            // Store start and end for interpolation
            moveStartRef.current = { x: pos.x, y: pos.y };
            moveEndRef.current = { x: target.x, y: target.y };
            moveProgressRef.current = 0;
            
            // Duration based on distance and personality - slower cats take longer
            const baseDuration = behavior === 'playing' ? 2500 : behavior === 'curious' ? 3500 : 4500;
            // Zoomies are super fast!
            const speedMod = emote === '⚡ ZOOMIES! ⚡' ? 3 : personality.speedMultiplier;
            moveDurationRef.current = (baseDuration + dist * 50) / speedMod;
            
            // Only change facing if significantly in the other direction (prevents jitter)
            const shouldFaceRight = dx > 3;
            const shouldFaceLeft = dx < -3;
            if (shouldFaceRight) {
              setFacing('right');
            } else if (shouldFaceLeft) {
              setFacing('left');
            }
            // If dx is between -3 and 3, keep current facing
          }
        }
        
        // Animate with easing
        if (moveProgressRef.current < 1) {
          // Increment progress based on time
          const progressIncrement = (dt * 16.67) / moveDurationRef.current;
          moveProgressRef.current = Math.min(1, moveProgressRef.current + progressIncrement);
          
          // Apply easing
          const easedProgress = easeInOutCubic(moveProgressRef.current);
          
          // Interpolate position between stored start and end
          pos.x = moveStartRef.current.x + (moveEndRef.current.x - moveStartRef.current.x) * easedProgress;
          pos.y = moveStartRef.current.y + (moveEndRef.current.y - moveStartRef.current.y) * easedProgress;
          
          // Track if moving (in middle of animation = fastest)
          setIsMoving(moveProgressRef.current > 0.05 && moveProgressRef.current < 0.95);

          // === REVAMP: Procedural Animation (Squash/Stretch) ===
          // Stretch when moving fast (middle of curve), squash when stopping
          const speed = Math.sin(moveProgressRef.current * Math.PI); // 0 -> 1 -> 0
          const stretch = 1 + speed * 0.15; // Up to 1.15x width
          const squashY = 1 - speed * 0.1;  // Down to 0.9x height
          setSquash({ x: stretch, y: squashY });
          
          // Check if close enough to interact with target (don't wait for exact completion)
          const distToTarget = Math.sqrt(
            Math.pow(moveEndRef.current.x - pos.x, 2) + 
            Math.pow(moveEndRef.current.y - pos.y, 2)
          );
          
          if (distToTarget < 5 && targetObjectRef.current && behavior === 'playing') {
            // Close enough - pounce!
            setIsPouncing(true);
            setEmote('*pounce!*');
            
            const objId = targetObjectRef.current;
            targetObjectRef.current = null; // Clear immediately to prevent repeat
            
            setTimeout(() => {
              if (objId) {
                const elements = document.querySelectorAll(`[data-object-id="${objId}"]`);
                elements.forEach(el => {
                  if (el instanceof HTMLElement) {
                    const isBubble = objId.includes('bubble');
                    
                    if (isBubble) {
                      // Pop the bubble
                      el.click();
                    } else if (!objId.includes('cursor')) {
                      // Bat the toy
                      const rect = el.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const angle = Math.random() * Math.PI * 2;
                      // === REVAMP: Physics Impulse ===
                      // Increased throw distance significantly (50-120px) to ensure visible movement
                      const throwDist = 50 + Math.random() * 70;
                      const endX = centerX + Math.cos(angle) * throwDist;
                      const endY = centerY + Math.sin(angle) * throwDist;
                      
                      el.dispatchEvent(new MouseEvent('mousedown', {
                        bubbles: true,
                        clientX: centerX,
                        clientY: centerY,
                      }));
                      
                      setTimeout(() => {
                        window.dispatchEvent(new MouseEvent('mousemove', {
                          bubbles: true,
                          clientX: endX,
                          clientY: endY,
                        }));
                        setTimeout(() => {
                          window.dispatchEvent(new MouseEvent('mouseup', {
                            bubbles: true,
                            clientX: endX,
                            clientY: endY,
                          }));
                        }, 50);
                      }, 30);
                    }
                  }
                });
              }
              setIsPouncing(false);
              setEmote(null);
            }, 150);
            
            targetRef.current = null;
          }
        } else {
          setIsMoving(false);
          // Return to normal shape
          setSquash(prev => ({
            x: prev.x + (1 - prev.x) * 0.1,
            y: prev.y + (1 - prev.y) * 0.1
          }));
          
          // === REVAMP: Eating & Sleeping Logic ===
          if (behavior === 'wandering' && targetObjectRef.current) {
             // Face the object we just arrived at
             const obj = objectsRef.current.find(o => o.id === targetObjectRef.current);
             if (obj) {
                if (obj.x > pos.x) setFacing('right');
                else setFacing('left');
             }

             if (targetObjectRef.current.includes('food')) {
                // Arrived at food
                setBehavior('eating');
                setEmote('*munch*');
                // Refill hunger
                setNeeds(prev => ({ ...prev, hunger: Math.max(0, prev.hunger - 50) }));
                setTimeout(() => {
                    setBehavior('sitting');
                    setEmote('*burp*');
                    setTimeout(() => setEmote(null), 1000);
                }, 3000);
                targetObjectRef.current = null;
             } else if (targetObjectRef.current.includes('bed')) {
                // Arrived at bed
                setBehavior('sleeping');
                setEmote('*zzz*');
                targetObjectRef.current = null;
             }
          }
        }
      } else {
        setIsMoving(false);
      }
      
      // Bounds
      pos.x = Math.max(bounds.minX, Math.min(bounds.maxX, pos.x));
      pos.y = Math.max(bounds.minY, Math.min(bounds.maxY, pos.y));
      
      // Update render (throttled)
      setRenderPos({ x: pos.x, y: pos.y });
      
      animFrameRef.current = requestAnimationFrame(animate);
    };
    
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [behavior, bounds]);

  // Cursor tracking (throttled)
  useEffect(() => {
    if (!cursorPosition || behavior === 'sleeping') {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }
    
    const dx = cursorPosition.x - renderPos.x;
    const dy = cursorPosition.y - renderPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 35) {
      setPupilOffset({
        x: Math.max(-2, Math.min(2, dx * 0.08)),
        y: Math.max(-1.5, Math.min(1.5, dy * 0.08)),
      });
    } else {
      setPupilOffset({ x: 0, y: 0 });
    }
  }, [cursorPosition, renderPos.x, renderPos.y, behavior]);

  // Blinking
  useEffect(() => {
    if (behavior === 'sleeping') {
      setBlinkOpen(false);
      return;
    }
    
    // Make sure eyes are open when not sleeping
    setBlinkOpen(true);
    
    const blink = () => {
      setBlinkOpen(false);
      setTimeout(() => setBlinkOpen(true), 120);
    };
    
    const interval = setInterval(blink, 3500 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, [behavior]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Start dragging
    setInteractionState(prev => ({ ...prev, isDragging: true, isDangling: true }));
    setBehavior('idle'); // Stop other behaviors
    setEmote('*mew?*');
    
    // Calculate offset from center
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2)
    };
  };

  // Global mouse handlers for dragging
  useEffect(() => {
    if (!interactionState.isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Convert pixels to percentage
      const x = ((e.clientX - dragOffsetRef.current.x) / window.innerWidth) * 100;
      const y = ((e.clientY - dragOffsetRef.current.y) / window.innerHeight) * 100;
      
      // Update position directly (bypassing animation loop)
      posRef.current = { x, y };
      setRenderPos({ x, y });
      
      // Update last mouse pos for petting logic
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleGlobalMouseUp = () => {
      setInteractionState(prev => ({ ...prev, isDragging: false, isDangling: false }));
      setEmote(null);
      
      // Resume movement from new position
      moveStartRef.current = { ...posRef.current };
      moveEndRef.current = { ...posRef.current }; // Stop here
      moveProgressRef.current = 1;
      
      // Maybe fall a bit? (Simple physics)
      // For now, just land
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [interactionState.isDragging]);

  const handleClick = () => {
    if (interactionState.isDragging) return; // Don't click if dragging
    onPet?.();
    setEmote('*purrrr*');
    setBehavior('curious');
    targetRef.current = null;
    setTimeout(() => setEmote(null), 1500);
  };

  // === REVAMP: Petting Logic ===
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Only register petting if we are moving the mouse ON the cat
    const now = Date.now();
    const currentPos = { x: e.clientX, y: e.clientY };
    
    if (lastMousePosRef.current) {
      const dx = currentPos.x - lastMousePosRef.current.x;
      const dy = currentPos.y - lastMousePosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If moving fast enough to be a "rub" but not a "teleport"
      if (dist > 2 && dist < 50) {
        setInteractionState(prev => {
          const newIntensity = Math.min(100, prev.pettingIntensity + dist * 0.5);
          
          // If intensity is high enough, trigger "Petting" state
          if (newIntensity > 30 && !prev.isBeingPetted) {
             setEmote('❤️');
             setNeeds(n => ({ ...n, affection: Math.min(100, n.affection + 5), fun: Math.min(100, n.fun + 2) }));
             return { ...prev, pettingIntensity: newIntensity, isBeingPetted: true };
          }
          return { ...prev, pettingIntensity: newIntensity };
        });
        
        // Reset timeout
        if (pettingTimeoutRef.current) clearTimeout(pettingTimeoutRef.current);
        pettingTimeoutRef.current = setTimeout(() => {
          setInteractionState(prev => ({ ...prev, isBeingPetted: false, pettingIntensity: 0 }));
          setEmote(null);
        }, 500);
      }
    }
    
    lastMousePosRef.current = currentPos;
    setIsHovered(true);
  }, []);

  // Animation values
  const tailWag = Math.sin(tailPhase) * (behavior === 'playing' ? 30 : 12);
  const furWave1 = Math.sin(furPhase) * 1.5;
  const furWave2 = Math.sin(furPhase + 1) * 1.5;
  const breathe = Math.sin(Date.now() / 1000) * 1;
  
  // Walking animation - only animate when actually moving (including curious for cursor following)
  const isWalking = isMoving && (behavior === 'wandering' || behavior === 'playing' || behavior === 'curious');
  const walkCycle = Date.now() / 120; // Speed of walk cycle
  const walkBob = isWalking ? Math.sin(walkCycle * 2) * 1.5 : 0;
  
  // Dangling animation
  const dangleRot = interactionState.isDangling ? Math.sin(Date.now() / 300) * 5 : 0;
  const dangleLegs = interactionState.isDangling ? 15 : 0;
  
  // Leg animation - alternating leg movement
  const frontLeftLeg = interactionState.isDangling ? 20 + dangleRot : (isWalking ? Math.sin(walkCycle) * 12 : 0);
  const frontRightLeg = interactionState.isDangling ? 20 - dangleRot : (isWalking ? Math.sin(walkCycle + Math.PI) * 12 : 0);
  const backLeftLeg = interactionState.isDangling ? 30 + dangleRot : (isWalking ? Math.sin(walkCycle + Math.PI) * 10 : 0);
  const backRightLeg = interactionState.isDangling ? 30 - dangleRot : (isWalking ? Math.sin(walkCycle) * 10 : 0);
  
  const isAsleep = behavior === 'sleeping';
  const isSitting = behavior === 'sitting' || behavior === 'idle' || behavior === 'curious';
  const isGrooming = behavior === 'grooming';
  
  const catId = `cat-${cat.id}`;

  // Pounce animation scale
  const pounceScale = isPouncing ? 1.15 : 1;

  // === DYNAMIC VISUALS CALCULATION ===
  // Advanced Skeleton System with High-Fidelity Control Points
  
  // Default Standing Pose
  let pHead = { x: 85, y: 28 };
  let pNeckTop = { x: 76, y: 26 };
  let pNeckBottom = { x: 74, y: 44 };
  
  let pShoulder = { x: 68, y: 32 };   // top of shoulder blade
  let pChestFront = { x: 76, y: 48 }; // chest/brisket
  let pElbow = { x: 60, y: 50 };      // elbow joint (back of arm) - Higher and further back
  let pRib = { x: 58, y: 48 };        // mid-rib area
  let pFlank = { x: 40, y: 50 };      // side belly start
  let pMidBack = { x: 45, y: 30 };    // spine dip
  let pBelly = { x: 45, y: 52 };      // belly tuck (higher than legs)
  
  let pHipTop = { x: 24, y: 32 };
  let pHipBottom = { x: 24, y: 50 };
  let pHaunch = { x: 25, y: 45 };     // thigh/haunch curve
  let pTailBase = { x: 12, y: 35 };

  // Leg Origins (Feet/Paws)
  let pFrontLeg = { x: 64, y: 75 };   // Front Paw
  let pBackLeg = { x: 18, y: 75 };    // Back Paw
  
  // New Leg Control Points for "Real" Legs
  let pFrontLegTop = { x: 70, y: 48 }; // Armpit
  let pFrontLegKnee = { x: 62, y: 62 }; // Wrist (narrow point)
  let pBackLegThigh = { x: 35, y: 50 }; // Stifle connection to belly
  let pBackLegStifle = { x: 32, y: 56 }; // Front of back leg knee
  let pBackLegHock = { x: 10, y: 58 };  // Hock joint (backward bend)

  // State Modifications
  if (isSitting) {
    pHead = { x: 72, y: 22 };
    pNeckTop = { x: 65, y: 25 };
    pNeckBottom = { x: 65, y: 45 };
    
    pShoulder = { x: 60, y: 38 };
    pChestFront = { x: 68, y: 52 };
    pElbow = { x: 60, y: 60 };
    pRib = { x: 54, y: 55 };
    pFlank = { x: 42, y: 62 };
    pMidBack = { x: 44, y: 45 }; 
    pBelly = { x: 45, y: 70 }; // On ground
    
    pHipTop = { x: 20, y: 60 };
    pHipBottom = { x: 20, y: 72 };
    pHaunch = { x: 26, y: 68 };
    pTailBase = { x: 10, y: 72 };
    
    pFrontLeg = { x: 60, y: 75 }; // Vertical front leg
    pBackLeg = { x: 22, y: 72 };  // Tucked back leg
    
    pFrontLegTop = { x: 64, y: 55 };
    pFrontLegKnee = { x: 60, y: 65 };
    pBackLegThigh = { x: 24, y: 65 };
    pBackLegStifle = { x: 24, y: 68 };
    pBackLegHock = { x: 18, y: 70 };
  } else if (isLoafing) {
    pHead = { x: 78, y: 36 };
    pNeckTop = { x: 70, y: 40 };
    pNeckBottom = { x: 70, y: 55 };
    
    pShoulder = { x: 66, y: 44 };
    pChestFront = { x: 74, y: 55 };
    pElbow = { x: 66, y: 65 };
    pRib = { x: 56, y: 56 };
    pFlank = { x: 44, y: 60 };
    pMidBack = { x: 48, y: 40 };
    pBelly = { x: 48, y: 65 }; // Flat bottom
    
    pHipTop = { x: 26, y: 46 };
    pHipBottom = { x: 26, y: 64 };
    pHaunch = { x: 30, y: 60 };
    pTailBase = { x: 16, y: 50 };
    
    // Legs hidden
    pFrontLeg = { x: 70, y: 65 };
    pBackLeg = { x: 20, y: 65 };
    pFrontLegTop = { x: 70, y: 60 };
    pFrontLegKnee = { x: 70, y: 62 };
    pBackLegStifle = { x: 25, y: 62 };
    pBackLegThigh = { x: 25, y: 62 };
    pBackLegHock = { x: 18, y: 62 };
  } else if (isAsleep) {
    // Tight ball
    pHead = { x: 60, y: 55 };
    pNeckTop = { x: 55, y: 50 };
    pNeckBottom = { x: 55, y: 66 };
    
    pShoulder = { x: 54, y: 46 };
    pChestFront = { x: 58, y: 58 };
    pElbow = { x: 54, y: 66 };
    pRib = { x: 50, y: 56 };
    pFlank = { x: 44, y: 62 };
    pMidBack = { x: 44, y: 36 }; // Arched top
    pBelly = { x: 45, y: 72 }; // Low bottom
    
    pHipTop = { x: 36, y: 46 };
    pHipBottom = { x: 36, y: 66 };
    pHaunch = { x: 40, y: 64 };
    pTailBase = { x: 26, y: 56 };
    
    pFrontLeg = { x: 55, y: 70 };
    pBackLeg = { x: 35, y: 70 };
    pFrontLegTop = { x: 55, y: 65 };
    pFrontLegKnee = { x: 55, y: 68 };
    pBackLegStifle = { x: 38, y: 68 };
    pBackLegThigh = { x: 38, y: 68 };
    pBackLegHock = { x: 30, y: 68 };
  } else if (isPouncing) {
    pHead = { x: 85, y: 55 }; // Head very low
    pNeckTop = { x: 78, y: 50 };
    pNeckBottom = { x: 78, y: 62 };
    
    pShoulder = { x: 72, y: 48 };
    pChestFront = { x: 82, y: 58 };
    pElbow = { x: 72, y: 62 };
    pRib = { x: 60, y: 52 };
    pFlank = { x: 46, y: 50 };
    pMidBack = { x: 48, y: 30 }; // Spine arched ready to spring
    pBelly = { x: 48, y: 55 };
    
    pHipTop = { x: 20, y: 25 }; // Butt very high
    pHipBottom = { x: 20, y: 42 };
    pHaunch = { x: 26, y: 40 };
    pTailBase = { x: 12, y: 30 };
    
    pFrontLeg = { x: 72, y: 65 };
    pBackLeg = { x: 22, y: 45 };
    
    pFrontLegTop = { x: 75, y: 55 };
    pFrontLegKnee = { x: 74, y: 60 };
    pBackLegThigh = { x: 24, y: 35 };
    pBackLegStifle = { x: 24, y: 40 };
    pBackLegHock = { x: 15, y: 40 };
  }

  // Apply breathing and walk bob
  const yMod = breathe + walkBob;
  pHead.y += yMod;
  pNeckTop.y += yMod;
  pNeckBottom.y += yMod;
  pShoulder.y += yMod;
  pChestFront.y += yMod;
  pElbow.y += yMod;
  pRib.y += yMod;
  pFlank.y += yMod;
  pMidBack.y += yMod;
  pBelly.y += yMod;
  pHipTop.y += yMod;
  pHipBottom.y += yMod;
  pHaunch.y += yMod;
  pTailBase.y += yMod;
  pFrontLeg.y += yMod;
  pBackLeg.y += yMod;
  pFrontLegTop.y += yMod;
  pFrontLegKnee.y += yMod;
  pBackLegThigh.y += yMod;
  pBackLegStifle.y += yMod;
  pBackLegHock.y += yMod;
  
  // Leg visibility flags
  const hasLegs = !isLoafing && !isAsleep;
  const showDetachedLegs = interactionState.isDangling; // only show separate leg shapes when dangling

  // Construct Body Path
  // Refined for smoother, more organic cat silhouette without spikes
  // Uses control points lifted relative to internal anatomy to create proper convex curves
  const bodyPathWithLegs = `
    M ${pNeckTop.x} ${pNeckTop.y}
    C ${pShoulder.x} ${pShoulder.y - 5} ${pMidBack.x} ${pMidBack.y - 2} ${pTailBase.x} ${pTailBase.y}
    C ${pTailBase.x - 5} ${pTailBase.y + 10} ${pBackLegHock.x + 5} ${pBackLegHock.y - 10} ${pBackLegHock.x} ${pBackLegHock.y}
    L ${pBackLeg.x - 4} ${pBackLeg.y}
    C ${pBackLeg.x - 4} ${pBackLeg.y + 4} ${pBackLeg.x + 8} ${pBackLeg.y + 4} ${pBackLeg.x + 8} ${pBackLeg.y}
    L ${pBackLegStifle.x} ${pBackLegStifle.y}
    C ${pBackLegStifle.x + 5} ${pBackLegStifle.y - 10} ${pBackLegThigh.x} ${pBackLegThigh.y + 5} ${pBelly.x} ${pBelly.y}
    C ${pBelly.x + 10} ${pBelly.y - 2} ${pElbow.x - 5} ${pElbow.y + 10} ${pElbow.x} ${pElbow.y}
    L ${pFrontLegKnee.x} ${pFrontLegKnee.y}
    L ${pFrontLeg.x - 3} ${pFrontLeg.y}
    C ${pFrontLeg.x - 3} ${pFrontLeg.y + 4} ${pFrontLeg.x + 6} ${pFrontLeg.y + 4} ${pFrontLeg.x + 6} ${pFrontLeg.y}
    L ${pFrontLegKnee.x + 5} ${pFrontLegKnee.y}
    C ${pFrontLegKnee.x + 5} ${pFrontLegKnee.y - 10} ${pChestFront.x - 5} ${pChestFront.y + 10} ${pChestFront.x} ${pChestFront.y}
    C ${pChestFront.x + 5} ${pChestFront.y - 5} ${pNeckBottom.x} ${pNeckBottom.y + 5} ${pNeckTop.x} ${pNeckTop.y}
  `;

  const bodyPathCompact = `
    M ${pNeckTop.x} ${pNeckTop.y}
    Q ${pShoulder.x} ${pShoulder.y - 3} ${pMidBack.x} ${pMidBack.y}
    Q ${pTailBase.x + 10} ${pTailBase.y - 5} ${pTailBase.x} ${pTailBase.y}
    Q ${pHipBottom.x} ${pHipBottom.y} ${pBelly.x} ${pBelly.y}
    Q ${pChestFront.x} ${pChestFront.y} ${pNeckBottom.x} ${pNeckBottom.y}
    L ${pNeckTop.x} ${pNeckTop.y}
  `;

  const bodyPath = hasLegs ? bodyPathWithLegs : bodyPathCompact;
  
  return (
    <div
      className={`absolute cursor-pointer select-none ${interactionState.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${renderPos.x}%`,
        top: `${renderPos.y}%`,
        transform: `translate(-50%, -50%) scaleX(${facing === 'left' ? -1 : 1}) scale(${pounceScale}) scale(1, ${squash.y}) rotate(${interactionState.isDangling ? Math.sin(Date.now()/500)*5 : 0}deg)`,
        transition: interactionState.isDragging ? 'none' : isPouncing ? 'transform 0.1s ease-out' : 'transform 0.08s ease-out',
        zIndex: isPouncing || interactionState.isDragging ? 50 : 20,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Emote and name rendered via portal to avoid parent transform */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* HUD */}
          <CatStatusHUD 
            name={cat.name} 
            variant={cat.variant} 
            stats={needs} 
            isVisible={isHovered || interactionState.isBeingPetted} 
          />

          {/* Floating Emotes/Name */}
          {(emote || isHovered) && (
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: `${renderPos.x}%`,
                top: `${renderPos.y}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {/* Emote bubble */}
              {emote && (
                <div 
                  className="text-sm font-medium animate-bounce whitespace-nowrap px-3 py-1.5 rounded-2xl mb-2 text-center shadow-sm border border-gray-100"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: colors.dark,
                  }}
                >
                  {emote}
                </div>
              )}
              {/* Cat name on hover */}
              {isHovered && !emote && (
                <div 
                  className="text-xs font-bold whitespace-nowrap px-2 py-1 rounded-lg text-center shadow-sm backdrop-blur-sm"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    color: colors.dark,
                  }}
                >
                  {cat.name}
                </div>
              )}
            </div>
          )}
        </>,
        document.body
      )}

      <svg 
        width="200" 
        height="150" 
        viewBox="0 0 240 185"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Fur gradient */}
          <radialGradient id={`${catId}-body`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors.fur} />
            <stop offset="60%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </radialGradient>
          
          {/* Soft shadow */}
          <filter id={`${catId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={colors.dark} floodOpacity="0.15" />
          </filter>
        </defs>

        <g 
          filter={`url(#${catId}-shadow)`}
          transform={`translate(0, 0)`}
        >
          <path 
            d={
              (behavior === 'wandering' || behavior === 'playing' || isMoving) ? POSE_ASSET_2 :
              (isPouncing) ? POSE_ASSET_3 :
              POSE_ASSET_1
            }
            fill={`url(#${catId}-body)`}
            stroke={colors.dark}
            strokeWidth="1"
            style={{
              transition: 'd 0.3s ease-in-out'
            }}
          />
        </g>
      </svg>
    </div>
  );
});
