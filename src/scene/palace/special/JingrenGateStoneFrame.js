import {stageJingrenSouthFace} from './JingrenSouthFace.js';
import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const close=(a,b)=>Math.abs(a-b)<1e-7,unit=new T.Vector3(1,1,1);
const reject=()=>{throw Error('Jingren gate source mismatch');};
const layers=[[0,.12,1.5,2.9],[.12,.23,1.46,2.86],[.23,.34,1.5,2.9],[.34,.44,1.36,2.76],[.44,.70,1.20,2.6],[.70,.82,1.36,2.76],[.82,1,1.5,2.9]];
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return Object.isExtensible(o)&&(!d||'value'in d&&d.writable);};
function same(a,b){return a&&!a.index&&!Object.keys(a.morphAttributes).length&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).length===Object.keys(b.attributes).length&&Object.entries(b.attributes).every(([k,v])=>{const q=a.attributes[k];return q&&!q.isInterleavedBufferAttribute&&q.normalized===v.normalized&&q.itemSize===v.itemSize&&q.array.constructor===v.array.constructor&&q.array.length===v.array.length&&q.array.every((n,i)=>n===v.array[i]);});}
/** Original 1m base envelope, fitted layered silhouette. Hidden rear profile is
 * inherited rectangular depth, not claimed as photographically surveyed. */
export function applyJingrenGateStoneFrame(kit,frame,{zoneId,itemIndex,item}){
 if(zoneId!=='east-six'||itemIndex!==0||item.name!=='景仁门')return false;
 if(frame?.userData.jingrenGate)return false;
 if(JSON.stringify(item)!==JSON.stringify({kind:'gate',name:'景仁门',x:-92.4,z:303.2})||frame.parent!==kit.root||kit.root.parent||!kit.root.visible||!kit.root.matrixAutoUpdate||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(unit)||!frame.matrixWorld.equals(new T.Matrix4().makeTranslation(-92.4,0,303.2))||!frame.matrix.equals(new T.Matrix4().makeTranslation(-92.4,0,303.2))||!kit.root.matrix.equals(new T.Matrix4())||!kit.root.matrixWorld.equals(new T.Matrix4())||!frame.visible||!frame.matrixAutoUpdate||!frame.position.equals(new T.Vector3(-92.4,0,303.2))||frame.rotation.toArray().slice(0,3).some(Boolean)||!frame.scale.equals(unit)||!writable(frame.userData,'jingrenGate')||!writable(frame.userData,'structure')||JSON.stringify(frame.userData.structure)!==JSON.stringify({gateKind:'wall',storeys:1,eaveCount:1,portalCount:1})||!writable(frame,'children')||!writable(kit,'colliders')||!writable(kit,'walkables')||!writable(kit,'owned'))reject();
 const bases=[],proxies=[],all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});
 for(const side of[-1,1]){
  const matches=frame.children.filter(m=>m.isMesh&&close(m.position.x,side*2.5)&&m.position.y===.5&&m.position.z===0);if(matches.length!==1)reject();const m=matches[0],ref=applyBoxUV(new T.BoxGeometry(1.5,1,2.9),kit.lib.tileSize('wall_brick'));let ok;try{ok=writable(m,'parent')&&m.visible&&m.matrixAutoUpdate&&m.material===kit.lib.material('wall_brick')&&m.scale.equals(unit)&&!m.rotation.toArray().slice(0,3).some(Boolean)&&same(m.geometry,ref)&&!all.some(q=>q!==m&&q.geometry===m.geometry);}finally{ref.dispose();}if(!ok)reject();bases.push(m);
  const cols=kit.colliders.filter(c=>close(c.min.x,-92.4+side*2.5-.7)&&close(c.max.x,-92.4+side*2.5+.7)&&c.min.y===0&&c.max.y===3&&close(c.min.z,301.8)&&close(c.max.z,304.6));if(cols.length!==1)reject();proxies.push(cols[0]);
 }
 const face=stageJingrenSouthFace(kit,frame,same,reject);const group=new T.Group();group.name='jingren-paired-stone-seats';const generated=[...face.geometries],colliders=[],walkables=[];group.add(face.group);

 try{for(const side of[-1,1])for(const [index,[lo,hi,w,d]]of layers.entries()){
  const x=side*2.5,geo=applyBoxUV(new T.BoxGeometry(w,hi-lo,d),kit.lib.tileSize('stone_slab'));generated.push(geo);const m=kit.mesh(group,geo,kit.lib.material('stone_slab'),x,(lo+hi)/2,0);m.name='jingren-stone-'+side+'-'+index;m.userData.jingrenStone={side,index};m.updateMatrix();const matrix=frame.matrixWorld.clone().multiply(m.matrix),values=[];for(let i=0;i<geo.attributes.position.count;i++){const v=new T.Vector3().fromBufferAttribute(geo.attributes.position,i).applyMatrix4(matrix);values.push(v.x,v.y,v.z);}const contactGeo=new T.BufferGeometry();contactGeo.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(contactGeo),[0,0,0],`jingren-stone:${side}:${index}`),b=owner.box.clone();b.triangleSupport=owner;colliders.push(b);}finally{contactGeo.dispose();}
  // Exact triangle contact supplies support only when body clearance permits.
  // No whole-course or narrow-strip synthetic box walkables.

 }}catch(error){for(const g of generated)g.dispose();for(const m of face.materials)m.dispose();throw error;}
 const beforeChildren=[...frame.children],beforeCols=kit.colliders,beforeWalk=kit.walkables,beforeStructure=frame.userData.structure,beforeOwned=kit.owned;
 try{frame.add(group);face.targets.forEach((m,i)=>{m.geometry=face.replacement[i];});kit.owned=beforeOwned.concat(face.materials);for(const b of bases)frame.remove(b);kit.colliders=beforeCols.map(c=>{if(!proxies.includes(c))return c;const q=c.clone();q.min.y=1;return q;}).concat(colliders);kit.walkables=beforeWalk.concat(walkables);frame.userData.jingrenGate={source:'https://www.dpm.org.cn/explore/building/236509.html',panorama:'vp3211 sph1943408411005800448 f level640 tile1,1 only',photoHash:'42112be69455bb699809e0e96b3f28ac77dd26eb9cb07edde06f13eac0d7830a',scope:'PAIRED_LAYERED_STONE_SEATS_AND_SOUTH_COLOR_FIELDS',facePrecision:'BROAD_CLIPPED_RED_FIELDS_YELLOW_GREEN_FRAME_NOT_CARVED_DETAIL',dimensions:'INHERITED_ENVELOPE_PHOTO_FITTED_COURSES_NOT_SURVEY',rear:'INHERITED_RECTANGULAR_DEPTH_NOT_SOURCE_CONFIRMED',wholeGateAccepted:false,highPierRoof:'UNCHANGED_UNVALIDATED_ABOVE_3M'};frame.userData.structure={...beforeStructure,id:'east-six/jingren-gate',name:'景仁门',stoneSeats:frame.userData.jingrenGate,accepted:false};
 }catch(error){for(const m of frame.children)if(!beforeChildren.includes(m))m.parent=null;frame.children=beforeChildren;for(const m of beforeChildren)if(m.parent!==frame)m.parent=frame;kit.colliders=beforeCols;kit.walkables=beforeWalk;kit.owned=beforeOwned;face.targets.forEach((m,i)=>{m.geometry=face.old[i];});delete frame.userData.jingrenGate;frame.userData.structure=beforeStructure;for(const g of generated)g.dispose();for(const m of face.materials)m.dispose();throw error;}
 for(const b of bases)b.geometry.dispose();for(const g of face.old)g.dispose();return true;
}
