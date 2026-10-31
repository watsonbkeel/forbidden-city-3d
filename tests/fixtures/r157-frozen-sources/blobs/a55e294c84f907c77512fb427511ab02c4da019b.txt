import {ImageLoader} from 'three';

// One original illustrative field, not a facsimile of the photographed carving.
// The rest of the private atlas, including the chair, must remain untouched.
export const QIANQING_SCREEN_PAINT=Object.freeze({
 url:'textures/art/qianqing-screen-illustration-r32.webp',
 status:'AI_ASSISTED_PHOTO_INFORMED_APPROXIMATION_NOT_ARTIFACT_FACSIMILE',
 source:'https://img.dpm.org.cn/Uploads/Picture/dc/1523%5B1024%5D.jpg',
 atlasWidth:1024,atlasHeight:512,screenWidth:192,screenHeight:256,
});
export function loadQianqingScreenPaint({canvas,texture,material,manager}){
 const p=QIANQING_SCREEN_PAINT,m=material.userData;
 if(canvas.width!==p.atlasWidth||canvas.height!==p.atlasHeight)throw Error('Qianqing screen paint requires its registered atlas');
 let disposed=false;m.screenPaintStatus=p.status;m.screenPaintState='loading';m.screenPaintSource=p.source;
 const stop=()=>{disposed=true;m.screenPaintState='disposed';material.removeEventListener('dispose',stop);};
 material.addEventListener('dispose',stop);
 const failed=()=>{if(!disposed)m.screenPaintState='fallback';};
 new ImageLoader(manager).load(`${import.meta.env?.BASE_URL??'/'}${p.url}`,image=>{
  if(disposed)return;
  try{const c=canvas.getContext('2d');if(!c||!image.width||!image.height)throw Error('Qianqing screen paint unavailable');
   c.drawImage(image,0,0,p.screenWidth,p.screenHeight);texture.needsUpdate=true;m.screenPaintState='ready';
  }catch{failed();}
 },undefined,failed);
 return stop;
}
