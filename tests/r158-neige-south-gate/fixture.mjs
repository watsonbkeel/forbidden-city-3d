import {blank,zone,bodies} from '../r158-neige/fixture.mjs';import {buildNeigeCourt} from '../../src/scene/palace/special/NeigeCourt.js';import {buildNeigeStorehouse} from '../../src/scene/palace/special/NeigeStorehouse.js';
export {zone,bodies};
export function fixture(){const f=blank();f.main=buildNeigeCourt(f.kit,zone);f.store=buildNeigeStorehouse(f.kit,zone);return f;}
export function install(f,api){f.gate=api.buildNeigeSouthConnectingGate(f.kit,zone);f.kit.root.updateMatrixWorld(true);f.cm.addColliders(f.kit.colliders,'neige-gate-local');f.cm.addWalkables(f.kit.walkables,'neige-gate-local');return f;}
