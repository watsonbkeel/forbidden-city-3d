import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='fuyi-three-bay', ORIGINAL_ID='FC-6C96E715D3', complete=new WeakSet();
const HOST_RECORDS=[{"kind":"gate","name":"寿安门","x":277,"z":362,"gateProfile":"shouan-entry","gateKind":"three-wall-portals","rot":"south","open":true},{"kind":"courtWalls","x0":256.02,"x1":297.78,"z0":362,"z1":450,"gates":[{"side":"s","at":277,"gate":"寿安门"}],"source":"estimated"},{"kind":"hall","name":"寿安宫","x":276.9,"z":385.6,"w":27.3,"d":18.1,"pad":1,"ph":0.75,"colH":7.36,"roof":"xieshan","enter":true},{"kind":"hall","x":276.9,"z":430.56,"w":27.3,"d":9.64,"pad":0.6,"ph":0.45,"colH":6.08,"roof":"xieshan","map":"hall","source":"estimated"},{"kind":"region","name":"寿安宫","x0":256.02,"x1":297.78,"z0":362,"z1":450,"source":"estimated"}];
export const FUYI_THREE_BAY_FIT=Object.freeze({center:Object.freeze([263.4,444.2]),reserve:Object.freeze({minX:257.8,maxX:269,minZ:439.8,maxZ:448.2}),body:Object.freeze([8,3.45]),bays:3,verandaDepth:1.5,platformHeight:.3,status:'TEXT_PLAN_GUIDED_REVERSIBLE_COMPRESSED_MODEL_FIT_NOT_SURVEY'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){
  const r=kit?.root;let duplicate=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId===ORIGINAL_ID)duplicate=true});
  if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k]))||!Array.isArray(zone.items)||HOST_RECORDS.some(h=>zone.items.filter(i=>JSON.stringify(i)===JSON.stringify(h)).length!==1)||duplicate||complete.has(kit))throw Error('Exact original mutable Fuyi compound required, once only');
}
/** Only the labelled plan's east rear three bays and south veranda are sourced.
 * No K18 exterior photograph has been identified. Cover, panels, colours, steps,
 * dimensions and hidden closure are deliberately plain reversible model fits. */
