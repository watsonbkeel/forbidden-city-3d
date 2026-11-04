import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='yihe-court-censers',done=new WeakSet();
const CENTERS=[[-301.2,452.8],[-286.2,452.8]];
const BOUNDS={x0:-366.5,x1:-222.45,z0:111.5,z1:526.5};
const ANCHORS=[{name:'颐和轩',kind:'hall',x:-293.7,z:470.8,w:34.1,d:22.9,ph:1,structure:'yihe-ground-hall',yiheProfile:'yihe-ground-plan-2025-fit-v1'},{name:'乐寿堂',kind:'hall',x:-293.4,z:435.3,w:36.15,d:23.2,ph:.9}];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){
 const r=kit?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.id==='place-ningshou-d653a5843e-court-censers')exists=true;});
 if(!r||r.name!=='ningshou'||r.parent||r.matrixAutoUpdate!==true||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','owned','mapItems','rooms','regions'].some(k=>!mutable(kit[k]))||JSON.stringify(zone.bounds)!==JSON.stringify(BOUNDS)||ANCHORS.some(a=>zone.items?.filter(i=>Object.entries(a).every(([k,v])=>i[k]===v)).length!==1)||exists||done.has(kit))throw Error('Exact mutable untransformed Yihe court host required, once only');
 for(const[x,z]of CENTERS){const reserve=new T.Box3(new T.Vector3(x-1.35,.01,z-1.35),new T.Vector3(x+1.35,3.2,z+1.35));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve)))throw Error('Yihe court censer reserve is occupied');}
}
/** Only the paired pavilion-lidded dark metal objects visible in the official
 * Yihe exterior photo. All coordinates, dimensions, segment counts and hidden
 * surfaces are fitted. No inscription, invented dragon carving, smoke or fire. */
export function buildYiheCourtCensers(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const frame=new T.Group();frame.name=ID;
 const geometries=[],materials=[],colliders=[];
 try{
  const stone=new T.MeshStandardMaterial({name:'r164_yihe_censer_stone_fit',color:0xbdb9a8,roughness:.91});materials.push(stone);
  const metal=new T.MeshStandardMaterial({name:'r164_yihe_censer_dark_metal_fit',color:0x263f39,roughness:.7,metalness:.5});materials.push(metal);
  const own=g=>{geometries.push(g);return g;};
  // Lathe axis caps can contain zero-area axis triangles. Keep all nonzero
  // visible faces and use the same cleaned geometry for rendering and contact.
  const lathe=(profile,n=24)=>{const g=own(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),n)),p=g.attributes.position,idx=g.index,keep=[];for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)],v=ids.map(j=>new T.Vector3().fromBufferAttribute(p,j));if(new T.Triangle(...v).getArea()>1e-12)keep.push(...ids);}g.setIndex(keep);g.computeBoundingBox();return g;};
  const mesh=(parent,role,g,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(g,mat);m.name=parent.name+'/'+role;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData={yiheCourtCenser:true,role,dimensionStatus:'MODEL_FIT_NOT_SURVEYED'};parent.add(m);return m;};
  for(const[index,[x,z]]of CENTERS.entries()){
   const f=new T.Group();f.name=ID+'/'+(index===0?'east':'west');f.position.set(x,0,z);frame.add(f);
   mesh(f,'plain-round-stone-base',lathe([[0,0],[1.05,0],[1.05,.08],[.96,.14],[.89,.24],[.89,.32],[.96,.36],[0,.36]],32),stone);
   // Three supporting legs are a simplified fit, not a count of hidden feet.
   for(let j=0;j<3;j++){const a=Math.PI/2+j*2*Math.PI/3;mesh(f,'fitted-foot-'+j,lathe([[0,0],[.14,0],[.13,.10],[.075,.38],[.10,.48],[0,.48]],12),metal,.43*Math.sin(a),.36,.43*Math.cos(a));}
   mesh(f,'plain-bellied-body',lathe([[0,.76],[.36,.76],[.53,.88],[.60,1.06],[.54,1.24],[.47,1.31],[.49,1.37],[0,1.37]],32),metal);
   for(const s of[-1,1]){const curve=new T.CatmullRomCurve3([[s*.48,1.05,0],[s*.74,1.12,0],[s*.78,1.38,0],[s*.64,1.50,0],[s*.49,1.38,0]].map(p=>new T.Vector3(...p)));mesh(f,'plain-open-handle-'+s,own(new T.TubeGeometry(curve,12,.055,6,false)),metal);}
   mesh(f,'lower-six-sided-canopy-fit',lathe([[0,1.37],[.46,1.37],[.88,1.41],[.88,1.46],[.68,1.50],[.49,1.62],[.37,1.70],[0,1.70]],6),metal);
   for(let j=0;j<6;j++){const a=j*2*Math.PI/6;mesh(f,'open-upper-post-'+j,own(new T.CylinderGeometry(.035,.035,.32,8)),metal,.34*Math.sin(a),1.85,.34*Math.cos(a));}
   mesh(f,'upper-ring-fit',lathe([[.29,1.98],[.38,1.98],[.38,2.05],[.29,2.05],[.29,1.98]],6),metal);
   mesh(f,'upper-six-sided-canopy-fit',lathe([[0,2.02],[.38,2.02],[.70,2.04],[.70,2.09],[.50,2.14],[.28,2.29],[.17,2.35],[0,2.35]],6),metal);
   mesh(f,'plain-finial-fit',lathe([[0,2.34],[.12,2.34],[.16,2.44],[.14,2.57],[.09,2.62],[0,2.62]],16),metal);
  }
  frame.updateWorldMatrix(true,true);
  frame.traverse(m=>{if(!m.isMesh)return;const g=new T.BufferGeometry();try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),b=shape.box.clone();b.triangleSupport=shape;b.yiheCourtCenser=true;b.yiheCourtCenserMesh=m.uuid;colliders.push(b);}finally{g.dispose();}});
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:'place-ningshou-d653a5843e-court-censers',originalObjectId:'FC-D653A5843E',name:'颐和轩前庭炉',scope:'PAIRED_EXTERIOR_CENSER_SILHOUETTE_FIT_ONLY',wholeObjectAccepted:false,surveyed:false,currentInventoryVerified:false,newRooms:0,newMapItems:0,source:'https://www.dpm.org.cn/explore/building/236516.html',image:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff004189c37.jpg',supported:['A pair of dark metal pavilion-lidded objects on pale round stone bases flanking the central court path'],fitted:['Coordinates, 2.10m bases, 2.62m overall height, six-sided canopy sections, simplified three feet and handles','Plain surfaces omit photographed casting and carved stone; material colour/alloy not verified'],unknown:['Exact survey, alloy, relief motifs, hidden sides, photography date and current inventory','Full Yihe building, sundial and other court objects are not reconstructed by this component'],centers:CENTERS.map(([x,z])=>({x,y:0,z})),roofSilhouettePolicy:'Object canopies are dark metal, not architectural roof-tile silhouettes'};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);done.add(kit);return{frame,meta,colliders,materials};
}
