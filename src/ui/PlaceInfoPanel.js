const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const factText = fact => `${fact.period ? `${fact.period} · ` : ''}${fact.text}`;
const resident = person => ['resident', 'temporary-resident'].includes(person.relation);
const evidenceLabels = { 'identity-inferred': '名称为文献推定', 'identity-unresolved': '名称对应待核', 'partial-history': '独立沿革资料有限', 'partial-identity': '模型单体对应待核', 'historical-site': '历史地点 · 实体已拆除' };
const disclaimer = '模型漫游不代表现场开放许可；实际参观范围和入内安排请查阅故宫博物院当日公告。';

/** One ordinary, nonmodal DOM region. The map owns selection and input lifetime. */
export class PlaceInfoPanel {
  constructor() {
    this.element = element('section');
    this.element.id = 'place-info';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-labelledby', 'place-title');
    this.element.hidden = this.element.inert = true;
  }

  render({ place, name, sources = [], canTravel, onTravel }) {
    // Remove nodes (rather than repurpose old buttons) so queued events cannot
    // acquire a newer destination. The caller also checks selection generation.
    while (this.element.children.length) this.element.children[0].remove();
    const title = element('h2', name); title.id = 'place-title'; title.tabIndex = -1;
    this.element.appendChild(title);
    if (place) this.element.appendChild(element('p', place.functionTag, 'place-tag'));
    if (evidenceLabels[place?.evidenceStatus]) this.element.appendChild(element('p', evidenceLabels[place.evidenceStatus], 'place-note'));
    if (place?.canonicalName && place.canonicalName !== name) this.element.appendChild(element('p', `资料所用名称：${place.canonicalName}`, 'place-note'));
    if (place?.evidenceNote) this.element.appendChild(element('p', factText(place.evidenceNote), 'place-note'));
    this.element.appendChild(element('p', place?.summary.text ?? '此地点的详细介绍尚未收录。', 'place-summary'));
    if (canTravel) {
      const button = element('button', place?.modelExperience.actionLabel ?? '前往此处');
      button.id = 'place-travel'; button.type = 'button';
      button.setAttribute('aria-label', `前往${name}${place?.modelExperience.navigationMode === 'exterior-view' ? '外观观览点' : ''}`);
      let pointerArmed = null;
      button.addEventListener('pointerdown', e => {
        pointerArmed = { id: e.pointerId, x: e.clientX ?? 0, y: e.clientY ?? 0, released: false };
      });
      const cancelDrag = e => {
        if (pointerArmed?.id === e.pointerId && Math.hypot((e.clientX ?? 0) - pointerArmed.x, (e.clientY ?? 0) - pointerArmed.y) > 10) pointerArmed = null;
      };
      button.addEventListener('pointermove', cancelDrag);
      button.addEventListener('pointerup', e => {
        cancelDrag(e);
        if (pointerArmed?.id === e.pointerId) pointerArmed.released = true;
      });
      button.addEventListener('pointercancel', () => { pointerArmed = null; });
      // Mouse movement outside this uncaptured button is no longer observable.
      // Re-entry must start a fresh press rather than revive a possible drag.
      // Non-hover touch may leave AFTER release and before its valid click.
      button.addEventListener('pointerleave', e => {
        if (pointerArmed?.id === e.pointerId && !pointerArmed.released) pointerArmed = null;
      });
      button.addEventListener('click', e => {
        e.stopPropagation();
        // Native pointer activation needs a fresh press on this exact node.
        // Keyboard and the map's validated secondary-touch click use detail 0.
        const admitted = !e.detail || (e.detail === 1 && pointerArmed);
        pointerArmed = null;
        if (admitted) onTravel(button);
      });
      this.element.appendChild(button);
    }
    const section = (heading, facts) => {
      if (!facts.length) return;
      this.element.appendChild(element('h3', heading));
      const list = element('ul');
      for (const fact of facts) list.appendChild(element('li', fact));
      this.element.appendChild(list);
    };
    if (place) {
      this.element.appendChild(element('p', place.modelExperience.disclaimer, 'place-note'));
      if (place.interiorGuide) {
        section('殿内看点', place.interiorGuide.items.map(item => `${item.title}：${item.text}`));
        this.element.appendChild(element('p', place.interiorGuide.notice, 'place-note'));
      }
      section('用途与历史', place.functions.map(factText));
      section('居住记录', place.people.filter(resident).map(p => `${p.name} · ${factText(p)}`));
      if (place.residenceNote) this.element.appendChild(element('p', factText(place.residenceNote), 'place-note'));
      section('人物与活动', place.people.filter(p => !resident(p)).map(p => `${p.name} · ${factText(p)}`));
      section('历史沿革', place.timeline.map(factText));
    }
    this.element.appendChild(element('h3', '现场参观提示'));
    this.element.appendChild(element('p', place?.siteAccess.disclaimer ?? disclaimer, 'place-note'));
    if (place?.siteAccess.notice) {
      this.element.appendChild(element('p', `${place.siteAccess.notice.text} 这是一则历史公告，不能据此判断今天是否开放；请查看最新公告。`, 'place-note'));
    }
    if (sources.length) {
      this.element.appendChild(element('h3', '资料来源'));
      this.element.appendChild(element('p', `历史资料核对：${place.reviewedAt}。来源链接在新标签页打开。`, 'place-note'));
      const list = element('ul');
      for (const source of sources) {
        const li = element('li'), a = element('a', `${source.publisher} · ${source.id === 'announcements' ? '查看最新公告' : source.title}${source.publishedAt ? `（${source.publishedAt}）` : ''}`);
        a.setAttribute('href', source.url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer');
        li.appendChild(a); list.appendChild(li);
      }
      this.element.appendChild(list);
    }
    this.element.scrollTop = 0;
    return title;
  }

  dispose() { this.element.remove(); }
}
