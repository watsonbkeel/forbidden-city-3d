import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='dafotang-east-weituo-source-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const OFFSET=[221.9,0,241.1],CENTER=[-2.83,1.32,5.6],YAW=-Math.PI/4;
const COURSES=[['guardian-pedestal-foot',.62,.1,.75,.97,.87],['guardian-pedestal-waist',.52,.2,.65,1.12,.75],['guardian-pedestal-top',.60,.1,.73,1.27,.85]];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value'in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const identity=o=>o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const near=(a,b)=>Math.abs(a-b)<1e-6;

/** Figure 14, Wang Jiapeng 2015 p.304: standing feet, gathered hands, layered
 * armour and looping ribbons. Dimensions except 2.17m height, yaw, colour,
 * back and simplified contours are explicit fits, not an artifact replica.
 * No weapon, inferred fine fingers, image texture or borrowed triad geometry.
 * The component owns geometry only; the caller owns the two materials. */
export function createDafotangWeituo({materials}={}){
 if(!materials?.body?.isMaterial||!materials?.trim?.isMaterial)throw Error('Two borrowed Weituo fit materials required');
 const group=new T.Group(),meshes=[],owned=new Set();let disposed=false;
 group.name=ID;
 const keep=g=>(owned.add(g),g);
 function add(role,g,mat=materials.body){
  keep(g);const p=g.attributes.position,ix=g.index,indices=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
  for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);if(new T.Triangle(a,b,c).getArea()>1e-12)indices.push(...ids);}
  g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();
  const mesh=new T.Mesh(g,mat);mesh.name=ID+'/'+role;mesh.userData.dafotangWeituoRole=role;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);meshes.push(mesh);return mesh;
 }
 function oval(role,pos,size,mat=materials.body){return add(role,keep(new T.SphereGeometry(1,12,8)).scale(...size).translate(...pos),mat);}
 function tube(role,points,r=.035,mat=materials.trim,closed=false){
  const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed),g=keep(new T.TubeGeometry(path,16,r,5,closed));
  if(!closed){const p=g.attributes.position,v=Array.from(p.array),ix=Array.from(g.index.array);for(const j of[0,16]){const id=v.length/3;v.push(...path.getPointAt(j/16).toArray());for(let k=0;k<5;k++){const a=j*6+k,b=a+1;ix.push(id,...(j===0?[a,b]:[b,a]));}}for(const k of Object.keys(g.attributes))g.deleteAttribute(k);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);}
  return add(role,g,mat);
 }
 function armour(role,rows,mat=materials.body){
  const v=[],ix=[],n=12;for(const[y,rx,rz]of rows)for(let k=0;k<n;k++){const a=k*2*Math.PI/n;v.push(rx*Math.sin(a),y,rz*Math.cos(a));}
  for(let j=0;j<rows.length-1;j++)for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ix.push(a,b,a+n,b,b+n,a+n);}
  for(const j of[0,rows.length-1]){const id=v.length/3;v.push(0,rows[j][0],0);for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ix.push(id,...(j===0?[b,a]:[a,b]));}}
  const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);return add(role,g,mat);
 }
 function boot(side){
  // Whole sole, not only a foot centre, is supported. Natural unrotated pair
  // spans .77m; no nonuniform squeeze into the old .60m fitted pedestal.
  const outline=[[-.12,-.16],[.12,-.16],[.14,-.10],[.115,.16],[-.10,.16],[-.14,-.08]],v=[],ix=[],n=outline.length;
  for(const y of[0,.105])for(const[x,z]of outline)v.push(side*.245+x,y,z);
  for(let k=0;k<n;k++){const a=k,b=(k+1)%n;ix.push(a,b,a+n,b,b+n,a+n);}
  for(const j of[0,1]){const id=v.length/3;v.push(side*.245,j*.105,0);for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ix.push(id,...(j===0?[b,a]:[a,b]));}}
  const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(v,3));for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];g.setIndex(ix);add('boot-'+side,g,materials.trim);
 }
 try{
  for(const side of[-1,1]){
   boot(side);oval('shin-'+side,[side*.21,.37,.025],[.105,.29,.105]);
   oval('knee-armour-'+side,[side*.205,.67,-.035],[.125,.16,.12],materials.trim);
  }
  armour('plain-skirt-underlayer',[[.56,.25,.15],[.78,.30,.19],[1.11,.23,.16]]);
  // Broad separate overlapping lappets, without invented ornamental relief.
  for(const side of[-1,1])for(let tier=0;tier<3;tier++){
   const g=keep(new T.BoxGeometry(.22,.23,.045));g.rotateZ(side*.12).rotateY(side*.20).translate(side*(.14+tier*.028),1.03-tier*.17,-.18);
   add('skirt-armour-'+side+'-'+tier,g,materials.trim);
  }
  armour('waist-armour',[[1.04,.245,.18],[1.18,.27,.19],[1.24,.23,.17]],materials.trim);
  armour('breast-armour',[[1.18,.22,.16],[1.38,.27,.19],[1.58,.30,.18],[1.67,.22,.13]]);
  oval('neck',[0,1.72,0],[.085,.10,.08],materials.trim);
  for(const side of[-1,1]){
   oval('layered-shoulder-'+side,[side*.29,1.59,.015],[.115,.13,.18],materials.trim);
   oval('lower-shoulder-'+side,[side*.31,1.51,.005],[.10,.09,.16]);
  }
  tube('left-upper-arm',[[-.30,1.56,0],[-.34,1.37,-.04],[-.25,1.31,-.16]],.075,materials.body);
  tube('left-gathered-forearm',[[-.25,1.31,-.16],[-.13,1.40,-.23],[-.045,1.49,-.25]],.060);
  tube('right-upper-arm',[[.30,1.56,0],[.33,1.40,-.07],[.24,1.35,-.18]],.075,materials.body);
  tube('right-gathered-forearm',[[.24,1.35,-.18],[.13,1.46,-.25],[.035,1.52,-.26]],.060);
  oval('gathered-palms',[-.005,1.535,-.26],[.065,.10,.045],materials.trim);
  oval('plain-face',[0,1.87,-.01],[.135,.17,.115],materials.trim);
  oval('nose',[0,1.865,-.121],[.018,.035,.020],materials.trim);
  oval('helmet-cap',[0,1.99,.015],[.148,.10,.13]);
  add('pointed-helmet',keep(new T.ConeGeometry(.067,.14,10)).translate(0,2.10,.015),materials.trim);
  // Unequal loops follow the source's broad silhouette, not mirrored king
  // details. Depth, back joining and each curve are unmeasured model fits.
  tube('high-ribbon-loop',[[-.26,1.66,.09],[-.52,1.94,.07],[-.625,1.95,.03],[-.60,1.77,-.01],[-.35,1.64,-.02]],.022,materials.trim,true);
  tube('shoulder-ribbon-loop',[[-.27,1.61,.08],[-.58,1.65,.05],[-.60,1.46,.04],[-.43,1.36,.04],[-.29,1.49,.07]],.025,materials.trim,true);
  tube('right-waist-ribbon',[[.22,1.15,.12],[.32,.89,.11],[.39,.53,.07],[.45,.34,.04],[.55,.43,.04]],.022);
  tube('left-waist-ribbon',[[-.23,1.15,.12],[-.34,.89,.10],[-.39,.51,.06],[-.36,.27,.02],[-.29,.31,.02]],.023);
  const metadata={id:ID,subjectId:'weituo',side:'EAST_NEGATIVE_X',status:'SOURCE_GUIDED_SIMPLIFIED_MODEL_FIT',height:2.17,heightSource:'WANG_JIAPENG_2015_PRINTED_304',sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf','https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf'],sourceFigures:['2015:fig14','2015:fig9','2014:fig7'],originalTechnique:'DRY_LACQUER_CLOTH_CORE',colour:'NEUTRAL_NON_ORIGINAL_COLOR_MODEL_FIT',fit:['all widths and depths','feet and hand shapes','armour profiles','ribbon curves','plain closed back','placement and inward yaw'],weaponModeled:false,photographsAdded:0,completeHistoricalDisplay:false};
  group.userData.dafotangWeituo=metadata;
  const triangles=meshes.reduce((n,m)=>n+m.geometry.index.count/3,0);if(meshes.length>48||triangles>6000)throw Error('Weituo component budget exceeded');
  return{group,meshes,metadata,dispose(){if(disposed)return;disposed=true;for(const g of owned)g.dispose();group.removeFromParent();}};
 }catch(error){for(const g of owned)g.dispose();throw error;}
}

