import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='fori-fanhua-shared-stone-stair',done=new WeakSet();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable&&Object.keys(a).filter(k=>/^\d+$/.test(k)).every(k=>Object.getOwnPropertyDescriptor(a,k)?.writable);
const rigid=m=>m.matrixAutoUpdate===true&&m.matrixWorldAutoUpdate===true&&m.quaternion.equals(new T.Quaternion())&&m.scale.equals(new T.Vector3(1,1,1));
const near=(a,b)=>Math.abs(a-b)<1e-9;
function boxPayload(width,height,depth){
 const position=[],normal=[],uv=[],index=[],groups=[];
 const planes=[['z','y','x',-1,-1,depth,height,width],['z','y','x',1,-1,depth,height,-width],['x','z','y',1,1,width,depth,height],['x','z','y',1,-1,width,depth,-height],['x','y','z',1,-1,width,height,depth],['x','y','z',-1,-1,width,height,-depth]];
 for(const [face,[u,v,w,udir,vdir,pw,ph,pd]] of planes.entries()){
  for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){const p={x:0,y:0,z:0},n={x:0,y:0,z:0};p[u]=(ix*pw-pw/2)*udir;p[v]=(iy*ph-ph/2)*vdir;p[w]=pd/2;n[w]=pd>0?1:-1;position.push(p.x,p.y,p.z);normal.push(n.x,n.y,n.z);uv.push(ix,1-iy);}
  const a=face*4;index.push(a,a+2,a+1,a+2,a+3,a+1);groups.push({start:face*6,count:6,materialIndex:face});
 }
 return{position:new Float32Array(position),normal:new Float32Array(normal),uv:new Float32Array(uv),index:new Uint16Array(index),groups};
}

function isBox(g,w,h,d){
 if(!g||Object.keys(g.attributes).sort().join(',')!=='normal,position,uv'||Object.keys(g.morphAttributes).length||g.drawRange.start!==0||g.drawRange.count!==Infinity)return false;
 const p=boxPayload(w,h,d);for(const k of['position','normal','uv']){const a=g.attributes[k];if(a?.isInterleavedBufferAttribute||a?.array.constructor!==Float32Array||a.itemSize!==(k==='uv'?2:3)||a.normalized||a.array.length!==p[k].length||a.array.some((v,i)=>!Object.is(v,p[k][i])))return false}
 return g.index?.array.constructor===Uint16Array&&g.index.count===36&&g.index.array.every((v,i)=>v===p.index[i])&&JSON.stringify(g.groups)===JSON.stringify(p.groups);
}
function validate(kit,z){
 const root=kit?.root;
 if(!root||root.name!=='ningshou'||root.parent||!rigid(root)||root.position.lengthSq()||!root.matrix.equals(new T.Matrix4())||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||JSON.stringify(z.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}'||done.has(kit)||root.children.some(f=>f.userData.structure?.id===ID))throw Error('Exact mutable shared-stair source required, once only');
 const frames=[];
 for(const[key,id,name,x,zz,w,d,upper]of[['fori','place-ningshou-2318b5f73b','佛日楼',-319.8,513.3,11.5,8.9,3.7],['fanhua','place-ningshou-d40cef5893','梵华楼',-340,511.05,25.8,8.6,3.85]]){
  if(z.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===zz&&i.w===w&&i.d===d&&i.ph===.5&&i.colH===7).length!==1)throw Error('Exact shared-stair identity anchor changed');
  const f=root.children.filter(f=>f.userData.structure?.id===id);if(f.length!==1)throw Error('Exact shared-stair hall source absent');const q=f[0],p=q.userData.structure;
  if(q.parent!==root||!rigid(q)||!q.position.equals(new T.Vector3(x,0,zz))||!mutable(q.children)||p.key!==key||p.localW!==w||p.localD!==d||p.upperFloorY!==upper)throw Error('Exact shared-stair hall source transform changed');frames.push(q);
 }
 function source(f,name,pos,dims,material,contact){
  const ms=f.children.filter(m=>m.name===name&&near(m.position.x,pos[0])&&near(m.position.y,pos[1])&&near(m.position.z,pos[2]));if(ms.length!==1)throw Error('Exact shared-stair target source absent');const m=ms[0];
  if(!m.isMesh||m.parent!==f||Object.getOwnPropertyDescriptor(m,'parent')?.writable!==true||!rigid(m)||!isBox(m.geometry,...dims)||m.material?.name!==material)throw Error('Exact shared-stair target geometry/material source changed');
  let n=0;root.traverse(q=>{if(q.isMesh&&q.geometry===m.geometry)n++});if(n!==1)throw Error('Shared target source geometry must not be disposed');
  let col=null;if(contact){const lo=pos.map((v,i)=>v-dims[i]/2),hi=pos.map((v,i)=>v+dims[i]/2);lo[0]+=f.position.x;lo[2]+=f.position.z;hi[0]+=f.position.x;hi[2]+=f.position.z;const cs=kit.colliders.filter(c=>['x','y','z'].every((k,i)=>near(c.min[k],lo[i])&&near(c.max[k],hi[i])));if(cs.length!==1||Object.keys(cs[0]).some(k=>!['isBox3','min','max'].includes(k)))throw Error('Exact shared-stair source contact changed');col=cs[0]}
  return{m,col,f};
 }
 const [fori,fanhua]=frames;
 const wallF=source(fori,'fori-gable-enclosure',[-5.75,5.425,.55],[.22,3.45,7.8],'r48_ningshou_red_fit',true),wallH=source(fanhua,'fanhua-gable-enclosure',[12.9,5.5,.55],[.22,3.3,7.5],'r48_ningshou_red_fit',true),altar=source(fori,'fori-fori-upper-side-offering-outline',[-5.1,3.93,0],[.65,.46,4.6],'r48_ningshou_wood_fit',true),edge=source(fori,'fori-altar-upper-edge',[-5.1,4.185,0],[.69,.05,4.64],'r48_ningshou_gold_fit',false);
 const floors=[];let stone;
 for(const f of frames){for(const m of f.children.filter(m=>m.userData.role==='upper-floor-slab')){const p=m.geometry?.parameters;if(!p||!rigid(m)||m.parent!==f||!isBox(m.geometry,p.width,.18,p.depth)||!near(m.position.y+.09,f.userData.structure.upperFloorY))throw Error('Exact retained upper floor source changed');floors.push({m,f})}const ms=f.children.filter(m=>m.userData.role==='platform-paving');if(ms.length!==1||ms[0].material?.name!=='r48_ningshou_stone_fit')throw Error('Exact shared stone source absent');if(stone&&stone!==ms[0].material)throw Error('Shared stone source changed');stone=ms[0].material}
 if(floors.filter(q=>q.f===fori).length!==1||floors.filter(q=>q.f===fanhua).length!==33)throw Error('Exact retained floor slab count changed');
 return{frames,wallF,wallH,altar,edge,targets:[wallF,wallH,altar,edge],floors,stone};
}
/** Source attests a shared east stair. Ascent direction, steps, side apertures
 * and levels are retained-envelope circulation fits, never a measured plan. */
