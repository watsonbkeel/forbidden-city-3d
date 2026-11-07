import {englishNameInfo} from '../i18n/OfficialPlaceNames.js';
import {translateText} from '../i18n/Messages.js';
import {localeStore} from '../i18n/LocaleStore.js';
import {localizedPlace,localizedPlaceName,localizedSource} from '../i18n/PlaceLocale.js';
import {modelFidelityFor,bridgeFacilityInfoFor} from './ModelFidelity.js';
import {placeDisplayName} from './PublicPlaceNames.js';
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = translateText(text);
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
    this.element.addEventListener('focusin', event => {
      this.contentViewport();
      const target = event.target;
      if (target?.tagName === 'A') queueMicrotask(() => {
        if (document.activeElement === target && this.element.contains(target)) this.keepSourceVisible(target);
      });
    });
    this.unsubscribeLocale = localeStore.subscribe(() => this.refreshLocale());
  }

  render(input) {
    this.lastInput = input;
    let { place, name, facility, sources = [], canTravel, onTravel } = input;
    place = localizedPlace(place);
    sources = sources.map(source => localizedSource(source));
    this.element.setAttribute('lang', localeStore.locale);
    const displayName = place?.displayName ?? localizedPlaceName(name, place?.id) ?? placeDisplayName(name);
    const facilityInfo=!place&&typeof name==='string'?bridgeFacilityInfoFor(facility?.id,name):null;
    const displaySources=place?sources:facilityInfo?.sources??[];
    // Remove nodes (rather than repurpose old buttons) so queued events cannot
    // acquire a newer destination. The caller also checks selection generation.
    while (this.element.children.length) this.element.children[0].remove();
    const title = element('h2', displayName); title.id = 'place-title'; title.tabIndex = -1;
    this.element.appendChild(title);
    if (localeStore.locale === 'en' && place) this.element.appendChild(element('p', 'English descriptions: project translation of the cited Chinese sources. The sources have not all been newly reviewed.', 'place-note'));
    if (place) this.element.appendChild(element('p', place.functionTag, 'place-tag'));
    if (evidenceLabels[place?.evidenceStatus]) this.element.appendChild(element('p', evidenceLabels[place.evidenceStatus], 'place-note'));
    if (place?.canonicalName && place.canonicalName !== name) this.element.appendChild(element('p', `资料所用名称：${place.canonicalName}`, 'place-note'));
    if (place?.evidenceNote) this.element.appendChild(element('p', factText(place.evidenceNote), 'place-note'));
    this.element.appendChild(element('p', place?.summary.text ?? facilityInfo?.intro ?? '此地点的详细介绍尚未收录。', 'place-summary'));
    const fidelity=modelFidelityFor(name,place?.id)??modelFidelityFor(input.place?.canonicalName);
    if(facilityInfo||fidelity){this.element.appendChild(element('h3','本版模型说明'));this.element.appendChild(element('p',facilityInfo?.detail??fidelity.detail,'place-note'));}
    if (canTravel && !facilityInfo) {
      const button = element('button', place?.modelExperience.actionLabel ?? '前往此处');
      button.id = 'place-travel'; button.type = 'button';
      button.setAttribute('aria-label', translateText(`前往${displayName}${place?.modelExperience.navigationMode === 'exterior-view' ? '外观观览点' : ''}`));
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
      const actions = element('div'); actions.id = 'place-actions';
      actions.appendChild(button);
      this.element.prepend(actions);
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
    if (displaySources.length) {
      this.element.appendChild(element('h3', '资料来源'));
      this.element.appendChild(element('p', place?.catalogKind === 'supplemental' ? '来源核对方式逐条标注；继承引用不代表本轮重新访问。来源链接在新标签页打开。' : `历史资料核对：${place?.reviewedAt??facilityInfo?.reviewedAt}。来源链接在新标签页打开。`, 'place-note'));
      const list = element('ul');
      for (const source of displaySources) {
        const li = element('li'), a = element('a', `${source.publisher} · ${source.id === 'announcements' ? '查看最新公告' : source.title}${source.publishedAt ? `（${source.publishedAt}）` : ''}`);
        a.id = `place-source-${source.id}`;
        a.setAttribute('href', source.url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer');
        li.appendChild(a);
        if (place?.catalogKind === 'supplemental') li.appendChild(element('p', source.reviewType === 'reused-official-source-attribution' ? '继承官方来源记录；本轮未重新访问。' : `本轮核对官方页面或索引摘要：${source.reviewedAt}；不代表完整原文复核。`, 'place-note'));
        list.appendChild(li);
      }
      this.element.appendChild(list);
    }
    if (place) this.renderNameProvenance(place);
    this.element.scrollTop = 0;
    this.contentViewport();
    return title;
  }

  renderNameProvenance(place) {
    const info = englishNameInfo(place.id), en = localeStore.locale === 'en';
    const section = element('section'); section.id = 'place-name-provenance';
    section.setAttribute('data-name-status', info.status);
    section.appendChild(element('h3', en ? 'English name sources' : '英文名称出处'));
    const official = info.status === 'official-display';
    section.appendChild(element('p', official
      ? (en ? `Verified official English name: ${info.officialDisplayName}` : `已核官方英文展示名：${info.officialDisplayName}`)
      : (en ? `Project English name: ${info.projectName}` : `项目英文展示名：${info.projectName}`), 'place-note'));
    section.appendChild(element('p', en
      ? 'Name evidence is separate from the descriptions. English descriptions remain project translations; naming does not expand model scope or visitor access.'
      : '名称证据与介绍正文分开；英文介绍仍为项目译文，名称不扩大模型范围或现场开放许可。', 'place-note'));
    if (official) section.appendChild(element('p', en ? `Project name also searchable: ${info.projectName}` : `原项目译名仍可检索：${info.projectName}`, 'place-note'));
    if (info.status === 'project-unverified') section.appendChild(element('p', en
      ? 'No official English name was verified for this card in this review. This does not mean no official name exists.'
      : '本轮未核实此卡的官方英文名；这不表示不存在官方英文名。', 'place-note'));
    else if (!official) section.appendChild(element('p', en
      ? 'The official wording below is offered for related searches with its stated limits, not as an equivalent name for this entire card.'
      : '下列官方用语仅按注明范围支持相关检索，不作为本卡整体的同一对象别名。', 'place-note'));
    for (const evidence of info.evidence) {
      const item = element('div');
      item.appendChild(element('p', evidence.quote));
      item.appendChild(element('p', evidence.scope[en ? 'en' : 'zh'], 'place-note'));
      const link = element('a', en ? `The Palace Museum · English naming source · checked ${evidence.checkedAt}` : `故宫博物院 · 英文名称来源 · 核对于 ${evidence.checkedAt}`);
      link.id = `place-name-source-${place.id}-${evidence.id}`;
      link.setAttribute('href', evidence.url); link.setAttribute('target', '_blank'); link.setAttribute('rel', 'noopener noreferrer');
      item.appendChild(link); section.appendChild(item);
    }
    this.element.appendChild(section);
  }

  contentViewport() {
    const rect = this.element.getBoundingClientRect?.();
    if (!rect) return null;
    const style = globalThis.getComputedStyle?.(this.element);
    // clientTop/clientHeight round to integer CSS pixels. Keep the measured
    // padding-box clip, including fractional borders, in the same coordinates
    // as the source link and sticky action rectangles.
    const top = rect.top + (parseFloat(style?.borderTopWidth) || 0);
    const bottom = rect.bottom - (parseFloat(style?.borderBottomWidth) || 0);
    const actionBottom = this.element.querySelector('#place-actions')?.getBoundingClientRect?.().bottom ?? top;
    const contentTop = Math.max(top, Math.min(bottom, actionBottom));
    this.element.style.scrollPaddingTop = `${contentTop - top}px`;
    return {top: contentTop, bottom};
  }

  keepSourceVisible(source, preferredTop) {
    const bounds = this.contentViewport(), rect = source.getBoundingClientRect?.();
    if (!bounds || !rect) return;
    const top = Math.max(bounds.top, Math.min(preferredTop ?? rect.top, bounds.bottom - (rect.bottom - rect.top)));
    // The browser applies its native scroll range. No alternate scroll node or
    // scrollIntoView side effect can move the map or the page.
    this.element.scrollTop += rect.top - top;
  }

  refreshLocale() {
    if (!this.lastInput) return;
    const scroll = this.element.scrollTop;
    const active = this.element.contains(document.activeElement) ? document.activeElement : null;
    const focused = active?.id;
    const oldRect = active?.tagName === 'A' ? active.getBoundingClientRect?.() : null;
    const visible = this.contentViewport();
    const keepVisibleSource = oldRect && visible && oldRect.top >= visible.top && oldRect.bottom <= visible.bottom;
    this.render(this.lastInput);
    this.element.scrollTop = scroll;
    if (focused) {
      const replacement = this.element.querySelector(`#${focused}`);
      replacement?.focus({preventScroll:true});
      // Preserve the visible source anchor, rather than an obsolete pixel offset
      // when translated paragraphs above it grow or shrink. Native scroll limits apply.
      if (replacement?.tagName === 'A') this.keepSourceVisible(replacement, keepVisibleSource ? oldRect.top : undefined);
    }
  }

  dispose() { this.unsubscribeLocale(); this.lastInput = null; this.element.remove(); }
}
