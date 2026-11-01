import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

export const WENYUAN_VERANDA_SOURCE='https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg';
export const WENYUAN_VERANDA_FIT=Object.freeze({setback:1.8,front:-8.95,back:-7.15,railHeight:1.05,railBays:Object.freeze([0,1,3,4,5]),entryBay:2});
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
const fail=()=>{throw Error('Wenyuan south veranda requires its exact augmented source');};
const plain=o=>o&&o.visible&&o.matrixAutoUpdate&&o.scale.equals(new T.Vector3(1,1,1))&&o.rotation.toArray().slice(0,3).every(v=>v===0);
const hash=g=>{let h=2166136261;for(const a of [...Object.values(g.attributes),g.index].filter(Boolean))for(const v of new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength))h=Math.imul(h^v,16777619)>>>0;return h.toString(16);};
const sameBox=(a,b)=>a.min.distanceTo(b.min)<1e-6&&a.max.distanceTo(b.max)<1e-6;
function writable(o,key){const d=Object.getOwnPropertyDescriptor(o,key);return !!d&&'value' in d&&d.writable;}
function freeData(o,key){if(!Object.isExtensible(o))return false;for(let p=o;p;p=Object.getPrototypeOf(p))if(Object.getOwnPropertyDescriptor(p,key))return false;return true;}

/** Exclusive post-augmentation finalizer. No shared source, water, floor, stair,
 * furniture or general movement rules are changed. The existing offset open
 * bay is a gameplay fit; the source photograph's closed entry is not admission. */
