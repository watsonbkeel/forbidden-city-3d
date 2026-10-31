import test from 'node:test';
import {runWidthPredecessor} from '../../lib/wumen-side-portal-historical-runner.mjs';
test('historical wumen-main-object-state contract remains exact on the hash-locked width predecessor',()=>runWidthPredecessor(new URL('./wumen-main-object-state.before-width.historical.mjs',import.meta.url)));
