# Game Shooter · Scenario 2 of 8

**Scenario**: 玩家射击命中首只 basic 敌机 → score +10

**Given**
- ShooterGame 运行中 · plane 居中 · 敌机自上往下 spawn
- SCORE 0 · COMBO 0
- tick 已运行 ≥ 1.2s(敌机 spawn 周期初值)
- 1 只 basic 敌机在 plane 上方某 lane

**When**
- tap FIRE 按钮 × 1(发 1 颗子弹)
- 等 ~5 tick 后子弹与敌机同 y 碰撞

**Then**
- SCORE 至少 +10
- COMBO = 1
- haptics.kill() 触发 1 次
- 敌机从 enemy list 移除
- 子弹从 bullet list 移除

**Reason**: 击中基础 = 游戏核心计分闭环

**Owner**
- Runner: scripts/games/shooter.check.mjs · Maestro flow `kill-first.yaml`
- Asset: 击中前后对比截图
