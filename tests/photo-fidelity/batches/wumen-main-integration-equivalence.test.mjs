import test from 'node:test';
import {runWidthPredecessor} from '../../lib/wumen-main-width-historical-runner.mjs';
test('historical wumen-main-integration-equivalence contract remains exact on the hash-locked width predecessor',()=>runWidthPredecessor(new URL('./wumen-main-integration-equivalence.before-width.historical.mjs',import.meta.url)));
