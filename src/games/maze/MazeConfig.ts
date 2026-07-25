/**
 * src/games/maze/MazeConfig.ts · 19×21 经典迷宫 spec §8.2
 * 海信 Harness:数据驱动
 */
import { Tile } from './types';

export const COLS = 19;
export const ROWS = 21;

// 19×21 经典迷宫布局 (简化版)
const RAW: string[] = [
  'wwwwwwwwwwwwwwwwwww',
  'w........w........w',
  'w.wp.ww.w.w.ww.wp.w',
  'w.................w',
  'w.ww.w.wwwwww.w.ww.w',
  'w....w...w...w....w',
  'wwww.www.w.www.wwww',
  'w....w...s...w....w',
  'wwww.w.wwwwww.w.ww.w',
  'w........w........w',
  'w.ww.w.w.p.w.w.ww.w',
  'w....w.....w.....w',
  'wwww.w.wwwwww.w.wwww',
  'w....w.......w....w',
  'w.ww.w.wwwwww.w.ww.w',
  'w....w...w...w....w',
  'wwww.www.w.www.wwww',
  'w........w........w',
  'w.wp.ww.w.w.ww.wp.w',
  'w.................w',
  'wwwwwwwwwwwwwwwwwww',
];

export function buildGrid(): Tile[][] {
  return RAW.map((row) =>
    row.split('').map((c) => {
      if (c === 'w') return 'w' as Tile;
      if (c === '.') return '.' as Tile;
      if (c === 'p') return 'p' as Tile;
      return ' ' as Tile;
    }),
  );
}

export const PLAYER_SPAWN = { x: 9, y: 11 };
export const GHOST_SPAWNS: { id: 'blinky' | 'pinky' | 'inky' | 'clyde'; x: number; y: number; color: string; strategy: 'chase' | 'ambush' | 'flank' | 'shy' }[] = [
  { id: 'blinky', x: 9, y: 9, color: '#FF3B3B', strategy: 'chase' },
  { id: 'pinky', x: 9, y: 10, color: '#FFB3FF', strategy: 'ambush' },
  { id: 'inky', x: 8, y: 10, color: '#3BD9FF', strategy: 'flank' },
  { id: 'clyde', x: 10, y: 10, color: '#FFB13B', strategy: 'shy' },
];