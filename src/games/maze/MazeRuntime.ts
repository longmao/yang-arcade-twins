/**
 * src/games/maze/MazeRuntime.ts · spec §8 game logic
 * 4 鬼完整 AI + 能量模式 + 3 命 + 通关 + 重生无敌 + 鬼慢
 * spec §3.2 #5: 游戏逻辑独立于 React · 状态机纯函数
 */
import { buildGrid, GHOST_SPAWNS, PLAYER_SPAWN } from './MazeConfig';
import type { Dir, Ghost, Pos, State, Tile } from './types';

const LIVES_START = 3;
const POWER_DURATION_TICKS = 60 * 6;
const TICK_RATE = 60;
const GHOST_CHAIN: number[] = [200, 400, 800, 1600];
const INVULN_TICKS_AFTER_DEATH = 60 * 1.2;
const INVULN_TICKS_AT_SPAWN = 60 * 1.5;
const POWER_BLINK_TICKS = 60 * 1.5;
const SCATTER_TICKS = 60 * 6;
const CHASE_TICKS = 60 * 18;

const DIR_DELTAS: Record<Dir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  none: [0, 0],
};

export function countPellets(g: Tile[][]): number {
  return g.flat().filter((c) => c === '.' || c === 'p').length;
}

export function createInitial(): State {
  return {
    grid: buildGrid(),
    player: { ...PLAYER_SPAWN },
    playerDir: 'right',
    playerNextDir: 'right',
    ghosts: GHOST_SPAWNS.map((g) => ({
      id: g.id,
      pos: { x: g.x, y: g.y },
      color: g.color,
      strategy: g.strategy,
      mode: 'scatter',
    })),
    score: 0,
    pellets: countPellets(buildGrid()),
    lives: LIVES_START,
    powerModeTicks: 0,
    powerChain: 0,
    invulnTicks: INVULN_TICKS_AT_SPAWN,
    status: 'ready',
    tick: 0,
  };
}

function tileAt(grid: Tile[][], p: Pos): Tile {
  if (p.y < 0 || p.y >= grid.length || p.x < 0 || p.x >= grid[0].length) return 'w';
  return grid[p.y][p.x];
}

function tryMove(grid: Tile[][], from: Pos, dir: Dir): Pos {
  if (dir === 'none') return from;
  const [dx, dy] = DIR_DELTAS[dir];
  const nx = from.x + dx;
  const ny = from.y + dy;
  if (tileAt(grid, { x: nx, y: ny }) === 'w') return from;
  return { x: nx, y: ny };
}

function dist(a: Pos, b: Pos) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function targetFor(g: Ghost, player: Pos): Pos {
  switch (g.strategy) {
    case 'chase':
      return { ...player };
    case 'ambush':
      return { x: player.x + 3, y: player.y };
    case 'flank':
      return { x: Math.abs(player.x - g.pos.x) + player.x, y: player.y };
    case 'shy':
      return dist(player, g.pos) > 6 ? { ...player } : { x: 1, y: 1 };
  }
}

// spec §8.4 + 难度调整: 鬼每 2 tick 才走 1 格 (慢于 player, 给娃上手时间)
function nextGhostPos(grid: Tile[][], from: Pos, target: Pos, tick: number): Pos {
  if (tick % 2 !== 0) return from;
  const dirs: Dir[] = ['up', 'down', 'left', 'right'];
  let best: Pos = from;
  let bestD = Infinity;
  for (const d of dirs) {
    const next = tryMove(grid, from, d);
    if (next.x === from.x && next.y === from.y) continue;
    const d2 = dist(next, target);
    if (d2 < bestD) {
      bestD = d2;
      best = next;
    }
  }
  return best;
}

function scheduleMode(prev: State): 'scatter' | 'chase' {
  const totalSinceStart = prev.tick;
  if (totalSinceStart < SCATTER_TICKS) return 'scatter';
  if (totalSinceStart < SCATTER_TICKS + CHASE_TICKS) return 'chase';
  return 'chase';
}

export function tick(prev: State): State {
  if (prev.status !== 'playing') return prev;
  const grid = prev.grid;
  // 玩家移动
  let playerDir = prev.playerDir;
  let player = tryMove(grid, prev.player, playerDir);
  const cand = tryMove(grid, player, prev.playerNextDir);
  if (cand.x !== player.x || cand.y !== player.y) {
    playerDir = prev.playerNextDir;
    player = cand;
  }
  // 吃 pellet
  let score = prev.score;
  let pelletsLeft = prev.pellets;
  let powerModeTicks = prev.powerModeTicks;
  let powerChain = 0;
  const tile = tileAt(grid, player);
  if (tile === '.' || tile === 'p') {
    grid[player.y][player.x] = ' ';
    score += tile === 'p' ? 50 : 10;
    pelletsLeft -= 1;
    if (tile === 'p') powerModeTicks = POWER_DURATION_TICKS;
  }
  if (powerModeTicks > 0) powerModeTicks -= 1;
  const inPower = powerModeTicks > 0;
  // 鬼移动
  const mode: 'scatter' | 'chase' | 'frightened' = inPower ? 'frightened' : scheduleMode(prev);
  let ghosts: Ghost[] = prev.ghosts.map((g) => {
    const tgt = targetFor(g, player);
    return { ...g, pos: nextGhostPos(grid, g.pos, tgt, prev.tick), mode };
  });
  // 无敌倒计时
  let invulnTicks = prev.invulnTicks ?? INVULN_TICKS_AT_SPAWN;
  if (invulnTicks > 0) invulnTicks -= 1;
  // 撞鬼
  let lives = prev.lives;
  let status: State['status'] = 'playing';
  const hitIdx = ghosts.findIndex((g) => g.pos.x === player.x && g.pos.y === player.y);
  if (hitIdx >= 0 && invulnTicks <= 0) {
    if (inPower) {
      const chain = prev.powerChain + 1;
      score += GHOST_CHAIN[Math.min(chain - 1, GHOST_CHAIN.length - 1)];
      ghosts = ghosts.map((g, i) =>
        i === hitIdx ? { ...g, pos: { ...PLAYER_SPAWN } } : g,
      );
      powerChain = chain;
    } else {
      lives -= 1;
      player = { ...PLAYER_SPAWN };
      ghosts = GHOST_SPAWNS.map((g) => ({
        id: g.id,
        pos: { x: g.x, y: g.y },
        color: g.color,
        strategy: g.strategy,
        mode: 'scatter' as const,
      }));
      powerModeTicks = 0;
      invulnTicks = INVULN_TICKS_AFTER_DEATH;
      if (lives <= 0) status = 'over';
    }
  }
  if (pelletsLeft <= 0) status = 'win';
  return {
    ...prev,
    grid,
    player,
    playerDir,
    ghosts,
    score,
    pellets: pelletsLeft,
    lives,
    powerModeTicks,
    powerChain,
    invulnTicks,
    status,
    tick: prev.tick + 1,
  };
}

export function setDir(s: State, dir: Dir): State {
  return {
    ...s,
    playerNextDir: dir,
    status: s.status === 'ready' ? 'playing' : s.status,
  };
}

export const TICK_HZ = TICK_RATE;