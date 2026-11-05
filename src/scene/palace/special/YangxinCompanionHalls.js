import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate, triangleInstance} from '../../../utils/TriangleSupport.js';

const ID = 'yangxin-companion-halls', done = new WeakSet();
const HOST = [{kind:'gate',name:'遵义门',x:70,z:248.9,rot:'east'}, {kind:'courtWalls',x0:70,x1:148,z0:240,z1:298,gates:[{side:'xmin',at:248.9,gate:'遵义门'}]}, {kind:'hall',name:'养心殿',x:108.6,z:277.5,w:36,d:12,pad:1,ph:.6,colH:7.68,roof:'xieshan',enter:true,throne:true}, {kind:'hall',x:87.6,z:290.9,w:16.9,d:8.7,pad:.5,ph:.45,colH:5.44,roof:'gable',brackets:false,map:'hall'}, {kind:'region',name:'养心殿',x0:70,x1:148,z0:240,z1:298,source:'estimated'}];
export const YANGXIN_COMPANION_FIT = Object.freeze([
  Object.freeze({key:'east',name:'养心殿东配殿',sourceObjectId:'FC-3C56B72795',x:82.75,z:262.4,front:'WEST',rotation:-Math.PI/2,reserve:Object.freeze([78,0,253,87.5,8,271.2])}),
  Object.freeze({key:'west',name:'养心殿西配殿',sourceObjectId:'FC-20D1EE8FAB',x:132.75,z:262.4,front:'EAST',rotation:Math.PI/2,reserve:Object.freeze([128,0,253,137.5,8,271.2])}),
]);
const mutable = a => Array.isArray(a) && Object.isExtensible(a) && Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit, zone) {
  const r=kit?.root; let duplicate=false;
  r?.traverse(m => {if(YANGXIN_COMPANION_FIT.some(p=>p.sourceObjectId===m.userData.structure?.sourceObjectId))duplicate=true});
  const exact = zone?.items && HOST.every(h=>zone.items.filter(i=>JSON.stringify(i)===JSON.stringify(h)).length===1);
  const main = r?.children.filter(m=>m.position.x===108.6&&m.position.y===0&&m.position.z===277.5);
  if(!r || r.name!=='west-six' || r.parent || r.position.lengthSq() || !r.quaternion.equals(new T.Quaternion()) || !r.scale.equals(new T.Vector3(1,1,1)) || !r.matrix.equals(new T.Matrix4()) || !r.matrixWorld.equals(new T.Matrix4()) || !Object.isExtensible(kit) || !mutable(r.children) || ['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k])) || !exact || main.length!==1 || duplicate || done.has(kit))throw Error('Exact mutable Yangxin companion host required, once only');
}
/** DPM2022 p97: five bays, one room depth; DPM2022 p73 /2023 p115:
 * distinct inward-facing front companions, not enclosure rooms or rear ears.
 * Aerial/photo palette is partial. All metrics, facade closures, roof sections,
 * hidden faces and simplified details are reversible fits, not a survey. */
export function buildYangxinCompanionHalls(kit, zone) {
  if(zone?.id!=='west-six')return false;
  validate(kit,zone);
  const geometries=new Set(), materials=new Set(), cache=new Map(), frames=[], metas=[], colliders=[], walkables=[];
  let published=false;
  const mat=(name,color)=>{
    const key=name+':'+color;
    if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_companion_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}
    return cache.get(key);
  };
  const tri=(v,a,b,c,n)=>{const normal=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));v.push(...a,...(normal.dot(new T.Vector3(...n))>=0?[...b,...c]:[...c,...b]))};
  const quad=(v,a,b,c,d,n)=>{tri(v,a,b,c,n);tri(v,a,c,d,n)};
  try {
    for(const p of YANGXIN_COMPANION_FIT){
      const f=new T.Group();f.name=ID+'/'+p.key;f.position.set(p.x,0,p.z);frames.push(f);
      const mesh=(role,v,name,color,stone=false)=>{
        const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,2);g.rotateY(p.rotation);
        const m=new T.Mesh(g,mat(name,color));m.name=f.name+'/'+role;m.userData={companionRole:role,companionStone:stone,companionKey:p.key};m.castShadow=m.receiveShadow=true;f.add(m);return m;
      };
      const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{
        const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,q=z-d/2,r=z+d/2,v=[];
        quad(v,[a,c,q],[a,e,q],[b,e,q],[b,c,q],[0,0,-1]);quad(v,[a,c,r],[b,c,r],[b,e,r],[a,e,r],[0,0,1]);
        quad(v,[a,c,q],[a,c,r],[a,e,r],[a,e,q],[-1,0,0]);quad(v,[b,c,q],[b,e,q],[b,e,r],[b,c,r],[1,0,0]);
        quad(v,[a,c,q],[b,c,q],[b,c,r],[a,c,r],[0,-1,0]);quad(v,[a,e,q],[a,e,r],[b,e,r],[b,e,q],[0,1,0]);return mesh(role,v,name,color,stone);
      };
      const prism=(role,left,right,section,name,color)=>{
        const v=[],faces=T.ShapeUtils.triangulateShape(section.map(([z,y])=>new T.Vector2(z,y)),[]),point=(x,i)=>[x,section[i][1],section[i][0]];
        for(const ids of faces){tri(v,...ids.map(i=>point(left,i)),[-1,0,0]);tri(v,...ids.map(i=>point(right,i)),[1,0,0])}
        for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dz=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(left,i),point(right,i),point(right,j),point(left,j),[0,dz,-dy])}return mesh(role,v,name,color);
      };
      const red=0x904538, stone=0x99978a, dark=0x4b4240, beam=0x3a6661, yellow=0xc69a43;
      box('grey-base',17.2,.25,6.1,0,.125,.05,'stone_slab',stone,true);
      for(let i=1;i<=2;i++)box('fitted-low-tread',2.8,.125*i,.5,0,.0625*i,-4.0+(i-.5)*.5,'stone_slab',stone,true);
      box('closed-hidden-core-fit',16.4,3.7,3.8,0,2.10,.85,'wall_red',red);
      for(const x of[-8.2,-4.92,-1.64,1.64,4.92,8.2])box('front-column',.26,3.7,.26,x,2.10,-2.65,'wood_column',red);
      for(const x of[-6.56,-3.28,3.28,6.56]){
        box('side-window-group',2.94,1.65,.10,x,2.65,-1.10,'wood_column',dark);
        for(const dx of[-1.45,0,1.45])box('fitted-window-mullion',.065,1.76,.055,x+dx,2.65,-1.18,'wood_column',red);
        for(const y of[1.82,2.65,3.48])box('fitted-window-rail',2.96,.065,.055,x,y,-1.18,'wood_column',red);
      }
      for(const x of[-.73,.73])box('central-closed-door-leaf',1.42,3.2,.12,x,1.85,-1.10,'wood_column',red);
      box('front-beam',16.6,.30,.30,0,3.84,-2.65,'caihua_beam',beam);
      box('front-roof-bearing',17,.20,.24,0,3.91,-2.65,'wood_column',red);
      box('rear-roof-bearing',17,.20,.24,0,3.91,2.65,'wood_column',red);
      box('ridge-roof-bearing',17,1.65,.18,0,4.675,0,'wood_column',red);
      box('closed-hidden-ceiling-fit',16.4,.12,5.4,0,3.91,.20,'wood_column',red);
      // Close the unseen body gables into the actual cover, with no invented interior.
      const gable=[[-1.05,3.70],[-1.05,4.79],[0,5.38],[2.65,3.91],[2.75,3.90],[2.75,3.70]];
      prism('closed-hidden-gable-fit',-8.25,-7.95,gable,'wall_red',red);
      prism('closed-hidden-gable-fit',7.95,8.25,gable,'wall_red',red);
      const top=[[-3.7,4.10],[-3.25,4.00],[-2.65,4.04],[0,5.50],[2.65,4.04],[3.25,4.00],[3.7,4.10]];
      prism('yellow-closed-gable-cover-fit',-8.75,8.75,[...top,...top.map(([z,y])=>[z,y-.16]).reverse()],'roof_tile',yellow);
      const rib=[...top.map(([z,y])=>[z,y+.055]),...top.map(([z,y])=>[z,y-.015]).reverse()];
      for(let i=0;i<23;i++){const x=-8.5+i*17/22;prism('yellow-continuous-rib',x-.055,x+.055,rib,'roof_tile',yellow)}
      box('yellow-straight-crown',17.55,.14,.18,0,5.51,0,'roof_tile',yellow);
      f.updateWorldMatrix(true,true);
      const bounds=new T.Box3().setFromObject(f),reserve=new T.Box3(new T.Vector3(...p.reserve.slice(0,3)),new T.Vector3(...p.reserve.slice(3)));reserve.min.y=-1e-6;
      if(!reserve.containsBox(bounds))throw Error('Companion escaped exact fitted reserve: '+p.key);
      kit.root.traverse(m=>{if(m.isMesh&&bounds.intersectsBox(new T.Box3().setFromObject(m)))throw Error('Companion reserve intersects old actual mesh: '+p.key)});
      if(kit.colliders.some(c=>bounds.intersectsBox(c)))throw Error('Companion reserve intersects old contact: '+p.key);
      for(const old of frames.slice(0,-1))if(bounds.intersectsBox(new T.Box3().setFromObject(old)))throw Error('Companion pair overlap');
      let ordinal=0;
      f.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);b.companionMesh=m.uuid;
        if(m.userData.companionStone){colliders.push(b);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}
        else{const shape=triangleInstance(createTriangleTemplate(m.geometry),f.position.toArray(),f.name+'/'+ordinal++),c=shape.box.clone();c.triangleSupport=shape;c.companionMesh=m.uuid;colliders.push(c)}
      });
      const meta={id:f.name,name:p.name,sourceObjectId:p.sourceObjectId,source:'https://img.dpm.org.cn/Uploads/File/2022/01/14/u61e0e8410e833.pdf',sourcePages:['print90 partial aerial','print97 five-bay one-depth text and east plan'],compoundPlan:'https://img.dpm.org.cn/Uploads/File/2023/11/14/u655324ce75cbc.pdf',compoundPlanPage:'print115 current investigated compound diagram, model coordinates are fitted',bays:5,depthBays:1,front:p.front,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,sourceSupported:['distinct front-court east/west companions, not rear ears or outer enclosure rooms','five bays and one room depth','east plan has projecting inward porch and central step; partial aerial yellow roof'],fitted:['absolute position, all metric dimensions and equal bay divisions','closed centre leaves, side window pattern, coarse colors and tile ribs','roof section, hidden back/ends and symmetric west porch/steps fit'],unknown:['current precise facade/roof details and photograph date','survey coordinates and exact dimensions','interiors, ritual furnishings and current admission'],excluded:['relabelled old anonymous rear shell','new rooms, maps, teleports, invented idols or furnishings','whole-object/GPU/mobile/performance acceptance'],newRooms:0,newMapItems:0,newTeleportTargets:0};f.userData.structure=meta;metas.push(meta);
    }
    const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
    try{kit.root.add(...frames);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);published=true}
    catch(e){for(const f of frames)f.removeFromParent();for(const[k,n]of Object.entries(lengths))kit[k].length=n;throw e}
    return {frames,metas};
  }finally{if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}}
}
