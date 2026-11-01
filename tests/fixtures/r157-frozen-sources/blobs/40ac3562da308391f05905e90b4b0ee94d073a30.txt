import * as THREE from 'three';

const KEY = 'jiaotai-landmark-atlas';
export const JIAOTAI_ART = Object.freeze({
  width: 1024, height: 512, columns: 4, rows: 2,
  cells: { panel: 0, dial: 1, woodwork: 2, roof: 3, dark: 4, gold: 5, red: 6, bronze: 7 },
  status: 'SELF_AUTHORED_SCHEMATIC_ORNAMENT_NOT_PHOTOGRAPHIC_OR_MEASURED_RELIEF',
});

/** One private atlas shared by both distance levels. Museum photographs are
 * research references only; none is copied into the runtime texture. */
export function jiaotaiLandmarkMaterial(builder) {
  if (builder._own.has(KEY)) return builder._own.get(KEY);
  const canvas = document.createElement('canvas');
  canvas.width = JIAOTAI_ART.width; canvas.height = JIAOTAI_ART.height;
  const c = canvas.getContext('2d');
  if (!c) throw Error('Jiaotai atlas requires a 2D canvas');
  const size = 256;
  const cell = (i, draw) => {
    c.save(); c.translate((i % 4) * size, Math.floor(i / 4) * size);
    draw(); c.restore();
  };
  const fill = color => { c.fillStyle = color; c.fillRect(0, 0, size, size); };
  const border = (color, inset, width) => { c.strokeStyle = color; c.lineWidth = width; c.strokeRect(inset,inset,size-2*inset,size-2*inset); };
  cell(0, () => {
    fill('#272b29'); border('#a38b50',9,5); border('#665a37',19,2);
    // Readable bilateral scroll rhythm, not a reconstruction of each carving.
    c.strokeStyle = '#9c8248'; c.lineWidth = 3;
    for (const sign of [-1,1]) {
      c.beginPath(); c.moveTo(128,228);
      c.bezierCurveTo(128+sign*52,196,128+sign*69,122,128+sign*13,35); c.stroke();
      for (let k=0;k<7;k++) {
        const y=51+k*25, x=128+sign*(18+23*Math.sin(k*.47));
        c.beginPath(); c.moveTo(x,y+17);
        c.bezierCurveTo(x+sign*44,y-4,x+sign*47,y-17,x+sign*12,y-10);
        c.bezierCurveTo(x+sign*37,y-8,x+sign*20,y+4,x,y+17); c.stroke();
      }
    }
    c.strokeStyle='#c0a567';c.lineWidth=2;c.beginPath();c.moveTo(128,26);c.lineTo(128,231);c.stroke();
  });
  cell(1, () => {
    fill('#262b2b'); c.fillStyle='#aa905b';c.beginPath();c.arc(128,128,119,0,Math.PI*2);c.fill();
    for (const r of [116,110,80]) { c.strokeStyle='#4e4939';c.lineWidth=2;c.beginPath();c.arc(128,128,r,0,Math.PI*2);c.stroke(); }
    c.fillStyle='#282d29';c.textAlign='center';c.textBaseline='middle';c.font='24px serif';
    const roman=['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];
    roman.forEach((label,k)=>{c.save();c.translate(128,128);c.rotate(k*Math.PI/6);c.fillText(label,0,-96);c.restore();});
    for(let k=0;k<60;k++){const a=k*Math.PI/30;c.strokeStyle='#454533';c.lineWidth=k%5?1:2;c.beginPath();c.moveTo(128+Math.sin(a)*105,128-Math.cos(a)*105);c.lineTo(128+Math.sin(a)*110,128-Math.cos(a)*110);c.stroke();}
    // Static illustrative hands. They do not claim the current artifact time.
    c.strokeStyle='#202a29';c.lineCap='round';
    for(const [a,l,w]of [[-Math.PI/3,61,5],[Math.PI*2/3,88,3]]){c.lineWidth=w;c.beginPath();c.moveTo(128,128);c.lineTo(128+Math.sin(a)*l,128-Math.cos(a)*l);c.stroke();}
    c.fillStyle='#202a29';c.beginPath();c.arc(128,128,6,0,Math.PI*2);c.fill();
  });
  cell(2, () => {
    fill('#693d31');border('#9d8250',11,4);border('#242e2b',20,4);
    c.strokeStyle='#976e4a';c.lineWidth=4;
    for(let y=40;y<241;y+=40){c.beginPath();c.moveTo(24,y);c.lineTo(232,y);c.stroke();}
    for(let x=40;x<241;x+=40){c.beginPath();c.moveTo(x,24);c.lineTo(x,232);c.stroke();}
    c.strokeStyle='#344e48';c.lineWidth=3;c.strokeRect(49,49,158,158);
  });
  cell(3, () => {
    fill('#425951');
    for(let x=0;x<256;x+=20){c.fillStyle='#6d7860';c.fillRect(x,0,5,256);c.fillStyle='#2e4541';c.fillRect(x+5,0,4,256);}
    for(let y=0;y<256;y+=32){c.strokeStyle='#a28a50';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();}
    border('#a08b59',5,4);
  });
  ['#292e2b','#aa8b46','#693c31','#595b43'].forEach((color,i)=>cell(i+4,()=>fill(color)));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({ map:texture, roughness:.78, metalness:.10 });
  material.name = KEY; material.userData.artStatus = JIAOTAI_ART.status;
  let disposed = false;
  material.addEventListener('dispose',()=>{if(!disposed){disposed=true;texture.dispose();}});
  builder._own.set(KEY,material); builder.ownedMaterials.push(material);
  return material;
}

/** Give each box face one atlas cell, including explicit south/front index 5. */
export function mapJiaotaiBoxUV(geometry, cells) {
  const uv=geometry.attributes.uv;
  if(uv.count!==24||!geometry.index||!Array.isArray(cells)||cells.length!==6)throw Error('Expected six box face cells');
  for(let face=0;face<6;face++){
    const cell=cells[face];if(!Number.isInteger(cell)||cell<0||cell>7)throw Error('Unknown Jiaotai atlas cell');
    const x=cell%4,y=Math.floor(cell/4),pad=2/256;
    for(let k=0;k<4;k++){const i=face*4+k,u=uv.getX(i),v=uv.getY(i);uv.setXY(i,(x+pad+u*(1-2*pad))/4,1-(y+1-pad-v*(1-2*pad))/2);}
  }
  return geometry;
}

export function mapJiaotaiSolidUV(geometry, cell) {
  if(!Number.isInteger(cell)||cell<4||cell>7)throw Error('Expected a solid-color atlas cell');
  const p=geometry.attributes.position,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){uv[i*2]=(cell%4+.5)/4;uv[i*2+1]=1-(Math.floor(cell/4)+.5)/2;}
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geometry;
}
