// Build-time constant shared with loading HTML and dist/build-info.json.
// The fallback is for direct Node tests, not a second production version source.
export const BUILD_INFO = typeof __HAS_BUILD_INFO__ !== 'undefined' && __HAS_BUILD_INFO__ ? Object.freeze(__BUILD_INFO__) : Object.freeze({
  schema:1, release:'DEV', buildId:'DEV-unbuilt', sourceFingerprint:'unbuilt', sourceCommit:null, sourceDirty:true, base:'/',
});
const count = value => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
const validBuildId = value => typeof value === 'string' && /^R\d+[A-Za-z0-9.-]*-[a-f0-9]{12}$/.test(value) && value.length <= 80;
const label = info => `${info.release} · 构建 ${info.buildId.split('-').at(-1)}`;

export class ReleaseIdentityPanel {
  constructor({ container, document = globalThis.document, info = BUILD_INFO, getCharacterStatus = () => ({}),
    fetcher = (...args) => globalThis.fetch(...args), location = globalThis.location,
    writeText = text => globalThis.navigator.clipboard.writeText(text) } = {}) {
    Object.assign(this, { document, info, getCharacterStatus, fetcher, location, writeText });
    this.disposed = false; this.checking = false; this.copying = false; this.different = false; this.listeners = [];
    this.element = document.createElement('section');
    this.element.id = 'release-identity';
    this.element.setAttribute('aria-label', '版本与诊断');
    this.element.innerHTML = `
      <p id="release-current" class="settings-notice"></p>
      <details id="release-details"><summary>版本诊断与检查</summary>
      <div class="settings-control"><button id="release-copy-btn" type="button">复制版本与人物诊断</button><button id="release-check-btn" type="button">检查服务器版本</button></div>
      <p id="release-status" class="settings-notice" role="status" aria-live="polite">仅点击时检查版本，不会自动刷新或清理缓存。</p>
      <button id="release-refresh-btn" type="button">刷新加载服务器版本（位置会重置）</button>
      <textarea id="release-diagnostic-text" readonly tabindex="0" aria-label="版本与人物诊断，可手动复制" rows="8" style="width:100%;box-sizing:border-box"></textarea>
      </details>
    `;
    container.prepend(this.element);
    const htmlId = document.querySelector?.('meta[name="palace-build-id"]')?.getAttribute('content');
    const buildId = validBuildId(htmlId) ? htmlId : null;
    this.html = { buildId, identityMatch:buildId === null ? 'unavailable' : buildId === info.buildId ? 'match' : 'mismatch' };
    this.find('release-current').textContent = label(info) + (this.html.identityMatch === 'mismatch' ? ' · 页面与程序标识不一致' : '');
    this.find('release-refresh-btn').hidden = true;
    this.find('release-diagnostic-text').hidden = true;
    this.listen('release-copy-btn', () => this.copy());
    this.listen('release-check-btn', () => this.check());
    this.listen('release-refresh-btn', () => { if (!this.disposed && this.different && !this.checking) this.location.reload(); });
  }
  find(id) { return this.element.querySelector(`#${id}`); }
  listen(id, callback) {
    const element = this.find(id); element.addEventListener('click', callback);
    this.listeners.push(() => element.removeEventListener('click', callback));
  }
  diagnostic() {
    const s = this.getCharacterStatus() ?? {}, i = this.info;
    // Intentionally omit URLs, query/hash, errors/stacks, world position and arbitrary snapshot fields.
    return JSON.stringify({ build:{ release:i.release, buildId:i.buildId, sourceFingerprint:i.sourceFingerprint,
      sourceCommit:i.sourceCommit, sourceDirty:i.sourceDirty, base:i.base },
      html:{...this.html},
      characters:{registered:count(s.registered),ready:count(s.loaded),visible:count(s.visible),pending:count(s.pending),errors:count(s.errors),...(Number.isFinite(s.resident)?{resident:count(s.resident),residentModels:count(s.residentModels),modelPending:count(s.modelPending)}:{})} }, null, 2);
  }
  async copy() {
    if (this.disposed || this.copying) return;
    this.copying = true; this.find('release-copy-btn').disabled = true;
    let text;
    try {
      text = this.diagnostic(); await this.writeText(text);
      if (!this.disposed) { this.find('release-status').textContent = '已复制当前版本与人物计数。'; this.find('release-diagnostic-text').hidden = true; }
    } catch {
      if (!this.disposed) {
        this.find('release-status').textContent = text ? '未能复制，请从下方文本框手动复制。' : '未能读取人物诊断，请稍后重试。';
        if (text) { const field = this.find('release-diagnostic-text'); field.value = text; field.hidden = false; }
      }
    } finally { this.copying = false; if (!this.disposed) this.find('release-copy-btn').disabled = false; }
  }
  async check() {
    if (this.disposed || this.checking) return;
    this.checking = true; this.different = false;
    this.find('release-check-btn').disabled = true; this.find('release-refresh-btn').hidden = true;
    this.find('release-status').textContent = '正在检查同一站点的服务器版本…';
    this.abort = new AbortController();
    const timeout = setTimeout(() => this.abort?.abort(), 8000);
    try {
      const url = new URL(`${this.info.base}build-info.json`, this.location.origin);
      if (url.origin !== this.location.origin || url.search || url.hash) throw Error('Invalid build base.');
      const response = await this.fetcher(url.href, {cache:'no-store', credentials:'omit', redirect:'error', referrerPolicy:'no-referrer', signal:this.abort.signal});
      if (!response.ok) throw Error('Version check unavailable.');
      const server = await response.json();
      if (server.schema !== 1 || server.base !== this.info.base || !/^R\d+[A-Za-z0-9.-]*$/.test(server.release) ||
        !new RegExp(`^${server.release.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[a-f0-9]{12}$`).test(server.buildId) || !/^[a-f0-9]{64}$/.test(server.sourceFingerprint)) throw Error('Invalid server metadata.');
      if (this.disposed) return;
      this.different = server.buildId !== this.info.buildId || server.sourceFingerprint !== this.info.sourceFingerprint;
      this.find('release-status').textContent = this.different ? `服务器版本不同：${label(server)}。刷新后当前游览位置会重置；仅在你点击时刷新。` : this.html.identityMatch === 'mismatch' ? '当前程序版本与服务器一致，但页面与程序标识不一致；可手动重新打开页面。' : '当前版本与服务器一致。';
      this.find('release-refresh-btn').hidden = !this.different;
    } catch {
      if (!this.disposed) this.find('release-status').textContent = '暂时无法确认服务器版本，可能离线或服务器尚无版本信息。可稍后重试；当前游览不变。';
    } finally {
      clearTimeout(timeout); this.abort = null; this.checking = false;
      if (!this.disposed) this.find('release-check-btn').disabled = false;
    }
  }
  dispose() {
    this.disposed = true; this.different = false; this.abort?.abort();
    this.listeners.splice(0).forEach(remove => remove()); this.element.remove();
  }
}
