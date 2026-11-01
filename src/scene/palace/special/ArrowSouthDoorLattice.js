import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// The building's own south photo resolves oblique, dark wood-coloured upper
// door lattice in the two secondary bays. This is ONLY a low-poly directional
// cue: the intricate linghua pattern, exact member count and hidden backs are
// unresolved. The existing plain opaque leaf boards deliberately remain, with
// shallow dark upper-surface cues; no transparency or openwork is inferred.
export const ARROW_SOUTH_LATTICE_FIT=Object.freeze({
  entityId:'FC-AF36D75128',role:'arrow-south-secondary-diagonal-lattice',
  bays:Object.freeze([1,3]),leavesPerBay:4,leafCount:8,
  leafCountStatus:'RETAINED_MODEL_COUNT_NOT_SOURCE_COUNT',
  bottomAbovePlatform:2.05,topAbovePlatform:4.35,
  pitch:.42,barWidth:.035,depth:.06,frontZ:-6.90,
  dimensionStatus:'PHOTO_FIT_NOT_SURVEYED',
  patternStatus:'DIAGONAL_DIRECTION_CUE_NOT_LITERAL_LINGHUA_PATTERN',
  visualAcceptance:'VERIFY_PENDING',wholeObjectAccepted:false,captureDate:null,
  source:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg',
  sourceSha256:'e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225',
});
const fail=reason=>{throw Error('Arrow south lattice '+reason);};
const near=(a,b)=>Math.abs(a-b)<1e-7;
const at=(m,x,y,z)=>near(m.position.x,x)&&near(m.position.y,y)&&near(m.position.z,z)&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0&&m.scale.x===1&&m.scale.y===1&&m.scale.z===1;
// Failure cleanup must attempt every private resource even if a disposal listener
// itself throws. Preserve the initiating error and report secondary failures.
function disposalFailures(resources){
  const failures=[];
  for(const resource of new Set(resources.filter(Boolean)))try{resource.dispose();}catch(e){failures.push(e);}
  return failures;
}
function discardStage(geometries,materials,error){
  const failures=disposalFailures([...geometries,...materials]);
  if(failures.length)throw new AggregateError([error,...failures],error.message,{cause:error});
  throw error;
}
const boxIs=(m,w,h,d)=>m.geometry?.type==='BoxGeometry'&&near(m.geometry.parameters.width,w)&&near(m.geometry.parameters.height,h)&&near(m.geometry.parameters.depth,d);

