import * as THREE from 'three';

/** Photo-relative silhouette candidate. Both museum views show three panels and
 * a lobed central crest; finishes/display dates differ. No survey claim. */
export const BAOHE_THRONE_SCREEN = Object.freeze({
  id: 'baohe-three-panel-screen-photo-registration',
  width: 4.8, height: 3.65, depth: .3,
  ratioBand: Object.freeze([1.3,1.4]),
  status: 'PHOTO_RELATIVE_PROPORTIONS_WITH_RETAINED_BASE_AND_Z_NOT_CURRENT_MEASUREMENT',
  appearance: 'SELECTED_MUSEUM_CONTRIBUTED_VIEW_CAPTURE_DATE_UNKNOWN',
  source: 'https://artsandculture.google.com/asset/hall-of-preserving-harmony-baohe-dian-interior-the-palace-museum/pgFXua5sp2QCug?hl=zh-cn',
  trim: .025,
});
const center=[[-.25,0],[.25,0],[.25,.80],[.17,.84],[.10,.83],[0,.85],[-.10,.83],[-.17,.84],[-.25,.80]];
const side=[[-.5,0],[-.25,0],[-.25,.72],[-.39,.72],[-.455,.70],[-.48,.66],[-.5,.66]];
const centerCrest=[[-.30,.80],[-.30,.89],[-.26,.93],[-.16,.94],[-.09,.975],[0,1],[.09,.975],[.16,.94],[.26,.93],[.30,.89],[.30,.80]];
const sideCrest=[[-.5,.69],[-.5,.77],[-.445,.755],[-.39,.775],[-.29,.745],[-.25,.71],[-.25,.69]];
const mirror=poly=>poly.map(([x,y])=>[-x,y]).reverse();
function shape(poly,w,h){const s=new THREE.Shape();poly.forEach(([x,y],i)=>s[i?'lineTo':'moveTo'](x*w,y*h));s.closePath();return s;}
function faceSouth(geo){const a=geo.index.array;for(let i=0;i<a.length;i+=3){const n=a[i+1];a[i+1]=a[i+2];a[i+2]=n;}geo.computeVertexNormals();return geo;}
function scaledInside(poly,amount){const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length,cy=(Math.min(...poly.map(p=>p[1]))+Math.max(...poly.map(p=>p[1])))/2;return poly.map(([x,y])=>[cx+(x-cx)*(1-amount),cy+(y-cy)*(1-amount)]);}
export function buildBaoheThroneScreen(b,g,{x0,ty,tz,depth,thW}) {
  if(![x0,ty,tz,depth,thW].every(Number.isFinite)||depth<=0||thW<6)throw Error('Baohe screen requires the retained dais registration');
  const p=BAOHE_THRONE_SCREEN,w=p.width,h=p.height,z=tz+depth*.32;
  const red=b.ownMat('lacquer',{color:0x7a1d12,roughness:.4,metalness:.1});
  const gold=b.ownMat('baohe_screen_gold',{name:'baohe_screen_gold',color:0xd2ac57,roughness:.58,metalness:.35});
  const light=screenFaceMaterial(b);
  const put=(geo,mat,id,offset=0)=>{const m=new THREE.Mesh(geo,mat);m.name=p.id+':'+id;m.position.set(x0,ty,z+offset);m.castShadow=true;m.receiveShadow=true;m.userData.baoheScreen={id,...p};g.add(m);return m;};
  const solid=(poly,mat,id,offset=0)=>{const geo=new THREE.ExtrudeGeometry(shape(poly,w,h),{depth:p.depth,bevelEnabled:false,curveSegments:1,steps:1});geo.translate(0,0,-p.depth/2);return put(geo,mat,id,offset);};
  const face=(poly,id)=>{const geo=faceSouth(new THREE.ShapeGeometry(shape(poly,w,h)));const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h);return put(geo,light,id,-p.depth/2-.002);};
  // A separate plain backdrop is visible in both references. Retain the old
  // slab dimensions, placed .3m behind the new profile as an explicitly
  // provisional depth separation, not measured attachment/joinery.
  const oldGold=b.ownMat('gold',{color:0xc9a13b,metalness:.85,roughness:.3});
  const backdrop=put(new THREE.BoxGeometry(Math.min(thW*.7,6),3.2,.3),oldGold,'separate-backdrop',.3);backdrop.position.y+=1.6;
  const outlines=[side,center,mirror(side)];
  outlines.forEach((poly,i)=>{solid(poly,red,'frame-'+i);face(poly,'painted-panel-'+i);});
  solid(centerCrest,gold,'central-lobed-crest',-.02);solid(sideCrest,gold,'left-curled-crest',-.02);solid(mirror(sideCrest),gold,'right-curled-crest',-.02);
  return {...p,x0,baseY:ty,z};
}

