import * as THREE from 'three';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/3938[1024].jpg';
// Only simplified stacked members of the visible circular surround are added.
// A dragon proposal failed visual comparison and is NOT installed. No official
// photo pixels, claimed measurement, or unverified hidden structure is supplied.
export function buildNanxunCaissonRings(c){
 const {f,g,kit,p,item}=c;
 if(p.key!=='nanxun'||p.id!=='place-outer-west-fa7f5d119e'||item.name!=='南薰殿'||g.w!==23.3||g.d!==13.4||g.y!==.6||g.h!==6.41||f.position.x!==289.6||f.position.z!==-315.7||f.rotation.y!==0||!f.scale.equals({x:1,y:1,z:1})||g.nanxunRingDetail)throw Error('Nanxun rings require the frozen source-bound hall');
 const disk=f.children.filter(m=>m.userData.role==='nanxun-caisson-relief-unmodeled-core'),brackets=f.children.filter(m=>m.userData.role==='nanxun-caisson-perimeter-bracket-fit');
 if(disk.length!==1||brackets.length!==32||!g.caissonBaseColors||disk[0].geometry.type!=='CircleGeometry'||disk[0].position.y!==g.y+g.h-.6+1.03)throw Error('Nanxun caisson source geometry drift');
 const transition=f.children.filter(m=>m.userData.role==='nanxun-circular-caisson-transition');
 if(transition.length!==1||!transition[0].visible||transition[0].geometry.type!=='CylinderGeometry'||transition[0].geometry.parameters.radiusTop!==1.40||transition[0].geometry.parameters.radiusBottom!==1.72||f.children.some(m=>m.userData.r137NanxunRing)||brackets.some(m=>!m.visible||m.material.map||m.material.transparent))throw Error('Nanxun ring bearing shell/material drift');
 const mat=brackets[0].material,base=g.y+g.h-.6,info={source:SOURCE,r137NanxunRing:true,fit:'PHOTO_OBSERVED_STEPPED_RING_FIT_NOT_SURVEYED',unknown:['exact bracket count','hidden joinery','sculpture depth'],physical:false};let triangles=0;
 const add=(geo,x,y,z,role)=>{const m=kit.mesh(f,geo,mat,x,base+y,z);m.userData={...m.userData,...info,role};triangles+=(geo.index?.count??geo.attributes.position.count)/3;return m;};
 // Radius and vertical levels stay inside the retained circular transition.
 // Each closed saddle has a transverse cap and radial bearing block, rather
 // than isolated floating decorative teeth. Existing shell remains its back.
 for(let tier=0;tier<3;tier++){
  const r=1.43+tier*.105,y=.91-tier*.23;
  const ring=new THREE.TorusGeometry(r,.024,6,64);ring.rotateX(Math.PI/2);add(ring,0,y+.055,0,'nanxun-ring-bearing');
  for(let k=0;k<48;k++){
   const a=(k+(tier%2)*.5)*Math.PI/24;
   for(const [role,width,height,depth,dy,dr]of[['nanxun-ring-cap',.105,.045,.16,0,0],['nanxun-ring-bracket',.049,.085,.09,.05,-.025]]){
    const geo=new THREE.BoxGeometry(width,height,depth);geo.rotateY(a);add(geo,Math.sin(a)*(r+dr),y+dy,Math.cos(a)*(r+dr),role);
   }
  }
 }
 g.nanxunRingDetail={source:SOURCE,status:'PARTIAL_RING_FORM_FIT',triangleCount:triangles,officialPhotoPublished:false,textureAdded:false,materialAdded:false,collisionAdded:false,dragonRelief:'UNMODELED_REJECTED_CANDIDATE_WITHHELD',entireInteriorAccepted:false};
 return g.nanxunRingDetail;
}
