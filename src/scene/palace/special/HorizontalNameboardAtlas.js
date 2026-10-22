import * as THREE from 'three';

/** Only explicitly source-classified horizontal boards use this atlas. */
export function buildHorizontalNameboardAtlas(kit,records) {
 if(!records.length)return;
 const texts=[...new Set(records.map(p=>p.text))],CW=384,CH=128,cols=5;
 const canvas=document.createElement('canvas');canvas.width=2048;
 canvas.height=THREE.MathUtils.ceilPowerOfTwo(Math.max(Math.ceil(texts.length/cols)*CH,128));
 const c=canvas.getContext('2d'),cells=new Map();
 for(const [i,text] of texts.entries()) {
  const x=i%cols*CW,y=Math.floor(i/cols)*CH;
  c.fillStyle='#b48e30';c.fillRect(x,y,CW,CH);c.fillStyle=records.find(p=>p.text===text).background==='blue'?'#1e3a6b':'#151b1b';c.fillRect(x+8,y+8,CW-16,CH-16);
  c.strokeStyle='#e8c55a';c.lineWidth=3;c.strokeRect(x+13,y+13,CW-26,CH-26);
  c.fillStyle='#ecc95c';c.textAlign='center';c.textBaseline='middle';
  const chars=[...text],step=(CW-44)/chars.length;
  c.font=`bold ${Math.floor(Math.min(step*.86,CH*.62))}px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif`;
  chars.forEach((ch,k)=>c.fillText(ch,x+CW-22-step*(k+.5),y+CH/2));
  cells.set(text,[x/canvas.width,1-(y+CH)/canvas.height,CW/canvas.width,CH/canvas.height]);
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.5,metalness:.15,name:'kit_plaques'});
 mat.userData.nameboardLayout='horizontal';kit.owned.push(mat);(kit.ownedTextures??=[]).push(tex);
 for(const p of records){const[u,v,w,h]=cells.get(p.text),uv=p.mesh.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,u+uv.getX(i)*w,v+uv.getY(i)*h);
  p.mesh.material=mat;
 }
}