function screenFaceMaterial(b){
 const key='baohe_screen_painted_faces';if(b._own.has(key))return b._own.get(key);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');c.fillStyle='#74251c';c.fillRect(0,0,512,512);
 const paint=(poly,color)=>{c.fillStyle=color;c.beginPath();poly.forEach(([x,y],i)=>c[i?'lineTo':'moveTo']((x+.5)*512,(1-y)*512));c.closePath();c.fill();};
 for(const poly of[side,center,mirror(side)]){paint(scaledInside(poly,.065),'#c9a04a');paint(scaledInside(poly,.105),'#74251c');}
 paint([[-.215,.07],[.215,.07],[.215,.70],[-.215,.70]],'#c7b18a');
 const panel=[[-.47,.07],[-.278,.07],[-.278,.68],[-.39,.68],[-.43,.665],[-.47,.62]];paint(panel,'#c7b18a');paint(mirror(panel),'#c7b18a');
 paint([[-.18,.748],[.18,.748],[.18,.783],[.10,.792],[0,.805],[-.10,.792],[-.18,.783]],'#c7b18a');
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const material=b.ownMat(key,{name:key,map:texture,roughness:.78,metalness:.05});let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;texture.dispose();}});return material;
}
/** Conservative self-authored chair contour fitted to the selected photograph.
 * It is not a carved-detail copy or verification of current movable display. */
export function buildBaoheThroneChair(b,g,{x0,ty,tz}){
 if(![x0,ty,tz].every(Number.isFinite))throw Error('Finite Baohe chair anchor required');
 const gold=b.ownMat('baohe_screen_gold',{name:'baohe_screen_gold',color:0xd2ac57,roughness:.58,metalness:.35});
 const put=(geo,id,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,gold);m.name=BAOHE_THRONE_SCREEN.id+':chair-'+id;m.position.set(x0+x,ty+y,tz+z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 put(new THREE.BoxGeometry(1.8,.22,1.3),'seat',0,.51,0);
 for(const x of[-.70,.70])for(const z of[-.46,.46]){const geo=new THREE.BoxGeometry(.17,.45,.17),a=[...geo.index.array];const hidden=geo.groups.filter(q=>q.materialIndex===2||q.materialIndex===3);geo.setIndex(a.filter((_,i)=>!hidden.some(q=>i>=q.start&&i<q.start+q.count)));geo.clearGroups();put(geo,'leg:'+x+','+z,x,.215,z);}
 const back=[[-.85,.55],[.85,.55],[.85,1.5],[.35,1.7],[0,1.9],[-.35,1.7],[-.85,1.5]];const bg=new THREE.ExtrudeGeometry(shape(back,1,1),{depth:.18,bevelEnabled:false,curveSegments:1});bg.translate(0,0,-.09);put(bg,'shaped-back',0,0,.55);
 // The forward arm upright meets the seat; no unsupported floating rail.
 const arm=[[-.5,.45],[-.5,1.0],[.55,1.10],[.55,.95],[-.33,.84],[-.33,.45]].map(([z,y])=>[-z,y]);
 for(const x of[-.83,.83]){const geo=new THREE.ExtrudeGeometry(shape(arm,1,1),{depth:.14,bevelEnabled:false,curveSegments:1});geo.translate(0,0,-.07);geo.rotateY(Math.PI/2);put(geo,'arm:'+x,x,0,0);}
}

export const BAOHE_INTERIOR_PLAQUE = Object.freeze({width:4.2,height:1.9,canvasLeftToRight:'極有建皇',aspectBand:Object.freeze([2.15,2.25]),appearance:'SELECTED_UNDATED_MUSEUM_PHOTO_NOT_CALLIGRAPHIC_FACSIMILE'});
export function buildBaoheInteriorPlaque(b){
 const p=BAOHE_INTERIOR_PLAQUE,key='baohe_interior_plaque';
 if(!b._own.has(key)){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.round(512*p.height/p.width);const c=canvas.getContext('2d'),h=canvas.height;
  c.fillStyle='#635b43';c.fillRect(0,0,512,h);c.fillStyle='#8e3423';c.fillRect(10,10,492,h-20);c.fillStyle='#a98e54';c.fillRect(16,16,480,h-32);c.fillStyle='#cfaa52';c.fillRect(36,Math.round(h*.13),440,Math.round(h*.74));
  c.fillStyle='#211d17';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(Math.min(h*.59,110))+'px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
  [...p.canvasLeftToRight].forEach((ch,i)=>c.fillText(ch,91+i*110,h*.51,104));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const material=b.ownMat(key,{name:key,map:texture,roughness:.8,metalness:.1});let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;texture.dispose();}});
 }
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(p.width,p.height,.15),b._own.get(key));mesh.userData.noMerge=true;mesh.userData.baohePlaque=p;return mesh;
}
