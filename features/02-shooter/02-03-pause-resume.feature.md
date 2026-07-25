# Game Shooter · Scenario 3 of 8

**Scenario**: tap Ⅱ 暂停 → tap Resume · 敌机/子弹冻住

**Given**
- 游戏中 · SCORE ≥ 10 · 至少 1 敌机在场
- 子弹 ≥ 1 颗飞行中

**When**
- tap Ⅱ 暂停键 → PauseOverlay 出现
- tap Resume → overlay 消失

**Then**
- status 'playing' → 'paused' → 'playing'
- SCORE / COMBO 不变
- 子弹 y 位置 暂停前后不变 = tick 停止
- haptics.pause() 触发 1 次

**Reason**: 街机可停 = 娃独立可玩

**Owner**
- Runner: scripts/games/shooter.check.mjs · Maestro flow `pause.yaml`
- Asset: 暂停前后 bullet-position diff = 0
