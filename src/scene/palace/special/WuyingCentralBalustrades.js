import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {bindWuyingFloors,wuyingBalustradeRegion,WUYING_BALUSTRADE_IDS} from '../../../controls/WuyingBalustradeSupport.js';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const fail=()=>{throw Error('Wuying central balustrade retained source drift');};
const sameGeometry=(a,b)=>a.index?.count===b.index?.count&&JSON.stringify(a.index?[...a.index.array]:null)===JSON.stringify(b.index?[...b.index.array]:null)&&a.drawRange.start===0&&a.drawRange.count===Infinity&&!Object.keys(a.morphAttributes).length&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).length===Object.keys(b.attributes).length&&Object.entries(b.attributes).every(([key,v])=>{const w=a.attributes[key];return w?.itemSize===v.itemSize&&w.normalized===v.normalized&&!w.isInterleavedBufferAttribute&&w.array.constructor===v.array.constructor&&w.count===v.count&&w.array.every((x,i)=>x===v.array[i]);});
const plain=m=>m.visible&&!m.rotation.x&&!m.rotation.y&&!m.rotation.z&&m.scale.equals(new T.Vector3(1,1,1));
/** Central descending pair only. Two new plain posts per side plus the retained
 * upper endpoint form three fitted stations, not a surveyed post inventory. */
