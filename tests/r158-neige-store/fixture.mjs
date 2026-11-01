import {blank,zone,bodies} from '../r158-neige/fixture.mjs';import {buildNeigeCourt} from '../../src/scene/palace/special/NeigeCourt.js';
export {zone,bodies};
export function fixture(){const f=blank();f.main=buildNeigeCourt(f.kit,zone);return f;}
export function install(f,api){f.store=api.buildNeigeStorehouse(f.kit,zone);f.kit.root.updateMatrixWorld(true);f.cm.addColliders(f.kit.colliders,'neige-with-store');f.cm.addWalkables(f.kit.walkables,'neige-with-store');return f;}
