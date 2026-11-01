import * as THREE from 'three';

// Six visible shoulders under the three-bay SOUTH baoxia beam in this hall's
// own official photograph. Plain outline only, not a reproduction of carving.
const OUTLINE=Object.freeze([[0,0],[.96,0],[.96,-.06],[.89,-.15],[.75,-.21],[.60,-.25],[.45,-.31],[.31,-.43],[.16,-.55],[0,-.55]].map(Object.freeze));
export const CHONGHUA_SOUTH_KNEE_FIT=Object.freeze({
 entityId:'FC-DC1832BAF2',role:'r66-chonghua-south-knee',projection:.96,drop:.55,depth:.24,rootInset:.18,topY:6.14,southZ:-7,
 fitRange:Object.freeze({projection:[.7,1.2],drop:[.4,.7],depth:[.15,.32]}),
 status:'PHOTO_FIT_NOT_SURVEYED',visualAcceptance:'VERIFY_PENDING',ornament:'UNMODELED',photographyDate:null,
 source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg',sourceSHA256:'13ea0b1d374295b4c36b59c92c2dfec9fe408137e1e3cff412a7573bead3f31e',
});
export function buildChonghuaSouthKnees(kit,frame,item){
 const p=CHONGHUA_SOUTH_KNEE_FIT;
 if(item?.kind!=='hall'||item.name!=='重华宫'||item.x!==118.9||item.z!==498.3||item.w!==21.5||item.d!==8.6||item.ph!==.75||item.colH!==5.49||(item.rot!==undefined&&item.rot!==0))throw Error('Chonghua knees require exact retained identity and envelope');
 const g=frame?.children.find(o=>o.userData.role==='r48-chonghua-three-bay-baoxia');
 if(!g||g.children.some(m=>m.userData.role===p.role))throw Error('Chonghua knees require one unmodified baoxia, no duplicate installation');
 const posts=g.children.filter(m=>m.userData.role==='r48-chonghua-baoxia-column').sort((a,b)=>a.position.x-b.position.x),beam=g.children.filter(m=>m.userData.role==='r48-chonghua-baoxia-beam');
 if(posts.length!==4||beam.length!==1||posts.some((m,i)=>Math.abs(m.position.x-(i-1.5)*4.3)>1e-8||m.position.z!==p.southZ)||Math.abs(beam[0].position.y-6.29)>1e-8)throw Error('Chonghua knees retained host drift');
 const mat=new THREE.MeshStandardMaterial({name:'r66_chonghua_south_plain_knee_fit',color:0x999b82,roughness:.86});kit.owned.push(mat);
 const added=[];
 for(let bay=0;bay<3;bay++)for(const edge of[0,1]){
  const post=posts[bay+edge],inward=edge===0?1:-1,geo=new THREE.ExtrudeGeometry(new THREE.Shape(OUTLINE.map(([x,y])=>new THREE.Vector2(x,y))),{depth:p.depth,bevelEnabled:false,steps:1,curveSegments:1});geo.translate(0,0,-p.depth/2);
  const m=kit.mesh(g,geo,mat,post.position.x+inward*p.rootInset,p.topY,p.southZ);if(inward<0)m.rotation.y=Math.PI;
  m.name=p.role;m.userData={...p,bay,inward,columnX:post.position.x,contact:'SMALL_CLOSED_TOP_ROOT_OVERLAP_NOT_HISTORIC_JOINERY',navigation:'NO_NEW_PROXY_ABOVE_LEGAL_JUMP_ENVELOPE_INSIDE_EXISTING_BUILDING_EXTENT'};added.push(m);
 }
 return added;
}
