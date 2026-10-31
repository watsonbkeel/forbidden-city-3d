// Exact two-file parent replay (Collision replaced; FirstPerson verified only).
// This is not a historical dependency closure or a default test runner.
import {registerHooks} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const root=new URL('../../../../',import.meta.url),source=fs.readFileSync(new URL('tests/fixtures/r157-wumen-joint-layout/Collision.js.before-shared-entry.txt',root),'utf8'),hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(hash(source),'a95f492cc78317515d31470df050b170691db5e3642a79d68ec5971d26a4cf67');assert.equal(hash(fs.readFileSync(new URL('src/controls/FirstPerson.js',root))),'c90de689a5710d1ed272482429b25b14774591eb0f6dd09731cf6bc8c4d5c61c');
const target=new URL('src/utils/Collision.js',root).href;
registerHooks({load(url,ctx,next){return url===target?{format:'module',source,shortCircuit:true}:next(url,ctx);}});
