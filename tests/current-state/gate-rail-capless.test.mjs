import {after} from 'node:test';
import {stageNativeGateRails} from '../lib/gate-rail-capless-native-fixture.mjs';

// Exact capless V10/D-era and folded-ascent compatibility assertions. Current
// R157 retained rail surface/route behavior is a different claim.
const native=stageNativeGateRails();
try{
  await import(native.entry);
}catch(error){
  native.dispose();
  throw error;
}
after(native.dispose);
