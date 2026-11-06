import {xiangxuHistoricalComparisonIO,historicalXiangxuPaths} from '../r166-xiangxu-gate/source-boundary.mjs';
import {fileURLToPath} from 'node:url';
import manifest from './source-delta.json' with {type:'json'};
import {createBilingualBoundary} from './source-boundary-core.mjs';
import {createBoundaryIO} from './source-boundary-io.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const boundary=createBilingualBoundary(manifest,xiangxuHistoricalComparisonIO(createBoundaryIO(root,manifest)));
export const {stripBilingualDelta,verifyRuntimeBoundary}=boundary;
export const historicalBilingualPaths=paths=>boundary.historicalBilingualPaths(historicalXiangxuPaths(paths));
