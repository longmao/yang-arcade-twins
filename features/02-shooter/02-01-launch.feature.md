# Game Shooter · Scenario 1 of 8

**Scenario**: 主菜单点 Shooter card 进游戏(不再 coming soon)

**Given**
- iOS Simulator boot E30874E0 (hwt-r8 iPhone 17 Pro)
- YangArcadeTwins 已 build + install + launch
- 主菜单 2 card: Pac-Man(active) + Shooter(active,不再 coming soon)

**When**
- tap Shooter card

**Then**
- 主菜单隐藏
- 进入 ShooterGame screen:可见 SCORE + COMBO + 1 个玩家 plane + 4 方向按钮 + 1 个 FIRE 按钮
- 60ms tick 开始 · game status 起步 'ready' 或 'playing'

**Reason**: 启动 happy path,主流程 BLOCKED

**Owner**
- Runner: scripts/games/shooter.check.mjs (Phase B 真 sim)
- Asset: iOS sim 主屏截图
