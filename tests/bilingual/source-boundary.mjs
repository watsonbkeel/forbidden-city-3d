import {fileURLToPath} from 'node:url';
import manifest from './source-delta.json' with {type:'json'};
import {createBilingualBoundary} from './source-boundary-core.mjs';
import {createBoundaryIO} from './source-boundary-io.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const boundary=createBilingualBoundary(manifest,createBoundaryIO(root,manifest));
export const {stripBilingualDelta,historicalBilingualPaths,verifyRuntimeBoundary}=boundary;
