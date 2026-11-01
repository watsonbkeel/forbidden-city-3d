import {bindChengqianRearEntry} from '../../../controls/ChengqianRearAccess.js';
import * as THREE from 'three';
import {FACE} from '../kit.js';
const CHENGQIAN_REAR_PROFILE='chengqian-rear-court-r125';

const materials=new WeakMap();
const fit='REVERSIBLE_PHOTO_TOPOLOGY_FIT_NOT_SURVEYED';
function palette(kit){let p=materials.get(kit);if(!p){p={green:new THREE.MeshStandardMaterial({name:'chengqian_rear_frame_red',color:0x8e3027,roughness:.85}),glass:new THREE.MeshStandardMaterial({name:'chengqian_rear_opaque_glazing',color:0x555f5b,roughness:.62})};kit.owned.push(...Object.values(p));materials.set(kit,p);}return p;}
function finishedBox(mesh){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}return new THREE.Box3().setFromPoints(points);}
function ownedBox(kit,mesh,id){const b=finishedBox(mesh);b.chengqianRearSource={id,source:'actual-finished-box',profile:CHENGQIAN_REAR_PROFILE};kit.colliders.push(b);return b;}
/** Only the two approved appended buildings. Official evidence establishes the
 * three-bay pair, facing and central-door/sill-window topology. Every metre,
 * open leaf state, fine lattice and opaque glazing below is a model fit. */
