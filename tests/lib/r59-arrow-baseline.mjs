// Exact in-repository fixture bytes, never a runtime git show/ls-tree lookup.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sha} from './r59-arrow-knees-qa.mjs';
export function arrowBaselineSource(){
 const bytes=fs.readFileSync(new URL('../fixtures/r59-arrow-knees/EnclosedPavilions.baseline.js.txt',import.meta.url));
 assert.equal(sha(bytes),'5381da26d16d981cd113e03e0f8cbaa245fee61e2ab24cdedc698377d320bd6a','frozen Arrow source fixture SHA256');return bytes.toString('utf8');
}
export function arrowLegacyProduction(){
 const bytes=fs.readFileSync(new URL('../fixtures/r59-arrow-knees/legacy-production.json',import.meta.url));
 assert.equal(sha(bytes),'8a2ead08236151bfd576b2fbf25963075a68cc641574049c0ded4f718d3b471d','frozen legacy source inventory SHA256');return JSON.parse(bytes);
}
