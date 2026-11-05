import * as T from 'three';
import {applyBoxUV,applyBandUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate, triangleInstance} from '../../../utils/TriangleSupport.js';

const ID = 'xuanshou-south-front';
const ORIGINAL_ID = 'FC-73284DA281';
const complete = new WeakSet();
const HOST_RECORDS = [{"kind":"gate","name":"寿安门","x":277,"z":362,"gateProfile":"shouan-entry","gateKind":"three-wall-portals","rot":"south","open":true},{"kind":"courtWalls","x0":256.02,"x1":297.78,"z0":362,"z1":450,"gates":[{"side":"s","at":277,"gate":"寿安门"}],"source":"estimated"},{"kind":"hall","name":"寿安宫","x":276.9,"z":385.6,"w":27.3,"d":18.1,"pad":1,"ph":0.75,"colH":7.36,"roof":"xieshan","enter":true},{"kind":"hall","x":276.9,"z":430.56,"w":27.3,"d":9.64,"pad":0.6,"ph":0.45,"colH":6.08,"roof":"xieshan","map":"hall","source":"estimated"},{"kind":"region","name":"寿安宫","x0":256.02,"x1":297.78,"z0":362,"z1":450,"source":"estimated"}];
const SOURCE = 'https://img.dpm.org.cn/Uploads/Picture/dc/4669%5B1024%5D.jpg';
const PLAN = 'https://www.dpm.org.cn/Uploads/file/2025/03/12/1741766129CHfuBqmGf260.pdf';
export const XUANSHOU_FRONT_FIT = Object.freeze({
  center: Object.freeze([290.4,444.3]), body: Object.freeze([8.4,5.4]), bays: 3,
  reserve: Object.freeze({minX:284.8,maxX:296,minZ:439.8,maxZ:448.2}),
  platformHeight:.6, frontColumnZ:441.6, closedFacadeZ:443.3,
  outsideObservation: Object.freeze([290.4,0,438.6]),
  status:'REVERSIBLE_COMPRESSED_MODEL_FIT_NOT_SURVEY',
});
const mutable = a => Array.isArray(a) && Object.isExtensible(a) && Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone) {
  const r=kit?.root;
  let exists=false;
  r?.traverse(m=>{if(m.userData.structure?.sourceObjectId===ORIGINAL_ID)exists=true;});
  if(!r || r.name!=='outer-west' || r.parent || r.position.lengthSq() ||
    !r.quaternion.equals(new T.Quaternion()) || !r.scale.equals(new T.Vector3(1,1,1)) ||
    !r.matrix.equals(new T.Matrix4()) || !r.matrixWorld.equals(new T.Matrix4()) ||
    !Object.isExtensible(kit) || !mutable(r.children) ||
    ['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k])) ||
    !Array.isArray(zone.items) || HOST_RECORDS.some(h=>zone.items.filter(i=>JSON.stringify(i)===JSON.stringify(h)).length!==1) ||
    exists || complete.has(kit)) throw Error('Exact original mutable untransformed Xuanshou compound required, once only');
}

// One shared piecewise-linear profile for the actual low-detail roof, edges,
// hidden closure and bearings. All dimensions/curvature are a reversible fit.
const Z_KNOTS=Object.freeze([...new Set([-3.25,-3.1,-2.7,-1,2.7,3.1,3.25,...Array.from({length:25},(_,i)=>-3.1+6.2*i/24)])].sort((a,b)=>a-b));
const Y_KNOTS=Object.freeze(Z_KNOTS.map(z=>Math.fround(4.9+1.3*Math.pow(1-Math.abs(z)/3.25,1.5))));
function roofY(z) {
  let i=1;while(i<Z_KNOTS.length-1&&z>Z_KNOTS[i])i++;
  const a=Z_KNOTS[i-1],b=Z_KNOTS[i];
  return Y_KNOTS[i-1]+(Y_KNOTS[i]-Y_KNOTS[i-1])*(z-a)/(b-a);
}

/** One additive closed-front exterior, not either old central hall.
 * Photo supports south front/terrace/yellow eave only, not full roof taxonomy.
 * No room, interior teleport, fabricated name plaque or historical paving. */
export function buildXuanshouSouthFront(kit,zone) {
  if(zone?.id!=='outer-west')return false;
  validateHost(kit,zone);
  const frame=new T.Group();frame.name=ID;frame.position.set(...[290.4,0,444.3]);
  const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];
  let published=false;
  const cleanup=()=>{for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
  const own=g=>{geometries.add(g);return g;};
  const material=(name,color)=>{
    const key=name+':'+(color??'');
    if(!cache.has(key)){
      const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));
      m.name='r165_xuanshou_'+key.replace(':','_');
      if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}
      cache.set(key,m);
    }
    return cache.get(key);
  };
  const geometry=vertices=>{
    const g=own(new T.BufferGeometry());
    g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    g.computeVertexNormals();return applyBoxUV(g,2);
  };
  const quad=(v,a,b,c,d,normal)=>{
    const n=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));
    const q=n.dot(new T.Vector3(...normal))>=0?[a,b,c,a,c,d]:[a,c,b,a,d,c];v.push(...q.flat());
  };
  // Closed solid between two sampled height functions, with no interior seams.
  const solid=(x0,x1,z0,z1,top,bottom)=>{
    const zs=[z0,...Z_KNOTS.filter(z=>z>z0&&z<z1),z1],v=[];
    for(let i=1;i<zs.length;i++){
      const a=zs[i-1],b=zs[i],at=[x0,top(a),a],bt=[x0,top(b),b],ct=[x1,top(b),b],dt=[x1,top(a),a],ab=[x0,bottom(a),a],bb=[x0,bottom(b),b],cb=[x1,bottom(b),b],db=[x1,bottom(a),a];
      quad(v,at,bt,ct,dt,[0,1,0]);quad(v,ab,bb,cb,db,[0,-1,0]);
      quad(v,at,bt,bb,ab,[-1,0,0]);quad(v,dt,ct,cb,db,[1,0,0]);
      if(i===1)quad(v,at,dt,db,ab,[0,0,-1]);
      if(i===zs.length-1)quad(v,bt,ct,cb,bb,[0,0,1]);
    }
    return geometry(v);
  };
  const cylinder=(rt,rb,h,segments)=>{
    const v=[],point=(r,y,i)=>[r*Math.cos(i*2*Math.PI/segments),y,r*Math.sin(i*2*Math.PI/segments)];
    for(let i=0;i<segments;i++){
      const a=point(rt,h/2,i),b=point(rt,h/2,i+1),c=point(rb,-h/2,i+1),d=point(rb,-h/2,i);
      quad(v,a,b,c,d,[(a[0]+b[0])/2,0,(a[2]+b[2])/2]);
      v.push(0,h/2,0,...b,...a,0,-h/2,0,...d,...c);
    }
    return geometry(v);
  };
  const mesh=(role,g,m,x=0,y=0,z=0,stone=false)=>{
    const q=new T.Mesh(g,m);q.name=ID+'/'+role;q.userData.xuanshouRole=role;
    q.userData.xuanshouStone=stone;q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;frame.add(q);return q;
  };
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const g=solid(-w/2,w/2,-d/2,d/2,()=>h/2,()=>-h/2),tile=kit.lib.tileSize(name);(name==='caihua_beam'?applyBandUV:applyBoxUV)(g,tile);return mesh(role,g,material(name,color),x,y,z,stone);};
  const red=0x98584a,wood=0x855340,grid=0x4c5351,dark=0x303b37,grey=0x70746a,yellow=0xb69b53;
  try {
    box('stone-front-terrace','stone_slab',9,.6,5.8,0,.3,-.1,undefined,true);
    for(let i=1;i<=3;i++)box('central-step-'+i,'stone_slab',2.4,.2*i,.5,0,.1*i,-4.4999+(i-.5)*.5,undefined,true);
    const cheek=solid(-.075,.075,-4.4999,-3, z=>.05+(z+4.4999)*(.62/1.4999),()=>0);
    for(const x of[-1.275,1.275]){const g=x<0?cheek:own(new T.BufferGeometry());if(x>0)g.copy(cheek);mesh('sloping-stair-cheek',g,material('stone_slab'),x,0,0);}
    mesh('closed-unknown-core',solid(-4.2,4.2,-1,2.7,z=>roofY(z)-.128,()=>.6),material('wall_red',red));
    box('front-grey-masonry-plinth','wall_brick',8.4,.48,.1,0,.84,-1.05);
    for(const x of[-4.2,-1.4,1.4,4.2]){
      mesh('front-eave-column',cylinder(.13,.16,4,10),material('wood_column',wood),x,2.6,-2.7);
      box('front-facade-jamb','wood_column',.13,3.55,.14,x,2.375,-1.09,wood);
      const top=roofY(-2.7)-.14;
      box('roof-bearing','wood_column',.18,top-4.7+.012,.22,x,4.7+(top-4.7+.012)/2,-2.7,wood);
    }
    box('painted-front-beam','caihua_beam',8.55,.28,.26,0,4.6,-2.7);
    box('painted-facade-lintel','caihua_beam',8.35,.22,.14,0,4.24,-1.08);
    box('closed-central-front-door','wood_column',2.62,3.55,.12,0,2.375,-1.09,wood);
    for(const x of[-.65,.65]){
      box('closed-door-dark-upper-field','wood_column',1.2,2.2,.035,x,2.95,-1.17,dark);
      box('closed-door-plain-lower-panel','wood_column',1.2,1.12,.04,x,1.2,-1.18,wood);
      for(const dx of[-.6,-.2,.2,.6])box('fitted-door-coarse-lattice','wood_column',.028,2.2,.035,x+dx,2.95,-1.2,grid);
      for(const y of[1.85,2.4,2.95,3.5,4.05])box('fitted-door-coarse-lattice','wood_column',1.2,.028,.035,x,y,-1.2,grid);
    }
    for(const c of[-2.8,2.8]){
      box('side-window-dark-field','wood_column',2.56,3.05,.065,c,2.7,-1.09,dark);
      for(const dx of[-1.28,-.64,0,.64,1.28])box('fitted-side-window-lattice','wood_column',.035,3.05,.04,c+dx,2.7,-1.145,grid);
      for(const y of[1.18,1.78,2.38,2.98,3.58,4.2])box('fitted-side-window-lattice','wood_column',2.56,.035,.04,c,y,-1.145,grid);
      box('side-window-masonry-sill','wall_brick',2.6,.12,.18,c,1.12,-1.07);
    }
    const top=z=>roofY(z),bottom=z=>roofY(z)-.14;
    mesh('neutral-grey-roof',solid(-4.55,4.55,-3.1,3.1,top,bottom),material('roof_tile',grey));
    for(const[x0,x1,z0,z1]of[[-4.7,-4.55,-3.25,3.25],[4.55,4.7,-3.25,3.25],[-4.55,4.55,-3.25,-3.1],[-4.55,4.55,3.1,3.25]])mesh('yellow-eave-border',solid(x0,x1,z0,z1,top,bottom),material('roof_tile',yellow));
    // Seventeen coarse rows are a fitted visual cadence, not a source count.
    // The bottom vertex intersects the actual sampled plane along every segment.
    for(let i=0;i<17;i++){
      const x=-4.4+i*.55,zs=[-3.25,...Z_KNOTS.filter(z=>z>-3.25&&z<3.25),3.25],v=[],section=z=>[[x-.025,roofY(z)+.025,z],[x+.025,roofY(z)+.025,z],[x,roofY(z)-.012,z]];
      for(let j=1;j<zs.length;j++){const a=section(zs[j-1]),b=section(zs[j]);for(let k=0;k<3;k++){const next=(k+1)%3,n=k===0?[0,1,0]:[k===1?1:-1,-1,0];quad(v,a[k],b[k],b[next],a[next],n);}if(j===1)v.push(...a[0],...a[1],...a[2]);if(j===zs.length-1)v.push(...b[0],...b[2],...b[1]);}
      mesh('fitted-coarse-tile-row',geometry(v),material('roof_tile',grey));
      const cap=mesh('fitted-yellow-front-tile-end',cylinder(.034,.034,.055,6),material('roof_tile',yellow),x,roofY(-3.25)+.012,-3.26);cap.rotation.x=Math.PI/2;
    }
    frame.updateWorldMatrix(true,true);
    const bounds=new T.Box3().setFromObject(frame),R=XUANSHOU_FRONT_FIT.reserve;
    if(!new T.Box3(new T.Vector3(R.minX,-1e-6,R.minZ),new T.Vector3(R.maxX,9,R.maxZ)).containsBox(bounds))throw Error('Xuanshou escaped exact reserve '+JSON.stringify(bounds));
    let ordinal=0;
    frame.traverse(m=>{
      if(!m.isMesh)return;
      const bounds=new T.Box3().setFromObject(m);bounds.xuanshouMesh=m.uuid;
      if(m.userData.xuanshouStone){colliders.push(bounds);const top=bounds.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false});return;}
      const p=m.geometry.attributes.position,ix=m.geometry.index,v=[];
      for(let i=0;i<(ix?.count??p.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld));if(new T.Triangle(...q).getArea()<=1e-12)throw Error('Degenerate Xuanshou solid');v.push(...q.flatMap(p=>p.toArray()));}
      const g=new T.BufferGeometry();
      try{g.setAttribute('position',new T.Float32BufferAttribute(v,3));const instance=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ordinal++),b=instance.box.clone();b.triangleSupport=instance;b.xuanshouMesh=m.uuid;colliders.push(b);}finally{g.dispose();}
    });
    const meta={id:ID,name:'萱寿堂南面外观有限拟合',sourceObjectId:ORIGINAL_ID,originalOrdinal:384,bays:3,front:'SOUTH_MODEL_ZERO',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,fullRoofPhotoVerified:false,sourcePhoto:SOURCE,plan:PLAN,planPrintedPage:55,planFigure:10,photoDate:'UNKNOWN',dimensions:XUANSHOU_FRONT_FIT.status,roofEvidence:'PARTIAL_YELLOW_EAVE_NEUTRAL_COVER_FIT_NOT_CONFIRMED_TAXONOMY',newRooms:0,newMapItems:0,newTeleportTargets:0,outsideObservation:[...XUANSHOU_FRONT_FIT.outsideObservation],sourceSupported:['captioned south three-bay shaded front, grey terrace and short central steps with sloped stone sides','muted red/ochre timber, dark coarse window zones, painted front beam and local yellow eave','labelled plan: north-west rear member, front veranda south-facing'],fitted:['all world positions, body8.4x5.4, .6platform, three .2treads and simplified lattice divisions','neutral closed roof cover, thickness, curve,17coarse rows and hidden side/back closure; roof taxonomy not identified'],excluded:['renaming/consuming central Shouan shells, moving walls or extending reserve','K17/K18 credit, historic red/pink paving reconstruction, current interior/library inventory','fabricated architectural plaque, new room/map/interior teleport or current admission promise'],unknown:['full roof/gables and exact paint/lattice/step count, measurements and hidden construction','entire original compound registration, present visitor access and full-object acceptance','World/browser/GPU/mobile/performance']};
    frame.userData.structure=meta;
    const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
    try{kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);complete.add(kit);published=true;}
    catch(e){frame.removeFromParent();for(const[k,len]of Object.entries(lengths))kit[k].length=len;throw e;}
    return{frame,meta};
  } finally {if(!published)cleanup();}
}
