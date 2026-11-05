import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='danyuan-eleven-bay-hall',done=new WeakSet();
export const DANYUAN_ELEVEN_BAY_FIT=Object.freeze({x:216,z:442,
  reserves:Object.freeze([Object.freeze([197,0,436,235,14,449]),Object.freeze([213,0,434,219,3,436])])});
const HOST={kind:'gate',name:'建福门',x:183.7,z:409.4};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){
  const root=kit?.root,owners=[];root?.traverse(o=>{if(o.userData.structure?.sourceObjectId)owners.push(o)});
  const context=[['FC-66378DAD81',216,422],['FC-255E648E8D',187.5,449.5]];
  if(!root||root.name!=='outer-west'||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(root)||!Object.isExtensible(kit)||!mutable(root.children)||['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k]))||!zone.items||[HOST,COURT].some(h=>zone.items.filter(q=>JSON.stringify(q)===JSON.stringify(h)).length!==1)||context.some(([id,x,z])=>{const a=owners.filter(o=>o.userData.structure.sourceObjectId===id);return a.length!==1||!a[0].position.equals(new T.Vector3(x,0,z))||!a[0].quaternion.equals(new T.Quaternion())||!a[0].scale.equals(new T.Vector3(1,1,1))})||owners.some(o=>o.userData.structure.sourceObjectId==='FC-87A0A561ED')||done.has(kit))throw Error('Exact mutable public93d Danyuan north host required, once only');
}

/** The whole building has eleven bays and two levels. Seven-bay Buddhist
 * decoration describes an interior subset, which is deliberately not built.
 * Absolute coordinates, dimensions, roof classification and openings are fits. */
export function buildDanyuanElevenBayHall(kit,zone){
  if(zone?.id!=='outer-west')return false;
  validate(kit,zone);
  const p=DANYUAN_ELEVEN_BAY_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
  const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];
  let published=false;
  const material=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_danyuan_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}return cache.get(key)};
  const tri=(v,a,b,c,n)=>{const cross=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));v.push(...a,...(cross.dot(new T.Vector3(...n))>=0?[...b,...c]:[...c,...b]))};
  const quad=(v,a,b,c,d,n)=>{tri(v,a,b,c,n);tri(v,a,c,d,n)};
  try{
    const mesh=(role,v,name,color,stone=false)=>{const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,2);const m=new T.Mesh(g,material(name,color));m.name=ID+'/'+role;m.userData={danyuanRole:role,danyuanStone:stone};m.castShadow=m.receiveShadow=true;frame.add(m);return m};
    const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,q=z-d/2,r=z+d/2,v=[];
      quad(v,[a,c,q],[a,e,q],[b,e,q],[b,c,q],[0,0,-1]);quad(v,[a,c,r],[b,c,r],[b,e,r],[a,e,r],[0,0,1]);
      quad(v,[a,c,q],[a,c,r],[a,e,r],[a,e,q],[-1,0,0]);quad(v,[b,c,q],[b,e,q],[b,e,r],[b,c,r],[1,0,0]);
      quad(v,[a,c,q],[b,c,q],[b,c,r],[a,c,r],[0,-1,0]);quad(v,[a,e,q],[a,e,r],[b,e,r],[b,e,q],[0,1,0]);return mesh(role,v,name,color,stone)};
    const prism=(role,left,right,section,name,color)=>{const v=[],faces=T.ShapeUtils.triangulateShape(section.map(([z,y])=>new T.Vector2(z,y)),[]),point=(x,i)=>[x,section[i][1],section[i][0]];
      for(const ids of faces){tri(v,...ids.map(i=>point(left,i)),[-1,0,0]);tri(v,...ids.map(i=>point(right,i)),[1,0,0])}
      for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dz=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(left,i),point(right,i),point(right,j),point(left,j),[0,dz,-dy])}
      return mesh(role,v,name,color)};
    const stone=0xaaa69b,red=0x984a35,dark=0x394b3f,green=0x34584e,yellow=0xc3a151;
    box('stone-platform',35,.45,10,0,.225,0,'stone_slab',stone,true);
    for(let i=1;i<=3;i++)box('low-tread',3,.15*i,.55,0,.075*i,-6.65+(i-.5)*.55,'stone_slab',stone,true);
    box('closed-lower-core-fit',33,3.35,6,0,2.125,0,'wall_red',red);
    box('real-upper-floor-fit',33,.2,6.9,0,3.9,-.15,'wood_column',red);
    box('closed-upper-core-fit',33,4.3,6,0,6.15,0,'wall_red',red);
    box('lower-front-floor-header-fit',33.3,.3,.36,0,3.9,-3.35,'wood_column',red);
    for(const [level,bottom,top] of [['lower',.45,3.85],['upper',4,8.2]]){
      for(let i=0;i<=11;i++)box(level+'-front-post',.24,top-bottom,.28,-16.5+3*i,(bottom+top)/2,-3.35,'wood_column',red);
      for(let i=0;i<11;i++)box(level+'-front-field-fit',2.72,level==='lower'?2.65:3.45,.12,-15+3*i,level==='lower'?2.05:6.1,-3.06,'wood_column',dark);
    }
    for(const y of [1.6,2.6,5.4,6.6])box('coarse-fitted-continuous-window-rail',32.9,.055,.07,0,y,-3.15,'wood_column',red);
    const roofHeight=z=>9.6-1.7*Math.abs(z)/4.4;
    const roofSection=[[-4.4,7.76],[-4.4,7.9],[0,9.6],[4.4,7.9],[4.4,7.76],[0,9.46]];
    prism('closed-fitted-roof',-17.6,17.6,roofSection,'roof_tile',green);
    for(const z of [-4.4,4.4])box('yellow-eave-edge-fit',35.02,.2,.18,0,7.89,z,'roof_tile',yellow);
    const edgeSection=[[-4.4,7.73],[-4.4,7.96],[0,9.66],[4.4,7.96],[4.4,7.73],[0,9.43]];
    for(const x of [-17.6,17.6])prism('yellow-end-edge-fit',x-.09,x+.09,edgeSection,'roof_tile',yellow);
    box('straight-fitted-ridge-edge',35.04,.14,.2,0,9.64,0,'roof_tile',yellow);
    for(const sign of [-1,1])for(let i=1;i<=8;i++){const z=sign*i*.5,a=z-.035,b=z+.035;prism('coarse-fitted-tile-course',-17.48,17.48,[[a,roofHeight(a)-.02],[a,roofHeight(a)+.025],[b,roofHeight(b)+.025],[b,roofHeight(b)-.02]],'roof_tile',green)}
    for(const [role,z] of [['front-roof-bearing',-3],['rear-roof-bearing',3]])box(role,33.3,.4,.34,0,8.3,z,'wood_column',red);
    box('ridge-bearing',33,.28,.22,0,9.34,0,'wood_column',red);
    const end=[[-3,8.2],[-3,roofHeight(-3)-.12],[0,roofHeight(0)-.12],[3,roofHeight(3)-.12],[3,8.2]];
    for(const x of [-16.5,16.5])prism('closed-end-gable-bearing',x-.12,x+.12,end,'wall_red',red);
    frame.updateWorldMatrix(true,true);
    const reserves=p.reserves.map(v=>new T.Box3(new T.Vector3(...v.slice(0,3)),new T.Vector3(...v.slice(3))));
    // Partition each actual mesh AABB at every reserve boundary. Each resulting
    // closed sub-box must fit one reserve. This covers faces/interiors too:
    // merely checking vertices would miss triangles spanning the T concavity.
    const covered=b=>{
      const cuts=['x','y','z'].map(axis=>[...new Set([b.min[axis],b.max[axis],...reserves.flatMap(r=>[r.min[axis],r.max[axis]]).filter(v=>v>b.min[axis]&&v<b.max[axis])])].sort((a,b)=>a-b));
      const spans=cuts.map(a=>a.length===1?[[a[0],a[0]]]:a.slice(1).map((v,i)=>[a[i],v]));
      for(const x of spans[0])for(const y of spans[1])for(const z of spans[2]){
        const cell=new T.Box3(new T.Vector3(x[0],y[0],z[0]),new T.Vector3(x[1],y[1],z[1]));
        if(!reserves.some(r=>r.clone().expandByScalar(2e-6).containsBox(cell)))return false;
      }
      return true;
    };
    const boxes=[];frame.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);if(!covered(b))throw Error('Danyuan actual mesh escaped exact two-box union: '+m.name);boxes.push([m,b])});
    kit.root.traverse(m=>{if(m.isMesh){const b=new T.Box3().setFromObject(m);if(boxes.some(([,q])=>q.intersectsBox(b)))throw Error('Danyuan intersects old actual mesh')}});
    if(kit.colliders.some(c=>boxes.some(([,b])=>b.intersectsBox(c))))throw Error('Danyuan intersects old contact');
    let ordinal=0;for(const [m,b] of boxes){if(m.userData.danyuanStone){b.danyuanMesh=m.uuid;colliders.push(b);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}else{const support=triangleInstance(createTriangleTemplate(m.geometry),frame.position.toArray(),ID+'/'+ordinal++),c=support.box.clone();c.triangleSupport=support;c.danyuanMesh=m.uuid;colliders.push(c)}}
    const meta={id:ID,name:'淡远楼',sourceObjectId:'FC-87A0A561ED',originalOrdinal:'H30',bays:11,levels:2,source:'https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf',sourcePages:['printed20 named plan and compound exterior','printed23 whole building history and seven-bay interior decoration subset'],relativePositionSource:'https://www.dpm.org.cn/learing_detail/261960.html',reconstructionSource:'https://www.dpm.org.cn/classify_detail/181812.html',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,interiorComplete:false,historicGardenLinkComplete:false,sourceSupported:['eleven-bay whole rear building, two levels after1769','north of Zhongzheng main hall and west of Jianfu compound in the official relationship diagram','reconstructed after the1923fire; official completion report2012'],fitted:['absolute position/orientation, all dimensions and eleven equal3m bay intervals','closed two-slope roof classification, straight ridge, hidden thickness and structural bearings','coarse green-field/yellow-edge palette from the named2021compound photo, not complete facade acceptance','closed repetitive front fields, side/rear cores, upper floor and lower porch','three low stone treads and real platform, access only by retained Jianfu-gate bypass'],unknown:['surveyed footprint/roof classification, precise visible joinery and rear/side elevations','actual entry and internal floor/ceiling/beam organization','current admission and physical connection with the northern garden'],excluded:['seven-bay whole-building substitution or invented Buddhist interiors/statues/inscriptions','old wall cuts/moves, other buildings, rear companion rooms or garden link','new rooms/map items/teleports, whole-court/photo/GPU/mobile/performance acceptance'],newRooms:0,newMapItems:0,newTeleportTargets:0};frame.userData.structure=meta;
    const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
    try{kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);published=true}catch(e){frame.removeFromParent();for(const [k,n] of Object.entries(lengths))kit[k].length=n;throw e}
    return {frame,meta};
  }finally{if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}}
}
