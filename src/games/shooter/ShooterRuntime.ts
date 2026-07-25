/**
 * src/games/shooter/ShooterRuntime.ts · spec §9 完整 shooter game logic
 * 4 敌机 + 子弹池 + 4 波 + 精英 + 强化 + 60Hz fixed step
 */
export type EnemyKind = 'recon' | 'sine' | 'charger' | 'turret' | 'elite';
export type PowerUpKind = 'weapon' | 'shield' | 'bomb';
export type Status = 'ready' | 'playing' | 'paused' | 'over' | 'win';

export interface Bullet {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 'player' | 'enemy';
  damage: number;
}

export interface Enemy {
  active: boolean;
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  phase: number;       // 摆动战机用
  fireCooldown: number; // 炮艇/精英用
  age: number;
}

export interface PowerUp {
  active: boolean;
  kind: PowerUpKind;
  x: number;
  y: number;
  vy: number;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Player {
  x: number;
  y: number;
  hp: number;
  weaponLevel: number;
  invulnTicks: number;
  fireInterval: number;
  fireCooldown: number;
  shield: boolean;
}

export interface State {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
  score: number;
  combo: number;
  maxCombo: number;
  comboTimeout: number; // 100ms ticks 剩
  bombFx: number;
  weaponLevel: number;
  weaponXp: number;
  spawnTimer: number;
  wave: number;
  tick: number;
  status: Status;
}

const W: number = 390;
const H: number = 700; // nominal 上下限

const FIRE_INTERVAL_MS = 180;
const TICK_HZ = 60;
const TICK_MS = 1000 / TICK_HZ;
const INVULN_TICKS = 60 * 1.6;
const COMBO_TIMEOUT_TICKS = 60 * 2.2;
const BOMB_DURATION_TICKS = 30;

const ENEMY_DEFAULTS: Record<EnemyKind, { hp: number; score: number; color: string; size: number }> = {
  recon: { hp: 1, score: 100, color: '#FF6B6B', size: 18 },
  sine: { hp: 2, score: 200, color: '#FFE54B', size: 22 },
  charger: { hp: 3, score: 300, color: '#FF9F43', size: 24 },
  turret: { hp: 10, score: 800, color: '#A78BFA', size: 36 },
  elite: { hp: 80, score: 5000, color: '#FF3B3B', size: 60 },
};

const VY_SCALE = 6; // 60Hz 跑 5 秒要看到敌机 → vy 乘 6

const WAVES: { duration: number; spawns: { kind: EnemyKind; interval: number }[] }[] = [
  { duration: 30, spawns: [{ kind: 'recon', interval: 1.6 }, { kind: 'sine', interval: 4 }] },
  { duration: 45, spawns: [{ kind: 'recon', interval: 1.2 }, { kind: 'sine', interval: 2.5 }, { kind: 'charger', interval: 6 }] },
  { duration: 45, spawns: [{ kind: 'sine', interval: 2 }, { kind: 'charger', interval: 4 }, { kind: 'turret', interval: 12 }] },
  { duration: 35, spawns: [{ kind: 'sine', interval: 1.5 }, { kind: 'charger', interval: 3 }, { kind: 'turret', interval: 8 }] },
];

export function createInitial(): State {
  return {
    player: {
      x: W / 2,
      y: H - 80,
      hp: 3,
      weaponLevel: 1,
      invulnTicks: 0,
      fireInterval: FIRE_INTERVAL_MS,
      fireCooldown: 0,
      shield: false,
    },
    enemies: [],
    bullets: [],
    powerUps: [],
    particles: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    comboTimeout: 0,
    bombFx: 0,
    weaponLevel: 1,
    weaponXp: 0,
    spawnTimer: 0,
    wave: 0,
    tick: 0,
    status: 'playing',
  };
}

function makeBullet(x: number, y: number, vy: number, team: 'player' | 'enemy', damage: number): Bullet {
  return { active: true, x, y, vx: 0, vy, team, damage };
}

function makeEnemy(kind: EnemyKind, x: number, y: number): Enemy {
  const d = ENEMY_DEFAULTS[kind];
  const base: Enemy = {
    active: true, kind, x, y, hp: d.hp, maxHp: d.hp, vx: 0, vy: 0, phase: 0, fireCooldown: 0, age: 0,
  };
  if (kind === 'recon') base.vy = 1.4 * VY_SCALE;
  else if (kind === 'sine') base.vy = 1.1 * VY_SCALE;
  else if (kind === 'charger') { base.vy = 0; base.vx = 0; }
  else if (kind === 'turret') { base.vy = 0.4 * VY_SCALE; base.fireCooldown = 60; }
  else if (kind === 'elite') { base.vy = 0; base.vx = 1.5; base.fireCooldown = 72; }
  return base;
}

function weaponDamage(level: number) {
  return [1, 1, 1, 2][Math.min(level - 1, 3)];
}

function tryFire(state: State): { bullets: Bullet[]; cooldown: number } {
  const p = state.player;
  if (p.fireCooldown > 0 || p.weaponLevel <= 0) return { bullets: [], cooldown: Math.max(0, p.fireCooldown - 1) };
  const lvl = p.weaponLevel;
  const dmg = weaponDamage(lvl);
  const bullets: Bullet[] = [];
  const speed = -8;
  // L1/L2: straight · L3: 3-way · L4: 2 straight + 2 sides
  if (lvl === 1) bullets.push(makeBullet(p.x, p.y - 18, speed, 'player', dmg));
  if (lvl === 2) {
    bullets.push(makeBullet(p.x - 8, p.y - 18, speed, 'player', dmg));
    bullets.push(makeBullet(p.x + 8, p.y - 18, speed, 'player', dmg));
  }
  if (lvl === 3) {
    bullets.push(makeBullet(p.x, p.y - 18, speed, 'player', dmg));
    bullets.push(makeBullet(p.x, p.y - 18, speed * 0.85, 'player', dmg));
    bullets.push(makeBullet(p.x, p.y - 18, speed * 1.15, 'player', dmg));
  }
  if (lvl >= 4) {
    bullets.push(makeBullet(p.x - 6, p.y - 18, speed, 'player', dmg));
    bullets.push(makeBullet(p.x + 6, p.y - 18, speed, 'player', dmg));
    bullets.push(makeBullet(p.x - 14, p.y - 18, speed * 0.92, 'player', dmg));
    bullets.push(makeBullet(p.x + 14, p.y - 18, speed * 0.92, 'player', dmg));
  }
  return { bullets, cooldown: Math.max(1, Math.round((FIRE_INTERVAL_MS - (lvl - 1) * 12) / TICK_MS)) };
}

function spawnEnemy(state: State, kind: EnemyKind): Enemy {
  const x = 30 + Math.random() * (W - 60);
  return makeEnemy(kind, x, 20);
}

export function tick(prev: State, now: number): State {
  if (prev.status !== 'playing') return prev;
  let s = { ...prev, tick: prev.tick + 1 };
  const dt = TICK_MS / 1000;
  // 玩家移动 (跟手指) — 用 input.targetX/targetY 输入,留给 component
  // 自动射击
  const fire = tryFire(s);
  s = { ...s, bullets: [...s.bullets, ...fire.bullets] };
  s.player.fireCooldown = fire.cooldown;
  // bullet 推进
  s.bullets = s.bullets
    .map((b) => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
    .filter((b) => b.active && b.y > -20 && b.y < H + 20 && b.x > -20 && b.x < W + 20);
  // enemy 推进 — y 是 logical 单位 (0..700),每秒移动 VY * 60 logical units (1 logical unit = 1 pt screen)
  s.enemies = s.enemies.map((e) => {
    let { x, y, vx, vy, phase, fireCooldown, age } = e;
    age += 1;
    if (e.kind === 'recon') y += vy / 60;
    else if (e.kind === 'sine') {
      y += vy / 60;
      x += Math.sin(age / 30) * 1.6;
    } else if (e.kind === 'charger') {
      const tgtX = (e as any).tgtX ?? x;
      const dx = tgtX - x;
      vx = Math.sign(dx) * Math.min(1.5, Math.abs(dx) * 0.05);
      vy += 0.08;
      x += vx;
      y += vy / 60;
    } else if (e.kind === 'turret') {
      y += vy / 60;
      if (y > 60) fireCooldown = Math.max(0, fireCooldown - 1);
    } else if (e.kind === 'elite') {
      x += Math.sin(age / 40) * 1.4;
      if (age < 60) y += 0.6 / 60; else y += 0.2 / 60;
      fireCooldown = Math.max(0, fireCooldown - 1);
    }
    return { ...e, x, y, vx, vy, phase, fireCooldown, age };
  }).filter((e) => e.active && e.y < H + 60 && e.x > -60 && e.x < W + 60);
  // enemy fire
  for (const e of s.enemies) {
    if (e.kind === 'turret' && e.fireCooldown === 0 && e.y > 40) {
      s.bullets = [...s.bullets, makeBullet(e.x, e.y + 20, 3.5, 'enemy', 1)];
      s.enemies = s.enemies.map((x) => (x === e ? { ...x, fireCooldown: 70 } : x));
    }
    if (e.kind === 'elite' && e.fireCooldown === 0 && e.y > 20) {
      const fan = s.player.hp <= 1 ? 5 : 3;
      for (let i = 0; i < fan; i++) {
        const ang = (-Math.PI / 2) + (i - (fan - 1) / 2) * 0.4;
        s.bullets = [...s.bullets, { ...makeBullet(e.x, e.y + 30, 3.5 * Math.sin(ang), 'enemy', 2), vx: 3.5 * Math.cos(ang) }];
      }
      s.enemies = s.enemies.map((x) => (x === e ? { ...x, fireCooldown: e.hp < 40 ? 36 : 60 } : x));
    }
  }
  // 子弹 vs 敌机
  const playerBullets = s.bullets.filter((b) => b.team === 'player');
  let particles: Particle[] = s.particles;
  for (const e of s.enemies) {
    if (!e.active) continue;
    for (const b of playerBullets) {
      if (!b.active) continue;
      if (Math.abs(e.x - b.x) < 18 && Math.abs(e.y - b.y) < 18) {
        e.hp -= b.damage;
        b.active = false;
        particles = [...particles, { active: true, x: e.x, y: e.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 12, color: e.kind === 'elite' ? '#FFD' : '#FFE54B' }];
        if (e.hp <= 0) {
          e.active = false;
          // 击杀 → score + combo + 概率掉落
          s.score += ENEMY_DEFAULTS[e.kind].score;
          s.combo += 1;
          s.maxCombo = Math.max(s.maxCombo, s.combo);
          s.comboTimeout = COMBO_TIMEOUT_TICKS;
          // power-up drop (8% weapon, 4% shield, 3% bomb)
          const r = Math.random();
          if (r < 0.08) s.powerUps = [...s.powerUps, { active: true, kind: 'weapon', x: e.x, y: e.y, vy: 1 }];
          else if (r < 0.12) s.powerUps = [...s.powerUps, { active: true, kind: 'shield', x: e.x, y: e.y, vy: 1 }];
          else if (r < 0.15) s.powerUps = [...s.powerUps, { active: true, kind: 'bomb', x: e.x, y: e.y, vy: 1 }];
        }
        break;
      }
    }
  }
  // power-up 推进 + 拾取
  s.powerUps = s.powerUps.map((p) => ({ ...p, y: p.y + p.vy })).filter((p) => p.active && p.y < H);
  for (const p of s.powerUps) {
    if (Math.abs(p.x - s.player.x) < 22 && Math.abs(p.y - s.player.y) < 22) {
      p.active = false;
      if (p.kind === 'weapon') s.player.weaponLevel = Math.min(4, s.player.weaponLevel + 1);
      else if (p.kind === 'shield') s.player.shield = true;
      else if (p.kind === 'bomb') {
        // 清屏
        s.bullets = s.bullets.filter((b) => b.team !== 'enemy');
        s.enemies = s.enemies.map((e) => (e.kind === 'elite' ? { ...e, hp: Math.max(0, e.hp - 20) } : { ...e, active: false }));
        s.bombFx = BOMB_DURATION_TICKS;
      }
    }
  }
  // enemy bullet vs player
  if (s.player.invulnTicks > 0) s.player.invulnTicks -= 1;
  for (const b of s.bullets) {
    if (b.team !== 'enemy') continue;
    if (!b.active) continue;
    if (Math.abs(b.x - s.player.x) < 16 && Math.abs(b.y - s.player.y) < 16 && s.player.invulnTicks <= 0) {
      b.active = false;
      s.player.hp -= 1;
      s.player.invulnTicks = INVULN_TICKS;
      s.player.weaponLevel = Math.max(1, s.player.weaponLevel - 1);
      s.combo = 0;
      if (s.player.shield) {
        s.player.shield = false;
      } else if (s.player.hp <= 0) {
        s.status = 'over';
      }
    }
  }
  // enemy collision with player
  for (const e of s.enemies) {
    if (!e.active) continue;
    if (Math.abs(e.x - s.player.x) < 18 && Math.abs(e.y - s.player.y) < 18 && s.player.invulnTicks <= 0) {
      s.player.hp -= 1;
      s.player.invulnTicks = INVULN_TICKS;
      s.player.weaponLevel = Math.max(1, s.player.weaponLevel - 1);
      s.combo = 0;
      if (s.player.shield) { s.player.shield = false; e.active = false; continue; }
      e.active = false;
      if (s.player.hp <= 0) s.status = 'over';
    }
  }
  // combo timeout
  if (s.comboTimeout > 0) {
    s.comboTimeout -= 1;
    if (s.comboTimeout === 0) s.combo = 0;
  }
  // wave / spawn
  const elapsed = s.tick / TICK_HZ;
  let activeWaveIdx = 0;
  let acc = 0;
  for (let i = 0; i < WAVES.length; i++) {
    acc += WAVES[i].duration;
    if (elapsed < acc) { activeWaveIdx = i; break; }
    activeWaveIdx = i;
  }
  s.wave = activeWaveIdx;
  s.spawnTimer += 1;
  // 精英 (last wave 后)
  if (elapsed > WAVES.reduce((a, w) => a + w.duration, 0) - 1 && !s.enemies.some((e) => e.kind === 'elite')) {
    s.enemies = [...s.enemies, makeEnemy('elite', W / 2, -60)];
  } else if (elapsed < WAVES.reduce((a, w) => a + w.duration, 0)) {
    const w = WAVES[activeWaveIdx];
    const tSec = s.spawnTimer / TICK_HZ;
    for (const sp of w.spawns) {
      if (Math.abs(tSec % sp.interval) < dt + 0.001 && s.enemies.filter((e) => e.kind === sp.kind).length < 8) {
        s.enemies = [...s.enemies, spawnEnemy(s, sp.kind)];
      }
    }
    if (tSec > 30) s.spawnTimer = 0;
  }
  // win on elite killed
  if (s.enemies.every((e) => !e.active || e.kind !== 'elite') && elapsed > WAVES.reduce((a, w) => a + w.duration, 0) + 5) {
    s.status = 'win';
  }
  // particles
  particles = particles.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 })).filter((p) => p.life > 0);
  return { ...s, particles };
}

export function movePlayer(s: State, dx: number, dy: number): State {
  return { ...s, player: { ...s.player, x: Math.max(20, Math.min(W - 20, s.player.x + dx)), y: Math.max(80, Math.min(H - 60, s.player.y + dy)) } };
}

export function setPlayerTarget(s: State, x: number, y: number): State {
  return { ...s, player: { ...s.player, x, y } };
}

export const SHOOTER_W = W;
export const SHOOTER_H = H;
export const SHOOTER_TICK_MS = TICK_MS;