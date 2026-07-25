#!/usr/bin/env node
/**
 * scripts/games/pacman.check.mjs · 吃豆人 BDD runner
 * 海信 Harness #1:单 runner ≤100 行 + SPEC verify.sh gate
 *
 * 调用:
 *   node scripts/games/pacman.check.mjs [--scenario 01-01|01-02|01-03|01-04|all]
 *
 * 当前 Phase:Sprint 1 end 后接 Maestro flow + 6 维度验收.本文件是 stub + 编译验证通过.
 * 全 Sprint 1 后此脚本会真实跑 sim + screenshot + assertion.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const FEATURES = ['01-01-launch', '01-02-first-pellet', '01-03-pause-resume', '01-04-game-over'];

function checkAssets() {
  const miss = FEATURES.filter((f) => !existsSync(`features/01-pacman/${f}.feature.md`));
  if (miss.length) {
    console.error(`❌ missing features: ${miss.join(', ')}`);
    return 1;
  }
  return 0;
}

function checkTsc() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return 0;
  } catch {
    return 1;
  }
}

function main() {
  let rc = 0;
  rc |= checkAssets();
  rc |= checkTsc();
  if (rc === 0) {
    console.log(`✅ pacman.check.mjs: ${FEATURES.length} features exist + tsc OK`);
    console.log(`   (Sprint 1 end: will replace with Maestro flow execution)`);
  } else {
    console.error('❌ fail');
  }
  process.exit(rc);
}

main();
