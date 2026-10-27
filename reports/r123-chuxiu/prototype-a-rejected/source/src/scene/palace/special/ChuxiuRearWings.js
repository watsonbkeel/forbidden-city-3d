import * as THREE from 'three';
import {FACE} from '../kit.js';
import {CHUXIU_REAR_PROFILE} from './ChuxiuRearCourtFrame.js';

const materials=new WeakMap();
const fit='REVERSIBLE_PHOTO_TOPOLOGY_FIT_NOT_SURVEYED';
function palette(kit){let p=materials.get(kit);if(!p){p={green:new THREE.MeshStandardMaterial({name:'chuxiu_rear_frame_green',color:0x254c42,roughness:.85}),glass:new THREE.MeshStandardMaterial({name:'chuxiu_rear_opaque_glazing',color:0x27322f,roughness:.62})};kit.owned.push(...Object.values(p));materials.set(kit,p);}return p;}
function finishedBox(mesh){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}return new THREE.Box3().setFromPoints(points);}
function ownedBox(kit,mesh,id){const b=finishedBox(mesh);b.chuxiuRearSource={id,source:'actual-finished-box',profile:CHUXIU_REAR_PROFILE};kit.colliders.push(b);return b;}
/** Only the two approved appended buildings. Official evidence establishes the
 * three-bay pair, facing and central-door/sill-window topology. Every metre,
 * open leaf state, fine lattice and opaque glazing below is a model fit. */
