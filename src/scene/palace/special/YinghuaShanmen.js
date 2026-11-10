import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='yinghua-shanmen',done=new WeakSet();
export const YINGHUA_SHANMEN_FIT=Object.freeze({x:277.2,z:454.9,width:11.4,depth:2.8,floor:.1,wallTop:5.35,innerGateZ:461.4,cornerCenters:[269.4,285],cornerWidth:2.6});
const INNER={kind:'gate',name:'英华门',x:277.2,z:461.4,gateProfile:'yinghua',gateKind:'single-arched'};
const COURT={kind:'courtWalls',x0:252,x1:302,z0:454.9,z1:513.03,gates:[{side:'s',at:277.2,gate:'英华殿山门'}],source:'estimated'};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){const r=kit?.root;let existing=false;r?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-F5D7ED5F35')existing=true});if(JSON.stringify(zone.items?.[41])!==JSON.stringify(INNER)||JSON.stringify(zone.items?.[42])!==JSON.stringify(COURT)||!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!Object.isExtensible(r)||!mutable(r.children)||['colliders','walkables','owned','mapItems','rooms','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact mutable Yinghua shanmen host and source item required once');}
function prism(points,z0,z1){const g=new T.ExtrudeGeometry(new T.Shape(points.map(p=>new T.Vector2(...p))),{depth:z1-z0,bevelEnabled:false,curveSegments:1,steps:1});g.translate(0,0,z0);g.clearGroups();return g;}
function arc(radius,spring){return Array.from({length:25},(_,i)=>{const a=Math.PI-i*Math.PI/24;return[i===0?-radius:i===24?radius:radius*Math.cos(a),spring+radius*Math.sin(a)]});}
/** Three photographed apertures, distinct from the single inner Yinghua gate.
 * The compressed first court and corner openings are reversible topology fits. */
export function buildYinghuaShanmen(kit,zone){
 if(zone?.id!=='outer-west')return false;
 validate(kit,zone);const s=new CourtKit(kit.lib,'outer-west'),p=YINGHUA_SHANMEN_FIT,geometries=new Set();let f,meta;
 try{
  f=s.frame(p.x,p.z,0);f.name=ID;
  const mat=new Map(),material=n=>{if(!mat.has(n)){const m=kit.lib.material(n).clone();m.name='r173_shanmen_'+n;s.owned.push(m);mat.set(n,m);}return mat.get(n);};
  const mesh=(role,g,n,x=0,y=0,z=0)=>{geometries.add(g);const tile=kit.lib.tileSize(n),m0=material(n),geo=applyBoxUV(g,tile);if(geo!==g){geometries.delete(g);geometries.add(geo);}const m=s.mesh(f,geo,m0,x,y,z);m.name=ID+'/'+role;return m;};
  const box=(role,n,w,h,d,x,y,z)=>mesh(role,new T.BoxGeometry(w,h,d),n,x,y,z);
  const portals=[{x:-3.65,r:1.12,spring:2.55},{x:0,r:1.4,spring:2.85},{x:3.65,r:1.12,spring:2.55}];
  const cuts=[-p.width/2,...portals.flatMap(q=>[q.x-q.r,q.x+q.r]),p.width/2];
  for(let i=0;i<cuts.length;i+=2){const a=cuts[i],b=cuts[i+1];box('red-pier-'+i,'wall_red',b-a,p.wallTop-p.floor,p.depth,(a+b)/2,(p.wallTop+p.floor)/2,0);}
  for(const [i,q]of portals.entries()){
   const a=arc(q.r,q.spring);mesh('arched-head-'+i,prism([[-q.r,p.wallTop],[q.r,p.wallTop],...a.slice().reverse()],-p.depth/2,p.depth/2),'wall_red',q.x);
   // Independent pale front/rear edging has positive thickness, not a
   // coplanar decal. Its exact paint/stone finish is not inferred from 8417.
   const outer=arc(q.r+.22,q.spring),ring=[...a,...outer.slice().reverse()];
   for(const side of[-1,1]){
    mesh('pale-arch-edge-'+i+'-'+side,prism(ring,side<0?-1.43:1.405,side<0?-1.405:1.43),'stone_slab',q.x);
    for(const sign of[-1,1])box('pale-jamb-'+i+'-'+side+'-'+sign,'stone_slab',.22,q.spring-p.floor,.025,q.x+sign*(q.r+.11),(q.spring+p.floor)/2,side*1.4175);
   }
   // Source shows leaves but not public opening policy. Fitted inward-open
   // leaves retain their arched top and hinges; no present access assertion.
   for(const sign of[-1,1]){
    const half=a.filter(([x])=>sign*x>=-1e-10),poly=[...half.map(([x,y])=>[x-sign*q.r,y]),[half.at(-1)[0]-sign*q.r,p.floor],[half[0][0]-sign*q.r,p.floor]];
    const m=mesh('open-arched-leaf-'+i+'-'+sign,prism(poly,-.045,.045),'wood_column',q.x+sign*(q.r-.015),0,-1.34);m.rotation.y=sign*Math.PI/2;m.userData.pose='GAME_TOUR_OPEN_FIT_NOT_DOCUMENTED_HISTORICAL_POSE';
   }
  }
  const threshold=box('low-visible-threshold','stone_slab',11.6,.1,3.1,0,.05,0);threshold.userData.shanmenStone=true;
  box('painted-upper-band-fit','wood_column',11.6,.38,2.95,0,5.54,0);
  // A restrained closed single-eave yellow silhouette, not a claim that the
  // partly hidden photographed roof has a particular formal classification.
  const profile=[[-1.9,5.73],[-1.9,5.94],[-1.45,5.87],[-.8,6.2],[0,6.8],[.8,6.2],[1.45,5.87],[1.9,5.94],[1.9,5.73]];
  const g=prism(profile,-6.05,6.05);g.rotateY(Math.PI/2);mesh('yellow-roof-profile-fit',g,'roof_tile');
  box('plain-ridge-fit','roof_tile',11.2,.16,.18,0,6.84,0);
  // Research figure 11 names an inner cross-wall and two corner gates. Only
  // those openings are represented; widths/heights are circulation fits.
  const start=s.root.children.length,cs=s.colliders.length;
  s.wall(252,p.innerGateZ,302,p.innerGateZ,{h:3.2,t:.45,baseHeight:.35,gaps:[{at:277.2,w:6.4},...p.cornerCenters.map(at=>({at,w:p.cornerWidth}))]});
  s.colliders.length=cs;
  for(const [i,frame]of s.root.children.slice(start).entries()){frame.name=ID+'/inner-wall-'+i;let part=0;frame.traverse(m=>{if(m.isMesh){m.name=frame.name+'/'+part++;m.userData.shanmenInnerWall=true}});}
  for(const [i,x]of p.cornerCenters.entries()){
   // A real head at 2.75m keeps the opening framed; no unseen door leaves or
   // borrowed little roofs are invented for the plan-only corner portals.
   box('corner-gate-head-'+i,'wall_red',p.cornerWidth,.45,.45,x-p.x,2.975,p.innerGateZ-p.z);
  }
  s.root.updateWorldMatrix(true,true);
  s.root.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);if(m.userData.shanmenStone){b.shanmenMesh=m.uuid;b.shanmenRole=m.name;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const pos=m.geometry.attributes.position,ix=m.geometry.index,origin=new T.Vector3().setFromMatrixPosition(m.matrixWorld),matrix=m.matrixWorld.clone();matrix.setPosition(0,0,0);const v=[];
   for(let k=0;k<(ix?.count??pos.count);k+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(pos,ix?.getX(k+j)??k+j).applyMatrix4(matrix));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(n=>n.toArray()));}
   if(!v.length)throw Error('Empty H39 owner');const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const shape=triangleInstance(createTriangleTemplate(geo),origin.toArray(),m.name+'/'+m.uuid),c=shape.box.clone();c.triangleSupport=shape;c.shanmenMesh=m.uuid;c.shanmenRole=m.name;s.colliders.push(c);}finally{geo.dispose();}
  });
  meta={id:ID,sourceObjectId:'FC-F5D7ED5F35',name:'英华殿山门',portalCount:3,source:'https://www.dpm.org.cn/explore/building/236568.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/8417.jpg',planSource:'https://www.cactch.org.cn/webfile/upload/2021/02-04/22-02-570611-194311783.pdf',planFigure:'printed p236 fig11',wholeObjectAccepted:false,surveyed:false,restorationOfPreviouslyCountedItem:true,innerGateSourceObjectId:'FC-0EACBA1911',cornerGates:[{name:'英华门东角门',x:269.4,z:461.4},{name:'英华门西角门',x:285,z:461.4}],sourceSupported:['three arched openings, middle taller, red wall, pale arch edging, yellow single visible eave','separate shanmen, first courtyard, single Yinghua inner gate and named east/west corner gates'],fit:['all coordinates, dimensions, compressed courtyard, colors, hidden faces and roof profile','existing H40 translated north to z461.4; corner centres preserve the original bypass','arched leaves opened inward for game circulation, not a documented visitor policy'],unknown:['surveyed dimensions and spacing','formal roof classification, unseen carving, complete current paint and visitor access']};f.userData.structure=meta;
  // No mapRect or gate item: the stable directory card is information-only,
  // and must not silently create a Teleport.targets entry.
 }catch(e){s.dispose(s.root);for(const g of geometries)if(!s.root.getObjectByProperty('geometry',g))g.dispose();throw e;}
 kit.root.add(...[...s.root.children]);for(const key of['colliders','walkables','owned','mapItems'])kit[key].push(...s[key]);done.add(kit);return{frame:f,meta,width:p.width};
}
