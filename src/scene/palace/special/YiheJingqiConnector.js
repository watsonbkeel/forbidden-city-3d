import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yihe-jingqi-three-bay-connector',done=new WeakSet();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable&&Object.keys(a).filter(k=>/^\d+$/.test(k)).every(k=>Object.getOwnPropertyDescriptor(a,k)?.writable);
const identity=r=>r&&r.position.lengthSq()===0&&r.quaternion.equals(new T.Quaternion())&&r.scale.equals(new T.Vector3(1,1,1))&&r.matrix.equals(new T.Matrix4())&&r.matrixWorld.equals(new T.Matrix4())&&r.matrixAutoUpdate&&r.matrixWorldAutoUpdate;
// Frozen standard BoxGeometry payload of the one source panel; no GPU allocation.
const SOURCE_PANEL_ATTRIBUTES={"position":{"itemSize":3,"values":[1.4,1.6,0.07,1.4,1.6,-0.07,1.4,-1.6,0.07,1.4,-1.6,-0.07,-1.4,1.6,-0.07,-1.4,1.6,0.07,-1.4,-1.6,-0.07,-1.4,-1.6,0.07,-1.4,1.6,-0.07,1.4,1.6,-0.07,-1.4,1.6,0.07,1.4,1.6,0.07,-1.4,-1.6,0.07,1.4,-1.6,0.07,-1.4,-1.6,-0.07,1.4,-1.6,-0.07,-1.4,1.6,0.07,1.4,1.6,0.07,-1.4,-1.6,0.07,1.4,-1.6,0.07,1.4,1.6,-0.07,-1.4,1.6,-0.07,1.4,-1.6,-0.07,-1.4,-1.6,-0.07]},"normal":{"itemSize":3,"values":[1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1]},"uv":{"itemSize":2,"values":[0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,1,0,0,1,0]}};
function exactPanelGeometry(g){
 if(!g||Object.keys(g.attributes).sort().join(',')!=='normal,position,uv'||Object.keys(g.morphAttributes).length||g.drawRange.start!==0||g.drawRange.count!==Infinity||g.index?.array.constructor!==Uint16Array||g.index.count!==36)return false;
 for(const[k,e]of Object.entries(SOURCE_PANEL_ATTRIBUTES)){const a=g.attributes[k];if(a.isInterleavedBufferAttribute||a.array.constructor!==Float32Array||a.itemSize!==e.itemSize||a.normalized||a.count!==e.values.length/e.itemSize||e.values.some((v,i)=>a.array[i]!==Math.fround(v)))return false}
 for(let f=0;f<6;f++){const q=g.groups[f];if(!q||q.start!==f*6||q.count!==6||q.materialIndex!==f)return false;for(let i=0;i<6;i++)if(g.index.array[f*6+i]!==f*4+[0,2,1,2,3,1][i])return false}return g.groups.length===6;
}
function validate(kit,z){
 const root=kit?.root,ys=root?.children.filter(f=>f.userData.structure?.id==='ningshou/yihe-ground-hall'),js=root?.children.filter(f=>f.userData.structure?.key==='jingqi');
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['owned','colliders','walkables'].some(k=>!mutable(kit[k]))||done.has(kit)||root.children.some(f=>f.userData.structure?.id===ID)||ys.length!==1||js.length!==1||JSON.stringify(z.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable Yihe/Jingqi connector host required, once only');
 for(const [name,x,zz,w,d,ph]of[['颐和轩',-293.7,470.8,34.1,22.9,1],['景祺阁',-293.3,496.8,31,11.2,.8]])if(z.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===zz&&i.w===w&&i.d===d&&i.ph===ph).length!==1)throw Error('Yihe/Jingqi connector anchor changed');
 const y=ys[0],j=js[0];for(const [f,x,zz]of[[y,-293.7,470.8],[j,-293.3,496.8]])if(f.parent!==root||!f.position.equals(new T.Vector3(x,0,zz))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate)throw Error('Connector source transform changed');
 const doors=y.children.filter(m=>m.name==='yihe-rear-door-closed-fit');if(doors.length!==1||!mutable(y.children))throw Error('Unique mutable closed rear panel required');
 const door=doors[0],p=door.geometry?.parameters;
 if(!door.isMesh||door.parent!==y||Object.getOwnPropertyDescriptor(door,'parent')?.writable!==true||!door.position.equals(new T.Vector3(0,2.6,11.45))||!door.quaternion.equals(new T.Quaternion())||!door.scale.equals(new T.Vector3(1,1,1))||!door.matrixAutoUpdate||!door.matrixWorldAutoUpdate||!exactPanelGeometry(door.geometry)||door.material?.name!=='yihe_wood_fit'||p?.width!==2.8||p.height!==3.2||p.depth!==.14)throw Error('Exact Yihe closed rear panel changed');
 let references=0;root.traverse(m=>{if(m.isMesh&&m.geometry===door.geometry)references++});if(references!==1)throw Error('Source panel geometry is shared');
 const old=kit.colliders.filter(c=>Math.abs(c.min.x+295.1)<1e-7&&Math.abs(c.max.x+292.3)<1e-7&&c.min.y===1&&c.max.y===4.2&&Math.abs(c.min.z-482.18)<1e-7&&Math.abs(c.max.z-482.32)<1e-7);
 if(old.length!==1||Object.keys(old[0]).some(k=>!['isBox3','min','max'].includes(k)))throw Error('Exact Yihe closed rear contact changed');
 const reserve=new T.Box3(new T.Vector3(-298.3,1.1,483.4),new T.Vector3(-289.1,3.8,488.6));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve)))throw Error('Yihe/Jingqi connector reserve occupied');
 const lintels=kit.colliders.filter(c=>Math.abs(c.min.x+295.1)<1e-7&&Math.abs(c.max.x+292.3)<1e-7&&c.min.y===4.11&&c.max.y===4.29&&Math.abs(c.min.z-482.125)<1e-7&&Math.abs(c.max.z-482.375)<1e-7);if(lintels.length!==1||Object.keys(lintels[0]).some(k=>!['isBox3','min','max'].includes(k)))throw Error('Exact old rear lintel contact changed');return{y,j,door,old:old[0],lintel:lintels[0]};
}
/** The official three-bay link and its east/west middle doors are attested.
 * This is a ground-level game fit, not a survey or museum-admission claim. */
