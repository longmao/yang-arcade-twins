# Game N · {Name} Scenario 4 of 8

**Scenario**: 鬼撞玩家 → GAME OVER 屏 + 退出回菜单

**Given**
- 玩家 (1,1) · SCORE ≥ 0
- 鬼 (2,1) 即将 tick 后到 (1,1) 触发碰撞
- 简化:不让玩家动,让鬼直线撞过来

**When**
- 持续 tick ~10 次(玩家不动 = 鬼一直追)

**Then**
- status → 'over'
- "GAME OVER" 文案显示
- haptics.die() 触发
- tap "Back to menu" → 回主菜单

**Reason**: 死亡边界 · 不让玩家 escape = 必触发

**Owner**
- Runner: scripts/games/pacman.check.mjs · Maestro flow `die.yaml`
- Asset: GAME OVER 截图
