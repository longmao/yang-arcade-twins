/**
 * src/shared/rendering/SharedCanvas.tsx · Skia Canvas wrapper (spec §3.2 #1)
 * spec §3.2 #3: game state 放 useRef/useSharedValue,Skia 每帧自动 redraw
 * 不每帧 setState.
 */
import React from 'react';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';

interface Props {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export function SharedCanvas({ width, height, children }: Props) {
  return (
    <Canvas style={{ width, height }}>
      <Group>{children}</Group>
    </Canvas>
  );
}

export function BgRect({ width, height, color }: { width: number; height: number; color: string }) {
  return <Rect x={0} y={0} width={width} height={height} color={color} />;
}