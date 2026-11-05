import {captureFailureDiagnostic} from './TourFailureDiagnostic.js';

/** A terminal tour failure has one explicit recovery action, never an automatic retry. */
export class TourFailureNotice {
  static captureDiagnostic(error, context) { return captureFailureDiagnostic(error, context); }
  constructor(parent = document.body, {reload = () => window.location.reload(), writeText = text => globalThis.navigator.clipboard.writeText(text)} = {}) {
    this.parent = parent; this.reload = reload; this.writeText = writeText; this.disposed = false;
    this.background = new Map(); this.reloadRequested = false;
  }
  show(reason = 'frame', diagnostic = null) {
    if (this.disposed) return;
    if (this.overlay) { this.focusRecovery(); return; }
    this.previousFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.id = 'tour-failure-dialog'; overlay.tabIndex = -1;
    overlay.setAttribute('role', 'alertdialog'); overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'tour-failure-title');
    overlay.setAttribute('aria-describedby', 'tour-failure-description');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:#160f0ee8;color:#fff;overflow:auto';
    overlay.innerHTML = `<section style="max-width:520px;max-height:calc(100vh - 48px);overflow:auto;padding:24px;border:2px solid #ffd764;border-radius:12px;background:#251c16;line-height:1.6">
      <h2 id="tour-failure-title">游览已暂停</h2>
      <p id="tour-failure-description">运行中出现异常，画面已停止更新。请重新加载游览；重新加载后会回到起点。</p>
      <button id="tour-reload-btn" type="button" style="min-height:44px;padding:12px 20px;font:inherit;font-weight:bold;background:#ffd764;color:#251c16;border:2px solid #fff;border-radius:6px;cursor:pointer">重新加载游览</button>
    </section>`;
    if (reason === 'graphics') overlay.querySelector('#tour-failure-description').textContent = '图形显示已中断，游览已暂停。请重新加载游览；重新加载后会回到起点。';
    this.overlay = overlay; this.button = overlay.querySelector('#tour-reload-btn');
    if (diagnostic) {
      const section = document.createElement('div');
      section.innerHTML = `<p>本次首错诊断仅保留在本页，不会自动发送。可复制给开发者协助定位。</p>
        <textarea id="tour-failure-diagnostic" readonly tabindex="0" rows="8" aria-label="本次首错诊断，可手动复制" style="width:100%;box-sizing:border-box;font-size:14px"></textarea>
        <button id="tour-copy-diagnostic" type="button" style="min-height:44px;padding:10px;font:inherit">复制诊断</button>
        <p id="tour-copy-status" role="status" aria-live="polite"></p>`;
      this.diagnosticField = section.querySelector('#tour-failure-diagnostic');
      this.diagnosticField.value = JSON.stringify(diagnostic, null, 2);
      this.copyButton = section.querySelector('#tour-copy-diagnostic');
      this.copyStatus = section.querySelector('#tour-copy-status');
      overlay.querySelector('section').appendChild(section);
      this.onCopy = async () => {
        if (this.disposed || this.copyPending) return;
        this.copyPending = true; this.copyButton.disabled = true;
        try {
          await this.writeText(this.diagnosticField.value);
          if (!this.disposed) this.copyStatus.textContent = '已复制诊断。没有自动发送任何信息。';
        } catch {
          if (!this.disposed) { this.copyStatus.textContent = '未能复制，请在上方文本框手动复制。'; this.diagnosticField.focus(); this.diagnosticField.select?.(); }
        } finally { this.copyPending = false; if (!this.disposed) this.copyButton.disabled = false; }
      };
      this.copyButton.addEventListener('click', this.onCopy);
    }
    for (const child of this.parent.children) { this.background.set(child, child.inert); child.inert = true; }
    this.parent.appendChild(overlay);
    this.onReload = () => {
      if (this.disposed || this.reloadRequested) return;
      this.reloadRequested = true; this.button.disabled = true;
      try { this.reload(); }
      catch {
        this.reloadRequested = false; this.button.disabled = false;
        overlay.querySelector('#tour-failure-description').textContent = '未能重新加载，请使用浏览器的刷新按钮。刷新后会回到起点。';
        this.focusRecovery();
      }
    };
    this.onKey = event => {
      if (event.key === 'Tab' || event.key === 'Escape') event.preventDefault();
      if (event.key === 'Tab' && event.type === 'keydown') {
        const controls = [this.button, this.copyButton, this.diagnosticField].filter(item => item && !item.disabled);
        const index = controls.indexOf(document.activeElement);
        if (controls.length) controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
        else this.focusRecovery();
      }
      event.stopImmediatePropagation();
    };
    this.onFocus = event => { if (!overlay.contains(event.target)) this.focusRecovery(); };
    this.stopPointer = event => event.stopPropagation();
    this.button.addEventListener('click', this.onReload);
    document.addEventListener('keydown', this.onKey, true);
    document.addEventListener('keyup', this.onKey, true);
    document.addEventListener('focusin', this.onFocus, true);
    for (const type of ['pointerdown','pointerup','click','touchstart','touchmove','touchend']) overlay.addEventListener(type, this.stopPointer);
    this.focusRecovery();
  }
  focusRecovery() { (this.button?.disabled ? this.overlay : this.button)?.focus(); }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (!this.overlay) return;
    document.removeEventListener('keydown', this.onKey, true);
    document.removeEventListener('keyup', this.onKey, true);
    document.removeEventListener('focusin', this.onFocus, true);
    this.button.removeEventListener('click', this.onReload);
    this.copyButton?.removeEventListener('click', this.onCopy);
    for (const type of ['pointerdown','pointerup','click','touchstart','touchmove','touchend']) this.overlay.removeEventListener(type, this.stopPointer);
    this.overlay.remove();
    for (const [child, inert] of this.background) child.inert = inert;
    this.background.clear();
    if (this.previousFocus?.isConnected) this.previousFocus.focus();
    this.overlay = this.button = null;
  }
}
