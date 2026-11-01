import { attachTourTool, detachTourTool } from './TourTools.js';
import { getBeijingTime } from '../scene/sky/BeijingDayCycle.js';

/** Explicit clock preview. Editing is a draft; Apply/Enter changes civil time. */
export class DayNightPanel {
  constructor(environment, historicalLamps = null) {
    this.environment = environment;
    this.historicalLamps = historicalLamps;
    this.lastText = '';
    this.dirty = false;
    this.root = document.createElement('details');
    this.root.id = 'day-night-panel';
    this.root.innerHTML = `<summary><span id="beijing-clock">北京时间</span></summary>
      <div class="time-entry"><label>时 <input id="beijing-hour" type="number" inputmode="numeric" min="0" max="23" step="1" aria-label="北京时间小时" aria-describedby="beijing-time-error"></label>
      <label>分 <input id="beijing-minute" type="number" inputmode="numeric" min="0" max="59" step="1" aria-label="北京时间分钟" aria-describedby="beijing-time-error"></label>
      <button type="button" id="beijing-apply">应用时刻</button></div>
      <span id="beijing-time-error" role="status" aria-live="polite"></span>
      <label>时刻预览 <input id="beijing-time-preview" type="range" min="0" max="1439" step="1" value="720"></label>
      <span id="beijing-preview-label"></span><button type="button" id="beijing-live">恢复北京时间</button>
      <button type="button" id="beijing-close">收起时刻</button>
      <label class="festival-option"><input id="historical-sky-lamps" type="checkbox">清宫节庆天灯演示</label>
      <span id="festival-note">乾清宫丹陛下两座，参考故宫2019年复原。历史节庆设施；位置、形体与亮度为示意，并非常设夜景。</span>
      <p>输入后点“应用时刻”或按 Enter；21:00 起进入夜间作息。Esc 收起，点击画面继续游览。太阳方位随北京日期与时刻估算，晴天色彩与夜间环境光为导览示意，不代表当日天气或现场开放。</p>`;
    this.style = document.createElement('style');
    this.style.textContent = `#day-night-panel{position:relative;max-width:300px;flex-shrink:0;color:#fff2ce;background:#17242be8;border:1px solid #b1a67d77;border-radius:10px;padding:7px 10px;font:12px/1.5 system-ui}#day-night-panel summary{cursor:pointer;min-height:28px;display:flex;align-items:center}#day-night-panel input[type=range]{width:170px;min-height:40px;vertical-align:middle}#day-night-panel .time-entry{display:flex;align-items:center;gap:5px;flex-wrap:wrap}#day-night-panel input[type=number]{width:52px;min-height:36px;font:16px system-ui;color:#fff;background:#263943;border:1px solid #aab7b6;border-radius:4px}#beijing-time-error{display:block;color:#ffd2bd}#day-night-panel .festival-option{display:flex;align-items:center;gap:5px}#day-night-panel input[type=checkbox]{width:20px;height:20px}#festival-note{display:block;font-size:11px;color:#d0d8df;max-width:275px}#day-night-panel button{color:white;background:#354750;border:1px solid #aab7b6;border-radius:5px;min-height:36px;margin:4px}#day-night-panel p{max-width:275px;margin:5px 0}#day-night-panel[open]{box-shadow:0 8px 20px #0008}@media(max-height:600px){#tour-tools{top:40px!important;right:8px!important;max-height:calc(100dvh - 130px)!important}#day-night-panel{padding:4px 8px;max-width:275px}}`;
    document.head.appendChild(this.style);
    attachTourTool(this.root);
    const find = id => this.root.querySelector('#' + id);
    this.clock = find('beijing-clock'); this.range = find('beijing-time-preview');
    this.hour = find('beijing-hour'); this.minute = find('beijing-minute');
    this.apply = find('beijing-apply'); this.error = find('beijing-time-error');
    this.label = find('beijing-preview-label'); this.live = find('beijing-live');
    this.closeButton = find('beijing-close'); this.lampCheck = find('historical-sky-lamps'); this.lampNote = find('festival-note');
    this.listeners = [];
    this.listen(this.hour, 'input', () => { this.dirty = true; });
    this.listen(this.minute, 'input', () => { this.dirty = true; });
    this.listen(this.apply, 'click', () => this.applyFields());
    this.listen(this.range, 'change', () => this.applyMinutes(Number(this.range.value)));
    this.listen(this.live, 'click', () => { this.environment.setTimePreview(null); this.dirty = false; this.error.textContent = ''; this.update(true); });
    this.listen(this.closeButton, 'click', () => this.close());
    this.listen(this.root, 'keydown', event => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        event.preventDefault(); event.stopPropagation(); this.close();
      } else if ((event.key === 'Enter' || event.code === 'Enter') && [this.hour, this.minute].includes(event.target)) {
        event.preventDefault(); event.stopPropagation(); if (!event.repeat) this.applyFields();
      }
    });
    this.listen(this.root, 'toggle', () => {
      // Native disclosure closure can otherwise retain focus in a now-hidden field.
      if (!this.root.open && this.root.contains(document.activeElement)) this.root.querySelector('summary').focus();
    });
    this.lampCheck.disabled = !historicalLamps;
    this.listen(this.lampCheck, 'change', () => {
      const result = historicalLamps?.setEnabled(this.lampCheck.checked);
      if (!result?.ok) { this.lampCheck.checked = !!historicalLamps?.enabled; this.lampNote.textContent = result?.reason ?? '灯具演示不可用'; }
      else this.lampNote.textContent = '乾清宫丹陛下两座，参考故宫2019年复原。历史节庆设施；位置、形体与亮度为示意，并非常设夜景。';
    });
    this.update(true);
  }
  listen(target, type, handler) {
    target.addEventListener(type, handler);
    this.listeners.push(() => target.removeEventListener(type, handler));
  }
  applyFields() {
    const h = String(this.hour.value).trim(), m = String(this.minute.value).trim();
    if (!/^\d{1,2}$/.test(h) || !/^\d{1,2}$/.test(m) || Number(h) > 23 || Number(m) > 59) {
      this.error.textContent = '请输入整数：小时 00–23，分钟 00–59。';
      return false;
    }
    return this.applyMinutes(Number(h) * 60 + Number(m));
  }
  applyMinutes(minutes) {
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1439) return false;
    const local = getBeijingTime(new Date());
    const date = new Date(`${local.dateLabel}T00:00:00+08:00`);
    date.setTime(date.getTime() + minutes * 60000);
    this.environment.setTimePreview(date);
    this.dirty = false; this.error.textContent = ''; this.update(true);
    return true;
  }
  close() { this.root.open = false; this.root.querySelector('summary').focus(); }
  update(force = false) {
    const s = this.environment.dayCycle;
    if (!s) return;
    const label = {night:'夜间', day:'白昼', sunrise:'晨光', sunset:'暮色'}[s.phase];
    const text = `${this.environment.previewDate ? '时刻预览' : '北京时间'} ${s.beijingTime.timeLabel.slice(0,5)} · ${label}${this.historicalLamps?.enabled ? ' · 节庆天灯示意' : ''}`;
    if (text !== this.lastText) { this.clock.textContent = text; this.lastText = text; }
    this.label.textContent = this.environment.previewDate ? s.beijingTime.dateLabel : '';
    this.lampCheck.checked = !!this.historicalLamps?.enabled;
    const minutes = Math.floor(s.beijingTime.minutesOfDay);
    if (force || (!this.dirty && ![this.hour, this.minute].includes(document.activeElement))) {
      this.hour.value = String(Math.floor(minutes / 60)).padStart(2, '0');
      this.minute.value = String(minutes % 60).padStart(2, '0');
    }
    if (force || document.activeElement !== this.range) this.range.value = String(minutes);
  }
  dispose() { this.listeners.forEach(remove => remove()); detachTourTool(this.root); this.style.remove(); }
}
