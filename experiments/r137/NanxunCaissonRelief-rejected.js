import * as THREE from 'three';

const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/3938[1024].jpg';
// Original geometric interpretation of the visible sculpture, NOT photo pixels,
// measured depth, exact ornament tracing, or a claim about unseen back surfaces.
export function buildNanxunCaissonRelief(c) {
  const {f,g,kit,p,item}=c;
  if(p.key!=='nanxun'||p.id!=='place-outer-west-fa7f5d119e'||item.name!=='南薰殿'||g.w!==23.3||g.d!==13.4||g.y!==.6||g.h!==6.41||f.position.x!==289.6||f.position.z!==-315.7||f.rotation.y!==0||!f.scale.equals({x:1,y:1,z:1})||g.nanxunRelief)throw Error('Nanxun relief requires the frozen source-bound hall');
  const disk=f.children.filter(m=>m.userData.role==='nanxun-caisson-relief-unmodeled-core');
  const brackets=f.children.filter(m=>m.userData.role==='nanxun-caisson-perimeter-bracket-fit');
  if(disk.length!==1||brackets.length!==32||!g.caissonBaseColors||disk[0].geometry.type!=='CircleGeometry'||disk[0].position.y!==g.y+g.h-.6+1.03)throw Error('Nanxun caisson source geometry drift');
  const gold=brackets[0].material,body=brackets[0].material,base=g.y+g.h-.6;
  const info={source:SOURCE,r137NanxunRelief:true,fit:'VISIBLE_FORM_INTERPRETATION_NOT_SURVEYED',unknown:['sculpture depth','hidden back surfaces','exact scales and carving','claw count and obscured digits'],physical:false};
  let triangles=0;
  const mesh=(role,geo,x=0,y=0,z=0,mat=gold)=>{const m=kit.mesh(f,geo,mat,x,base+y,z);m.userData={...m.userData,...info,role};triangles+=(geo.index?.count??geo.attributes.position.count)/3;return m;};
  const oval=(role,x,y,z,sx,sy,sz,mat=gold)=>{const geo=new THREE.SphereGeometry(1,16,10);geo.scale(sx,sy,sz);return mesh(role,geo,x,y,z,mat);};
  // Closed variable-radius tubes have explicit caps: no one-sided strips or
  // open terminal holes in the dragon, horns, whiskers or cloud scrolls.
  const tube=(role,points,radius,segments=24,sides=8,mat=gold,taper=1)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(x,base+y,z)));
    const frames=curve.computeFrenetFrames(segments,false),v=[],idx=[];
    for(let i=0;i<=segments;i++){const t=i/segments,pt=curve.getPointAt(t),r=radius*(1-t*(1-taper));for(let j=0;j<sides;j++){const a=j*2*Math.PI/sides,off=frames.normals[i].clone().multiplyScalar(Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);v.push(pt.x+off.x,pt.y+off.y,pt.z+off.z);}}
    for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides,d=(i+1)*sides+j,e=(i+1)*sides+(j+1)%sides;idx.push(a,b,d,b,e,d);}
    for(const end of [0,segments]){const pt=curve.getPointAt(end/segments),center=v.length/3;v.push(pt.x,pt.y,pt.z);for(let j=0;j<sides;j++){const a=end*sides+j,b=end*sides+(j+1)%sides;idx.push(center,...(end===0?[b,a]:[a,b]));}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();geo.translate(0,-base,0);return mesh(role,geo,0,0,0,mat);
  };
  disk[0].userData.role='nanxun-caisson-relief-backing';disk[0].userData.artworkStatus='BACKING_BEHIND_PARTIAL_MODELED_RELIEF';
  // The photo shows an asymmetric encircling body, not a torus or a radial sun.
  tube('dragon-coiled-body',[[.20,.83,.27],[.66,.78,.15],[.91,.83,-.25],[.72,.91,-.69],[.23,.91,-1.00],[-.36,.86,-.94],[-.69,.78,-.55],[-.91,.77,-.18],[-.78,.83,.28],[-.50,.85,.61],[-.09,.81,.84],[.45,.79,.75],[.75,.78,.50]],.20,64,12,body,.48);
  tube('dragon-rising-neck',[[.53,.82,-.69],[.28,.70,-.50],[-.11,.65,-.20],[0,.61,.15]],.24,20,10,body,.88);
  oval('dragon-face',0,.59,.30,.31,.18,.38);
  oval('dragon-muzzle',0,.43,.53,.22,.10,.13);
  oval('dragon-lower-jaw',0,.53,.65,.20,.075,.09,body);
  for(const side of [-1,1]){
    tube('dragon-brow',[[side*.03,.43,.15],[side*.15,.40,.16],[side*.28,.44,.10]],.05,10,7);
    oval('dragon-eye',side*.15,.395,.245,.053,.025,.022,c.m.dark);
    oval('dragon-nostril',side*.09,.345,.53,.035,.018,.019,c.m.dark);
    tube('dragon-horn',[[side*.18,.64,.05],[side*.24,.59,-.12],[side*.35,.63,-.25],[side*.31,.67,-.40]],.075,16,7,gold,.22);
    tube('dragon-horn-prong',[[side*.30,.63,-.24],[side*.40,.66,-.25],[side*.43,.70,-.34]],.042,9,6,gold,.15);
    tube('dragon-whisker',[[side*.18,.46,.51],[side*.38,.47,.47],[side*.59,.52,.32],[side*.70,.61,.38]],.022,16,6,gold,.28);
    tube('dragon-foreleg',[[side*.60,.83,-.27],[side*.56,.71,.03],[side*.79,.68,.19],[side*.86,.66,.39]],.075,16,8,body,.75);
    for(let k=0;k<3;k++)tube('dragon-claw',[[side*.85,.66,.34],[side*(.86+(k-1)*.095),.59,.46],[side*(.85+(k-1)*.13),.60,.55]],.024,7,6,gold,.18);
    // Broad tapering mane locks fill the photo-visible upper silhouette;
    // these are closed leaf volumes, not antler-like wire branches.
    for(let k=0;k<4;k++){
      const x=side*(.22+k*.10),z=.01-k*.10;
      const pts=[[x,z],[x+side*.10,z-.08],[x+side*.20,z-.40],[x+side*.10,z-.29],[x-side*.03,z-.07]].map(([xx,zz])=>new THREE.Vector2(xx,zz));
      const geo=new THREE.ExtrudeGeometry(new THREE.Shape(pts),{depth:.045,bevelEnabled:true,bevelThickness:.015,bevelSize:.02,bevelSegments:1,steps:1});geo.rotateX(Math.PI/2);
      mesh('dragon-mane',geo,0,.68,0);
    }
  }
  // Two unequal S-shaped trunk masses produce the observed overlapping coils,
  // rather than leaving the centre as an empty circular ring.
  tube('dragon-left-fold',[[-.77,.83,-.58],[-.51,.77,-.65],[-.46,.71,-.38],[-.65,.68,-.13],[-.49,.74,.12]],.17,22,10,body,.65);
  tube('dragon-right-fold',[[.23,.86,-.94],[.58,.77,-.73],[.64,.71,-.47],[.36,.68,-.25],[.48,.71,-.03]],.23,24,10,body,.6);
  // A shallow ridge follows the outside of the coiled trunk. Short crossing
  // curves indicate the observed scaled surface; this is not an exact count.
  for(let k=0;k<24;k++){
    const a=k/24*Math.PI*1.85-.1,r=.88+.055*Math.sin(a*3),cx=Math.cos(a)*r,cz=Math.sin(a)*r;
    const pts=[-.10,0,.10].map(t=>[cx+Math.cos(a+Math.PI/2)*t,.64+Math.abs(t)*.8,cz+Math.sin(a+Math.PI/2)*t]);
    tube('dragon-scale-ridge',pts,.012,4,5,gold,.7);
  }
  tube('dragon-left-haunch',[[-.71,.83,-.45],[-.45,.72,-.31],[-.54,.65,-.07],[-.83,.70,.02]],.095,15,8,body,.55);
  tube('dragon-right-haunch',[[.77,.84,-.47],[.61,.74,-.21],[.81,.69,-.04],[1.01,.77,.03]],.10,15,8,body,.45);
  // Three stepped circular bracket courses, independently supported by the
  // retained octagon-to-circle shell; count/spacing remain photographic fits.
  for(let tier=0;tier<3;tier++)for(let k=0;k<48;k++){
    const a=(k+(tier%2)*.5)*Math.PI/24,r=1.45+tier*.085;
    const geo=new THREE.BoxGeometry(.10,.07,.13);geo.rotateY(-a);
    mesh('caisson-ring-bracket',geo,Math.cos(a)*r,1.00-tier*.12,Math.sin(a)*r);
  }
  // Cloud curls only in the annular surround visible in the source image.
  for(let k=0;k<16;k++){
    const a=k*Math.PI/8,r=1.84,pts=[];
    for(let j=0;j<9;j++){const t=j/8*Math.PI*1.55,rr=.09*(1-j/12);pts.push([Math.cos(a)*r+Math.cos(t)*rr,.42,Math.sin(a)*r+Math.sin(t)*rr]);}
    tube('caisson-cloud-scroll',pts,.025,12,6,gold,.45);
  }
  for(const m of f.children.filter(m=>m.userData.r137NanxunRelief)){m.geometry.rotateY(Math.PI);m.position.x=-m.position.x;m.position.z=-m.position.z;}
  g.nanxunRelief={source:SOURCE,status:'PARTIAL_PHOTO_FIT_NOT_EXACT_CARVING',triangleCount:triangles,officialPhotoPublished:false,textureAdded:false,materialAdded:false,collisionAdded:false,geometryDepth:'FITTED_NOT_MEASURED',entireInteriorAccepted:false};
  return g.nanxunRelief;
}
