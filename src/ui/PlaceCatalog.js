import data from '../../data/places/zh-CN.json' with { type: 'json' };
import garden from '../../data/zones/garden.json' with { type: 'json' };
import outerEast from '../../data/zones/outer-east.json' with { type: 'json' };
import outerWest from '../../data/zones/outer-west.json' with { type: 'json' };
import axisCourts from '../../data/zones/axis-courts.json' with { type: 'json' };
import eastSix from '../../data/zones/east-six.json' with { type: 'json' };
import westSix from '../../data/zones/west-six.json' with { type: 'json' };
import ningshou from '../../data/zones/ningshou.json' with { type: 'json' };
import { PALACE_LAYOUT } from '../scene/Layout.js';
import { pavilionGeometry } from '../scene/palace/special/PavilionProfiles.js';

const fail = message => { throw new Error(`Place catalog: ${message}`); };
const check = (condition, message) => { if (!condition) fail(message); };
const text = (value, max = 1200) => check(typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[<>]/.test(value), 'invalid plain text');
const shape = (value, required, optional = []) => {
  check(value && typeof value === 'object' && !Array.isArray(value), 'invalid object');
  check(required.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => [...required, ...optional].includes(key)), 'missing or unknown field');
};
const list = (value, min = 1) => check(Array.isArray(value) && value.length >= min, 'invalid list');
const date = value => check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), 'invalid date');
const keyFor = b => JSON.stringify([b.kind, b.zoneId ?? null, b.name]);
const relations = ["activity-participant", "administrator", "banquet-participant", "birthday-celebrant", "birthplace", "ceremonial-access", "ceremony-honoree", "ceremony-participant", "changed-use", "collection-patron", "commissioner", "confined-nearby", "departure-participant", "dining-and-inscription", "dining-user", "filial-ritual-participant", "garden-users", "gave-birth", "government-participant", "inscription-author", "intended-user", "martial-practice-user", "meal-attendant", "mourning-participant", "performance-honoree", "reader", "resident", "ritual-user", "temporary-resident", "tree-planter", "visitor", "visitor-and-poet", "waiting-place-user", "wedding-participant", "worship-participant"];

