import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98284ed0aff.jpg';
/** Three photographed stair groups. Distances and tread subdivision are model
 * fits; no indistinct dragon carving or historical visitor access is invented. */
export function buildShoukangSouthSteps(kit,item,f){
 if(item.name!=='寿康宫'||item.x!==289.2||item.z!==231||item.ph!==.75||item.d!==17.4||item.pad!==1||f.position.x!==item.x||f.position.z!==item.z||f.position.y!==0||f.rotation.x!==0||f.rotation.y!==0||f.rotation.z!==0||f.scale.x!==1||f.scale.y!==1||f.scale.z!==1||f.userData.r140ShoukangSouthSteps)throw Error('R140 Shoukang front steps binding mismatch');
 const edge=-item.d/2-item.pad,run=1.9,y=item.ph,material=kit.lib.material('marble'),tile=kit.lib.tileSize('marble'),groups=[];let slopeIndex=0,scopeOwner=null;
 const tag=(m,role)=>{m.name=role;m.userData={role,r140ShoukangSouthStep:true,dimensionStatus:'PHOTO_MODEL_FIT_NOT_SURVEY'};return m;};
 function treadFlight(cx,width,role){const n=7,sr=run/n;for(let i=0;i<n;i++){
  const top=y*(n-i)/n,z=edge-(i+.5)*sr,m=tag(kit.mesh(f,applyBoxUV(new THREE.BoxGeometry(width,top,sr),tile),material,cx,top/2,z),role+'-tread');
  kit.col(f,cx-width/2,0,z-sr/2,cx+width/2,top,z+sr/2);kit.colliders.at(-1).r140ShoukangSouthStep=true;scopeOwner??=kit.colliders.at(-1);
  kit.walkBox(f,cx-width/2,z-sr/2,cx+width/2,z+sr/2,top);kit.walkables.at(-1).r140ShoukangSouthStep=true;
 }return {cx,width,treads:n};}
 function slope(cx,width,topHigh,topLow,role){let geo=new THREE.BoxGeometry(width,1,run);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const t=(p.getZ(i)+run/2)/run;p.setY(i,p.getY(i)>0?topLow+(topHigh-topLow)*t:0);}geo.computeVertexNormals();geo=applyBoxUV(geo,tile);tag(kit.mesh(f,geo,material,cx,0,edge-run/2),role);const pos=geo.attributes.position,faces=[];for(let i=0;i<pos.count;i+=3)faces.push({source:{mesh:slopeIndex,triangle:i/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,i+k).add(new THREE.Vector3(item.x+cx,0,item.z+edge-run/2)))});const contact=createXiqingSurface(faces,'shoukang-south-slope-'+slopeIndex++),c=contact.box.clone();c.xiqingRoofSurface=contact;c.r140ShoukangSouthStep=true;kit.colliders.push(c);}
 for(const cx of [-8,8]){const width=4.2;groups.push({id:cx<0?'east':'west',flights:[treadFlight(cx,width,'shoukang-side-south')]});for(const sign of [-1,1])slope(cx+sign*(width/2+.22),.44,y+.12,.12,'shoukang-side-curb');}
 const stoneWidth=2.4,flightWidth=2.0,flightOffset=(stoneWidth+flightWidth)/2;
 const flights=[-1,1].map(sign=>treadFlight(sign*flightOffset,flightWidth,'shoukang-central-south'));
 slope(0,stoneWidth,y+.02,.05,'shoukang-central-uncarved-sloping-stone');
 for(const sign of [-1,1])slope(sign*(stoneWidth/2+flightWidth+.22),.44,y+.12,.12,'shoukang-central-curb');
 scopeOwner.furnitureMotionScope={kind:'shoukang-south-steps',id:'shoukang-south-steps',groundY:0,minOffsetX:item.x-11.2-scopeOwner.min.x,maxOffsetX:item.x+11.2-scopeOwner.min.x,minOffsetZ:item.z+edge-run-1-scopeOwner.min.z,maxOffsetZ:item.z+edge+2.1-scopeOwner.min.z};
 groups.splice(1,0,{id:'central',flights,centralStoneWidth:stoneWidth});
 return f.userData.r140ShoukangSouthSteps={originalObjectId:'FC-83D425C911',source:PHOTO,scope:'THREE_SOUTH_STAIR_GROUPS_ONLY',dimensionStatus:'PHOTO_RELATIONSHIP_AND_EXISTING_PLATFORM_MODEL_FIT_NOT_SURVEY',edge,run,platformY:y,groups,treadCountStatus:'MODEL_SUBDIVISION_NOT_VERIFIED_HISTORIC_COUNT',oldSingleFrontStair:'SUPPRESSED_AT_BUILDER_WITH_OLD_RAMP',support:'EXACT_DISCRETE_TREAD_TOPS_AND_REAL_SLOPE_TRIANGLES_IN_LOCAL_FEET_SCALAR_SCOPE',wholeObjectAccepted:false,remaining:['Central stone relief indistinct, not invented','Modern protective fence not added; no museum access claim','Complete facade, roof, interiors and courtyard remain separate requirements']};
}
