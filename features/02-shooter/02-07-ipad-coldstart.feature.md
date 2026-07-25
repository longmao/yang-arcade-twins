# Game Shooter · Scenario 7 of 8

**Scenario**: iPad cold start ≤ 4s · Shooter 入口 active

**Given**
- iPad simulator boot (88FDC012-...)
- 空 metro cache · app 未启动

**When**
- xcrun simctl launch · 等待 cold start
- tap Shooter card

**Then**
- cold start ≤ 4s(mobile-game-acceptance 6 维度 gate)
- 进 ShooterGame screen 布局不重叠
- 触摸控制(4 方向 + FIRE)未阻挡 SafeArea

**Reason**: iPad 兼容性硬尺 · mobile-game-acceptance skill probe

**Owner**
- Runner: mobile-game-acceptance skill(Sprint 2 end Phase B)
- Asset: cold start log + iPad 截图
