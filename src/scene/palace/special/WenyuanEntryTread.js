import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
// A visible intermediate stone tread on the existing dry bank. The photograph
// supports entrance stairs, not these fitted dimensions or visitor permission.
export function finishWenyuanEntryTread(kit){
 const hosts=kit.root.children.filter(f=>f.userData.structure?.id==='wenyuan-pavilion');
 if(!hosts.length)return false;
 if(hosts.length!==1)throw Error('Unique Wenyuan tread host required');
 const f=hosts[0],g=f.userData.structure;
 if(g.x!==-186.5||g.z!==-132.8||g.w!==40.5||g.d!==17.9||g.ph!==.5||g.southVeranda?.setback!==1.8||f.position.x!==g.x||f.position.z!==g.z||f.position.y||f.rotation.x||f.rotation.y||f.rotation.z||!f.scale.equals(new T.Vector3(1,1,1))||g.entryTread)throw Error('Exact current Wenyuan tread source required');
 const geometry=applyBoxUV(new T.BoxGeometry(4,.25,.6),kit.lib.tileSize('stone_slab'));
 const mesh=kit.mesh(f,geometry,kit.lib.material('stone_slab'),-3.375,.125,-9.9);mesh.name='wenyuan-entry-middle-tread';
 mesh.userData.wenyuanEntryTread=true;f.updateWorldMatrix(true,true);
 const box=new T.Box3().setFromBufferAttribute(geometry.attributes.position).applyMatrix4(mesh.matrixWorld);box.wenyuanEntryTread=true;kit.colliders.push(box);
 const top=box.clone();top.min.y=top.max.y;kit.walkables.push({type:'box',box:top,wenyuanEntryTread:true});
 g.entryTread={status:'ENGINEERING_FIT_NOT_SURVEYED',source:'https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg',width:4,depth:.6,height:.25,visibleSolid:true,globalContactChanged:false};return true;
}
