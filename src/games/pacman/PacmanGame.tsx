/**
 * src/games/pacman/PacmanGame.tsx · spec P1-C MVP
 * 海信 Harness:input/output 通过 props,组件内只关绘制和状态机
 * 增量: 3 生命 + 能量模式 + 通关 + Restart + 滑动控制
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
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
  const availW = width - 32;
  const availH = height - 280;
  const byW = Math.floor(availW / COLS);
  const byH = Math.floor(availH / ROWS);
  return Math.min(byW, byH, 40);
}

export function PacmanGame({ onQuit }: { onQuit: () => void }) {
  const [s, setS] = useState<State>(createInitial);
  const prevScore = useRef(0);
  const prevStatus = useRef('ready');

  useEffect(() => {
    if (s.status !== 'playing') return;
    const id = setInterval(() => setS((p) => tick(p)), TICK_MS);
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
    if ((s.status === 'over' || s.status === 'win') && prevStatus.current !== s.status) {
      sfx.die();
      hapt.die();
      pushTop3('YANG', s.score).catch(() => {});
    }
    prevStatus.current = s.status;
  }, [s.status, s.score]);

  const move = useCallback((d: Dir) => setS((p) => setDir(p, d)), []);

  const swipe = Gesture.Race(
    Gesture.Fling().direction(Directions.UP).onStart(() => runOnJS(move)('U')),
    Gesture.Fling().direction(Directions.DOWN).onStart(() => runOnJS(move)('D')),
    Gesture.Fling().direction(Directions.LEFT).onStart(() => runOnJS(move)('L')),
    Gesture.Fling().direction(Directions.RIGHT).onStart(() => runOnJS(move)('R')),
  );

  const ts = tileSize();
  const livesStr = '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(Math.max(0, 3 - s.lives));
  const inPower = s.powerModeTicks > 0;
  const powerSecsLeft = (s.powerModeTicks / (1000 / TICK_MS)).toFixed(1);

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Text style={styles.score}>SCORE {String(s.score).padStart(4, '0')}</Text>
          <Text style={styles.lives}>{livesStr}</Text>
        </View>
        {inPower && (
          <Text style={styles.powerTimer}>⚡{powerSecsLeft}s</Text>
        )}
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
                    backgroundColor: inPower ? '#3B6CFF' : g.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </GestureDetector>

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

      {(s.status === 'over' || s.status === 'win') && (
        <View style={styles.center}>
          <Text style={styles.gameover}>{s.status === 'win' ? 'MAZE CLEAR!' : 'GAME OVER'}</Text>
          <Text style={styles.gameoverSub}>{s.score} pts · {s.pellets} pellets left</Text>
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
  root: { flex: 1, backgroundColor: '#0A0E27', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 56 },
  hud: { width: '92%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hudLeft: { flexDirection: 'column', gap: 4 },
  score: { color: '#FFE54B', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  lives: { color: '#FF6B6B', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  powerTimer: { color: '#FFE54B', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
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
  center: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,14,39,0.85)', gap: 16 },
  gameover: { color: '#FFE54B', fontSize: 40, fontWeight: '900', letterSpacing: 4 },
  gameoverSub: { color: '#FFF', fontSize: 18, marginTop: 8 },
  endBtns: { flexDirection: 'row', gap: 16, marginTop: 24 },
  endBtn: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#FFE54B', borderRadius: 12 },
  endBtnAlt: { backgroundColor: '#1A1F4D' },
  endBtnTxt: { color: '#0A0E27', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  endBtnTxtAlt: { color: '#FFF' },
});