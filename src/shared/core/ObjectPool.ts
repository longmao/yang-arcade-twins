/**
 * src/shared/core/ObjectPool.ts · 高频对象复用池(spec §3 强制 #7)
 * 子弹/粒子/爆炸 — 复用对象避免 GC
 */
export class Pool<T> {
  private free: T[] = [];
  private factory: () => T;
  private reset?: (obj: T) => void;

  constructor(factory: () => T, reset?: (obj: T) => void) {
    this.factory = factory;
    this.reset = reset;
  }

  acquire(): T {
    const obj = this.free.pop() ?? this.factory();
    this.reset?.(obj);
    return obj;
  }

  release(obj: T): void {
    this.free.push(obj);
  }

  size(): number {
    return this.free.length;
  }
}