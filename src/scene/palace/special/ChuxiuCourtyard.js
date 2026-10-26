import * as THREE from 'three';

/** Official relationship, reversible dimensions. No measurements are asserted. */
export const CHUXIU_COURTYARD_FIT=Object.freeze({
 id:'west-six/chuxiu-courtyard', profile:'chuxiu-return-corridor-fit-v1',
 eastX:83.2,westX:106.4,southZ:409.55,northZ:428.35,
 outerEast:81.8,innerEast:84.6,innerWest:105,outerWest:107.8,
 outerSouth:407.95,innerSouth:410.9,roofEndZ:427.6,
 floorY:.45,mainFloorY:.6,rampStartZ:425.6,rampEndZ:426.6,
 approachRun:.9,approachWidth:2.6,roofOuterY:5.35,roofInnerY:4.55,roofThickness:.12,columnRadius:.13,
});
const SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236486.html','https://www.dpm.org.cn/explore/building/236529.html']);
const tag=(o,role)=>{o.name=role;o.userData.role=role;return o;};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
/** Only the two existing estimated front wings. The original declaration is
 * retained for historical fixture replay; the fitted variant requires all keys. */
export function chuxiuWingOriginalDeclaration(item,index){
 if(item.positionFit===undefined)return item;
 const fit=item.positionFit;
 if(![25,26].includes(index)||item.kind!=='hall'||item.x!==(index===25?78.32:111.28)||item.rot!==(index===25?'west':'east')||item.z!==422||
   JSON.stringify(Object.keys(fit).sort())!==JSON.stringify(['deltaZ','previousZ','profile','status'])||fit.profile!=='chuxiu-side-access-fit-v1'||fit.previousZ!==423.1||fit.deltaZ!==-1.1||fit.status!=='estimated-coordinate-correction')throw Error('Chuxiu side access fitted declaration mismatch');
 const {positionFit,...original}=item;return {...original,z:423.1};
}
export function chuxiuCourtyardGeometry(zone){
 const p=CHUXIU_COURTYARD_FIT;
 const wingZ=zone.items?.[25]?.positionFit?422:423.1;
 for(const i of[25,26]){const a=zone.items?.[i];if(a?.positionFit)chuxiuWingOriginalDeclaration(a,i);if(a?.z!==wingZ)throw Error('Chuxiu wing pair fit mismatch');}
 if(zone.id!=='west-six')throw Error('Chuxiu courtyard belongs only to west-six');
 if(zone.courtyardProfile!==p.profile)throw Error('Chuxiu courtyard requires the explicit fitted profile');
 for(const expected of[
  {name:'储秀宫',x:94.8,z:434.3,w:27.1,d:13.8,ph:.6},
  {name:'翊坤宫后殿',x:94,z:401.5,w:26.2,d:12.9,ph:.45},
  {x:78.32,z:wingZ,w:11.2,d:7.04,ph:.45,rot:'west'},
  {x:111.28,z:wingZ,w:11.2,d:7.04,ph:.45,rot:'east'},
 ]){
  const item=zone.items?.find(i=>i.kind==='hall'&&(expected.name?i.name===expected.name:near(i.x,expected.x)&&near(i.z,expected.z)));
  if(!item||Object.entries(expected).some(([k,v])=>typeof v==='number'?!near(item[k],v):item[k]!==v))throw Error('Chuxiu courtyard retained envelope mismatch');
 }
 return {...p,wingZ,dimensionStatus:'official-topology-model-fit',sources:[...SOURCES],
  identities:{main:'储秀宫',south:'体和殿（翊坤宫后殿）',east:'储秀宫东配殿',west:'储秀宫西配殿'},
  routes:{
   loop:[[p.eastX,p.northZ],[p.eastX,p.southZ],[p.westX,p.southZ],[p.westX,p.northZ],[p.eastX,p.northZ]],
   entries:[[[94,399],[94,p.southZ],[94,418],[94.8,425],[94.8,433.5]],[[78.9,wingZ],[p.eastX,wingZ],[89,wingZ]],[[110.7,wingZ],[p.westX,wingZ],[100,wingZ]],[[79.7,412],[79.7,409],[79.7,395]],[[108.9,412],[108.9,409],[108.9,395]]],
  },
  limitations:['The connection topology is documented; widths, heights, mitered shed roofs, pillar positions and floor transitions are reversible model fits.','The two accessory halls retain their existing geometry and generic interior; the historic identities Yanghe/Suifu are not assigned to individual model sides without separate verification.','No measured survey, detailed tile inscription reconstruction, or browser visual acceptance is claimed.'],
 };
}

