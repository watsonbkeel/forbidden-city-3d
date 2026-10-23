// Pure existing-W consumer: no building, loading, mutation, installation, or
// registrations. Geometry rays test the supplied merged scene, not metadata alone.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {LAYOUT} from '../../src/config/constants.js';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {WUMEN_NORTHEAST_PAVILION_ID as ID,WUMEN_NORTHEAST_NORTH_COLUMN_FIT as fit} from '../../src/scene/palace/special/WumenPavilionColumns.js';
const shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
function displayed(hit){const m=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex??0]:hit.object.material;return shown(hit.object)&&m?.visible!==false&&m?.colorWrite!==false&&(!m.transparent||m.opacity>0);}
const near=(a,b)=>Math.abs(a-b)<2e-5;
export function assertWumenNortheastColumnsInWorld(W) {
 assert.ok(W?.scene?.isScene&&Array.isArray(W.cm?.colliders),'Supply an existing W.scene and W.cm');
 const records=[];
 W.scene.traverse(o=>{for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r?.id===ID)records.push({o,r});});
 assert.equal(records.length,1,'one existing northeast pavilion identity, not four mirrored instances');
 const {o:owner,r}=records[0];assert.ok(shown(owner));assert.equal(r.parentId,'FC-86C9330D65');assert.equal(r.northColumnCount,6);assert.deepEqual(r.northColumnXs,[...fit.xs]);
 const z=LAYOUT.WUMEN_Z, probes=[];
 const rayAt=x=>new THREE.Raycaster(new THREE.Vector3(-47.7+x,13.8,z+1.5),new THREE.Vector3(0,0,-1),0,2.4).intersectObject(W.scene,true).filter(displayed);
 for(const x of fit.xs){const hits=rayAt(x);assert.ok(hits.length,'actual north column triangles missing');const h=hits[0];assert.match(solidMaterialNameAt(h.object,h.faceIndex),/^wood_column(?:_material)?$/);assert.ok(h.point.z-z>-.26&&h.point.z-z<-.23,'front surface belongs to the north column row');probes.push({x,hit:h.point.toArray()});}
 // Old axes are only ~0.13 m from new axes, inside the new shaft radius:
 // a ray at an old axis is NOT an absence test. Count actual north-row
 // triangles and repeated cap-center vertices instead of making that mistake.
 const centers=new Map();let northTriangles=0;
 W.scene.traverse(m=>{if(!m.isMesh||!shown(m))return;const g=m.geometry,p=g.attributes.position,idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){if(!/^wood_column(?:_material)?$/.test(solidMaterialNameAt(m,i/3)))continue;
   const vs=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld));
   if(!vs.every(v=>v.x>=-53.5&&v.x<=-41.9&&v.y>=12.3-2e-5&&v.y<=18.9+2e-5&&Math.abs(v.z-(z-.5))<=.263))continue;
   northTriangles++;
   for(const v of vs)if(near(v.y,12.3)&&near(v.z,z-.5)){const key=v.x.toFixed(4);centers.set(key,(centers.get(key)??0)+1);}
  }
 });
 assert.equal(northTriangles,6*48,'six actual cylinders only, without ghost triangles');
 const actualCenters=[...centers].filter(([,n])=>n>=10).map(([x])=>Number(x)).sort((a,b)=>a-b);
 assert.equal(actualCenters.length,6);actualCenters.forEach((x,i)=>assert.ok(Math.abs(x-(-47.7+fit.xs[i]))<.0001,'actual cap center matches registered axis'));
 const lower=[-53.2,12.3,z-11.5],upper=[-42.2,15.3,z-.5];
 const whole=W.cm.colliders.filter(c=>lower.every((v,i)=>near(c.box.min.toArray()[i],v))&&upper.every((v,i)=>near(c.box.max.toArray()[i],v)));
 assert.equal(whole.length,1,'the actual existing whole low-body envelope must remain registered once');
 for(let i=0;i<fit.xs.length-1;i++)assert.equal(W.cm.checkCollision(new THREE.Vector3(-47.7+(fit.xs[i]+fit.xs[i+1])/2,14,z-1),.1),true,'this refinement does not open between-column access');
 const contacts=[];
 for(const x of fit.xs){const hits=new THREE.Raycaster(new THREE.Vector3(-47.7+x,12.32,z-.5),new THREE.Vector3(0,-1,0),0,.04).intersectObject(W.scene,true).filter(displayed);const deck=hits.find(h=>/^stone_slab(?:_material)?$/.test(solidMaterialNameAt(h.object,h.faceIndex))&&near(h.point.y,12.3));assert.ok(deck,'actual retained deck below each base');contacts.push(deck.point.toArray());}
 return {scope:'ONE_MERGED_INSTANCE_AND_RETAINED_BODY_ENVELOPE_NOT_BROWSER_ACCEPTANCE',instanceId:ID,northTriangles,actualCenters,probes,actualDeckContacts:contacts,wholeBodyEnvelope:{min:whole[0].box.min.toArray(),max:whole[0].box.max.toArray()}};
}
