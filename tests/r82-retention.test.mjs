import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{captureGarden}from'./lib/r82-garden-capture.mjs';
test('R82 preserves Chengrui, every Fubi upper component, trees, rockery and all garden physical routes',()=>{const old=JSON.parse(fs.readFileSync('reports/r82-fubi-arch-pool/baseline-garden.json'));assert.deepEqual(captureGarden(),old);});