export function applyWuyingCentralBalustrades(kit,frame){
 const g=frame?.userData.structure;if(g?.id!=='south-gate:wuying'||g.wuyingCentralBalustrades)return false;
 if(g.profile!=='wuying'||g.name!=='武英门'||g.x!==220.8||g.z!==-249.8||g.w!==34.9||g.d!==17.9||g.ph!==.8||g.colH!==6.6||!g.wuyingCentralStair||g.wuyingCentralStair.stairSideBalustrades!==false||g.wuyingSouthRails?.runs.length!==4||frame.parent!==kit.root||!plain(frame)||!frame.position.equals(new T.Vector3(g.x,0,g.z))||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||kit.root.scale.toArray().some(x=>x!==1))fail();
 const width=5.68,run=1.28,edge=-9.75,toe=edge-run,axis=width/2+.2,lower=toe+.12,upper=edge+.02,middle=(lower+upper)/2;
 const groups=frame.children.filter(o=>o.isGroup&&o.children.some(m=>m.userData.wuyingCentralStair==='inclined-stone'));if(groups.length!==1||groups[0].children.length!==13||!plain(groups[0])||groups[0].position.lengthSq())fail();const stair=groups[0],stones=[];
 const materials=new Set();frame.traverse(m=>{if(m.isMesh&&m.material?.name==='wuying_gate_photo_pale_rail')materials.add(m.material);});if(materials.size!==1)fail();const material=[...materials][0];
 for(const side of[-1,1]){
  const stone=stair.children.filter(m=>!m.userData.wuyingCentralStair&&near(m.position.x,side*axis));if(stone.length!==1)fail();const m=stone[0],geo=applyBoxUV(new T.BoxGeometry(.4,.3,Math.hypot(run,.8)),kit.lib.tileSize('marble'));
  const ok=m.visible&&m.material===kit.lib.material('marble')&&near(m.position.y,.45)&&near(m.position.z,edge-run/2)&&near(m.rotation.x,-Math.atan2(.8,run))&&!m.rotation.y&&!m.rotation.z&&m.scale.equals(new T.Vector3(1,1,1))&&sameGeometry(m.geometry,geo);geo.dispose();if(!ok)fail();stones.push(m);
  const post=frame.children.filter(m=>m.isMesh&&m.name==='wuying-gate-south-plain-post-shaft'&&near(m.position.x,side*(width/2+.16))&&near(m.position.y,1.33)&&near(m.position.z,edge+.18));const ref=new T.BoxGeometry(.32,1.06,.32),good=post.length===1&&plain(post[0])&&post[0].material===material&&sameGeometry(post[0].geometry,ref);ref.dispose();if(!good)fail();
 }
 const floor=bindWuyingFloors(kit.walkables),stage=new T.Group(),allocated=[],colliders=[],instances=[];stage.name='wuying-central-descending-balustrades';
 const mesh=(geometry,x,y,z,role)=>{allocated.push(geometry);const m=kit.mesh(stage,geometry,material,x,y,z);m.name='wuying-central-balustrade-'+role;m.userData.wuyingCentralBalustrade=role;return m;};
 const grade=z=>.075+(.8-.075)*(z-lower)/(upper-lower);
 const worldVertices=(m,matrix)=>{const p=m.geometry.attributes.position,ix=m.geometry.index;return Array.from({length:ix?.count??p.count},(_,i)=>{const v=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(matrix);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});};
 try{
  frame.updateWorldMatrix(true,true);
  for(const [index,side] of [-1,1].entries()){
   const id=WUYING_BALUSTRADE_IDS[index],parts=[],posts=[];
   for(const z of[lower,middle])posts.push(mesh(new T.BoxGeometry(.28,.94,.28),side*axis,grade(z)+.59,z,'plain-post'));
   for(const[a,b]of[[lower+.14,middle-.14],[middle+.14,upper]])for(const[role,w,h,offset]of[['plain-panel',.16,.57,.12],['top-rail',.24,.19,.78]]){
    const geo=new T.BoxGeometry(w,1,b-a),p=geo.attributes.position;
    for(let k=0;k<p.count;k++){const z=(a+b)/2+p.getZ(k);p.setY(k,grade(z)+offset+(p.getY(k)>0?h:0));}geo.computeVertexNormals();parts.push(mesh(geo,side*axis,0,(a+b)/2,role));
   }
   stage.updateMatrixWorld(true);
   for(const p of posts){const matrix=frame.matrixWorld.clone().multiply(p.matrixWorld),box=new T.Box3().setFromPoints(worldVertices(p,matrix));colliders.push(box);}
   const owner=colliders[colliders.length-posts.length],region=wuyingBalustradeRegion(id);
   owner.furnitureMotionScope={kind:'wuying-central-balustrades',id,groundY:0,floor,minOffsetX:region.minX-owner.min.x,maxOffsetX:region.maxX-owner.min.x,minOffsetZ:region.minZ-owner.min.z,maxOffsetZ:region.maxZ-owner.min.z};
   const faces=[];for(const [mi,m]of [...parts,stones[index]].entries()){const vertices=worldVertices(m,m===stones[index]?m.matrixWorld:frame.matrixWorld.clone().multiply(m.matrixWorld));for(let k=0;k<vertices.length;k+=3)faces.push({source:{mesh:mi,triangle:k/3},vertices:vertices.slice(k,k+3)});}
   const surface=createXiqingSurface(faces,id),box=surface.box.clone();box.xiqingRoofSurface=surface;colliders.push(box);
   instances.push({id,side,axisX:side*axis,lowerZ:lower,middleZ:middle,upperJoinZ:upper,newPosts:2,upperPost:'RETAINED_HORIZONTAL_RAIL_ENDPOINT',sourceTriangles:faces.length});
  }
 }catch(error){for(const geo of new Set(allocated))geo.dispose();stage.clear();throw error;}
 const oldColliders=[...kit.colliders],priorStair=g.wuyingCentralStair;
 try{frame.add(stage);kit.colliders.push(...colliders);g.wuyingCentralStair={...priorStair,stairSideBalustrades:true};g.wuyingCentralBalustrades={objectId:'FC-77E2C07341',source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefdd3c1950.jpg',photographyDate:null,scope:'CENTRAL_SOUTH_DESCENDING_PAIR_ONLY',dimensionStatus:'RETAINED_SIDE_STONES_AND_PLAIN_MEMBER_PHOTO_FIT_NOT_SURVEY',carvedRelief:false,wholeGateAccepted:false,instances,addedColliders:colliders.length};}
 catch(error){T.Object3D.prototype.remove.call(frame,stage);Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...oldColliders);g.wuyingCentralStair=priorStair;delete g.wuyingCentralBalustrades;for(const geo of new Set(allocated))geo.dispose();stage.clear();throw error;}
 return true;
}
