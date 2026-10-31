// Read-only consumer of the parent's existing production W. Does not construct
// a scene, allocate/repair geometry, add support, teleport, or start a browser.
import assert from 'node:assert/strict';
import * as T from 'three';
function visible(hit){
 for(let o=hit.object;o;o=o.parent)if(!o.visible)return false;
 const m=hit.object.material;return !Array.isArray(m)&&m.visible!==false&&(!m.transparent||m.opacity>0);
}
export function assertTaihemenSouthCeilingInWorld(W){
 assert.ok(W?.scene&&W?.cm,'Pass existing W.scene and W.cm; ceiling consumer does not build W');
 const root=W.scene.getObjectByName('太和门');assert.ok(root,'existing Taihemen ceiling host missing');
 root.updateWorldMatrix(true,true);
 const records=(root.userData.architecture??[]).filter(r=>r.id==='axis/taihemen-south-ceiling');
 assert.equal(records.length,1,'one current ceiling record');const p=records[0].profile;
 assert.equal(p.entityId,'FC-B3B12CF397');assert.equal(p.accepted,false);
 assert.equal(p.fullHallReconstructed,false);assert.equal(p.exactPanelCountVerified,false);
 assert.deepEqual(p.bays,[1,2,3,4,5,6,7]);
 const floor=3.44,ox=root.position.x,oz=root.position.z,bayW=48.06/9,z=oz+(p.minZ+p.maxZ)/2;
 const cast=(x,zz)=>new T.Raycaster(new T.Vector3(x,floor+2,zz),new T.Vector3(0,1,0),0,10).intersectObject(root,true).filter(visible)[0];
 let minimumRecess=Infinity,secondaryFrameProbes=0;
 for(const bay of p.bays){
  const x=ox-48.06/2+(bay+.5)*bayW;
  const field=cast(x+p.cellWidth*.2,z+p.cellDepth*.2),grid=cast(x+p.cellWidth*.5,z+p.cellDepth*.2);
  assert.equal(field?.object.material.name,'taihemen-south-ceiling-field',`visible ceiling field bay ${bay}`);
  assert.ok(Math.abs(field.point.y-p.fieldBottom)<1e-5,'ceiling field physical height');
  assert.ok(grid?.object.material.name==='taihemen-south-ceiling-trim','visible ceiling frame trim missing');
  const recess=field.point.y-grid.point.y;assert.ok(recess>.06,'ceiling grid must physically descend below field');minimumRecess=Math.min(minimumRecess,recess);
  // Probe the real downstand underside outside each narrow gold strip. Rays
  // respect geometry.drawRange, unlike a bounding box over unused attributes.
  const clearWidth=bayW-p.primaryWidth,clearDepth=p.maxZ-p.minZ-.6,offset=p.secondaryWidth*.35;
  const secondary=(xx,zz)=>{
   const h=cast(xx,zz);assert.equal(h?.object.material.name,'taihemen-south-ceiling-frame','visible secondary coffer frame missing');
   assert.ok(Math.abs(h.point.y-p.gridBottom)<1e-5,'secondary frame physical underside missing');secondaryFrameProbes++;
  };
  for(let ix=1;ix<p.columnsPerBay;ix++)secondary(x-clearWidth/2+ix*p.cellWidth+offset,z+p.cellDepth*.2);
  for(let iz=1;iz<p.rowsPerBay;iz++)secondary(x+p.cellWidth*.2,z-clearDepth/2+iz*p.cellDepth+offset);
  assert.equal(W.cm.checkCollision(new T.Vector3(x,floor+1.7,oz+p.minZ),.5),false,'ceiling must not block south porch');
 }
 for(let axis=1;axis<=8;axis++){
  const h=cast(ox-48.06/2+axis*bayW,z);
  assert.equal(h?.object.material.name,'taihemen-south-ceiling-frame','visible transverse ceiling frame missing');
  assert.ok(Math.abs(h.point.y-(floor+p.minimumHeadroom))<1e-5,'ceiling primary depth changed');
 }
 const frames=[];root.traverse(m=>{if(m.isMesh&&m.material.name==='taihemen-south-ceiling-frame')frames.push(m);});
 assert.equal(frames.length,1,'one actual merged ceiling frame material');
 const bounds=new T.Box3().setFromObject(frames[0]);
 assert.ok(Math.abs(bounds.min.z-(oz+p.minZ))<1e-5&&Math.abs(bounds.max.z-(oz+p.maxZ))<1e-5,'ceiling frame detached from its eave / inner row');
 assert.ok(bounds.min.y-floor>4.1,'ceiling frame legal jump/head clearance');
 return {fieldProbes:7,primaryFrameProbes:8,secondaryFrameProbes,minimumRecess,minimumHeadroom:bounds.min.y-floor,
  scope:'SOUTH_PORCH_TOPOLOGY_FIT_ONLY_NO_BROWSER_OR_WHOLE_HALL_ACCEPTANCE'};
}
