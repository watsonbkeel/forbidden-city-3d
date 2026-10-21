import assert from 'node:assert/strict';
export const FENGXIAN_CARD_ID='place-east-six-d8aef2e8a9';
export const FENGXIAN_R38_DISCLAIMER='前往模型中此地点对应的现有导航点；模型位置与通行范围尚非实测复原。';
export const FENGXIAN_R39_DISCLAIMER='前往模型中此地点对应的现有导航点。此处是皇室家庙，不是皇帝朝会殿；祭祀内饰与神位布局尚未复原，已移除无资料依据的通用朝会宝座。模型留白不表示历史上为空殿；外观、位置与通行范围也尚非实测复原。';
/** Test-only historical reconstruction. Existing complete catalog hashes still
 * verify every field after reversing this single explicitly reviewed wording.
 * Do not broaden this into accepting arbitrary current catalog changes. */
export function restoreReviewedR39FengxianDisclaimer(data){
 const matches=data.places.filter(p=>p.id===FENGXIAN_CARD_ID);
 assert.equal(matches.length,1,'exact Fengxian identity for reviewed R39 status');
 const card=matches[0];assert.equal(card.name,'奉先殿','Fengxian identity name unchanged');
 const current=card.modelExperience?.disclaimer;
 assert.ok(current===FENGXIAN_R38_DISCLAIMER||current===FENGXIAN_R39_DISCLAIMER,'only exact reviewed Fengxian disclaimer may be normalized');
 card.modelExperience.disclaimer=FENGXIAN_R38_DISCLAIMER;
 return data;
}
