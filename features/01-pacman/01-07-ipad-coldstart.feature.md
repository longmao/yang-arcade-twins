# Game N · {Name} Scenario 7 of 8

**Scenario**: iPad cold start ≤ 4s · 8 card 进吃豆人

**Given**
- iPad simulator boot (88FDC012-... iPhone16Test 当 iPad 测试)
- 空 metro cache · app 未启动

**When**
- simctl launch · 等待 cold start
- tap Pac-Man card

**Then**
- cold start ≤ 4s(用 `xcrun simctl launch` timing)
- 进吃豆人 screen + UI 跟 iPhone 一致布局
- status = 'playing' 或 'ready'

**Reason**: iPad 兼容性硬尺 · mobile-game-acceptance 6 维度 gate

**Owner**
- Runner: mobile-game-acceptance skill (1.5h probe)
- Asset: cold start log + iPad 截图
