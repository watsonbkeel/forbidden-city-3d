import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1537[1024].jpg';
const canonical=o=>o?.visible===true&&o.scale.equals(new T.Vector3(1,1,1))&&!o.rotation.x&&!o.rotation.y&&!o.rotation.z;
/** Two photo-visible standing fan-shaped silhouettes only. All dimensions,
 * placement and coarse colours are engineering fits, not surveyed antiques. */
export function finishWenyuanGroundFans(kit){
 if(kit?.root?.name!=='outer-east')return false;
 const hosts=kit.root.children.filter(f=>f.userData.structure?.remainingProfile==='wenyuan');if(!hosts.length)return false;
 const f=hosts[0],s=f?.userData.structure;
 if(hosts.length!==1||!canonical(kit.root)||kit.root.position.lengthSq()||!canonical(f)||f.position.x!==-186.5||f.position.y!==0||f.position.z!==-132.8||s?.id!=='wenyuan-pavilion'||s.w!==40.5||s.d!==17.9||s.remainingId!=='place-outer-east-fd3d76e74d'||f.userData.wenyuanGroundFans||!Object.isExtensible(f.userData)||!Object.isExtensible(f.children)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k])))throw Error('Exact original mutable Wenyuan ground host required');
 const expected=[['seat-base',2.15,.44,1.25,-3.375,.72,3.65],['seat-back',2.15,1.2,.12,-3.375,1.5,4.2],['desk-top',3.5,.12,.85,-3.375,1.44,1.85]];
 for(const [role,w,h,d,x,y,z]of expected){const rows=f.children.filter(m=>m.name==='wenyuan-ground-photo-'+role),m=rows[0],p=m?.geometry?.parameters;if(rows.length!==1||!canonical(m)||!m.isMesh||m.position.x!==x||Math.abs(m.position.y-y)>1e-9||m.position.z!==z||p?.width!==w||p.height!==h||p.depth!==d||m.userData.source!==PHOTO||m.userData.level!==1)throw Error('Original first-floor seat/desk source required');}
 const info={source:PHOTO,level:1,count:2,photographyDate:null,scope:'PAIRED_VISIBLE_STANDING_FAN_SHAPED_CONTOURS_AND_COARSE_COLOUR_FIELDS_ONLY',fit:'POSITION_DIMENSIONS_COLOURS_ENGINEERING_FIT_NOT_SURVEY',unknown:['specific object name and material','feather wood and painted motifs','carving and exact pattern','current survival or visitor admission'],oldUnmodeledFlag:'Original seat carving/fan-art flag retained; new coarse silhouette does not reproduce fine artwork',newSupports:0,newRooms:0};
 const mats=[],parts=[],owners=[];
 try{
  for(const[name,color]of[['green',0x194c3e],['yellow',0xd9bd6b],['white',0xeee9cf],['dark',0x17352d],['stem',0x73532c]])mats.push(new T.MeshStandardMaterial({name:'wenyuan-ground-fan-'+name+'-fit',color,roughness:.9}));
  const shape=(pts,depth)=>{const s=new T.Shape();pts.forEach(([x,y],i)=>s[i?'lineTo':'moveTo'](x,y));s.closePath();return new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,steps:1,curveSegments:8});};
  for(const side of[-1,1]){const x=-3.375+side*.74,z=4.05,own=[];
   const add=(geo,mi,role)=>{const m=new T.Mesh(geo,mats[mi]);m.name='wenyuan-ground-fan-'+side+'-'+role;m.castShadow=m.receiveShadow=true;m.userData={...info,side,role};parts.push(m);own.push(m);return m;};
   add(new T.CylinderGeometry(.022,.026,1.95,8).translate(x,1.915,z),4,'slender-stem');
   add(shape([[-.30,-.30],[-.27,.10],[-.19,.38],[0,.56],[.19,.38],[.27,.10],[.30,-.30],[.12,-.42],[0,-.46],[-.12,-.42]],.045).translate(x,2.82,z-.0225),0,'green-contour');
   add(shape([[-.29,-.29],[-.12,-.42],[0,-.46],[.12,-.42],[.29,-.29],[.17,-.16],[0,-.12],[-.17,-.16]],.006).translate(x,2.82,z-.029),1,'yellow-lower-field');
   const oval=(rx,ry,cy,depth)=>{const pts=Array.from({length:20},(_,i)=>{const a=i*Math.PI/10;return[Math.cos(a)*rx,cy+Math.sin(a)*ry]});return shape(pts,depth);};
   add(oval(.155,.165,-.035,.006).translate(x,2.82,z-.036),2,'pale-eye-field');
   add(oval(.065,.075,-.035,.006).translate(x,2.82,z-.043),3,'dark-eye-field');
   const v=[];for(const m of own){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++){const a=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).add(f.position);v.push(a.x,a.y,a.z);}}
   const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const tri=triangleInstance(createTriangleTemplate(g),[0,0,0],'wenyuan-ground-fan:'+side),b=tri.box.clone();b.triangleSupport=tri;b.wenyuanGroundFan=side;owners.push(b);}finally{g.dispose();}
  }
 }catch(e){for(const m of parts)m.geometry.dispose();for(const m of mats)m.dispose();throw e;}
 f.add(...parts);kit.colliders.push(...owners);kit.owned.push(...mats);f.userData.wenyuanGroundFans=info;return info;
}
