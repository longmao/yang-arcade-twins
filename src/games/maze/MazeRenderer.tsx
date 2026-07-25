/**
 * src/games/maze/MazeRenderer.tsx · spec §8.13 程序绘制 Skia Canvas
 * spec §3.2 #2: 不创建独立 React 组件给每个鬼/豆子 — 用 Skia declarative + Canvas 一次性 batch
 */
import React from 'react';
import { Canvas, Rect, Circle, Group } from '@shopify/react-native-skia';
import type { State } from './types';

interface Props {
  state: State;
  width: number;
  height: number;
  cell: number;
}

export function MazeRenderer({ state, width, height, cell }: Props) {
  const COLS = state.grid[0].length;
  const ROWS = state.grid.length;
  const walls: React.ReactNode[] = [];
  const pellets: React.ReactNode[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = state.grid[y][x];
      if (t === 'w') walls.push(<Rect key={`w${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} color="#1F2557" />);
      else if (t === '.') pellets.push(<Rect key={`p${x}-${y}`} x={x * cell + cell / 2 - 1} y={y * cell + cell / 2 - 1} width={2} height={2} color="#9CA3AF" />);
      else if (t === 'p') pellets.push(<Circle key={`P${x}-${y}`} cx={x * cell + cell / 2} cy={y * cell + cell / 2} r={cell * 0.32} color="#FFE54B" />);
    }
  }
  const inPower = state.powerModeTicks > 0;
  const blinkEnd = inPower && state.powerModeTicks < 60 * 1.5;
  return (
    <Canvas style={{ width, height }}>
      <Group>
        <Rect x={0} y={0} width={width} height={height} color="#0A0E27" />
        {walls}
        {pellets}
        {/* player */}
        <Circle
          cx={state.player.x * cell + cell / 2}
          cy={state.player.y * cell + cell / 2}
          r={cell * 0.4}
          color="#FFE54B"
        />
        {/* ghosts */}
        {state.ghosts.map((g) => (
          <Circle
            key={g.id}
            cx={g.pos.x * cell + cell / 2}
            cy={g.pos.y * cell + cell / 2}
            r={cell * 0.4}
            color={inPower ? (blinkEnd ? '#FFFFFF' : '#3B6CFF') : g.color}
          />
        ))}
      </Group>
    </Canvas>
  );
}