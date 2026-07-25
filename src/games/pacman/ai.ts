/**
 * src/games/pacman/ai.ts · 4 鬼 AI(简化 chase 派)
 * Blinky 直追 · Pinky 前 2 格 · Inky flank · Clyde 远追近逃
 * Sprint 1 简版:全部用 BFS 1 步 lookahead 选最优
 */
import { Dir, Ghost, Pos, Tile } from './types';

const DIRS: Record<Dir, [number, number]> = {
  L: [-1, 0],
  R: [1, 0],
  U: [0, -1],
  D: [0, 1],
  '.': [0, 0],
};

export function targetFor(g: Ghost, player: Pos): Pos {
  switch (g.strategy) {
    case 'chase':
      return { ...player };
    case 'ambush':
      return { x: player.x + 2, y: player.y };
    case 'flank':
      return { x: Math.abs(player.x - g.pos.x) + player.x, y: player.y };
    case 'shy':
      return Math.abs(player.x - g.pos.x) + Math.abs(player.y - g.pos.y) > 6
        ? { ...player }
        : { x: 1, y: 1 };
  }
}

export function nextDir(grid: Tile[][], from: Pos, target: Pos): Dir {
  const candidates: Dir[] = ['L', 'R', 'U', 'D'];
  let best: Dir = '.';
  let bestDist = Infinity;
  for (const d of candidates) {
    const [dx, dy] = DIRS[d];
    const nx = from.x + dx;
    const ny = from.y + dy;
    if (ny < 0 || ny >= grid.length) continue;
    if (nx < 0 || nx >= grid[0].length) continue;
    if (grid[ny][nx] === 'w') continue;
    const dist = Math.abs(nx - target.x) + Math.abs(ny - target.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}

export function step(grid: Tile[][], g: Ghost, target: Pos): Pos {
  const dir = nextDir(grid, g.pos, target);
  if (dir === '.') return g.pos;
  const [dx, dy] = DIRS[dir];
  return { x: g.pos.x + dx, y: g.pos.y + dy };
}