function validate({kit,f,g,p}={}){
 if(p?.id!==PLACE||p.key!=='dafotang'||g?.id!==PLACE||g.inventory?.status!=='UNKNOWN'||g.historicLayout?.id!=='dafotang-historic-spatial-fit-v1'||g.triadFit?.id!=='dafotang-three-design-figures-v1'||g.weituoFit||!writable(g,'weituoFit')||!f||f.parent!==kit?.root||kit.root.name!=='outer-west'||kit.root.parent||!identity(kit.root)||!f.position.equals(new T.Vector3(...OFFSET))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!kit.root.matrixAutoUpdate||!kit.root.matrixWorldAutoUpdate||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned))throw Error('Exact unchanged triad host required before east Weituo');
 if(JSON.stringify(g.historicLayout.guardianSlots.map(s=>[s.subjectId,s.position]))!==JSON.stringify([['heavenly-king',[2.83,1.32,5.6]],['weituo',CENTER]]))throw Error('Exact east Weituo slot required');
 const layout=f.children.filter(o=>o.name==='dafotang-historic-spatial-fit-v1');if(layout.length!==1||!identity(layout[0]))throw Error('Exact retained historic frame required');
 f.updateWorldMatrix(true,true);
 return COURSES.map(([role,w,h,d,y,nextWidth])=>{
  const matches=layout[0].children.filter(m=>m.isMesh&&m.userData.dafotangLayoutRole===role&&near(new T.Box3().setFromObject(m).getCenter(new T.Vector3()).x,OFFSET[0]+CENTER[0]));
  if(matches.length!==1)throw Error('Exact three east pedestal courses required');const m=matches[0];
  m.geometry.computeBoundingBox();const b=m.geometry.boundingBox,size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());
  if(!identity(m)||!writable(m,'geometry')||!near(size.x,w)||!near(size.y,h)||!near(size.z,d)||!near(center.x,CENTER[0])||!near(center.y,y)||!near(center.z,CENTER[2])||m.material.name!=='dafotang_layout_plain_gold_fit')throw Error('East pedestal geometry or owner changed');
  const owners=kit.colliders.filter(c=>c.dafotangLayoutMesh===m.uuid);if(owners.length!==1||!owners[0].triangleSupport||!owners[0].equals(new T.Box3().setFromObject(m)))throw Error('Exact east pedestal collision owner required');
  const owner=owners[0],index=kit.colliders.indexOf(owner),shape=owner.triangleSupport,pos=m.geometry.attributes.position,ix=m.geometry.index,point=new T.Vector3();
  if(!writable(kit.colliders,String(index))||owner.dafotangLayoutRole!==role||shape.id!==m.name+'/'+m.uuid||!shape.offset.equals(new T.Vector3(...OFFSET))||!shape.box.equals(owner)||shape.template.triangles.length!==(ix?.count??pos.count)/3)throw Error('East pedestal triangle contract changed');
  for(let i=0;i<shape.template.triangles.length;i++)for(const[k,v]of[[0,shape.template.triangles[i].triangle.a],[1,shape.template.triangles[i].triangle.b],[2,shape.template.triangles[i].triangle.c]])if(!point.fromBufferAttribute(pos,ix?ix.getX(i*3+k):i*3+k).equals(v))throw Error('East pedestal triangle owner changed');
  return{m,oldGeometry:m.geometry,oldCollider:owner,index,role,h,y,nextWidth};
 });
}