/** Add only the missing courtyard circulation. The four hall frames are untouched. */
export function buildChuxiuCourtyard(kit,zone){
 const g=chuxiuCourtyardGeometry(zone),p=CHUXIU_COURTYARD_FIT;
 if(kit.root.children.some(o=>o.userData.structure?.id===p.id))throw Error('Chuxiu courtyard already built');
 const f=kit.frame(0,0);f.name='chuxiu-return-corridor';f.userData.structure=g;
 const box=(role,mat,x0,x1,z0,z1,y0,y1)=>tag(kit.box(f,mat,x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2),role);
 const floor=(x0,x1,z0,z1)=>box('chuxiu-corridor-floor','stone_slab',x0,x1,z0,z1,0,p.floorY+.01);
 // Visual slabs stop at old slab edges; walkable support spans seams. Existing
 // side-platform/porch geometry is retained and is not covered by coplanar slabs.
 for(const [x0,x1,side]of[[p.outerEast,p.innerEast,'east'],[p.innerWest,p.outerWest,'west']]){
  floor(x0,x1,408.61,416.94);
  // A 1 mm landing overlap closes Float32 edge cracks without a perceptible height change.
  floor(side==='east'?82.4:x0,side==='east'?x1:107.2,416.94,p.rampStartZ+.001);
  kit.walkBox(f,x0,p.outerSouth,x1,p.rampStartZ,p.floorY);
  const ax=side==='east'?82.4:x0,bx=side==='east'?x1:107.2;
  const geo=new THREE.BufferGeometry();
  const a=p.rampStartZ,b=p.rampEndZ,y0=p.floorY+.01,y1=p.mainFloorY+.01;
  geo.setAttribute('position',new THREE.Float32BufferAttribute([ax,y0,a,bx,y0,a,ax,y1,b,bx,y1,b],3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,bx-ax,0,0,b-a,bx-ax,b-a],2));geo.setIndex([0,2,1,1,2,3]);geo.computeVertexNormals();
  tag(kit.mesh(f,geo,kit.lib.material('stone_slab'),0,0,0),'chuxiu-corridor-threshold-ramp');
  kit.walkRamp(f,x0,x1,a,b,p.floorY,p.mainFloorY);
 }
 floor(p.innerEast,p.innerWest,408.61,p.innerSouth);
 kit.walkBox(f,p.innerEast,p.outerSouth,p.innerWest,p.innerSouth,p.floorY);
 // Three shallow paved approaches give the raised gallery a legible transition
 // to the retained ground-level open court. They do not move any hall threshold.
 for(const[x,z,rot,width]of[[p.innerEast,g.wingZ,Math.PI/2,p.approachWidth],[p.innerWest,g.wingZ,-Math.PI/2,p.approachWidth],[94,p.innerSouth,0,4.2]]){
  const stepFrame=new THREE.Group();stepFrame.position.set(x,0,z);stepFrame.rotation.y=rot;f.add(stepFrame);stepFrame.updateMatrixWorld(true);
  for(let i=0;i<3;i++){
   const top=p.floorY*(3-i)/4,run=p.approachRun/3;
   tag(kit.box(stepFrame,'stone_slab',width,top,run,0,top/2,(i+.5)*run),'chuxiu-court-approach-step');
  }
  kit.walkRamp(stepFrame,-width/2,width/2,0,p.approachRun,p.floorY,0);
 }
 // One coherent three-sided shed roof: miter edges coincide exactly, so corner
 // turns are covered without stacking two crossing gable roofs or valley holes.
 const panels=[
  [[p.outerEast,p.outerSouth],[p.outerWest,p.outerSouth],[p.innerEast,p.innerSouth],[p.innerWest,p.innerSouth]],
  [[p.outerEast,p.outerSouth],[p.outerEast,p.roofEndZ],[p.innerEast,p.innerSouth],[p.innerEast,p.roofEndZ]],
  [[p.outerWest,p.roofEndZ],[p.outerWest,p.outerSouth],[p.innerWest,p.roofEndZ],[p.innerWest,p.innerSouth]],
 ];
 for(const panel of panels){
  const positions=[],uv=[],idx=[],segments=4;
  for(let j=0;j<=segments;j++){
   const t=j/segments,y=p.roofOuterY+(p.roofInnerY-p.roofOuterY)*(1.2*t-.2*t*t);
   for(let i=0;i<2;i++){
    const a=panel[i],b=panel[i+2],x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
    positions.push(x,y,z);uv.push(i*Math.hypot(panel[1][0]-panel[0][0],panel[1][1]-panel[0][1]),t*2.8);
   }
   if(j<segments){const k=j*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  // Double-sided shared tile is not mutated: underside uses a separate reversed
  // surface and the shared rafters material, with its own thickness offset.
  const normal=geo.attributes.normal;if(normal.getY(0)<0){for(let k=0;k<idx.length;k+=3)[idx[k+1],idx[k+2]]=[idx[k+2],idx[k+1]];geo.setIndex(idx);geo.computeVertexNormals();}
  tag(kit.mesh(f,geo,kit.lib.material('roof_tile'),0,0,0),'chuxiu-corridor-roof');
  const underside=geo.clone();underside.translate(0,-p.roofThickness,0);const reversed=[...idx];for(let k=0;k<reversed.length;k+=3)[reversed[k+1],reversed[k+2]]=[reversed[k+2],reversed[k+1]];underside.setIndex(reversed);underside.computeVertexNormals();tag(kit.mesh(f,underside,kit.lib.material('rafters'),0,0,0),'chuxiu-corridor-roof');
 }
 // Fascias and beams follow the inner court edge, never cross a door or a turn.
 for(const x of[p.innerEast,p.innerWest])box('chuxiu-corridor-beam','caihua_beam',x-.13,x+.13,p.innerSouth,p.roofEndZ,4.18,4.55);
 box('chuxiu-corridor-beam','caihua_beam',p.innerEast,p.innerWest,p.innerSouth-.13,p.innerSouth+.13,4.18,4.55);
 for(const x of[p.outerEast,p.outerWest])box('chuxiu-corridor-outer-fascia','wood_column',x-.07,x+.07,p.outerSouth,p.roofEndZ,5.15,5.35);
 box('chuxiu-corridor-outer-fascia','wood_column',p.outerEast,p.outerWest,p.outerSouth-.07,p.outerSouth+.07,5.15,5.35);
 const posts=[];
 for(const x of[p.innerEast,p.innerWest])for(const z of[411.5,415,418.5,421,425])posts.push([x,z]);
 // The broad central Tihe axis remains completely open.
 for(const x of[87.8,91,97,101.5])posts.push([x,p.innerSouth]);
 for(const[x,z]of posts){
  const r=p.columnRadius,y=p.floorY,top=4.2;
  tag(kit.mesh(f,new THREE.CylinderGeometry(r,r*1.08,top-y,8),kit.lib.material('wood_column'),x,(y+top)/2,z),'chuxiu-corridor-column');
  box('chuxiu-corridor-column-base','stone_slab',x-.21,x+.21,z-.21,z+.21,y,y+.14);
  kit.col(f,x-r,y,z-r,x+r,top,z+r);
 }
 let meshes=0,triangles=0;const mats=new Set();f.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;mats.add(o.material);}});
 g.budget={triangles,meshes,materials:mats.size};
 return{f,g};
}
