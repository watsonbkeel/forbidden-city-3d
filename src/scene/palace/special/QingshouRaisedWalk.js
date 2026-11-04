import * as T from 'three';
const ID='qingshou-south-raised-connection',done=new WeakSet();
const BOUNDS={x0:-366.5,x1:-222.45,z0:111.5,z1:526.5};
const ANCHORS=[{key:'xunyan',id:'place-ningshou-9a08e177bc',name:'寻沿书屋',x:-334.5,z:423.7,w:17.6,d:10.7},{key:'qingshou',id:'place-ningshou-0d5f3d5831',name:'庆寿堂',x:-334.8,z:439.6,w:17,d:9.8}];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
// The exact six-face, one-segment BoxGeometry payload, without constructing an
// unregistered geometry inside a constructor that may throw while filling it.
function boxPayload(width,height,depth){
 const position=[],normal=[],uv=[],index=[],groups=[];
 const planes=[['z','y','x',-1,-1,depth,height,width],['z','y','x',1,-1,depth,height,-width],['x','z','y',1,1,width,depth,height],['x','z','y',1,-1,width,depth,-height],['x','y','z',1,-1,width,height,depth],['x','y','z',-1,-1,width,height,-depth]];
 for(const [face,[u,v,w,udir,vdir,pw,ph,pd]] of planes.entries()){
  for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){const p={x:0,y:0,z:0},n={x:0,y:0,z:0};p[u]=(ix*pw-pw/2)*udir;p[v]=(iy*ph-ph/2)*vdir;p[w]=pd/2;n[w]=pd>0?1:-1;position.push(p.x,p.y,p.z);normal.push(n.x,n.y,n.z);uv.push(ix,1-iy);}
  const a=face*4;index.push(a,a+2,a+1,a+2,a+3,a+1);groups.push({start:face*6,count:6,materialIndex:face});
 }
 return{position:new Float32Array(position),normal:new Float32Array(normal),uv:new Float32Array(uv),index:new Uint16Array(index),groups};
}
const identity=g=>g.matrixAutoUpdate===true&&g.matrixWorldAutoUpdate===true&&g.quaternion.equals(new T.Quaternion())&&g.scale.equals(new T.Vector3(1,1,1));
function validate(kit,zone){
 const root=kit?.root;
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||root.position.lengthSq()||!root.matrix.equals(new T.Matrix4())||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||JSON.stringify(zone.bounds)!==JSON.stringify(BOUNDS)||done.has(kit)||root.children.some(f=>f.userData.structure?.id===ID))throw Error('Exact mutable untransformed Qingshou connection host required, once only');
 let stone;
 for(const a of ANCHORS){
  const items=zone.items?.filter(i=>i.kind==='hall'&&['name','x','z','w','d'].every(k=>i[k]===a[k])&&i.ph===.5&&i.pad===.5),hosts=root.children.filter(f=>f.userData.structure?.id===a.id);
  if(items?.length!==1||hosts.length!==1)throw Error('Exact two retained Qingshou/Xunyan source halls required');
  const f=hosts[0],p=f.userData.structure;
  if(f.parent!==root||!identity(f)||f.position.x!==a.x||f.position.z!==a.z||f.position.y!==0||p.key!==a.key||p.name!==a.name||p.x!==a.x||p.z!==a.z||p.ph!==.5||p.localW!==a.w||p.localD!==a.d)throw Error('Original Qingshou connection transform/profile changed');
  const bases=f.children.filter(m=>m.userData.role==='platform-base'),paving=f.children.filter(m=>m.userData.role==='platform-paving');
  if(bases.length!==1||paving.length!==1)throw Error('Original source platforms required');
  const m=bases[0],expected=boxPayload(a.w+1,.5,a.d+1);
  if(!identity(m)||m.position.x!==0||m.position.y!==.25||m.position.z!==0)throw Error('Original platform transform changed');
  for(const key of['position','normal']){const x=m.geometry.attributes[key],y=expected[key];if(!x||x.count!==y.length/3||x.itemSize!==3||x.array.some((v,i)=>!Object.is(v,y[i])))throw Error('Original platform geometry changed');}
  const ix=m.geometry.index;if(!ix||ix.count!==expected.index.length||ix.array.some((v,i)=>v!==expected.index[i]))throw Error('Original platform topology changed');
  const pw=a.w+1,pd=a.d+1;
  if(kit.walkables.filter(w=>w.type==='box'&&w.rescue===false&&w.box.min.x===a.x-pw/2&&w.box.max.x===a.x+pw/2&&w.box.min.z===a.z-pd/2&&w.box.max.z===a.z+pd/2&&w.box.min.y===.5&&w.box.max.y===.5).length!==1)throw Error('Original platform real support changed');
  const mat=paving[0].material;if(!mat?.isMeshStandardMaterial||mat.name!=='r48_ningshou_stone_fit')throw Error('Original stone material required');if(stone&&stone!==mat)throw Error('Shared original stone identity changed');stone=mat;
 }
 const reserve=[[-335.95,429.5,-333.35,434.25],[-337.15,431,-335.95,432.8],[-333.35,431,-332.15,432.8]];
 for(const[x0,z0,x1,z1]of reserve){const box=new T.Box3(new T.Vector3(x0,.001,z0),new T.Vector3(x1,.501,z1));if(kit.colliders.some(c=>(c.box??c).intersectsBox(box)))throw Error('Raised connection space occupied');}
 return stone;
}
/** Limited raised path between two existing model platforms. The four-step
 * side accesses, width and coordinates are game fits, not a surveyed courtyard. */
