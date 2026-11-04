import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jingfu-wenfeng',done=new WeakSet(),ORIGIN=[-319.8,0,479.5];
const ANCHORS=[{name:'景福宫',x:-338.5,z:492.2,w:19.7,d:19.7},{name:'佛日楼',x:-319.8,z:513.3,w:11.5,d:8.9},{name:'景祺阁',x:-293.3,z:496.8,w:31,d:11.2}];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){
 const r=kit?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.id===ID)exists=true});
 if(!r||r.name!=='ningshou'||r.parent||r.matrixAutoUpdate!==true||r.matrixWorldAutoUpdate!==true||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}'||ANCHORS.some(a=>zone.items?.filter(i=>i.kind==='hall'&&Object.entries(a).every(([k,v])=>i[k]===v)).length!==1)||exists||done.has(kit))throw Error('Exact mutable untransformed Wenfeng court required, once only');
 const reserve=new T.Box3(new T.Vector3(-321.8,.01,476.65),new T.Vector3(-317.8,5.7,482.35));
 if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve)))throw Error('Wenfeng viewing reserve is occupied');
}
const polygon=points=>{const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s};
const octagon=(w,d)=>{const x=w/2,z=d/2,c=Math.min(w,d)*.18;return[[-x+c,-z],[x-c,-z],[x,-z+c],[x,z-c],[x-c,z],[-x+c,z],[-x,z-c],[-x,-z+c]]};
// Subdivide only long stone faces, weld their vertices and shade continuously.
// No texture noise, proxy holes or invisible collision envelope is introduced.
function softenStone(g){
 const p=g.attributes.position,ix=g.index,faces=[];
 const split=(a,b,c,depth=0)=>{const lens=[a.distanceToSquared(b),b.distanceToSquared(c),c.distanceToSquared(a)],edge=lens.indexOf(Math.max(...lens));if(lens[edge]>.25&&depth<10){if(edge===0){const m=a.clone().add(b).multiplyScalar(.5);split(a,m,c,depth+1);split(m,b,c,depth+1)}else if(edge===1){const m=b.clone().add(c).multiplyScalar(.5);split(a,b,m,depth+1);split(a,m,c,depth+1)}else{const m=c.clone().add(a).multiplyScalar(.5);split(a,b,m,depth+1);split(m,b,c,depth+1)}}else faces.push(a,b,c)};
 for(let i=0;i<(ix?.count??p.count);i+=3)split(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j)));
 const positions=[],indices=[],vertices=new Map();for(const v of faces){const key=[v.x,v.y,v.z].map(n=>Math.round(n*1e6)).join(',');if(!vertices.has(key)){vertices.set(key,positions.length/3);const x=(v.x-.55)*(1+.16*Math.sin(v.y*3.1+v.z*2.7))+.085*Math.sin(v.y*4.3+v.z*3.2);positions.push(x,v.y,v.z)}indices.push(vertices.get(key))}
 for(const k of Object.keys(g.attributes))g.deleteAttribute(k);g.clearGroups();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
/** A limited fitted feature, not a scanned stone or reconstructed historic court.
 * Official text supplies pedestal/stone proportions. Coordinates, silhouette,
 * holes, copper members, hidden sides and material appearance remain fits. */
