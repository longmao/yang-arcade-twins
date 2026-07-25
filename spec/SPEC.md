# SPEC.md · Yang Arcade Twins v0.1 Risk Gate

> 单 spec ≤100 行硬尺(海信 Harness #1 bar)。本 spec 是 2 个 game 的顶层,Phase 1 吃豆人,M3 纵向射击拆独立 spec。

## What

iPhone+iPad 双端 RN 0.86 街机合集·2 个经典游戏:
- **C · 吃豆人迷宫**(Pac-Man):单屏迷宫 + 吃豆 + 4 鬼 AI(Blinky/Pinky/Inky/Clyde 行为差异) + 道具 + 计分
- **D · 太空射击**(纵向卷轴 Shooter):飞机控制 + 弹幕 + 难度递增 + 连击

**目标受众**:杨总娃(10+ 岁,经典街机原汁原味品味)。

## Why

- 39+ 杨总 iOS Indie 多轨并行,本项目是「学习+陪伴」双属性:娃周末有正经游戏玩,杨总 ship 一份可上 App Store 的 indie
- 街机本身「深但易上手」的内核=不需要堆复杂度,「好玩点」= polish 反馈感
- 视觉策略(**2026-07-25 修订**):不走 reference 复刻路线,避免 hwf-clone v0.3 palette metric 0.11 天花板;用「娃 5-min free play」做 polish gate,不用 pixelmatch 量化

## 风险面 & Acceptance

**风险面 = HIGH**(多文件 + iOS sim 外部调用 + 持久化 + 音效)。走 full Execution Contract:本 SPEC + plan.md + tasks.md(spec/verify.sh fail-closed gate)。

### 机械可校验 Acceptance(每条都能 exit-code/文件存在/数值匹配)

```bash
[1] cd /Users/vincent/work/yang-arcade-twins && npx tsc --noEmit && echo OK1
[2] cd ios && bundle install && bundle exec pod install --silent && echo OK2
[3] xcodebuild -workspace YangArcadeTwins.xcworkspace -scheme YangArcadeTwins \
    -configuration Release -sdk iphonesimulator \
    -destination 'platform=iOS Simulator,id=E30874E0-C3CC-4678-A6FA-06EA7F1B1B29' \
    -derivedDataPath build/ 2>&1 | tail -3 | grep -E 'BUILD (SUCCEEDED|FAILED)'
[4] ls -la docs/verify/sprint1/*.png | wc -l   # ≥8 case 截图
[5] npx tsx scripts/games/pacman.check.mjs    # exit 0
[6] npx tsx scripts/games/scoreboard.check.mjs # exit 0
[7] bash spec/verify.sh                        # exit 0
```

### BDD 通过定义(mobile-game-acceptance 6 维度)

| 维度 | Pass 阈值 |
|---|---|
| cold start | ≤ 4s |
| UI 对齐 | 无 overlap / 无缺失文字(肉眼) |
| 触控响应 | < 100ms |
| 流畅度 | ≥ 30fps p50 |
| 视觉 | 不黑 / 不白 / 不镜像(肉眼) |
| 音画同步 | < 100ms |

**硬规 gate**:任何场景进不去/退不出 → BLOCKED;主流程走不完 → BLOCKED;100-fuzz crash ≥1 → BLOCKED;verify.sh exit ≠ 0 → BLOCKED。

## Out of Scope (Sprint 1)

- Sprint 2 纵向射击 subagent 隔离独立 spec
- App Store 上传(TestFlight 留到 Sprint 4)
- Android 端(仅 iOS Sim + 后续 iPad)
- 排行榜云端(仅 AsyncStorage 本地 Top 3)
- 真实美术资产生成(用纯 View + reanimated 帧切换,娃品味通过 polish 而非美术覆盖)

## Owner

- 主 session(minimax):写代码 + verify
- GLM session(周末):独立 audit verify-all.mjs
- 跨模型触发:case 补盲(海信 bar #3)
- Hard rule:**不在主 session 同时写两游戏**(海信 bar #2)
