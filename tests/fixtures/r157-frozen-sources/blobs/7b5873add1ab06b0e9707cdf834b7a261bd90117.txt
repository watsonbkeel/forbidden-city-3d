import * as THREE from 'three';
const ROLE='r66-yinghua-south-three-direction-lattice';
/** Official text names 三交六椀, small south photo confirms diagonal density.
 * This plain three-direction outline is NOT the exact carved six-bowl cell. */
export function buildYinghuaSouthLattice(kit,frame,material,{x,y,z,width,height}){
 if(frame.position.x!==276.6||frame.position.z!==489.9||frame.rotation.y!==0||!material?.isMeshStandardMaterial||material.name!=='yinghua_wood_fit'||![x,y,z,width,height].every(Number.isFinite)||z!==-9.1||width<1.4||width>1.6||Math.abs(height-3.7)>1e-8)throw Error('Yinghua lattice requires exact retained south window');
 const pos=[],normal=[],uv=[],pitch=.45,thickness=.025,half=[width/2-.035,height/2-.035];let bars=0;
 for(const degree of[0,60,-60]){
  const a=degree*Math.PI/180,d=[Math.cos(a),Math.sin(a)],n=[-d[1],d[0]],reach=Math.abs(n[0])*half[0]+Math.abs(n[1])*half[1];
  for(let k=Math.ceil(-reach/pitch);k<=Math.floor(reach/pitch);k++){
   const c=[n[0]*k*pitch,n[1]*k*pitch];let lo=-Infinity,hi=Infinity;
   for(let axis=0;axis<2;axis++){if(Math.abs(d[axis])<1e-8){if(Math.abs(c[axis])>half[axis]){lo=1;hi=0;break;}}else{const ta=(-half[axis]-c[axis])/d[axis],tb=(half[axis]-c[axis])/d[axis];lo=Math.max(lo,Math.min(ta,tb));hi=Math.min(hi,Math.max(ta,tb));}}
   if(hi-lo<.04)continue;const indexed=new THREE.BoxGeometry(hi-lo,thickness,.17),g=indexed.toNonIndexed();indexed.dispose();g.rotateZ(a);g.translate(c[0]+d[0]*(lo+hi)/2,c[1]+d[1]*(lo+hi)/2,0);pos.push(...g.attributes.position.array);normal.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();bars++;
  }
 }
 // Four plain leaf frames physically receive the clipped lattice ends.
 for(const [w,h,cx,cy]of[[width-.035,.04,0,half[1]],[width-.035,.04,0,-half[1]],[.04,height-.035,half[0],0],[.04,height-.035,-half[0],0]]){const indexed=new THREE.BoxGeometry(w,h,.17),g=indexed.toNonIndexed();indexed.dispose();g.translate(cx,cy,0);pos.push(...g.attributes.position.array);normal.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const mesh=kit.mesh(frame,geo,material,x,y,z);mesh.name=ROLE;mesh.userData={role:ROLE,entityId:'FC-C7765A0D84',status:'PHOTO_FIT_NOT_SURVEYED',visualAcceptance:'VERIFY_PENDING',lineFamilies:[0,60,-60],pitch,barCount:bars,perimeterBars:4,fullPatternReconstruction:false,documentedPattern:'三交六椀',interpretation:'PLAIN_DIAGONAL_TYPE_OUTLINE_NOT_EXACT_CARVED_SIX_BOWL_CELL',photographyDate:null,source:'https://img.dpm.org.cn/Uploads/Picture/dc/8416.jpg',sourcePage:'https://www.dpm.org.cn/explore/building/236568.html',physics:'RETAINED_SOLID_WINDOW_LEAF_NO_NEW_COLLIDER'};return mesh;
}
