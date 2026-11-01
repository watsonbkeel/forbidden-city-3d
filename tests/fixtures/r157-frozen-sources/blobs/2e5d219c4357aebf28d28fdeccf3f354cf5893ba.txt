import {registerLijingRoomScope,registeredLijingFloor,LIJING_FLOOR,LIJING_ROOM_ID} from '../../../controls/LijingRoomSupport.js';
import * as THREE from 'three';
import {furnishRoom} from '../interiors.js';

const fail=s=>{throw Error('Lijing west room: '+s)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const geometrySame=(a,b)=>a.type===b.type&&same(a.parameters,b.parameters)&&same(a.index?[...a.index.array]:null,b.index?[...b.index.array]:null)&&Object.keys(a.attributes).length===Object.keys(b.attributes).length&&Object.entries(a.attributes).every(([k,v])=>b.attributes[k]&&same([...v.array],[...b.attributes[k].array]));
/** Reversible photographic fit, not measured partition orientation. The museum
 * identifies the west secondary room; the camera's compass bearing is unknown. */
export function applyLijingWestRoom(kit,zone,index,item,built){
 if(zone!=='west-six'||index!==24)return built;
 if(item.name!=='储秀宫后殿'||item.rearHallProfile!=='lijingxuan'||item.x!==94.5||item.z!==450.2||item.w!==26.2||item.d!==12.9||item.ph!==.45||item.bays!==5||item.roof!=='gable'||built.f.parent!==kit.root||built.f.getObjectByName('lijing-west-room'))fail('identity or duplicate');
 const f=built.f;f.updateWorldMatrix(true,true);
 const bay=item.w/5,r={x0:-item.w/2+.35,x1:-item.w/2+5*bay-.35,z0:-item.d/2+.3,z1:item.d/2-.3,y:item.ph,h:item.colH-THREE.MathUtils.clamp(item.colH*.12,.45,.85),doorX:-item.w/2+2.5*bay,backDoor:false};
 const refs=[],boxes=[],recorder={interiorMaterials:()=>kit._interiorMats,mesh(_f,geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);refs.push(m);return m},col(_f,x0,y0,z0,x1,y1,z1){boxes.push(new THREE.Box3(new THREE.Vector3(x0,y0,z0),new THREE.Vector3(x1,y1,z1)).applyMatrix4(f.matrixWorld))}};
 let targets,colliders,room;
 try{
  furnishRoom(recorder,null,'hall',r,1);if(refs.length!==8||boxes.length!==8)fail('legacy inventory changed');
  targets=refs.map(ref=>{const hits=f.children.filter(m=>m.isMesh&&m.material===ref.material&&same(m.position.toArray(),ref.position.toArray())&&geometrySame(m.geometry,ref.geometry)&&Object.keys(m.userData).length===0);if(hits.length!==1)fail('legacy exact mesh missing/duplicate');return hits[0]});
  colliders=boxes.map(box=>{const hits=kit.colliders.filter(b=>b.isBox3&&b.equals(box));if(hits.length!==1)fail('legacy exact collider missing/duplicate');return hits[0]});
  const ownedGeometry=new Set(targets.map(m=>m.geometry));let shared=false;kit.root.traverse(m=>{if(m.isMesh&&!targets.includes(m)&&ownedGeometry.has(m.geometry))shared=true});if(shared||ownedGeometry.size!==8)fail('borrowed legacy geometry');
  const rooms=kit.rooms.filter(r=>r.name===item.name&&r.floorY===.45&&r.min.x===81.75&&r.max.x===107.25&&r.min.z===443.75&&r.max.z===456.65);if(rooms.length!==1||rooms[0].cover.length!==2)fail('legacy navigation record');room=rooms[0];
 }finally{for(const m of refs)m.geometry.dispose()}
 if(!registeredLijingFloor({walkables:kit.walkables},{kind:'lijing-west-room',id:LIJING_ROOM_ID,floor:LIJING_FLOOR,minX:96.2,maxX:103.2,minZ:444.8,maxZ:453.2},99,448,.5)||Object.isFrozen(f.children)||Object.isFrozen(kit.colliders)||Object.isFrozen(room))fail('immutable or missing floor source');
 // All destructive changes follow complete identity/ownership checks. Shared
 // kit materials are retained, only the eight exclusive preset meshes leave.
 for(const m of targets){m.removeFromParent();m.geometry.dispose()}for(const b of colliders)kit.colliders.splice(kit.colliders.indexOf(b),1);room.cover=[];
 const group=new THREE.Group();group.name='lijing-west-room';f.add(group);group.userData={source:'https://img.dpm.org.cn/Uploads/Picture/dc/18013%5B1024%5D.jpg',orientationStatus:'REVERSIBLE_MODEL_FIT_NOT_SURVEY',cameraFit:'Facing model north; no compass bearing asserted',legacyRemovedMeshes:8,legacyRemovedColliders:8,roomBoundsLocal:[2.62,7.86,-5.2,2.3],unknownOtherRooms:true};
 const mat=(name,color,roughness=.75,metalness=0)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness,metalness});kit.owned.push(m);return m};
 const wood=mat('lijing_dark_wood',0x342016,.65),wall=mat('lijing_ivory_wall',0xe1dac7),cloth=mat('lijing_white_cloth',0xeee9db,.95),mirror=mat('lijing_opaque_mirror',0x8a9590,.18,.65),rug=mat('lijing_rug',0xffffff,.95);
 const floor=.45;const boxesAdded=[];
 const box=(role,m,x0,x1,y0,y1,z0,z1,solid=true,parent=group)=>{const mesh=kit.mesh(parent,new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);mesh.name=role;mesh.userData.role=role;if(solid){mesh.updateWorldMatrix(true,false);mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);for(const v of[b.min,b.max])for(const axis of['x','y','z'])v[axis]=Math.fround(v[axis]);kit.colliders.push(b);boxesAdded.push(b)}return mesh};
 const B=(role,m,x0,x1,y0,y1,z0,z1,solid=true,parent)=>box(role,m,x0,x1,floor+y0,floor+y1,z0,z1,solid,parent);
 // Full source-guided wall composition. Curved opening heads use 18 small
 // constant-width closed cells per opening: same visible and physical solid,
 // no broad proxy filling a true opening and no new general triangle solver.
 const partition=new THREE.Group();partition.name='paired-curved-openings';group.add(partition);
 const left=2.62,right=7.86,z0=2.18,z1=2.34,holes=[[3.19,4.55],[5.93,7.29]];
 for(const[a,b]of[[left,holes[0][0]],[holes[0][1],holes[1][0]],[holes[1][1],right]])B('partition-wall',wall,a,b,0,3.65,z0,z1,true,partition);
 for(const[a,b]of holes)for(let i=0;i<18;i++){const x0=a+(b-a)*i/18,x1=a+(b-a)*(i+1)/18,t=(i+.5)/18;const top=2.25+.34*Math.sin(Math.PI*t)+.045*Math.sin(5*Math.PI*t);B('curved-head-cell',wall,x0,x1,top,3.65,z0,z1,true,partition);B('curved-dark-trim',wood,x0,x1,top,top+.065,z0-.022,z0,true,partition)}
 for(const x of[left,right,...holes.flat()])B('partition-post',wood,x-.035,x+.035,0,3.65,z0-.025,z0,true,partition);
 for(const y of[3.02,3.58])B('partition-beam',wood,left,right,y,y+.09,z0-.026,z0,true,partition);
 B('central-mirror',mirror,4.68,5.80,.86,2.84,z0-.018,z0);
 for(const[a,b,c,d]of[[4.60,4.68,.78,2.92],[5.80,5.88,.78,2.92],[4.60,5.88,.78,.86],[4.60,5.88,2.84,2.92]])B('mirror-frame',wood,a,b,c,d,z0-.055,z0,true);
 // Side walls are fitted to the nominal west-secondary bay. East access is a
 // 1.8m clear opening from the unchanged central hall; original south windows remain.
 B('side-wall',wall,7.80,7.92,0,3.65,-5.2,2.34);for(const[a,b]of[[-5.2,-4.8],[-3.0,2.34]])B('entry-side-wall',wall,2.56,2.68,0,3.65,a,b);
 B('entry-header',wood,2.56,2.68,2.7,3.65,-4.8,-3.0);
 B('room-ceiling',wall,2.56,7.92,3.65,3.73,-5.2,2.34);
 for(const y of[.08,3.1])B('side-wood-rail',wood,7.755,7.80,y,y+.08,-5.2,2.18);
 // Closed cupboard/cabinet main mass and an open upper rack, no reflected
 // clock/flower inventory is invented from the museum mirror.
 B('side-cabinet',wood,2.74,3.34,0,.94,.50,1.92);B('cabinet-cornice',wood,2.72,3.36,.94,1.04,.45,1.97);
 for(const z of[.55,1.82])B('cabinet-rack-post',wood,3.20,3.265,1.04,2.28,z,z+.065);
 for(const y of[1.55,2.25])B('cabinet-rack-shelf',wood,2.76,3.32,y,y+.06,.52,1.90);
 B('cabinet-rack-mirror',mirror,2.78,2.80,1.1,2.23,.62,1.75);
 // Console is parallel to the fitted right wall in the image, beyond the
 // actual east-side entrance opening, with a clear 1m body approach to each arch.
 B('long-console',wood,2.74,3.23,.80,.90,-2.65,-.55);for(const x of[2.77,3.11])for(const z of[-2.55,-.75])B('console-leg',wood,x,x+.08,0,.80,z,z+.08);
 // Main dining composition, modest count based on visible chairs only.
 B('dining-table',wood,4.68,6.10,.77,.86,-2.65,-.40);
 for(const x of[4.75,5.93])for(const z of[-2.52,-.60])B('table-leg',wood,x,x+.09,0,.77,z,z+.09);
 B('white-tablecloth',cloth,4.63,6.15,.86,.89,-2.70,-.35);
 for(const[a,b]of[[4.63,4.66],[6.12,6.15]])B('cloth-hanging-side',cloth,a,b,.48,.86,-2.70,-.35);
 for(const[a,b]of[[-2.70,-2.67],[-.38,-.35]])B('cloth-hanging-end',cloth,4.66,6.12,.48,.86,a,b);
 for(const[x,z]of[[6.75,-1.85],[5.45,.12]]){B('dining-chair',wood,x-.23,x+.23,.43,.49,z-.23,z+.23);for(const dx of[-.20,.15])for(const dz of[-.20,.15])B('chair-leg',wood,x+dx,x+dx+.05,0,.43,z+dz,z+dz+.05);B('chair-back',wood,x-.23,x+.23,.49,1.02,z+.18,z+.23)}
 const size=128,pixels=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=(x%32-16)/16,v=(y%32-16)/16,r=Math.hypot(u,v),a=Math.atan2(v,u),petal=Math.abs(r-(.47+.12*Math.cos(8*a)))<.065,border=Math.min(x,y,size-1-x,size-1-y)<5;const c=border?[184,146,83]:petal?[205,192,146]:r<.12?[85,106,91]:[139,65,58],k=(y*size+x)*4;pixels.set([...c,255],k)}
 const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,3);texture.needsUpdate=true;rug.map=texture;let freed=false;rug.addEventListener('dispose',()=>{if(!freed){freed=true;texture.dispose()}});
 const rugGeo=new THREE.PlaneGeometry(4.86,7.30);rugGeo.rotateX(-Math.PI/2);const rm=kit.mesh(group,rugGeo,rug,5.24,.474,-1.46);rm.name='room-rug';rm.userData.role='room-rug';
 registerLijingRoomScope(boxesAdded[0],kit.walkables);
 group.userData.newBoxCount=boxesAdded.length;group.userData.limitations=['Photographic compass direction/partition positions are reversible fits.','Stepped-cell curved heads and plain cabinet/cloth shapes are simplified, not carved replicas.','Opaque mirror has no real-time reflection; no copied photograph texture.','Other Lijing rooms remain unverified; removed generic preset is not evidence of historic emptiness.'];
 f.userData.structure={...f.userData.structure,interiorStatus:'PARTIAL_SOURCE_GUIDED_WEST_SECONDARY_ROOM_MODEL_FIT'};room.inventoryStatus='PARTIAL_SOURCE_GUIDED_WEST_SECONDARY_ROOM';
 return built;
}
