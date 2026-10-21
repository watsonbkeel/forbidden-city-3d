import * as THREE from 'three';

/** Museum front/oblique photographs establish three central door bays and
 * two raised-wall window bays on each side. Photo colors, the lower-wall
 * ratio and this self-authored lattice are approximations, not survey data.
 * R30 adds the two end through-passages in a separately labelled approximate
 * envelope. Their exact wall registration and front-veranda setback remain open. */
export const QIANQING_FRONT_ENCLOSURE = Object.freeze({
  id: 'qianqing-front-red-brown-frame-dark-lattice',
  doorBays: Object.freeze([3,4,5]), windowBays: Object.freeze([1,2,6,7]),
  approximatePassageBays: Object.freeze([0,8]),
  passageMetricRegistration: 'UNRESOLVED_SEE_QIANQING_END_PASSAGES',
  wallHeightRatio: .24, wallDepth: .3, windowDepth: .15,
  status: 'PHOTO_CLASSIFICATION_WITH_ESTIMATED_RATIOS_AND_SIMPLIFIED_PATTERN',
  source: 'https://www.dpm.org.cn/explore/building/236472.html',
  access: 'RETAINED_VIRTUAL_OPEN_POSE_NOT_CURRENT_PUBLIC_ACCESS',
});

const CELLS = Object.freeze({leaf:0, window:1, base:2});

function drawLattice(c,x,y,w,h) {
  c.fillStyle='#292425';c.fillRect(x,y,w,h);
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  c.strokeStyle='#745244';c.lineWidth=2;
  // Bounded crossed-lattice interpretation. Do not label this exact
  // sanjiao-liuwan joinery or copy photographic door paintings into the atlas.
  const step=20;
  for(let d=-h;d<w+h;d+=step){
    c.beginPath();c.moveTo(x+d,y);c.lineTo(x+d+h,y+h);c.stroke();
    c.beginPath();c.moveTo(x+d,y+h);c.lineTo(x+d+h,y);c.stroke();
  }
  c.restore();
}

export function qianqingFrontMaterial(b) {
  const key='qianqing_front_enclosure';if(b._own.has(key))return b._own.get(key);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const c=canvas.getContext('2d');
  c.fillStyle='#60302a';c.fillRect(0,0,1024,512);
  // Retain the current two folded virtual leaves per central bay. Subdivision
  // and hinge mechanics are not inferred from the photograph's closed pose.
  drawLattice(c,16,24,224,292);
  c.strokeStyle='#a88a50';c.lineWidth=3;c.strokeRect(12,20,232,300);
  for(const[y,h]of [[336,34],[391,96]]){
    c.fillStyle='#522923';c.fillRect(16,y,224,h);
    c.strokeStyle='#a88a50';c.lineWidth=3;c.strokeRect(16,y,224,h);
    c.strokeStyle='#835143';c.lineWidth=2;c.strokeRect(23,y+7,210,h-14);
  }
  drawLattice(c,272,18,224,476);
  c.strokeStyle='#a88a50';c.lineWidth=3;c.strokeRect(268,14,232,484);
  c.fillStyle='#67645d';c.fillRect(512,0,256,512);
  c.fillStyle='#777166';c.fillRect(512,0,256,26);
  c.fillStyle='#504d48';c.fillRect(512,26,256,5);
  // No speculative brick joints or invented inscriptions on the plain base.
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const material=b.ownMat(key,{name:key,map,roughness:.86,metalness:.015});
  let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;map.dispose();}});
  return material;
}

export function qianqingFrontBox(b,g,{kind,w,h,d,x,y,z,bay}) {
  const p=QIANQING_FRONT_ENCLOSURE;
  if(!Object.hasOwn(CELLS,kind)||!Number.isInteger(bay)
    ||!(kind==='leaf'?p.doorBays:p.windowBays).includes(bay)
    ||![w,h,d,x,y,z].every(Number.isFinite)||Math.min(w,h,d)<=0)
    throw Error('Unregistered Qianqing front enclosure geometry');
  const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,(CELLS[kind]+.004+.992*uv.getX(i))/4);
  const mesh=new THREE.Mesh(geo,qianqingFrontMaterial(b));mesh.position.set(x,y,z);
  mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.userData.qianqingFrontEnclosure={...p,kind,bay};g.add(mesh);return mesh;
}

export function buildQianqingFrontWindow(b,g,{bay,xc,zf,y,height,width}) {
  const p=QIANQING_FRONT_ENCLOSURE;
  if(!p.windowBays.includes(bay))throw Error('Qianqing door or end passage cannot become a window');
  const base=height*p.wallHeightRatio;
  return [
    qianqingFrontBox(b,g,{kind:'base',bay,w:width,h:base,d:p.wallDepth,x:xc,y:y+base/2,z:zf}),
    qianqingFrontBox(b,g,{kind:'window',bay,w:width,h:height-base,d:p.windowDepth,x:xc,y:y+base+(height-base)/2,z:zf}),
  ];
}
