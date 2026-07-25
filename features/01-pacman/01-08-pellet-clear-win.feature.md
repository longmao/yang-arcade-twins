# Game N · {Name} Scenario 8 of 8

**Scenario**: 清空所有 pellet → 显示通关

**Given**
- 玩家初始 · pellets = N (≈ 120)
- 4 鬼放在远离玩家的角落(测试场景固定)

**When**
- 用速度+移动规避鬼 + 持续吃豆 · 直到 pellets = 0

**Then**
- status 维持 'playing'(当前不实现 win 转换) OR 跳 'over'
- SCORE = N(每 pellet +1 · power +10)
- pelletsLeft = 0

**Reason**: 闭环最远 invariant · 通关算 game won = 全图遍历完成

**Owner**
- Runner: scripts/games/pacman.check.mjs + 模拟 tick 100+ 步
- Asset: 全清截图

> Sprint 2 end 才完成: status → 'won' 状态(目前未实现,Sprint 1 over 够用)
