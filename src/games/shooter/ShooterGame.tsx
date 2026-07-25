/**
 * src/games/shooter/ShooterGame.tsx · spec §9 Shooter MVP entry
 * Skia Canvas + 4 敌机 + 4 波 + 精英 + 强化 + 自动射击 + 60Hz
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createInitial, movePlayer, setPlayerTarget, tick, SHOOTER_W, SHOOTER_H, SHOOTER_TICK_MS } from './ShooterRuntime';
import type { State } from './ShooterRuntime';
import { ShooterRenderer } from './ShooterRenderer';
import { PauseOverlay } from '../../shared/PauseOverlay';
import { sfx } from '../../shared/audio';
import { hapt } from '../../shared/haptics';
import { pushTop3 } from '../../shared/storage';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');
const SCALE = Math.min(WIN_W / SHOOTER_W, (WIN_H - 320) / SHOOTER_H);
const BOARD_W = SHOOTER_W * SCALE;
const BOARD_H = SHOOTER_H * SCALE;

export function ShooterGame({ onQuit }: { onQuit: () => void }) {
  const [s, setS] = useState<State>(createInitial);
  const prevScore = useRef(0);
  const prevStatus = useRef('ready');

  useEffect(() => {
    if (s.status !== 'playing') return;
    const id = setInterval(() => setS((p) => tick(p, Date.now())), SHOOTER_TICK_MS);
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

  // 拖动玩家 (PanResponder)
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const x = (evt.nativeEvent.locationX) / SCALE;
        const y = (evt.nativeEvent.locationY) / SCALE;
        setS((p) => setPlayerTarget(p, x, y));
      },
    }),
  ).current;

  const onKey = useCallback((dx: number, dy: number) => setS((p) => movePlayer(p, dx, dy)), []);
  const bombsLeft = s.player.shield ? 1 : 0;

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.score}>SCORE {String(s.score).padStart(5, '0')}</Text>
        <Text style={styles.combo}>×{s.combo}{s.combo > 0 ? ` · max ${s.maxCombo}` : ''}</Text>
        <Text style={styles.weapon}>L{s.player.weaponLevel} · ♥{s.player.hp}{s.player.shield ? '🛡' : ''}</Text>
        <TouchableOpacity
          onPress={() => setS((p) => ({ ...p, status: p.status === 'paused' ? 'playing' : 'paused' }))}
          style={styles.pauseBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.pauseTxt}>{s.status === 'paused' ? '▶' : 'Ⅱ'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.boardWrap, { width: BOARD_W, height: BOARD_H }]} {...pan.panHandlers}>
        <ShooterRenderer state={s} width={BOARD_W} height={BOARD_H} />
      </View>

      <View style={styles.dpad}>
        <View style={styles.dpadRow}>
          <Pad label="◀" onPress={() => onKey(-20, 0)} />
          <Pad label="▲" onPress={() => onKey(0, -20)} />
          <Pad label="▶" onPress={() => onKey(20, 0)} />
          <Pad label="▼" onPress={() => onKey(0, 20)} />
        </View>
      </View>

      {(s.status === 'over' || s.status === 'win') && (
        <View style={styles.center}>
          <Text style={styles.gameover}>{s.status === 'win' ? 'STAGE CLEAR!' : 'GAME OVER'}</Text>
          <Text style={styles.gameoverSub}>{s.score} pts · wave {s.wave + 1} · max combo ×{s.maxCombo}</Text>
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
  hud: { width: '92%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 },
  score: { color: '#FFE54B', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  combo: { color: '#FF6B6B', fontSize: 16, fontWeight: '800' },
  weapon: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  pauseBtn: { paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#1A1F4D', borderRadius: 8 },
  pauseTxt: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  boardWrap: { backgroundColor: '#000', borderWidth: 1, borderColor: '#1F2557' },
  dpad: { paddingVertical: 12, paddingBottom: 16 },
  dpadRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  pad: { width: 56, height: 44, backgroundColor: '#1A1F4D', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  padTxt: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  center: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,14,39,0.85)', gap: 16 },
  gameover: { color: '#FFE54B', fontSize: 36, fontWeight: '900', letterSpacing: 4 },
  gameoverSub: { color: '#FFF', fontSize: 16 },
  endBtns: { flexDirection: 'row', gap: 16, marginTop: 24 },
  endBtn: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#FFE54B', borderRadius: 12 },
  endBtnAlt: { backgroundColor: '#1A1F4D' },
  endBtnTxt: { color: '#0A0E27', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  endBtnTxtAlt: { color: '#FFF' },
});