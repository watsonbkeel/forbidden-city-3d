import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR33SourceIfPresent} from './r33-source-retention.mjs';
import {restoreR32FriezeSourceIfPresent} from './r32-frieze-source-retention.mjs';
import {restoreR32FollowthroughSourceIfPresent} from './r32-followthrough-source-retention.mjs';

const readFile = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
// Current SHA-256 at 1608d8c, followed by historical SHA-256/size/Git blob.
// The historical bytes come from the tree at 51d5ced1f0074b1a0eeacec2c36c6c4fd580245d,
// except YanxiStorehouses, which already has an independent R47 source snapshot.
const pins = new Map([
  ['data/interiors/qianqing.json', ['2b4a513c47a83b827c94eeeb0017efecbbcc19c6db58c2f4bf284b64a25f4ee5', 'dff330c932b58a856feccd27d558bff16969a46855bc907fccf9c610d4d24aee', 1408, 'f290707d448567b5bc597d4eacb48417a842c6d5']],
  ['src/scene/palace/QianqingCeiling.js', ['d70696233607a27a83f54734bc8c81035fad519c79eef838b997562426eb3a47', '5aeedc1627bb7b00f35b32d69d144f7b08d61dfdc2658d6652ba46ca0b6a1a60', 3058, '8f9ca6b42feaab753e8b6c9de33a6f8c71e4bcfb']],
  ['src/scene/palace/QianqingCentralArt.js', ['e19d40285d18727b8383b1cea8790651a9a717d7ea55bc06be0c2f54b80db54d', '80fdf121a4c4e3598bc34346b44defee51e7223173a17a6b6b59792a73648e77', 5634, 'bb0067f8c3a36cee0c84ba8df3f1a8f50951a635']],
  ['src/scene/palace/QianqingCentralSetting.js', ['0cc86d471393ac7e04503448d281e5c46f9a7b721051aec15edcc6c2f3cc7b9f', '8831a0f208190ddad53b1d2f196449c0ef5fb701bace98fec749cfc76f16d926', 9105, 'ffa204ce785ee737df2a73005cf2d18c1eba3aa6']],
  ['src/scene/palace/QianqingDisplay.js', ['1fd504b8f26f249235c1def87b43f5aadba2901877634cfcd4b7c810cc3a6240', '1066882fa79171ae478eaa2003fb3b639f6cf73b29d321d2576ee069191a2e95', 6462, '112131cfaf03394488eaa9011b8c4e23a3eb6824']],
  ['src/scene/palace/special/InnerJinshui.js', ['2a615dfc7242432025b4a073c01f21aa00adab735414248b577264fa5710242e', '6f2efa66c5afa01d52a1e7e4c22e7b8c1c5b38e86c99fa456b7c730a9a3cdc95', 13812, '99b2ccc1132afc16335d6ace6a26422a4edb4674']],
  ['src/ui/ModelFidelity.js', ['8ae9e2d15cf88f10c47fbb18523eac60b0f015e9afd1b2ed8c8d16a538680d2b', '50f882418083e8e86391812ba5c8630d9867d5212c8cbaea21d06ef16b6b3de3', 3711, 'c27597f206faad4a215176727493c528264171b8']],
  ['src/scene/palace/special/YanxiStorehouses.js', ['037ac719a101bc92f8b8b2945a8c589735fb7288868ef49676cdd05f0c0e73e6', '959d62c7ec3ee6f165f7b83798098684783aa99e9c198539690a431daab208dc', 7421, '2c1d8030cb5fa5a8cd03d5ed7d9a41fbbac5b3b0']],
]);
const yanxi = 'src/scene/palace/special/YanxiStorehouses.js';
const supplements = 'docs/current-state/r48-remaining/independent-release-evidence/supplements/';
const sources = Object.freeze(JSON.parse(readFile('tests/fixtures/r32-paint-source-inputs.json')));
assert.deepEqual(Object.keys(sources).sort(), [...pins.keys()].filter(path => path !== yanxi).sort());

// Only the named, exact successor can select an authenticated historical blob.
// The original version-specific guards remain responsible for their own hunks.
export function r32PaintCheckpoint(path, bytes) {
  const pin = pins.get(path);
  if (!pin || sha(bytes) !== pin[0]) return bytes;
  const archived = path === yanxi ? readFile(supplements + 'r47-yanxi-storehouses.txt') : Buffer.from(sources[path], 'utf8');
  assert.equal(sha(archived), pin[1], path);
  assert.equal(archived.length, pin[2], path);
  assert.equal(blob(archived), pin[3], path);
  return archived;
}
export const readR32PaintCheckpoint = path => r32PaintCheckpoint(path, readFile(path));
// Combined inventory binds base R32 additions, not the later source candidate
// (e.g. ModelFidelity must survive the additional frieze reverse hunk).
export function readR32PaintInventory(path) {
  const historical = restoreR33SourceIfPresent(path, readR32PaintCheckpoint(path));
  return restoreR32FollowthroughSourceIfPresent(path, restoreR32FriezeSourceIfPresent(path, historical));
}
