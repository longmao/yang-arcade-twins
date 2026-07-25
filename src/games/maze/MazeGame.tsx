/**
 * src/games/maze/MazeGame.tsx · spec P1-C Maze MVP entry
 * 把 MazeRuntime 接入 React (tick setState per 100ms 是 spec 妥协 — Skia 已用)
 * spec §3.2 #3 fully imperative: TODO Sprint 4 把 tick 改 useRef + requestAnimationFrame
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { COLS, ROWS } from './MazeConfig';
import { createInitial, setDir, tick, TICK_HZ } from './MazeRuntime';
import type { Dir, State } from './types';
import { MazeRenderer } from './MazeRenderer';
import { PauseOverlay } from '../../shared/PauseOverlay';
import { sfx } from '../../shared/audio';
import { hapt } from '../../shared/haptics';
import { pushTop3 } from '../../shared/storage';

const TICK_MS = Math.round(1000 / TICK_HZ);

function cellSize() {
  const { width, height } = Dimensions.get('window');
  const availW = width - 32;
  const availH = height - 280;
  return Math.floor(Math.min(availW / COLS, availH / ROWS));
}

export function MazeGame({ onQuit }: { onQuit: () => void }) {
  const [s, setS] = useState<State>(createInitial);
  const prevScore = useRef(0);
  const prevStatus = useRef('ready');

  useEffect(() => {
    if (s.status !== 'playing') return;
    const id = setInterval(() => setS((p) => tick(p)), TICK_MS);
    return () => clearInterval(id);
  }, [s.status]);

  // spec §6 BackgroundMode: app 入后台/锁屏 → game 自动暂停;回前台 → 显示暂停屏(不补算)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        setS((p) => (p.status === 'playing' ? { ...p, status: 'paused' } : p));
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (s.score > prevScore.current) {
      sfx.eat();
      hapt.eat();
    }
    prevScore.current = s.score;
  }, [s.score]);

  useEffect(() => {
    if ((s.status === 'over' || s.status === 'win') && prevStatus.current !== s.status) {
      sfx.die();
      hapt.die();
      pushTop3('YANG', s.score).catch(() => {});
    }
    prevStatus.current = s.status;
  }, [s.status, s.score]);

  const move = useCallback((d: Dir) => setS((p) => setDir(p, d)), []);
  const swipe = Gesture.Race(
    Gesture.Fling().direction(Directions.UP).onStart(() => runOnJS(move)('up')),
    Gesture.Fling().direction(Directions.DOWN).onStart(() => runOnJS(move)('down')),
    Gesture.Fling().direction(Directions.LEFT).onStart(() => runOnJS(move)('left')),
    Gesture.Fling().direction(Directions.RIGHT).onStart(() => runOnJS(move)('right')),
  );

  const cell = cellSize();
  const boardW = cell * COLS;
  const boardH = cell * ROWS;
  const inPower = s.powerModeTicks > 0;
  const powerSecs = (s.powerModeTicks / TICK_HZ).toFixed(1);
  const livesStr = '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(Math.max(0, 3 - s.lives));

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.score}>SCORE {String(s.score).padStart(5, '0')}</Text>
          <Text style={styles.lives}>{livesStr}</Text>
        </View>
        {inPower && <Text style={styles.powerTimer}>⚡{powerSecs}s</Text>}
        <TouchableOpacity
          onPress={() => setS((p) => ({ ...p, status: p.status === 'paused' ? 'playing' : 'paused' }))}
          style={styles.pauseBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.pauseTxt}>{s.status === 'paused' ? '▶' : 'Ⅱ'}</Text>
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={swipe}>
        <View style={styles.boardWrap}>
          <MazeRenderer state={s} width={boardW} height={boardH} cell={cell} />
        </View>
      </GestureDetector>
      <View style={styles.dpad}>
        <View style={styles.dpadRow}>
          <View style={styles.dpadSpacer} />
          <Pad label="↑" onPress={() => move('up')} />
          <View style={styles.dpadSpacer} />
        </View>
        <View style={styles.dpadRow}>
          <Pad label="←" onPress={() => move('left')} />
          <Pad label="↓" onPress={() => move('down')} />
          <Pad label="→" onPress={() => move('right')} />
        </View>
      </View>
      {(s.status === 'over' || s.status === 'win') && (
        <View style={styles.center}>
          <Text style={styles.gameover}>{s.status === 'win' ? 'MAZE CLEAR!' : 'GAME OVER'}</Text>
          <Text style={styles.gameoverSub}>{s.score} pts · {s.pellets} pellets</Text>
          <View style={styles.endBtns}>
            <TouchableOpacity style={styles.endBtn} onPress={() => setS(createInitial())} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <Text style={styles.endBtnTxt}>RESTART</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.endBtn, styles.endBtnAlt]} onPress={onQuit} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <Text style={[styles.endBtnTxt, styles.endBtnTxtAlt]}>MENU</Text>
            </TouchableOpacity>
          </View>
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
    <TouchableOpacity onPress={onPress} style={styles.pad} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
      <Text style={styles.padTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E27', alignItems: 'center', paddingTop: 56 },
  hud: { width: '92%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  score: { color: '#FFE54B', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  lives: { color: '#FF6B6B', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  powerTimer: { color: '#FFE54B', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  pauseBtn: { paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#1A1F4D', borderRadius: 8 },
  pauseTxt: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  boardWrap: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  dpad: { paddingBottom: 16, gap: 6 },
  dpadRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  dpadSpacer: { width: 56 },
  pad: { width: 56, height: 44, backgroundColor: '#1A1F4D', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  padTxt: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  center: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,14,39,0.85)', gap: 16 },
  gameover: { color: '#FFE54B', fontSize: 40, fontWeight: '900', letterSpacing: 4 },
  gameoverSub: { color: '#FFF', fontSize: 18, marginTop: 8 },
  endBtns: { flexDirection: 'row', gap: 16, marginTop: 24 },
  endBtn: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#FFE54B', borderRadius: 12 },
  endBtnAlt: { backgroundColor: '#1A1F4D' },
  endBtnTxt: { color: '#0A0E27', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  endBtnTxtAlt: { color: '#FFF' },
});