import * as THREE from 'three';

/** Current museum photograph + 1941 front elevation establish the central
 * five door bays and raised-wall windows in the outer four bays. The ratios,
 * projection, simplified lattice and pigment response below are estimates. */
export const BAOHE_FRONT_ENCLOSURE = Object.freeze({
  id: 'baohe-front-red-frame-dark-lattice',
  outerWindowBays: Object.freeze([0,1,7,8]),
  closedDoorBays: Object.freeze([2,6]),
  wallHeightRatio: .22, wallDepth: .3, windowDepth: .15,
  status: 'PHOTO_RELATIVE_BASE_AND_SIMPLIFIED_SELF_AUTHORED_PATTERN_NOT_SURVEY',
  source: 'https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/dlV1Td6ERs6f20zINpkskcSWnuy6tdjhfEpVP0B9.jpg',
});

const CELLS=Object.freeze({leaf:0,closed:1,window:2,base:3});

function drawLattice(c,x,y,w,h){
  c.fillStyle='#263a35';c.fillRect(x,y,w,h);
  // Bounded geometric interpretation only, not a traced historic motif.
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  c.strokeStyle='#80564a';c.lineWidth=2;
  const step=18;
  for(let d=-h;d<w+h;d+=step){
    c.beginPath();c.moveTo(x+d,y);c.lineTo(x+d+h,y+h);c.stroke();
    c.beginPath();c.moveTo(x+d,y+h);c.lineTo(x+d+h,y);c.stroke();
  }
  c.restore();
}

function drawLeaf(c,x,w){
  c.fillStyle='#72241e';c.fillRect(x,0,w,512);
  c.strokeStyle='#a5523c';c.lineWidth=3;c.strokeRect(x+4,4,w-8,504);
  drawLattice(c,x+10,18,w-20,298);
  c.strokeStyle='#4b6352';c.lineWidth=3;c.strokeRect(x+8,16,w-16,302);
  for(const[y,h]of [[334,35],[388,99]]){
    c.fillStyle='#6b2722';c.fillRect(x+10,y,w-20,h);
    c.strokeStyle='#506452';c.strokeRect(x+10,y,w-20,h);
    c.strokeStyle='#a34934';c.strokeRect(x+15,y+5,w-30,h-10);
  }
}

export function baoheFrontMaterial(b){
  const key='baohe_front_enclosure';if(b._own.has(key))return b._own.get(key);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const c=canvas.getContext('2d');
  c.fillStyle='#72241e';c.fillRect(0,0,1024,512);
  drawLeaf(c,0,256);
  for(let i=0;i<4;i++)drawLeaf(c,256+i*64,64);
  c.fillStyle='#72241e';c.fillRect(512,0,256,512);
  drawLattice(c,524,18,232,476);
  c.strokeStyle='#4b6352';c.lineWidth=5;c.strokeRect(522,16,236,480);
  // Continuous simplified window infill: no unverified leaf count is asserted.
  c.fillStyle='#666b67';c.fillRect(768,0,256,512);
  c.fillStyle='#737873';c.fillRect(768,0,256,30);
  c.fillStyle='#4e5551';c.fillRect(768,30,256,5);
  c.strokeStyle='#545b56';c.lineWidth=3;
  for(let y=145;y<512;y+=160){c.beginPath();c.moveTo(768,y);c.lineTo(1024,y);c.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const material=b.ownMat(key,{name:key,map,roughness:.86,metalness:.015});
  let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;map.dispose();}});
  return material;
}

/** Bottom faces are fully hidden by the opaque floor or the wider solid base.
 * Only those two triangles are removed. All side/top surfaces remain. */
export function baoheFrontBox(b,g,{kind,w,h,d,x,y,z,hiddenBottom=false}){
  if(!Object.hasOwn(CELLS,kind)||![w,h,d,x,y,z].every(Number.isFinite)||Math.min(w,h,d)<=0)
    throw Error('Invalid Baohe front enclosure box');
  const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,(CELLS[kind]+(.004+.992*uv.getX(i)))/4);
  if(hiddenBottom){
    const bottom=geo.groups.find(group=>group.materialIndex===3);
    if(!bottom||bottom.count!==6)throw Error('Unrecognized box bottom');
    const old=[...geo.index.array];geo.setIndex([...old.slice(0,bottom.start),...old.slice(bottom.start+bottom.count)]);
    geo.clearGroups();
  }
  const mesh=new THREE.Mesh(geo,baoheFrontMaterial(b));mesh.position.set(x,y,z);
  mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.userData.baoheFrontEnclosure={...BAOHE_FRONT_ENCLOSURE,kind,hiddenBottom};
  g.add(mesh);return mesh;
}

export function buildBaoheClosedFront(b,g,{bay,xc,zf,y,height,width}){
  if(!Number.isInteger(bay)||![xc,zf,y,height,width].every(Number.isFinite)||height<=0||width<=0)
    throw Error('Invalid Baohe closed front bay');
  const p=BAOHE_FRONT_ENCLOSURE;
  if(p.closedDoorBays.includes(bay)){
    return [baoheFrontBox(b,g,{kind:'closed',w:width,h:height,d:.15,x:xc,y:y+height/2,z:zf,hiddenBottom:true})];
  }
  if(!p.outerWindowBays.includes(bay))throw Error('Open Baohe bay cannot become a closed window');
  const base=height*p.wallHeightRatio;
  return [
    baoheFrontBox(b,g,{kind:'base',w:width,h:base,d:p.wallDepth,x:xc,y:y+base/2,z:zf,hiddenBottom:true}),
    baoheFrontBox(b,g,{kind:'window',w:width,h:height-base,d:p.windowDepth,x:xc,y:y+base+(height-base)/2,z:zf,hiddenBottom:true}),
  ];
}
