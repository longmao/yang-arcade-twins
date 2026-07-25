# Game N · {Name} Scenario 3 of 8

**Scenario**: tap II 暂停 → tap Resume 恢复 · 死亡计数不变

**Given**
- 游戏中 · SCORE ≥ 0001
- 鬼 ≥ 1 个未到 (1,1)

**When**
- tap II 暂停键 → pause overlay 出现
- tap Resume → overlay 消失

**Then**
- status: 'playing' → 'paused' → 'playing'
- SCORE 不变
- 玩家/鬼位置 tick 后变化 = 0(暂停时停)
- haptics.pause() 触发 1 次

**Reason**: 街机硬需求·娃随时能停=独立可玩

**Owner**
- Runner: scripts/games/pacman.check.mjs · Maestro flow `pause.yaml`
- Asset: pause 前后截图
