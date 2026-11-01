import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

export const BAOYUN_PORCH_SOURCE='https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg';
// Heights are a reversible relational photo fit inside the retained 10m eaves,
// NOT surveyed dimensions. No official photograph pixels are redistributed.
export const BAOYUN_PORCH_FIT=Object.freeze({floor:1.2,pedestalTop:2.65,shaftTop:6.65,soffit:6.65,top:9.23,mainEaves:10,storeyBand:5.6,centres:Object.freeze([-2.6,2.6]),z:4.7,depth:4.2});
function buildBaoyunMainPorch(kit,f,g,{pale,grey}){
 if(g?.id!=='baoyun-western-storehouse'||g.x!==300.9||g.z!==-217.7||g.bodyBase!==1.2||g.storeyH!==4.4||g.eaves!==10||f.position.x!==g.x||f.position.z!==g.z||f.rotation.y!==0||f.userData.baoyunMainPorch||pale?.name!=='baoyun_pale_stone'||grey?.name!=='baoyun_basement_stone')throw Error('Baoyun porch requires exact retained compound and materials');
 const parts=[],allocated=new Set(),beforeChildren=new Set(f.children),beforeOwned=new Set(kit.owned),ownedLength=kit.owned.length,colliderLength=kit.colliders.length,walkLength=kit.walkables.length;
 const box=(role,w,h,d,x,y,z,material=pale)=>{const geometry=applyBoxUV(new T.BoxGeometry(w,h,d),1);allocated.add(geometry);const m=kit.mesh(f,geometry,material,x,y,z);m.name='baoyun-main-porch-'+role;m.userData.baoyunMainPorchRole=role;parts.push(m);return m;};
 try {
 for(const x of BAOYUN_PORCH_FIT.centres){
  box('pedestal',1.08,1.25,1.02,x,1.825,4.7,grey);
  box('pedestal-foot',1.2,.18,1.12,x,1.29,4.7);
  box('pedestal-cap',1.2,.20,1.12,x,2.55,4.7);
  box('shaft',.86,4,.80,x,4.65,4.7);
  box('capital',1.1,.22,1.02,x,6.54,4.7);
 }
 // The pictured opening terminates just above the second-storey band. Most of
 // the missing old volume is this layered head, not an over-tall bare shaft.
 box('architrave',6.65,.60,3.8,0,6.95,6.15);
 box('lower-cornice',7.1,.27,4.2,0,7.385,6.15);
 box('frieze',6.5,1.05,3.8,0,8.045,6.15);
 box('upper-cornice',7.1,.38,4.2,0,8.76,6.15);
 box('upper-lip',6.9,.28,4,0,9.09,6.15);
 // Plain inset reserve only: do not fabricate the seven seal characters or
 // substitute generic animals for the four small photographed stone lions.
 box('frieze-reserve',5.1,.82,.035,0,8.045,4.2325,grey);
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert(),solids=[];
 for(const [index,m]of parts.entries()){
  // Match the final merged Float32 position stream, including all closed faces.
  // Existing generic triangle contact handles the actual foot and head; no
  // rectangular logical floor or invisible edge extension is introduced.
  const matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),p=m.geometry.attributes.position,positions=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix);positions.set([v.x,v.y,v.z],i*3);}
  const geometry=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3));if(m.geometry.index)geometry.setIndex(m.geometry.index.clone());
  let template;try{template=createTriangleTemplate(geometry);}finally{geometry.dispose();}
  const shape=triangleInstance(template,[0,0,0],`baoyun-main-porch-${index}`),b=shape.box.clone();b.triangleSupport=shape;
  b.baoyunMainPorch={kind:'exact-visible-closed-triangles',index,role:m.userData.baoyunMainPorchRole};kit.colliders.push(b);solids.push(b);
 }
 f.userData.baoyunMainPorch={id:'baoyun-main-porch',source:BAOYUN_PORCH_SOURCE,fit:BAOYUN_PORCH_FIT,dimensionStatus:'PHOTO_RELATION_FIT_NOT_SURVEY',photographyDate:null,wholeObjectAccepted:false,scope:'MAIN_PORCH_STRUCTURAL_MASS_ONLY',unverified:['four stone lions','seven seal reliefs','hidden head interior','whole compound exterior','browser GPU and mobile'],sourceBoxCount:solids.length};
 return f.userData.baoyunMainPorch;
 } catch(error){
  for(const m of [...f.children])if(!beforeChildren.has(m))m.removeFromParent();
  for(const g of allocated)g.dispose();
  for(const material of kit.owned.slice(ownedLength))if(!beforeOwned.has(material))material.dispose();
  kit.owned.length=ownedLength;kit.colliders.length=colliderLength;kit.walkables.length=walkLength;delete f.userData.baoyunMainPorch;throw error;
 }
}

/** Run AFTER the existing R48 facade augmentation, not on the bare storehouse.
 * Seven original round contours and all inscription/window work remain owned.
 */
