import {ImageLoader} from 'three';
// Five-dragon category/count follows the official detail photograph. Anatomy,
// pose and color are original approximations, not an artifact facsimile.
export const QIANQING_FRIEZE_PAINT=Object.freeze({
 url:'textures/art/qianqing-five-dragon-illustration-r32.webp',
 status:'AI_ASSISTED_FIVE_DRAGON_APPROXIMATION_NOT_ARTIFACT_FACSIMILE',
 source:'https://img.dpm.org.cn/Uploads/Picture/dc/2568%5B1024%5D.jpg',
 imageWidth:1024,imageHeight:409,sourceHeight:358,
 atlasWidth:1024,atlasHeight:512,targetX:512,targetY:0,targetSize:256,
});
export function loadQianqingFriezePaint({canvas,texture,material,manager}){
 const p=QIANQING_FRIEZE_PAINT,m=material.userData;
 if(canvas.width!==p.atlasWidth||canvas.height!==p.atlasHeight)throw Error('Qianqing frieze requires its registered atlas');
 let disposed=false;m.friezePaintStatus=p.status;m.friezePaintState='loading';m.friezePaintSource=p.source;
 const stop=()=>{disposed=true;m.friezePaintState='disposed';material.removeEventListener('dispose',stop);};material.addEventListener('dispose',stop);
 const failed=()=>{if(!disposed)m.friezePaintState='fallback';};
 new ImageLoader(manager).load(`${import.meta.env?.BASE_URL??'/'}${p.url}`,image=>{
  if(disposed)return;
  try{const c=canvas.getContext('2d');if(!c||image.width!==p.imageWidth||image.height!==p.imageHeight)throw Error('Unregistered Qianqing frieze image');
   // Sample only the painted strip, excluding the generated white bottom margin.
   c.drawImage(image,0,0,p.imageWidth,p.sourceHeight,p.targetX,p.targetY,p.targetSize,p.targetSize);texture.needsUpdate=true;m.friezePaintState='ready';
  }catch{failed();}
 },undefined,failed);return stop;
}
