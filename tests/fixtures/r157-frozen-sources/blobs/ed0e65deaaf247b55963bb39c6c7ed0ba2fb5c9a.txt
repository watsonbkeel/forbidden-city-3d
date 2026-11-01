import source from '../../../../data/architecture/taihe-core.json' with { type: 'json' };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const TAIHE_CORE = freeze(source);
export const TAIHE_CORE_CONTRACT = freeze({ profileId: source.profileId, revision: source.revision, approvalCardSHA256: source.approvalCardSHA256, ownership: 'taihe-core-visual-only' });
export const TAIHE_FALLBACK_OWNER = 'taihe-v16-fallback-core';
