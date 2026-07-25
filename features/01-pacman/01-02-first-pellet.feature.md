# Game N · {Name} Scenario 2 of 8

**Scenario**: 玩家吃到首颗 pellet 计分 +1

**Given**
- 玩家位于 (1, 1) 朝右
- pellet grid 已初始化(18×10,~120 个)
- SCORE 初始 0000

**When**
- tap → 键 5 次(每 tap = 1 个 tick)

**Then**
- SCORE 显示 ≥ 0001(玩家至少吃到 1 颗 pellet)
- pellets 计数递减
- haptics.eat() 触发过 1 次以上

**Reason**: 游戏核心评分机制=不可缺

**Owner**
- Runner: scripts/games/pacman.check.mjs · Maestro flow `eat-first.yaml`
- Asset: 截图前后对比(SCORE 数字变化)