export function buildFuyiThreeBay(kit,zone){
  if(zone?.id!=='outer-west')return false;
  validateHost(kit,zone);
  const frame=new T.Group();frame.name=ID;frame.position.set(263.4,0,444.2);
  const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];let published=false;
  const material=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_fuyi_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}return cache.get(key)};
  const triangle=(out,a,b,c,normal)=>{const n=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));out.push(...a,...(n.dot(new T.Vector3(...normal))>=0?[...b,...c]:[...c,...b]))};
  const quad=(out,a,b,c,d,n)=>{triangle(out,a,b,c,n);triangle(out,a,c,d,n)};
  const geometry=v=>{const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();return applyBoxUV(g,2)};
  const mesh=(role,vertices,name,color,stone=false)=>{const g=geometry(vertices),m=new T.Mesh(g,material(name,color));m.name=ID+'/'+role;m.userData.fuyiRole=role;m.userData.fuyiStone=stone;m.castShadow=m.receiveShadow=true;frame.add(m);return m};
  const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2,v=[];quad(v,[a,c,f],[a,e,f],[b,e,f],[b,c,f],[0,0,-1]);quad(v,[a,c,g],[b,c,g],[b,e,g],[a,e,g],[0,0,1]);quad(v,[a,c,f],[a,c,g],[a,e,g],[a,e,f],[-1,0,0]);quad(v,[b,c,f],[b,e,f],[b,e,g],[b,c,g],[1,0,0]);quad(v,[a,c,f],[b,c,f],[b,c,g],[a,c,g],[0,-1,0]);quad(v,[a,e,f],[a,e,g],[b,e,g],[b,e,f],[0,1,0]);return mesh(role,v,name,color,stone)};
  const stone=0x827f75,wood=0x766352,wall=0xa09684,roof=0x74766f,infill=0x515452;
  try{
    box('stone-porch-platform',8.8,.3,5.8,0,.15,.1,'stone_slab',stone,true);
    for(let i=1;i<=2;i++)box('fitted-low-step',2.2,.15*i,.6,0,.075*i,-4.0+(i-.5)*.6,'stone_slab',stone,true);
    box('closed-unknown-core',8,4.1,3.45,0,2.35,.625,'wall_red',wall);
    for(const x of[-3.9,-1.3,1.3,3.9]){
      box('south-veranda-column',.2,3.95,.2,x,2.275,-2.6,'wood_column',wood);
      box('plain-facade-bay-jamb',.1,4.1,.14,x,2.35,-1.14,'wood_column',wood);
    }
    for(const x of[-2.6,0,2.6])box('plain-closed-bay-infill',2.4,2.9,.1,x,2.25,-1.14,'wood_column',infill);
    box('south-veranda-header',8.4,.53,.24,0,4.415,-2.6,'wood_column',wood);
    box('rear-roof-header',8.4,.6,.24,0,4.45,2.35,'wood_column',wood);
    box('middle-roof-bearing',8.4,.96,.18,0,4.88,0,'wood_column',wood);
    box('plain-veranda-ceiling',8.2,.1,4.9,0,4.4,-.1,'wood_column',wood);
    // One closed six-edge section: real thickness, no photographic roof taxonomy.
    const section=[[-3.2,4.6],[0,5.45],[3.2,4.6],[3.2,4.46],[0,5.31],[-3.2,4.46]],v=[],contour=section.map(([z,y])=>new T.Vector2(z,y)),faces=T.ShapeUtils.triangulateShape(contour,[]),point=(x,i)=>[x,section[i][1],section[i][0]];
    for(const ids of faces){triangle(v,...ids.map(i=>point(-4.65,i)),[-1,0,0]);triangle(v,...ids.map(i=>point(4.65,i)),[1,0,0])}
    for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dz=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(-4.65,i),point(4.65,i),point(4.65,j),point(-4.65,j),[0,dz,-dy])}
    mesh('plain-roof-cover-fit',v,'roof_tile',roof);
    frame.updateWorldMatrix(true,true);
    const R=FUYI_THREE_BAY_FIT.reserve,bounds=new T.Box3().setFromObject(frame);if(!new T.Box3(new T.Vector3(R.minX,-1e-6,R.minZ),new T.Vector3(R.maxX,9,R.maxZ)).containsBox(bounds))throw Error('Fuyi escaped exact eastern reserve');
    let ordinal=0;
    frame.traverse(m=>{if(!m.isMesh)return;const box=new T.Box3().setFromObject(m);box.fuyiMesh=m.uuid;if(m.userData.fuyiStone){colliders.push(box);const top=box.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}else{const shape=triangleInstance(createTriangleTemplate(m.geometry),frame.position.toArray(),ID+'/'+ordinal++),c=shape.box.clone();c.triangleSupport=shape;c.fuyiMesh=m.uuid;colliders.push(c)}});
    const meta={id:ID,name:'福宜斋三开间南廊有限拟合',sourceObjectId:ORIGINAL_ID,originalOrdinal:383,bays:3,front:'SOUTH_MODEL_ZERO',location:'EAST_REAR_SHOUAN_THIRD_COURT_MODEL_FIT',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,exteriorPhotoVerified:false,roofPhotoVerified:false,evidenceScope:'TEXT_AND_LABELLED_PLAN_ONLY_NO_IDENTIFIED_K18_EXTERIOR_PIXELS',source:'https://www.dpm.org.cn/explore/building/236505.html',plan:'https://www.dpm.org.cn/Uploads/file/2025/03/12/1741766129CHfuBqmGf260.pdf',planPrintedPage:55,planFigure:10,dimensions:FUYI_THREE_BAY_FIT.status,sourceSupported:['independent three-bay east rear member of Shouan third court','labelled plan south-veranda relationship'],fitted:['roof section, panels, colours, step count and all dimensions','plain opaque hidden closure and compressed world placement'],excluded:['K19 facade/eave/photo copying','renaming central retained shells or moving walls','invented plaque/couplet, period interior, current access or photo acceptance'],unknown:['identified present K18 exterior/roof/gable image','survey dimensions and exact placement, actual doors/windows/colours','interior, current admission, browser/GPU/mobile/performance'],newRooms:0,newMapItems:0,newTeleportTargets:0,outsideObservation:[263.4,0,438.6]};frame.userData.structure=meta;
    const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
    try{kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);complete.add(kit);published=true}catch(e){frame.removeFromParent();for(const[k,n]of Object.entries(lengths))kit[k].length=n;throw e}
    return{frame,meta};
  }finally{if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}}
}
