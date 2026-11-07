import * as T from 'three';
import {createTriangleTemplate, triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='dafotang-shakyamuni-historical-fit', PLACE='place-outer-west-6cae88b6a2';
const done=new WeakSet(), mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-10;
function validate(c){
 const {kit,f,g,p,item}=c??{},root=kit?.root;
 if(done.has(f)||g?.historicalPrincipal||f?.children.some(o=>o.userData?.dafotangPrincipal===ID))throw Error('Dafotang duplicate historical principal refused');
 if(p?.id!==PLACE||p.key!=='dafotang'||p.zone!=='outer-west'||item?.name!=='大佛堂'||item.kind!=='hall'||item.x!==221.9||item.z!==241.1||item.w!==45.7||item.d!==16.2||item.ph!==.9||item.colH!==7.84||
    g?.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.h!==7.84||g.bays!==7||g.front!==-8.1||g.rear!==8.1||
    g.inventory?.status!=='UNKNOWN'||g.inventory.knownEmpty!==false||g.inventory.accepted!==false||g.inventory.entityId!==PLACE||g.inventory.withheldMeshCount!==8||g.inventory.withheldColliderCount!==8||
    !Array.isArray(g.warmRoomPartitions)||g.warmRoomPartitions.length!==2||g.warmRoomPartitions.some((q,i)=>!near(q.x,[-1,1][i]*45.7/7*1.5)||!near(q.doorZ,-5.9)||q.doorW!==1.8||q.doorH!==2.65)||
    !root||f?.parent!==root||root.name!=='outer-west'||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||
    !f.position.equals(new T.Vector3(221.9,0,241.1))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||
    !f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!root.matrixAutoUpdate||!root.matrixWorldAutoUpdate||!Object.isExtensible(g)||!mutable(f.children)||
    ['colliders','owned','walkables','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k])))throw Error('Dafotang exact unchanged host and UNKNOWN inventory required');
}

/** Historical middle Shakyamuni only, based on the named front photograph.
 * The 2.25 m figure-and-lotus height is sourced. Support, placement, depth,
 * simplified back, face, fingers, folds and lacquer/gold colors are model fits.
 * No change to UNKNOWN whole-hall inventory or visitor access is implied. */
export function buildDafotangMainBuddha(c){
 validate(c);
 const {kit,f,g}=c,frame=new T.Group(),meshes=[],contacts=[],geometries=new Set(),materials=[];
 frame.name=ID;frame.userData.dafotangPrincipal=ID;
 let published=false;
 const own=geo=>{geometries.add(geo);return geo;};
 const material=(name,color,metalness,roughness)=>{const m=new T.MeshStandardMaterial({name:'dafotang_principal_'+name,color,metalness,roughness});materials.push(m);return m;};
 const gold=material('worn_gold',0xb27a39,.35,.65),red=material('red_lacquer',0x723125,.12,.75),dark=material('dark_curls',0x34312a,.08,.85),stone=material('fitted_support',0x685241,.05,.85);
 // Remove only collapsed parameterisation poles, before BOTH rendering and
 // collision creation. Every remaining visible triangle is used by physics.
 function clean(geo){
  own(geo);const p=geo.attributes.position,ix=geo.index,indices=[],a=new T.Vector3(),b=new T.Vector3(),d=new T.Vector3();
  for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);d.fromBufferAttribute(p,ids[2]);if(new T.Triangle(a,b,d).getArea()>1e-12)indices.push(...ids);}
  geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingBox();return geo;
 }
 function add(role,part,geo,mat=gold,extra={}){
  geo.translate(0,1.7,5.6);const m=new T.Mesh(clean(geo),mat);m.name=ID+'/'+role;m.castShadow=m.receiveShadow=true;m.userData={role,part,...extra};frame.add(m);meshes.push(m);return m;
 }
 function ellipsoid(role,part,pos,scale,mat=gold,segments=16,rings=10,rot=0){
  const geo=own(new T.SphereGeometry(1,segments,rings));geo.scale(...scale);geo.rotateZ(rot);geo.translate(...pos);return add(role,part,geo,mat);
 }
 // Close only the known open rims of a tube or a cropped cap, with faces
 // opposite to their boundary edges. Rendering and collision use the result.
 function closeRims(geo){
  const p=geo.attributes.position,ix=Array.from(geo.index.array),vertices=Array.from(p.array),edgeMap=new Map();
  const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e7)).join(',');
  for(let i=0;i<ix.length;i+=3)for(const[a,b]of[[ix[i],ix[i+1]],[ix[i+1],ix[i+2]],[ix[i+2],ix[i]]]){const ka=key(a),kb=key(b);if(ka===kb)continue;const k=[ka,kb].sort().join('|');if(edgeMap.has(k))edgeMap.delete(k);else edgeMap.set(k,{a,b,ka,kb});}
  const remaining=[...edgeMap.values()];
  while(remaining.length){const loop=[remaining.shift()];while(loop.at(-1).kb!==loop[0].ka){const i=remaining.findIndex(e=>e.ka===loop.at(-1).kb);if(i<0)throw Error('Dafotang open-rim topology mismatch');loop.push(remaining.splice(i,1)[0]);}
   const center=new T.Vector3();for(const e of loop)center.add(new T.Vector3().fromBufferAttribute(p,e.a));center.multiplyScalar(1/loop.length);const id=vertices.length/3;vertices.push(...center.toArray());for(const e of loop)ix.push(e.b,e.a,id);
  }
  for(const name of Object.keys(geo.attributes))geo.deleteAttribute(name);geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(ix);return geo;
 }
 function tube(role,points,radius=.012,mat=gold,segments=12){
  const closed=role==='waist-tie',path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed);
  const geo=own(new T.TubeGeometry(path,segments,radius,5,closed));return add(role,'robe-relief',closed?geo:closeRims(geo),mat);
 }
 // Closed pointed petal with one front ridge. Four rings around its narrow
 // cross section keep eight tiers legible without copying an unknown motif.
 function petal(role,tier,angle,y,radius,length,width){
  const v=[],idx=[],rows=4,sides=6;
  for(let j=0;j<=rows;j++){const t=j/rows,s=Math.sin(Math.PI*t),w=width*Math.pow(Math.max(0,s),.65)*(1.15-.45*t),rad=radius+.030*s-.014*t;
   for(let k=0;k<sides;k++){const a=2*Math.PI*k/sides,across=w*Math.cos(a),depth=.036*s*Math.sin(a);v.push((rad+depth)*Math.sin(angle)+across*Math.cos(angle),y+length*t,(rad+depth)*Math.cos(angle)-across*Math.sin(angle));}}
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const a=j*sides+k,b=j*sides+(k+1)%sides,d=a+sides,e=b+sides;idx.push(a,d,b,b,d,e);}
  const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(idx);return add(role,'lotus-petal',geo,gold,{tier});
 }
 try{
  // Three closed, solid support courses, not part of the sourced 2.25 m.
  for(const [role,w,h,d,y]of[['support-foot',2.2,.16,1.8,-.72],['support-waist',1.90,.46,1.52,-.41],['support-top',2.12,.18,1.72,-.09]]){
   const geo=own(new T.BoxGeometry(w,h,d));geo.translate(0,y,0);add(role,'support',geo,stone);
  }
  ellipsoid('curled-lotus-leaf-base','lotus',[0,.075,0],[.50,.075,.44],gold,24,8);
  // Wide curling bottom leaves instead of a necklace of small round beads.
  for(let k=0;k<6;k++){
   const angle=2*Math.PI*k/6,v=[],indices=[],rows=6,sides=6;
   for(let j=0;j<=rows;j++){const t=j/rows,span=Math.sin(Math.PI*t),r=.20+.34*t,y=.055+.040*Math.sin((t-.3)*Math.PI*1.8);for(let q=0;q<sides;q++){const a=2*Math.PI*q/sides,w=.22*span*Math.cos(a),th=.012*span*Math.sin(a);v.push(r*Math.sin(angle)+w*Math.cos(angle),y+th,r*Math.cos(angle)-w*Math.sin(angle));}}
   for(let j=0;j<rows;j++)for(let q=0;q<sides;q++){const a=j*sides+q,b=j*sides+(q+1)%sides,d=a+sides,e=b+sides;indices.push(a,b,d,b,e,d);}
   const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(indices);add('curled-base-leaf-'+k,'lotus',geo,gold);
  }
  // A single restrained lotus tone avoids an invented alternating color pattern.
  // Photo-guided upper-wide silhouette. All radii and depth are fits, not
  // measured sections. Eight tiers remain separate from the petal-count fit.
  const coreProfile=[[.03,.30],[.10,.34],[.22,.43],[.38,.52],[.54,.58],[.70,.62],[.82,.64],[.86,.59]];
  const core=own(new T.LatheGeometry(coreProfile.map(([y,r])=>new T.Vector2(r,y)),32));core.scale(1,1,.92);add('upper-wide-lotus-core','lotus',closeRims(core),gold);
  const radii=[.40,.47,.55,.61,.66,.69,.70,.68];
  for(let tier=1;tier<=8;tier++){
   const y=.07+(tier-1)*.094,count=24;
   for(let k=0;k<count;k++)petal('lotus-tier-'+tier+'-petal-'+k,tier,2*Math.PI*(k+(tier%2)*.5)/count,y,radii[tier-1],.175,.087);
  }
  ellipsoid('lotus-seat','lotus',[0,.84,0],[.66,.065,.56],gold,24,8);
  // The robe is a continuous rounded volume with broad covered shoulders,
  // narrower waist and intersecting draped legs, not a generic bare torso.
  const profileKnots=[[.99,.33,.20],[1.10,.34,.22],[1.28,.32,.21],[1.47,.37,.22],[1.65,.40,.21],[1.75,.32,.18],[1.81,.16,.14]];
  const curve=new T.CatmullRomCurve3(profileKnots.map(p=>new T.Vector3(...p))),profiles=Array.from({length:16},(_,i)=>curve.getPoint(i/15).toArray());
  const v=[],ix=[],n=24;
  for(const[y,rx,rz]of profiles)for(let k=0;k<n;k++){const a=2*Math.PI*k/n;v.push(rx*Math.sin(a),y,rz*Math.cos(a)+.035);}
  for(let j=0;j<profiles.length-1;j++)for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n,d=a+n,e=b+n;ix.push(a,b,d,b,e,d);}
  const bottom=v.length/3;v.push(0,profiles[0][0],.035);const top=v.length/3;v.push(0,profiles.at(-1)[0],.035);
  for(let k=0;k<n;k++){ix.push(bottom,(k+1)%n,k);const o=(profiles.length-1)*n;ix.push(top,o+k,o+(k+1)%n);}
  const torso=own(new T.BufferGeometry());torso.setAttribute('position',new T.Float32BufferAttribute(v,3));torso.setIndex(ix);add('covered-shoulders','robe',torso,red);
  ellipsoid('crossed-knees','robe',[-.35,.99,-.06],[.30,.16,.29],gold,20,10,-.10);
  ellipsoid('right-rounded-knee','robe',[.35,.97,-.06],[.30,.16,.29],gold,20,10,.10);
  ellipsoid('right-folded-shin','robe',[.09,1.065,-.25],[.40,.115,.15],red,20,8,-.12);
  ellipsoid('left-folded-foot','foot',[-.20,1.135,-.23],[.19,.07,.12],gold,16,8,.10);
  // Shoulder-to-wrist sleeves are different on the two sides, matching the
  // downward anatomical right (+X) and upward left (-X) palm in the front photo.
  for(const side of[-1,1]){
   const points=side>0?[[.22,1.68,.02],[.32,1.52,.015],[.34,1.35,-.06],[.36,1.15,-.23]]:[[-.22,1.68,.02],[-.32,1.52,.025],[-.33,1.35,-.05],[-.23,1.21,-.23]];
   const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),geo=own(new T.TubeGeometry(path,12,1,10,false)),a=geo.attributes.position;
   for(let j=0;j<=12;j++){const t=j/12,center=path.getPointAt(t),radius=.090+.035*Math.sin(Math.PI*t)-.018*t*t;for(let k=0;k<=10;k++){const i=j*11+k,v=new T.Vector3().fromBufferAttribute(a,i).sub(center).multiplyScalar(radius*(1+.025*Math.sin(k*Math.PI+3*t))).add(center);a.setXYZ(i,v.x,v.y,v.z);}}
   // Two shallow continuous folds follow actual sleeve surface vertices.
   // They are fitted cloth relief, not a copied embroidery pattern.
   const foldPoints=[[],[]];
   for(let j=1;j<12;j++){let k0=0;for(let k=1;k<10;k++)if(a.getZ(j*11+k)<a.getZ(j*11+k0))k0=k;
    for(let k=0;k<2;k++)foldPoints[k].push(new T.Vector3().fromBufferAttribute(a,j*11+(k0+k)%10));}
   add(side>0?'right-draped-sleeve':'left-draped-sleeve','robe',closeRims(geo),red);
   for(let k=0;k<2;k++){const line=new T.CatmullRomCurve3(foldPoints[k]),fold=own(new T.TubeGeometry(line,12,1,6,false)),p=fold.attributes.position;
    for(let j=0;j<=12;j++){const t=j/12,center=line.getPointAt(t),tangent=line.getTangentAt(t),across=new T.Vector3(tangent.y,-tangent.x,0).normalize(),width=.016*Math.sin(Math.PI*t)+.003;
     for(let q=0;q<=6;q++){const angle=2*Math.PI*q/6,v=center.clone().addScaledVector(across,width*Math.cos(angle));v.z+=.0035*Math.sin(angle)-.001;p.setXYZ(j*7+q,v.x,v.y,v.z);}}
    add('sleeve-fold-'+side+'-'+k,'robe-relief',closeRims(fold),gold);
   }
  }
  ellipsoid('right-wrist','hand',[.36,1.14,-.29],[.065,.12,.065],gold,12,8,-.25);
  const hand=own(new T.SphereGeometry(1,16,10));hand.scale(.075,.12,.041);hand.rotateZ(-.20);hand.translate(.30,1.045,-.385);add('right-hand-down','hand',hand,gold);
  ellipsoid('right-thumb','hand-detail',[.365,1.075,-.37],[.030,.060,.025],gold,10,6,-.35);
  ellipsoid('left-forearm','robe',[-.23,1.20,-.23],[.23,.09,.13],red,16,8,-.20);
  const palm=own(new T.SphereGeometry(1,16,8)),pa=palm.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);pa.setXYZ(i,x*.135-.075,1.20+y*.040-(y>0?.020*(1-x*x)*(1-z*z):0),z*.085-.34);}add('left-hand-up','hand',palm,gold);
  ellipsoid('left-thumb','hand-detail',[-.175,1.235,-.34],[.055,.025,.033],gold,10,6,-.25);
  // Front opening and fitted shallow robe folds; not exact textile patterns.
  for(const side of[-1,1]){
   const path=new T.CatmullRomCurve3([[side*.12,1.79,-.065],[side*.21,1.64,-.18],[side*.24,1.47,-.20],[side*.22,1.30,-.21],[side*.25,1.17,-.24]].map(p=>new T.Vector3(...p))),geo=own(new T.TubeGeometry(path,14,1,6,false)),a=geo.attributes.position;
   for(let j=0;j<=14;j++){const t=j/14,center=path.getPointAt(t),tangent=path.getTangentAt(t),across=new T.Vector3(tangent.y,-tangent.x,0).normalize();for(let k=0;k<=6;k++){const q=2*Math.PI*k/6,v=center.clone().addScaledVector(across,(.026+.010*Math.sin(Math.PI*t))*Math.cos(q));v.z+=.006*Math.sin(q);a.setXYZ(j*7+k,v.x,v.y,v.z);}}
   add('front-robe-border-'+side,'robe-relief',closeRims(geo),gold);
  }
  for(let k=0;k<4;k++)tube('crossed-leg-fold-'+k,[[-.52+k*.05,1.05,-.25],[-.28+k*.065,1.09,-.35],[.06+k*.075,1.005,-.39],[.37+k*.045,1.03,-.27]],.008,k%2?red:gold,8);
  tube('waist-tie',[[0,1.26,-.19],[-.08,1.20,-.25],[0,1.18,-.28],[.08,1.20,-.25],[0,1.26,-.19]],.014,gold,12);
  ellipsoid('neck','skin',[0,1.845,.015],[.095,.085,.095],red,16,8);
  // Head 1.85..2.20, low cap 2.05..2.25. No invented tall ushnisha.
  ellipsoid('rounded-face','skin',[0,2.025,-.005],[.167,.185,.14],red,24,16);
  for(const side of[-1,1]){
   ellipsoid('long-ear-'+side,'ear',[side*.163,1.99,.005],[.035,.105,.035],red,12,10,side*.08);
   ellipsoid('ear-recess-'+side,'ear-relief',[side*.171,2.012,-.026],[.010,.046,.005],dark,10,6,side*.08);
   tube('eyebrow-'+side,[[side*.025,2.075,-.140],[side*.075,2.085,-.130],[side*.118,2.067,-.105]],.004,dark,8);
   tube('lowered-eye-'+side,[[side*.033,2.047,-.147],[side*.073,2.044,-.143],[side*.108,2.051,-.120]],.0025,dark,8);
  }
  ellipsoid('nose','face-detail',[0,2.026,-.143],[.020,.046,.022],red,12,8);
  tube('closed-lips',[[-.044,1.965,-.139],[0,1.959,-.151],[.044,1.965,-.139]],.004,red,10);
  // The cap follows the round head. Small curl relief is fitted, not a
  // counted reconstruction of individual historical curls.
  const cap=own(new T.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI*.56));cap.scale(.174,.13,.151);cap.translate(0,2.12,.014);add('low-round-hair-cap','hair',closeRims(cap),dark);
  for(let row=0;row<4;row++){const theta=.16+row*.34,count=row?12:8;for(let k=0;k<count;k++){const a=2*Math.PI*(k+(row%2)*.5)/count,r=Math.sin(theta);ellipsoid('hair-curl-'+row+'-'+k,'hair-curl',[.174*r*Math.sin(a),2.12+.13*Math.cos(theta),.014+.151*r*Math.cos(a)],[.016,.010,.016],dark,8,4);}}
  ellipsoid('small-front-hair-jewel','text-supported-detail',[0,2.18,-.139],[.020,.024,.013],gold,10,6);
  // The study explicitly records a small Buddhist auspicious chest mark.
  // This shallow, fitted sign is not a reconstruction of jewelry or embroidery.
  for(const [x,y,w,h]of [[.020,0,.04,.009],[0,.020,.009,.04],[-.020,0,.04,.009],[0,-.020,.009,.04],[.04,.018,.009,.036],[-.018,.04,.036,.009],[-.04,-.018,.009,.036],[.018,-.04,.036,.009]]){
   const geo=own(new T.BoxGeometry(w,h,.008));geo.translate(x,1.54+y,-.191);add('chest-mark-'+meshes.filter(m=>m.userData.part==='chest-mark').length,'chest-mark',geo,gold,{detailStatus:'TEXT_SUPPORTED_SHALLOW_FIT_NOT_EXACT_PATTERN'});
  }
  // Keep the sourced top at exactly 2.25 m including low hair relief. The
  // whole statue is scaled uniformly once; the separate support is untouched.
  const figure=meshes.filter(m=>m.userData.part!=='support');let lo=Infinity,hi=-Infinity;
  for(const m of figure){m.geometry.computeBoundingBox();lo=Math.min(lo,m.geometry.boundingBox.min.y);hi=Math.max(hi,m.geometry.boundingBox.max.y);}
  const scale=2.25/(hi-lo);
  for(const m of figure){m.geometry.translate(0,-lo,-5.6);m.geometry.scale(scale,scale,scale);m.geometry.translate(0,1.7,5.6);m.geometry.computeBoundingBox();}
  frame.updateMatrixWorld(true);
  const reserve=new T.Box3(new T.Vector3(-1.25,.9-1e-6,4.5),new T.Vector3(1.25,4,6.7));
  for(const m of meshes){
   const local=m.geometry.boundingBox;if(!reserve.containsBox(local))throw Error('Dafotang principal escaped the fitted reserve');
   const contact=local.clone().translate(new T.Vector3(221.9,0,241.1));
   if(m.userData.part!=='support')contact.triangleSupport=triangleInstance(createTriangleTemplate(m.geometry),[221.9,0,241.1],m.name+'/'+m.uuid);
   contact.dafotangPrincipalMesh=m.uuid;contact.dafotangPrincipalRole=m.userData.role;contacts.push(contact);
  }
  const meta={id:ID,placeId:PLACE,historicalOnly:true,inventoryAccepted:false,wholeHallInventory:'UNKNOWN',figureAndLotusHeight:2.25,supportHeight:.8,supportDimensions:[2.2,.8,1.8],placement:[0,.9,5.6],
   dimensionStatus:'FIGURE_AND_LOTUS_HEIGHT_SOURCED__SUPPORT_AND_POSITION_MODEL_FIT',front:'LOCAL_NEGATIVE_Z',anatomicalRight:'LOCAL_POSITIVE_X',lotusPetalTiers:8,
   sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf','https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf'],
   scope:'ONE_HISTORICAL_CENTRAL_SHAKYAMUNI_NOT_CURRENT_INVENTORY',simplified:['back','facial detail','fingers','robe folds','lacquer and gold colors'],newWalkables:0,newRooms:0,newMapItems:0,geometryStatus:'SOURCE_GUIDED_FIT_PENDING_VISUAL_AND_HOST_VALIDATION'};
  const saved={colliders:kit.colliders.length,owned:kit.owned.length};
  try{f.add(frame);frame.updateWorldMatrix(true,true);kit.colliders.push(...contacts);kit.owned.push(...materials);g.historicalPrincipal=meta;done.add(f);published=true;return {frame,meshes,contacts,meta};}
  catch(error){const index=f.children.indexOf(frame);if(index>=0)f.children.splice(index,1);frame.parent=null;kit.colliders.length=saved.colliders;kit.owned.length=saved.owned;delete g.historicalPrincipal;throw error;}
 }catch(error){if(!published){for(const geo of geometries)geo.dispose();for(const mat of materials)mat.dispose();}throw error;}
}
