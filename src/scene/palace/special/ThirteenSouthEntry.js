import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='south-thirteen-hanging-flower-entry',PARENT='FC-2D04E0B566',done=new WeakSet();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,z){
 const r=kit?.root,old=r?.children.filter(q=>q.userData.structure?.sourceObjectId===PARENT),p=old?.[0]?.userData.structure;
 if(!r||r.name!=='ningshou'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||!mutable(r.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||JSON.stringify(z.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}'||z.items?.filter(i=>i.kind==='gate'&&i.name==='敛禧门'&&i.x===-354&&i.z===136.8).length!==1||old.length!==1||p.fit?.x!==-361.6||p.fit?.firstZ!==155||p.fit?.westWallX!==-357.05||p.rows?.length!==13||done.has(kit)||r.children.some(q=>q.userData.structure?.id===ID))throw Error('Exact mutable South Thirteen entrance host required, once only');
 const reserve=new T.Box3(new T.Vector3(-366.4,.01,140.2),new T.Vector3(-356.85,6,147));
 if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>w.box?.intersectsBox(reserve)))throw Error('South Thirteen entrance reserve is occupied');
}
/** Official image 8282 and building 236528 identify the south hanging-flower
 * entrance. Dimensions, colour fields, curved roof and rear approach are fits.
 * The retained lane remains outside this component. No rooms or access claim. */
export function buildThirteenSouthEntry(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const frame=new T.Group();frame.name='南十三排垂花门';frame.position.set(-361.85,0,143.6);frame.userData.thirteenEntryFeature=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=g=>{geometries.push(g);return g};
 const material=(name,color)=>{const m=new T.MeshStandardMaterial();materials.push(m);m.name='r164_thirteen_entry_'+name;m.color.setHex(color);m.roughness=.85;return m};
 const mesh=(role,g,mat,x,y,z,solid=false,walk=false)=>{const m=new T.Mesh(g,mat);m.name=role;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData={thirteenEntryFeature:true,entrySolid:solid,entryWalk:walk};frame.add(m);return m};
 const box=(role,mat,w,h,d,x,y,z,solid=false,walk=false)=>mesh(role,boxGeometry(own(new T.BufferGeometry()),w,h,d),mat,x,y,z,solid,walk);
 try{
  const wood=material('red_timber_fit',0x872d23),green=material('painted_green_fit',0x285c52),blue=material('painted_blue_fit',0x294359),gold=material('plain_gold_lines_fit',0xb5a258),roof=material('roof_tile_grey_fit',0x62665e),wall=material('pale_wall_fit',0xc5c3b1),stone=kit.lib.material('stone_slab');
  box('visible-stone-platform',stone,5.8,.36,2.4,0,.18,0,true,true);
  for(const s of[-1,1])for(let i=0;i<2;i++){const h=.12*(2-i);box('visible-tread',stone,2.8,h,.4,0,h/2,s*(1.4+i*.4),true,true)}
  for(const s of[-1,1]){
   box('side-stone-foot',stone,1.4,.55,1.7,s*2.2,.635,0,true);
   box('red-side-panel',wood,1.4,2.45,.24,s*2.2,2.135,-.78,true);
   box('side-frame-post',wood,.2,3.5,.2,s*2.85,2.11,0,true);
   box('door-jamb',wood,.12,3,.25,s*1.56,1.86,-.78,true);
   // These leaves fold beyond the full three-metre doorway, no invisible gate.
   box('fully-open-door-leaf',wood,.10,2.9,1.42,s*1.57,1.81,.06,true);
   // Keep the existing x=-358 approach unobstructed on the lane side.
   if(s<0){box('side-wall-foot',stone,1.55,.55,.3,-3.675,.275,0,true);
   box('south-wall-fragment',wall,1.55,2.25,.3,-3.675,1.675,0,true)}
   box('side-panel-border',gold,1.22,.04,.03,s*2.2,.95,-.916);
   box('side-panel-border',gold,1.22,.04,.03,s*2.2,3.25,-.916);
   for(const dx of[-.61,.61])box('side-panel-border',gold,.035,2.3,.03,s*2.2+dx,2.1,-.916);
   box('hanging-post-shaft-fit',green,.19,.46,.19,s*2.35,3.56,-1.42);
   const g=own(new T.BufferGeometry());hangingBud(g);mesh('hanging-flower-post-fit',g,green,s*2.35,3.13,-1.42);
  }
  box('door-lintel',wood,3,.36,.32,0,3.54,-.78,true);
  box('painted-front-beam',blue,5.9,.62,.3,0,3.94,-1.33,true);
  box('rear-beam-fit',green,5.9,.32,.24,0,3.88,1.1,true);
  for(const y of[3.65,4.23])box('beam-gold-border',gold,5.9,.035,.035,0,y,-1.498);
  // Broad blue/green fields only. Do not invent figures, inscriptions or motifs.
  for(let i=0;i<7;i++){box('painted-beam-field-fit',green,.68,.34,.035,(i-3)*.78,3.94,-1.502);box('field-top-line',gold,.68,.025,.012,(i-3)*.78,4.1,-1.527);box('field-bottom-line',gold,.68,.025,.012,(i-3)*.78,3.78,-1.527)}
  const g=own(new T.BufferGeometry());curvedRoof(g);mesh('curved-grey-roof-fit',g,roof,0,0,0,true);
  // A few visible tile courses; not a survey of the original tile census.
  for(let i=0;i<=20;i++){const q=own(new T.BufferGeometry());curvedRoof(q,.045);mesh('coarse-roof-course-fit',q,roof,-3.25+i*.325,.025,0)}
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children.filter(o=>o.isMesh&&o.userData.entrySolid)){
   let b;if(m.name==='curved-grey-roof-fit'){const q=own(new T.BufferGeometry());try{q.copy(m.geometry);q.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(q),[0,0,0],ID+'/roof');b=shape.box.clone();b.triangleSupport=shape}finally{q.dispose();geometries.splice(geometries.indexOf(q),1)}}else b=new T.Box3().setFromObject(m,true);
   if(['door-lintel','painted-front-beam','rear-beam-fit'].includes(m.name))b.overhead={type:'piecewise-linear-x',sourceId:ID+'/'+m.name,points:[[b.min.x,b.min.y],[b.max.x,b.min.y]],minZ:b.min.z,maxZ:b.max.z,topY:b.max.y};
   b.thirteenEntryFeature=true;b.entryMesh=m.uuid;colliders.push(b);
   if(m.userData.entryWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,thirteenEntryFeature:true,entryMesh:m.uuid})}
  }
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,parentObjectId:PARENT,aggregateGroupId:'FC-ABA67505AC',name:'南十三排垂花门',scope:'SOUTH_HANGING_FLOWER_ENTRANCE_AND_VISIBLE_STONE_APPROACH',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,x:-361.85,z:143.6,clearWidth:3,floorY:.36,sources:['https://www.dpm.org.cn/explore/building/236528.html','https://img.dpm.org.cn/Uploads/Picture/dc/8282%5B1024%5D.jpg'],supported:['South-wall hanging-flower gate, south toward Lianxi gate','Official photograph: gray roof, red timber panels, hanging posts, painted beam and stone approach'],fitted:['Coordinates, all dimensions, low curved roof and simplified blue/green/gold colour fields','Unseen rear steps and fully-open leaves for game circulation','Short wall fragment on one side only; opposite side stays clear of the retained x=-358 approach'],notBuilt:['Original carved floral patterns, precise roof structure and measured profiles','Northern annex rooms, complete courtyard inventory and current offices','Museum opening and whole-object visual acceptance'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame,meta,colliders,walkables,materials};
}
// Allocate and register the target before filling attributes, including failures.
function boxGeometry(g,w,h,d){const p=[],n=[],u=[],indices=[];for(const [axis,sign,ua,va]of[[0,1,2,1],[0,-1,2,1],[1,1,0,2],[1,-1,0,2],[2,1,0,1],[2,-1,0,1]]){const size=[w,h,d],start=p.length/3,pts=[[-1,-1],[1,-1],[1,1],[-1,1]];for(const[a,b]of pts){const v=[0,0,0],no=[0,0,0];v[axis]=sign*size[axis]/2;v[ua]=a*size[ua]/2;v[va]=b*size[va]/2;no[axis]=sign;p.push(...v);n.push(...no);u.push((a+1)/2,(b+1)/2)}const a=new T.Vector3(...p.slice(start*3,start*3+3)),b=new T.Vector3(...p.slice(start*3+3,start*3+6)),c=new T.Vector3(...p.slice(start*3+6,start*3+9)),normal=new T.Triangle(a,b,c).getNormal(new T.Vector3());for(let q of[[0,1,2],[0,2,3]]){if(normal.getComponent(axis)*sign<0)q=q.slice().reverse();indices.push(...q.map(i=>i+start))}}
 g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(indices);return g;}
