/**
 * src/shared/Leaderboard.tsx · 跨游戏 Top-3 banner 组件
 * 海信 Harness #1:单一职责 UI
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getTop3, type Leader } from './storage';

function relTime(at: number): string {
  const d = Math.floor((Date.now() - at) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export function Leaderboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<Leader[] | null>(null);

  useEffect(() => {
    let alive = true;
    getTop3()
      .then((d) => alive && setData(d))
      .catch(() => alive && setData([]));
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  if (data === null) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color="#FFE54B" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.box}>
        <Text style={styles.empty}>NO RECORDS YET</Text>
        <Text style={styles.hint}>Play a game to start the leaderboard</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>TOP {data.length}</Text>
      {data.map((l, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rank}>#{i + 1}</Text>
          <Text style={styles.name}>{l.name}</Text>
          <Text style={styles.score}>{String(l.score).padStart(4, '0')}</Text>
          <Text style={styles.time}>{relTime(l.at)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#1A1F4D',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 24,
    marginTop: 12,
    gap: 6,
  },
  title: { color: '#FFE54B', fontSize: 12, fontWeight: '900', letterSpacing: 3, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { color: '#FF6B6B', fontSize: 14, fontWeight: '900', width: 28 },
  name: { color: '#FFF', fontSize: 14, fontWeight: '700', flex: 1 },
  score: { color: '#FFE54B', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  time: { color: '#6B7280', fontSize: 11 },
  empty: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', textAlign: 'center', letterSpacing: 2 },
  hint: { color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 4 },
});