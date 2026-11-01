import * as THREE from 'three';

/** Jiyun's own official front view establishes this upper-colonnade mount.
 * No placement is inferred for the neighboring Baoxiang or Ciyin towers.
 * The original has Han on the right, read right-to-left, and Manchu at left.
 * This small Han-only sign is a semantic approximation, not copied calligraphy. */
export function buildJiyunNamePlaque(kit,frame,g){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=384;
  const c=canvas.getContext('2d');
  c.fillStyle='#c8ad6e';c.fillRect(0,0,1024,384);
  c.fillStyle='#514d7b';c.fillRect(20,20,984,344);
  c.fillStyle='#d8b35c';c.fillRect(36,36,952,312);
  c.fillStyle='#24427d';c.fillRect(43,43,938,298);
  c.fillStyle='#e5bf69';c.textAlign='center';c.textBaseline='middle';
  c.font='164px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
  [...'吉雲樓'].forEach((ch,i)=>c.fillText(ch,760-i*248,192));
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const blank=new THREE.MeshStandardMaterial({name:'jiyun_plaque_unlettered_frame',color:0xc8ad6e,roughness:.75});
  const face=new THREE.MeshStandardMaterial({name:'jiyun_plaque_han_semantic_face',map,roughness:.75,side:THREE.FrontSide});
  kit.owned.push(blank,face);face.addEventListener('dispose',()=>map.dispose());
  const p=new THREE.Mesh(new THREE.BoxGeometry(2.8,1,.1),[blank,blank,blank,blank,face,blank]);
  p.name='jiyun-upper-front-name-plaque';p.rotation.y=Math.PI;
  // Existing front-column row is inset .22 m. Keep the board just ahead of
  // its .32 m beam, under the unchanged roof, not on the recessed upper doors.
  p.position.set(0,g.upperY+g.upperH-.65,-g.d/2+.22-.16-.10);
  p.userData.noMerge=true;p.userData.role='jiyun-upper-front-name-plaque';
  p.userData.namePlaque={
    text:'吉雲樓',layout:'horizontal',hanReadingOrder:'right-to-left',
    renderedLayout:'HAN_ONLY_CENTERED_SEMANTIC_APPROXIMATION',originalLayout:'HAN_RIGHT_MANCHU_LEFT',
    omittedScript:{script:'Manchu',status:'DEFERRED_UNVERIFIED_TRANSCRIPTION_AND_FONT'},
    decorationStatus:'SIMPLIFIED_RECTANGULAR_FRAME_NOT_ORIGINAL_OUTLINE_OR_CALLIGRAPHY',
    source:'https://www.dpm.org.cn/explore/building/236483.html',
    photograph:'https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg',
    detailPhotograph:'https://img.dpm.org.cn/Uploads/Picture/dc/8001.jpg',
    mount:{kind:'upper-floor-front-colonnade-beam',dimensionStatus:'PHOTO_LOCATION_MODEL_FIT_NOT_SURVEY',width:2.8,height:1,depth:.1},
  };
  frame.add(p);return p;
}