export function buildChuxiuRearWing(kit,item,zone){
 const east=item.rearWing==='east',side=east?'east':'west',index=east?56:57;
 if(zone.id!=='west-six'||zone.rearCourtProfile!==CHUXIU_REAR_PROFILE||zone.items[index]!==item||item.structure!=='chuxiu-rear-wing'||item.rearCourtProfile!==CHUXIU_REAR_PROFILE||!['east','west'].includes(item.rearWing)||item.x!==(east?77:112.6)||item.z!==444.5||item.w!==9.4||item.d!==4.4||item.bays!==3||item.rot!==(east?'west':'east')||item.ph!==.45||item.pad!==.35||item.colH!==3.6||item.roof!=='gable'||item.enter!==true||item.interior!=='empty'||item.plaque!==false)throw Error('Chuxiu rear wing approved identity mismatch');
 const id=`chuxiu-rear-${side}`,p=palette(kit),start=kit.walkables.length;
 // Per-call adapter only: no shared roof default or other hall changes.
 const local=Object.create(kit);local.roof=(f,opts,x,z)=>{
  const roof=kit.roof(f,{...opts,depth:item.d,overhang:.55},x,z);
  // The common gable adds a .24m projecting hip-ridge tip beyond its tile
  // overhang. Only these two fitted roofs shorten that decorative end curve;
  // the .55m tile eave, shell and every other roof remain unchanged. Continuous
  // monotone remapping preserves the existing mesh topology (no clipped skin).
  roof.traverse(m=>{if(!m.isMesh||m.material!==kit.ridge)return;const a=m.geometry.attributes.position;let extent=0;for(let i=0;i<a.count;i++)extent=Math.max(extent,Math.abs(a.getZ(i)));if(extent<=2.83)return;for(let i=0;i<a.count;i++){const v=a.getZ(i);if(Math.abs(v)>2.55)a.setZ(i,Math.sign(v)*(2.55+(Math.abs(v)-2.55)*(2.83-2.55)/(extent-2.55)));}a.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();});
  roof.userData.chuxiuRearRidgeFit={status:fit,tileOverhang:.55,ridgeEndHalfDepth:2.83};return roof;
 };
 const solid=(f,mat,w,h,d,x,y,z,role)=>{const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mat,x,y,z);m.userData.role=role;return m;};
 const panelBuilder=({f,x,z,width,height,floorY,side:face})=>{
  if(face!==-1)throw Error('Rear window callback outside observed facade');
  const sill=.55,split=1.55,top=floorY+height;
  kit.box(f,'wall_brick',width,sill,.26,x,floorY+sill/2,z);
  solid(f,p.glass,width-.12,top-(floorY+sill)-.1,.08,x,(top+floorY+sill)/2,z,'chuxiu-rear-sill-window');
  // Two lower glazed fields and an upper lattice band, rather than a cloned
  // full-height generic door. Exact historic lattice repeats remain unknown.
  kit.box(f,'lattice_doors',width-.14,top-(floorY+split),.06,x,(top+floorY+split)/2,z-.06,'band');
  for(const q of[-1,0,1])solid(f,p.green,.07,top-floorY-sill,.16,x+q*(width/2-.035),(top+floorY+sill)/2,z-.03,'chuxiu-rear-window-frame');
  for(const y of[floorY+sill,floorY+split,top])solid(f,p.green,width,.075,.16,x,y,z-.03,'chuxiu-rear-window-frame');
  return true;
 };
 const built=local.hall({x:item.x,z:item.z,rot:FACE[item.rot],w:item.w,d:item.d,colH:item.colH,ph:item.ph,pad:item.pad,roof:'gable',roofH:1.55,hardGableEnd:true,brackets:false,bays:3,name:item.name,plaque:false,enter:true,interior:'empty',panelBuilder});
 const f=built.f;f.userData.structure={...f.userData.structure,id:`west-six/${id}`,x:item.x,z:item.z,w:item.w,d:item.d,floorY:.45,canonicalName:item.name,sourceGroup:east?63:60,status:fit,roofOverhang:.55,inventory:'UNKNOWN_NO_FURNITURE',nameboard:'UNVERIFIED_NOT_RENDERED',rearWing:side,limits:'No new ear-room entrances; back facade and dimensions are model fits; open leaves gameplay, not photographed open-state.'};
 // Register the actual rendered low platform and wooden threshold, not an
 // invisible rise. Raise only this new stone slab top to the existing visible
 // floor plane so the finished closed solid and floor have one F32 top.
 const slab=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('stone_slab')&&m.position.x===0&&m.position.z===0&&m.position.y===item.ph-.03);
 if(slab.length!==1)throw Error('Rear wing unique slab source missing');slab[0].scale.y=1.25;
 for(const m of f.children.filter(m=>m.isMesh)){
  if(m===slab[0]){ownedBox(kit,m,id+'-platform-slab');continue;}
  if(m.material===kit.lib.material('wall_brick')&&m.position.x===0&&m.position.z===0)ownedBox(kit,m,id+'-platform-brick');
  if(m.material===kit.lib.material('wood_column')&&m.position.y===.56&&m.position.z===-2.2)ownedBox(kit,m,id+'-threshold');
  if(m.material===kit.lib.material('lattice_doors')&&m.rotation.y===Math.PI/2){m.userData.role='chuxiu-rear-open-door';ownedBox(kit,m,id+'-open-leaf');}
 }
 // Two short actual steps contained within the approved .29m front projection.
 // No ramp substitutes for their finished faces; ordinary step rules unchanged.
 for(let i=0;i<2;i++){const top=.3-i*.15,m=kit.box(f,'stone_slab',2.2,top,.14,0,top/2,-(2.61+.07+i*.14));m.userData.role='chuxiu-rear-entry-step';const b=ownedBox(kit,m,id+'-step-'+i);kit.walkables.push({type:'box',box:new THREE.Box3(new THREE.Vector3(b.min.x,b.max.y,b.min.z),b.max.clone())});}
 const slabBounds=finishedBox(slab[0]);kit.walkables[start].box.min.y=kit.walkables[start].box.max.y=slabBounds.max.y;
 f.userData.structure.finishedPlatformY=slabBounds.max.y;
 const map=kit.mapItems.at(-1);map.stableId=`west-six/${id}`;map.sourceStatus=fit;map.nameVariant=east?null:'猗兰室 / 猗兰馆 (official metadata variant; plaque unverified)';
 return built;
}
