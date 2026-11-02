import {fromBase} from './base.mjs';const prev=await import(fromBase('tests/r158-neige-east-ear/fixture.mjs'));const ear=await import(fromBase('src/scene/palace/special/NeigeEastTextAnnex.js'));export const{zone,bodies}=prev;
export function fixture(){const f=prev.fixture();f.ear=ear.buildNeigeEastTextAnnex(f.kit,zone);return f;}
export function install(f,api){f.second=api.buildNeigeSecondStorehouse(f.kit,zone);f.kit.root.updateMatrixWorld(true);f.cm.addColliders(f.kit.colliders,'second-store-local');f.cm.addWalkables(f.kit.walkables,'second-store-local');return f;}
