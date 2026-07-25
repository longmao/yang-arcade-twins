# Game Shooter · Scenario 6 of 8

**Scenario**: 重启 app · leaderboard 含 Shooter entry

**Given**
- 上局 Shooter score 写入 AsyncStorage
- kill + 重启 app

**Then**
- getTop3() 返数组 · 包含 Shooter 局 entry
- 进 ShooterGame / PacManGame 都看得到历史(共用 leaderboard)

**Reason**: 重启不丢分 = 持久化最基本验收

**Owner**
- Runner: scripts/games/scoreboard.check.mjs · simctl restart
- Asset: 重启前后 leaderboard 状态对比
