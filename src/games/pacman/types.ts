/**
 * src/games/pacman/types.ts · 吃豆人核心类型
 * 海信 Harness #1:单一职责,无外部依赖
 */
export type Dir = 'L' | 'R' | 'U' | 'D' | '.';
export type Tile = 'w' | '.' | ' ' | 'p'; // wall · pellet · empty · power pellet
export type Status = 'ready' | 'playing' | 'paused' | 'over';

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
  status: Status;
  tick: number; // 单调递增,驱动动画帧
}
