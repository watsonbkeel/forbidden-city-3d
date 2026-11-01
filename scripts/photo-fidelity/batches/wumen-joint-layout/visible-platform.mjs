import * as T from 'three';
import{applyBoxUV,applyBandUV}from'../../../../src/utils/GeometryUV.js';
import{createTriangleTemplate,triangleInstance}from'../../../../src/utils/TriangleSupport.js';
import{cloneOverheadShape}from'../../../../src/utils/OverheadShape.js';
import{WUMEN_LOWER_PROFILE,wumenLowerGeometry}from'../../../../src/scene/palace/special/WumenLowerBase.js';
import{gateRailFacade}from'../../../../src/scene/palace/gateRailFacade.js';
import{createWumenJointPlatformFit}from'./platform-fit.mjs';
import{buildWumenJointRampSolid}from'./ramp-solid.mjs';

/** Isolated visible engineering assembly. Does not mutate/install the original
 * gate. The source map is not a certified upper surface. Receiver windows are
 * deliberately NOT emitted as stand-alone meshes/supports. */
export function buildWumenJointVisiblePlatform(c){
 const f=createWumenJointPlatformFit(),e=f.envelope,lower=c?.group?.children.filter(o=>o.userData.structure?.id==='axis/wumen-lower-base')??[];
 if(c?.data?.name!=='午门'||c.data.position.x!==0||c.data.position.z!==-419.6||lower.length!==1||!c.lib?.material||!c.lib?.tileSize||c.group.position.lengthSq()||!c.group.quaternion.equals(new T.Quaternion())||!c.group.scale.equals(new T.Vector3(1,1,1)))throw Error('visible platform requires original captured Wumen component');
 for(const o of [c.group,lower[0]])if(!o.visible||o.position.lengthSq()||!o.quaternion.equals(new T.Quaternion())||!o.scale.equals(new T.Vector3(1,1,1))||!o.matrixAutoUpdate||!o.matrixWorldAutoUpdate)throw Error('original retained parent pose/visibility changed');
 const old=wumenLowerGeometry(c.data),p=WUMEN_LOWER_PROFILE,northDelta=e.north-p.bounds.north;
 const doors=lower[0].children.filter(o=>o.name.startsWith('wumen-lower-door/')),faces=lower[0].children.filter(o=>o.userData.wumenSidePortalFace),canopies=c.group.children.filter(o=>o.name==='wumen-south-three-canopies');
 const north=lower[0].children.filter(o=>['north-arched-cap','north-arched-lining','north-vertical-jamb-lining'].includes(o.userData.wumenLowerPart));
 if(doors.length!==5||faces.length!==2||canopies.length!==1||north.filter(o=>o.userData.wumenLowerPart==='north-arched-cap').length!==5||north.filter(o=>o.userData.wumenLowerPart==='north-arched-lining').length!==5||north.filter(o=>o.userData.wumenLowerPart==='north-vertical-jamb-lining').length!==16)throw Error('retained five portal objects missing');
 const hardware={left:[],right:[]};lower[0].traverse(o=>{if(o.userData.wumenLeftLeafStuds)hardware.left.push(o);if(o.userData.wumenRightLeafStuds)hardware.right.push(o);});if(hardware.left.length!==1||hardware.right.length!==1||hardware.left[0].children.length!==64||hardware.right[0].children.length!==69)throw Error('retained near-leaf cap inventory changed');
 const routes=old.routes.map(r=>({...r,rects:r.rects.map(q=>({...q,z1:q.z1===p.bounds.north?e.north:q.z1}))}));
 const group=new T.Group();group.name='wumen-joint-visible-platform';
 const cells=[],slopes=[],colliders=[],walkables=[],retained=[],rails=[],owned=new Set(),cloned=new Map();let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;for(const s of slopes)s.dispose();for(const g of owned)g.dispose();};
 const row=(x0,x1,y0,y1,z0,z1)=>new T.Box3(new T.Vector3(x0,y0,z0),new T.Vector3(x1,y1,z1));
 const addBox=(id,mat,x0,x1,y0,y1,z0,z1)=>{const g=(mat==='sumeru_band'?applyBandUV:applyBoxUV)(new T.BoxGeometry(x1-x0,y1-y0,z1-z0),c.lib.tileSize(mat));owned.add(g);if(mat==='balustrade')gateRailFacade(g,true);const m=new T.Mesh(g,c.lib.material(mat,mat==='balustrade'?{alphaTest:.5,side:T.DoubleSide}:{}));m.name=id;m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.castShadow=m.receiveShadow=true;group.add(m);m.updateMatrixWorld(true);return m;};
 const ordinary=(id,x0,x1,y0,y1,z0,z1)=>{const b=row(x0,x1,y0,y1,z0,z1);b.wumenJointPlatformPart=id;colliders.push(b);return b;};
 const inside=(q,x,z)=>x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1;
 const sourceClone=(source,kind,translateZ=0)=>{const mesh=source.clone(true);mesh.traverse(o=>{if(o.geometry){if(!cloned.has(o.geometry)){const g=o.geometry.clone();owned.add(g);cloned.set(o.geometry,g);}o.geometry=cloned.get(o.geometry);}});mesh.position.z+=translateZ;group.add(mesh);retained.push({source,mesh,kind,translateZ});return mesh;};
 const triangle=m=>{m.updateWorldMatrix(true,false);const g=m.geometry.clone();try{g.setAttribute('position',new T.BufferAttribute(new Float64Array(g.attributes.position.array),3));g.applyMatrix4(m.matrixWorld);const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`wumen-joint/platform-triangle/${colliders.length}`),b=owner.box.clone();b.triangleSupport=owner;colliders.push(b);}finally{g.dispose();}};
 try{
  const xs=[...new Set([-e.halfWidth,-e.wingInner,e.wingInner,e.halfWidth,...f.recesses.flatMap(r=>[r.minX,r.maxX]),...routes.flatMap(r=>r.rects.flatMap(q=>[q.x0,q.x1]))])].sort((a,b)=>a-b);
  const zs=[...new Set([e.wingSouth,e.mainSouth,e.north-p.headDepth,e.north,...f.recesses.flatMap(r=>[r.minZ,r.maxZ]),...routes.flatMap(r=>r.rects.flatMap(q=>[q.z0,q.z1]))])].sort((a,b)=>a-b);
  for(let j=1;j<zs.length;j++)for(let i=1;i<xs.length;i++){
   const minX=xs[i-1],maxX=xs[i],minZ=zs[j-1],maxZ=zs[j],x=(minX+maxX)/2,z=(minZ+maxZ)/2;
   if(x<=-e.halfWidth||x>=e.halfWidth||z<=e.wingSouth||z>=e.north||(z<e.mainSouth&&Math.abs(x)<e.wingInner)||f.recesses.some(r=>x>r.minX&&x<r.maxX&&z>r.minZ&&z<r.maxZ))continue;
   const id=`wumen-joint/platform-cell/${cells.length}`,portal=routes.find(r=>r.rects.some(q=>inside(q,x,z))),northHead=portal&&z>=e.north-p.headDepth;
   const slab=addBox(`${id}/slab`,'stone_slab',minX,maxX,e.shoulder,e.top,minZ,maxZ),slabBody=ordinary(`${id}/slab`,minX,maxX,e.shoulder,e.top,minZ,maxZ),support={type:'box',rescue:false,box:row(minX,maxX,e.top,e.top,minZ,maxZ),wumenJointPlatformPart:`${id}/slab`};walkables.push(support);
   const bodies=[];
   if(!northHead){const low=portal?portal.crown:0;if(low===0){
    const jambs=minZ>=e.north-p.headDepth?routes.flatMap(r=>{const spring=r.crown-r.width/2,out=[];if(Math.abs(maxX-(r.x-r.width/2))<1e-9)out.push({normal:1,spring});if(Math.abs(minX-(r.x+r.width/2))<1e-9)out.push({normal:-1,spring});return out;}):[];
    const ys=[...new Set([0,1.2,e.shoulder,...jambs.map(j=>j.spring)])].sort((a,b)=>a-b);
    for(let k=1;k<ys.length;k++){const y0=ys[k-1],y1=ys[k],m=addBox(`${id}/masonry/${k}`,y1<=1.2?'sumeru_band':'wall_red',minX,maxX,y0,y1,minZ,maxZ),remove=jambs.filter(j=>y1<=j.spring);
     if(remove.length){const g=m.geometry,n=g.attributes.normal,indices=g.index?Array.from(g.index.array):Array.from({length:g.attributes.position.count},(_,i)=>i),keep=[];for(let i=0;i<indices.length;i+=3){if(!remove.some(j=>[0,1,2].every(k=>Math.abs(n.getX(indices[i+k])-j.normal)<1e-6)))keep.push(...indices.slice(i,i+3));}g.setIndex(keep);g.clearGroups();}bodies.push(m);
    }ordinary(id,minX,maxX,0,e.shoulder,minZ,maxZ);
   }else{bodies.push(addBox(`${id}/flat-soffit`,'wall_brick',minX,maxX,low,low+p.lining,minZ,maxZ),addBox(`${id}/tunnel-cap`,'wall_red',minX,maxX,low+p.lining,e.shoulder,minZ,maxZ));const b=ordinary(id,minX,maxX,low,e.shoulder,minZ,maxZ);b.overhead=cloneOverheadShape({type:'piecewise-linear-x',sourceId:id,points:[[minX,low],[maxX,low]],minZ,maxZ,topY:e.shoulder},b);}}
   cells.push({id,minX,maxX,minZ,maxZ,portalID:portal?.id??null,northHead:!!northHead,slab,slabBody,support,bodies});
  }
  for(const source of doors){const o=sourceClone(source,'door');o.traverse(m=>{if(m.userData.wumenLowerPart==='door-solid')triangle(m);});}
  for(const source of faces)sourceClone(source,'side-face');
  sourceClone(canopies[0],'canopies');
  for(const source of north){const role=source.userData.wumenLowerPart,kind=role==='north-arched-cap'?'north-cap':role==='north-arched-lining'?'north-lining':'north-jamb';const m=sourceClone(source,kind,northDelta);if(kind!=='north-jamb')triangle(m);}
  for(const r of f.recesses){const s=buildWumenJointRampSolid(r,c.lib.material('wall_brick'));slopes.push(s);group.add(s.mesh);colliders.push(...s.colliders);walkables.push(s.walkable);}
  // Only the retained main-terrace perimeter family is refitted. Do not invent
  // an inventory of rails along the long wings. Safety height remains explicit.
  const inset=.3,edgeX=e.halfWidth-inset,northZ=e.north-inset,southZ=-13;
  const paths=[{axis:'x',fixed:southZ,lo:-e.wingInner+.1,hi:e.wingInner-.1},{axis:'x',fixed:northZ,lo:-edgeX,hi:edgeX},...[-1,1].map(s=>({axis:'z',fixed:s*edgeX,lo:southZ,hi:northZ}))];
  for(const path of paths){const horizontal=path.axis==='x',holes=f.recesses.filter(r=>horizontal?Math.max(path.fixed-.1,r.minZ)<Math.min(path.fixed+.1,r.maxZ):Math.max(path.fixed-.1,r.minX)<Math.min(path.fixed+.1,r.maxX)).map(r=>horizontal?[r.minX,r.maxX]:[r.minZ,r.maxZ]);const cuts=[...new Set([path.lo,path.hi,...holes.flat().filter(v=>v>path.lo&&v<path.hi)])].sort((a,b)=>a-b);for(let i=1;i<cuts.length;i++){const lo=cuts[i-1],hi=cuts[i],mid=(lo+hi)/2;if(holes.some(([a,b])=>mid>a&&mid<b))continue;const b=horizontal?{minX:lo,maxX:hi,minZ:path.fixed-.1,maxZ:path.fixed+.1}:{minX:path.fixed-.1,maxX:path.fixed+.1,minZ:lo,maxZ:hi};const id=`wumen-joint/platform-rail/${rails.length}`,m=addBox(id,'balustrade',b.minX,b.maxX,e.top,e.top+1.2,b.minZ,b.maxZ),col=ordinary(id,b.minX,b.maxX,e.top+.2,e.top+4.2,b.minZ,b.maxZ);rails.push({mesh:m,collider:col,bounds:b,virtualHeight:true});}}
  group.updateMatrixWorld(true);
  const contract={scope:'ISOLATED_VISIBLE_PLATFORM_GEOMETRY_NOT_ROUTE_ACCEPTANCE',runtimeInstalled:false,routeAcceptance:false,worldPlacementApplied:false,coordinateSpace:'WUMEN_LOCAL_XZ',frame:f.frame,northHeadTranslationZ:northDelta,receiverMeshes:0,sourceInputPolicy:'TRUSTED_SHA_FROZEN_COMPONENT_WITH_TARGET_GUARDS_NOT_ARBITRARY_INPUT_AUTHENTICATOR',railPolicy:'REFITTED_MAIN_TERRACE_ONLY_VISIBLE_1.2M_GAMEPLAY_PROXY_4.2M',sourceLayer:'ENGINEERING_U_AND_RECESSES_NOT_MEASURED_TOP',wholeObjectCompleted:false};group.userData.wumenJointPlatform=contract;
  return{group,cells,slopes,colliders,walkables,retained,rails,contract,dispose};
 }catch(error){dispose();throw error;}
}
