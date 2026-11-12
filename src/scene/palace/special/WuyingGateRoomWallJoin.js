import * as T from 'three';
import {createWuyingGateRoomBodies} from './WuyingGateRooms.js';
const ANCHORS={"0":{"kind":"gate","name":"武英门","x":220.8,"z":-249.8,"style":"hall","w":34.9,"gateKind":"five-bay","structureStatus":"official-topology-reversible-model-fit","southGateProfile":"wuying"},"1":{"kind":"courtWalls","x0":185,"x1":256,"z0":-249.8,"z1":-152,"gates":[{"side":"s","at":220.8,"gate":"武英门"}]},"4":{"kind":"hall","name":"凝道殿","x":192.2,"z":-228.7,"rot":"west","w":27.4,"d":12.3,"pad":0.5,"ph":0.45,"colH":5.76,"roof":"gable","brackets":false,"map":"hall","bays":5,"interior":"empty","throne":false},"5":{"kind":"hall","name":"焕章殿","x":250.6,"z":-228.9,"rot":"east","w":26.7,"d":10.2,"pad":0.5,"ph":0.45,"colH":5.76,"roof":"gable","brackets":false,"map":"hall","bays":5,"interior":"empty","throne":false}};
const BOUNDS={"x0": 178.05, "x1": 382, "z0": -355.24, "z1": 529.9};
const ID='wuying-gate-duty-room-wall-join';
const equal=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const ka=Object.keys(a),kb=Object.keys(b);return ka.length===kb.length&&ka.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));};
const IDENTITY_MATRIX=new T.Matrix4();
const mutableArray=a=>Array.isArray(a)&&!Object.isFrozen(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const identity=r=>r?.isGroup&&r.parent===null&&r.matrixAutoUpdate===true&&r.matrixWorldAutoUpdate===true&&r.matrix.equals(IDENTITY_MATRIX)&&r.matrixWorld.equals(IDENTITY_MATRIX)&&r.position.lengthSq()===0&&r.rotation.x===0&&r.rotation.y===0&&r.rotation.z===0&&r.scale.equals(new T.Vector3(1,1,1));
// One Float32 ULP at these world coordinates. Hidden interface overlap only,
// not a new gate gap or a design clearance. Prevents positive cracks on merge.
const SEAM=2**-16;
export function buildWuyingGateRoomWallJoin(kit,item,zone,resolved){
 if(zone?.id!=='outer-west'||zone.items?.indexOf(item)!==1)return false;
 if(!equal(zone.bounds,BOUNDS)||Object.entries(ANCHORS).some(([i,a])=>!equal(zone.items[i],a))||!equal(resolved,{x0:185,x1:256,z0:-249.8,z1:-152,gates:[{side:'s',at:220.8,w:34.9}]}))throw Error('Changed Wuying wall/gate/neighbour source records');
 const arrays=['colliders','owned','walkables','rooms','mapItems'];
 if(!identity(kit?.root)||kit.root.name!=='outer-west'||kit.root.userData[ID]||kit.root.children.some(f=>f.userData.structure?.id?.startsWith('wuying-gate-'))||arrays.some(k=>!mutableArray(kit[k]))||!mutableArray(kit.root.children)||!Object.isExtensible(kit.root.userData)||typeof kit.wall!=='function')throw Error('Invalid or duplicate Wuying registration host');
 const stage=Object.create(kit);stage.root=new T.Group();stage.root.name=kit.root.name;stage.colliders=[];stage.owned=[];
 let body;const beforeChildren=[...kit.root.children],lengths=Object.fromEntries(arrays.map(k=>[k,kit[k].length]));
 try{
  body=createWuyingGateRoomBodies();
  const e=new T.Box3().setFromObject(body.frames[0]),w=new T.Box3().setFromObject(body.frames[1]);
  const segments=[[e.max.x-SEAM,-249.8,203.35,-249.8],[238.25,-249.8,w.min.x+SEAM,-249.8],[185,e.max.z-SEAM,185,-152],[256,w.max.z-SEAM,256,-152],[185,-152,256,-152]];
  for(const [index,s]of segments.entries()){const n=stage.root.children.length,c=stage.colliders.length;stage.wall(...s);for(const f of stage.root.children.slice(n))f.userData.wuyingWallJoin={id:ID,segment:index,unchangedNorth:index===4};for(const b of stage.colliders.slice(c))b.wuyingWallJoin={id:ID,segment:index};}
  for(const f of body.frames){f.userData.structure={...f.userData.structure,productionIntegrated:true,registration:'SCOPED_WALL_REPLACEMENT_MODEL_FIT_VISUAL_REVIEW_PENDING',floatSeamOverlap:SEAM};}
  // Adoption happens only after all geometry and physics have been built.
  stage._builtFrames=[...stage.root.children];
  const additions=[...stage._builtFrames,...body.frames];
  for(const f of additions)kit.root.add(f);
  kit.colliders.push(...stage.colliders,...body.colliders);kit.owned.push(...body.materials);
  kit.root.userData[ID]={status:'MODEL_FIT_VISUAL_REVIEW_PENDING',original397Delta:0,segments,gateOpening:[203.35,238.25],floatSeamOverlap:SEAM};
  return true;
 }catch(error){
  // Restore host even if an Object3D added-event threw during partial adoption.
  for(const f of [...kit.root.children])if(!beforeChildren.includes(f)){const i=kit.root.children.indexOf(f);if(i>=0)kit.root.children.splice(i,1);f.parent=null;}
  for(const k of arrays)kit[k].length=lengths[k];delete kit.root.userData[ID];
  const seen=new Set();for(const f of [...stage.root.children,...kit.root.children.filter(f=>!beforeChildren.includes(f))])f.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}});
  // Staged frames adopted before failure are no longer in stage.root.
  for(const f of stage._builtFrames??[])f.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}});
  body?.dispose();throw error;
 }
}
