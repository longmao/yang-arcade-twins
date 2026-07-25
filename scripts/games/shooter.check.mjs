#!/usr/bin/env node
/**
 * scripts/games/shooter.check.mjs · 纵向射击 BDD runner
 * 海信 Harness #1:单 runner ≤100 行
 *
 * 当前 Sprint 2 end 后接 Maestro flow 跑真 sim,本文件 stub + 编译验证通过.
 */
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const FEATURES = [
  '02-01-launch',
  '02-02-first-kill',
  '02-03-pause-resume',
  '02-04-death',
  '02-05-leaderboard-saved',
  '02-06-leaderboard-restore',
  '02-07-ipad-coldstart',
  '02-08-combo-buildup',
];

function checkAssets() {
  const miss = FEATURES.filter((f) => !existsSync(`features/02-shooter/${f}.feature.md`));
  if (miss.length) {
    console.error(`❌ missing features: ${miss.join(', ')}`);
    return 1;
  }
  return 0;
}

function checkShooterCode() {
  const files = [
    'src/games/shooter/types.ts',
    'src/games/shooter/game.ts',
    'src/games/shooter/ShooterGame.tsx',
  ];
  const miss = files.filter((f) => !existsSync(f));
  if (miss.length) {
    console.error(`❌ Shooter source missing: ${miss.join(', ')}`);
    return 1;
  }
  return 0;
}

function checkShooterPushesTop3() {
  const txt = readFileSync('src/games/shooter/ShooterGame.tsx', 'utf8');
  if (!txt.includes('pushTop3')) {
    console.error('❌ ShooterGame.tsx 未调用 pushTop3');
    return 1;
  }
  return 0;
}

function checkTsc() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return 0;
  } catch (e) {
    console.error('❌ tsc fail:\n' + e.stdout?.toString().slice(-500));
    return 1;
  }
}

function main() {
  let rc = 0;
  rc |= checkAssets();
  rc |= checkShooterCode();
  rc |= checkShooterPushesTop3();
  rc |= checkTsc();
  if (rc === 0) {
    console.log(`✅ shooter.check.mjs: ${FEATURES.length} features + Shooter source + pushTop3 + tsc OK`);
    console.log('   (Phase B 真 sim 跑待 Phase B)');
  } else {
    console.error('❌ fail');
  }
  process.exit(rc);
}

main();