export function buildForiFanhuaStair(kit,zone){
 if(zone?.id!=='ningshou')return false;const s=validate(kit,zone),frame=new T.Group(),geometries=[],colliders=[],walkables=[];frame.name='佛日楼至梵华楼共用石梯';frame.userData.foriFanhuaStair=true;
 const own=g=>(geometries.push(g),g);
 function box(name,mat,x0,y0,z0,x1,y1,z1,{solid=true,walk=false}={}){const g=own(new T.BufferGeometry()),p=boxPayload(x1-x0,y1-y0,z1-z0);g.setIndex(new T.BufferAttribute(p.index,1));for(const k of['position','normal','uv'])g.setAttribute(k,new T.BufferAttribute(p[k],k==='uv'?2:3));for(const q of p.groups)g.addGroup(q.start,q.count,q.materialIndex);const m=new T.Mesh(g,mat);m.name=ID+'/'+name;m.userData={foriFanhuaStair:true,role:name,fitNotSurvey:true};m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.castShadow=m.receiveShadow=true;frame.add(m);const b=new T.Box3(new T.Vector3(x0,y0,z0),new T.Vector3(x1,y1,z1));if(name==='fitted-side-door-head'||name.startsWith('retained-gable-')){const shape=triangleInstance(createTriangleTemplate(g),m.position.toArray(),ID+'/'+name+'/'+x0);b.copy(shape.box);b.triangleSupport=shape}b.foriFanhuaStair=true;b.foriFanhuaMesh=m.name;if(solid)colliders.push(b);if(walk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,foriFanhuaStair:true,foriFanhuaMesh:m.name})}return m}
 try{
  for(const [target,x0,x1,z0,z1,y0,y1,door0,door1]of[[s.wallF,-325.66,-325.44,509.95,517.75,3.7,7.15,510.05,511.35],[s.wallH,-327.21,-326.99,507.85,515.35,3.85,7.15,508.1,509.5]]){const mat=target.m.material;box('retained-gable-south',mat,x0,y0,z0,x1,y1,door0);box('retained-gable-north',mat,x0,y0,door1,x1,y1,z1);box('fitted-side-door-head',mat,x0,y0+2.6,door0,x1,y1,door1)}
  box('retained-offering-outline-clearance-fit',s.altar.m.material,-325.225,3.7,511.3,-324.575,4.16,515.6);
  box('retained-offering-outline-top-fit',s.edge.m.material,-325.245,4.16,511.28,-324.555,4.21,515.62,{solid:false});
  for(let i=0;i<25;i++){const h=3.85*(i+1)/25,z1=518.3-i*.252;box('stone-tread-'+i,s.stone,-326.965,0,z1-.252,-325.685,h,z1,{walk:true});
   // Guard only the outside portions beyond either retained gable. The walls
   // themselves bound the remaining narrow flight, with no invisible side rail.
   if(i>=3&&z1>515.35)box('west-exposed-stair-side-'+i,s.stone,-327.06,h,z1-.252,-326.99,h+.82,z1);
   if(i>=3&&z1>517.75)box('east-exposed-stair-side-'+i,s.stone,-325.755,h,z1-.252,-325.685,h+.82,z1);
  }
  box('upper-stone-landing',s.stone,-326.965,3.67,508,-325.685,3.85,512.05,{walk:true});
  box('fanhua-side-threshold',s.stone,-327.35,3.67,508.1,-326.9,3.85,509.5,{walk:true});box('fori-side-threshold',s.stone,-325.75,3.52,510.05,-325.25,3.7,511.35,{walk:true});
  box('south-landing-guard',s.stone,-326.965,3.85,507.98,-325.685,4.67,508.05);
  for(const {m,f}of s.floors){const p=m.geometry.parameters,x=f.position.x+m.position.x,z=f.position.z+m.position.z,y=f.userData.structure.upperFloorY,b=new T.Box3(new T.Vector3(x-p.width/2,y,z-p.depth/2),new T.Vector3(x+p.width/2,y,z+p.depth/2));walkables.push({type:'box',box:b,rescue:false,foriFanhuaStair:true,retainedFloorMesh:m.uuid})}
 }catch(e){for(const g of geometries)g.dispose();throw e}
 const meta={id:ID,name:'佛日楼至梵华楼共用石梯',parentObjectIds:['FC-2318B5F73B','FC-D40CEF5893'],wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236573.html',planSource:'https://www.dpm.org.cn/building/talk/223559.html',sourcePages:[87,88],scope:'SHARED_STAIR_AND_FITTED_SIDE_ENTRIES_TO_RETAINED_UPPER_SLABS',fit:{steps:25,width:1.28,groundNorthZ:518.3,upperSouthZ:512,landingSouthZ:508,landingY:3.85,foriFloorY:3.7,fanhuaFloorY:3.85,foriOpening:[510.05,511.35],fanhuaOpening:[508.1,509.5],unverifiedOfferingOutlineSouthTrim:.30},supported:['A shared stone stair east of Fori links its upper floor with Fanhua','Plan locates the stair lengthwise between two closely spaced buildings'],fitted:['Ascent direction,25treads, exact widths/levels and door positions','Plain exposed-edge guards and shortened south end of the prior unverified low offering outline','No replicated historic stone ornament or door-leaf pose'],retained:['Hall positions, existing roofs, columns, front rails and all six Fanhua floor voids','Ground map/teleport targets, profiles and all non-target rooms/furnishings'],notVerified:['Current visitor permission and exact original side-door pattern','Full upper inventory, every possible jump trajectory, World, browser/GPU/mobile'],supersedes:'Prior view-only/no-fitted-stair metadata remains a historical record; this bounded connection registers only real existing floor tops',newMapItems:0,newTeleportTargets:0};frame.userData.structure=meta;
 const removedMeshes=s.targets.map(q=>q.m),removedContacts=s.targets.flatMap(q=>q.col?[q.col]:[]);for(const q of s.targets){q.f.remove(q.m);if(q.col)kit.colliders.splice(kit.colliders.indexOf(q.col),1)}kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);done.add(kit);for(const m of removedMeshes)m.geometry.dispose();return{frame,meta,colliders,walkables,removedMeshes,removedContacts,geometries};
}
