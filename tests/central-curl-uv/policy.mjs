import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
export function cspFor(html){
 const matches=[...html.matchAll(/<script type="importmap">([^<]*)<\/script>/g)];
 assert.equal(matches.length,1,'one exact import map required');JSON.parse(matches[0][1]);
 const hash=createHash('sha256').update(matches[0][1]).digest('base64');
 return `default-src 'none'; script-src 'self' 'sha256-${hash}'; connect-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; font-src 'none'; worker-src 'none'; frame-src 'none'; child-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; sandbox allow-scripts allow-same-origin`;
}
