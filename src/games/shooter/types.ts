/**
 * src/games/shooter/types.ts · 纵向射击核心类型
 */
export type EnemyType = 'basic' | 'fast' | 'tank' | 'bomber';
export type Status = 'ready' | 'playing' | 'paused' | 'over';

export interface Player {
  x: number;   // 0..1 归一化屏幕宽
  y: number;   // 0..1 归一化屏幕高(0=top,1=bottom)
  fireCooldown: number; // tick 数,0 才可再发射
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;        // 0..1
  y: number;        // 0..1
  hp: number;
  vx: number;       // -1..+1 lane drift per tick
  vy: number;       // tick 步进(0.005..0.02)
  born: number;     // tick 出生时间(给 bomber 计时)
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vy: number;       // 向上
}

export interface State {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  score: number;
  combo: number;
  maxCombo: number;
  spawnTick: number;     // 下次 spawn 的 tick
  tickCount: number;
  status: Status;
  nextEnemyId: number;
  nextBulletId: number;
}