# Game Shooter · Scenario 5 of 8

**Scenario**: game-over 时 score 入 AsyncStorage Top-3

**Given**
- AsyncStorage 'yat:leaderboard:v1' 初值可能非空(PacMan 局也写入)
- 一局 Shooter 跑完 · final score = N

**Then**
- Top-3 数组按 score desc · Shooter 局 entry 入
- length ≤ 3 · 不与现有重复(N 是新 entry)

**Reason**: 复用 storage.ts pushTop3,不需新 schema,验证跨游戏 leaderboard 共用

**Owner**
- Runner: scripts/games/scoreboard.check.mjs 验证 pushTop3 调用 1+ 次
- Asset: 'docs/verify/sprint2/02-05.png'
