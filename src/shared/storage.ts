/**
 * src/shared/storage.ts · AsyncStorage 包装(Sprint 1 简版)
 * 最高分 + Top 3 历史(Sprint 1 Phase 2 接)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_HIGH = 'yat:highScore:v1';
const KEY_TOP3 = 'yat:leaderboard:v1';

export type Leader = { name: string; score: number; at: number };

export async function getHigh(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY_HIGH);
  return raw ? Number(raw) || 0 : 0;
}

export async function setHigh(score: number): Promise<boolean> {
  const cur = await getHigh();
  if (score > cur) {
    await AsyncStorage.setItem(KEY_HIGH, String(score));
    return true;
  }
  return false;
}

export async function getTop3(): Promise<Leader[]> {
  const raw = await AsyncStorage.getItem(KEY_TOP3);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Leader[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function pushTop3(name: string, score: number): Promise<Leader[]> {
  const cur = await getTop3();
  const next = [...cur, { name, score, at: Date.now() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  await AsyncStorage.setItem(KEY_TOP3, JSON.stringify(next));
  return next;
}
