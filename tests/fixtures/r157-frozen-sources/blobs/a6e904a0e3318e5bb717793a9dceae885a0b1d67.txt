import * as THREE from 'three';

const TEXT_STATUS='SYSTEM_FONT_SEMANTIC_APPROXIMATION_NOT_ORIGINAL_CALLIGRAPHY';
const FIT='PHOTO_LOCATION_MODEL_FIT_NOT_SURVEY';
const tag=(mesh,role,info)=>{mesh.name=role;Object.assign(mesh.userData,{role,r49SourcedNameInscription:true,...info});return mesh;};

/** The official Hongyi front photograph locates a blue vertical nameboard
 * above the lower central doorway. This does not transfer one to Tiren. */
export function buildHongyiNameInscription(kit,frame,g){
  if(g.profile!=='hongyi')throw Error('Hongyi inscription requires its own pavilion profile');
  const info={text:'弘義閣',layout:'vertical',source:'https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg',
    textStatus:TEXT_STATUS,dimensionStatus:FIT,script:'Han',
    omittedScript:{script:'Manchu',status:'NO_VERIFIED_TRANSCRIPTION_OR_FONT__NO_INVENTED_MARKS'},
    mount:'LOWER_CENTRAL_DOOR_HEAD_IN_FRONT_OF_BEAM_AND_BRACKET_BAND'};
  // Bounded by the existing door head and lower eave. No architectural member
  // is moved and the plaque is not enlarged for distant readability.
  kit.plaque(frame,info.text,0,g.lower.columnTop,g.lower.front-.425,1.1,1.35);
  const {mesh,frame:back}=kit.plaques.at(-1);
  tag(mesh,'hongyi-lower-front-nameboard',info);
  tag(back,'hongyi-lower-front-nameboard-backing',info);
  return info;
}

/** Only a lettered surface inside the already-built pale stone / green frame.
 * No gold frame, blue board, new panel, relief carving or photo pixels. */
export function buildBaoyunNameInscription(kit,frame,panel,source){
  if(panel?.name!=='baoyun-central-inscription-panel-untextured'||panel.material?.name!=='baoyun_pale_stone')throw Error('Baoyun lettering requires its retained pale inscription panel');
  const info={text:'寶蘊樓',layout:'vertical',source,textStatus:TEXT_STATUS,dimensionStatus:FIT,
    carvingStatus:'STONE_RELIEF_UNMODELED',mount:'EXISTING_PALE_STONE_FIELD_INSIDE_GREEN_BORDER'};
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=768;
  const c=canvas.getContext('2d');
  c.fillStyle='#ffffff';c.fillRect(0,0,canvas.width,canvas.height);
  c.fillStyle='#677358';c.textAlign='center';c.textBaseline='middle';
  c.font='183px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
  [...info.text].forEach((ch,i)=>c.fillText(ch,canvas.width/2,32+(canvas.height-64)/3*(i+.5)));
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const material=new THREE.MeshStandardMaterial({name:'baoyun_stone_name_inscription',color:panel.material.color.clone(),map,roughness:panel.material.roughness,metalness:0});
  kit.owned.push(material);(kit.ownedTextures??=[]).push(map);
  const geometry=new THREE.PlaneGeometry(.68,1.42);geometry.rotateY(Math.PI);
  const mesh=tag(kit.mesh(frame,geometry,material,0,11.08,7.714),'baoyun-sourced-stone-name-inscription',info);
  mesh.castShadow=false;
  return info;
}
