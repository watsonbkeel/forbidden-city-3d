import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const DAPAO_FIT=Object.freeze({x:-244,z:-233.5,width:4.2,depth:4.2,eave:2.77,ridge:3.7,skylightWidth:1,skylightDepth:.9,rimHeight:.9});
export const DAPAO_SOURCES=Object.freeze(['https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf','https://young.dpm.org.cn/info/995','https://young.dpm.org.cn/uploads/1/image/public/201902/20190221123847_ru48n3isf5.jpg','https://www.dpm.org.cn/Uploads/File/2020/05/22/u5ec7aa3e2df0c.pdf']);
const ID='dapao-well-photo-fit',OBJECT='R158-SUPPLEMENT-DAPAO',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Supplementary courtyard detail, NOT an original R158 list building.
 * Own official photographs show four columns, curved open gable ends,
 * square masonry well enclosure and a central open skylight. Dimensions,
 * roof-axis placement and hidden well depth are NOT surveyed. The shallow
 * solid bottom is an explicit game-safety fit, not the actual well depth.
 * No water-use claim, buckets, pumping equipment or invented ornaments. */
export function buildDapaoWell(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children))throw Error('Dapao requires retained outer-east and one untransformed pre-finish registration');
 const p=DAPAO_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const geos=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=material('dapao-plain-red-fit',0x9b4938),wood=material('dapao-exposed-timber-fit',0x644a35),stone=material('dapao-ground-stone-fit',0xa9a69c),pale=material('dapao-pale-bargeboard-fit',0xc8c2ae),dark=material('dapao-shallow-game-bottom',0x393a35),yellow=kit.lib.material('roof_tile');
 const mesh=(geo,mat,role,parts)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.name='dapao-'+role;m.userData.dapaoRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);const vertices=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+id),b=shape.box.clone();b.triangleSupport=shape;b.dapaoGate={id,objectId:OBJECT};owners.push(b);for(const m of parts)m.userData.dapaoOwner=shape.id;}finally{g.dispose();}};
 const one=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const half=2.1,curve=z=>2.65+1.05*Math.cos(z/half*Math.PI/2)+.12*(Math.abs(z)/half)**5;
 const points=(za,zb)=>Array.from({length:17},(_,i)=>{const z=za+(zb-za)*i/16;return[z,curve(z)];});
 const band=(role,mat,x0,x1,za,zb,thick,down=0)=>{const pts=points(za,zb).map(([z,y])=>[z,y-down]),a=[];mesh(prism([...pts,...pts.toReversed().map(([z,y])=>[z,y-thick])],x0,x1),mat,role,a);own(a,role);};
 try{
  // The supported shallow floor is visible and physically solid. No deep
  // pit, invisible rescue floor or modified terrain/water system is introduced.
  one('visible-shallow-game-bottom',dark,2.4,.12,2.4,0,-.02,0);
  for(const sign of[-1,1]){
   one('stone-rim-x-'+sign,stone,.30,.9,2.4,sign*1.05,.45,0);
   one('stone-rim-z-'+sign,stone,1.8,.9,.30,0,.45,sign*1.05);
  }
  for(const x of[-1.55,1.55])for(const z of[-1.55,1.55]){const a=[];mesh(new T.CylinderGeometry(.13,.15,2.65,8).translate(x,1.325,z),red,'column',a);own(a,'column-'+x+'-'+z);}
  for(const sign of[-1,1]){
   one('perimeter-beam-x-'+sign,wood,.17,.22,3.3,sign*1.55,2.55,0);
   one('perimeter-beam-z-'+sign,wood,3.3,.22,.17,0,2.55,sign*1.55);
   // Pale curved open-end bargeboard, not a filled triangular gable wall.
   band('curved-open-bargeboard-'+sign,pale,sign<0?-2.16:2.04,sign<0?-2.04:2.16,-half,half,.24,.04);
  }
  // Four roof patches leave a REAL 1m x0.9m skylight, with no transparent
  // plate masquerading as an opening. No ridge through the aperture.
  band('roof-left',yellow,-2.1,-.5,-half,half,.10);
  band('roof-right',yellow,.5,2.1,-half,half,.10);
  band('roof-front',yellow,-.5,.5,-half,-.45,.10);
  band('roof-back',yellow,-.5,.5,.45,half,.10);
  const tiles=[];
  for(let i=0;i<=28;i++){const x=-2.03+4.06*i/28,spans=Math.abs(x)<.54?[[-half,-.48],[.48,half]]:[[-half,half]];for(const[za,zb]of spans){const path=new T.CatmullRomCurve3(points(za,zb).map(([z,y])=>new T.Vector3(x,y+.02,z)));mesh(new T.TubeGeometry(path,16,.035,4,false),yellow,'yellow-tile-roll',tiles);}}
  own(tiles,'yellow-tile-rolls');
 }catch(e){for(const g of geos)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,objectId:OBJECT,name:'大庖井',...p,originalR158Item:false,columns:4,roof:'juanpeng-xuanshan-open-luding',dimensions:'OWN_PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED',realDepthVerified:false,currentUseVerified:false,modernPublicAccessVerified:false,wholeCourtyardAccepted:false,wellBottom:'VISIBLE_SOLID_SHALLOW_GAME_SAFETY_ADAPTATION_NOT_REAL_DEPTH',roofOpening:'REAL_GEOMETRIC_APERTURE',sourceUrls:[...DAPAO_SOURCES],unknown:['measured dimensions and exact orientation/placement','2026 physical condition and current use','well depth water level and potability','hidden joinery and ornament','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);kit.mapItems.push({kind:'pavilion',name:'大庖井（井深未验；浅井防坠游戏适配）',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,objectId:OBJECT,sourceStatus:meta.dimensions,originalR158Item:false});return{frame,meta};
}
