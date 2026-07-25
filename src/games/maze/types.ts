/**
 * src/games/maze/types.ts · spec §3.2 架构 + §8 spec 类型
 */
export type Tile = 'w' | '.' | ' ' | 'p';
export type Dir = 'up' | 'down' | 'left' | 'right' | 'none';
export type EnemyMode = 'scatter' | 'chase' | 'frightened' | 'eaten';
export type Status = 'ready' | 'playing' | 'paused' | 'over' | 'win';

export interface Pos { x: number; y: number }

export interface Ghost {
  id: 'blinky' | 'pinky' | 'inky' | 'clyde';
  pos: Pos;
  color: string;
  strategy: 'chase' | 'ambush' | 'flank' | 'shy';
  mode: EnemyMode;
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
  powerModeTicks: number;
  powerChain: number;
  status: Status;
  tick: number;
}