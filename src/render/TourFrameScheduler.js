/** One main tour RAF. Eco skips the entire simulation/render frame, not just draw.
 * No catch-up burst: hidden time is discarded; ordinary visible dt stays capped.
 * Generation checks reject callbacks already dispatched when cancellation occurs.
 */
export class TourFrameScheduler {
  constructor({onFrame, onReset = () => {}, onError = error => { throw error; }, mode = 'eco', document: doc = document,
    request = fn => requestAnimationFrame(fn), cancel = id => cancelAnimationFrame(id),
    now = () => performance.now()} = {}) {
    if (typeof onFrame !== 'function') throw new TypeError('onFrame is required');
    this.doc = doc; this.request = request; this.cancel = cancel; this.now = now;
    if (typeof onError !== 'function') throw new TypeError('onError must be a function');
    this.onFrame = onFrame; this.onReset = onReset; this.onError = onError; this.failed = false;
    this.running = false; this.disposed = false; this.pending = null; this.generation = 0;
    this.lastTime = null; this.deadline = null;
    this.setMode(mode);
    this.visibility = () => {
      if (!this.running || this.disposed) return;
      this.invalidate();
      this.resetClock();
      if (!this.doc.hidden) this.schedule();
    };
  }
  setMode(mode) {
    if (mode !== 'eco' && mode !== 'smooth') throw new Error(`Unsupported performance mode: ${mode}`);
    this.mode = mode; this.deadline = null;
  }
  resetClock() {
    this.lastTime = null; this.deadline = null; this.onReset(this.now());
  }
  invalidate() {
    this.generation++;
    if (this.pending !== null) this.cancel(this.pending);
    this.pending = null;
  }
  start() {
    if (this.running || this.disposed || this.failed) return;
    this.running = true;
    this.doc.addEventListener('visibilitychange', this.visibility);
    this.resetClock();
    this.schedule();
  }
  schedule() {
    if (!this.running || this.disposed || this.doc.hidden || this.pending !== null) return;
    const generation = this.generation;
    this.pending = this.request(timestamp => {
      if (generation !== this.generation || this.disposed || !this.running) return;
      this.pending = null;
      if (this.doc.hidden) { this.visibility(); return; }
      const now = Number.isFinite(timestamp) ? timestamp : this.now();
      // Carry the deadline's remainder. Never round 33.333ms up to three 60Hz frames.
      const interval = 1000 / 30;
      if (this.mode === 'smooth' || this.deadline === null || now + 1e-6 >= this.deadline) {
        const dt = this.lastTime === null ? 0 : Math.max(0, Math.min((now - this.lastTime) / 1000, .1));
        if (this.deadline === null || this.mode === 'smooth') this.deadline = now + interval;
        else this.deadline += Math.max(1, Math.floor((now - this.deadline + 1e-6) / interval) + 1) * interval;
        this.lastTime = now;
        try { this.onFrame(now, dt); }
        catch (error) {
          // Never repeat a partially completed world frame or revive it on visibility.
          this.failed = true; this.running = false;
          this.invalidate();
          this.doc.removeEventListener('visibilitychange', this.visibility);
          this.onError(error);
          return;
        }
      }
      this.schedule();
    });
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.running = false;
    this.invalidate();
    this.doc.removeEventListener('visibilitychange', this.visibility);
  }
}
