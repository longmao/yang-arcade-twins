# Game Shooter · Scenario 8 of 8

**Scenario**: 连续命中 3 次 → combo ×3 · bonus +5

**Given**
- plane 居中 · 4 只 basic 敌机排队
- COMBO 当前 0

**When**
- 命中敌机 1 → COMBO 1 · score += 10
- 等 0.5s 不被撞 → 不死连击维持
- 命中敌机 2 → COMBO 2 · score += 10
- 命中敌机 3 → COMBO 3 · score += 10 + combo bonus 5

**Then**
- final COMBO = 3 · SCORE ≥ 35
- haptics.kill() 触发 3 次

**Reason**: 难度最高 invariants · combo 是 arcade shooter 核心机制

**Owner**
- Runner: scripts/games/shooter.check.mjs + Maestro flow `combo.yaml`
- Asset: COMBO counter 显示 'x3'
