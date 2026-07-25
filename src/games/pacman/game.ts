/**
 * src/games/pacman/game.ts · 状态机 + tick
 * 海信 Harness:单文件 ≤100 行,职责清晰
 */
import { buildGrid } from './grid';
import { step, targetFor } from './ai';
import { Dir, Ghost, Pos, State, Tile } from './types';

const START: Pos = { x: 1, y: 1 };

const GHOST_STARTS: { id: Ghost['id']; pos: Pos; color: string; strategy: Ghost['strategy'] }[] = [
  { id: 'blinky', pos: { x: 9, y: 1 }, color: '#FF3B3B', strategy: 'chase' },
  { id: 'pinky', pos: { x: 9, y: 8 }, color: '#FFB3FF', strategy: 'ambush' },
  { id: 'inky', pos: { x: 1, y: 8 }, color: '#3BD9FF', strategy: 'flank' },
  { id: 'clyde', pos: { x: 16, y: 8 }, color: '#FFB13B', strategy: 'shy' },
];

const DELTAS: Record<Dir, [number, number]> = {
  L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1], '.': [0, 0],
};

export function createInitial(): State {
  return {
    grid: buildGrid(),
    player: START,
    playerDir: 'R',
    playerNextDir: 'R',
    ghosts: GHOST_STARTS.map((g) => ({ id: g.id, pos: g.pos, color: g.color, strategy: g.strategy })),
    score: 0,
    pellets: countPellets(buildGrid()),
    status: 'ready',
    tick: 0,
  };
}

export function countPellets(g: Tile[][]): number {
  return g.flat().filter((c) => c === '.' || c === 'p').length;
}

function tryMove(grid: Tile[][], from: Pos, dir: Dir): Pos {
  if (dir === '.') return from;
  const [dx, dy] = DELTAS[dir];
  const nx = from.x + dx;
  const ny = from.y + dy;
  if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return from;
  if (grid[ny][nx] === 'w') return from;
  return { x: nx, y: ny };
}

export function tick(prev: State): State {
  if (prev.status !== 'playing') return prev;
  const grid = prev.grid;
  let playerDir = prev.playerDir;
  let player = tryMove(grid, prev.player, playerDir);
  const candidate = tryMove(grid, player, prev.playerNextDir);
  if (candidate.x !== player.x || candidate.y !== player.y) {
    playerDir = prev.playerNextDir;
    player = candidate;
  }
  // 吃 pellet
  let score = prev.score;
  let pelletsLeft = prev.pellets;
  const tile = grid[player.y][player.x];
  if (tile === '.' || tile === 'p') {
    grid[player.y][player.x] = ' ';
    score += tile === 'p' ? 10 : 1;
    pelletsLeft -= 1;
  }
  // ghost 移动
  const ghosts = prev.ghosts.map((g) => {
    const tgt = targetFor(g, player);
    return { ...g, pos: step(grid, g, tgt) };
  });
  // 撞鬼 → game over
  const hit = ghosts.some((g) => g.pos.x === player.x && g.pos.y === player.y);
  return {
    ...prev,
    grid,
    player,
    playerDir,
    ghosts,
    score,
    pellets: pelletsLeft,
    status: hit ? 'over' : 'playing',
    tick: prev.tick + 1,
  };
}

export function setDir(s: State, dir: Dir): State {
  return { ...s, playerNextDir: dir, status: s.status === 'ready' ? 'playing' : s.status };
}
