import * as THREE from 'three';

// Arrow's OWN south photograph s5e9d4c87b554a.jpg resolves these two
// inward central-bay shoulders. This low-poly curved outline does not copy
// another building's knees or infer its indistinct carving/painted ornament.
// Coordinates run inward from the column root and down from the beam.
const OUTLINE=Object.freeze([
  [0,0],[1.32,0],[1.32,-.055],[1.27,-.14],[1.17,-.25],
  [1.04,-.31],[.88,-.34],[.70,-.39],[.49,-.48],
  [.31,-.58],[.18,-.62],[0,-.61],
].map(Object.freeze));

export const ARROW_SOUTH_KNEE_FIT=Object.freeze({
  entityId:'FC-AF36D75128',role:'arrow-south-central-knee',
  projection:1.32,drop:.62,depth:.28,rootInset:.22,beamOverlap:.03,
  bayWidth:5.5,columnXs:Object.freeze([-2.75,2.75]),southZ:-8.8,topY:8.53,
  status:'PHOTO_FIT_NOT_SURVEYED',visualAcceptance:'VERIFY_PENDING',
  projectionRange:Object.freeze([1.1,1.6]),dropRange:Object.freeze([.45,.75]),
  depthRange:Object.freeze([.15,.35]),depthStatus:'ENGINEERING_ASSUMPTION_PHOTO_UNRESOLVED',
  photographyDate:null,
  source:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg',
  sourceSha256:'e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225',
});

/** Exactly two central south knee halves. All previous host geometry,
 * materials, nameboards, navigation and room registrations stay untouched.
 * Closed top/root skins overlap the retained beam/column slightly to avoid
 * floating seams; that engineering overlap is not evidence of hidden joinery.
 * Lowest edge is 7.01 m above the platform, above the legal jump envelope.
 */
export function buildArrowSouthKnees(kit,frame,item){
  const p=ARROW_SOUTH_KNEE_FIT;
  if(item?.name!=='箭亭'||item.kind!=='hall'||item.structure!=='enclosed-pavilion'||
    item.enclosureProfile!=='arrow-enclosed-gallery-fit-v1'||item.x!==-154.7||item.z!==78.8||
    item.w!==31.5||item.d!==17.6||item.colH!==8||item.ph!==.9||item.bays!==5||
    (item.rot!==undefined&&item.rot!==0))throw Error('Arrow south knees require exact retained identity and envelope');
  if(!frame?.isGroup||!Array.isArray(kit?.owned)||typeof kit.mesh!=='function')throw Error('Arrow south knees require existing kit and host');
  if(frame.children.some(m=>m.userData.role===p.role))throw Error('Arrow south knees already installed');
  const columns=p.columnXs.map(x=>frame.children.find(m=>m.isMesh&&m.userData.role==='arrow-column'&&m.position.x===x&&m.position.z===p.southZ));
  const beam=frame.children.find(m=>m.isMesh&&m.name==='arrow-frame-beam'&&m.position.z===p.southZ);
  if(columns.some(m=>!m)||!beam)throw Error('Arrow south knees require existing central south column and beam host');
  // One privately owned plain material, deliberately not a fabricated photo
  // texture or an edit to the library's shared caihua/column materials.
  const material=new THREE.MeshStandardMaterial({name:'arrow_south_knee_gray_fit',color:0xa6a59a,roughness:.86,metalness:0});
  kit.owned.push(material);
  return p.columnXs.map((columnX,i)=>{
    const inward=i===0?1:-1;
    const geometry=new THREE.ExtrudeGeometry(new THREE.Shape(OUTLINE.map(([x,y])=>new THREE.Vector2(x,y))),{depth:p.depth,steps:1,bevelEnabled:false,curveSegments:1});
    geometry.translate(0,0,-p.depth/2);
    const member=kit.mesh(frame,geometry,material,columnX+inward*p.rootInset,p.topY,p.southZ);
    if(inward===-1)member.rotation.y=Math.PI;
    member.name=p.role;
    member.userData={role:p.role,entityId:p.entityId,side:'south',bay:2,columnX,inward,
      status:p.status,visualAcceptance:p.visualAcceptance,captureDate:null,
      source:p.source,sourceSha256:p.sourceSha256,
      fit:{projection:p.projection,drop:p.drop,depth:p.depth},
      contact:'CLOSED_ROOT_AND_TOP_WITH_SMALL_HOST_OVERLAP_NOT_HISTORIC_JOINERY',
      navigation:'UNCHANGED_LOWEST_EDGE_7_01_METRES_ABOVE_PLATFORM'};
    return member;
  });
}