export function buildQingshouRaisedWalk(kit,zone){
 if(zone?.id!=='ningshou')return false;
 const stone=validate(kit,zone),frame=new T.Group(),geometries=[],contacts=[],walks=[];frame.name=ID;frame.userData.qingshouRaisedWalk=true;
 try{
  const box=(name,w,h,d,x,z)=>{const g=new T.BufferGeometry();geometries.push(g);const p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));for(const q of p.groups)g.addGroup(q.start,q.count,q.materialIndex);const m=new T.Mesh(g,stone);m.name=ID+'/'+name;m.position.set(x,h/2,z);m.castShadow=m.receiveShadow=true;m.userData={qingshouRaisedWalk:true,role:name,fitNotSurvey:true};frame.add(m);m.updateWorldMatrix(true,false);const b=new T.Box3().setFromObject(m,true);b.qingshouRaisedWalk=true;b.qingshouWalkMesh=m.name;contacts.push(b);const top=b.clone();top.min.y=top.max.y;walks.push({type:'box',box:top,rescue:false,qingshouRaisedWalk:true,qingshouWalkMesh:m.name});};
  box('raised-stone-walk',2.6,.5,4.75,-334.65,431.875);
  for(const side of[-1,1])for(let i=0;i<4;i++)box(`side-${side<0?'east':'west'}-tread-${i}`,.3,.125*(i+1),1.8,-334.65+side*(2.5-(i+.5)*.3),431.9);
 }catch(error){for(const g of geometries)g.dispose();throw error;}
 const meta={id:ID,name:'庆寿堂院内甬道',sourceObjectIds:['FC-9A08E177BC','FC-0D5F3D5831'],scope:'ONE_RAISED_CONNECTION_BETWEEN_EXISTING_MODEL_HALLS_ONLY',wholeObjectAccepted:false,identityBoundaryResolved:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236539.html',image:'https://img.dpm.org.cn/Uploads/Picture/dc/8395.jpg',supported:['Raised inter-hall paths and lateral stone access in the official text/photo'],fitted:['Coordinates, 2.6m width, 4.75m connection length, .5m existing platform level, four lateral treads on each side','Plain retained stone material, no exact paving joints or survey'],unchanged:['Existing two hall bodies, source platforms, shared material, all prior physical objects and map identities'],notBuilt:['Third/fourth courts, side halls, complete raised path network or current contents'],navigation:'Two covered Qingshou front points and Xunyan rear points follow this real .5m surface; Xunyan south landing unchanged',newMeshCount:9,newContactCount:9,newWalkableCount:9,newMaterialCount:0,newTextureCount:0};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...contacts);kit.walkables.push(...walks);done.add(kit);return{frame,meta,contacts,walks};
}
