/** Settings and dated research limits. No remote content is fetched by this UI. */
export class SettingsMenu {
  constructor(container) {
    this.container = container;
    this.overlay = null;
    this.panel = null;
    this.launcher = null;
    this.visible = false;
    this.currentQuality = 'high';
    this.soundEnabled = true;
    this.listeners = [];
    this.inertBeforeOpen = new Map();
    this.secondaryTaps = new Map();
  }

  init({ onOpen, onResume, onQualityChange, onSoundToggle, initialQuality = 'high', initialSound = true } = {}) {
    this.onOpen = onOpen;
    this.onResume = onResume;
    this.onQualityChange = onQualityChange;
    this.onSoundToggle = onSoundToggle;
    this.currentQuality = initialQuality;
    this.soundEnabled = initialSound;

    this.launcher = document.createElement('button');
    this.launcher.id = 'structural-preview-button';
    this.launcher.setAttribute('type', 'button');
    this.launcher.setAttribute('aria-haspopup', 'dialog');
    this.launcher.setAttribute('aria-controls', 'settings-panel');
    this.launcher.setAttribute('aria-expanded', 'false');
    this.launcher.innerHTML = '<strong>结构研究预览</strong><span>游戏路线不代表现场开放 · 设置与来源</span>';
    this.container.appendChild(this.launcher);

    this.overlay = document.createElement('div');
    this.overlay.id = 'settings-overlay';
    // Above welcome (9000), below loading (9999). Keep this explicit for QA.
    this.overlay.style.zIndex = '9500';
    this.overlay.style.display = 'none';
    this.panel = document.createElement('div');
    this.panel.id = 'settings-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');
    this.panel.setAttribute('aria-labelledby', 'settings-title');
    this.panel.setAttribute('aria-describedby', 'preview-limit');
    this.panel.innerHTML = `
      <header class="settings-header">
        <h2 id="settings-title" tabindex="-1">游览设置</h2>
        <button id="settings-close-btn" type="button" aria-label="关闭设置，继续游览">关闭</button>
      </header>
      <div id="settings-content" tabindex="0" role="region" aria-label="设置与资料说明，可滚动">
        <p id="preview-limit" class="settings-notice">结构研究预览。游戏中的可行走路径不代表现场游客开放路线。</p>
        <div class="settings-control">
          <label for="sound-toggle-btn">音效</label>
          <button id="sound-toggle-btn" type="button">🔊 音效已开启</button>
        </div>
        <div class="settings-control">
          <label for="quality-toggle-btn">画质</label>
          <button id="quality-toggle-btn" type="button">高画质</button>
        </div>
        <p class="settings-help">按 M 显示/隐藏小地图；点击建筑名称传送。数字键 1–8：午门、太和殿、乾清宫、御花园、东六宫、西六宫、宁寿宫、神武门。移动端点击右上角地图。</p>
        <details id="preview-details">
          <summary>资料来源与限制（核查至 2026-10-14）</summary>
          <h3>有资料支持的结构</h3>
          <p>弘义阁、体仁阁的柱网与竖向层次依据杨新成《故宫弘义阁、体仁阁研究》（2006 年）。三大殿共用台基的东西腰部台阶位置关系，参考 1960 年平面图和 2020 年刊载的照片。</p>
          <ul>
            <li><a href="https://www.dpm.org.cn/Uploads/File/2019/11/14/u5dcd2fd72ceee.pdf" target="_blank" rel="noopener noreferrer">两阁测绘研究（2006，官方 PDF，新窗口）</a></li>
            <li><a href="https://www.dpm.org.cn/building/talk/223358.html" target="_blank" rel="noopener noreferrer">《故宫三大殿》（1960，官方资料，新窗口）</a></li>
            <li><a href="https://img.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf" target="_blank" rel="noopener noreferrer">三台照片与历史比较（2020，官方 PDF，新窗口）</a></li>
          </ul>
          <h3>仍属暂定的尺寸与细节</h3>
          <p>部分屋面、构件细节及台基接口仍为近似。新增侧阶的模型中心 z=58 m、外宽 5 m，以及沿用的台基层高、轮廓和踏步细节均为工程暂定值，不是现场实测。本轮保留既有全局定位，未完成全宫 2026 年现状核验。</p>
          <h3>现场开放须另行确认</h3>
          <p>故宫博物院 2026-07-31 公告称，太和门自 2026-08-03 起封闭施工。截至 2026-10-14 的资料检索未找到官方重新开放确认；这不是当日现场核实，也不能推断其他建筑、桥或侧阶的开放情况。</p>
          <p>出行请以博物院最新公告和现场安排为准。此说明不改变游戏路线。</p>
          <ul>
            <li><a href="https://www.dpm.org.cn/announce_detail/379422.html" target="_blank" rel="noopener noreferrer">太和门施工公告（2026-07-31，新窗口）</a></li>
            <li><a href="https://www.dpm.org.cn/announce.html" target="_blank" rel="noopener noreferrer">故宫博物院公告（新窗口）</a></li>
          </ul>
        </details>
      </div>
      <footer class="settings-footer">
        <button id="resume-btn" type="button">继续游览</button>
        <p>Esc 返回 · Tab 切换控件 · 说明区域可滚动</p>
      </footer>
    `;
    this.overlay.appendChild(this.panel);
    this.container.appendChild(this.overlay);
    this.bindEvents();
    this.updateSoundButton();
    this.updateQualityButton();
  }

  listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  bindEvents() {
    this.listen(this.launcher, 'click', () => this.show());
    // A second finger does not necessarily synthesize click while the first
    // is held on the joystick. Handle only this launcher gesture directly.
    this.listen(this.launcher, 'touchstart', event => {
      if (event.touches.length < 2) return;
      if (event.cancelable) event.preventDefault(); // Suppress a delayed compatibility click when possible.
      event.stopPropagation();
      this.show();
    }, { passive: false });
    this.listen(this.panel.querySelector('#sound-toggle-btn'), 'click', () => {
      this.soundEnabled = !this.soundEnabled;
      this.updateSoundButton();
      this.onSoundToggle?.(this.soundEnabled);
    });
    this.listen(this.panel.querySelector('#quality-toggle-btn'), 'click', () => {
      this.currentQuality = this.currentQuality === 'high' ? 'low' : 'high';
      this.updateQualityButton();
      this.onQualityChange?.(this.currentQuality);
    });
    for (const id of ['#settings-close-btn', '#resume-btn']) {
      this.listen(this.panel.querySelector(id), 'click', () => this.hide());
    }
    this.listen(this.overlay, 'click', event => {
      event.stopPropagation(); // A title/content click must never relock the body controller.
      if (event.target === this.overlay) this.hide();
    });
    // Stop game handlers on body, preserving native touch scrolling and link/button defaults.
    for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel']) {
      this.listen(this.overlay, type, event => event.stopPropagation(), { passive: true });
    }
    this.bindSecondaryTaps();
    this.listen(window, 'keydown', event => {
      if (!this.visible) return;
      // Captures before document movement and window map/teleport/Esc handlers.
      // Do not cancel native scroll, button activation or disclosure defaults.
      event.stopImmediatePropagation();
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault();
        if (!event.repeat) this.hide();
      } else if (event.key === 'Tab') {
        const elements = this.getFocusableElements();
        const first = elements[0], last = elements.at(-1);
        const active = document.activeElement;
        if (event.shiftKey && (active === first || !elements.includes(active))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (active === last || !elements.includes(active))) {
          event.preventDefault(); first?.focus();
        }
      }
    }, true);
    this.listen(window, 'keyup', event => {
      if (this.visible) event.stopImmediatePropagation();
    }, true);
    this.listen(document, 'focusin', event => {
      if (this.visible && !this.panel.contains(event.target)) this.panel.querySelector('#settings-title').focus();
    }, true);
  }

  bindSecondaryTaps() {
    // Native click is not guaranteed for a second finger while a first finger
    // remains held outside the modal. Only complete, stationary control taps
    // are activated here; touch start/move and cancelled drags stay native.
    this.listen(this.overlay, 'touchstart', event => {
      if (event.touches.length < 2) return;
      for (const touch of event.changedTouches) {
        const target = touch.target?.closest?.('button, summary, a[href]');
        if (target && this.panel.contains(target)) {
          this.secondaryTaps.set(touch.identifier, { target, x: touch.clientX, y: touch.clientY, time: performance.now() });
        }
      }
    }, { passive: true });
    this.listen(this.overlay, 'touchmove', event => {
      for (const touch of event.changedTouches) {
        const tap = this.secondaryTaps.get(touch.identifier);
        if (tap && Math.hypot(touch.clientX - tap.x, touch.clientY - tap.y) > 10) this.secondaryTaps.delete(touch.identifier);
      }
    }, { passive: true });
    this.listen(this.overlay, 'touchend', event => {
      for (const touch of event.changedTouches) {
        const tap = this.secondaryTaps.get(touch.identifier);
        this.secondaryTaps.delete(touch.identifier);
        if (!tap || !this.visible || !this.panel.contains(tap.target) ||
            Math.hypot(touch.clientX - tap.x, touch.clientY - tap.y) > 10 || performance.now() - tap.time > 600) continue;
        if (event.cancelable) event.preventDefault(); // Do not also synthesize a compatibility click when possible.
        tap.target.focus({ preventScroll: true });
        tap.target.click();
      }
    }, { passive: false });
    this.listen(this.overlay, 'touchcancel', () => this.secondaryTaps.clear(), { passive: true });
  }

  setMapMode(visible, mapContainer) {
    if (!this.launcher || (visible && !mapContainer)) return;
    // Keep the same entry and listeners. Normal flow reserves its own space;
    // the map's existing scroll container keeps the compact entry reachable.
    if (this.visible) {
      for (const element of [this.launcher, ...(visible ? [mapContainer] : [])]) {
        if (!this.inertBeforeOpen.has(element)) this.inertBeforeOpen.set(element, element.inert);
        element.inert = true;
      }
    }
    if (visible) mapContainer.prepend(this.launcher);
    else this.container.appendChild(this.launcher);
  }

  getFocusableElements() {
    return [...this.panel.querySelectorAll('button, summary, a[href], [tabindex="0"]')].filter(element => {
      const details = element.closest('details');
      return !element.disabled && !element.hidden && (!details || details.open || element.tagName === 'SUMMARY');
    });
  }

  updateSoundButton() {
    const button = this.panel.querySelector('#sound-toggle-btn');
    button.textContent = this.soundEnabled ? '🔊 音效已开启' : '🔇 音效已关闭';
    button.setAttribute('aria-pressed', String(this.soundEnabled));
  }

  updateQualityButton() {
    const button = this.panel.querySelector('#quality-toggle-btn');
    button.textContent = this.currentQuality === 'high' ? '高画质' : '低画质';
    button.setAttribute('aria-pressed', String(this.currentQuality === 'high'));
  }

  show() {
    if (!this.overlay || this.visible) return;
    this.secondaryTaps.clear();
    this.previousFocus = document.activeElement === document.body ? this.launcher : document.activeElement;
    this.visible = true;
    this.overlay.style.display = 'flex';
    this.launcher.setAttribute('aria-expanded', 'true');
    for (const child of this.container.children) {
      if (child === this.overlay) continue;
      this.inertBeforeOpen.set(child, child.inert);
      child.inert = true;
    }
    document.body.classList.add('settings-open');
    this.panel.querySelector('#settings-content').scrollTop = 0;
    this.updateSoundButton();
    this.updateQualityButton();
    this.onOpen?.();
    this.panel.querySelector('#settings-title').focus({ preventScroll: true });
  }

  restoreBackground() {
    for (const [element, inert] of this.inertBeforeOpen) element.inert = inert;
    this.inertBeforeOpen.clear();
    document.body.classList.remove('settings-open');
  }

  hide() {
    if (!this.overlay || !this.visible) return;
    this.visible = false;
    this.secondaryTaps.clear();
    this.overlay.style.display = 'none';
    this.launcher.setAttribute('aria-expanded', 'false');
    this.restoreBackground();
    const target = this.previousFocus?.isConnected ? this.previousFocus : this.launcher;
    target?.focus({ preventScroll: true });
    this.previousFocus = null;
    this.onResume?.();
  }

  toggle() { if (this.visible) this.hide(); else this.show(); }

  dispose() {
    this.visible = false;
    this.secondaryTaps.clear();
    this.restoreBackground();
    this.listeners.splice(0).forEach(remove => remove());
    this.overlay?.remove();
    this.launcher?.remove();
    this.overlay = null;
    this.panel = null;
    this.launcher = null;
    this.previousFocus = null;
    this.onOpen = this.onResume = this.onQualityChange = this.onSoundToggle = null;
  }
}
