import * as THREE from 'three';

// The two Yonghe Museum views resolve curved shoulders below the open
// three-bay baoxia's front beam. These plain sampled contours preserve only
// that visible relationship. They do not reconstruct carved subjects, painted
// motifs, concealed joinery, or the transverse framing farther inside.
const OUTLINE=Object.freeze([
  [0,0],[.95,0],[.95,-.045],[.90,-.10],[.85,-.14],
  [.72,-.24],[.55,-.335],[.38,-.40],[.23,-.49],
  [.11,-.55],[0,-.53],
].map(Object.freeze));

export const YONGHE_CANOPY_KNEE_FIT=Object.freeze({
  role:'yonghe-canopy-front-knee',profile:'yonghe-open-baoxia',
  source:'https://www.dpm.org.cn/explore/building/236518.html',
  photo:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e47b346.jpg',
  photoSha256:'06f77191106c9feb64f85b4d248d957cb193ae0041d54cb43b60eefd2b52d4e1',
  contextPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e4779a2.jpg',
  contextPhotoSha256:'82d09ae5de59565edae2d3169269b99aae7fe56a74461b3ed3aa9ad6903bcc69',
  projection:.95,drop:.55,depth:.16,rootOffset:.314,beamSeparation:.008,
  columnXs:Object.freeze([-8.34,-2.78,2.78,8.34]),frontZ:-8.2,
  topY:6.4988,lowestY:5.9488,
  dimensionStatus:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED',
  colorStatus:'MUTED_GRAY_GREEN_BASIC_TONE_FIT_NOT_PAINTING_REPRODUCTION',
  depthStatus:'ENGINEERING_FIT_PHOTO_UNRESOLVED',
  patternStatus:'CARVING_SUBJECT_AND_PAINTED_MOTIFS_UNKNOWN_NOT_INVENTED',
  repetitionStatus:'FITTED_PAIRED_SHOULDERS_IN_THREE_DOCUMENTED_OPEN_BAYS_NOT_MEASURED_PATTERN',
  visualAcceptance:'VERIFY_PENDING',captureDate:null,
});

const close=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
const unchangedTransform=o=>o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.x===1&&o.scale.y===1&&o.scale.z===1;

/** Add only six low-poly front-beam shoulders to an existing Yonghe host.
 * Neither shell nor registrations are changed. Top/root separation is a
 * small anti-penetration fit, not a claim about hidden joinery.
 * The lowest new edge remains 5.3488 m above the retained platform.
 */
export function buildYongheCanopyKnees(kit,frame,item){
  const p=YONGHE_CANOPY_KNEE_FIT;
  if(item?.name!=='永和宫'||item.kind!=='hall'||item.structure!=='east-residential-facade'||
    item.facadeProfile!==p.profile||item.x!==-149||item.z!==379.1||
    item.w!==27.8||item.d!==12||item.ph!==.6||item.pad!==.8||
    item.colH!==6.72||item.bays!==5||item.rot!==undefined)
    throw Error('Yonghe canopy knees require exact retained identity and envelope');
  if(!frame?.isGroup||!Array.isArray(kit?.owned)||typeof kit.mesh!=='function')
    throw Error('Yonghe canopy knees require an existing kit and host');
  const canopies=frame.children.filter(o=>o.userData.role==='yonghe-open-canopy');
  if(canopies.length!==1)throw Error('Yonghe canopy knees require one existing canopy host');
  const canopy=canopies[0];
  if(canopy.children.some(o=>o.userData.role===p.role))throw Error('Yonghe canopy knees already installed');
  const columns=canopy.children.filter(o=>o.isMesh&&o.userData.role==='yonghe-canopy-column').sort((a,b)=>a.position.x-b.position.x);
  const beams=canopy.children.filter(o=>o.isMesh&&o.userData.role==='yonghe-canopy-front-beam');
  if(!unchangedTransform(canopy)||!canopy.position.equals(new THREE.Vector3())||columns.length!==4||beams.length!==1)
    throw Error('Yonghe canopy knees require the retained canopy column and beam host');
  for(let i=0;i<4;i++){
    const c=columns[i],g=c.geometry.parameters;
    if(c.geometry.type!=='CylinderGeometry'||!unchangedTransform(c)||
      !close(c.position.x,p.columnXs[i])||!close(c.position.y,3.7584)||!close(c.position.z,p.frontZ)||
      !close(g.radiusTop,.3)||!close(g.radiusBottom,.312)||!close(g.height,6.3168))
      throw Error('Yonghe canopy knees column host has changed');
  }
  const beam=beams[0],b=beam.geometry.parameters;
  if(beam.geometry.type!=='BoxGeometry'||!unchangedTransform(beam)||
    !close(beam.position.x,0)||!close(beam.position.y,6.7168)||!close(beam.position.z,p.frontZ)||
    !close(b.width,17.08)||!close(b.height,.42)||!close(b.depth,.38))
    throw Error('Yonghe canopy knees beam host has changed');

  // No library/shared material edit, no image texture, no fabricated ornament.
  const material=new THREE.MeshStandardMaterial({name:'yonghe_canopy_knee_muted_wood_fit',color:0x777c6a,roughness:.87,metalness:0});
  kit.owned.push(material);
  const result=[];
  for(let bay=0;bay<3;bay++)for(const inward of[1,-1]){
    const columnX=p.columnXs[bay+(inward===1?0:1)];
    const geometry=new THREE.ExtrudeGeometry(new THREE.Shape(OUTLINE.map(([x,y])=>new THREE.Vector2(x,y))),{depth:p.depth,steps:1,bevelEnabled:false,curveSegments:1});
    geometry.translate(0,0,-p.depth/2);
    const m=kit.mesh(canopy,geometry,material,columnX+inward*p.rootOffset,p.topY,p.frontZ);
    if(inward===-1)m.rotation.y=Math.PI;
    m.name=p.role;
    m.userData={...p,columnX,inward,bay,side:'front',
      contactStatus:'FITTED_TINY_SURFACE_SEPARATION_NO_POSITIVE_VOLUME_HOST_PENETRATION',
      navigation:'UNCHANGED_NO_NEW_COLLIDER_WALKABLE_OR_ROOM',
      scope:'FRONT_BEAM_CURVED_SHOULDER_OUTLINE_ONLY_NOT_COMPLETE_BAOXIA_FRAMING'};
    result.push(m);
  }
  return result;
}
