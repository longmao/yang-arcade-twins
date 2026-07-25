/**
 * src/games/pacman/grid.ts · 18×10 迷宫静态数据(Sprint 1 简化经典)
 * 海信 Harness #1:数据驱动
 */
import { Tile } from './types';

export const COLS = 18;
export const ROWS = 10;

const RAW = [
  'wwwwwwwwwwwwwwwwww',
  'w........w........w',
  'w.wp.w..w..w..wp..w',
  'w....w........w...w',
  'wwww.w.wwwww.w.wwww',
  'w....w........w...w',
  'w.wp.w..w..w..wp..w',
  'w........w........w',
  'w....p...p..p.....w',
  'wwwwwwwwwwwwwwwwww',
];

export function buildGrid(): Tile[][] {
  return RAW.map((row) => row.split('') as Tile[]);
}
