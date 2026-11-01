import {fromBase} from './base.mjs';
const prev=await import(fromBase('tests/r158-neige-text-wings/fixture.mjs'));const wing=await import(fromBase('src/scene/palace/special/NeigeTextSideWings.js'));
export const {zone,bodies}=prev;
export function fixture(){const f=prev.fixture();f.wings=wing.buildNeigeTextSideWings(f.kit,zone);return f;}
export function install(f,api){f.ear=api.buildNeigeEastTextAnnex(f.kit,zone);f.kit.root.updateMatrixWorld(true);f.cm.addColliders(f.kit.colliders,'neige-east-text-ear-local');f.cm.addWalkables(f.kit.walkables,'neige-east-text-ear-local');return f;}
