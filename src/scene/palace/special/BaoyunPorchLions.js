import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const SOURCE='https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg';
/** Four complete visible recumbent silhouettes, coarse stone colour only.
 * Dimensions, backs, poses and hidden attachment are fits, not scanned sculpture. */
export function finishBaoyunPorchLions(kit){
 if(kit?.root?.name!=='outer-west')return null;
 const hosts=kit.root.children.filter(f=>f.userData.structure?.id==='baoyun-western-storehouse'),f=hosts[0],p=f?.userData.baoyunMainPorch;
 if(hosts.length!==1||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||f.position.x!==300.9||f.position.y!==0||f.position.z!==-217.7||f.rotation.toArray().slice(0,3).some(Boolean)||!f.scale.equals(new T.Vector3(1,1,1))||p?.source!==SOURCE||p.fit.top!==9.23||f.userData.baoyunPorchLions||!Object.isExtensible(f.userData)||Object.isFrozen(f.children)||['colliders','owned'].some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k])))throw Error('Original completed Baoyun porch required');
 const lips=f.children.filter(m=>m.name==='baoyun-main-porch-upper-lip'),lip=lips[0];
 if(lips.length!==1||!lip.visible||lip.position.y!==9.09||lip.position.z!==6.15||lip.material.name!=='baoyun_pale_stone'||lip.geometry.boundingBox&&lip.geometry.boundingBox.isEmpty())throw Error('Original visible upper porch bearing required');
 lip.geometry.computeBoundingBox();const bearing=lip.geometry.boundingBox.clone().translate(lip.position);if(Math.abs(bearing.max.y-9.23)>1e-5||Math.abs(bearing.min.x+3.45)>1e-5||Math.abs(bearing.max.x-3.45)>1e-5||Math.abs(bearing.min.z-4.15)>1e-5||Math.abs(bearing.max.z-8.15)>1e-5)throw Error('Original porch cap changed');
 const info={source:SOURCE,sourceSha256:'02e2e1cf8f4cc9ca0b9d735b0e7e93792376047ef29ee5d80c284f564b2ebe0e',count:4,scope:'FOUR_PHOTO_VISIBLE_RECUMBENT_LION_OUTLINES_ONLY',preciseShapeVerified:false,dimensions:'COARSE_POSITION_DIMENSIONS_POSE_BACKS_ENGINEERING_FIT_NOT_SURVEY',surface:'PALE_BUILDING_MATERIAL_COLOUR_NOT_ANTIQUE_STONE_IDENTIFICATION',newSupports:0,newRooms:0,oldMetadata:'Original mainPorch unverified four-lion statement retained as old audit scope; this adds only silhouettes',unknown:['sculpted mane claws facial details and motifs','precise individual sculpture dimensions and backs','actual stone material and current condition','hidden attachment and current visitor access']};
 const all=[],owners=[],temporaries=[];let merged;
 try{f.updateWorldMatrix(true,true);for(const row of[0,1])for(const side of[-1,1]){const parts=[],cx=side*(row?2.3:2.65),cz=row?6.65:4.65,base=9.23,h=row?.38:.10,face=-side;
  const add=g=>{g.scale(face,1,1);if(face<0){const ix=g.index;if(ix){for(let i=0;i<ix.count;i+=3){const a=ix.getX(i);ix.setX(i,ix.getX(i+2));ix.setX(i+2,a)}}else{for(const attr of Object.values(g.attributes)){for(let i=0;i<attr.count;i+=3)for(let k=0;k<attr.itemSize;k++){const a=attr.array[i*attr.itemSize+k];attr.array[i*attr.itemSize+k]=attr.array[(i+2)*attr.itemSize+k];attr.array[(i+2)*attr.itemSize+k]=a}}}g.computeVertexNormals();}g.translate(cx,base+h,cz);parts.push(g);temporaries.push(g);};
  const box=(w,hh,d,x,y,z)=>add(new T.BoxGeometry(w,hh,d).translate(x,y,z));
  const ell=(rx,ry,rz,x,y,z)=>add(new T.SphereGeometry(1,12,8).scale(rx,ry,rz).translate(x,y,z));
  box(1.38,h,.68,0,-h/2,0);
  ell(.43,.20,.24,-.12,.22,0); // low recumbent torso
  ell(.22,.29,.22,.23,.32,0); // rising chest supports head
  ell(.235,.25,.245,.30,.59,0); // broad uncarved mane/head mass
  ell(.15,.12,.16,.49,.56,0); // short blunt muzzle
  ell(.065,.075,.07,.28,.79,-.16);ell(.065,.075,.07,.28,.79,.16); // ears, no facial carving
  for(const s of[-1,1]){ell(.23,.075,.075,.30,.075,s*.17);ell(.20,.09,.09,-.37,.09,s*.17);}
  const tail=new T.CatmullRomCurve3([new T.Vector3(-.37,.23,.15),new T.Vector3(-.58,.20,.20),new T.Vector3(-.57,.10,.25),new T.Vector3(-.39,.09,.26)]);add(new T.TubeGeometry(tail,10,.045,5,false));
  const geo=mergeGeometries(parts);temporaries.push(geo);const a=[],v=geo.attributes.position,ix=geo.index;for(let i=0;i<(ix?.count??v.count);i++)a.push(...new T.Vector3().fromBufferAttribute(v,ix?ix.getX(i):i).applyMatrix4(f.matrixWorld).toArray());const q=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const tri=triangleInstance(createTriangleTemplate(q),[0,0,0],`baoyun-porch-lion:${row}:${side}`),c=tri.box.clone();c.triangleSupport=tri;c.baoyunLions={row,side};owners.push(c)}finally{q.dispose()}all.push(geo);
 }merged=mergeGeometries(all);
 }catch(e){merged?.dispose();throw e;}finally{for(const g of temporaries)g.dispose();}
 const mesh=new T.Mesh(merged,lip.material);mesh.name='baoyun-four-photo-lion-silhouettes';mesh.userData.baoyunLions=info;mesh.castShadow=mesh.receiveShadow=true;f.add(mesh);kit.colliders.push(...owners);f.userData.baoyunPorchLions=info;return info;
}
