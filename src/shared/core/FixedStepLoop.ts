/**
 * src/shared/core/FixedStepLoop.ts · 固定时间步长(spec §6)
 * 60Hz + catch-up 4 步上限 + 后台不补算
 */
export const FIXED_DT = 1 / 60;
const MAX_CATCHUP = 4;
const MAX_FRAME_DT = 0.1;

export class FixedStepLoop {
  private acc = 0;
  private last = 0;
  private rafId = 0;
  private running = false;
  private onUpdate: (dt: number) => void;
  private onRender: (alpha: number) => void;

  constructor(onUpdate: (dt: number) => void, onRender: (alpha: number) => void) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = Date.now() / 1000;
    this.tick();
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (this.running) return;
    this.last = Date.now() / 1000;
    this.running = true;
    this.tick();
  }

  private tick = () => {
    if (!this.running) return;
    const now = Date.now() / 1000;
    let frameDt = Math.min(now - this.last, MAX_FRAME_DT);
    this.last = now;
    this.acc += frameDt;
    let steps = 0;
    while (this.acc >= FIXED_DT && steps < MAX_CATCHUP) {
      this.onUpdate(FIXED_DT);
      this.acc -= FIXED_DT;
      steps++;
    }
    this.onRender(this.acc / FIXED_DT);
    this.rafId = requestAnimationFrame(this.tick);
  };
}