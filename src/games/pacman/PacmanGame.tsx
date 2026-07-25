/**
 * src/games/pacman/PacmanGame.tsx · React Native 渲染 + 输入
 * 海信 Harness:input/output 通过 props,组件内只关绘制和状态机
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLS, ROWS } from './grid';
import { createInitial, setDir, tick } from './game';
import type { Dir, State } from './types';
import { PauseOverlay } from '../../shared/PauseOverlay';
import { sfx } from '../../shared/audio';
import { hapt } from '../../shared/haptics';
import { pushTop3 } from '../../shared/storage';

const TICK_MS = 100;

function tileSize() {
  const { width, height } = Dimensions.get('window');
  // HUD ≈40, dpad ≈120, padding ≈80 → 留 ~240 给 board
  const availW = width - 32;
  const availH = height - 280;
  const byW = Math.floor(availW / COLS);
  const byH = Math.floor(availH / ROWS);
  return Math.min(byW, byH, 40);
}

export function PacmanGame({ onQuit }: { onQuit: () => void }) {
  const [s, setS] = useState<State>(createInitial);
  const prevScore = useRef(0);
  const prevLives = useRef(true);

  useEffect(() => {
    if (s.status !== 'playing') return;
    const id = setInterval(() => setS((p) => tick(p)), TICK_MS);
    return () => clearInterval(id);
  }, [s.status]);

  // 吃豆音效 + 震动
  useEffect(() => {
    if (s.score > prevScore.current) {
      sfx.eat();
      hapt.eat();
    }
    prevScore.current = s.score;
  }, [s.score]);

  // 死亡音效 + 震动 + 持久化最高分(Sprint 1 Phase 2)
  useEffect(() => {
    if (s.status === 'over' && prevLives.current) {
      sfx.die();
      hapt.die();
      pushTop3('YANG', s.score).catch(() => {});
      prevLives.current = false;
    }
  }, [s.status, s.score]);

  const move = useCallback((d: Dir) => setS((p) => setDir(p, d)), []);

  const ts = tileSize();
  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.score}>SCORE {String(s.score).padStart(4, '0')}</Text>
        <Pressable
          onPress={() => setS((p) => ({ ...p, status: p.status === 'paused' ? 'playing' : 'paused' }))}
          style={styles.pauseBtn}
        >
          <Text style={styles.pauseTxt}>{s.status === 'paused' ? '▶' : 'Ⅱ'}</Text>
        </Pressable>
      </View>
      <View style={styles.boardWrap}>
      <View style={[styles.board, { width: ts * COLS, height: ts * ROWS }]}>
        {s.grid.map((row, y) =>
          row.map((t, x) => (
            <View
              key={`${x}-${y}`}
              style={[
                styles.cell,
                { left: x * ts, top: y * ts, width: ts, height: ts },
                t === 'w' && styles.wall,
                t === '.' && styles.pellet,
                t === 'p' && styles.power,
              ]}
            />
          )),
        )}
        {s.player.x >= 0 && (
          <View
            style={[
              styles.player,
              {
                left: s.player.x * ts + ts * 0.1,
                top: s.player.y * ts + ts * 0.1,
                width: ts * 0.8,
                height: ts * 0.8,
                borderRadius: ts * 0.4,
              },
            ]}
          />
        )}
        {s.ghosts.map((g) => (
          <View
            key={g.id}
            style={[
              styles.ghost,
              {
                left: g.pos.x * ts + ts * 0.1,
                top: g.pos.y * ts + ts * 0.1,
                width: ts * 0.8,
                height: ts * 0.8,
                borderRadius: ts * 0.4,
                backgroundColor: g.color,
              },
            ]}
          />
        ))}
      </View>
      </View>

      <View style={styles.dpad}>
        <View style={styles.dpadRow}>
          <View style={styles.dpadSpacer} />
          <Pad label="↑" onPress={() => move('U')} />
          <View style={styles.dpadSpacer} />
        </View>
        <View style={styles.dpadRow}>
          <Pad label="←" onPress={() => move('L')} />
          <Pad label="↓" onPress={() => move('D')} />
          <Pad label="→" onPress={() => move('R')} />
        </View>
      </View>

      {s.status === 'over' && (
        <View style={styles.center}>
          <Text style={styles.gameover}>GAME OVER</Text>
          <Text style={styles.gameoverSub}>{s.score} pts</Text>
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pad, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.padTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E27', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 56 },
  hud: { width: '92%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  score: { color: '#FFE54B', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  pauseBtn: { paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#1A1F4D', borderRadius: 8 },
  pauseTxt: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  boardWrap: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  board: { position: 'relative', backgroundColor: '#0A0E27', borderWidth: 2, borderColor: '#1F2557' },
  cell: { position: 'absolute', backgroundColor: 'transparent' },
  wall: { backgroundColor: '#1F2557' },
  pellet: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3B425A', borderRadius: 999 },
  power: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FFE54B', borderRadius: 999 },
  player: { position: 'absolute', backgroundColor: '#FFE54B' },
  ghost: { position: 'absolute' },
  dpad: { paddingBottom: 16, gap: 6 },
  dpadRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  dpadSpacer: { width: 56 },
  pad: { width: 56, height: 44, backgroundColor: '#1A1F4D', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  padTxt: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  center: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,14,39,0.7)' },
  gameover: { color: '#FFE54B', fontSize: 40, fontWeight: '900', letterSpacing: 4 },
  gameoverSub: { color: '#FFF', fontSize: 22, marginTop: 8 },
  menuBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#FFE54B', borderRadius: 10 },
  menuTxt: { color: '#0A0E27', fontSize: 16, fontWeight: '800' },
});
