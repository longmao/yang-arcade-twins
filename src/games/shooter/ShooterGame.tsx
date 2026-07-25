/**
 * src/games/shooter/ShooterGame.tsx · 纵向射击 RN 渲染 + 输入
 * 海信 Harness:input/output 通过 props,组件内只关绘制和状态机
 */
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { createInitial, movePlayer, shoot, tick } from './game';
import type { Enemy, State } from './types';
import { PauseOverlay } from '../../shared/PauseOverlay';
import { sfx } from '../../shared/audio';
import { hapt } from '../../shared/haptics';
import { pushTop3 } from '../../shared/storage';

const { width: SW, height: SH } = Dimensions.get('window');

const COLORS: Record<string, string> = {
  basic: '#FF6B6B',
  fast: '#FFE54B',
  tank: '#A78BFA',
  bomber: '#FF9F43',
};

export function ShooterGame({ onQuit }: { onQuit: () => void }) {
  const [s, setS] = useState<State>(createInitial);
  const prevScore = useRef(0);
  const prevCombo = useRef(0);
  const prevStatus = useRef('ready');

  useEffect(() => {
    if (s.status !== 'playing') return;
    const id = setInterval(() => setS((p) => tick(p)), 60);
    return () => clearInterval(id);
  }, [s.status]);

  useEffect(() => {
    if (s.score > prevScore.current) {
      sfx.eat();
      hapt.eat();
    }
    prevScore.current = s.score;
  }, [s.score]);

  useEffect(() => {
    if (s.combo >= 3 && s.combo > prevCombo.current) {
      // combo bonus hapt
    }
    prevCombo.current = s.combo;
  }, [s.combo]);

  useEffect(() => {
    if (s.status === 'over' && prevStatus.current !== 'over') {
      sfx.die();
      hapt.die();
      pushTop3('YANG', s.score).catch(() => {});
    }
    prevStatus.current = s.status;
  }, [s.status, s.score]);

  const move = (dx: number, dy: number) => setS((p) => movePlayer(p, dx, dy));
  const onFire = () => setS((p) => shoot(p));

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.score}>SCORE {String(s.score).padStart(5, '0')}</Text>
        <Text style={styles.combo}>×{s.combo}{s.maxCombo > 0 ? ` · max ${s.maxCombo}` : ''}</Text>
        <Pressable
          onPress={() => setS((p) => ({ ...p, status: p.status === 'paused' ? 'playing' : 'paused' }))}
          style={styles.pauseBtn}
        >
          <Text style={styles.pauseTxt}>{s.status === 'paused' ? '▶' : 'Ⅱ'}</Text>
        </Pressable>
      </View>

      <View style={styles.playAreaWrap}>
      <View style={styles.playArea}>
        {/* 玩家 */}
        <View
          style={[
            styles.player,
            {
              left: s.player.x * SW - 18,
              top: s.player.y * SH - 18,
            },
          ]}
        />
        {/* 敌机 */}
        {s.enemies.map((e) => (
          <View
            key={e.id}
            style={[
              styles.enemy,
              { left: e.x * SW - 18, top: e.y * SH - 18, backgroundColor: COLORS[e.type] },
            ]}
          />
        ))}
        {/* 子弹 */}
        {s.bullets.map((b) => (
          <View
            key={b.id}
            style={[styles.bullet, { left: b.x * SW - 2, top: b.y * SH }]}
          />
        ))}
      </View>
      </View>

      <View style={styles.dpad}>
        <View style={styles.dpadRow}>
          <Pad label="◀" onPress={() => move(-0.05, 0)} />
          <Pad label="▲" onPress={() => move(0, -0.04)} />
          <Pad label="▶" onPress={() => move(0.05, 0)} />
          <Pad label="▼" onPress={() => move(0, 0.04)} />
        </View>
      </View>

      <Pressable
        onPress={onFire}
        style={({ pressed }) => [styles.fireBtn, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.fireTxt}>FIRE</Text>
      </Pressable>

      {s.status === 'over' && (
        <View style={styles.center}>
          <Text style={styles.gameover}>GAME OVER</Text>
          <Text style={styles.gameoverSub}>{s.score} pts · max combo ×{s.maxCombo}</Text>
          <Pressable style={styles.menuBtn} onPress={onQuit}>
            <Text style={styles.menuTxt}>Back to menu</Text>
          </Pressable>
        </View>
      )}

      <PauseOverlay
        visible={s.status === 'paused'}
        onResume={() => setS((p) => ({ ...p, status: 'playing' }))}
        onRestart={() => setS(createInitial())}
        onQuit={onQuit}
      />
    </View>
  );
}

function Pad({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pad, pressed && { opacity: 0.5 }]}>
      <Text style={styles.padTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E27', paddingTop: 56 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  score: { color: '#FFE54B', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  combo: { color: '#FF6B6B', fontSize: 18, fontWeight: '800' },
  pauseBtn: { paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#1A1F4D', borderRadius: 8 },
  pauseTxt: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  playAreaWrap: { flex: 1, position: 'relative' },
  playArea: { flex: 1, position: 'relative' },
  player: { position: 'absolute', width: 36, height: 36, backgroundColor: '#FFE54B', borderRadius: 6 },
  enemy: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  bullet: { position: 'absolute', width: 4, height: 14, backgroundColor: '#FFE54B' },
  dpad: { paddingVertical: 12, paddingBottom: 16 },
  dpadRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  pad: { width: 56, height: 44, backgroundColor: '#1A1F4D', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  padTxt: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  fireBtn: { position: 'absolute', right: 20, bottom: 90, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: '#FF6B6B', borderRadius: 12 },
  fireTxt: { color: '#0A0E27', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  center: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,14,39,0.7)' },
  gameover: { color: '#FFE54B', fontSize: 40, fontWeight: '900', letterSpacing: 4 },
  gameoverSub: { color: '#FFF', fontSize: 18, marginTop: 8 },
  menuBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#FFE54B', borderRadius: 10 },
  menuTxt: { color: '#0A0E27', fontSize: 16, fontWeight: '800' },
});