import * as THREE from 'three';

// Own frontal close-up, not another hall's frame or a recovered carving map.
// The simplified contour retains wide top wings, waved sides and a lower
// curled/scalloped apron. Its exact carving count and rear decoration are not
// reconstructed. All dimensions/colors remain explicitly photo-guided fits.
const LEFT=Object.freeze([[0,.5],[-.10,.495],[-.18,.475],[-.26,.485],[-.34,.475],[-.47,.49],[-.49,.46],[-.49,.42],[-.46,.40],[-.37,.40],[-.33,.36],[-.31,.31],[-.33,.27],[-.31,.22],[-.33,.17],[-.31,.12],[-.33,.07],[-.31,.02],[-.33,-.03],[-.31,-.08],[-.33,-.13],[-.31,-.18],[-.33,-.23],[-.31,-.28],[-.32,-.34],[-.34,-.40],[-.31,-.46],[-.27,-.47],[-.23,-.44],[-.18,-.47],[-.10,-.47],[-.05,-.495],[0,-.5]].map(Object.freeze));
const OUTLINE=Object.freeze([...LEFT,...LEFT.slice(1,-1).reverse().map(([x,y])=>[-x,y])].map(Object.freeze));
function rectangle(w,h,cy=0,hole=false){const a=[[-w/2,cy-h/2],[w/2,cy-h/2],[w/2,cy+h/2],[-w/2,cy+h/2]];if(hole)a.reverse();const p=hole?new THREE.Path():new THREE.Shape();p.moveTo(...a[0]);a.slice(1).forEach(v=>p.lineTo(...v));p.closePath();return p;}

