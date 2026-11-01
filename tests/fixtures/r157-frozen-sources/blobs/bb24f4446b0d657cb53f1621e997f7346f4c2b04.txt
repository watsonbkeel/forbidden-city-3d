import {applyBoxUV,scaleCylinderUV} from '../../../utils/GeometryUV.js';
import {WUMEN_LINK_FLOOR,wumenLinkRegion,registeredWumenLinkFloor} from '../../../controls/WumenLinkSupport.js';
import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
/** Topology supported by the north oblique photograph and published plans.
 * Dimensions fit the retained model, not survey or an independently verified
 * reconstruction of both elevations. Existing closed endpoints remain closed. */
export function buildWumenTransverseLinks(b,parent){
 if(parent.name!=='午门'||b.ox!==0||b.oz!==-419.6||parent.position.lengthSq()||parent.rotation.toArray().slice(0,3).some(Boolean)||parent.scale.toArray().some(v=>v!==1)||parent.userData.r145WumenLinks)throw Error('R145 Wumen retained host mismatch');
 for(const [i,p]of [[28,[0,12.3,0]],[29,[0,0,0]],[34,[-47.7,12.3,-6]],[35,[-47.7,0,-6]],[39,[47.7,12.3,-6]],[40,[47.7,0,-6]]]){const g=parent.children[i];if(!g||g.position.toArray().some((v,k)=>v!==p[k])||g.rotation.toArray().slice(0,3).some(Boolean)||g.scale.toArray().some(v=>v!==1))throw Error('R145 original endpoint pose changed');}
 const floor=parent.children.find(m=>m.isMesh&&m.position.x===0&&m.position.y===12.15&&m.position.z===2.6500000000000004&&m.material===b.library.material('stone_slab'));
 const ref=applyBoxUV(new T.BoxGeometry(120.4,.3,32.300000000000004),b.library.tileSize('stone_slab'));
 try{if(!floor||floor.rotation.toArray().slice(0,3).some(Boolean)||floor.scale.toArray().some(v=>v!==1)||floor.geometry.index!==null)throw Error('R145 original platform geometry/transform missing');for(const key of ['position','normal','uv']){const a=floor.geometry.attributes[key]?.array,r=ref.attributes[key].array;if(!a||a.length!==r.length||a.some((v,i)=>v!==r[i]))throw Error('R145 original platform ordered faces drift');}}finally{ref.dispose();}
 for(const side of ['east','west']){const id=`wumen-transverse-link-${side}`,r=wumenLinkRegion(id);if(!registeredWumenLinkFloor(b,{...r,kind:'wumen-transverse-links',id,floor:WUMEN_LINK_FLOOR},side==='east'?-36.2:36.2,-425.6,.5))throw Error('R145 live original platform missing');}
 const metadata={originalObjectId:'FC-AD4377DF51',source:'https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg',plan:'https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf',planPrintedPages:[152,153],dimensions:'RETAINED_MODEL_REGISTRATION_PHOTO_FIT_NOT_SURVEY',scope:'TWO_TRANSVERSE_LOW_ROOF_POST_AND_BEAM_EXTERNAL_LINKS',access:'EXISTING_CLOSED_ENDPOINTS_PRESERVED_NO_NEW_THROUGH_ROUTE_ACCEPTANCE',residual:['Retained pavilion spacing differs from source plan proportions','Absolute heights and post spacing fitted','Far side detail not independently photographically verified','Fine beam painting and roof ornaments unverified','Whole Wumen not accepted'],wholeObjectAccepted:false,instances:[]};
 const first=b.colliders.length;
 for(const sign of[-1,1]){
  const side=sign<0?'east':'west',g=new T.Group();g.name=`r145-wumen-${side}-transverse-link`;g.userData.r145WumenLink=metadata;parent.add(g);const faces=[];
  const mesh=(geo,mat,name,x=0,y=0,z=0)=>{if(geo.type==='BoxGeometry')geo=applyBoxUV(geo,b.library.tileSize(mat));else if(geo.type==='CylinderGeometry')geo=scaleCylinderUV(geo,.22,4.1,b.library.tileSize(mat));const m=new T.Mesh(geo,b.library.material(mat));m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData.r145WumenLink=side;g.add(m);m.updateMatrixWorld(true);return m;};
  const surfaceMesh=m=>{const a=m.geometry.attributes.position,ix=m.geometry.index,index=g.children.indexOf(m);for(let i=0;i<(ix?.count??a.count);i+=3)faces.push({source:{mesh:index,triangle:i/3},vertices:[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld).add(new T.Vector3(b.ox,0,b.oz)))});};
  // Twelve fitted posts per link: two four-post exterior rows and four
  // interior posts. Count is a model correspondence, not a measured inventory.
  const posts=[];for(const x of[30.7,34.2,38.2,41.7])for(const z of[-9.4,-2.6])posts.push([sign*x,z]);for(const x of[34.2,38.2])for(const z of[-7.1,-4.9])posts.push([sign*x,z]);
  for(const [x,z]of posts)surfaceMesh(mesh(new T.CylinderGeometry(.19,.22,4.1,12), 'wood_column','r145-link-red-post',x,14.35,z));
  for(const z of[-9.4,-2.6]){mesh(new T.BoxGeometry(11.45,.66,.38),'caihua_beam','r145-link-longitudinal-beam',sign*36.2,16.39,z);b.col(sign*36.2-5.725,16.06,z-.19,sign*36.2+5.725,16.72,z+.19);b.colliders.at(-1).r145WumenLink=side;}
  const owner=b.colliders.at(-1),id=`wumen-transverse-link-${side}`,region=wumenLinkRegion(id);owner.furnitureMotionScope={kind:'wumen-transverse-links',id,floor:{...WUMEN_LINK_FLOOR},minOffsetX:region.minX-owner.min.x,maxOffsetX:region.maxX-owner.min.x,minOffsetZ:region.minZ-owner.min.z,maxOffsetZ:region.maxZ-owner.min.z};
  for(const x of[30.7,34.2,38.2,41.7]){mesh(new T.BoxGeometry(.38,.66,7.18),'caihua_beam','r145-link-transverse-beam',sign*x,16.39,-6);b.col(sign*x-.19,16.06,-9.59,sign*x+.19,16.72,-2.41);b.colliders.at(-1).r145WumenLink=side;}
  // Closed low hipped shell; source supports the low yellow cover, not these
  // exact slopes, tile count or ornament details. No flat support proxy.
  const xs=[29.4,30.4,31.4,40.4,41.4,42.4].map(x=>sign*x).sort((a,b)=>a-b),zs=[-10.05,-9.4,-8,-6,-4,-2.6,-1.95],p=[],uv=[],ix=[];
  const height=(x,z)=>16.66+1.36*Math.min(1,Math.max(0,(Math.abs(x)-29.4)/2),Math.max(0,(42.4-Math.abs(x))/2))*Math.pow(Math.max(0,1-Math.abs(z+6)/4.05),.8);
  for(let l=0;l<2;l++)for(const x of xs)for(const z of zs){p.push(x,height(x,z)-l*.16,z);uv.push(x/3,z/3);}
  const N=xs.length*zs.length,at=(l,i,j)=>l*N+i*zs.length+j,quad=(a,c,d,e)=>ix.push(a,c,d,a,d,e);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){quad(at(0,i,j),at(0,i,j+1),at(0,i+1,j+1),at(0,i+1,j));quad(at(1,i,j),at(1,i+1,j),at(1,i+1,j+1),at(1,i,j+1));}
  for(let i=0;i<xs.length-1;i++){quad(at(0,i,0),at(0,i+1,0),at(1,i+1,0),at(1,i,0));const j=zs.length-1;quad(at(0,i,j),at(1,i,j),at(1,i+1,j),at(0,i+1,j));}
  for(let j=0;j<zs.length-1;j++){quad(at(0,0,j),at(1,0,j),at(1,0,j+1),at(0,0,j+1));const i=xs.length-1;quad(at(0,i,j),at(0,i,j+1),at(1,i,j+1),at(1,i,j));}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();surfaceMesh(mesh(geo,'roof_tile','r145-low-link-yellow-roof'));
  const surface=createXiqingSurface(faces,`wumen-transverse-link-${side}`),col=surface.box.clone();col.xiqingRoofSurface=surface;col.r145WumenLink=side;b.colliders.push(col);
  metadata.instances.push({id:`FC-AD4377DF51/transverse-link/${side}`,sourceDetail:side==='east'?'NEAR_SIDE_PHOTO_PLUS_PLAN':'PLAN_TOPOLOGY_NEAR_SIDE_FIT_DETAIL_UNVERIFIED',postCount:posts.length,postCountStatus:'FITTED_NOT_VERIFIED_HISTORICAL_COUNT',bounds:{min:surface.box.min.toArray(),max:surface.box.max.toArray()}});
 }
 metadata.addedColliders=b.colliders.length-first;parent.userData.r145WumenLinks=metadata;return metadata;
}
