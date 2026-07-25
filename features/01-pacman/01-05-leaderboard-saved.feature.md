# Game N · {Name} Scenario 5 of 8

**Scenario**: game-over 时 score 写入 AsyncStorage · 多次 score ≥ Top 3

**Given**
- AsyncStorage key 'yat:leaderboard:v1' 初始化为空数组
- 玩家开始一局游戏

**When**
- play 至 game-over · score = N(可能 = 50)

**Then**
- AsyncStorage 'yat:leaderboard:v1' 解析后 = [{ name: 'YANG', score: N, at: <ts> }]
- Length 1 · desc by score · Top 3 内

**Reason**: 持久化是最小验收 · 海信 bar #1 spec ≤100 行 hard

**Owner**
- Runner: scripts/games/scoreboard.check.mjs (Sprint 1 Phase 2 真实 storage 验证)
- Asset: 'docs/verify/sprint1/01-05-leaderboard-saved.png'
