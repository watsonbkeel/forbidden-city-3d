import assert from 'node:assert/strict';
import {buildR52World} from './r52-world.mjs';
import {verifyTaiheInstrumentReplacement} from './r157-taihe-integration-retention.mjs';
/** Uninjected actual production World. No prototype replacement or manual installation. */
export async function buildTaiheInstrumentWorld(){
 const W=await buildR52World();
 try{
  const records=[];W.scene.traverse(o=>records.push(...(o.userData.architecture??[]).filter(p=>p.id==='axis/taihe-terrace-instruments')));
  assert.equal(records.length,1,'actual merged production must own one instrument pair');
  const a=records[0].instruments[0];
  W.instrumentReplacement=verifyTaiheInstrumentReplacement({y:a.baseY,zf:a.centerZ-1});
  return W;
 }catch(error){W.dispose();throw error;}
}
