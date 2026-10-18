// Small DOM fixture for lifecycle tests. It models ancestry, attributes, focus,
// and event propagation; browser layout/scroll/touch physics remain QA work.
class EventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener, options = false) {
    const capture = options === true || options?.capture === true;
    const list = this.listeners.get(type) ?? [];
    if (!list.some(item => item.listener === listener && item.capture === capture)) list.push({ listener, capture });
    this.listeners.set(type, list);
  }
  removeEventListener(type, listener, options = false) {
    const capture = options === true || options?.capture === true;
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item.listener !== listener || item.capture !== capture));
  }
  listenerCount() { return [...this.listeners.values()].reduce((sum, list) => sum + list.length, 0); }
}

export function createDOM() {
  const window = new EventTarget();
  const document = new EventTarget();
  document.parentNode = window;
  class Element extends EventTarget {
    constructor(tag = 'div') {
      super(); this.tagName = tag.toUpperCase(); this.style = {}; this.children = []; this.attributes = new Map();
      this.parentNode = null; this.inert = false; this.scrollTop = 0; this.hidden = false; this._text = '';
      this.classList = {
        contains: token => (this.getAttribute('class') ?? '').split(/\s+/).includes(token),
        add: (...tokens) => this.setAttribute('class', [...new Set([...(this.getAttribute('class') ?? '').split(/\s+/).filter(Boolean), ...tokens])].join(' ')),
        remove: (...tokens) => this.setAttribute('class', (this.getAttribute('class') ?? '').split(/\s+/).filter(token => token && !tokens.includes(token)).join(' ')),
        toggle: (token, force) => { const enabled = force === undefined ? !this.classList.contains(token) : !!force; this.classList[enabled ? 'add' : 'remove'](token); return enabled; },
      };
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    get id() { return this.getAttribute('id') ?? ''; }
    set id(value) { this.setAttribute('id', value); }
    get open() { return this.attributes.has('open'); }
    set open(value) { if (value) this.setAttribute('open', ''); else this.removeAttribute('open'); }
    get isConnected() { return this === document.body || !!this.parentNode?.isConnected; }
    set innerHTML(value) {
      this.children = []; this._text = ''; this._html = value;
      const stack = [this];
      for (const token of value.match(/<[^>]+>|[^<]+/g) ?? []) {
        if (token.startsWith('</')) { stack.pop(); continue; }
        if (token.startsWith('<')) {
          const match = token.match(/^<([a-z][\w-]*)([\s\S]*?)\/?\s*>$/i);
          if (!match) continue;
          const child = new Element(match[1]);
          for (const attr of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) child.setAttribute(attr[1], attr[2] ?? '');
          stack.at(-1).appendChild(child);
          if (!/^(br|hr|input|img)$/i.test(match[1])) stack.push(child);
        } else stack.at(-1)._text += token;
      }
    }
    get innerHTML() { return this._html ?? ''; }
    set textContent(value) { this._text = value; this.children = []; }
    get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    appendChild(child) { child.remove(); child.parentNode = this; this.children.push(child); return child; }
    prepend(child) { child.remove(); child.parentNode = this; this.children.unshift(child); }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    removeChild(child) { child.remove(); return child; }
    contains(child) { return child === this || this.children.some(item => item.contains(child)); }
    matches(selector) {
      return selector.split(',').some(part => {
        const s = part.trim();
        if (s.startsWith('#')) return this.id === s.slice(1);
        const match = s.match(/^([\w-]+)?(?:\[([\w-]+)(?:="?([^"\]]+)"?)?\])?$/);
        return !!match && (!match[1] || this.tagName === match[1].toUpperCase()) &&
          (!match[2] || (this.attributes.has(match[2]) && (match[3] === undefined || this.getAttribute(match[2]) === match[3])));
      });
    }
    closest(selector) { return this.matches(selector) ? this : this.parentNode?.closest?.(selector) ?? null; }
    querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    focus() { document.activeElement = this; }
    click() { return dispatch(this, 'click'); }
    remove() {
      if (this.parentNode?.children) this.parentNode.children = this.parentNode.children.filter(child => child !== this);
      this.parentNode = null;
    }
  }
  document.createElement = tag => new Element(tag);
  document.body = new Element('body'); document.body.parentNode = document; document.activeElement = document.body;
  document.getElementById = id => document.body.querySelector(`#${id}`) ?? document.head?.querySelector(`#${id}`) ?? null;
  function dispatch(target, type, init = {}) {
    const event = { target, type, defaultPrevented: false, cancelable: true, preventDefaultCalls: 0, ...init,
      preventDefault() { this.preventDefaultCalls++; if (this.cancelable) this.defaultPrevented = true; },
      stopPropagation() { this.stopped = true; },
      stopImmediatePropagation() { this.stopped = true; this.immediate = true; },
    };
    const path = []; for (let node = target; node; node = node.parentNode) path.push(node);
    const invoke = (node, capture) => {
      for (const item of [...(node.listeners.get(type) ?? [])]) {
        if (item.capture === capture) item.listener(event);
        if (event.immediate) break;
      }
    };
    for (const node of [...path].reverse()) { invoke(node, true); if (event.stopped) return event; }
    for (const node of path) { invoke(node, false); if (event.stopped) break; }
    return event;
  }
  return { document, window, Element, dispatch };
}
