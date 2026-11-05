import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export function validateWatchRouteBaselineBytes(b){assert.equal(createHash('sha256').update(b).digest('hex'),'a5f156731afae77170a53c871ae20c5d4710834d7fee4c551bc0e9f9c7a2358b');return JSON.parse(b)}
export function loadWatchRouteBaseline(){return validateWatchRouteBaselineBytes(fs.readFileSync(new URL('./routes-4ed.json',import.meta.url)))}
