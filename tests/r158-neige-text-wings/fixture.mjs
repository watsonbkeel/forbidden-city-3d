import {fixture as previous,zone,bodies} from '../r158-neige-west-annex/fixture.mjs';import {buildNeigeWestAnnexSegment} from '../../src/scene/palace/special/NeigeWestAnnexSegment.js';
export {zone,bodies};
export function fixture(){const f=previous();f.annex=buildNeigeWestAnnexSegment(f.kit,zone);return f;}
export function install(f,api){f.wings=api.buildNeigeTextSideWings(f.kit,zone);f.kit.root.updateMatrixWorld(true);f.cm.addColliders(f.kit.colliders,'neige-text-wings-local');f.cm.addWalkables(f.kit.walkables,'neige-text-wings-local');return f;}
