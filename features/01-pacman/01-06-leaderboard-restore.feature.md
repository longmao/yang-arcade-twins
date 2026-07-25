# Game N · {Name} Scenario 6 of 8

**Scenario**: 重启 app · leaderboard 保留

**Given**
- 已存 1+ 条 leaderboard(上一 case)
- kill app · 重启 · 进吃豆人

**When**
- kill app via simctl terminate · 重启 launch

**Then**
- getTop3() 返 ≥ 1 条 · 包含原 score
- 重启 ≠ 0

**Reason**: 死亡边界 · 不持久 = 重启就丢分

**Owner**
- Runner: scripts/games/scoreboard.check.mjs · maestro 'restart-app.yaml'
- Asset: 重启前后 leaderboard 状态对比
