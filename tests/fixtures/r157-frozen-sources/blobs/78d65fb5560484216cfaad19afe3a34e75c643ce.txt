import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const fail=()=>{throw Error('Wuying central stair retained source drift');};
function sameGeometry(a,b){return a.index===null&&b.index===null&&a.drawRange.start===0&&a.drawRange.count===Infinity&&Object.keys(a.morphAttributes).length===0&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).length===Object.keys(b.attributes).length&&Object.entries(b.attributes).every(([name,attr])=>{const v=a.attributes[name];return v?.itemSize===attr.itemSize&&v.normalized===attr.normalized&&v.array?.constructor===attr.array.constructor&&!v.isInterleavedBufferAttribute&&v.count===attr.count&&v.array.every((x,i)=>x===attr.array[i]);});}
/** One photographed south central assembly only. Dimensions, five levels and
 * central width ratio .54 remain retained-model/photo fits; no carved relief. */
export function applyWuyingCentralStair(kit,frame){
 const g=frame?.userData.structure;if(g?.id!=='south-gate:wuying')return false;if(g.wuyingCentralStair)return false;
 if(g.profile!=='wuying'||g.name!=='武英门'||!near(g.x,220.8)||!near(g.z,-249.8)||!near(g.w,34.9)||!near(g.d,17.9)||g.ph!==.8||g.colH!==6.6||!g.wuyingSouthRails||g.wuyingSouthRails.runs.length!==4||frame.parent!==kit.root||!frame.position.equals(new THREE.Vector3(g.x,0,g.z))||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(new THREE.Vector3(1,1,1)))fail();
 const width=5.68,run=1.28,rise=.8,edge=-9.75,toe=edge-run,n=5,step=run/n,centerWidth=width*.54,flank=(width-centerWidth)/2,tile=kit.lib.tileSize('marble'),mat=kit.lib.material('marble');
 const groups=frame.children.filter(o=>o.isGroup&&o.position.equals(new THREE.Vector3())&&o.children.length===7&&near(o.children[0]?.position.z,edge-step/2));if(groups.length!==1)fail();const group=groups[0];if(group.rotation.x||group.rotation.y||group.rotation.z||!group.scale.equals(new THREE.Vector3(1,1,1)))fail();
 const old=group.children.slice(0,5),oldSet=new Set(old),oldGeometries=new Set(old.map(m=>m.geometry));let shared=false;kit.root.traverse(m=>{if(m.isMesh&&!oldSet.has(m)&&oldGeometries.has(m.geometry))shared=true;});if(shared||oldGeometries.size!==5)fail();
 for(let i=0;i<n;i++){const m=old[i],top=rise-(i+1)*rise/6,expected=applyBoxUV(new THREE.BoxGeometry(width,top,step),tile);const good=m.isMesh&&m.visible&&m.material===mat&&near(m.position.x,0)&&near(m.position.y,top/2)&&near(m.position.z,edge-(i+.5)*step)&&!m.rotation.x&&!m.rotation.y&&!m.rotation.z&&m.scale.equals(new THREE.Vector3(1,1,1))&&sameGeometry(m.geometry,expected);expected.dispose();if(!good)fail();}
 // Retained cap protrudes .05 m beyond the logical platform. Its real .81 m
 // top must support the target stair joint; never hide this ledge under a ramp.
 const cap=frame.children.filter(m=>m.isMesh&&m.material===kit.lib.material('stone_slab')&&near(m.position.x,0)&&near(m.position.y,.77)&&near(m.position.z,0));if(cap.length!==1)fail();
 const capExpected=applyBoxUV(new THREE.BoxGeometry(g.w+1.7,.08,g.d+1.7),kit.lib.tileSize('stone_slab'));const capGood=cap[0].visible&&sameGeometry(cap[0].geometry,capExpected)&&!cap[0].rotation.x&&!cap[0].rotation.y&&!cap[0].rotation.z&&cap[0].scale.equals(new THREE.Vector3(1,1,1));capExpected.dispose();if(!capGood)fail();
 const matches=kit.walkables.map((w,i)=>({w,i})).filter(({w})=>w.type==='ramp'&&w.axis==='z'&&near(w.minX,g.x-width/2)&&near(w.maxX,g.x+width/2)&&near(w.a0,g.z+edge)&&near(w.a1,g.z+toe)&&w.y0===rise&&w.y1===0);if(matches.length!==1)fail();const {w:prior,i:index}=matches[0];if(!near(prior.minZ,g.z+toe)||!near(prior.maxZ,g.z+edge))fail();
 const stage=new THREE.Group(),allocated=[],supports=[],newMesh=(geo,x,y,z,role)=>{allocated.push(geo);const m=kit.mesh(stage,geo,mat,x,y,z);m.name='wuying-central-'+role;m.userData.wuyingCentralStair=role;return m;};
 try{
  for(let k=0;k<n;k++){const top=rise-(k+1)*rise/6,z=edge-(k+.5)*step;for(const side of[-1,1]){const x=side*(centerWidth/2+flank/2);newMesh(applyBoxUV(new THREE.BoxGeometry(flank,top,step),tile),x,top/2,z,'flank-tread');supports.push({type:'box',rescue:false,box:new THREE.Box3(new THREE.Vector3(g.x+x-flank/2,top,g.z+z-step/2),new THREE.Vector3(g.x+x+flank/2,top,g.z+z+step/2))});}}
  const shape=new THREE.Shape();shape.moveTo(-edge,rise);shape.lineTo(-toe,0);shape.lineTo(-edge,0);shape.closePath();const wedge=new THREE.ExtrudeGeometry(shape,{depth:centerWidth,bevelEnabled:false,steps:1,curveSegments:1});wedge.rotateY(Math.PI/2);wedge.translate(-centerWidth/2,0,0);newMesh(applyBoxUV(wedge,tile),0,0,0,'inclined-stone');
 }catch(error){for(const geo of new Set(allocated))geo.dispose();stage.clear();throw error;}
 const center={...prior,minX:g.x-centerWidth/2,maxX:g.x+centerWidth/2};
 supports.push({type:'box',rescue:false,box:new THREE.Box3(new THREE.Vector3(g.x-width/2,.81,g.z+edge-.05),new THREE.Vector3(g.x+width/2,.81,g.z+edge))});
 // Commit is transactional too: registration may throw after mutating its array.
 const children=[...group.children],walkables=[...kit.walkables],metadata={objectId:'FC-77E2C07341',source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefdd3c1950.jpg',status:'VERIFY_PENDING',wholeGateAccepted:false,dimensionStatus:'RETAINED_ENVELOPE_FIVE_LEVELS_AND_PHOTO_RATIO_NOT_SURVEY',centerWidthRatio:.54,centerWidth,flankWidth:flank,stepCount:n,retainedCapSupportDepth:.05,carvedRelief:false,stairSideBalustrades:false,sourceWalkableIndex:index};
 try{for(const m of old)group.remove(m);for(const m of [...stage.children])group.add(m);kit.walkables.splice(index,1,center,...supports);g.wuyingCentralStair=metadata;}
 catch(error){for(const m of [...group.children])THREE.Object3D.prototype.remove.call(group,m);for(const m of children)THREE.Object3D.prototype.add.call(group,m);Array.prototype.splice.call(kit.walkables,0,kit.walkables.length,...walkables);delete g.wuyingCentralStair;for(const geo of new Set(allocated))geo.dispose();stage.clear();throw error;}
 for(const m of old)m.geometry.dispose();return true;
}
