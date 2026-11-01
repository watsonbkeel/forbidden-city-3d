import * as THREE from 'three';

/** Separate image-scoped relief; never copies museum artwork into a texture.
 * Overall cell count/spacing is fitted, not claimed as a measured ceiling grid.
 * Only Chengrui's photographed well receives its own stepped octagonal contour.
 */
export function addBridgeCeilingRelief(builder, group, profile) {
  if(!['浮碧亭','澄瑞亭'].includes(profile.name))throw Error('Exact bridge ceiling identity required');
  const frame=builder.own(new THREE.MeshStandardMaterial({name:`r64_${profile.name}_ceiling_frame`,color:0x315f51,roughness:.86}));
  const plain=builder.own(new THREE.MeshStandardMaterial({name:`r64_${profile.name}_plain_ceiling`,color:0x355d65,roughness:.89}));
  // The earlier material is a beam-band atlas, not ceiling artwork. Leave the
  // photographed floral/dragon fields plain instead of inventing their painting.
  const ceiling=group.getObjectByName('bridge-main-ceiling'),lid=group.getObjectByName('bridge-caisson-lid');
  if(!ceiling?.isMesh||!lid?.isMesh)throw Error('Exact retained ceiling and lid required');
  ceiling.material=plain;lid.material=plain;
  const box=(w,d,x,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.08,d),frame);
    m.name=m.userData.role='r64-bridge-coffer-frame';m.position.set(x,4.485,z);m.castShadow=m.receiveShadow=true;group.add(m);
  };
  // Clip every bar around the pre-existing octagonal opening, including bar
  // half-width. This is real open geometry, not a grid painted across a well.
  const radius=1.4,half=.0325;
  const edge=t=>{t=Math.abs(t);if(t>=radius)return 0;const c=radius/Math.SQRT2;return t<=c?radius-(Math.SQRT2-1)*t:(radius-t)/(Math.SQRT2-1);};
  for(let i=0;i<=8;i++){
    const t=-3.8+i*.95;
    const cut=Math.abs(t)-half<radius?edge(Math.max(0,Math.abs(t)-half))+.018:0;
    for(const axis of [0,1]){
      if(!cut)box(axis?7.6:.065,axis?.065:7.6,axis?0:t,axis?t:0);
      else for(const sign of [-1,1]){const len=3.8-cut,mid=sign*(3.8+cut)/2;box(axis?len:.065,axis?.065:len,axis?mid:t,axis?t:mid);}
    }
  }
  if(profile.name==='澄瑞亭'){
    const rim=builder.own(new THREE.MeshStandardMaterial({name:'r64_chengrui_plain_gold_contour',color:0xa68239,roughness:.72,metalness:.12}));
    const old=group.children.filter(m=>m.userData.role==='bridge-main-caisson');
    if(old.length!==1)throw Error('Chengrui requires exactly its retained single caisson');
    old[0].removeFromParent();old[0].geometry.dispose();
    const rings=[[4.525,1.4],[4.61,1.4],[4.61,1.23],[4.73,1.23],[4.73,1.10],[4.86,1.10],[4.86,.98],[5.02,.98],[5.02,.80],[5.15,.80],[5.15,.65],[5.275,.65]];
    const positions=[],uv=[],point=(y,r,i)=>[Math.sin(i*Math.PI/4)*r,y,Math.cos(i*Math.PI/4)*r];
    const tri=(a,b,c)=>{positions.push(...a,...b,...c);for(const p of[a,b,c])uv.push(p[0],p[2]);};
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<8;i++){
      const a=point(...rings[j],i),b=point(...rings[j],i+1),c=point(...rings[j+1],i+1),d=point(...rings[j+1],i);
      tri(a,c,b);tri(a,d,c);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,rim);m.name=m.userData.role='r64-bridge-stepped-caisson';m.castShadow=m.receiveShadow=true;group.add(m);
  }else{
    group.getObjectByName('bridge-main-caisson').material=plain;
  }
  profile.ceilingRelief={accepted:false,photoDate:null,dimensions:'FITTED_GRID_AND_DEPTH_NOT_SURVEY',artwork:'UNRECONSTRUCTED',cofferSource:profile.name==='浮碧亭'?'https://img.dpm.org.cn/Uploads/Picture/dc/8274.jpg':'https://img.dpm.org.cn/Uploads/Picture/dc/3962%5B1024%5D.jpg',centralWell:profile.name==='澄瑞亭'?'PHOTO_FIT_STEPPED_OCTAGON_NO_DRAGON_SCULPTURE':'RETAINED_TEXT_ATTESTED_OCTAGON_UNSEEN_IN_LOCAL_COFFER_IMAGE',centralWellSource:profile.name==='澄瑞亭'?'https://img.dpm.org.cn/Uploads/Picture/dc/7906.jpg':profile.source};
}
