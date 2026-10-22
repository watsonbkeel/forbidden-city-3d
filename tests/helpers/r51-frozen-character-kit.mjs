/** Read-only historical loader. Never rewrites a source snapshot or oracle. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const FROZEN_KIT_COMMIT='c8ae19b0316892ce45e4f7154bacdf8d777d8b2e';
export const FROZEN_KIT_PATH='src/scene/characters/CharacterKit.js';
export const FROZEN_KIT_SHA256='cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c';
// API-delivered Git history has different commit IDs. The committed, pinned
// source snapshot makes this historical fixture portable to a fresh clone.
export const frozenKitSource=fs.readFileSync(new URL('../../reports/r50-followup/female-reference/candidate06-07/CharacterKit-source.js',import.meta.url),'utf8');
const original=spawnSync('git',['show',`${FROZEN_KIT_COMMIT}:${FROZEN_KIT_PATH}`],{cwd:fileURLToPath(new URL('../../',import.meta.url)),encoding:'utf8'});
if(original.status===0)assert.equal(frozenKitSource,original.stdout,'committed archive is byte-identical to the original local Git blob');
assert.equal(createHash('sha256').update(frozenKitSource).digest('hex'),FROZEN_KIT_SHA256,'original Git source must retain its pinned bytes');
// Resolve only the package URL so the otherwise unmodified historical source
// can be evaluated as an isolated data module, without creating an oracle.
const executable=frozenKitSource.replace("from 'three'",`from ${JSON.stringify(import.meta.resolve('three'))}`);
export const frozenKit=await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`);
