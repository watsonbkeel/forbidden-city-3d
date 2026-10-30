import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const FIT=Object.freeze({edge:-5.55,run:1.4,width:4,treads:7,cheekWidth:.4});
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1533[1024].jpg';
export function fitSuichuSouthApproach(p){
 if(p.key!=='suichu')return;
 const q=p.portals.find(q=>q.side==='front'),toe=FIT.edge-FIT.run;
 if(!q||p.ph!==.5||p.rot!==0||q.x!==0)throw Error('Suichu south approach identity mismatch');
 q.approachPoints=[[0,toe-1,0],[0,toe-.6,0],[0,FIT.edge+.65,p.ph],[0,q.z,p.ph],[0,q.z+.7,p.ph]].map(([localX,localZ,feetY])=>({localX,localZ,x:p.x+localX,z:p.z+localZ,feetY}));
}
export function buildSuichuSouthSteps(c){
 const{kit,item,p,f}=c;
 for(const[k,v]of Object.entries({key:'suichu',x:-253.1,z:422.1,localW:17.1,localD:10.1,ph:.5,rot:0}))if(p[k]!==v)throw Error('Suichu stair profile mismatch');
 if((item.pad??.5)!==.5||f.userData.suichuSouthSteps||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||f.rotation.toArray().slice(0,3).some(Boolean)||f.scale.toArray().some(x=>x!==1))throw Error('Suichu stair frame mismatch');
 const {edge,run,width,treads,cheekWidth}=FIT,toe=edge-run,material=kit.lib.material('marble'),tile=kit.lib.tileSize('marble'),tops=[];let owner;
 const tag=(m,role)=>{m.name=role;m.userData.suichuSouthStep=true;m.userData.dimensionStatus='SOURCE_RELATIONSHIP_MODEL_FIT_NOT_SURVEY';return m;};
 for(let i=0;i<treads;i++){
  const top=Math.fround(p.ph*(treads-i)/treads),depth=run/treads,z=edge-(i+.5)*depth,g=new THREE.BoxGeometry(width,1,depth),a=g.attributes.position;
  // Source Y is the actual F32 top, with no subsequently added half-height.
  for(let j=0;j<a.count;j++)a.setY(j,a.getY(j)>0?top:0);
  const m=tag(kit.mesh(f,applyBoxUV(g,tile),material,0,0,z),'suichu-south-tread');m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m,true);b.suichuSouthStep=true;kit.colliders.push(b);owner??=b;
  kit.walkBox(f,b.min.x-p.x,b.min.z-p.z,b.max.x-p.x,b.max.z-p.z,b.max.y);kit.walkables.at(-1).suichuSouthStep=true;kit.walkables.at(-1).rescue=false;tops.push(top);
 }
 for(const sign of[-1,1]){
  const x=sign*(width/2+cheekWidth/2),g=new THREE.BoxGeometry(cheekWidth,1,run),a=g.attributes.position;
  for(let j=0;j<a.count;j++){const t=(a.getZ(j)+run/2)/run;a.setY(j,a.getY(j)>0?Math.fround(.08+(.5+.12-.08)*t):0);}g.computeVertexNormals();
  const m=tag(kit.mesh(f,applyBoxUV(g,tile),material,x,0,edge-run/2),'suichu-south-cheek');m.updateWorldMatrix(true,false);const pos=m.geometry.attributes.position,ix=m.geometry.index,faces=[];for(let i=0;i<(ix?.count??pos.count);i+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:i/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld))});
  const id=`suichu-south-cheek-${sign<0?'east':'west'}`,shape=createXiqingSurface(faces,id),b=shape.box.clone();b.xiqingRoofSurface=shape;b.suichuSouthStep=true;kit.colliders.push(b);m.userData.suichuStepContact=id;
 }
 owner.furnitureMotionScope={kind:'suichu-south-steps',id:'suichu-south-steps',groundY:0,minOffsetX:p.x-width/2-cheekWidth-.5-owner.min.x,maxOffsetX:p.x+width/2+cheekWidth+.5-owner.min.x,minOffsetZ:p.z+toe-.75-owner.min.z,maxOffsetZ:p.z+edge+1.25-owner.min.z};
 f.userData.suichuSouthSteps={originalObjectId:'FC-E604D58704',source:PHOTO,photographyDate:null,scope:'ONE_SOUTH_CENTRAL_FLIGHT_AND_TWO_SLOPED_CHEEKS',dimensionStatus:'MODEL_FIT_TO_RETAINED_PLATFORM_NOT_SURVEY',treadCountStatus:'SEVEN_MODEL_SUBDIVISIONS_ORIGINAL_COMPLETE_COUNT_UNVERIFIED',...FIT,toe,platformY:p.ph,tops,wholeObjectAccepted:false,remaining:['Complete original step count cropped in source','True absolute platform/stair dimensions','Stone detail/carving and whole facade/interior']};return true;
}
