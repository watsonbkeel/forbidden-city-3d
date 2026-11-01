import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const FIT='PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_COURT_FIT=Object.freeze({x:-161,z:-365,width:18,depth:9.6,floor:0,eave:5.1,ridge:8.3,gateZ:-15,courtHalfWidth:12});
export const NEIGE_COURT_SOURCES=Object.freeze([
 'https://www.dpm.org.cn/explore/building/236523.html',
 'https://img.dpm.org.cn/Uploads/Picture/dc/8036.jpg',
 'https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf',
 'https://img.dpm.org.cn/static/themes/image/xf/map3.jpg',
]);
const fail=()=>{throw Error('Neige court requires original outer-east registration and a fresh untransformed CourtKit');};
const isIdentity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));

/** A source-bounded main-hall/front-gate court, not the eleven historical
 * functional names. Doors are visibly folded for interaction, not a claim of
 * present museum access. No guessed room inventory or lost Manbentang shell.
 * Every collider is derived from the final visible Float32 geometry; roof
 * broadphase boxes never stand in for the empty air under a pitched roof. */
export function buildNeigeCourt(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds;
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!isIdentity(kit.root)||kit.root.children.some(o=>o.userData?.structure?.id==='neige-main-court')||!Array.isArray(kit.colliders)||!Array.isArray(kit.owned)||!Array.isArray(kit.mapItems)||[kit.root.children,kit.colliders,kit.owned,kit.mapItems].some(a=>Object.isFrozen(a)||!Object.isExtensible(a)))fail();
 const p=NEIGE_COURT_FIT,frame=new T.Group();frame.name='neige-main-court';frame.position.set(p.x,0,p.z);
 const geometries=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.88});materials.push(m);return m;};
 const red=material('neige-red',0x8f2f22),gray=material('neige-gray-tile',0x737777),white=material('neige-white-plaster',0xc7c4b8),glass=material('neige-dark-window',0x27332e),stone=material('neige-stone',0x89867d),brick=material('neige-brick',0x79736a),wood=material('neige-wood',0x554035),yellow=kit.lib.material('roof_tile');
 const add=(geo,mat,role,parts)=>{geometries.push(geo);const m=new T.Mesh(geo,mat);m.name='neige-'+role;m.castShadow=m.receiveShadow=true;m.userData.neigeRole=role;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>add(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{
  frame.updateMatrixWorld(true);const a=[];
  for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const k=ix?ix.getX(i):i,v=new T.Vector3().fromBufferAttribute(pos,k).applyMatrix4(m.matrixWorld);a.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}
  const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));
  try{const shape=triangleInstance(createTriangleTemplate(geo),[0,0,0],'neige-main-court:'+id),c=shape.box.clone();c.triangleSupport=shape;c.neigeCourt={id,objectId:'FC-E09ED30C27'};owners.push(c);for(const m of parts)m.userData.neigeOwner=shape.id;}finally{geo.dispose();}
 };
 const oneBox=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 // Closed prism from a counter-clockwise (z,y) section, extruded along X.
 // THREE's extrusion supplies actual end faces and a finite roof thickness.
 const prism=(points,x0,x1)=>{const shape=new T.Shape();points.forEach(([z,y],i)=>shape[i?'lineTo':'moveTo'](z,y));shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const roof=(id,cx,cz,width,halfDepth,eave,ridge,mat)=>{
  const parts=[],n=18,points=[],curve=z=>eave+(ridge-eave)*(.3*(1-Math.abs(z)/halfDepth)+.7*(1-Math.abs(z)/halfDepth)**2);
  for(let i=0;i<=n;i++){const z=-halfDepth+2*halfDepth*i/n;points.push([z,curve(z)]);}
  const section=[...points,...points.toReversed().map(([z,y])=>[z,y-.20])];
  const g=prism(section,cx-width/2,cx+width/2);g.translate(0,0,cz);add(g,mat,id+'-sheet',parts);
  // Low tile rolls: source-visible rhythm, not a tile census. Each roll is
  // a closed tube with cap disks, included in the same exact roof owner.
  const count=Math.round(width/.30);
  for(let i=0;i<=count;i++){
   const x=cx-width/2+.04+(width-.08)*i/count;
   const path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.026,cz-z)));
   const tube=new T.TubeGeometry(path,18,.045,5,false);add(tube,mat,id+'-tile-roll',parts);
   for(const t of[0,1]){const center=path.getPoint(t),tangent=path.getTangent(t).multiplyScalar(t===0?-1:1),disc=new T.CircleGeometry(.045,5);disc.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),tangent)));disc.translate(...center.toArray());add(disc,mat,id+'-tile-end',parts);}
  }
  box(parts,id+'-ridge',mat,width+.16,.25,.27,cx,ridge+.11,cz);
  // Plain upturned ridge terminals: no invented dragon or animal carving.
  for(const x of[cx-width/2,cx+width/2]){box(parts,id+'-terminal',mat,.19,.46,.30,x,ridge+.26,cz);}
  own(parts,id);
 };
 const window=(id,cx,cz,w,bottom,top)=>{
  const parts=[],h=top-bottom,cy=(top+bottom)/2;
  box(parts,'window-backing',glass,w-.10,h-.10,.075,cx,cy,cz+.025);
  for(const x of[cx-w/2,cx+w/2])box(parts,'window-stile',red,.09,h,.13,x,cy,cz);
  for(const y of[bottom,top])box(parts,'window-rail',red,w,.09,.13,cx,y,cz);
  for(let i=1;i<Math.ceil(w/.19);i++)box(parts,'window-lattice-vertical',red,.032,h-.12,.10,cx-w/2+i*w/Math.ceil(w/.19),cy,cz-.025);
  for(let i=1;i<6;i++)box(parts,'window-lattice-horizontal',red,w-.12,.032,.10,cx,bottom+h*i/6,cz-.025);
  own(parts,id);
 };
 const foldedLeaf=(id,x,z,width,bottom,height)=>{
  const parts=[];box(parts,'folded-door-leaf',red,.11,height,width,x,bottom+height/2,z);
  for(const zz of[z-width/2+.07,z+width/2-.07])box(parts,'door-leaf-edge',wood,.14,height-.08,.055,x,bottom+height/2,zz);
  for(const y of[bottom+.12,bottom+height*.40,bottom+height-.12])box(parts,'door-leaf-rail',wood,.14,.055,width-.08,x,y,z);
  own(parts,id);
 };
 try{
  oneBox('court-visible-paving',stone,24,.06,21.2,0,-.03,-4.4);
  oneBox('main-ground-level-foundation',brick,19.2,.36,10.4,0,-.18,0);
  oneBox('main-visible-floor',stone,19.24,.06,10.44,0,-.03,0);
  // The source8036 foreground gate hides the main threshold/platform. A flat
  // visible approach is an explicitly approved interactive fit; do not invent
  // unsourced stairs or patch generic physics with invisible support planes.
  oneBox('main-rear-wall',white,19.2,5.1,.36,0,2.55,4.62);
  for(const s of[-1,1]){
   oneBox('main-side-wall-'+s,white,.36,5.1,9.6,s*9.42,2.55,0);
   const parts=[],section=[[-4.8,4.88],[4.8,4.88]];
   for(let i=0;i<=18;i++){const z=4.8-9.6*i/18,q=1-Math.abs(z)/5.55;section.push([z,5.1+3.2*(.3*q+.7*q*q)-.205]);}
   add(prism(section,s<0?-9.6:9.24,s<0?-9.24:9.6),white,'main-gable',parts);own(parts,'main-gable-'+s);
  }
  for(const x of[-9,-3,3,9]){const parts=[];add(new T.CylinderGeometry(.24,.27,5.1,12).translate(x,2.55,-4.65),red,'front-column',parts);own(parts,'front-column-'+x);}
  for(const x of[-6,6]){oneBox('facade-lower-panel-'+x,red,5.50,1.41,.16,x,.705,-4.65);window('facade-lattice-'+x,x,-4.65,5.50,1.41,4.61);}
  oneBox('facade-head',red,18,.35,.30,0,4.925,-4.65);
  for(const s of[-1,1]){oneBox('central-door-jamb-'+s,red,.16,3.56,.22,s*1.69,1.78,-4.65);window('central-side-window-'+s,s*2.32,-4.65,1.02,1.41,4.61);oneBox('central-side-sill-'+s,red,1.02,1.41,.16,s*2.32,.705,-4.65);}
  window('central-upper-window',0,-4.65,3.22,3.57,4.61);
  for(const s of[-1,1])for(let k=0;k<2;k++)foldedLeaf('main-folded-leaf-'+s+'-'+k,s*1.75,-4.20+k*.77,.77,.03,3.47);
  // Front and rear beams remain visible inside; there is no invented caisson.
  oneBox('main-front-beam',wood,18,.25,.30,0,4.88,-4.30);
  oneBox('main-rear-beam',wood,18,.25,.30,0,4.88,4.30);
  roof('main-yellow-hard-gable',0,0,19.2,5.55,5.1,8.3,yellow);
  for(const s of[-1,1]){
   oneBox('court-front-base-'+s,brick,8.7,.42,.50,s*7.65,.21,-15);
   oneBox('court-front-plaster-'+s,white,8.7,1.62,.44,s*7.65,1.23,-15);
   oneBox('court-front-cap-'+s,gray,8.82,.16,.67,s*7.65,2.12,-15);
   oneBox('court-side-base-'+s,brick,.50,.42,21.2,s*12,.21,-4.4);
   oneBox('court-side-plaster-'+s,white,.44,1.62,21.2,s*12,1.23,-4.4);
   oneBox('court-side-cap-'+s,gray,.67,.16,21.3,s*12,2.12,-4.4);
  }
  oneBox('court-rear-base',brick,24,.42,.50,0,.21,6.2);
  oneBox('court-rear-plaster',white,24,1.62,.44,0,1.23,6.2);
  oneBox('court-rear-cap',gray,24.1,.16,.67,0,2.12,6.2);
  // The foreground hanging gate in8036 is NOT the different red-wall south
  // connecting gate photographed in the2008 article. Keep those identities apart.
  for(const s of[-1,1]){
   oneBox('gate-side-pier-'+s,white,1.40,2.85,1.80,s*2.40,1.425,-15);
   oneBox('gate-jamb-'+s,red,.18,2.85,.22,s*1.61,1.425,-15.8);
   oneBox('gate-red-return-'+s,red,.15,2.85,1.82,s*1.70,1.425,-15);
   const parts=[];add(new T.CylinderGeometry(.095,.115,.55,10).translate(s*2.45,2.98,-16.38),red,'gate-hanging-post',parts);add(new T.CylinderGeometry(.14,.07,.19,10).translate(s*2.45,2.61,-16.38),red,'gate-plain-pendant',parts);own(parts,'gate-hanging-'+s);
   for(let k=0;k<2;k++)foldedLeaf('gate-screen-leaf-'+s+'-'+k,s*1.78,-15.48+k*.72,.72,.06,2.62);
  }
  oneBox('gate-head-beam',red,6.40,.30,.28,0,2.97,-16.05);
  roof('gate-gray-roof',0,-15,7.20,2.10,3.13,4.38,gray);
 }catch(error){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw error;}
 const meta={id:'neige-main-court',objectId:'FC-E09ED30C27',name:'内阁大堂',...p,bays:3,mainHallCount:1,frontGateLeafCount:4,interiorFurnishings:0,dimensions:FIT,sourceUrls:[...NEIGE_COURT_SOURCES],photographyDate:null,openState:'VISIBLE_FOLDED_LEAVES_INTERACTIVE_FIT_NOT_CURRENT_PUBLIC_ADMISSION',wholeObjectAccepted:false,scope:'MAIN_HALL_FRONT_GATE_AND_SHORT_COURT_ONLY',withheldIdentities:['FC-4A84B24027','FC-F539E5D64D','FC-32A68E9C3E','FC-2C486A3479','FC-15E0B02776','FC-12AA4B4366','FC-93081154E4','FC-DA0F70A4C4','FC-6555093DAA'],unknown:['surveyed location and dimensions','main threshold and stairs obscured: flat ground-level approach is an interactive fit','complete present side/rear courtyard configuration','interior fittings and room layout','gate carving details and original open-state','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;
 kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);
 kit.mapItems.push({kind:'hall',name:'内阁大堂',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,sourceStatus:FIT,objectId:meta.objectId});
 return{frame,meta};
}
