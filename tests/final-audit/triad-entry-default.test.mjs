import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as triadSelection from '../../src/scene/palace/special/TriadTextureFirst.js';

// The real game entry starts the browser application on import. Extract just
// the synchronous selector actually passed to ZoneManager here; the separate
// integration suite exercises the resulting option in the real scene lifecycle.
const entry=readFileSync(new URL('../../main.js',import.meta.url),'utf8');
const initializer=entry.match(/new ZoneManager\(\{[^}\n]*\btriadTextureFirst:(\w+)\(window\.location\.search\)\}\)/);
assert.ok(initializer,'main passes the URL selector to the production ZoneManager');
const selector=triadSelection[initializer[1]];
assert.equal(typeof selector,'function','main uses a real exported triad URL selector');

test('ordinary game entry loads the chosen three paintings, even with unrelated query options',()=>{
 for(const search of ['', '?lang=en', '?quality=low&lang=en']){
  assert.equal(selector(search),true,`ordinary entry must choose the approved paintings for ${JSON.stringify(search)}`);
 }
});
test('existing explicit texture-first URL works and explicit legacy or ambiguous triad inputs stay safe',()=>{
 for(const search of ['?triad=texture-first','?lang=en&triad=texture-first'])assert.equal(selector(search),true);
 for(const search of [
  '?triad=legacy','?lang=en&triad=legacy','?triad','?triad=','?triad=Texture-First',
  '?triad=unknown','?triad=texture-first&triad=legacy','?triad=texture-first&triad=texture-first',
 ])assert.equal(selector(search),false,search);
});
