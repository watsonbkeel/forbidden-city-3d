import {ImageLoader} from 'three';

// Original AI-assisted illustration informed by the official photographs.
// It is not a tracing, a measured paint scheme, or evidence for the architecture.
export const QIANQING_CEILING_PAINT=Object.freeze({
 url:'textures/art/qianqing-ceiling-illustration-r32.webp',
 status:'AI_ASSISTED_PHOTO_INFORMED_APPROXIMATION',
 source:'https://img.dpm.org.cn/Uploads/Picture/dc/2568%5B1024%5D.jpg',
 canvasSize:256,
});

/** Repaint the existing private texture. No second GPU texture/material, no
 * blocking await, and no callback may resurrect a disposed material. If the
 * local image fails, the original deterministic paint remains available. */
export function loadQianqingCeilingPaint({canvas,texture,material,metadata,manager}) {
 const p=QIANQING_CEILING_PAINT;
 if(canvas.width!==p.canvasSize||canvas.height!==p.canvasSize)throw Error('Qianqing paint requires its registered 256px canvas');
 let disposed=false;
 metadata.paintStatus=p.status;metadata.paintState='loading';metadata.paintSource=p.source;
 const stop=()=>{disposed=true;metadata.paintState='disposed';material.removeEventListener('dispose',stop);};
 material.addEventListener('dispose',stop);
 const failed=()=>{if(!disposed)metadata.paintState='fallback';};
 new ImageLoader(manager).load(`${import.meta.env?.BASE_URL??'/'}${p.url}`,image=>{
  if(disposed)return;
  try {
   const ctx=canvas.getContext('2d');
   if(!ctx||!image.width||!image.height)throw Error('Qianqing paint image unavailable');
   ctx.drawImage(image,0,0,canvas.width,canvas.height);
   texture.needsUpdate=true;metadata.paintState='ready';
  } catch { failed(); }
 },undefined,failed);
 return stop;
}
