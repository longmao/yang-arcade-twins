# Yang Arcade Twins

> RN 0.86 双街机合集·给杨总 10+ 岁娃玩·BDD/Harness 工程化 ship

## v0.1 状态(2026-07-25 ship)

| Phase | 状态 | 备注 |
|---|---|---|
| Sprint 0 骨架 | ✅ done | `npx @react-native-community/cli init` RN 0.86 + reanimated 4.5.3 + worklets 0.11.2 + 7 deps 锁定 |
| Sprint 1 Phase 1 核心 | ✅ done | 吃豆人 18×10 网格 + 4 鬼 AI(Chase/Ambush/Flank/Shy) + 计分 + game-over |
| Sprint 1 Phase 2 UX | ✅ done | PauseOverlay + AsyncStorage Top 3 + 4 方向键 + haptics + audio mock |
| Sprint 1 BDD 8 case 文件 | ✅ done | 8 个 `.feature.md` + 2 个 runner stub(pacman.check + scoreboard.check) |
| iOS Sim Release build | ⏳ bg | `xcodebuild` background task running |
| Maestro + 真实 6 维度 | ⏳ Sprint 1 end | 真 sim 跑 = Sprint 1 end phase B |
| Sprint 2 纵向射击 | ⏳ todo | worktree 隔离 subagent 写 |

## ship-quality 验证

```bash
# 1. spec-driven fail-closed gate
bash spec/verify.sh        # 13 PASS / 0 FAIL ✓

# 2. game stub runner
node scripts/games/pacman.check.mjs          # 4 features exist + tsc ✓
node scripts/games/scoreboard.check.mjs      # 4 features + storage.ts ✓

# 3. TypeScript
npx tsc --noEmit                              # clean ✓

# 4. iOS Sim Release build (background)
xcodebuild -workspace ios/YangArcadeTwins.xcworkspace \
  -scheme YangArcadeTwins -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath ios/build/ build
```

## Repo 位置

- GitHub: `longmao/yang-arcade-twins`(已建仓 + push v0.1)
- 本地: `/Users/vincent/work/yang-arcade-twins/`
- Linear: **CHE-106**(已入库 P1)

## 目录骨架

```
App.tsx                       # 主菜单 screen 路由
src/
├── games/pacman/             # 吃豆人(Sprint 1 done)
│   ├── types.ts              # Tile / Pos / State types
│   ├── grid.ts               # 18×10 静态迷宫
│   ├── ai.ts                 # 4 鬼 AI 策略
│   ├── game.ts               # 状态机 + tick
│   └── PacmanGame.tsx        # RN 渲染 + 输入
├── games/shooter/            # 纵向射击(Sprint 2 pending)
├── shared/                   # PauseOverlay / storage / haptics / audio
└── ui/                       # 共享 UI 组件
features/01-pacman/           # BDD .feature.md(8 个 ≤40 行 each)
scripts/games/                # runner(.check.mjs stub)
spec/                         # SPEC.md + verify.sh + plan/本文件
docs/verify/                  # Loop 产物(后续填)
```

## 下一步(Sprint 1 end Phase B)

- 等 `xcodebuild` bg 完工后 install 到 simulator `E30874E0`
- 用 `mobile-game-acceptance` skill 跑 6 维度 + 100-fuzz + 5-min session
- 真 Maestro flow 替代 stub runner
- 真 game 截图归档 `docs/verify/sprint1/`

## 关键教训引用

- **hwf-clone v0.3 ship**(12 spec + BDD PASS)→ 锁版本组合实证 + sim BDD 不需 WDA cert
- **海信 3 bar**(Spec ≤100行/一次1修/跨模型)→ 体现为 `.feature.md` ≤40 行 + 每次只 1 phase + GLM session 周日审
- **hwf v0.3 visual ceiling** → 本项目不走 ref 复刻,街机 8-bit 原创作风不需要 palette metric 高分
- **spec-driven skill** → `spec/SPEC.md` + `spec/plan.md` + `spec/tasks.md` + `spec/verify.sh` fail-closed

## 娃试玩 checklist(2026-07-26 / 周日)

- [ ] iPhone 跑通 · 进吃豆人
- [ ] 暂停/重开正常
- [ ] 撞鬼死亡 → GAME OVER → 回菜单
- [ ] 重启 app · 最高分保留
- [ ] iPad 跑通 · 触控不重叠
- [ ] 5-min 自由玩 · 娃评分 ≥ 6/10