export function buildChengqianRearWing(kit,item,zone){
 const east=item.rearWing==='east',side=east?'east':'west',index=east?56:57;
 if(zone.id!=='east-six'||zone.items[index]!==item||item.kind!=='hall'||item.name!==(east?'承乾宫后东配殿':'承乾宫后西配殿')||item.map!=='hall'||item.structure!=='chengqian-rear-wing'||item.rearCourtProfile!==CHENGQIAN_REAR_PROFILE||!['east','west'].includes(item.rearWing)||item.x!==(east?-111.2:-76)||item.z!==396.05||item.w!==8.2||item.d!==4.4||item.bays!==3||item.rot!==(east?'west':'east')||item.ph!==.45||item.pad!==.35||item.colH!==3.3||item.roof!=='gable'||item.enter!==true||item.interior!=='empty'||item.plaque!==false)throw Error('Chengqian rear wing approved identity mismatch');
 const id=`chengqian-rear-${side}`,p=palette(kit),start=kit.walkables.length;
 // Per-call adapter only: no shared roof default or other hall changes.
 const local=Object.create(kit);local.roof=(f,opts,x,z)=>{
  const roof=kit.roof(f,{...opts,depth:item.d,overhang:.55},x,z);
  // The common gable adds a .24m projecting hip-ridge tip beyond its tile
  // overhang. Only these two fitted roofs shorten that decorative end curve;
  // the .55m tile eave, shell and every other roof remain unchanged. Continuous
  // monotone remapping preserves the existing mesh topology (no clipped skin).
  roof.traverse(m=>{if(!m.isMesh||m.material!==kit.ridge)return;const a=m.geometry.attributes.position;let extent=0;for(let i=0;i<a.count;i++)extent=Math.max(extent,Math.abs(a.getZ(i)));if(extent<=2.83)return;for(let i=0;i<a.count;i++){const v=a.getZ(i);if(Math.abs(v)>2.55)a.setZ(i,Math.sign(v)*(2.55+(Math.abs(v)-2.55)*(2.83-2.55)/(extent-2.55)));}a.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();});
  roof.userData.chengqianRearRidgeFit={status:fit,tileOverhang:.55,ridgeEndHalfDepth:2.83};return roof;
 };
 const solid=(f,mat,w,h,d,x,y,z,role)=>{const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mat,x,y,z);m.userData.role=role;return m;};
 const panelBuilder=({f,x,z,width,height,floorY,side:face})=>{
  if(face!==-1)throw Error('Rear window callback outside observed facade');
  const sill=.55,top=floorY+height,bottom=floorY+sill;
  kit.box(f,'wall_brick',width,sill,.26,x,floorY+sill/2,z);
  solid(f,p.glass,width-.12,top-bottom-.1,.08,x,(top+bottom)/2,z,'chengqian-rear-sill-window');
  // Source-attested red rectangular grilles; repeat count is a schematic fit,
  // not the front-wing generic full-height door or a copied inscription.
  for(let i=0;i<=8;i++)solid(f,p.green,.045,top-bottom,.12,x-width/2+i*width/8,(top+bottom)/2,z-.03,'chengqian-rear-window-grid');
  for(let i=0;i<=6;i++)solid(f,p.green,width,.045,.12,x,bottom+i*(top-bottom)/6,z-.03,'chengqian-rear-window-grid');
  return true;
 };
 const ceilingBuilder=({f,w,d,y,z})=>{
  // The existing visible ceiling underside stays at the same datum/UV. A
  // small actual timber-panel thickness above it supplies a closed finite
  // head-contact source for jumping in these two new rooms only.
  const g=new THREE.BoxGeometry(w,.04,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++)if(n.getY(i)===-1)uv.setXY(i,p.getX(i)/w+.5,p.getZ(i)/d+.5);
  const m=kit.mesh(f,g,kit.lib.material('caihua_beam'),0,y+.02,z);m.userData.role='chengqian-rear-ceiling-panel';ownedBox(kit,m,id+'-ceiling');
 };
 const built=local.hall({x:item.x,z:item.z,rot:FACE[item.rot],w:item.w,d:item.d,colH:item.colH,ph:item.ph,pad:item.pad,roof:'gable',roofH:1.35,hardGableEnd:true,brackets:false,bays:3,name:item.name,plaque:false,enter:true,interior:'empty',panelBuilder,ceilingBuilder});
 const f=built.f;f.userData.structure={...f.userData.structure,id:`east-six/${id}`,x:item.x,z:item.z,w:item.w,d:item.d,floorY:.45,canonicalName:item.name,sourceGroup:east?164:165,status:fit,roofOverhang:.55,inventory:'UNKNOWN_NO_FURNITURE',nameboard:'UNVERIFIED_NOT_RENDERED',rearWing:side,limits:'No new ear-room entrances; back facade and dimensions are model fits; open leaves gameplay, not photographed open-state.'};
 // Register the actual rendered low platform and wooden threshold, not an
 // invisible rise. Raise only this new stone slab top to the existing visible
 // floor plane so the finished closed solid and floor have one F32 top.
 const slab=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('stone_slab')&&m.position.x===0&&m.position.z===0&&m.position.y===item.ph-.03);
 if(slab.length!==1)throw Error('Rear wing unique slab source missing');slab[0].scale.y=1.25;
 for(const m of f.children.filter(m=>m.isMesh)){
  if(m===slab[0]){bindChengqianRearEntry(ownedBox(kit,m,id+'-platform-slab'),side);continue;}
  if(m.material===kit.lib.material('wall_brick')&&m.position.x===0&&m.position.z===0)ownedBox(kit,m,id+'-platform-brick');
  if(m.material===kit.lib.material('wood_column')&&m.position.y===.56&&m.position.z===-2.2)ownedBox(kit,m,id+'-threshold');
 }
 // The photographed central four leaves are shown folded in two pairs for
 // gameplay. Four separately closed leaves share the former two-leaf envelope;
 // this open-state is not a claim about museum public access.
 const leaves=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('lattice_doors')&&m.rotation.y===Math.PI/2);
 if(leaves.length!==2)throw Error('New Chengqian pair requires two template open leaves');
 for(const [i,m]of leaves.entries()){
  m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new THREE.Vector3()),part=(size.x-.018)/2;
  for(const j of[-1,1]){
   const z=m.position.z+j*(part/2+.009),bottom=m.position.y-size.y/2,skirt=size.y*.32;
   const lo=solid(f,p.green,size.z,skirt,part,m.position.x,bottom+skirt/2,z,'chengqian-rear-leaf-skirt');ownedBox(kit,lo,id+'-leaf-skirt-'+i+'-'+j);
   const hi=kit.box(f,'lattice_doors',part,size.y-skirt,size.z,0,0,0,'band');hi.rotation.y=Math.PI/2;hi.position.set(m.position.x,bottom+skirt+(size.y-skirt)/2,z);hi.userData.role='chengqian-rear-open-leaf';ownedBox(kit,hi,id+'-leaf-upper-'+i+'-'+j);
  }
  m.removeFromParent();m.geometry.dispose();
 }
 // Two short actual steps contained within the approved .29m front projection.
 // No ramp substitutes for their finished faces; ordinary step rules unchanged.
 for(let i=0;i<2;i++){const top=.3-i*.15,m=kit.box(f,'stone_slab',2.2,top,.14,0,top/2,-(2.61+.07+i*.14));m.userData.role='chengqian-rear-entry-step';const b=ownedBox(kit,m,id+'-step-'+i);kit.walkables.push({type:'box',box:new THREE.Box3(new THREE.Vector3(b.min.x,b.max.y,b.min.z),b.max.clone())});}
 const slabBounds=finishedBox(slab[0]);kit.walkables[start].box.min.y=kit.walkables[start].box.max.y=slabBounds.max.y;
 f.userData.structure.finishedPlatformY=slabBounds.max.y;
 const map=kit.mapItems.at(-1);map.stableId=`east-six/${id}`;map.sourceStatus=fit;map.nameVariant=null;
 return built;
}