export function buildJingfuWenfeng(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const frame=new T.Group();frame.name=ID;frame.position.fromArray(ORIGIN);
 const geometries=[],materials=[],colliders=[],apertures=[[-.50,1.05,.19,.23],[.32,1.55,.25,.32],[-.55,2.13,.23,.31],[.25,2.65,.22,.31],[-.18,3.35,.18,.24],[.22,3.95,.11,.15]];
 const own=g=>{geometries.push(g);return g};
 const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=new T.Mesh(g,m);q.name=ID+'/'+role;q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;q.userData.wenfengFeature=true;frame.add(q);return q};
 try{
  const stone=new T.MeshStandardMaterial();materials.push(stone);stone.copy(kit.lib.material('stone_slab'));stone.name='r164_wenfeng_pale_pedestal_fit';stone.color.setHex(0xb8b8a7);stone.roughness=.93;
  const rock=new T.MeshStandardMaterial({name:'r164_wenfeng_perforated_stone_fit',color:0x99998a,roughness:1});materials.push(rock);
  const copper=new T.MeshStandardMaterial({name:'r164_wenfeng_low_copper_rail_fit',color:0x536052,roughness:.75,metalness:.45});materials.push(copper);
  // Four closed eight-sided courses, matching the attested outer footprint.
  for(const [i,[w,d,y,h]]of[[2.5,4.2,0,.18],[2.35,4.05,.18,.17],[2.12,3.82,.35,.43],[2.5,4.2,.78,.22]].entries()){
   const g=own(new T.ExtrudeGeometry(polygon(octagon(w,d)),{depth:h,bevelEnabled:false,steps:1}));g.rotateX(-Math.PI/2);mesh('pedestal-course-'+i,g,stone,0,y,0);
  }
  const outline=[[-.80,0],[.70,0],[.95,.40],[1.30,.70],[1.15,1.4],[1.40,1.9],[1.10,2.5],[.85,2.8],[1.05,3.3],[.70,3.5],[.65,4.1],[.15,4.46],[-.20,4.36],[-.45,4.06],[-.75,3.81],[-.65,3.2],[-1.10,2.85],[-1.25,2.35],[-1,2.05],[-1.35,1.6],[-1.10,1.2],[-1.30,.9],[-.90,.6],[-1,.2]],shape=polygon(new T.CatmullRomCurve3(outline.map(([x,y])=>new T.Vector3(x,y,0)),true,'centripetal').getPoints(96).slice(0,-1).map(v=>[v.x,v.y]));
  for(const [cx,cy,rx,ry]of apertures){const h=new T.Path();for(let i=0;i<12;i++){const a=-i*Math.PI/6,r=1+.1*Math.sin(i*2.3);const x=cx+rx*Math.cos(a)*r,y=cy+ry*Math.sin(a)*r;i?h.lineTo(x,y):h.moveTo(x,y)}h.closePath();shape.holes.push(h)}
  const rg=own(new T.ExtrudeGeometry(shape,{depth:1.1,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:2,steps:3,curveSegments:1}));
  // Retain real aperture topology. Thickness variation does not cover holes.
  rg.rotateY(Math.PI/2);softenStone(rg);mesh('perforated-stone-fit',rg,rock,0,1.04,0);
  const rail=octagon(2.32,4.02);
  for(let i=0;i<rail.length;i++){
   const [x,z]=rail[i],[nx,nz]=rail[(i+1)%rail.length],dx=nx-x,dz=nz-z;
   mesh('copper-post-fit-'+i,own(new T.BoxGeometry(.045,.3,.045)),copper,x,1.15,z);
   const q=mesh('copper-top-rail-fit-'+i,own(new T.BoxGeometry(Math.hypot(dx,dz),.045,.045)),copper,(x+nx)/2,1.2775,(z+nz)/2);q.rotation.y=-Math.atan2(dz,dx);
  }
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children){const g=own(new T.BufferGeometry());try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),c=shape.box.clone();c.triangleSupport=shape;c.wenfengMesh=m.uuid;colliders.push(c)}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,parentObjectId:'FC-7616C3B4B6',name:'文峰',scope:'SINGLE_VIEWING_STONE_AND_BASE_IN_FITTED_CLEAR_COURT',wholeObjectAccepted:false,surveyed:false,inscriptionsReproduced:false,newRooms:0,newMapItems:0,newWalkables:0,officialProportions:{pedestalEastWest:2.5,pedestalNorthSouth:4.2,pedestalHeightApprox:1,railHeightApprox:.3,stoneHeightApprox:4.5},fit:{x:ORIGIN[0],z:ORIGIN[2],perforations:apertures.length,geometry:'SIMPLIFIED_PERFORATED_UPRIGHT_NOT_SCANNED'},apertureProbePoints:apertures.map(([z,y])=>[-z,y+.04]),sources:['https://www.dpm.org.cn/explore/building/236571.html','https://www.dpm.org.cn/building/talk/223680.html','https://img.dpm.org.cn/Uploads/pdf/2205/T00035_00.pdf','https://img.dpm.org.cn/Uploads/pdf/2205/T00035_01.pdf'],unknown:['Surveyed coordinates, full silhouette and unseen faces','Exact holes, carving, rail members and current condition','Current access and complete court/gates/landscape','Browser/GPU/mobile and full World integration'],fitted:['Coordinates referenced to current Jingfu/Fori/Jingqi anchors','Irregular silhouette and six true holes, not an exact stone reconstruction','Layer sizes, railing members and surface tones']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);done.add(kit);return{frame,meta,colliders,materials};
}