export function applyWenyuanSouthVeranda(kit,f){
 const g=f?.userData?.structure;
 if(g?.id!=='wenyuan-pavilion'||g.remainingProfile!=='wenyuan'||g.x!==-186.5||g.z!==-132.8||g.w!==40.5||g.d!==17.9||!f.userData.wenyuanUpperSeat||f.parent!==kit?.root||!plain(f)||!plain(kit.root)||kit.root.position.lengthSq()||f.position.x!==g.x||f.position.y||f.position.z!==g.z||!freeData(f.userData,'wenyuanSouthVeranda')||!freeData(g,'southVeranda')||Object.isFrozen(f.children)||Object.isFrozen(kit.colliders)||Object.isFrozen(kit.owned)||!Object.isExtensible(kit.colliders)||!Object.isExtensible(kit.owned)||!writable(g,'navigation')||!writable(g,'inheritedFacadeProxies')||!Object.isExtensible(f.children)||!writable(f.children,'length')||!writable(kit.colliders,'length')||!writable(kit.owned,'length')||f.add!==T.Object3D.prototype.add)fail();
 if(!Array.isArray(g.inheritedFacadeProxies)||g.inheritedFacadeProxies.some(r=>!Array.isArray(r.position)||r.position.length!==3||r.position.some(v=>!Number.isFinite(v)))||g.navigation?.interiorStairRoutes?.length!==1||!Array.isArray(g.navigation.interiorStairRoutes[0].points)||g.navigation.interiorStairRoutes[0].points.length!==10)fail();
 const panels=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('lattice_doors')&&near(m.position.y,2.0664)&&near(m.position.z,-8.95));
 const leaves=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('lattice_doors')&&near(m.position.y,2.0664)&&near(m.position.z,-7.8725));
 const heads=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('wall_red')&&near(m.position.y,4.0244)&&near(m.position.z,-8.95));
 const sills=f.children.filter(m=>m.isMesh&&m.material?.name==='wenyuan_sourced_green_wood_columns'&&near(m.position.x,-3.375)&&near(m.position.y,.61)&&near(m.position.z,-8.91));
 if(panels.length!==5||leaves.length!==2||heads.length!==1||sills.length!==1)fail();
 const specs=[...panels.map((m,i)=>[m,'closed-panel','a4834cfd',[-16.875,-10.125,3.375,10.125,16.875][i],0]),...leaves.map((m,i)=>[m,'folded-leaf','383d324d',[-6.33,-.42][i],Math.PI/2]),[heads[0],'head','9df3ebed',0,0],[sills[0],'sill','6c5d64dd',-3.375,0]];
 for(const[m,,signature,x,rot]of specs)if(!near(m.position.x,x)||m.rotation.x||m.rotation.z||!near(m.rotation.y,rot)||!m.scale.equals(new T.Vector3(1,1,1))||!m.visible||!m.matrixAutoUpdate||hash(m.geometry)!==signature||!freeData(m.userData,'wenyuanSouthVerandaMoved')||!writable(m.position,'z')||m._listeners||Object.keys(m.geometry.morphAttributes).length||m.geometry.drawRange.start||m.geometry.drawRange.count!==Infinity)fail();
 f.updateWorldMatrix(true,true);
 const sourceIndices=new Set(),proxies=[],coarsePanels=new Map();
 for(const[m,role]of specs){
  if(role==='sill')continue;
  const p=m.userData.actualComponentProxy;if(!p||p.lowerHeadMargin!==0||!writable(m.userData,'actualComponentProxy'))fail();
  const actual=new T.Box3().setFromBufferAttribute(m.geometry.attributes.position).applyMatrix4(m.matrixWorld);
  const declared=new T.Box3(new T.Vector3(...p.bounds.min),new T.Vector3(...p.bounds.max)).applyMatrix4(f.matrixWorld);if(!sameBox(actual,declared))fail();
  const b=new T.Box3(new T.Vector3(...p.bounds.min),new T.Vector3(...p.bounds.max)).applyMatrix4(f.matrixWorld),indices=kit.colliders.flatMap((c,i)=>!c.triangleSupport&&sameBox(c,b)?[i]:[]);
  if(indices.length!==1)fail();sourceIndices.add(indices[0]);proxies.push([m,p]);
 }
 for(const m of panels){const b=new T.Box3(new T.Vector3(m.position.x-3.375,.5,-9.2),new T.Vector3(m.position.x+3.375,3.5,-8.7)).applyMatrix4(f.matrixWorld),indices=kit.colliders.flatMap((c,i)=>!c.triangleSupport&&sameBox(c,b)?[i]:[]);if(indices.length!==1)fail();sourceIndices.add(indices[0]);coarsePanels.set(indices[0],new T.Box3().setFromBufferAttribute(m.geometry.attributes.position).applyMatrix4(m.matrixWorld));}
 if(sourceIndices.size!==13||[...sourceIndices].some(i=>!writable(kit.colliders,String(i))))fail();
 const shift=new T.Vector3(0,0,WENYUAN_VERANDA_FIT.setback),movedColliders=[...sourceIndices].map(i=>[i,(coarsePanels.get(i)??kit.colliders[i]).clone().translate(shift)]);
 // Build all new closed solids off-scene. Their triangle owners use exactly
 // the final Float32 positions that CourtKit's ordinary merge will publish.
 const group=new T.Group();group.name='wenyuan-south-veranda';
 const green=new T.MeshStandardMaterial({name:'wenyuan-south-veranda-green-fit',color:0x426a51,roughness:.86});
 const meshes=[],geometries=[],owners=[],railBays=[],hangingBays=[];
 const box=(role,w,h,d,x,y,z,parts)=>{const geometry=new T.BoxGeometry(w,h,d);geometries.push(geometry);geometry.translate(x,y,z);const m=new T.Mesh(geometry,green);m.name='wenyuan-south-veranda-'+role;m.castShadow=m.receiveShadow=true;m.userData.wenyuanSouthVerandaRole=role;group.add(m);meshes.push(m);parts.push(m);return m;};
 const own=(parts,id)=>{const values=[];for(const m of parts){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++){const k=ix?ix.getX(i):i;values.push(Math.fround(p.getX(k)+g.x),Math.fround(p.getY(k)),Math.fround(p.getZ(k)+g.z));}}const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(values,3));try{const shape=triangleInstance(createTriangleTemplate(geo),[0,0,0],'wenyuan-south-veranda:'+id),b=shape.box.clone();b.triangleSupport=shape;b.wenyuanSouthVeranda={role:id};owners.push(b);for(const m of parts)m.userData.wenyuanSouthVerandaOwner=shape.id;}finally{geo.dispose();}};
 try{
  for(let bay=0;bay<6;bay++){
   const x0=-20.25+bay*6.75+.357,x1=x0+6.036,width=x1-x0,cx=(x0+x1)/2,z=-8.95;
   if(bay!==2){const p=[],bottom=.56,top=1.55,t=.055;
    for(const y of[bottom,top])box('rail-horizontal',width,.075,.12,cx,y,z,p);
    const count=10,pitch=width/count;
    for(let i=0;i<=count;i++)box('rail-upright',t,top-bottom,.10,x0+i*pitch,(top+bottom)/2,z,p);
    // Repeated rectangular return/fret outlines, not a claimed carving census.
    for(let i=0;i<count;i++){const a=x0+i*pitch+t/2,b=x0+(i+1)*pitch-t/2,cy=1.055;
     for(const y of[.78,1.32])box('fret-return-horizontal',b-a,.045,.085,(a+b)/2,y,z,p);
     box('fret-return-vertical',.045,.54,.085,(a+b)/2,cy,z,p);
     box('fret-inward-short',pitch*.25,.045,.085,(a+b)/2+pitch*.125,cy,z,p);
    }
    own(p,'rail-bay-'+bay);railBays.push(bay);
   }
   const p=[],top=4.41,low=3.98;
   for(const y of[low,top])box('hanging-horizontal',width,.07,.13,cx,y,z,p);
   const count=12,pitch=width/count;
   for(let i=0;i<=count;i++)box('hanging-upright',.045,top-low,.1,x0+i*pitch,(top+low)/2,z,p);
   for(let i=0;i<count;i++){const a=x0+i*pitch+.04,b=x0+(i+1)*pitch-.04;box('hanging-fret',b-a,.045,.095,(a+b)/2,4.21,z,p);box('hanging-return',.045,.15,.095,a+.08,4.135,z,p);}
   // Short end drops show the source-supported hanging-head silhouette, not
   // invented pierced carvings or a solid sheet over an apparent opening.
   for(const x of[x0+.07,x1-.07])box('hanging-end-drop',.14,.26,.13,x,3.885,z,p);
   own(p,'hanging-bay-'+bay);hangingBays.push(bay);
  }
  // Back enclosure joints are visible green uprights, not invisible links
  // where the old generic bay-wide collision continues behind front columns.
  for(let i=0;i<=6;i++){const p=[];box('recessed-frame-post',.68,3.1328,.5,-20.25+i*6.75,2.0664,-7.15,p);own(p,'back-post-'+i);}
 }catch(error){for(const geometry of geometries)geometry.dispose();green.dispose();throw error;}
 const sourcePositions=specs.map(([m])=>m.position.toArray());
 const inherited=g.inheritedFacadeProxies.map(row=>sourcePositions.some(p=>p.every((v,i)=>near(v,row.position[i])))?{...row,position:row.position.map((v,i)=>v+(i===2?1.8:0))}:row);
 const meta={objectId:'FC-FD3D76E74D',source:WENYUAN_VERANDA_SOURCE,officialText:'https://www.dpm.org.cn/explore/building/236513.html',photographyDate:null,scope:'LOWER_SOUTH_RECESSED_VERANDA_FRET_RAILS_HANGING_SCREENS_ONLY',dimensions:'ENGINEERING_FIT_NOT_SURVEYED',setback:1.8,railBays,hangingBays,entryBay:2,entryPolicy:'EXISTING_OPEN_GAMEPLAY_BAY_RETAINED_NOT_CURRENT_VISITOR_PERMISSION',relocatedMeshes:9,relocatedOriginalColliders:13,coarsePanelBoundsTightenedToVisible:5,newTriangleOwners:owners.length,wholeObjectAccepted:false,unknown:['exact fret carving/counts','photogrammetric widths and setbacks','existing mezzanine/floor-height fidelity','complete side and rear elevations','GPU/mobile visual acceptance']};
 // Source-validated objects are all mutable plain Three objects. No original
 // geometry/material is destroyed, so commit does not trigger disposal events.
 for(const[m,role]of specs){m.position.z+=1.8;m.userData.wenyuanSouthVerandaMoved=role;}
 for(const[m,p]of proxies)m.userData.actualComponentProxy={...p,bounds:{min:p.bounds.min.map((v,i)=>v+(i===2?1.8:0)),max:p.bounds.max.map((v,i)=>v+(i===2?1.8:0))}};
 for(const[i,c]of movedColliders)kit.colliders[i]=c;
 f.add(group);kit.colliders.push(...owners);kit.owned.push(green);f.userData.wenyuanSouthVeranda=meta;g.southVeranda=meta;g.inheritedFacadeProxies=inherited;
 const route=g.navigation?.interiorStairRoutes?.[0];
 if(route?.points?.[0])g.navigation={...g.navigation,interiorStairRoutes:g.navigation.interiorStairRoutes.map((r,i)=>i?r:{...r,points:r.points.map((p,j)=>j?p:{...p,z:g.z-6.35})})};
 return meta;
}
export function finishWenyuanSouthVeranda(kit){const frames=kit.root.children.filter(f=>f.userData.structure?.id==='wenyuan-pavilion');if(!frames.length)return false;if(frames.length!==1)fail();return applyWenyuanSouthVeranda(kit,frames[0]);}
