import * as THREE from 'three';
import {BAOHE_DEPTH_GRID} from './BaoheDepthGrid.js';

export const BAOHE_COLUMN_COUPLETS = Object.freeze({
  id: 'baohe-column-couplets-official-text',
  viewerRight: '祖訓昭垂我後嗣子孫尚克欽承有永',
  viewerLeft: '天心降鑒惟萬方臣庶當思容保無疆',
  width: .465, height: 6.2, depth: .09, bottomAboveFloor: .65,
  columnX: 3.65, row: 4,
  status: 'PHOTO_RELATIVE_SIZE_AND_COLUMN_REGISTRATION_NOT_SURVEY',
  lettering: 'STANDARD_FONT_RECONSTRUCTION_NOT_IMPERIAL_CALLIGRAPHY_FACSIMILE',
  source: 'https://www.dpm.org.cn/Uploads/wenhua/E44/E44a-3.html',
});

export function baoheCoupletMaterial(b) {
  const key='baohe_column_couplets';
  if (b._own.has(key)) return b._own.get(key);
  const p=BAOHE_COLUMN_COUPLETS,canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=2048;
  const c=canvas.getContext('2d');
  c.fillStyle='#8d2c20';c.fillRect(0,0,256,2048);
  // Self-authored glyph atlas follows the museum specimen's yellow field and
  // dark lettering. No museum photograph is redistributed as a texture.
  for (const [j,line] of [p.viewerRight,p.viewerLeft].entries()) {
    c.fillStyle='#c8a449';c.fillRect(j*128+4,4,120,2040);
    c.fillStyle='#201c16';c.textAlign='center';c.textBaseline='middle';
    c.font='bold 116px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
    [...line].forEach((ch,i)=>c.fillText(ch,j*128+64,88+i*(1872/14),112));
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const material=b.ownMat(key,{name:key,map,roughness:.82,metalness:.05});
  let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;map.dispose();}});
  return material;
}

export function buildBaoheColumnCouplets(b,g,{x0,z0,y,columnRadius}) {
  if (![x0,z0,y,columnRadius].every(Number.isFinite)||columnRadius<.4||columnRadius>.5)
    throw Error('Baohe couplets require the retained inner column registration');
  const p=BAOHE_COLUMN_COUPLETS;
  const material=baoheCoupletMaterial(b);
  const back=b.ownMat('lacquer',{color:0x7a1d12,roughness:.4,metalness:.1});
  const z=z0+BAOHE_DEPTH_GRID.z[p.row]-columnRadius*1.05-p.depth/2;
  for (const [j,side] of [-1,1].entries()) {
    const x=x0+side*p.columnX,cy=y+.03+p.bottomAboveFloor+p.height/2;
    const body=new THREE.Mesh(new THREE.BoxGeometry(p.width,p.height,p.depth),back);
    body.position.set(x,cy,z);body.name=p.id+':back:'+j;body.castShadow=true;body.receiveShadow=true;g.add(body);
    const geo=new THREE.PlaneGeometry(p.width,p.height),uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setX(i,(uv.getX(i)+j)/2);
    // With the observer facing north, world-negative X is viewer-right.
    // Rotate the whole plane, including its UVs: south-facing, readable glyphs.
    geo.rotateY(Math.PI);
    const face=new THREE.Mesh(geo,material);face.position.set(x,cy,z-p.depth/2-.001);
    face.name=p.id+':text:'+j;face.receiveShadow=true;
    face.userData.baoheCouplet={...p,viewerSide:j?'left':'right'};g.add(face);
  }
}
