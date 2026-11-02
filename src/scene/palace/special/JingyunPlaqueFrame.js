import * as THREE from 'three';

// Own photograph 3907 supports the broad red/gold silhouette, not these dimensions,
// carved spirals, a measured mounting depth, or a Manchu reconstruction.
const OUTLINE = [
  [-1,.80],[-.96,.97],[-.76,1.04],[-.54,.98],[-.35,1.06],[-.13,1.06],[0,1.16],
  [.13,1.06],[.35,1.06],[.54,.98],[.76,1.04],[.96,.97],[1,.80],
  [.74,.76],[.62,.67],[.69,.48],[.66,.16],[.71,-.16],[.64,-.52],
  [.70,-.88],[.59,-1.20],[.47,-1.10],[.45,-.82],[.26,-.90],[0,-.95],
  [-.26,-.90],[-.45,-.82],[-.47,-1.10],[-.59,-1.20],[-.70,-.88],
  [-.64,-.52],[-.71,-.16],[-.66,.16],[-.69,.48],[-.62,.67],[-.74,.76],
];
const done = new WeakSet();
const canonical = g => g?.profile === 'jingyun' && g.x === -106.47 && g.z === 174.1 && g.rot === Math.PI/2;
const equalGeometry = (a,b) => Object.keys(a.attributes).join()===Object.keys(b.attributes).join() &&
  Object.entries(a.attributes).every(([k,v])=>v.itemSize===b.attributes[k].itemSize&&v.array.length===b.attributes[k].array.length&&v.array.every((x,i)=>Object.is(x,b.attributes[k].array[i]))) &&
  Boolean(a.index)===Boolean(b.index) && (!a.index || (a.index.count===b.index.count&&a.index.array.every((x,i)=>x===b.index.array[i])));
const pose = (m,x,y,z) => m?.isMesh && Math.abs(m.position.x-x)<1e-10 && Math.abs(m.position.y-y)<1e-10 && Math.abs(m.position.z-z)<1e-10 && !m.rotation.x&&!m.rotation.y&&!m.rotation.z&&m.scale.equals(new THREE.Vector3(1,1,1));
function solid(scale,depth,z) {
  const shape=new THREE.Shape(OUTLINE.map(([x,y])=>new THREE.Vector2(x*scale,y*scale)));
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:1});
  geo.translate(0,0,z);return geo;
}

/** Only the canonical original plaque backing changes; shared face/atlas is untouched. */
export function fitJingyunPlaqueFrame(kit,host,g,record) {
  if(!canonical(g))return false;
  if(done.has(host))throw new Error('Jingyun plaque frame already fitted');
  const {mesh,frame,text}=record??{},expectedBox=new THREE.BoxGeometry(.92,1.52,.1),expectedFace=new THREE.PlaneGeometry(.8,1.4);expectedFace.rotateY(Math.PI);
  let valid;
  try {
    valid=host?.parent===kit.root && host.position.equals(new THREE.Vector3(-106.47,0,174.1)) && host.rotation.y===Math.PI/2 && !host.rotation.x&&!host.rotation.z&&host.scale.equals(new THREE.Vector3(1,1,1)) &&
      kit.plaques.filter(p=>p===record).length===1 && kit.plaques.filter(p=>p.mesh.parent===host).length===1 && text==='景运门' && record.layout===undefined &&
      mesh?.parent===host&&frame?.parent===host&&pose(mesh,0,3.98,-4.49)&&pose(frame,0,3.98,-4.43)&&frame.material===kit.gold&&mesh.material===null&&
      equalGeometry(frame.geometry,expectedBox)&&equalGeometry(mesh.geometry,expectedFace);
  } finally {expectedBox.dispose();expectedFace.dispose();}
  if(!valid)throw new Error('Jingyun original plaque source mismatch');
  // The old .1m box entered the original beam. Fit only its new geometry into
  // the existing 5cm face-to-beam interval; do not move the face, host or beam.
  const outer=solid(1,.03,-.055),inner=solid(.955,.004,-.057);
  const red=new THREE.Mesh(inner,kit.lacquer);red.position.copy(frame.position);
  red.name='jingyun-frame-red-inset';red.userData.jingyunFrameInset=true;
  red.castShadow=false;red.receiveShadow=true;
  const old=frame.geometry;frame.geometry=outer;host.add(red);old.dispose();done.add(host);
  frame.userData.jingyunPlaqueFrame={scope:'coarse-own-photo-frame',source:'https://img.dpm.org.cn/Uploads/Picture/dc/3907%5B1024%5D.jpg',
    fit:'Outline, 2m width, 2.36m height and .03m backing depth are engineering approximations; no carved scrolls or Manchu added.',
    retained:'Original Han face, text, pose, atlas input, shared materials and all physical structures unchanged.'};
  return true;
}