// Intersect a finite diagonal strip with the rectangular leaf infill. Clipping
// the actual polygon (not only its centreline) prevents protruding bar corners.
function clip(poly,axis,limit,sign){
  const out=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],da=sign*(a[axis]-limit),db=sign*(b[axis]-limit),ina=da<=1e-10,inb=db<=1e-10;
    if(ina)out.push(a);
    if(ina!==inb){const t=da/(da-db);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  }
  return out;
}
function latticeGeometry(width,height){
  const p=ARROW_SOUTH_LATTICE_FIT,parts=[],extent=width+height+2;let geometry;
  try{
    const n=Math.ceil((width+height)/(2*p.pitch));
    for(const direction of[-1,1])for(let k=-n;k<=n;k++){
      const c=k*p.pitch,half=p.barWidth/Math.SQRT2;
      let poly=[[-extent,direction*-extent+c-half],[extent,direction*extent+c-half],[extent,direction*extent+c+half],[-extent,direction*-extent+c+half]];
      for(const [axis,limit,sign]of[[0,-width/2,-1],[0,width/2,1],[1,-height/2,-1],[1,height/2,1]])poly=clip(poly,axis,limit,sign);
      if(poly.length<3)continue;
      const area=poly.reduce((s,a,i)=>{const b=poly[(i+1)%poly.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
      if(Math.abs(area)<1e-9)continue;
      if(area<0)poly.reverse();
      const g=new THREE.ExtrudeGeometry(new THREE.Shape(poly.map(([x,y])=>new THREE.Vector2(x,y))),{depth:p.depth,steps:1,bevelEnabled:false,curveSegments:1});
      g.translate(0,0,-p.depth/2);parts.push(g);
    }
    geometry=mergeGeometries(parts,false);if(!geometry)fail('could not merge clipped strips');
  }catch(error){discardStage(parts,[geometry],error);}
  const failures=disposalFailures(parts);
  if(failures.length)discardStage([geometry],[],new AggregateError(failures,failures[0].message,{cause:failures[0]}));
  return geometry;
}

/** Replaces exactly 64 old decorative cues on eight retained closed leaves.
 * No colliders, openings, stair supports, rooms, knees or shared material edits.
 * All identity/host checks precede geometry allocation or source disposal.
 * A retired-resource notification failure is explicitly post-commit: the error
 * has committed=true, cleanupPhase and result. It does NOT mean rollback.
 */
export function applyArrowSouthDoorLattice(kit,frame,item){
  const p=ARROW_SOUTH_LATTICE_FIT;
  const expected={name:'箭亭',kind:'hall',structure:'enclosed-pavilion',enclosureProfile:'arrow-enclosed-gallery-fit-v1',x:-154.7,z:78.8,w:31.5,d:17.6,colH:8,ph:.9,pad:1,bays:5,roof:'xieshan',enter:true,open:false};
  if(!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||(item.rot!==undefined&&item.rot!==0))fail('requires exact retained identity and envelope');
  if(!frame?.isGroup||!Array.isArray(kit?.owned)||typeof kit.mesh!=='function')fail('requires existing kit and host');
  if(frame.parent!==kit.root||!at(frame,item.x,0,item.z))fail('requires exact untransformed host frame');
  if(!Object.isExtensible(frame.children)||!Object.isExtensible(kit.owned))fail('requires mutable child and ownership arrays');
  if(frame.children.some(m=>[p.role,'arrow-south-secondary-dark-infill'].includes(m.userData.role)))fail('already installed');
  if(frame.children.filter(m=>m.userData.role==='arrow-south-central-knee').length!==2)fail('requires retained south central knees host');
  const old=[],leaves=[],A=13.75,bayWidth=5.5,lw=(bayWidth-.36)/4,h=4.5,gridWidth=lw-.09,gridHeight=h*.6,gridY=item.ph+h*.65;
  function exactly(predicate,label){const found=frame.children.filter(predicate);if(found.length!==1)fail('requires exact '+label+' host');return found[0];}
  for(const bay of p.bays)for(let i=0;i<4;i++){
    const x=-A+bay*bayWidth+.18+(i+.5)*lw;
    exactly(m=>m.isMesh&&m.userData.role==='arrow-door-leaf'&&m.material?.name==='arrow_wood_fit'&&at(m,x,item.ph+h/2,-6.8)&&boxIs(m,lw-.025,h,.14),'closed leaf');
    leaves.push({x,width:gridWidth,bay,leafIndex:i});
    for(let k=1;k<5;k++){
      old.push(exactly(m=>m.isMesh&&m.userData.role==='arrow-plain-lattice'&&m.material?.name==='arrow_yellow_fit'&&at(m,x-gridWidth/2+k*gridWidth/5,gridY,-6.8)&&boxIs(m,gridWidth*.018,gridHeight,.18),'vertical grid'));
      old.push(exactly(m=>m.isMesh&&m.userData.role==='arrow-plain-lattice'&&m.material?.name==='arrow_yellow_fit'&&at(m,x,gridY-gridHeight/2+k*gridHeight/5,-6.8)&&boxIs(m,gridWidth,gridHeight*.018,.18),'horizontal grid'));
    }
  }
  if(new Set(old).size!==64)fail('requires 64 distinct old grid hosts');
  const priorChildren=[...frame.children],priorOwned=[...kit.owned],childArray=frame.children,ownedArray=kit.owned;
  const geometries=[],members=[];let material,backingMaterial;
  try{
    for(const leaf of leaves)geometries.push(latticeGeometry(leaf.width,p.topAbovePlatform-p.bottomAbovePlatform));
    for(const leaf of leaves)geometries.push(new THREE.BoxGeometry(leaf.width,p.topAbovePlatform-p.bottomAbovePlatform,.008));
    material=new THREE.MeshStandardMaterial({name:'arrow_south_secondary_lattice_fit',color:0x623d2d,roughness:.82,metalness:0});
    backingMaterial=new THREE.MeshStandardMaterial({name:'arrow_south_secondary_infill_fit',color:0x242725,roughness:.9,metalness:0});
    for(let i=0;i<leaves.length;i++){
      const leaf=leaves[i],member=new THREE.Mesh(geometries[i],material);
      member.position.set(leaf.x,item.ph+(p.bottomAbovePlatform+p.topAbovePlatform)/2,p.frontZ);member.castShadow=member.receiveShadow=true;
      member.name=p.role;member.userData={...p,leaf:{...leaf},directions:[-1,1],surfaceStatus:'SHALLOW_RELIEF_ON_RETAINED_OPAQUE_PLAIN_BOARD_NOT_OPENWORK',nonTargetState:'UNCHANGED',navigation:'EXACT_OLD_COLLIDERS_AND_REGISTRATIONS'};
      const backing=new THREE.Mesh(geometries[leaves.length+i],backingMaterial);backing.position.set(leaf.x,member.position.y,-6.875);backing.castShadow=backing.receiveShadow=true;
      backing.name='arrow-south-secondary-dark-infill';backing.userData={...member.userData,role:backing.name,surfaceStatus:'OPAQUE_DARK_SURFACE_CUE_NOT_GLASS_OPENWORK_OR_MEASURED_SHADOW'};
      members.push(backing,member);
    }
  }catch(error){discardStage(geometries,[material,backingMaterial],error);}
  // All sixteen meshes and both materials are staged OFFLINE. Ownership,
  // attachment and every old detach form one rollback-capable live commit.
  // No retained geometry is disposed until all eventful mutations succeed.
  try{
    kit.owned.push(material,backingMaterial);frame.add(...members);
    for(const m of old)m.removeFromParent();
  }catch(error){
    // Avoid add/remove hooks and events while repairing the failed mutation:
    // they may be the very operations/listeners that threw after changing state.
    for(const m of members){const parent=m.parent;if(parent){const i=parent.children.indexOf(m);if(i!==-1)Array.prototype.splice.call(parent.children,i,1);}m.parent=null;}
    const retained=new Set(priorChildren);
    for(const child of childArray)if(!retained.has(child)&&child.parent===frame)child.parent=null;
    for(const child of priorChildren){const parent=child.parent;if(parent&&parent!==frame){const i=parent.children.indexOf(child);if(i!==-1)Array.prototype.splice.call(parent.children,i,1);}child.parent=frame;}
    frame.children=childArray;kit.owned=ownedArray;
    Array.prototype.splice.call(childArray,0,childArray.length,...priorChildren);
    Array.prototype.splice.call(ownedArray,0,ownedArray.length,...priorOwned);
    discardStage(geometries,[material,backingMaterial],error);
  }
  const result={...p,replacedMeshes:old.length,leafCount:leaves.length,addedMeshes:members.length};
  // The live change is now committed. Retirement is NOT rollback-capable, but
  // one throwing dispose notification must not strand the other old resources.
  const cleanupErrors=disposalFailures(old.map(m=>m.geometry));
  if(cleanupErrors.length){
    const error=new AggregateError(cleanupErrors,'Arrow south lattice committed; retired geometry cleanup failed',{cause:cleanupErrors[0]});
    Object.assign(error,{code:'ARROW_LATTICE_COMMITTED_CLEANUP_ERROR',committed:true,cleanupPhase:'RETIRED_GEOMETRY_AFTER_COMMIT',result});
    throw error;
  }
  return result;
}
