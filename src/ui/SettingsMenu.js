import { ReleaseIdentityPanel } from './ReleaseIdentityPanel.js';

/** Settings and dated research limits. Version checks run only on explicit click. */
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
    this.characterPreviewActive = false;
    this.allowCharacterPreview = false;
    this.characterStatusKey = null;
  }

  init({ onDuanmenToggle, getCharacterStatus, onOpen, onResume, onQualityChange, onSoundToggle, onCharactersToggle, initialCharacters = true, charactersAvailable = true, charactersApproved = false, allowCharacterPreview = false, characterPreviewActive = false, onCharacterPreviewToggle, initialQuality = 'high', initialSound = true } = {}) {
    this.onDuanmenToggle = onDuanmenToggle;
    this.onOpen = onOpen;
    this.onResume = onResume;
    this.onQualityChange = onQualityChange;
    this.onSoundToggle = onSoundToggle;
    this.onCharactersToggle = onCharactersToggle;
    this.charactersEnabled = initialCharacters;
    this.charactersAvailable = charactersAvailable === true;
    // Retained for caller compatibility only. Availability is not acceptance,
    // and neither value grants historical, GPU or mobile acceptance.
    this.charactersApproved = charactersApproved;
    this.characterStatusKey = null;
    // The initial-state hint is deliberately not restored. Each page requires
    // an explicit preview click; an injected option cannot bypass the DEV gate.
    this.characterPreviewActive = false;
    this.allowCharacterPreview = import.meta.env?.DEV === true && allowCharacterPreview === true && !this.charactersAvailable;
    this.onCharacterPreviewToggle = import.meta.env?.DEV === true && this.allowCharacterPreview ? onCharacterPreviewToggle : null;
    this.currentQuality = initialQuality;
    this.soundEnabled = initialSound;

    this.launcher = document.createElement('button');
    this.launcher.id = 'structural-preview-button';
    this.launcher.setAttribute('type', 'button');
    this.launcher.setAttribute('aria-haspopup', 'dialog');
    this.launcher.setAttribute('aria-controls', 'settings-panel');
    this.launcher.setAttribute('aria-expanded', 'false');
    // 常驻入口使用中性功能名；作者署名放在面板「资料来源与限制」内，
    // 精度与开放路线声明放在 #preview-limit，避免常驻按钮承载过多负面限定语。
    this.launcher.setAttribute('aria-label', '打开设置与来源说明');
    this.launcher.innerHTML = '<strong>游览设置</strong><span>画质 · 音效 · 时刻 · 资料来源</span>';
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
          <button id="quality-toggle-btn" type="button" aria-describedby="building-quality-note">高画质</button>
        </div>
        <p id="building-quality-note" class="settings-notice">织物贴图立即切换；建筑细节在分区重新加载后应用。低档保留主要形制与通路。</p>
        <div class="settings-control">
          <label for="characters-toggle-btn">宫廷人物</label>
          <button id="characters-toggle-btn" type="button" aria-describedby="characters-status characters-acceptance">宫廷人物已开启（候选）</button>
        </div>
        <div class="settings-control">
          <label for="duanmen-backdrop-toggle">端门南向远景</label>
          <input id="duanmen-backdrop-toggle" type="checkbox" checked aria-describedby="duanmen-backdrop-note">
        </div>
        <p id="duanmen-backdrop-note" class="settings-notice">边界外远景，尚不可进入。从午门向南看；位置、尺度和树列为合理拟合，非测绘。屋顶形制与轴线参考故宫资料；未复原室内、匾额和门洞。</p>
        <p id="characters-status" class="settings-notice" role="status" aria-live="polite">${!this.charactersEnabled ? '人物已关闭。' : this.charactersAvailable ? '人物准备中：等待加载状态。' : '人物内容暂不可用。'}</p>
        <p id="characters-acceptance" class="settings-notice">人物外观已确认；GPU／手机性能、具体史料仍未完整验收。</p>
        <p id="characters-interpretation" class="settings-notice">建筑按现状呈现；宫廷人物与活动为清代主题演绎，人数经过缩编。太和殿为乾隆朝元旦大朝候礼主题示意，元旦指农历正月初一；正式跪拜、使臣与城墙巡行尚未启用。</p>
        ${import.meta.env?.DEV === true && this.allowCharacterPreview ? `
        <div class="settings-control">
          <label for="characters-preview-toggle-btn">人物实验预览（仅开发环境）</label>
          <button id="characters-preview-toggle-btn" type="button" aria-pressed="false" aria-describedby="characters-preview-limit">人物实验预览：已关闭</button>
        </div>
        <p id="characters-preview-status" class="settings-notice" role="status" aria-live="polite">人物实验预览已关闭（preview 未验收）。</p>
        <p id="characters-preview-limit" class="settings-notice">preview 未验收：尚未完成实机性能、完整场景及具体史料验收，不代表正式人物功能获准。本次页面有效，刷新恢复关闭；普通人物关闭时也结束预览。</p>
        ` : ''}
        <p class="settings-help">按 M 显示/隐藏小地图。地图打开时仍可用方向键、WASD 或屏幕方向盘移动；拖动地图不会改变行走方向。点击建筑名称查看介绍，再点“前往”传送；传送后，请松开再重新按键或触摸方向盘。设置菜单会暂停移动。数字键 1–8：午门、太和殿、乾清宫、御花园、东六宫、西六宫、宁寿宫、神武门。</p>
        <details id="preview-details">
          <summary>资料来源与限制（各项核查日期见下）</summary>
          <p id="author-credit" class="settings-notice">作者：陈华山、陈诺</p>
          <h3>有资料支持的结构</h3>
          <p>弘义阁、体仁阁的柱网与竖向层次依据杨新成《故宫弘义阁、体仁阁研究》（2006 年）。三大殿共用台基的东西腰部台阶位置关系，参考 1960 年平面图和 2020 年刊载的照片。</p>
          <ul>
            <li><a href="https://www.dpm.org.cn/Uploads/File/2019/11/14/u5dcd2fd72ceee.pdf" target="_blank" rel="noopener noreferrer">两阁测绘研究（2006，官方 PDF，新窗口）</a></li>
            <li><a href="https://www.dpm.org.cn/building/talk/223358.html" target="_blank" rel="noopener noreferrer">《故宫三大殿》（1960，官方资料，新窗口）</a></li>
            <li><a href="https://img.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf" target="_blank" rel="noopener noreferrer">三台照片与历史比较（2020，官方 PDF，新窗口）</a></li>
          </ul>
          <h3>仍属暂定的尺寸与细节</h3>
          <p>部分屋面、构件细节及台基接口仍为近似。新增侧阶的模型中心 z=58 m、外宽 5 m，以及沿用的台基层高、轮廓和踏步细节均为工程暂定值，不是现场实测。本轮保留既有全局定位，未完成全宫 2026 年现状核验。</p>
          <h3>午门与神武门城楼（资料核对：2026-10-15）</h3>
          <p>午门南、北面均有中部门洞的资料依据；南侧通路应辨别柱内前后檐廊和柱外窄带。模型保留原外柱网、屋顶和城台，将内围护后退以呈现前后檐廊。采用的 2.9 m 是从同一 2005 年报告的设计图与剖面图，按已公布柱网进深配准估读的柱轴至围护轴距离，建模范围约 2.6–3.2 m，不是现场实测净宽；门洞宽度、门扇细节和部分内柱仍为暂定。</p>
          <p id="wumen-main-grid-note">午门正楼现以六条纵深柱轴表达五进深：内柱距中轴约 3.2 m 为图纸配准值，并非实测；横向九间仍沿用模型等分。南北围护按九间分别表达，逐扇数量、门窗类型细分和现实开闭尚未核定。模型只保留中门开放预览，未完成隐藏山墙柱及完整木构架；室内固定装修仍未知，现有地面、顶棚与柱身为简化预览，不复制临时展陈，也不表示现实参观许可。</p>
          <p>神武门四周有廊，南北面明间及左右次间设菱花隔扇门，东西面设双扇板门。模型柱网参考 2005 年保护工程测绘的发表数据，区分城楼柱网、殿基轮廓和外围城台。文献的 50.18 × 26.46 m 城台尺寸尚未明确量至台顶、台脚还是垛墙；本轮暂按台顶范围使用，不能据此声称还原了真实通道净宽。</p>
          <p>神武门原有全局位置保留，已知定位核对仍有 11 m 差异。城楼仍采用简化的同高地面，殿基与城台顶面的高差、四面台阶竖向尺寸及屋顶标高未完成实测校准。模型门扇的开启和可通行状态用于体验，不表示今日现场开放许可。</p>
          <ul>
            <li><a href="https://www.dpm.org.cn/explore/building/236454.html" target="_blank" rel="noopener noreferrer">故宫博物院：午门建筑介绍，新窗口</a></li>
            <li><a href="https://img.dpm.org.cn/Uploads/pdf/4884/T00124_00.pdf" target="_blank" rel="noopener noreferrer">午门修缮研究：顶面及平面设计图（2005，官方 PDF），新窗口</a></li>
            <li><a href="https://img.dpm.org.cn/Uploads/pdf/4884/T00114_00.pdf" target="_blank" rel="noopener noreferrer">午门修缮研究：剖面图（2005，官方 PDF），新窗口</a></li>
            <li><a href="https://www.dpm.org.cn/explore/building/236456.html" target="_blank" rel="noopener noreferrer">故宫博物院：神武门建筑介绍，新窗口</a></li>
            <li><a href="https://img.dpm.org.cn/Uploads/File/2018/06/05/u5b164a2ba5129.pdf" target="_blank" rel="noopener noreferrer">神武门大木尺度研究（2013，含 2005 工程测绘，官方 PDF），新窗口</a></li>
            <li><a href="https://img.dpm.org.cn/Uploads/File/2020/02/16/u5e490f5ea72b3.pdf" target="_blank" rel="noopener noreferrer">紫禁城城墙现状调查与保护初探（2013，官方 PDF），新窗口</a></li>
          </ul>
          <h3>钦安殿虚拟进入与地面观览</h3>
          <p>钦安殿保留地面观览落点，可沿东西侧台阶进入抱厦与主殿，再从同侧原路返回；不提供穿殿北出捷径。侧门开启为游戏体验诠释，门洞、门扇尺寸为模型拟合，不代表现场开放。主殿五间柱网与分层标高参考测绘研究；屋面皮层、抱厦高度、台基和栏杆厚度仍为近似。北墙连续的图纸证据不等于今天的门禁状态。</p>
          <p>南侧轴线复合石构因层次证据未明而暂未建模；天一门、围院、完整室内木构及重建后抱厦细节也未完成核验。此模型不代表现场开放，也不是当日游客路线。</p>
          <p>日光为用于辨识建筑体量的示意晴天方向，并非当前天气或实景照片匹配。</p>
          <ul>
            <li><a href="https://www.dpm.org.cn/Uploads/File/2018/06/04/u5b1521c1583e4.pdf" target="_blank" rel="noopener noreferrer">钦安殿大木结构尺度研究（2015，2004 测量及 2013 补测，官方 PDF，新窗口）</a></li>
            <li><a href="https://www.dpm.org.cn/Uploads/File/2019/12/09/u5dedc722f21af.pdf" target="_blank" rel="noopener noreferrer">钦安殿历史图像与建筑研究（2015，含 1943 图纸，官方 PDF，新窗口）</a></li>
          </ul>
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
    this.releaseIdentity = new ReleaseIdentityPanel({ container:this.panel.querySelector('#settings-content'), getCharacterStatus });
    this.bindEvents();
    this.updateSoundButton();
    this.updateQualityButton();
    this.updateCharactersButton();
  }

  listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  bindEvents() {
    const duanmenToggle = this.panel.querySelector('#duanmen-backdrop-toggle');
    if (duanmenToggle) this.listen(duanmenToggle, 'change', () => this.onDuanmenToggle?.(duanmenToggle.checked));
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
    this.listen(this.panel.querySelector('#characters-toggle-btn'), 'click', () => {
      this.charactersEnabled = !this.charactersEnabled;
      this.updateCharactersButton();
      this.onCharactersToggle?.(this.charactersEnabled);
    });
    if (import.meta.env?.DEV === true && this.allowCharacterPreview) {
      this.listen(this.panel.querySelector('#characters-preview-toggle-btn'), 'click', () => {
        if (this.charactersAvailable) return;
        try {
          const active = this.onCharacterPreviewToggle?.(!this.characterPreviewActive);
          if (typeof active === 'boolean') {
            this.setCharacterPreviewActive(active);
            return;
          }
        } catch {
          // A rejected/failed transition must never advertise success.
        }
        this.panel.querySelector('#characters-preview-status').textContent = '人物 preview 未验收：操作未确认，保留原状态。';
      });
    }
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

  updateCharactersButton() {
    const button = this.panel.querySelector('#characters-toggle-btn');
    let text = this.charactersEnabled ? (this.charactersAvailable ? '宫廷人物已开启（候选）' : '宫廷人物暂不可用') : '宫廷人物已关闭';
    if (import.meta.env?.DEV === true && this.characterPreviewActive && this.charactersEnabled) text = '宫廷人物 preview 未验收';
    if (button.textContent !== text) button.textContent = text;
    const pressed = String(this.charactersEnabled);
    if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
  }

  setCharacterStatus(snapshot = {}) {
    if (!this.panel || !snapshot) return;
    // Only consume primitive display values. Do not mutate the snapshot, call
    // the System, or treat available content as a fully accepted release.
    const enabled = typeof snapshot.enabled === 'boolean' ? snapshot.enabled : this.charactersEnabled;
    const available = typeof snapshot.contentEnabled === 'boolean' ? snapshot.contentEnabled : this.charactersAvailable;
    const count = key => Number.isFinite(snapshot[key]) ? Math.max(0, Math.floor(snapshot[key])) : 0;
    const registered = count('registered'), loaded = count('loaded'), visible = count('visible');
    const pending = count('pending'), errors = count('errors');
    const streaming=Number.isFinite(snapshot.resident),resident=count('resident'),residentModels=count('residentModels'),modelPending=count('modelPending');
    const night = Number.isFinite(snapshot.daylight) && snapshot.daylight <= 0.12;
    const systemError = !!snapshot.lastError;
    const preview = import.meta.env?.DEV === true && this.allowCharacterPreview && !available && snapshot.rollout === 'preview-unverified';
    const key = [enabled, available, registered, loaded, visible, pending, errors, night, systemError, preview,streaming,resident,residentModels,modelPending].join('|');
    if (key === this.characterStatusKey && enabled === this.charactersEnabled && available === this.charactersAvailable) return;
    if (import.meta.env?.DEV === true && this.allowCharacterPreview && available !== this.charactersAvailable) {
      if (available) this.setCharacterPreviewActive(false);
      const previewButton = this.panel.querySelector('#characters-preview-toggle-btn');
      previewButton.hidden = available;
      previewButton.parentNode.hidden = available;
      this.panel.querySelector('#characters-preview-status').hidden = available;
      this.panel.querySelector('#characters-preview-limit').hidden = available;
    }
    this.characterStatusKey = key;
    this.charactersEnabled = enabled;
    this.charactersAvailable = available;
    this.updateCharactersButton();
    let heading = '人物准备中';
    if (systemError) heading = `人物运行失败${!enabled ? '（人物已关闭）' : ''}`;
    else if (!enabled) heading = '人物已关闭';
    else if (!available && !preview) heading = '人物内容暂不可用';
    else if (errors > 0) heading = '人物加载失败';
    else if (streaming && modelPending > 0) heading = '附近人物模型准备中';
    else if (registered > 0 && loaded === registered && pending === 0) heading = '人物数据就绪（候选）';
    if (import.meta.env?.DEV === true && preview) heading = `人物实验预览（未验收） · ${heading}`;
    const text = `${heading}：已注册 ${registered} · ${streaming?`逻辑定位 ${loaded} · 附近模型就绪 ${residentModels}/${resident}`:`已加载 ${loaded}`} · 当前可见 ${visible} · ${streaming?`定位准备 ${pending} · 模型任务 ${modelPending}`:`准备中 ${pending}`} · 失败 ${errors}。${night && enabled && (available || preview) ? ' 夜间仍展示人物；全天游览演绎，不代表历史作息。' : ''}`;
    const status = this.panel.querySelector('#characters-status');
    if (status.textContent !== text) status.textContent = text;
  }

  setCharacterPreviewActive(active) {
    // Keep this public synchronization hook inert in the production bundle.
    if (import.meta.env?.DEV === true && this.allowCharacterPreview && !this.charactersAvailable && this.panel) {
      // Main may synchronize after every existing frame. Preserve local error
      // feedback and avoid any DOM writes until the actual state changes.
      if (this.characterPreviewActive === (active === true)) return this.characterPreviewActive;
      this.characterPreviewActive = active === true;
      const button = this.panel.querySelector('#characters-preview-toggle-btn');
      button.textContent = this.characterPreviewActive ? '人物实验预览：已开启（preview 未验收）' : '人物实验预览：已关闭';
      button.setAttribute('aria-pressed', String(this.characterPreviewActive));
      this.panel.querySelector('#characters-preview-status').textContent = this.characterPreviewActive ? '人物 preview 未验收：已开启实验预览。' : '人物实验预览已关闭（preview 未验收）。';
      // Compact map CSS hides the subtitle, so the title must stay meaningful
      // on its own. 实验功能开启时才把未验收状态提到标题，平时的常驻入口保持中性功能名。
      this.launcher.querySelector('strong').textContent = this.characterPreviewActive ? '人物 preview 未验收' : '游览设置';
      this.launcher.querySelector('span').textContent = this.characterPreviewActive
        ? '人物 preview 未验收：尚未完成实机性能、完整场景及具体史料验收。本次页面有效，刷新恢复关闭。游戏路线不代表现场开放。'
        : '画质 · 音效 · 时刻 · 资料来源';
      this.updateCharactersButton();
    }
    return this.characterPreviewActive;
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
    this.releaseIdentity?.dispose();
    this.releaseIdentity = null;
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
    this.onOpen = this.onResume = this.onQualityChange = this.onSoundToggle = this.onCharactersToggle = null;
    this.onCharacterPreviewToggle = null;
    this.characterPreviewActive = false;
    this.allowCharacterPreview = false;
    this.characterStatusKey = null;
  }
}
