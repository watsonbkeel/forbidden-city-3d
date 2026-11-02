import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yangxingzhai-source-fit',done=new WeakSet();
export const YANGXINGZHAI_FIT=Object.freeze({x:62,z:443,mainBays:7,returnBays:Object.freeze([3,3]),bounds:Object.freeze([53.3,0,434.9,64.9,9.1,451.1])});
export function buildYangxingZhai(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(0,0,0);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=typeof mat==='string'?staged.box(f,mat,w,h,d,x,y,z):staged.mesh(f,new T.BoxGeometry(w,h,d),mat,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.yangxingzhaiStoneTop=true;return m;};
  const roofVertices=[];
  const add=(role,a,b,c)=>roofVertices.push(...a,...b,...c);
  const quad=(role,a,b,c,d)=>{add(role,a,b,c);add(role,a,c,d)};
  const solid=(role,x0,x1,y0,y1,z0,z1)=>box(role,role.includes('rail')||role.includes('column')?'wood_column':'wall_red',x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
const roofPoly=[[54.1,435.5],[64.3,435.5],[64.3,450.5],[54.1,450.5],[54.1,446.3],[59.7,446.3],[59.7,439.7],[54.1,439.7]];
const inside=(x,z)=>x>=54.1&&x<=64.3&&z>=435.5&&z<=450.5&&(x>=59.7||z<=439.7||z>=446.3);
function distance(x,z,a,c){const dx=c[0]-a[0],dz=c[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz)}
const y=(x,z)=>7.2+Math.min(1.4,Math.min(...roofPoly.map((a,i)=>distance(x,z,a,roofPoly[(i+1)%roofPoly.length])))*1.4/2.3);
const subdiv=vals=>{const r=[];for(let i=0;i<vals.length-1;i++){const n=Math.ceil((vals[i+1]-vals[i])/.25);for(let k=0;k<n;k++)r.push(vals[i]+(vals[i+1]-vals[i])*k/n)}r.push(vals.at(-1));return r};const xs=subdiv([54.1,59.7,64.3]),zs=subdiv([435.5,439.7,446.3,450.5]);let cells=0;
for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=xs[i],X=xs[i+1],z=zs[j],Z=zs[j+1];if(!inside((x+X)/2,(z+Z)/2))continue;cells++;const v=[[x,y(x,z),z],[X,y(X,z),z],[X,y(X,Z),Z],[x,y(x,Z),Z]];quad('continuous-hip-top',v[0],v[3],v[2],v[1]);quad('continuous-hip-under',...v.map(v=>[v[0],v[1]-.12,v[2]]));}
for(let i=0;i<roofPoly.length;i++){const a=roofPoly[i],c=roofPoly[(i+1)%roofPoly.length];quad('continuous-eave-edge',[a[0],7.2,a[1]],[c[0],7.2,c[1]],[c[0],7.08,c[1]],[a[0],7.08,a[1]]);}
const wallPoly=[[54.6,436],[63.8,436],[63.8,450],[54.6,450],[54.6,446.8],[60.2,446.8],[60.2,439.2],[54.6,439.2]];
for(let i=0;i<wallPoly.length;i++){const a=wallPoly[i],c=wallPoly[(i+1)%wallPoly.length];if(a[0]===c[0])solid('two-level-closed-shell',a[0]-.1,a[0]+.1,0,7.2,Math.min(a[1],c[1]),Math.max(a[1],c[1]));else solid('two-level-closed-shell',Math.min(a[0],c[0]),Math.max(a[0],c[0]),0,7.2,a[1]-.1,a[1]+.1);}
stone('platform','wall_brick',9,.2,14.8,58.4,.1,443);stone('front-step','stone_slab',.4,.1,2.4,53.7,.05,443);
// Complete front-facing upper gallery solids are included in this static
// silhouette; no gallery extension on the hidden outer north/back faces.
for(const [z0,z1,x]of[[436,439.2,54.6],[446.8,450,54.6],[439.2,446.8,60.2]]){solid('upper-front-gallery-deck',x-.5,x+.12,3.82,3.98,z0,z1);solid('upper-front-gallery-rail',x-.48,x-.36,4.65,4.8,z0,z1);for(let z=z0;z<=z1+.01;z+=1.6)solid('upper-front-gallery-column',x-.47,x-.23,3.98,7.2,z-.1,z+.1);}
for(const z of[439.2,446.8]){const sign=z<443?1:-1;solid('upper-inner-gallery-deck',54.6,60.2,3.82,3.98,Math.min(z,z+sign*.5),Math.max(z,z+sign*.5));solid('upper-inner-gallery-rail',54.6,60.2,4.65,4.8,z+sign*.4-.06,z+sign*.4+.06);for(let x=54.6;x<=60.2+.01;x+=1.6)solid('upper-inner-gallery-column',x-.1,x+.1,3.98,7.2,z+sign*.35-.12,z+sign*.35+.12);}

  if(!roofVertices.every(Number.isFinite))throw Error('Finite continuous U roof required');
  const rg=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(roofVertices,3));rg.computeVertexNormals();const uv=[];for(let i=0;i<roofVertices.length;i+=3)uv.push(roofVertices[i]/2,roofVertices[i+2]/2);rg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const roof=staged.mesh(f,rg,kit.lib.material('roof_tile'),0,0,0);roof.name=ID+'/continuous-u-roof';
  const window=new T.MeshStandardMaterial({name:'yangxingzhai_coarse_window',color:0x7b8180,roughness:.85,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});staged.owned.push(window);
  // Coplanar coarse window overlays stay on the already certified closed faces.
  const panel=(role,x,y,z,w,h,rot)=>{const m=staged.mesh(f,new T.PlaneGeometry(w,h),window,x,y,z);m.rotation.y=rot;m.name=ID+'/'+role;};
  for(const z of[437,439,441,443,445,447,449]){panel('main-upper-window-fit',60.1,5.6,z,1.55,1.8,-Math.PI/2);if(z!==443)panel('main-lower-window-fit',60.1,1.8,z,1.55,1.55,-Math.PI/2);}
  for(const z of[437.6,448.4])for(const y of[1.8,5.6])panel('return-window-fit',54.5,y,z,2.35,1.7,-Math.PI/2);
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yangxingzhaiStoneTop){const b=new T.Box3().setFromObject(m);b.yangxingzhaiStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(53.3,-1e-6,434.9),new T.Vector3(64.9,9.1,451.1));if(!safe.containsBox(b))throw Error('Yanhui actual geometry escaped approved full envelope '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-2C00D09F2A',name:'养性斋',source:'https://www.dpm.org.cn/explore/building/236468.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997a9a7ab57.jpg',identityEvidence:'IMPERIAL_GARDEN_YANGXINGZHAI_NOT_NINGSHOU_YANGXINGDIAN',mainBays:7,returnBays:[3,3],exteriorFloors:2,upperAccess:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
  sourceSupported:['official text: southwest garden, west seat facing east, seven main bays and three-bay forward returns at both ends, two storeys, concave plan, turning hipped yellow roof, upper front gallery','own photo confirms two-level turning mass and upper columns/windows; lower facade obscured by original rockery and trees'],
  fit:['all metric coordinates/proportions and closed lower facade/door treatment; regional fit not survey','continuous U roof is a simplified distance-to-eave hipped surface, not exact historic rafters or tile ornament','coarse windows and upper galleries are exterior only; no upstairs walkable, interiors or stairs'],
  landscapeScope:['exact two certified inside procedural tree instances withheld only after unchanged34 sampling/RNG consumption; previous Jiangxue pine exception retained','approved actual base footprint and narrow approach grass-top cuts, only0.3x2.4m procedural bed-edge opening; no old paths moved','all outside trees including oldCypress7 preserved'],excluded:['foreground historical rockery/ancient trees as invented new objects','fine ornament/plaque/furnishings, public-access assertion, generic global physics changes'],unknown:['precise hidden lower joinery and rear faces','surveyed original coordinates/current admission','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
