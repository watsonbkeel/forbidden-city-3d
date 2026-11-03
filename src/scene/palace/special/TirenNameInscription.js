import * as THREE from 'three';

/** Tiren's own captioned close-up shows 體仁閣 in gold on blue, inside
 * a red/gilt surround, below the waist eave and above the central door.
 * This evidence is independent of the Hongyi board and its dimensions. */
export function buildTirenNameInscription(kit,frame,g) {
  if(g.profile!=='tiren')throw Error('Tiren inscription requires its own pavilion profile');
  const info={text:'體仁閣',layout:'vertical',script:'Han',
    source:'https://www.meipian.cn/2yl5ic7b',
    sourceImage:'https://ss-mpvolc.meipian.me/users/2754388/220c5360-9dc6-11ea-9bdd-bffc5473617d__JPG.heic',
    sourceImageSHA256:'8d3c545a7722704d21f205482ceaa908812a79667cb1b4f0508200c9bc9852bc',
    ownOfficialView:'https://img.dpm.org.cn/Uploads/Picture/dc/1534%5B1024%5D.jpg',
    textStatus:'SYSTEM_FONT_SEMANTIC_APPROXIMATION_NOT_ORIGINAL_CALLIGRAPHY',
    dimensionStatus:'OWN_PHOTO_LOCATION_MODEL_FIT_NOT_SURVEY',
    surroundStatus:'RECTANGULAR_RED_GILT_APPROXIMATION_NOT_CARVED_SURROUND',
    mount:'LOWER_WEST_CENTRAL_DOOR_HEAD_BELOW_WAIST_EAVE',currentAdmissionVerified:false};
  // Fits wholly above the retained door head and below its lower-eave datum.
  // The complete red surround is forward of the bracket/painted-beam faces.
  // No structural member, collider, route, map item or shared atlas style moves.
  kit.plaque(frame,info.text,0,g.lower.columnTop,g.lower.front-.43,1.08,1.30);
  const {mesh,frame:back}=kit.plaques.at(-1);
  back.geometry.dispose();
  back.geometry=new THREE.BoxGeometry(1.36,1.54,.1);
  back.material=kit.lacquer;
  for(const [object,role]of [[mesh,'tiren-lower-front-nameboard'],[back,'tiren-lower-front-nameboard-backing']]) {
    object.name=role;
    Object.assign(object.userData,{role,r163TirenNameInscription:true,...info});
  }
  return info;
}
