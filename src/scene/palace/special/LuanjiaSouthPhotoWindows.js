import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const HOST='luanjia-south-provisional-wing',KEY='luanjiaSouthPhotoWindows';
const stream=m=>{m.updateWorldMatrix(true,false);const a=[],p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++)a.push(...new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld).toArray().map(Math.fround));return a;};
/** Photo8037 shows two rows of narrow dark windows. South-wing/south-face
 * attribution is a city-wall/corner-tower topology inference, NOT a caption or
 * survey. Closed shallow recesses are an explicit fit, not transparent glass,
 * historical joinery or a claim that the real window was sealed. */
export function finishLuanjiaSouthPhotoWindows(kit,zone){
 if(zone?.id!=='outer-east')return null;
 const hosts=kit.root.children.filter(f=>f.userData.structure?.id===HOST),f=hosts[0],root=kit.root;
 if(hosts.length!==1||root.name!=='outer-east'||root.position.lengthSq()||root.rotation.x||root.rotation.y||root.rotation.z||!root.scale.equals(new T.Vector3(1,1,1))||f.position.x!==-340||f.position.y!==0||f.position.z!==-378||f.rotation.x||f.rotation.y!==Math.PI||f.rotation.z||!f.scale.equals(new T.Vector3(1,1,1))||!f.userData.luanjiaSouthTwoLevel||f.userData[KEY]||!Object.isExtensible(f.userData)||Object.isFrozen(f.children)||['colliders','owned'].some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k])))throw Error('Original mutable two-level south warehouse required');
 const ms=f.children.filter(m=>m.name===HOST+':long-wall-1'),cs=kit.colliders.filter(c=>c.triangleSupport?.id===HOST+':long-wall-1'),old=ms[0],oldOwner=cs[0];
 if(ms.length!==1||cs.length!==1||!old.isMesh||!old.visible||old.material!==kit.lib.material('wall_brick')||old.position.lengthSq()||old.rotation.x||old.rotation.y||old.rotation.z||!old.scale.equals(new T.Vector3(1,1,1)))throw Error('Unique original south wall and owner required');
 const b=new T.Box3().setFromBufferAttribute(old.geometry.attributes.position),v=stream(old),ov=oldOwner.triangleSupport.template.triangles.flatMap(q=>[q.triangle.a,q.triangle.b,q.triangle.c].flatMap(p=>p.toArray()));
 if(Math.abs(b.min.x+23)>1e-5||Math.abs(b.max.x-23)>1e-5||Math.abs(b.min.y)>1e-5||Math.abs(b.max.y-6.6)>1e-5||Math.abs(b.min.z-4.18)>1e-5||Math.abs(b.max.z-4.5)>1e-5||!oldOwner.equals(oldOwner.triangleSupport.box)||v.length!==ov.length||v.some((n,i)=>n!==ov[i]))throw Error('Original wall geometry/contact changed');
 const info={source:'https://img.dpm.org.cn/Uploads/Picture/dc/8037.jpg',sourceSha256:'dd08fdb9ef5f2d75e46bd0422c901d8e09413de4dcdadef9fb6b723a7f1d740d',rows:2,columnsFit:10,windowCount:20,identityVerified:false,attribution:'PROBABLE_SOUTH_WING_SOUTH_FACE_FROM_UNMIRRORED_WALL_CORNER_TOPOLOGY_NOT_OFFICIAL_CAPTION',dimensions:'ENGINEERING_FIT_NOT_SURVEYED_WINDOW_COUNT_NOT_BAY_COUNT',construction:'OPAQUE_DARK_RECESS_WITH_REAL_SOLID_BACKING_GAME_ADAPTATION_NOT_VERIFIED_GLAZING',newSupports:0,newRooms:0,unchanged:'NORTH_ENTRY_BOTH_GABLES_EAST_WING_ROOF_FLOORS_STAIRS',unknown:['exact wing photographic identity','window count dimensions spacing and current condition','glass shutters ventilation and joinery','historical or present public access']};
 const brick=[],dark=[],meshes=[],owners=[];let shade;
 const box=(list,x0,x1,y0,y1,z0,z1)=>list.push(new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2));
 try{
  // Full rear120mm masonry remains visible from inside and physically solid.
  box(brick,-23,23,0,6.6,4.18,4.30);
  for(const[y0,y1]of[[0,1.2],[2.3,3.95],[5.05,6.6]])box(brick,-23,23,y0,y1,4.30,4.5);
  for(const[y0,y1]of[[1.2,2.3],[3.95,5.05]]){let x=-23;for(let i=0;i<10;i++){const cx=-20.25+i*4.5;box(brick,x,cx-.30,y0,y1,4.30,4.5);box(dark,cx-.30,cx+.30,y0,y1,4.30,4.304);x=cx+.30;}box(brick,x,23,y0,y1,4.30,4.5);}
  shade=new T.MeshStandardMaterial({name:'luanjia-photo-opaque-dark-window-fit',color:0x252b29,roughness:1});
  for(const[parts,mat,id]of[[brick,old.material,'masonry'],[dark,shade,'opaque-backs']]){let g=mergeGeometries(parts);if(id==='masonry'){g=applyBoxUV(g,kit.lib.tileSize('wall_brick'));}const m=new T.Mesh(g,mat);m.name=HOST+':photo-windows-'+id;m.userData.luanjiaPhotoWindows=info;m.castShadow=m.receiveShadow=true;m.updateMatrixWorld();m.matrixWorld.copy(f.matrixWorld);meshes.push(m);const a=[];const p=g.attributes.position,ix=g.index;for(let i=0;i<(ix?.count??p.count);i++)a.push(...new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(f.matrixWorld).toArray());const q=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const tri=triangleInstance(createTriangleTemplate(q),[0,0,0],m.name),c=tri.box.clone();c.triangleSupport=tri;c.luanjiaPhotoWindows=id;owners.push(c)}finally{q.dispose()}}
 }catch(e){for(const m of meshes)m.geometry.dispose();shade?.dispose();throw e;}finally{for(const g of [...brick,...dark])g.dispose();}
 f.remove(old);f.add(...meshes);kit.colliders.splice(kit.colliders.indexOf(oldOwner),1,...owners);kit.owned.push(shade);f.userData[KEY]=info;old.geometry.dispose();return info;
}