const SOURCE_TARGETS={
 'baoyun-porch-square-column':['6a4d33e5',[[-2.6,3.3,4.7],[2.6,3.3,4.7]]],
 'baoyun-flat-porch-roof':['fe4d74e5',[[0,5.6,6.15]]],
 'baoyun-photo-porch-frieze':['fea7a95',[[0,6.149999994039535,4.090000095367432]]],
 'baoyun-photo-porch-frieze-return':['e012fdc5',[[-3.325,6.149999994039535,6.19],[3.325,6.149999994039535,6.19]]],
 'baoyun-photo-porch-stepped-cornice':['3a6ae385',[[0,6.544999994039535,6.15]]]
};
function sourceHash(g){let h=2166136261;for(const a of[g.attributes.position,g.attributes.normal,g.attributes.uv,g.index].filter(Boolean))for(const v of new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength))h=Math.imul(h^v,16777619)>>>0;return h.toString(16);}
export function applyBaoyunMainPorch(kit,item,built){
 if(kit.baoyunMainPorch===false)return null;
 const {f,g}=built,roles=new Set(['baoyun-porch-square-column','baoyun-flat-porch-roof','baoyun-photo-porch-frieze','baoyun-photo-porch-frieze-return','baoyun-photo-porch-stepped-cornice']);
 if(item?.name!=='宝蕴楼'||item.structure!=='baoyun-western-storehouse'||f.userData.baoyunMainPorch)throw Error('Baoyun porch exact identity or duplicate');
 if(f.parent!==kit.root||f.scale.toArray().some(v=>v!==1)||f.rotation.toArray().slice(0,3).some(v=>v!==0)||kit.root.position.toArray().some(v=>v!==0)||kit.root.rotation.toArray().slice(0,3).some(v=>v!==0)||kit.root.scale.toArray().some(v=>v!==1))throw Error('Baoyun source ancestry changed');
 const old=f.children.filter(m=>roles.has(m.name)),roundels=f.children.filter(m=>m.name==='baoyun-photo-seven-frieze-roundels'),rims=f.children.filter(m=>m.name==='baoyun-photo-roundel-rim');
 const pale=old[0]?.material,grey=f.children.find(m=>m.name==='baoyun-semibasement')?.material;
 if(old.length!==7||roundels.length!==7||rims.length!==7||old.some(m=>!m.isMesh||m.material!==pale||m.rotation.x!==0||m.rotation.y!==0||m.rotation.z!==0||m.scale.toArray().some(v=>v!==1)))throw Error('Baoyun complete original porch source required');
 for(const [name,[hash,positions]]of Object.entries(SOURCE_TARGETS)){const nodes=old.filter(m=>m.name===name);if(nodes.length!==positions.length||nodes.some((m,i)=>sourceHash(m.geometry)!==hash||m.position.toArray().some((v,j)=>v!==positions[i][j])||Object.keys(m.geometry.morphAttributes).length))throw Error('Baoyun exact original geometry or placement changed');}
 for(const [nodes,hash,z,rx]of[[roundels,'2b40df9c',3.977000095367432,Math.PI/2],[rims,'e24b811d',3.960000095367432,0]])if(nodes.some((m,i)=>sourceHash(m.geometry)!==hash||m.position.x!==(i-3)*.77||m.position.y!==6.149999994039535||m.position.z!==z||m.rotation.x!==rx||m.rotation.y!==0||m.rotation.z!==0||m.scale.toArray().some(v=>v!==1)))throw Error('Baoyun original round contour changed');
 const cols=old.filter(m=>m.name==='baoyun-porch-square-column'),roof=old.find(m=>m.name==='baoyun-flat-porch-roof');
 if(cols.length!==2||cols.some(m=>Math.abs(m.position.x)!==2.6||m.position.y!==3.3||m.position.z!==4.7)||roof.position.y!==5.6||roof.position.z!==6.15)throw Error('Baoyun original porch placement changed');
 for(const m of old){m.geometry.computeBoundingBox();if(!m.geometry.boundingBox||(m.geometry.index?.count??m.geometry.attributes.position.count)!==36||m.geometry.drawRange.start!==0||m.geometry.drawRange.count!==Infinity)throw Error('Baoyun original porch geometry changed');}
 const masonry=f.children.filter(m=>m.name==='baoyun-western-masonry'),bodySource=[['f7cef165',[0,5.6000000000000005,12]],['3d180025',[-19.5,5.6000000000000005,-2.75]],['3d180025',[19.5,5.6000000000000005,-2.75]]];
 if(masonry.length!==3||masonry.some((m,i)=>!m.isMesh||!m.visible||m.material?.name!=='baoyun_red_plaster'||m.material.transparent||m.material.opacity!==1||sourceHash(m.geometry)!==bodySource[i][0]||m.position.toArray().some((v,j)=>v!==bodySource[i][1][j])||m.rotation.toArray().slice(0,3).some(v=>v!==0)||m.scale.toArray().some(v=>v!==1)||m.geometry.drawRange.start!==0||m.geometry.drawRange.count!==Infinity||Object.keys(m.geometry.morphAttributes).length))throw Error('Baoyun retained masonry clipping source changed');
 const removedPhysics=kit.colliders.filter(b=>[-1,1].some(s=>b.min.x===g.x+(s*2.6-.3)&&b.max.x===g.x+(s*2.6+.3)&&b.min.y===1.2&&b.max.y===5.4&&b.min.z===g.z+4.4&&b.max.z===g.z+5));
 if(removedPhysics.length!==2)throw Error('Baoyun original two column collision sources required');
 const profile=buildBaoyunMainPorch(kit,f,g,{pale,grey});
 for(const m of old){m.removeFromParent();m.geometry.dispose();}
 for(const b of removedPhysics)kit.colliders.splice(kit.colliders.indexOf(b),1);
 // Retain the old seven contours without pretending to supply missing seals.
 // They remain non-structural relief decoration, as in the original facade.
 for(const m of roundels){m.position.y=8.045;m.position.z=4.195;m.userData.baoyunMainPorchDecoration='retained-round-contour';}
 for(const m of rims){m.position.y=8.045;m.position.z=4.178;m.userData.baoyunMainPorchDecoration='retained-round-rim';}
 return profile;
}
