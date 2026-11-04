import * as T from 'three';
const SOURCE='https://ggzl.dpm.org.cn/pages/exhibit_works/details?id=8664';
const PREFIX='R164_YX_LEAF_';
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:!(k in o)&&Object.isExtensible(o)};
const appendable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const identity=m=>m.matrixAutoUpdate&&m.matrixWorldAutoUpdate&&m.quaternion.equals(new T.Quaternion())&&m.scale.equals(new T.Vector3(1,1,1));
function sourceBox(m,x,y,z,w,h,d){
 if(!m?.isMesh||!identity(m)||!m.position.equals(new T.Vector3(x,y,z))||!m.visible||m.children.length||m.geometry?.type!=='BoxGeometry')throw Error('Yangxin leaf partition source changed');
 const g=m.geometry,p=g.attributes.position,a=g.parameters;
 if(!a||a.width!==w||a.height!==h||a.depth!==d||a.widthSegments!==1||a.heightSegments!==1||a.depthSegments!==1||p?.count!==24||g.index?.count!==36||g.drawRange.start!==0||g.drawRange.count!==Infinity)throw Error('Yangxin leaf partition dimensions changed');
 for(let i=0;i<p.count;i++)if(Math.abs(Math.abs(p.getX(i))-w/2)>1e-6||Math.abs(Math.abs(p.getY(i))-h/2)>1e-6||Math.abs(Math.abs(p.getZ(i))-d/2)>1e-6)throw Error('Yangxin leaf partition vertices changed');
}
/** A deliberately fully folded-back display fit. The official source establishes
 * paired board doors, not this posture or these dimensions. No old mesh changes. */
export function installYangxinFoldedDoors(root){
 if(!root?.isObject3D||root.parent||root.name!=='Scene'||!root.visible||!identity(root)||root.position.lengthSq()||!appendable(root.children)||!writable(root.userData,'yangxinFoldedDoors')||root.userData.yangxinFoldedDoors)throw Error('Yangxin folded doors require writable source host once only');
 const meta=root.userData.yangxinMainPartitions;
 if(!meta)return{applied:false,reason:'MAIN_PARTITION_REPLACEMENT_NOT_APPLIED_ORIGINAL_RETAINED'};
 if(meta.applied!==true||meta.scope!=='PROVED_84_LEGACY_PART_COMPONENTS_ONLY'||meta.doorWidth!==3||meta.doorHeight!==3.4||meta.top!==6.78)throw Error('Yangxin folded door source contract changed');
 const names=new Map();root.traverse(m=>{if(m.isMesh){if(names.has(m.name)||m.name.startsWith(PREFIX)||m.name.startsWith('COL_'+PREFIX))throw Error('Yangxin folded door duplicate source');names.set(m.name,m)}});
 for(const sx of[-1,1])for(const[side,min,max,low,high]of[['s',-5.9,-1.5,0,6.78],['n',1.5,5.7,0,6.78],['head',-1.5,1.5,3.4,6.78]]){
  const m=names.get(`R164_YX_PART_${sx}_${side}`),c=names.get(side==='head'?'COL_'+m?.name:`COL_part_${sx}_${side}`);
  sourceBox(m,sx*6,(low+high)/2,(min+max)/2,.24,high-low,max-min);
  if(m.parent!==root||!m.material?.isMeshStandardMaterial||m.material.map?.name!=='r164-yangxin-main-red-boards-fit'||!c||c.parent!==root||c.geometry!==m.geometry||!identity(c)||!c.position.equals(m.position))throw Error('Yangxin folded door wall or contact source changed');
 }
 const geometries=[],meshes=[];let material;
 try{
  material=new T.MeshStandardMaterial();material.color.set(0x8a2419);material.roughness=.72;material.metalness=0;material.name='r164-yangxin-plain-red-board-leaves-fit';material.userData={source:SOURCE,fit:'PLAIN_RED_BOARD_NO_CARVING_OR_SURVEY'};
  const proxyMaterial=names.get('COL_part_1_s').material;
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const g=new T.BoxGeometry(.08,3.3,1.45);geometries.push(g);g.computeBoundingBox();g.computeBoundingSphere();
   const name=`${PREFIX}${sx}_${sz}`,m=new T.Mesh(g,material);m.name=name;m.position.set(sx*5.84,1.65,sz*2.275);m.userData={part:'yangxin-main-double-board-leaf',source:SOURCE,fit:'FULLY_FOLDED_BACK_DISPLAY_NOT_MEASURED_POSTURE'};
   const c=new T.Mesh(g,proxyMaterial);c.name='COL_'+name;c.position.copy(m.position);c.userData={visibleOwner:name};meshes.push(m,c);
  }
  const result={applied:true,source:SOURCE,visibleLeaves:4,visibleTriangles:48,ordinaryContacts:4,walkablesAdded:0,doorwayWidthRetained:3,openPostureMeasured:false,fit:'PLAIN_RED_BOARD_FULLY_FOLDED_BACK_FOR_PASSAGE',wholeInteriorAccepted:false,unverified:['Historical and current door opening posture','Exact leaf dimensions, hinges, carving and reverse','GPU visual rendering, mobile and full World']};
  // Allocation/validation precede commit. Arbitrary throwing add/dispose event
  // listeners are outside this synchronous loader source contract.
  root.add(...meshes);root.userData.yangxinFoldedDoors=result;return result;
 }catch(error){for(const g of geometries)g.dispose();material?.dispose();throw error}
}
