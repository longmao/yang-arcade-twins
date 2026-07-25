# Game Shooter · Scenario 4 of 8

**Scenario**: 敌机撞 plane → GAME OVER 屏 + score 写入

**Given**
- plane 居中 · 1 只敌机直线冲向 plane
- 玩家不动 = 不发射子弹也不移

**When**
- 让敌机撞上来 · ~10 tick

**Then**
- status → 'over'
- GAME OVER 屏显示 · final score + max combo
- haptics.die() 触发 1 次
- pushTop3('YANG', score) 调用 1 次(AsyncStorage)

**Reason**: 死亡边界 · 玩家不动 = 必触发

**Owner**
- Runner: scripts/games/shooter.check.mjs · Maestro flow `die.yaml`
- Asset: GAME OVER 截图
