/**
 * src/games/shooter/ShooterRenderer.tsx · spec §9 Skia Canvas 渲染
 */
import React from 'react';
import { Canvas, Circle, Group, Rect } from '@shopify/react-native-skia';
import type { State } from './ShooterRuntime';

interface Props {
  state: State;
  width: number;
  height: number;
}

export function ShooterRenderer({ state, width, height }: Props) {
  return (
    <Canvas style={{ width, height }}>
      <Group>
        {/* background stars */}
        <Rect x={0} y={0} width={width} height={height} color="#0A0E27" />
        {Array.from({ length: 20 }).map((_, i) => (
          <Circle
            key={`s${i}`}
            cx={(i * 47) % width}
            cy={((state.tick * 0.5 + i * 31) % height)}
            r={1}
            color="#3B425A"
          />
        ))}
        {/* bullets */}
        {state.bullets.filter((b) => b.active).map((b) => (
          <Rect
            key={`b${b.x}-${b.y}-${b.team}`}
            x={b.x - 2}
            y={b.y - 4}
            width={4}
            height={8}
            color={b.team === 'player' ? '#FFE54B' : '#FF6B6B'}
          />
        ))}
        {/* power-ups */}
        {state.powerUps.filter((p) => p.active).map((p) => (
          <Circle key={`pu${p.x}-${p.y}`} cx={p.x} cy={p.y} r={10} color={p.kind === 'weapon' ? '#FFE54B' : p.kind === 'shield' ? '#3BD9FF' : '#FF3B3B'} />
        ))}
        {/* enemies */}
        {state.enemies.filter((e) => e.active).map((e) => {
          const color = e.kind === 'recon' ? '#FF6B6B' : e.kind === 'sine' ? '#FFE54B' : e.kind === 'charger' ? '#FF9F43' : e.kind === 'turret' ? '#A78BFA' : '#FF3B3B';
          const r = e.kind === 'elite' ? 30 : e.kind === 'turret' ? 18 : 12;
          return <Circle key={`e${e.x}-${e.y}`} cx={e.x} cy={e.y} r={r} color={color} />;
        })}
        {/* player */}
        <Circle
          cx={state.player.x}
          cy={state.player.y}
          r={16}
          color={state.player.invulnTicks > 0 && Math.floor(state.tick / 4) % 2 === 0 ? '#888' : '#FFE54B'}
        />
        {state.player.shield && (
          <Circle cx={state.player.x} cy={state.player.y} r={26} color="rgba(59,217,255,0.3)" />
        )}
        {/* particles */}
        {state.particles.filter((p) => p.active).map((p) => (
          <Circle key={`p${p.x}-${p.y}`} cx={p.x} cy={p.y} r={3} color={p.color} />
        ))}
      </Group>
    </Canvas>
  );
}