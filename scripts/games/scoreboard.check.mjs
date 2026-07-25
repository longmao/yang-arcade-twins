#!/usr/bin/env node
/**
 * scripts/games/scoreboard.check.mjs · leaderboard 持久化验收
 * 海信 Harness #1:单 runner ≤100 行
 *
 * 调用: node scripts/games/scoreboard.check.mjs
 * 当前 Phase B(Sprint 1 Phase 2 stub):verify .feature.md + tsc OK
 * Sprint 1 end 后接真 AsyncStorage e2e(metro 内 in-process 测)
 */
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const FILES = [
  'features/01-pacman/01-05-leaderboard-saved.feature.md',
  'features/01-pacman/01-06-leaderboard-restore.feature.md',
];

const checkStorage = () => {
  const src = 'src/shared/storage.ts';
  if (!existsSync(src)) return 'src/shared/storage.ts missing';
  const body = [
    'export async function getHigh',
    'export async function setHigh',
    'export async function getTop3',
    'export async function pushTop3',
  ];
  const txt = readFileSync(src, 'utf8');
  return body.find((s) => !txt.includes(s));
};

const checkGameCallsPushTop3 = () => {
  const src = 'src/games/pacman/PacmanGame.tsx';
  if (!existsSync(src)) return 'PacmanGame.tsx missing';
  const txt = readFileSync(src, 'utf8');
  if (!txt.includes('pushTop3')) return 'PacmanGame.tsx 未调用 pushTop3';
  return null;
};

function main() {
  let rc = 0;
  for (const f of FILES) {
    if (!existsSync(f)) {
      console.error(`❌ ${f} missing`);
      rc = 1;
    } else {
      console.log(`✅ ${f}`);
    }
  }
  const s1 = checkStorage();
  if (s1) {
    console.error(`❌ storage.ts incomplete: ${s1}`);
    rc = 1;
  } else {
    console.log('✅ storage.ts 4 exports');
  }
  const s2 = checkGameCallsPushTop3();
  if (s2) {
    console.error(`❌ ${s2}`);
    rc = 1;
  } else {
    console.log('✅ PacmanGame.tsx calls pushTop3');
  }
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ tsc OK');
  } catch {
    console.error('❌ tsc fail');
    rc = 1;
  }
  process.exit(rc);
}

main();
