# Yang Arcade Twins · 主菜单设计参考

> **2026-07-29** · 基于 `App.tsx` 现状 + 真实 reference(Duolingo DESIGN.md)
> **反飘声明**:所有 Duolingo token 取自 `~/.agents/skills/awesome-ios-design-md/design-md/misc/duolingo/DESIGN.md` 原文;所有现状 token 取自 `App.tsx` L73-96。

## TL;DR

本项目走 **8-bit 街机原创风**(README 明确:不强行套大厂 token)。主菜单只借 Duolingo 的 **gamified 交互范式**(3D ledge 按钮 + 顶部 HUD),**不借**它的 cartoon 配色 / owl mascot / Feather 圆润字体。最大杠杆 = 卡片从纯平面 → 3D 投币感。

---

## 1. 现状审计(App.tsx)

| 元素 | 现状 | 问题 |
|---|---|---|
| Canvas | `#0A0E27`(蓝黑深) | ✅ 已是街机暗色,保持 |
| Logo | `YANG ARCADE` 36pt 900 letterSpacing 4 | 系统字,街机感弱 |
| 游戏卡 | borderWidth 3 边框 + borderRadius 16 + minHeight 120 | **纯平面,像线框图** |
| 卡片色 | 黄 `#FFE54B` / 红 `#FF6B6B` | ✅ 饱和色,对位 gamified 策略 |
| 顶部 HUD | 无(只有 logo + subtitle) | 缺游戏感,没用上 HighScore |
| 互动 | `activeOpacity: 0.7` | 平淡,无触觉反馈 |
| 数据 | `getHigh()` / `getTop3()` 已就绪未用 | 可直接接主菜单 |

---

## 2. Reference:为什么是 Duolingo

库里**没有专门的街机/休闲游戏 app**(crossy-road/monument-valley 等已验证不存在)。`misc/duolingo` 是最对位的——它本身自述:

> *"the color system borrows more from mobile puzzle games than from education apps"*

即它就是按**移动游戏**做的 launcher。dark canvas `#131F24` 和本项目 `#0A0E27` 同属蓝黑系。

### 借什么(交互范式,非视觉)
- ✅ **Chunky 3D ledge button**:按钮底部一条 4pt darker-green shadow ledge,press 时 ledge 塌陷 → 触觉投币感
- ✅ **Gamified HUD 顶部**:streak/gem/heart/XP ring 永远在顶部 → 本项目接 HighScore
- ✅ **饱和色块做 CTA**:大色块 + 大字 → 本项目黄/红卡已对位

### 不借什么(避免 cartoon 化)
- ❌ Duo owl mascot(8-bit 不要卡通吉祥物)
- ❌ Feather Bold / DIN Rounded 圆润字(本项目要像素/等宽)
- ❌ Lesson path 曲线(本项目是卡片 grid,不是路径)
- ❌ Snow white canvas(本项目深色更街机)

---

## 3. 三个改进(按杠杆排序)

### 改进 A · 3D ledge 卡片(最大杠杆)
现状卡片是 `borderWidth: 3` 的空框。加 Duolingo 式 ledge 后,从"线框图"变"街机投币口"。

```js
// App.tsx L79 改: borderWidth 3 空框 → 3D ledge
card: {
  borderRadius: 16,
  backgroundColor: '#131A2E',          // 卡片底色(比 canvas 浅一档)
  borderWidth: 0,                       // 去掉空框
  borderBottomWidth: 6,                 // Duolingo ledge:4-6pt
  borderBottomColor: '#FFE54B',         // ← 用卡片自己的主色做 ledge
  padding: 24,
  minHeight: 120,
  justifyContent: 'center',
},
// press 时 onPressIn 状态切 borderBottomWidth 6→2(塌陷)+ translateY: 4
```
效果:黄卡 ledge 黄、红卡 ledge 红,press 整张卡"按下",触觉 + 音效 = 投币。

### 改进 B · 顶部 HighScore HUD
现状 header(L45-48)只有 logo。接 `getHigh()`:

```js
// header 加一行街机数字 HUD
<View style={styles.hud}>
  <Text style={styles.hudLabel}>HIGH SCORE</Text>
  <Text style={styles.hudScore}>{highScore}</Text>   // getHigh() 取,像素字体
</View>
```
token:label 灰 `#6B7280` 11pt + score 黄 `#FFE54B` 24pt 像素字 + letterSpacing 2。

### 改进 C · 8-bit 像素字体
系统 900 weight 不够街机。logo + 数字用像素字体(`react-native-pixel-font` 或自托管 Press Start 2P / VT323 ttf)。这是 Duolingo **不提供**的——8-bit 街机专属。

⚠️ 权衡:像素字体不支持中文,`twins · 10+ edition` 副标题留系统字;像素字只给英文 logo + 数字。

---

## 4. 8-bit 街机专属(Duolingo 没有的)

这些超出 gamified launcher 范式,是街机原生:
- **闪烁 "PRESS START"**:footer `v0.1 · BDD-ready` → 改 `PRESS START` + 600ms 闪烁
- **CRT 扫描线 overlay**(可选,subtle 5% opacity 黑线):街机柜质感
- **投币音效**:卡片 press 触发(已有 `audio mock`)
- **像素吉祥物**:可自画 8-bit 吃豆人/飞船小图标放 logo 旁(非卡通)

---

## 5. Token 速查(Claude Code 直接用)

| Token | 值 | 出处 |
|---|---|---|
| Canvas | `#0A0E27` | App.tsx L74(保持) |
| 卡片底 | `#131A2E` | 比 canvas 浅一档 |
| Pacman 主色 | `#FFE54B` | App.tsx L19(保持) |
| Shooter 主色 | `#FF6B6B` | App.tsx L20(保持) |
| Ledge 塌陷位移 | `translateY: 4` + `borderBottomWidth 6→2` | Duolingo press 范式 |
| HUD label 灰 | `#6B7280` | App.tsx L77(复用) |
| HUD score 黄 | `#FFE54B` | 复用 pacman 色 |
| 像素字体 | Press Start 2P / VT323 | 街机原生 |

---

## 6. 下一步

- 这是**参考文档**,未改代码。要落地改 `App.tsx` 的话 → 另起 plan(plan-first:多文件 + 动画)
- 验证锚点:改完跑 `bash spec/verify.sh` + 真机/iPad 视觉对比 + 娃试玩 checklist
- 参考 skill 用法见 `README.md` 的 Design Reference 段(已修正为真实 app)