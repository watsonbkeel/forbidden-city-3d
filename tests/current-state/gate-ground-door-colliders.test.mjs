import {after} from 'node:test';
import {stageNativeGateGroundDoors} from '../lib/gate-ground-door-native-fixture.mjs';

// Original six-leaf-per-gate contract, not the current R157 Wumen foliation.
// The default-open current route and intentional closed A/B are separate.
const native=stageNativeGateGroundDoors();
try{
  await import(native.entry);
}catch(error){
  native.dispose();
  throw error;
}
after(native.dispose);
