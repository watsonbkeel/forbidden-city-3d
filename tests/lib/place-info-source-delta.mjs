import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Only the target-existence callback and its matching help sentence differ.
// Reverse them before every older source guard; never refresh old fixtures.
export const PLACE_INFO_DELTAS = Object.freeze({
  'main.js': Object.freeze({
    before: 'preview: this.isMobile, onTeleport: name => this.teleport.go(name)',
    after: 'preview: this.isMobile, hasTeleportTarget: name => this.teleport.targets.has(name), onTeleport: name => this.teleport.go(name)',
    baseSha256: '7522d4fc19bc38f712aad2e3fa9523c8cb88c4b41e1c79a9e9a786235bd7dd5a',
  }),
  'src/ui/SettingsMenu.js': Object.freeze({
    before: '点击建筑名称传送后，请松开再重新按键或触摸方向盘。',
    after: '点击建筑名称查看介绍，再点“前往”传送；传送后，请松开再重新按键或触摸方向盘。',
    baseSha256: '3d83c96e1d6f915039a7aea17d4491464b045ae1551683549045a942b61ad7bf',
  }),
});

export function restorePlaceInfoBytes(path, current) {
  const delta = PLACE_INFO_DELTAS[path];
  assert.ok(delta, 'No approved place-information source delta');
  const source = current.toString();
  assert.equal(source.split(delta.after).length - 1, 1, 'Exact place-information replacement must occur exactly once');
  const restored = Buffer.from(source.replace(delta.after, delta.before));
  assert.equal(createHash('sha256').update(restored).digest('hex'), delta.baseSha256,
    'Restored source must equal exact f83c748 pre-information bytes');
  return restored;
}