/** Single atomic source-fit installation; only the three east MODEL_FIT dais
 * geometries/owners are replaced. All original heights and shared materials,
 * the west dais, triad, shrine, walks, rooms and photo registry are retained. */
export function buildDafotangWeituo(c){
 const prior=validate(c),{kit,f,g}=c,materials=[],replacement=[],contacts=[];let out,published=false;
 const children=[...f.children],oldContacts=[...kit.colliders],oldOwned=[...kit.owned],descriptor=Object.getOwnPropertyDescriptor(g,'weituoFit');
 try{
  for(const[name,color]of[['body',0x716b61],['trim',0x92887a]])materials.push(new T.MeshStandardMaterial({name:'dafotang_weituo_'+name+'_nonoriginal_fit',color,roughness:.95,metalness:0}));
  out=createDafotangWeituo({materials:{body:materials[0],trim:materials[1]}});
  for(const m of out.meshes){
   m.geometry.rotateY(YAW).translate(...CENTER);m.geometry.computeBoundingBox();
   const shape=triangleInstance(createTriangleTemplate(m.geometry),OFFSET,m.name+'/'+m.uuid),box=shape.box.clone();box.triangleSupport=shape;box.dafotangWeituoMesh=m.uuid;box.dafotangWeituoRole=m.userData.dafotangWeituoRole;contacts.push(box);
  }
  for(const q of prior){
   const geometry=new T.BoxGeometry(q.nextWidth,q.h,q.nextWidth);replacement.push({...q,geometry});geometry.translate(CENTER[0],q.y,CENTER[2]);
   const shape=triangleInstance(createTriangleTemplate(geometry),OFFSET,q.m.name+'/'+q.m.uuid),box=shape.box.clone();box.triangleSupport=shape;box.dafotangLayoutMesh=q.m.uuid;box.dafotangLayoutRole=q.role;replacement.at(-1).collider=box;
  }
  Object.assign(out.metadata,{position:[...CENTER],inwardYawRadians:YAW,yawStatus:'MODEL_FIT_DIRECTION_ONLY_SOURCE_SUPPORTED',eastDaisFit:{reason:'NATURAL_FOOT_PROPORTIONS_DO_NOT_FIT_OLD_PLACEHOLDER',oldFootprint:[.62,.75],newFootprint:[.87,.87],oldTop:[.60,.73],newTop:[.85,.85],oldWaist:[.52,.65],newWaist:[.75,.75],heightsUnchanged:true,status:'MODEL_FIT_NOT_SURVEY'},geometryStatus:'PRODUCTION_NATIVE_FIT_PENDING_VISUAL_ACCEPTANCE'});
  f.add(out.group);kit.colliders.push(...contacts);kit.owned.push(...materials);
  for(const q of replacement){q.m.geometry=q.geometry;kit.colliders[q.index]=q.collider;}
  g.weituoFit=out.metadata;published=true;
 }catch(error){
  if(out?.group.parent===f)f.remove(out.group);
  Array.prototype.splice.call(f.children,0,f.children.length,...children);for(const child of children)child.parent=f;
  for(const q of prior)q.m.geometry=q.oldGeometry;
  Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...oldContacts);Array.prototype.splice.call(kit.owned,0,kit.owned.length,...oldOwned);
  if(descriptor)Object.defineProperty(g,'weituoFit',descriptor);else delete g.weituoFit;
  throw error;
 }finally{if(!published){out?.dispose();for(const q of replacement)q.geometry.dispose();for(const m of materials)m.dispose();}}
 for(const q of prior)q.oldGeometry.dispose();
 return{group:out.group,metadata:out.metadata,contacts,changedPedestals:replacement};
}