export function refineTaihemenNameboard(plaque,roof){
  const previous=plaque?.userData?.taihemenFrame;
  const mount=plaque?.userData?.hallNameboardMount,{width:w,height:h,depth:d}=previous?.oldDimensions??plaque?.geometry?.parameters??{};
  const image=plaque?.material?.map?.image,s=plaque?.scale?.x;
  if(!mount||mount.name!=='太和门'||plaque.parent?.name!=='太和门'||roof?.parent!==plaque.parent||!plaque.userData.noMerge||
    ![w,h,d,s,image?.width,image?.height].every(Number.isFinite)||Math.min(w,h,d,s)<=0||Math.abs(plaque.scale.y-s)>1e-9||plaque.scale.z!==1||image.width!==256||image.height!==Math.round(image.width*h/w))
    throw Error('Taihemen nameboard frame requires its own mounted original plaque and glyph texture');
  const band=roof.userData.doubleEaveMountingBand;
  if(!band||![band.lowerY,band.upperY,band.halfDepth].every(Number.isFinite)||band.upperY<=band.lowerY||band.halfDepth<=0)throw Error('Taihemen nameboard frame needs generated roof band');
  roof.updateWorldMatrix(true,true);plaque.updateWorldMatrix(true,true);
  const local=roof.worldToLocal(plaque.getWorldPosition(new THREE.Vector3())),lower=[],upper=[];
  // Conservative entire bounding rectangle, including the wider top wings.
  // Keep the current safe anchor; never move/shrink a roof to fit the frame.
  for(const x of[-h*.49*s,0,h*.49*s])for(const dz of[-d/2,d/2]){
    const origin=roof.localToWorld(new THREE.Vector3(local.x+x,local.y,local.z+dz));
    const hits=[-1,1].map(dir=>new THREE.Raycaster(origin,new THREE.Vector3(0,dir,0),0,20).intersectObject(roof,true)[0]);
    if(!hits[0]||!hits[1]||!['roof_tile','roof_tile_material'].includes(hits[0].object.material.name)||!['rafters','rafters_material','roof_soffit','roof_soffit_material'].includes(hits[1].object.material.name))
      throw Error('Taihemen nameboard frame roof clearance is not established');
    lower.push(roof.worldToLocal(hits[0].point.clone()).y);upper.push(roof.worldToLocal(hits[1].point.clone()).y);
  }
  const minimumRoofGap=Math.min(local.y-h*s/2-Math.max(...lower),Math.min(...upper)-(local.y+h*s/2));
  if(minimumRoofGap<.03-1e-6)throw Error('Taihemen nameboard frame cannot fit retained safe roof gap');
  if(previous)return previous; // Idempotent only after rechecking the actual current roof.
  // All identity, dimensions and physical roof tests precede any allocation.
  const panelW=h*.42,panelH=h*.72,panelCY=h*.025,goldW=panelW+h*.032,goldH=panelH+h*.032;
  const outer=new THREE.Shape();OUTLINE.forEach(([x,y],i)=>i?outer.lineTo(x*h,y*h):outer.moveTo(x*h,y*h));outer.closePath();outer.holes.push(rectangle(goldW,goldH,panelCY,true));
  const goldShape=rectangle(goldW,goldH,panelCY);goldShape.holes.push(rectangle(panelW,panelH,panelCY,true));
  const solid=shape=>{const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:1,steps:1});g.translate(0,0,-d/2);return g;};
  const redGeometry=solid(outer),goldGeometry=solid(goldShape),panel=new THREE.BoxGeometry(panelW,panelH,d);panel.translate(0,panelCY,0);
  // Crop away the old generic rectangular border, not the original characters.
  const uv=panel.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,28/image.width+uv.getX(i)*(1-56/image.width),28/image.height+uv.getY(i)*(1-56/image.height));}uv.needsUpdate=true;
  const red=new THREE.MeshStandardMaterial({name:'taihemen-nameboard-red',color:0xa82c22,roughness:.78});
  const gold=new THREE.MeshStandardMaterial({name:'taihemen-nameboard-gold',color:0xd1ad4c,roughness:.64,metalness:.3});
  const group=new THREE.Group();group.name='taihemen-source-nameboard-frame';group.position.copy(plaque.position);group.quaternion.copy(plaque.quaternion);group.scale.copy(plaque.scale);
  for(const [geometry,material]of[[redGeometry,red],[goldGeometry,gold]]){const m=new THREE.Mesh(geometry,material);m.name=material.name;m.castShadow=m.receiveShadow=true;group.add(m);}
  const p={id:'taihemen-nameboard-frame-r157',entityId:'FC-B3B12CF397',accepted:false,sourceText:'太和門',modelText:'太和门',textMatchStatus:'TRADITIONAL_SOURCE_MEN_VS_RETAINED_SIMPLIFIED_MODEL_MEN_UNMATCHED',
    sourceURL:'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/581b39ceebc04fd5a1a7e77249fe0c5b.jpg',photographyDate:null,uploadPathDate:'2026-06-25',
    dimensionStatus:'OWN_PHOTO_SILHOUETTE_FIT_NOT_SURVEY',scope:'VISIBLE_FRONT_FRAME_ONLY_NO_EXACT_CARVING_OR_HIDDEN_REAR_RECONSTRUCTION',
    glyphTextureStatus:'ORIGINAL_SYSTEM_FONT_RETAINED_NOT_SOURCE_CALLIGRAPHY',visibilityStatus:'SIDE_APRON_AND_TEXT_VISIBLE_TOP_WINGS_OCCLUDED_BY_RETAINED_RAFTERS_FROM_SOUTH_GROUND',oldDimensions:{width:w,height:h,depth:d},scale:s,
    panel:{width:panelW,height:panelH,centreY:panelCY},textureSize:{width:image.width,height:image.height},outerWidth:h*.98,outerHeight:h,roofSurfaceProbes:12,minimumRoofGap,
    retainedAnchor:plaque.position.toArray(),retainedQuaternion:plaque.quaternion.toArray(),unverified:['Full front silhouette visibility at retained recessed mount','Exact contour carving and painting','Rear decoration','Photographic date','Browser/GPU text readability']};
  group.userData.structure={id:'axis/taihemen-nameboard-frame',entityId:p.entityId,profile:p};
  const oldGeometry=plaque.geometry;plaque.geometry=panel;plaque.userData.taihemenFrame=p;mount.appearanceStatus='OWN_RED_FRAME_SILHOUETTE_FIT_SYSTEM_FONT_RETAINED';plaque.parent.add(group);oldGeometry.dispose();
  return p;
}
