/**
 * App.tsx · Yang Arcade Twins · Sprint 1 菜单 + 吃豆人 screen
 */
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PacmanGame } from './src/games/pacman/PacmanGame';

type Screen = 'menu' | 'pacman';

const GAMES = [
  { id: 'pacman', title: 'Pac-Man', subtitle: '迷宫 + 4 鬼 AI', color: '#FFE54B', coming: false },
  { id: 'shooter', title: 'Shooter', subtitle: '纵向卷轴 + 弹幕', color: '#FF6B6B', coming: true },
];

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  if (screen === 'pacman') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#0A0E27" />
        <PacmanGame onQuit={() => setScreen('menu')} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#0A0E27" />
      <View style={styles.header}>
        <Text style={styles.title}>YANG ARCADE</Text>
        <Text style={styles.subtitle}>twins · 10+ edition</Text>
      </View>
      <View style={styles.grid}>
        {GAMES.map((g) => (
          <Pressable
            key={g.id}
            style={({ pressed }) => [
              styles.card,
              { borderColor: g.color, opacity: pressed ? 0.7 : g.coming ? 0.4 : 1 },
            ]}
            disabled={g.coming}
            onPress={() => {
              if (g.id === 'pacman') setScreen('pacman');
            }}
          >
            <Text style={[styles.cardTitle, { color: g.color }]}>{g.title}</Text>
            <Text style={styles.cardSub}>{g.subtitle}</Text>
            {g.coming && <Text style={styles.coming}>coming soon</Text>}
          </Pressable>
        ))}
      </View>
      <Text style={styles.footer}>v0.1 · BDD-ready</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E27' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, letterSpacing: 2 },
  grid: { flex: 1, padding: 24, gap: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 32, fontWeight: '800' },
  cardSub: { fontSize: 14, color: '#9CA3AF', marginTop: 6 },
  coming: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footer: { textAlign: 'center', color: '#4B5563', fontSize: 11, padding: 16 },
});

export default App;
