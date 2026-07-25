/**
 * src/games/shooter/game.ts · 状态机 + tick + spawn + 碰撞
 * 海信 Harness:单文件 ≤100 行,职责清晰
 */
import { Bullet, Enemy, EnemyType, Player, State } from './types';

const TICK_MS = 60;
const LANES = [0.2, 0.5, 0.8];

export const SCORE_TABLE: Record<EnemyType, number> = {
  basic: 10, fast: 15, tank: 50, bomber: 30,
};

export const HP_TABLE: Record<EnemyType, number> = {
  basic: 1, fast: 1, tank: 3, bomber: 1,
};

export const VY_TABLE: Record<EnemyType, number> = {
  basic: 0.008, fast: 0.014, tank: 0.006, bomber: 0.010,
};

function makeInitialPlayer(): Player {
  return { x: 0.5, y: 0.85, fireCooldown: 0 };
}

export function createInitial(): State {
  return {
    player: makeInitialPlayer(),
    enemies: [],
    bullets: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    spawnTick: 20,
    tickCount: 0,
    status: 'ready',
    nextEnemyId: 1,
    nextBulletId: 1,
  };
}

function spawnEnemy(s: State): Enemy {
  const r = Math.random();
  const type: EnemyType = r < 0.6 ? 'basic' : r < 0.8 ? 'fast' : r < 0.95 ? 'bomber' : 'tank';
  const lane = LANES[Math.floor(Math.random() * LANES.length)] + (Math.random() - 0.5) * 0.1;
  return {
    id: s.nextEnemyId,
    type,
    x: Math.max(0.05, Math.min(0.95, lane)),
    y: 0,
    hp: HP_TABLE[type],
    vx: 0,
    vy: VY_TABLE[type],
    born: s.tickCount,
  };
}

function difficultyInterval(tick: number): number {
  if (tick < 100) return 22;
  if (tick < 300) return 16;
  if (tick < 600) return 10;
  return 6;
}

function collide(a: { x: number; y: number }, b: { x: number; y: number }, r: number) {
  return Math.abs(a.x - b.x) < r && Math.abs(a.y - b.y) < r;
}

export function shoot(s: State): State {
  if (s.status === 'over' || s.player.fireCooldown > 0) return s;
  return {
    ...s,
    bullets: [...s.bullets, { id: s.nextBulletId, x: s.player.x, y: s.player.y - 0.05, vy: 0.025 }],
    player: { ...s.player, fireCooldown: 3 },
    nextBulletId: s.nextBulletId + 1,
    status: s.status === 'ready' ? 'playing' : s.status,
  };
}

export function movePlayer(s: State, dx: number, dy: number): State {
  if (s.status !== 'playing' && s.status !== 'ready') return s;
  return {
    ...s,
    player: {
      ...s.player,
      x: Math.max(0.05, Math.min(0.95, s.player.x + dx)),
      y: Math.max(0.2, Math.min(0.92, s.player.y + dy)),
      fireCooldown: Math.max(0, s.player.fireCooldown - 1),
    },
    status: 'playing',
  };
}

export function tick(prev: State): State {
  if (prev.status !== 'playing') return prev;
  let s: State = { ...prev, tickCount: prev.tickCount + 1 };
  // 玩家 fireCooldown 衰减
  if (s.player.fireCooldown > 0) {
    s = { ...s, player: { ...s.player, fireCooldown: s.player.fireCooldown - 1 } };
  }
  // 子弹推进 + 越界移除
  let bullets = s.bullets
    .map((b) => ({ ...b, y: b.y - b.vy }))
    .filter((b) => b.y > -0.05);
  // 敌机推进
  let enemies = s.enemies.map((e) => ({ ...e, y: e.y + e.vy }));
  // 子弹命中敌机
  let score = s.score;
  let combo = s.combo + 0; // 累计在循环里
  const remainingBullets: Bullet[] = [];
  for (const b of bullets) {
    let hit = false;
    enemies = enemies.map((e) => {
      if (!hit && collide(b, e, 0.05)) {
        hit = true;
        score += SCORE_TABLE[e.type] + (combo >= 3 ? 5 : 0);
        combo += 1;
        return { ...e, hp: e.hp - 1 };
      }
      return e;
    });
    if (!hit) remainingBullets.push(b);
  }
  bullets = remainingBullets;
  // 敌机死亡 (hp<=0)
  const beforeEnemyCount = enemies.length;
  enemies = enemies.filter((e) => e.hp > 0);
  const died = beforeEnemyCount - enemies.length;
  // combo reset on 长时间没命中(简化:死亡时 reset)
  // 敌机撞玩家
  let gameOver = false;
  for (const e of enemies) {
    if (collide(s.player, e, 0.05)) {
      gameOver = true;
      break;
    }
  }
  // 敌机 spawn
  if (s.tickCount >= s.spawnTick && enemies.length < 6) {
    enemies = [...enemies, spawnEnemy(s)];
    s = { ...s, spawnTick: s.tickCount + difficultyInterval(s.tickCount) };
  }
  return {
    ...s,
    bullets,
    enemies,
    score,
    combo,
    maxCombo: Math.max(s.maxCombo, combo),
    status: gameOver ? 'over' : 'playing',
  };
}