function curvedRoof(g,w=6.6){const z=Array.from({length:17},(_,i)=>-1.7+i*3.4/16),y=z.map(v=>4.08+.65*Math.sqrt(Math.max(0,1-(v/1.7)**2))+.1*(Math.abs(v)/1.7)**8),profile=[...z.map((v,i)=>[v,y[i]]),...z.map((v,i)=>[v,y[i]-.12]).reverse()],p=[],uv=[],ix=[],N=profile.length;for(const x of[-w/2,w/2])for(const[v,h]of profile){p.push(x,h,v);uv.push(x,v)}for(let i=0;i<N;i++){const j=(i+1)%N;ix.push(i,j,j+N,i,j+N,i+N)}for(let i=0;i<16;i++){const a=i,b=i+1,c=N-2-i,d=N-1-i;ix.push(a,c,b,a,d,c,a+N,b+N,c+N,a+N,c+N,d+N)}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;}
function hangingBud(g){const profile=[[.04,0],[.12,.1],[.18,.25],[.13,.4],[.08,.43]],p=[],u=[],ix=[],N=12;for(let i=0;i<profile.length;i++)for(let j=0;j<N;j++){const a=j*2*Math.PI/N,[r,y]=profile[i];p.push(r*Math.cos(a),y,r*Math.sin(a));u.push(j/N,i/(profile.length-1))}for(let i=0;i<profile.length-1;i++)for(let j=0;j<N;j++){const a=i*N+j,b=i*N+(j+1)%N;ix.push(a,a+N,b,b,a+N,b+N)}const bottom=p.length/3;p.push(0,0,0);u.push(.5,.5);const top=p.length/3;p.push(0,.43,0);u.push(.5,.5);for(let j=0;j<N;j++){ix.push(bottom,j,(j+1)%N);const a=(profile.length-1)*N+j,b=(profile.length-1)*N+(j+1)%N;ix.push(top,b,a)}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix);g.computeVertexNormals();return g;}