/** Text knowledge only. No coordinates or replacement navigation rules in cards. */
export class PlaceCatalog {
  constructor(input = data, { layout = PALACE_LAYOUT, zones = [garden, outerEast, outerWest, axisCourts, eastSix, westSix, ningshou] } = {}) {
    shape(input, ['schemaVersion', 'language', 'status', 'baseCommit', 'reviewedAt', 'sourcePolicy', 'sources', 'places']);
    check(input.schemaVersion === 1 && input.language === 'zh-CN', 'unsupported version/language');
    check(['design-sample-not-shipped', 'reviewed-local-candidate', 'reviewed-for-release'].includes(input.status), 'invalid status');
    check(/^[0-9a-f]{40}$/.test(input.baseCommit), 'invalid base commit'); date(input.reviewedAt); text(input.sourcePolicy);
    list(input.sources); list(input.places);
    this.sources = new Map(); this.byId = new Map(); this.byBinding = new Map(); this.sceneItems = new Map();
    for (const source of input.sources) {
      shape(source, ['id', 'title', 'publisher', 'url', 'reviewedAt', 'retrievalMethod', 'publishedAt']);
      text(source.id, 80); text(source.title, 160); date(source.reviewedAt); if (source.publishedAt !== null) date(source.publishedAt);
      check(!this.sources.has(source.id) && source.publisher === '故宫博物院', 'duplicate or unofficial source');
      check(['official-indexed-page', 'official-live-page', 'official-cached-source'].includes(source.retrievalMethod), 'unknown source provenance');
      let url; try { url = new URL(source.url); } catch { fail('invalid source URL'); }
      check(url.protocol === 'https:' && /^(?:[a-z0-9-]+\.)?dpm\.org\.cn$/.test(url.hostname) && !url.username && !url.password && !url.port && !url.search && !url.hash, 'unsafe or unofficial source URL');
      this.sources.set(source.id, source);
    }
    const refs = (ids, allowEmpty = false) => {
      list(ids, allowEmpty ? 0 : 1); check(new Set(ids).size === ids.length && ids.every(id => this.sources.has(id)), 'missing or duplicate source reference');
    };
    const fact = (f, period = false, allowEmpty = false) => {
      shape(f, ['text', 'sourceIds', ...(period ? ['period'] : [])], period ? [] : ['period']);
      text(f.text); refs(f.sourceIds, allowEmpty); if (f.period !== undefined) text(f.period, 80);
    };
    for (const place of input.places) {
      shape(place, ['id', 'name', 'functionTag', 'sceneBinding', 'summary', 'functions', 'people', 'timeline', 'modelExperience', 'siteAccess', 'reviewedAt'], ['residenceNote', 'interiorGuide', 'canonicalName', 'evidenceNote', 'evidenceStatus']);
      check(/^[a-z][a-z0-9-]*$/.test(place.id) && !this.byId.has(place.id), 'invalid or duplicate place ID');
      text(place.name, 80); text(place.functionTag, 80); date(place.reviewedAt);
      const b = place.sceneBinding;
      shape(b, ['kind', 'name'], ['zoneId']); text(b.name, 80);
      check((b.kind === 'layout' && b.zoneId === undefined) || (b.kind === 'zone' && typeof b.zoneId === 'string' && b.zoneId.length > 0), 'invalid scene binding');
      check(!this.byBinding.has(keyFor(b)), 'duplicate scene binding');
      const candidates = b.kind === 'layout' ? layout : zones.filter(z => z.id === b.zoneId).flatMap(z => z.items).filter(item => ['hall', 'gate', 'cityGate', 'nineDragonWall'].includes(item.kind));
      const matches = candidates.filter(item => item.name === b.name);
      check(matches.length === 1 && place.name === b.name, 'scene binding must resolve exactly once');
      // A clearly labelled unresolved model identity may state the research gap
      // without pretending a neighbouring building's source proves the name.
      fact(place.summary, false, place.evidenceStatus === 'identity-unresolved'); list(place.functions, 0); place.functions.forEach(f => fact(f));
      list(place.timeline, 0); place.timeline.forEach(f => fact(f, true)); list(place.people, 0);
      for (const person of place.people) {
        shape(person, ['name', 'kind', 'relation', 'text', 'sourceIds', 'period']);
        text(person.name, 160); text(person.text); text(person.period, 80); refs(person.sourceIds);
        check(['person', 'person-group', 'role-group'].includes(person.kind) && relations.includes(person.relation), 'unknown person relation');
      }
      if (place.people.some(p => ['resident', 'temporary-resident'].includes(p.relation))) check(!!place.residenceNote, 'residence requires evidence note');
      if (place.residenceNote) fact(place.residenceNote);
      if (place.canonicalName !== undefined) text(place.canonicalName, 80);
      if (place.evidenceNote !== undefined) fact(place.evidenceNote);
      if (place.evidenceStatus !== undefined) check(["source-supported", "identity-inferred", "identity-unresolved", "partial-history", "partial-identity", "historical-site"].includes(place.evidenceStatus), 'invalid evidence status');
      if (place.interiorGuide !== undefined) {
        const guide = place.interiorGuide;
        shape(guide, ['notice', 'items']); text(guide.notice, 400); list(guide.items);
        check(guide.items.length <= 6, 'too many guide items');
        const guideIds = new Set();
        for (const item of guide.items) {
          shape(item, ['id', 'title', 'text', 'sourceIds']);
          text(item.id, 80); text(item.title, 80); text(item.text, 80); refs(item.sourceIds);
          check(/^[a-z][a-z0-9-]*$/.test(item.id) && !guideIds.has(item.id), 'invalid or duplicate guide ID');
          guideIds.add(item.id);
        }
      }
      const model = place.modelExperience;
      shape(model, ['teleportTargetName', 'navigationMode', 'actionLabel', 'disclaimer']);
      check(model.teleportTargetName === b.name, 'target must match scene binding');
      check(['existing-teleport', 'exterior-view'].includes(model.navigationMode), 'unknown model mode'); text(model.actionLabel, 80); text(model.disclaimer);
      const access = place.siteAccess;
      shape(access, ['status', 'disclaimer', 'sourceIds', 'checkedAt'], ['notice', 'noticePublishedAt', 'effectiveFrom', 'reopensAt']);
      check(['not-verified', 'dated-notice-requires-recheck'].includes(access.status), 'not live access information');
      text(access.disclaimer); refs(access.sourceIds); if (access.checkedAt !== null) date(access.checkedAt);
      if (access.status === 'dated-notice-requires-recheck') {
        fact(access.notice); date(access.noticePublishedAt); date(access.effectiveFrom);
        check(Object.hasOwn(access, 'reopensAt'), 'unknown reopening must be explicit null');
        if (access.reopensAt !== null) date(access.reopensAt);
      } else check(!access.notice && access.reopensAt === undefined, 'unexpected access notice');
      this.byId.set(place.id, place); this.byBinding.set(keyFor(b), place); this.sceneItems.set(place.id, matches[0]);
    }
    this.places = [...this.byId.values()];
  }

  get(id) { return this.byId.get(id) ?? null; }
  forBinding(binding) { return binding ? this.byBinding.get(keyFor(binding)) ?? null : null; }
  forMapItem(item, items) {
    // Side-map data has no global ID. Accept only a unique name AND the exact
    // source-bound center/profile; duplicate names cannot borrow another court's card.
    if (!['hall', 'gate', 'cityGate'].includes(item.kind) || items.filter(other => other.name === item.name).length !== 1) return null;
    const matches = this.places.filter(p => p.sceneBinding.kind === 'zone' && p.sceneBinding.name === item.name &&
      (() => {
        const source = this.sceneItems.get(p.id);
        if (source.pavilionProfile) {
          // Surveyed pavilion map rectangles are centered on the asymmetric
          // platform, not the source building origin. Derive the exact same
          // rectangle as SurveyedPavilion; a name/profile alone is insufficient.
          if (source.pavilionProfile !== item.pavilionProfile) return false;
          const g = pavilionGeometry(source), platform = g.platform;
          const [x, z] = g.toWorld(0, (platform.z0 + platform.z1) / 2);
          const sideways = Math.abs(Math.sin(g.rot)) > 0.5;
          return item.x === x && item.z === z &&
            item.w === (sideways ? platform.depth : platform.width) &&
            item.d === (sideways ? platform.width : platform.depth);
        }
        return source.qinanProfile
          ? source.qinanProfile === item.qinanProfile && source.structure === item.structure
          : source.x === item.x && source.z === item.z;
      })());
    return matches.length === 1 ? matches[0] : null;
  }
  sourcesFor(place) {
    const ids = new Set();
    for (const item of [place.summary, ...place.functions, ...place.people, ...place.timeline, place.residenceNote, place.evidenceNote, place.siteAccess, place.siteAccess.notice, ...(place.interiorGuide?.items ?? [])]) {
      item?.sourceIds.forEach(id => ids.add(id));
    }
    return [...ids].map(id => this.sources.get(id));
  }
}
