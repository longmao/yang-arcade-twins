/**
 * App.tsx · Yang Arcade Twins · v0.3 spec 重构 entry
 *
 * 主菜单设计参考: docs/design-ref-main-menu.md
 *   - 改进 A: 3D ledge 卡片(投币感)
 *   - 改进 B: 顶部 HighScore HUD
 *   - 改进 C: 像素字体(单独一轮,本轮用全大写 + letterSpacing 轻量模拟)
 */
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MazeGame } from './src/games/maze/MazeGame';
import { ShooterGame } from './src/games/shooter/ShooterGame';
import { getHigh } from './src/shared/storage';

type Screen = 'menu' | 'pacman' | 'shooter';

type Game = {
  id: 'pacman' | 'shooter';
  title: string;
  subtitle: string;
  color: string;
  coming: boolean;
};

const GAMES: Game[] = [
  { id: 'pacman', title: 'PAC-MAN', subtitle: '迷宫 + 4 鬼 AI', color: '#FFE54B', coming: false },
  { id: 'shooter', title: 'SHOOTER', subtitle: '纵向卷轴 + 弹幕 + 连击', color: '#FF6B6B', coming: false },
];

/**
 * 游戏卡片 · 改进 A: 3D ledge 投币感
 * 底部 ledge(卡片主色)press 时塌陷 6→2 + 下沉 4pt,模拟街机投币按下。
 * 借 Duolingo DESIGN.md 的 chunky 3D ledge button 范式(非 cartoon 视觉)。
 */
function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={game.coming}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      style={[
        styles.card,
        {
          borderBottomColor: game.color,
          borderBottomWidth: pressed ? 2 : 6,
          opacity: game.coming ? 0.4 : 1,
          transform: [{ translateY: pressed ? 4 : 0 }],
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: game.color }]}>{game.title}</Text>
      <Text style={styles.cardSub}>{game.subtitle}</Text>
      {game.coming && <Text style={styles.coming}>coming soon</Text>}
    </Pressable>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [refreshKey, setRefreshKey] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // 改进 B: 主菜单挂载时拉最高分(数据源 getHigh() 已就绪)
  useEffect(() => {
    getHigh().then(setHighScore).catch(() => {});
  }, []);

  if (screen === 'pacman') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#0A0E27" />
        <MazeGame onQuit={() => setScreen('menu')} />
      </SafeAreaView>
    );
  }
  if (screen === 'shooter') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#0A0E27" />
        <ShooterGame onQuit={() => setScreen('menu')} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#0A0E27" />
      <View style={styles.header}>
        <Text style={styles.title}>YANG ARCADE</Text>
        <Text style={styles.subtitle}>twins · 10+ edition</Text>
        {/* 改进 B: 顶部 HighScore HUD · 街机柜最显眼的高分位 */}
        <View style={styles.hud}>
          <Text style={styles.hudLabel}>HIGH SCORE</Text>
          <Text style={styles.hudScore}>{highScore}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} onPress={() => setScreen(g.id)} />
        ))}
      </View>
      <Text style={styles.footer}>PRESS START · v0.1 · BDD-ready</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E27' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, letterSpacing: 2 },
  hud: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 24,
  },
  hudLabel: {
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 3,
    fontWeight: '700',
  },
  hudScore: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFE54B',
    letterSpacing: 2,
  },
  grid: { flex: 1, padding: 24, gap: 20 },
  card: {
    borderRadius: 16,
    backgroundColor: '#131A2E',
    padding: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 32, fontWeight: '800', letterSpacing: 2 },
  cardSub: { fontSize: 14, color: '#9CA3AF', marginTop: 6 },
  coming: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footer: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 11,
    padding: 16,
    letterSpacing: 3,
  },
});

export default App;
