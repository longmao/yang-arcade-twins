/**
 * src/shared/core/PerformanceMonitor.ts · FPS / frame time 监控(spec §11 debug overlay)
 */
export class PerfMonitor {
  private frames: number[] = [];
  private lastReport = 0;
  private onReport: (fps: number, p95: number) => void;

  constructor(onReport: (fps: number, p95: number) => void) {
    this.onReport = onReport;
  }

  tick(now: number) {
    this.frames.push(now);
    if (now - this.lastReport < 1000) return;
    const recent = this.frames.filter((t) => t >= this.lastReport);
    if (recent.length === 0) return;
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i++) intervals.push(recent[i] - recent[i - 1]);
    const intervalsSorted = [...intervals].sort((a, b) => a - b);
    const p95 = intervalsSorted[Math.floor(intervalsSorted.length * 0.95)] ?? 16.67;
    this.onReport(intervals.length, p95);
    this.lastReport = now;
    this.frames = this.frames.filter((t) => t >= this.lastReport);
  }
}