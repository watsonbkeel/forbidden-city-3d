import{stripFanhuaRemaining}from'../r164-fanhua-stair-contact/source-boundary.mjs';
import assert from'node:assert/strict';
export const remainingImport="import {fitCuishangPlatformApproach} from './CuishangPlatformContact.js';\n",remainingCall=' fitCuishangPlatformApproach(p);\n';
export function stripCuishangRemaining(s){s=stripFanhuaRemaining(s);assert.equal(s.split(remainingImport).length,2,'unique Cuishang import');assert.equal(s.split(remainingCall).length,3,'exact two profile factory calls');return s.replace(remainingImport,'').replaceAll(remainingCall,'')}
export const frontLines=["import {addCuishangPlatformContact} from './CuishangPlatformContact.js';\n",' addCuishangPlatformContact(c);\n'];
export function stripCuishangFront(s){for(const line of frontLines){assert.equal(s.split(line).length,2,'unique Cuishang contact delta');s=s.replace(line,'')}const current='original three ground portals; central approach adjusted to retained platform support';assert.equal(s.split(current).length,2);return s.replace(current,'original three ground portals and navigation')}
