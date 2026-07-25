/**
 * src/shared/core/EventBus.ts · 跨模块事件总线(spec §3.5 + §3.9)
 * 解耦 game logic 与 UI(UI 订阅事件,不在 tick 中 setState)
 */
export type Listener<T> = (data: T) => void;

export class EventBus<T> {
  private listeners = new Set<Listener<T>>();

  on(l: Listener<T>): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  emit(data: T) {
    for (const l of this.listeners) l(data);
  }

  clear() {
    this.listeners.clear();
  }
}

export type GameEvent =
  | { type: 'eatPellet'; score: number }
  | { type: 'eatPower' }
  | { type: 'eatGhost'; score: number }
  | { type: 'playerHit' }
  | { type: 'lifeLost' }
  | { type: 'playerDied' }
  | { type: 'win' }
  | { type: 'lose' }
  | { type: 'combo'; count: number; multiplier: number };