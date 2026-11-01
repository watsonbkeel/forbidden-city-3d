/** The map is non-modal; settings retains its independent pause boundary. */
export class MapTourSession {
  constructor({ controls, welcomeOverlay, getSettingsSession }) {
    this.controls = controls;
    this.welcomeOverlay = welcomeOverlay;
    this.getSettingsSession = getSettingsSession;
  }

  setVisible(visible) {
    this.controls.setMapOpen(visible);
    const settings = this.getSettingsSession?.();
    if (settings?.paused) {
      settings.mapChanged(visible);
      return;
    }
    this.controls.setFreeMove(visible);
    if (visible) {
      if (this.welcomeOverlay) this.welcomeOverlay.style.display = 'none';
      this.controls.releasePointerForMap();
    } else {
      // A successful lock hides this through the existing lock listener. A
      // synchronous or asynchronous denial leaves a usable click-to-resume UI.
      if (!this.controls.isMobile && this.welcomeOverlay) this.welcomeOverlay.style.display = 'flex';
      try { this.controls.lock(); } catch { /* The visible entry can retry. */ }
    }
  }
}
