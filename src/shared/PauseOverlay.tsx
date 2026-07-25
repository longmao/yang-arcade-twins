/**
 * src/shared/PauseOverlay.tsx · 跨游戏暂停层(Sprint 1 共用)
 */
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = { visible: boolean; onResume: () => void; onRestart: () => void; onQuit: () => void };

export function PauseOverlay({ visible, onResume, onRestart, onQuit }: Props) {
  if (!visible) return null;
  return (
    <View style={S.scrim}>
      <View style={S.card}>
        <Text style={S.title}>PAUSED</Text>
        <Btn label="Resume" onPress={onResume} primary />
        <Btn label="Restart" onPress={onRestart} />
        <Btn label="Quit to menu" onPress={onQuit} />
      </View>
    </View>
  );
}

function Btn({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[S.btn, primary && S.btnPrimary]}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
    >
      <Text style={[S.btnText, primary && S.btnTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const S = StyleSheet.create({
  scrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: { backgroundColor: '#1A1F4D', borderRadius: 18, padding: 28, width: 280, gap: 12 },
  title: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: 6, marginBottom: 8 },
  btn: { paddingVertical: 12, borderRadius: 10, backgroundColor: '#2A2F6D', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#FFE54B' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnTextPrimary: { color: '#0A0E27' },
});
