import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae46b8.jpg';
const same=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-9;
const canonical=o=>o.visible&&o.matrixAutoUpdate&&o.matrixWorldAutoUpdate&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z;
function equalGeometry(a,b){return Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([k,v])=>{const p=a.attributes[k];return p.itemSize===v.itemSize&&p.normalized===v.normalized&&p.array.constructor===v.array.constructor&&p.array.length===v.array.length&&p.array.every((n,i)=>n===v.array[i]);})&&!!a.index===!!b.index&&(!b.index||a.index.count===b.index.count&&a.index.array.every((n,i)=>n===b.index.array[i]));}
const resources=g=>[g,g?.index,...Object.values(g?.attributes??{})].flatMap(a=>a?[a,a.array,a.array?.buffer].filter(Boolean):[]);
function boundsBox(x0,x1,y0,y1,z0,z1){const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?x0:x1,p.getY(i)<0?y0:y1,p.getZ(i)<0?z0:z1);return g;}
/** Only the four closed north source slabs; no opening, controller or proxy changes. */
export function finishZhujingNorthWindows(kit){
 const frames=kit?.root?.children.filter(f=>f.userData.structure?.profile==='wenhua-rear')??[];if(!frames.length)return false;if(frames.length!==1)throw Error('Unique Zhujing north host required');const f=frames[0],s=f.userData.structure;
 if(kit.root.name!=='outer-east'||f.parent!==kit.root||!canonical(kit.root)||!canonical(f)||kit.root.position.lengthSq()||!same(f.position.x,-186.4)||!same(f.position.z,-167)||f.position.y||s.id!=='outer-east/wenhua-rear'||s.w!==26||s.d!==12||s.ph!==1.2||s.bays!==5||f.userData.zhujingNorthWindows||!Object.isExtensible(f.userData)||!Object.isExtensible(s))throw Error('Exact unchanged Zhujing rear host required');
 const mat=kit.lib.material('lattice_doors'),w=26/5-.68,h=(6.72-6.72*.12)*.8,indices=[0,1,3,4],sources=f.children.filter(m=>m.isMesh&&m.material===mat&&m.position.z===6);
 if(sources.length!==4||!mat.isMeshStandardMaterial||mat.transparent||mat.opacity!==1||!mat.visible||!mat.depthWrite||!mat.depthTest||mat.alphaMap||mat.alphaTest||mat.displacementMap)throw Error('Four original opaque north panes required');
 for(let i=0;i<4;i++){const m=sources[i],g=applyBandUV(new T.BoxGeometry(w,h,.14),kit.lib.tileSize('lattice_doors'));let ok;try{ok=canonical(m)&&!m.children.length&&same(m.position.x,-13+(indices[i]+.5)*5.2)&&same(m.position.y,1.2+h/2)&&equalGeometry(m.geometry,g);}finally{g.dispose();}if(!ok)throw Error('North pane source changed: '+i);}
 const owned=new Map();for(const m of sources)for(const r of resources(m.geometry)){if(owned.has(r)&&owned.get(r)!==m)throw Error('Shared north source geometry');owned.set(r,m);}kit.root.traverse(m=>{for(const r of resources(m.geometry))if(owned.has(r)&&owned.get(r)!==m)throw Error('Borrowed north source geometry');});
 const meta={entityId:'FC-B7C67C602B',sourcePage:'https://www.dpm.org.cn/explore/building/236531.html',photo:PHOTO,photographyDate:null,scope:'FOUR_NORTH_CLOSED_BAYS_HIGH_WINDOW_AND_WALL_ONLY',bays:4,centralDoor:'UNCHANGED_OPEN_MODEL_ROUTE_NOT_PHOTOGRAPHED_CLOSED_STATE',dimensionStatus:'ORIGINAL_PANE_ENVELOPE_HIGH_WINDOW_PROPORTIONS_ENGINEERING_PHOTO_FIT_NOT_SURVEYED',ornament:'TWO_LEAF_SIMPLE_DIAMOND_OUTLINE_NOT_FULL_PHOTO_CARVING',physics:'ORIGINAL_PROXIES_RETAINED_PLUS_FOUR_ACTUAL_CONTINUOUS_BACKING_TRIANGLE_OWNERS',interior:'CONTINUOUS_BACKING_NOT_A_NEW_VIEW_INTO_CURRENT_EXHIBIT',wholeHallAccepted:false};
 const mats=[],geos=[],groups=[],colliders=[];
 try{
  for(const[n,c]of[['red',0x933b2e],['dark',0x282925],['brick',0xad8c77]])mats.push(new T.MeshStandardMaterial({name:'zhujing-north-'+n+'-fit',color:c,roughness:.91}));
  for(let i=0;i<4;i++){
   const old=sources[i],g=new T.Group();groups.push(g);g.name='zhujing-north-window-bay-'+indices[i];g.position.copy(old.position);g.userData={zhujingNorthWindowBay:indices[i],...meta};
   const b=new T.Box3().setFromBufferAttribute(old.geometry.attributes.position),x0=b.min.x,x1=b.max.x,y0=b.min.y,y1=b.max.y,z0=b.min.z,z1=b.max.z,face=z1-.025,hi=y1-.1,lo=hi-1.6,l=-1.13,r=1.13;
   const mesh=(geo,mi,role)=>{geos.push(geo);const m=new T.Mesh(geo,mats[mi]);m.name='zhujing-north-'+role;m.userData={role,...meta};m.castShadow=m.receiveShadow=true;g.add(m);return m;};
   const box=(role,mi,a,c,d,e,f=face,j=z1)=>mesh(boundsBox(a,c,d,e,f,j),mi,role);
   box('continuous-backing',1,x0,x1,y0,y1,z0,face+.001);
   box('lower-brick-band',2,x0,x1,y0,y0+.72);
   box('red-wall-below-window',0,x0,x1,y0+.72,lo);
   box('red-wall-above-window',0,x0,x1,hi,y1);
   box('red-wall-side',0,x0,l,lo,hi);box('red-wall-side',0,r,x1,lo,hi);
   for(let leaf=0;leaf<2;leaf++){
    const a=l+(r-l)*leaf/2,c=l+(r-l)*(leaf+1)/2,t=.055;
    box('window-panel',1,a,c,lo,hi,face-.006,face+.002);
    for(const x of[a,c-t])box('window-stile',0,x,x+t,lo,hi);
    for(const y of[lo,hi-t])box('window-rail',0,a,c,y,y+t);
    const left=a+t+.015,right=c-t-.015,bottom=lo+t+.015,top=hi-t-.015;
    for(const sign of[-1,1])for(let k=-8;k<12;k++){
     const intercept=bottom+k*.23,pts=[];for(const x of[left,right]){const y=intercept+sign*1.45*(x-left);if(y>=bottom&&y<=top)pts.push([x,y]);}for(const y of[bottom,top]){const x=left+(y-intercept)/(sign*1.45);if(x>left&&x<right)pts.push([x,y]);}if(pts.length!==2)continue;
     const [[ax,ay],[bx,by]]=pts,geo=new T.BoxGeometry(Math.hypot(bx-ax,by-ay),.025,.018);geo.rotateZ(Math.atan2(by-ay,bx-ax));geo.translate((ax+bx)/2,(ay+by)/2,z1-.009);mesh(geo,0,'diamond-grid');
    }
   }
  }
  f.updateWorldMatrix(true,false);
  for(const [i,g]of groups.entries()){
   g.updateMatrix();const m=g.children.find(m=>m.userData.role==='continuous-backing');m.updateMatrix();const matrix=f.matrixWorld.clone().multiply(g.matrix).multiply(m.matrix),p=m.geometry.attributes.position,ix=m.geometry.index,values=[];
   for(let k=0;k<(ix?.count??p.count);k++)values.push(...new T.Vector3().fromBufferAttribute(p,ix?ix.getX(k):k).applyMatrix4(matrix).toArray());
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(geo),[0,0,0],'zhujing-north-backing:'+indices[i]),box=owner.box.clone();box.triangleSupport=owner;colliders.push(box);}finally{geo.dispose();}
  }
 }catch(error){for(const g of geos)g.dispose();for(const m of mats)m.dispose();throw error;}
 for(const g of groups)f.add(g);for(const m of sources){f.remove(m);m.geometry.dispose();}kit.colliders.push(...colliders);kit.owned.push(...mats);f.userData.zhujingNorthWindows=meta;s.zhujingNorthWindows=meta;return meta;
}
