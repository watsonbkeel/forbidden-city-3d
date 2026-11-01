import test from 'node:test';
import {runR157Historical} from '../../lib/r157-historical-runner.mjs';

// Keep the original independent preservation contract byte-for-byte in the
// historical sibling; the live integration is checked separately, never omitted.
test('wumen-wing-pavilion-instances: complete independent candidate preservation contract',t=>{
  t.diagnostic(runR157Historical(new URL('./wumen-wing-pavilion-instances.historical.mjs',import.meta.url),'wings'));
});
