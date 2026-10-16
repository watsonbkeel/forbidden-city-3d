import assert from 'node:assert/strict';
import {shenwuTowerGeometry} from '../../src/scene/palace/special/GateTowerProfiles.js';

// Restore exactly the two replaced plaque slots for comparison with unchanged
// V9/V10 geometry goldens. No other object is omitted, relabelled or rebuilt.
export function restoreGatePlaques(c,name){
  const isWumen=name==='午门',index=isWumen?30:151;
  const id=isWumen?'wumen-south-gate-name-plaque':'shenwu-north-institution-plaque';
  const candidates=c.group.children.filter(m=>m.userData.gatePlaque);
  assert.equal(candidates.length,1,'Exactly one scoped V12 object may be restored');
  const plaque=candidates[0];assert.equal(c.group.children[index],plaque);
  assert.equal(plaque.name,id);assert.equal(plaque.userData.gatePlaque.id,id);
  assert.equal(plaque.userData.gatePlaque.text,isWumen?'午門':'故宫博物院');
  assert.equal(plaque.userData.gatePlaque.side,isWumen?'south':'north');
  assert.equal(plaque.userData.noMerge,true);assert.equal(plaque.material.length,2);
  assert.equal(plaque.material[0].map,null);assert.ok(plaque.material[1].map?.isCanvasTexture);
  const expected=isWumen?[0,23.47933751306165,-10.728]:[0,8.4,13.31];
  plaque.position.toArray().forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-10,'Only the finite model-fit placement is accepted'));
  if(isWumen){
    const dimensions=plaque.userData.gatePlaque.dimensions;
    assert.ok(Math.abs(dimensions.width-2.9730545454545454)<1e-10);
    assert.ok(Math.abs(dimensions.height-3.3033939393939393)<1e-10);
    assert.equal(dimensions.depth,.12);
    assert.equal(plaque.userData.gatePlaque.mount.kind,'source-proportioned-fixed-reviewed-mount');
    assert.equal(plaque.userData.gatePlaque.mount.surfaceProbeCount,7);
  }
  assert.deepEqual(plaque.scale.toArray(),[1,1,1]);
  assert.deepEqual(plaque.rotation.toArray(),[0,isWumen?Math.PI:0,0,'XYZ']);
  const copy=c.group.clone(true),legacy=c.builder.plaqueMesh(isWumen?'午门':'神武门',isWumen?2:1.6,isWumen?3.2:2.6,true);
  const dm=c.data.dimensions,tower=shenwuTowerGeometry();
  legacy.position.set(0,isWumen?dm.platformHeight+.3+9:15.5,isWumen?-dm.depth/2-.5:-tower.enclosure.innerZ-tower.T/2-.15);
  legacy.rotation.y=Math.PI;
  const removed=copy.children[index];copy.remove(removed);copy.add(legacy);
  copy.children.splice(copy.children.indexOf(legacy),1);copy.children.splice(index,0,legacy);
  copy.updateMatrixWorld(true);
  return {...c,group:copy};
}
