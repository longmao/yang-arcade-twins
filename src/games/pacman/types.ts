/**
 * src/games/pacman/types.ts · 吃豆人核心类型(spec P1-C)
 */
export type Dir = 'L' | 'R' | 'U' | 'D' | '.';
export type Tile = 'w' | '.' | ' ' | 'p';
export type Status = 'ready' | 'playing' | 'paused' | 'over' | 'win';

export interface Pos { x: number; y: number }

export interface Ghost {
  id: 'blinky' | 'pinky' | 'inky' | 'clyde';
  pos: Pos;
  color: string;
  strategy: 'chase' | 'ambush' | 'flank' | 'shy';
}

export interface State {
  grid: Tile[][];
  player: Pos;
  playerDir: Dir;
  playerNextDir: Dir;
  ghosts: Ghost[];
  score: number;
  pellets: number;
  lives: number;
  powerModeTicks: number; // 0 = 不在能量模式
  powerChain: number;     // 连吃鬼数(0..4)
  status: Status;
  tick: number;
}