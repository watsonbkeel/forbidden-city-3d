import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const FITS=Object.freeze([{key:'benren',name:'本仁殿',x:-212.2,z:-224.2,w:26.7,d:10.3,rot:-Math.PI/2},{key:'jiyi',name:'集义殿',x:-159.6,z:-223.5,w:26.6,d:11.6,rot:Math.PI/2}]);
const identity=o=>o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Visible intermediate stone at the two existing courtyard-side entries.
 * Own courtyard photos attest stone access, not these engineering dimensions.
 * Original halls, platforms and all controllers remain unchanged. */
export function finishWenhuaCompanionSteps(kit,zone){
 if(zone?.id!=='outer-east')return false;
 if(!kit?.root||!identity(kit.root)||['colliders','walkables'].some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])))throw Error('Mutable unmoved companion source required');
 const plans=FITS.map(p=>{const item=zone.items?.find(i=>i.name===p.name),hosts=kit.root.children.filter(f=>f.userData.structure?.remainingProfile===p.key);if(!item||hosts.length!==1||item.x!==p.x||item.z!==p.z||item.w!==p.w||item.d!==p.d||item.ph!==.5)throw Error('Exact companion identity required');const f=hosts[0];if(f.position.x!==p.x||f.position.y||f.position.z!==p.z||f.rotation.x||f.rotation.y!==p.rot||f.rotation.z||!f.scale.equals(new T.Vector3(1,1,1))||f.userData.structure.companionEntryTread)throw Error('Unmoved original companion frame required');f.updateWorldMatrix(true,false);const edge=-(p.d+2)/2,platform=new T.Box3(new T.Vector3(-(p.w+2)/2,.5,edge),new T.Vector3((p.w+2)/2,.5,-edge)).applyMatrix4(f.matrixWorld);if(kit.walkables.filter(w=>w.type==='box'&&w.box.equals(platform)).length!==1)throw Error('Exact original .5 platform required');return{p,f,edge};});
 const tile=kit.lib.tileSize('stone_slab'),material=kit.lib.material('stone_slab'),staged=[];
 try{for(const {p,f,edge}of plans){const geometry=applyBoxUV(new T.BoxGeometry(3.6,.25,2.2),tile),mesh=new T.Mesh(geometry,material);mesh.name=p.key+'-visible-middle-entry-tread';mesh.position.set(0,.125,edge-1.1);mesh.updateMatrix();mesh.matrixWorld.multiplyMatrices(f.matrixWorld,mesh.matrix);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.wenhuaCompanionTread=p.key;const box=new T.Box3().setFromBufferAttribute(geometry.attributes.position).applyMatrix4(mesh.matrixWorld);box.wenhuaCompanionTread=p.key;const top=box.clone();top.min.y=top.max.y;staged.push({f,mesh,box,support:{type:'box',box:top,wenhuaCompanionTread:p.key},meta:{source:'https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b70481d5f.jpg',status:'VISIBLE_STONE_ACCESS_ENGINEERING_FIT_NOT_SURVEYED',width:3.6,depth:2.2,height:.25,originalPlatform:.5,globalContactChanged:false}});}}
 catch(e){for(const s of staged)s.mesh.geometry.dispose();throw e;}
 const nc=kit.colliders.length,nw=kit.walkables.length;
 try{for(const s of staged){s.f.add(s.mesh);kit.colliders.push(s.box);kit.walkables.push(s.support);s.f.userData.structure.companionEntryTread=s.meta;}}
 catch(e){kit.colliders.length=nc;kit.walkables.length=nw;for(const s of staged){s.mesh.removeFromParent();s.mesh.geometry.dispose();delete s.f.userData.structure.companionEntryTread;}throw e;}
 return true;
}