export function buildYiheJingqiConnector(kit,zone){
 if(zone?.id!=='ningshou')return false;const source=validate(kit,zone);
 const frame=new T.Group();frame.name='颐和轩至景祺阁穿廊';frame.position.set(-293.7,0,486.75);frame.userData.yiheConnectorFeature=true;
 let lintel;const geometries=[],materials=[],colliders=[],walkables=[];const own=g=>(geometries.push(g),g);
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial();materials.push(m);m.name='r164_yihe_connector_'+name;m.color.setHex(color);m.roughness=.86;return m};
 const mesh=(name,g,material,x,y,z,solid=false,walk=false)=>{const m=new T.Mesh(g,material);m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData={yiheConnectorFeature:true,connectorSolid:solid,connectorWalk:walk};frame.add(m);return m};
 const box=(name,material,w,h,d,x,y,z,solid=false,walk=false)=>mesh(name,boxGeometry(own(new T.BufferGeometry()),w,h,d),material,x,y,z,solid,walk);
 try{
  const red=mat('red_timber_fit',0x8c342a),green=mat('muted_green_fit',0x345c4e),pale=mat('plain_window_field_fit',0xb8ad8d),roof=mat('roof_tile_weathered_yellow_fit',0x9d8755),stone=kit.lib.material('stone_slab');
  // Keep the original ground landing and Jingqi's five north steps. A fitted
  // south stair descends from the retained 1m Yihe platform to this ground floor.
  // The exact historical floor levels are not known; no target is silently raised.
  box('connector-visible-stone-floor',stone,4.6,.06,8.4,0,-.03,-.45,true,true);
  for(let i=0;i<9;i++){const h=.1*(9-i);box('connector-south-tread-fit',stone,2.8,h,.28,0,h/2,483.14+i*.28-486.75,true,true)}
  for(const s of[-1,1]){
   for(const z of[-3.05,3.05]){
    box('connector-window-sill',red,.22,1.6,2.9,s*2.3,.8,z,true);
    box('connector-window-field',pale,.12,1.95,2.9,s*2.3,2.575,z,true);
    // Plain broad grids only, not replicas of the photographed carved pattern.
    for(const face of[-1,1]){
     for(let q=0;q<=5;q++)box('connector-window-grid',red,.035,1.95,.045,s*2.3+face*.082,2.575,z-1.45+q*.58);
     for(const y of[1.6,2.25,2.9,3.55])box('connector-window-grid',red,.035,.045,2.9,s*2.3+face*.082,y,z);
    }
   }
   for(const z of[-4.5,-1.5,1.5,4.5])box('connector-side-post',red,.22,4.05,.22,s*2.3,2.025,z,true);
   box('connector-side-lintel',green,.24,.3,3,s*2.3,3.9,0,true);
   box('connector-eave-beam',green,.24,.3,9.2,s*2.3,4.03,0,true);
   // The former fitted closed panel is replaced by two leaves folded clear of
   // the retained 2.8m Yihe aperture. Their open pose is a game-circulation fit.
   box('connector-fully-open-rear-leaf',red,.08,3.0,1.3,s*1.48,2.5,-3.77,true);
  }
  const g=own(new T.BufferGeometry());pitchedRoof(g);mesh('connector-low-tile-roof-fit',g,roof,0,0,0,true);
  for(let i=0;i<=23;i++){const g=own(new T.BufferGeometry());pitchedRoof(g,.045);mesh('connector-coarse-tile-course-fit',g,roof,0,.025,-4.6+i*.4)}
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children.filter(m=>m.userData.connectorSolid)){
   let b;if(m.name==='connector-low-tile-roof-fit'){const g=own(new T.BufferGeometry());try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/roof');b=shape.box.clone();b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}else b=new T.Box3().setFromObject(m,true);
   if(['connector-side-lintel','connector-eave-beam'].includes(m.name))b.overhead={type:'piecewise-linear-x',sourceId:ID+'/'+m.name+'/'+m.position.x,points:[[b.min.x,b.min.y],[b.max.x,b.min.y]],minZ:b.min.z,maxZ:b.max.z,topY:b.max.y};
   b.yiheConnectorFeature=true;b.connectorMesh=m.uuid;colliders.push(b);
   if(m.userData.connectorWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,yiheConnectorFeature:true,connectorMesh:m.uuid})}
  }
  lintel=source.lintel.clone();lintel.yiheConnectorExistingLintel=true;lintel.overhead={type:'piecewise-linear-x',sourceId:ID+'/retained-yihe-rear-lintel',points:[[lintel.min.x,lintel.min.y],[lintel.max.x,lintel.min.y]],minZ:lintel.min.z,maxZ:lintel.max.z,topY:lintel.max.y};
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,name:'颐和轩至景祺阁穿廊',parentObjectIds:['FC-D653A5843E','FC-15C0D4E6BC'],bays:3,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,fit:{x:-293.7,z:486.75,floorY:0,yiheRetainedFloorY:1,jingqiRetainedFloorY:.8,clearWidth:4.38,sideDoorWidth:2.6},sources:['https://www.dpm.org.cn/explore/building/236516.html','https://www.dpm.org.cn/explore/building/236480.html','https://www.dpm.org.cn/Uploads/file/2025/02/13/1739432388igVFOKaLW260.pdf','https://img.dpm.org.cn/Uploads/File/2020/04/22/u5ea0044616c59.pdf'],sourcePages:[108,19],supported:['Three-bay connector between Yihe rear and Jingqi ground front','Middle east/west doors; official exterior photograph supports red window side and low tiled roof'],fitted:['Coordinates, width, bay spacing, colours and plain grids','Roof cross-section/junctions, south descent to preserve the original ground landing, and fully open leaves'],notBuilt:['Original carved patterns, exact glazed-tile and painted decoration','Courtyard rockeries, furnishings, surveyed junctions or museum access'],supersedes:'Yihe original closed unbuilt-connector panel only; old source description remains a historical component record',newMapItems:0,newRooms:0,newTeleportTargets:0};
 frame.userData.structure=meta;kit.colliders[kit.colliders.indexOf(source.lintel)]=lintel;source.y.remove(source.door);kit.colliders.splice(kit.colliders.indexOf(source.old),1);kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);source.door.geometry.dispose();return{frame,meta,colliders,walkables,materials};
}
function boxGeometry(g,w,h,d){const p=[],n=[],u=[],ix=[];for(const[axis,sign,ua,va]of[[0,1,2,1],[0,-1,2,1],[1,1,0,2],[1,-1,0,2],[2,1,0,1],[2,-1,0,1]]){const size=[w,h,d],start=p.length/3;for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const v=[0,0,0],normal=[0,0,0];v[axis]=sign*size[axis]/2;v[ua]=a*size[ua]/2;v[va]=b*size[va]/2;normal[axis]=sign;p.push(...v);n.push(...normal);u.push((a+1)/2,(b+1)/2)}const vs=[0,1,2].map(i=>new T.Vector3(...p.slice((start+i)*3,(start+i+1)*3))),normal=new T.Triangle(...vs).getNormal(new T.Vector3());for(let q of[[0,1,2],[0,2,3]]){if(normal.getComponent(axis)*sign<0)q=q.slice().reverse();ix.push(...q.map(i=>i+start))}}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix);return g}
function pitchedRoof(g,depth=9.5){const profile=[[-2.65,3.98],[-1.3,4.4],[0,4.75],[1.3,4.4],[2.65,3.98],[2.65,3.83],[1.3,4.25],[0,4.6],[-1.3,4.25],[-2.65,3.83]],p=[],u=[],ix=[],N=profile.length;for(const z of[-depth/2,depth/2])for(const[x,y]of profile){p.push(x,y,z);u.push(x,z)}for(let i=0;i<N;i++){const j=(i+1)%N;ix.push(i,j,j+N,i,j+N,i+N)}for(let i=0;i<4;i++){const a=i,b=i+1,c=N-2-i,d=N-1-i;ix.push(a,c,b,a,d,c,a+N,b+N,c+N,a+N,c+N,d+N)}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix.flatMap((_,i)=>i%3?[]:[ix[i],ix[i+2],ix[i+1]]));g.computeVertexNormals();return g}
