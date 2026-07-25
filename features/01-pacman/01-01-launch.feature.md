# Game N · {Name} Scenario 1 of 8

**Scenario**: 主菜单点击 Pac-Man 进入游戏 + 看到 UI

**Given**
- iOS Simulator 已 boot (E30874E0 / hwt-r8 iPhone 17 Pro)
- YangArcadeTwins.app 已 build + install + launch
- 主菜单展示 2 card (Pac-Man + Shooter coming)

**When**
- tap "Pac-Man" card

**Then**
- 主菜单隐藏
- 进入吃豆人 screen:可见 SCORE "0000" + II 暂停按钮 + 18×10 网格 + 黄圆玩家 + 4 个不同色鬼
- status === 'playing' 或 'ready'(取决于 setDir 触发)

**Reason**: 启动 happy path 不通 = 主流程 BLOCKED(硬规 gate)

**Owner**
- Runner: scripts/games/pacman.check.mjs (Phase B Sprint 1 end)
- Asset: iOS sim 主屏截图
