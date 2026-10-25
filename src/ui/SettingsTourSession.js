/** UI-owned pause boundary; does not modify collision, route or player physics. */
export class SettingsTourSession {
  constructor({ controls, isMobile, minimap, welcomeOverlay }) {
    this.controls = controls;
    this.isMobile = isMobile;
    this.minimap = minimap;
    this.welcomeOverlay = welcomeOverlay;
    this.paused = false;
  }

  open() {
    if (this.paused) return;
    this.paused = true;
    this.previousFreeMove = this.controls.freeMove;
    this.previousLocked = this.controls.controls?.isLocked === true;
    this.previousWelcomeDisplay = this.welcomeOverlay?.style.display;
    this.controls.setFreeMove(false);
    this.controls.stop();
    this.controls.jumpQueued = false;
    this.controls.unlock();
    if (this.welcomeOverlay) this.welcomeOverlay.style.display = 'none';
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.controls.stop();
    // Returning to the tour is not returning to a stale clock/search field,
    // including map mode where no pointer-lock event will arrive to blur it.
    this.controls.releaseInputFocus?.();
    this.controls.jumpQueued = false;
    this.controls.prevTime = performance.now();
    this.controls.setFreeMove(this.previousFreeMove);
    if (this.welcomeOverlay) {
      this.welcomeOverlay.style.display = this.isMobile || this.minimap?.visible || this.previousFreeMove
        ? 'none' : this.previousLocked ? 'flex' : this.previousWelcomeDisplay;
    }
    if (!this.isMobile && this.previousLocked && !this.minimap?.visible && !this.previousFreeMove) {
      // Browsers may require a fresh canvas click after Escape or a new tab.
      try { this.controls.lock(); } catch { /* The welcome click fallback remains visible. */ }
    }
  }

  mapChanged(visible) {
    if (!this.paused) return;
    // A map state change while the modal owns input applies only on dismissal.
    this.previousFreeMove = visible;
    this.previousLocked = !this.isMobile && !visible;
  }

  updateControls() {
    if (!this.paused) {
      this.controls.update();
      return;
    }
    this.controls.prevTime = performance.now();
    Object.assign(this.controls.motion, { speed: 0, sprint: false, footstep: false });
  }
}
