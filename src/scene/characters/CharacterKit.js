const SLEEP_EYES = Symbol('sleeping-eyelids');
import * as THREE from 'three';

/** Qing-themed interpretation, not a reconstruction of a dated individual costume.
 *  One opaque, vertex-coloured merged mesh per template / pose / LOD.
 *  Metres, Y up, facing +Z; bare-headed standing calibration height 1.70 m.
 */
export const CHARACTER_POSES = Object.freeze(['standing', 'seated', 'kneeling', 'sleeping']);
export const CHARACTER_TEMPLATES = Object.freeze({
  'emperor-ceremonial': { label:'Imperial ceremonial', robe:0xc9982d, trim:0x332c25, lining:0x87702e, accent:0xe7c66a, hat:'court', motif:'roundel', silhouette:'imperial', evidenceRefs:['H1','H3'] },
  'official-ceremonial': { label:'Court official', robe:0x253b55, trim:0x182331, lining:0x546b78, accent:0xc5ab67, hat:'court', motif:'rank-square', silhouette:'official', evidenceRefs:['H1','H3'] },
  'ritual-attendant': { label:'Ritual attendant', robe:0x703b36, trim:0x30282b, lining:0x90584a, accent:0xb99b5f, hat:'court', motif:'border', silhouette:'attendant', evidenceRefs:['H1'] },
  'consort-daily': { label:'Unnamed consort', robe:0x315e58, trim:0x234a47, lining:0x5a7770, accent:0xb89b60, hat:'dressed-hair', motif:'floral', silhouette:'female', evidenceRefs:['H4','H6'] },
  'maid-daily': { label:'Palace maid', robe:0x82939e, trim:0x354a59, lining:0x566874, accent:0x8b9ca5, hat:'simple-hair', motif:'border', silhouette:'maid', evidenceRefs:['H4','H6'] },
  'eunuch-daily': { label:'Palace attendant', robe:0x646d7c, trim:0x292f3c, lining:0x8c9296, accent:0xa5a086, hat:'cap', motif:'border', silhouette:'attendant', evidenceRefs:['H6'] },
  'guard-duty': { label:'Gate guard', robe:0x35475d, trim:0x1f2935, lining:0x596576, accent:0xb89955, hat:'guard', motif:'studs', silhouette:'guard', evidenceRefs:['H1'] },
});

const SKIN=0xbe8e6d, SKIN_LIGHT=0xd0a281, HAIR=0x201c1b, SOLE=0x695b48;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const scaleColor=(hex,f)=>{const c=new THREE.Color(hex);c.multiplyScalar(f);return c;};
// A work unit is one emitted vertex, one emitted face (at most two triangles),
// one scalar copy, or one normal/bounds/decoration element. Small authored
// contours (at most 20 points) are triangulated in their own isolated step.
const MAX_WORK_UNITS=128;
class Builder {
  constructor(lod=0){this.lod=lod;this.p=[];this.c=[];this.part=[];this.piv=[];this.w=[];this.tw=[];this.idx=[];this.units=0;this.work={};this.phase='mesh';}
  record(kind,count=1){this.units++;this.work[kind]=(this.work[kind]??0)+count;return this.units===MAX_WORK_UNITS;}
  progress(){const p={kind:'character-geometry',phase:this.phase,workUnits:this.units,maxWorkUnits:MAX_WORK_UNITS,work:this.work};this.units=0;this.work={};return p;}
  *phaseStart(phase){if(this.units)yield this.progress();this.phase=phase;}
  vertex(p,color,rig={}) {const i=this.p.length/3;this.p.push(...p);const c=color.isColor?color:new THREE.Color(color);this.c.push(c.r,c.g,c.b);this.part.push(rig.part??0);this.piv.push(...(rig.pivot??[0,0,0]));this.w.push(typeof rig.weight==='function'?rig.weight(p):(rig.weight??1));this.tw.push(typeof rig.torsoWeight==='function'?rig.torsoWeight(p):(rig.torsoWeight??0));this.record('vertices');return i;}
  tri(a,b,c){this.idx.push(a,b,c);this.record('triangles');}
  quad(a,b,c,d){this.idx.push(a,b,d,b,c,d);this.record('triangles',2);}
  *loft(rings,segments,color,rig={},pleats=0) {
    if(this.lod===2&&rings.length>3)rings=[rings[0],rings[Math.floor(rings.length/2)],rings[rings.length-1]];
    const start=this.p.length/3;
    for(let j=0;j<rings.length;j++){const r=rings[j];for(let i=0;i<segments;i++){const a=2*Math.PI*i/segments;const f=1+pleats*Math.cos(a*12+(j%2)*.14);const p=[(r.x??0)+r.rx*Math.sin(a)*f,r.y+(r.wave??0)*Math.cos(a*12),(r.z??0)+r.rz*Math.cos(a)*f];this.vertex(p,scaleColor(color,1+.025*Math.cos(a*12)),rig);if(this.units===MAX_WORK_UNITS)yield this.progress();}}
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const ni=(i+1)%segments;this.quad(start+j*segments+i,start+j*segments+ni,start+(j+1)*segments+ni,start+(j+1)*segments+i);if(this.units===MAX_WORK_UNITS)yield this.progress();}
    for(const [j,flip] of [[0,true],[rings.length-1,false]]){const r=rings[j];const c=this.vertex([r.x??0,r.y,r.z??0],color,rig);if(this.units===MAX_WORK_UNITS)yield this.progress();for(let i=0;i<segments;i++){const a=start+j*segments+i,b=start+j*segments+(i+1)%segments;flip?this.tri(c,b,a):this.tri(c,a,b);if(this.units===MAX_WORK_UNITS)yield this.progress();}}
  }
  *tube(points,radii,segments,color,rig={},caps=true) {
    if(this.lod===2&&points.length>3){const mid=Math.floor(points.length/2);radii=[radii[0],radii[mid],radii[radii.length-1]];points=[points[0],points[mid],points[points.length-1]];}
    const start=this.p.length/3;
    for(let j=0;j<points.length;j++){const p=points[j];const prev=points[Math.max(0,j-1)],next=points[Math.min(points.length-1,j+1)],t=new THREE.Vector3(...next).sub(new THREE.Vector3(...prev)).normalize();let u=new THREE.Vector3(0,0,1).cross(t).normalize();if(u.length()<.1)u.set(1,0,0);const v=new THREE.Vector3().crossVectors(t,u).normalize();const r=radii[j];for(let i=0;i<segments;i++){const a=2*Math.PI*i/segments;this.vertex([p[0]+u.x*Math.cos(a)*r[0]+v.x*Math.sin(a)*r[1],p[1]+u.y*Math.cos(a)*r[0]+v.y*Math.sin(a)*r[1],p[2]+u.z*Math.cos(a)*r[0]+v.z*Math.sin(a)*r[1]],scaleColor(color,1+.035*Math.cos(a*6)),rig);if(this.units===MAX_WORK_UNITS)yield this.progress();}}
    for(let j=0;j<points.length-1;j++)for(let i=0;i<segments;i++){this.quad(start+j*segments+i,start+j*segments+(i+1)%segments,start+(j+1)*segments+(i+1)%segments,start+(j+1)*segments+i);if(this.units===MAX_WORK_UNITS)yield this.progress();}
    if(caps)for(const [j,flip]of[[0,true],[points.length-1,false]]){const c=this.vertex(points[j],color,rig);if(this.units===MAX_WORK_UNITS)yield this.progress();for(let i=0;i<segments;i++){const a=start+j*segments+i,b=start+j*segments+(i+1)%segments;flip?this.tri(c,b,a):this.tri(c,a,b);if(this.units===MAX_WORK_UNITS)yield this.progress();}}
  }
  *ribbon(points,width,color,rig={}) {for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;const ox=-dy/l*width/2,oy=dx/l*width/2;const ids=[];for(const p of [[a[0]+ox,a[1]+oy,a[2]],[a[0]-ox,a[1]-oy,a[2]],[b[0]-ox,b[1]-oy,b[2]],[b[0]+ox,b[1]+oy,b[2]]]){ids.push(this.vertex(p,color,rig));if(this.units===MAX_WORK_UNITS)yield this.progress();}this.quad(...ids);if(this.units===MAX_WORK_UNITS)yield this.progress();}}
  *patch(points,color,rig={}) {
    // All authored contours are <= 20 points. Refuse unbounded future additions.
    if(points.length>20)throw new Error('Character patch exceeds incremental contour bound');
    const ids=[],contour=[];
    for(const p of points){ids.push(this.vertex(p,color,rig));contour.push(new THREE.Vector2(p[0],p[1]));if(this.units===MAX_WORK_UNITS)yield this.progress();}
    yield* this.phaseStart('triangulate');
    const triangles=THREE.ShapeUtils.triangulateShape(contour,[]);this.record('contourPoints',points.length);yield this.progress();
    this.phase='mesh';
    for(const tri of triangles){this.tri(ids[tri[0]],ids[tri[1]],ids[tri[2]]);if(this.units===MAX_WORK_UNITS)yield this.progress();}
  }
  *geometry(){
    yield* this.phaseStart('attributes');
    const attrs={};
    for(const [name,source,size] of [['position',this.p,3],['color',this.c,3],['characterPart',this.part,1],['characterPivot',this.piv,3],['characterWeight',this.w,1],['characterTorsoWeight',this.tw,1]]){
      // Allocate once, then copy scalars in bounded steps. The empty attribute
      // constructor preserves Float32BufferAttribute identity without recopying.
      if(this.units)yield this.progress();
      const array=new Float32Array(source.length);this.record('allocations');yield this.progress();
      for(let i=0;i<source.length;i++){array[i]=source[i];if(this.record('attributeScalars'))yield this.progress();}
      const attribute=new THREE.Float32BufferAttribute(0,size);attribute.array=array;attribute.count=array.length/size;attrs[name]=attribute;
    }
    let needsUint32=false;
    for(let i=0;i<this.idx.length;i++){if(this.idx[i]>=65535)needsUint32=true;if(this.record('indexScans'))yield this.progress();}
    if(this.units)yield this.progress();
    const indexArray=needsUint32?new Uint32Array(this.idx.length):new Uint16Array(this.idx.length);this.record('allocations');yield this.progress();
    for(let i=0;i<this.idx.length;i++){indexArray[i]=this.idx[i];if(this.record('indexScalars'))yield this.progress();}
    const index=needsUint32?new THREE.Uint32BufferAttribute(0,1):new THREE.Uint16BufferAttribute(0,1);index.array=indexArray;index.count=indexArray.length;
    yield* this.phaseStart('normals');
    const position=attrs.position,normal=new THREE.BufferAttribute(new Float32Array(position.count*3),3);this.record('allocations');yield this.progress();
    // Preserve Three r162's operation order, including Float32 accumulation
    // after EVERY face. Accumulating doubles and casting later changes bytes.
    const pA=new THREE.Vector3(),pB=new THREE.Vector3(),pC=new THREE.Vector3();
    const nA=new THREE.Vector3(),nB=new THREE.Vector3(),nC=new THREE.Vector3();
    const cb=new THREE.Vector3(),ab=new THREE.Vector3();
    for(let i=0;i<index.count;i+=3){
      const vA=index.getX(i),vB=index.getX(i+1),vC=index.getX(i+2);
      pA.fromBufferAttribute(position,vA);pB.fromBufferAttribute(position,vB);pC.fromBufferAttribute(position,vC);
      cb.subVectors(pC,pB);ab.subVectors(pA,pB);cb.cross(ab);
      nA.fromBufferAttribute(normal,vA);nB.fromBufferAttribute(normal,vB);nC.fromBufferAttribute(normal,vC);
      nA.add(cb);nB.add(cb);nC.add(cb);
      normal.setXYZ(vA,nA.x,nA.y,nA.z);normal.setXYZ(vB,nB.x,nB.y,nB.z);normal.setXYZ(vC,nC.x,nC.y,nC.z);
      if(this.record('normalTriangles'))yield this.progress();
    }
    const vector=new THREE.Vector3();
    for(let i=0;i<normal.count;i++){vector.fromBufferAttribute(normal,i);vector.normalize();normal.setXYZ(i,vector.x,vector.y,vector.z);if(this.record('normalVertices'))yield this.progress();}
    normal.needsUpdate=true;attrs.normal=normal;
    yield* this.phaseStart('bounds');
    const box=new THREE.Box3();
    for(let i=0;i<position.count;i++){vector.fromBufferAttribute(position,i);box.expandByPoint(vector);if(this.record('boxVertices'))yield this.progress();}
    const sphere=new THREE.Sphere();box.getCenter(sphere.center);let maxRadiusSq=0;
    for(let i=0;i<position.count;i++){vector.fromBufferAttribute(position,i);maxRadiusSq=Math.max(maxRadiusSq,sphere.center.distanceToSquared(vector));if(this.record('sphereVertices'))yield this.progress();}
    sphere.radius=Math.sqrt(maxRadiusSq);
    yield* this.phaseStart('complete');this.record('ready');yield this.progress();
    // The only BufferGeometry is constructed in the final non-yielding commit.
    // Until next().done, return()/throw() can discard CPU buffers without any
    // renderer-visible partial resource or disposal obligation.
    const g=new THREE.BufferGeometry();for(const [name,attribute] of Object.entries(attrs))g.setAttribute(name,attribute);g.setIndex(index);g.boundingBox=box;g.boundingSphere=sphere;return g;
  }
  clear(){this.p=this.c=this.part=this.piv=this.w=this.tw=this.idx=null;this.work=null;}
}

function* circularPatch(b,c,r,color,rig,segments=20){const pts=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2;pts.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),c[2]]);}yield* b.patch(pts,color,rig);}
function* circleLine(b,c,r,width,color,rig,segments=24){const pts=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;pts.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),c[2]]);}yield* b.ribbon(pts,width,color,rig);}
function* motif(b,t,pose,lod,off,z,rig){
  if(lod===2)return;
  const y=1.215+off;
  for(const sign of [1,-1]){
    const firstTriangle=b.idx.length,firstVertex=b.p.length/3;
    const zz=z+sign*.166;
    if(t.motif==='roundel'){
      // Open embroidered roundel follows the cloth, without a floating flat badge plate.
      yield* circleLine(b,[0,y,zz+sign*.001],.088,.006,t.accent,rig,lod===0?24:12);
      // Authored ornamental coil: a simplified dragon roundel, not a rank-square.
      const coil=[[.044,.043],[.012,.057],[-.032,.043],[-.052,.014],[-.041,-.027],[-.009,-.046],[.028,-.028],[.034,.006],[.009,.024],[-.012,.009],[-.006,-.014]];
      yield* b.ribbon(coil.map(([x,dy])=>[x,y+dy,zz+sign*.002]),.011,t.accent,rig);
      yield* b.patch([[.033,y+.045,zz+sign*.003],[.047,y+.062,zz+sign*.003],[.065,y+.053,zz+sign*.003],[.072,y+.037,zz+sign*.003],[.053,y+.029,zz+sign*.003],[.038,y+.035,zz+sign*.003]],t.accent,rig);
      yield* b.ribbon([[.046,y+.055,zz+sign*.004],[.039,y+.075,zz+sign*.004],[.025,y+.072,zz+sign*.004]],.004,t.accent,rig);
      for(const side of [-1,1]){yield* b.ribbon([[side*.025,y+.003,zz+sign*.003],[side*.054,y+.013,zz+sign*.003],[side*.065,y-.004,zz+sign*.003]],.006,t.accent,rig);yield* b.ribbon([[side*.054,y+.013,zz+sign*.003],[side*.071,y+.019,zz+sign*.003]],.003,t.accent,rig);}
      if(lod===0)yield* circularPatch(b,[.053,y+.048,zz+sign*.005],.003,t.trim,rig,6);
    } else if(t.motif==='rank-square'){
      const s=.082;for(let ix=0;ix<3;ix++)for(let iy=0;iy<3;iy++){const x0=-s+ix*s*2/3,x1=x0+s*2/3,y0=y-s+iy*s*2/3,y1=y0+s*2/3;yield* b.patch([[x0,y0,zz],[x1,y0,zz],[x1,y1,zz],[x0,y1,zz]],t.trim,rig);}
      yield* b.ribbon([[-s,y-s,zz+sign*.001],[s,y-s,zz+sign*.001],[s,y+s,zz+sign*.001],[-s,y+s,zz+sign*.001],[-s,y-s,zz+sign*.001]],.006,t.accent,rig);
      // Stylised bird with opened wing, not a specific unverified official rank.
      yield* b.patch([[-.061,y+.005,zz+sign*.002],[-.015,y+.035,zz+sign*.002],[.018,y+.015,zz+sign*.002],[.057,y+.046,zz+sign*.002],[.035,y-.002,zz+sign*.002],[.009,y-.025,zz+sign*.002],[-.027,y-.015,zz+sign*.002]],t.accent,rig);
      yield* b.ribbon([[-.052,y-.049,zz+sign*.003],[0,y-.037,zz+sign*.003],[.053,y-.049,zz+sign*.003]],.004,t.accent,rig);
    } else if(t.motif==='floral'){
      for(const cx of [-.08,.08])for(let k=0;k<5;k++){const a=k/5*Math.PI*2; yield* circularPatch(b,[cx+.017*Math.cos(a),y+.022*Math.sin(a),zz],.016,t.accent,rig,8);}
    } else if(t.motif==='studs') {
      for(let row=0;row<(lod===0?4:3);row++)for(let col=0;col<5;col++)yield* circularPatch(b,[(col-2)*.057,y+(row-1.5)*.063,zz],lod===0?.006:.008,t.accent,rig,6);
    }
    for(let vi=firstVertex;vi<b.p.length/3;vi++){
      const xx=b.p[vi*3],yy=b.p[vi*3+1]-off;
      const rr=t.silhouette==='guard'?.164:.155;
      const rx=t.silhouette==='guard'?.231:.22;
      const layer=Math.abs(b.p[vi*3+2]-zz);
      b.p[vi*3+2]=z+sign*(rr*Math.sqrt(Math.max(.1,1-(xx/rx)**2))+.006+layer*3);
      if(b.record('decorationVertices'))yield b.progress();
    }
    if(sign<0)for(let i=firstTriangle;i<b.idx.length;i+=3){[b.idx[i+1],b.idx[i+2]]=[b.idx[i+2],b.idx[i+1]];if(b.record('flippedTriangles'))yield b.progress();}
  }
}

// Female variants are two anonymous adults, not class-based facial ideals.
// The supplied image is visual art direction, not historical evidence.
// Low swept hair and small ornaments remain anonymous interpretive simplifications.
const isFemale=t=>t.hat==='dressed-hair'||t.hat==='simple-hair';
const FEMALE_SKIN=0xdbb294, FEMALE_SHADE=0xbf9276;
const femaleSkull=[
 {y:1.452,rx:.027,rz:.035,z:.018},{y:1.463,rx:.040,rz:.045,z:.013},
 {y:1.480,rx:.056,rz:.061,z:.006},{y:1.505,rx:.069,rz:.071,z:.001},
 {y:1.535,rx:.075,rz:.075,z:0},{y:1.565,rx:.075,rz:.075,z:-.002},
 {y:1.595,rx:.078,rz:.075,z:-.004},{y:1.625,rx:.076,rz:.072,z:-.006},
 {y:1.650,rx:.069,rz:.065,z:-.007},{y:1.675,rx:.055,rz:.051,z:-.008},
 {y:1.691,rx:.038,rz:.035,z:-.008},{y:1.701,rx:.021,rz:.019,z:-.008},{y:1.706,rx:.003,rz:.003,z:-.008},
];
function femaleSkullAt(y){let j=0;while(j<femaleSkull.length-2&&y>femaleSkull[j+1].y)j++;const a=femaleSkull[j],b=femaleSkull[j+1],u=clamp((y-a.y)/(b.y-a.y));return{rx:a.rx+(b.rx-a.rx)*u,rz:a.rz+(b.rz-a.rz)*u,z:a.z+(b.z-a.z)*u};}
function femaleScalpAt(y,lod=0){const sk=femaleSkullAt(Math.min(y,1.706)),shell=lod===0?.006:.014;if(y<1.605)return {rx:sk.rx+shell,rz:sk.rz+shell,z:sk.z};const dome=Math.sqrt(Math.max(.0001,1-((y-1.605)/.108)**2));return {rx:(.084+(lod===0?0:.008))*dome,rz:(.080+(lod===0?0:.008))*dome,z:-.008};}
function* femaleHair(b,t,lod,off,z,rig){
 const seg=[32,8,6][lod],rows=[12,6,5][lod],start=b.p.length/3;
 // A scalp-following volume with an asymmetric side-part hairline. The dome
 // stays rounded: there is no disconnected cone, hat brim or late-Qing board.
 for(let row=0;row<rows;row++)for(let i=0;i<seg;i++){
  const a=i/seg*Math.PI*2,front=Math.cos(a),side=Math.sin(a);
  const frontLine=1.590+.037*Math.exp(-(((side-.32)/.70)**2));
  const bottom=front>.20?1.548+(frontLine-1.548)*Math.pow((front-.20)/.80,.40):front>-.25?1.522+.026*(front+.25)/.45:1.500+.022*(front+1)/.75;
  const u=row/(rows-1),y=bottom+(1.712-bottom)*Math.sin(u*Math.PI/2),sk=femaleScalpAt(y,lod),rx=sk.rx,rz=sk.rz;
  const ridge=lod===0?.0007*Math.cos(a*14+u*4):0;
  b.vertex([(rx+ridge)*side,y+off,z+sk.z+(rz+ridge)*front],HAIR,rig);if(b.units===MAX_WORK_UNITS)yield b.progress();
 }
 for(let row=0;row<rows-1;row++)for(let i=0;i<seg;i++){b.quad(start+row*seg+i,start+row*seg+(i+1)%seg,start+(row+1)*seg+(i+1)%seg,start+(row+1)*seg+i);if(b.units===MAX_WORK_UNITS)yield b.progress();}
 const top=b.vertex([0,1.713+off,z-.008],HAIR,rig);if(b.units===MAX_WORK_UNITS)yield b.progress();
 for(let i=0;i<seg;i++){b.tri(top,start+(rows-1)*seg+i,start+(rows-1)*seg+(i+1)%seg);if(b.units===MAX_WORK_UNITS)yield b.progress();}
 const a=t.hat==='dressed-hair',bx=a?-.012:-.006,by=a?1.560:1.555;
 yield* b.loft([{x:bx,y:by-.040+off,rx:.015,rz:.012,z:z-.073},{x:bx,y:by-.027+off,rx:a?.046:.039,rz:.029,z:z-.087},{x:bx,y:by+off,rx:a?.052:.045,rz:.035,z:z-.091},{x:bx,y:by+.030+off,rx:.037,rz:.026,z:z-.086},{x:bx,y:by+.043+off,rx:.012,rz:.009,z:z-.079}],seg,HAIR,rig);
 if(lod===0){
  // Fine continuous swept locks follow the scalp instead of floating black spikes.
  for(let k=0;k<8;k++){
   const pts=[];for(let j=0;j<=11;j++){const u=j/11,y=1.695-k*.002-.091*u+.010*Math.sin(u*Math.PI),x=.026-.102*u+.003*k,sk=femaleScalpAt(y),xx=Math.max(-sk.rx+.001,Math.min(sk.rx-.001,x)),zz=sk.z+sk.rz*Math.sqrt(Math.max(.025,1-(xx/sk.rx)**2));pts.push([xx,y+off,z+zz+.0007]);}
   yield* b.tube(pts,pts.map(()=>[.00075,.00075]),4,k%3===0?0x302c27:0x272521,rig);
  }
  for(let k=0;k<4;k++){
   const pts=[];for(let j=0;j<=9;j++){const u=j/9,y=1.692-k*.003-.092*u,x=.029+.043*Math.sin(u*Math.PI*.75),sk=femaleScalpAt(y),xx=Math.min(sk.rx-.001,x);pts.push([xx,y+off,z+sk.z+sk.rz*Math.sqrt(Math.max(.02,1-(xx/sk.rx)**2))+.0008]);}
   yield* b.tube(pts,pts.map(()=>[.00065,.00065]),4,0x2c2924,rig);
  }
 }
 if(a&&lod<2){
  yield* b.tube([[-.055,1.592+off,z-.010],[-.095,1.611+off,z-.012]],[[.0015,.0015],[.0015,.0015]],5,t.accent,rig);
  if(lod===0)for(let k=0;k<5;k++){const angle=k/5*Math.PI*2;yield* circularPatch(b,[-.084+.007*Math.cos(angle),1.608+off+.007*Math.sin(angle),z+.006],.0043,t.accent,rig,6);}
  for(const side of [-1,1])yield* b.tube([[side*.076,1.516+off,z+.003],[side*.077,1.492+off,z+.005]],[[.0015,.0015],[.0028,.0028]],5,t.accent,rig);
 }
}
function* femaleHead(b,t,lod,off,z,closedEyes=false){
 const consort=t.hat==='dressed-hair',seg=[32,10,6][lod],pivot=[0,1.425+off,z],rig={part:1,pivot,weight:p=>clamp((p[1]-(1.405+off))/.04),torsoWeight:1};
 yield* b.loft([{y:1.405+off,rx:.042,rz:.040,z},{y:1.450+off,rx:.041,rz:.038,z},{y:1.473+off,rx:.033,rz:.030,z:z-.008},{y:1.495+off,rx:.034,rz:.030,z:z-.005}],seg,FEMALE_SKIN,rig);
 const shapedHeadStart=b.p.length/3;
 let rings=femaleSkull;if(lod===1)rings=rings.filter((_,i)=>i%2===0||i===12);
 yield* b.loft(rings.map(r=>({...r,y:r.y+off,rx:r.rx*(consort?1:1.025),z:z+r.z})),seg,FEMALE_SKIN,rig);
 if(lod===0){
  for(const side of [-1,1]){
   yield* b.loft([{x:side*.073,y:1.505+off,rx:.005,rz:.008,z:z-.001},{x:side*.079,y:1.534+off,rx:.008,rz:.012,z:z-.002},{x:side*.074,y:1.553+off,rx:.004,rz:.007,z:z-.002}],10,FEMALE_SHADE,rig);
   const ex=side*(consort?.0315:.033),ey=1.565+off,ez=z+.074;
   const eyePoint=(x,y,depth=.004)=>{const sk=femaleSkullAt(y-off);return [x,y,z+sk.z+sk.rz*Math.sqrt(Math.max(.02,1-(x/(sk.rx*(consort?1:1.025)))**2))+depth];};
   const eyeDisk=function*(radius,color,depth,count){const pts=[];for(let k=0;k<count;k++){const angle=k/count*Math.PI*2;pts.push(eyePoint(ex+radius*Math.cos(angle),ey+.0003+radius*Math.sin(angle),depth));}yield* b.patch(pts,color,rig);};
   const eye=[[-.016,0,-.003],[-.010,.005,.001],[0,.006,.003],[.010,.004,.001],[.016,-.001,-.004],[.008,-.004,.001],[0,-.005,.003],[-.009,-.003,.001]].map(([x,y,zz])=>eyePoint(ex+x,ey+y,.003+Math.max(0,zz)*.6));
   if(!closedEyes){
   yield* b.patch(eye,0xe5ddd0,rig);
   yield* eyeDisk(.0052,0x6b4932,.0056,14);
   yield* eyeDisk(.0028,0x171716,.0061,12);
   const glint=eyePoint(ex-.0014,ey+.002,.0065);yield* circularPatch(b,glint,.0011,0xf4eee2,rig,6);
   yield* b.ribbon(eye.slice(0,5),.0017,0x49352b,rig);
   yield* b.ribbon([eye[4],...eye.slice(5),eye[0]],.0008,0x9e735d,rig);
   }
   yield* b.ribbon([eyePoint(ex-.016,ey+.012,.0025),eyePoint(ex-.007,ey+.016,.003),eyePoint(ex+.006,ey+.017,.003),eyePoint(ex+.017,ey+.013,.0025)],.0026,0x4b3c30,rig);
  }
  yield* b.loft([{y:1.528+off,rx:.007,rz:.007,z:z+.074},{y:1.534+off,rx:.010,rz:.011,z:z+.078},{y:1.540+off,rx:.009,rz:.012,z:z+.078},{y:1.548+off,rx:.006,rz:.009,z:z+.075},{y:1.560+off,rx:.005,rz:.006,z:z+.072},{y:1.574+off,rx:.003,rz:.004,z:z+.069}],12,0xd1a487,rig);
  for(const side of [-1,1])yield* circularPatch(b,[side*.007,1.532+off,z+.087],.0017,0x9b7058,rig,6);
  const lip=consort?.017:.018,ly=1.502+off;
  yield* b.loft([{y:ly-.006,rx:.006,rz:.003,z:z+.068},{y:ly-.002,rx:lip*.82,rz:.0045,z:z+.070},{y:ly+.001,rx:lip,rz:.0037,z:z+.070},{y:ly+.004,rx:.007,rz:.003,z:z+.069}],12,0xc08c79,rig);
  yield* b.ribbon([[-lip*.85,ly,z+.072],[0,ly-.0008,z+.075],[lip*.85,ly,z+.072]],.0009,0x825d4e,rig);
 }
 if(closedEyes)for(const side of[-1,1]){
  const ex=side*(consort?.0315:.033),ey=1.565+off;
  const points=[[-.016,.001],[-.008,-.002],[0,-.003],[.008,-.002],[.016,.001]].map(([dx,dy])=>{const x=ex+dx,y=ey+dy,sk=femaleSkullAt(y-off);return[x,y,z+sk.z+sk.rz*Math.sqrt(Math.max(.02,1-(x/(sk.rx*(consort?1:1.025)))**2))+.004];});
  yield* b.ribbon(points,lod===0?.0018:.0024,0x513b32,rig);
 }
 yield* femaleHair(b,t,lod,off,z,rig);
 // Keep the adult crown height and all facial feature distances. Translate
 // the face 20 mm upward and shorten only the upper cranium above it; apply
 // the same continuous map to skull, hair, bun and ornaments to avoid skin gaps.
 for(let i=shapedHeadStart;i<b.p.length/3;i++){
  const y=b.p[i*3+1]-off;b.p[i*3+1]=off+(y<=1.595?y+.020:1.615+(y-1.595)*(.098/.118));
  if(b.record('headProportionVertices'))yield b.progress();
 }
}
function* femaleHand(b,wrist,direction,lod,rig,side,relaxed=false,pose='standing'){
 const d=new THREE.Vector3(...direction).normalize(),w=new THREE.Vector3(...wrist),normal=new THREE.Vector3(0,1,0);
 normal.set(0,pose==='seated'?.94:.15,pose==='seated'?.34:1);
 if(relaxed)normal.set(0,0,1);
 const spread=new THREE.Vector3().crossVectors(normal,d).normalize();normal.crossVectors(d,spread).normalize();
 const point=(l,s=0,n=0)=>w.clone().addScaledVector(d,l).addScaledVector(spread,s).addScaledVector(normal,n).toArray();
 const seg=lod===0?10:6;
 // Thin palm volume with rounded knuckles. Fingers are individually modelled at L0.
 const rows=[[0,.020,.011],[.018,.025,.012],[.043,.026,.010],[.056,.022,.009]],first=b.p.length/3;
 for(const [l,wide,thick]of rows)for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2;b.vertex(point(l,Math.cos(a)*wide,Math.sin(a)*thick),FEMALE_SKIN,rig);if(b.units===MAX_WORK_UNITS)yield b.progress();}
 for(let row=0;row<rows.length-1;row++)for(let i=0;i<seg;i++){b.quad(first+row*seg+i,first+row*seg+(i+1)%seg,first+(row+1)*seg+(i+1)%seg,first+(row+1)*seg+i);if(b.units===MAX_WORK_UNITS)yield b.progress();}
 if(lod===0){
  for(const [spreadPos,len]of [[-.015,.029],[-.005,.039],[.005,.042],[.015,.032]]){
   const points=[point(.048,spreadPos),point(.064,spreadPos,-.001),point(.049+len,spreadPos,pose==='seated'?-.001:-.006),point(.055+len,spreadPos,-(relaxed?.012:pose==='seated'?.002:.010))];
   yield* b.tube(points,[[.0056,.0056],[.0055,.005],[.0045,.0045],[.0031,.0034]],7,FEMALE_SKIN,rig);
  }
  yield* b.tube([point(.014,-.022),point(.036,-.034,-.003),point(.053,-.032,-.005)],[[.008,.008],[.0065,.006],[.0045,.0045]],8,FEMALE_SKIN,rig);
 }else yield* b.tube([point(.049),point(.087,0,-.003)],[[.020,.009],[.015,.006]],seg,FEMALE_SKIN,rig);
}
function* femaleArm(b,t,pose,lod,off,z,side,femalePose='resting',seatVariant='standard'){
 const a=t.hat==='dressed-hair',seg=[16,6,5][lod],shoulder=[side*.099,1.330+off,z],part=side<0?2:3,walking=femalePose==='walking';
 // Seat-specific wrist levels are fitted against the existing actual lap shell,
 // independently of the unchanged pelvis/seat/foot anchors.
 const lapLift=seatVariant==='raised-footstool'?.0466:seatVariant==='throne-front-perch'?.1206:0;
 let elbow,wrist,direction;
 if(pose==='seated'){elbow=[side*.194,.760+lapLift*.45,z+.160];wrist=[side*(side<0?.073:.061),.5892+lapLift+(side<0?.013:0),z+.360+(side<0?.010:0)];direction=[-side*.96,-.10,.27];}
 else if(pose==='kneeling'){elbow=[side*.230,.555,z+.13];wrist=[side*.073,.459+(side<0?.016:0),z+.28];direction=[-side*.94,-.16,.30];}
 else if(walking){elbow=[side*.238,1.086,z+side*.018];wrist=[side*.278,.881,z+side*.055];direction=[side*.08,-.98,.17];}
 else{elbow=[side*(a?.205:.198),1.082,z+.025];wrist=[side*(side<0?.065:.052),1.005+(side<0?.024:0),z+.165+(side<0?.012:0)];direction=[-side*.80,-.48,.35];}
 // Seated hands rest on the skirt: fade local shoulder swing out before the
 // cuff, then use the same pelvis-based torso blend as the supporting cloth.
 // Upper sleeves, breathing and head motion remain live; standing/walking and
 // kneeling retain their original weights. No animation or male rig changes.
 const seatedBlend=p=>{const u=clamp((p[1]-wrist[1]-.060)/.220);return u*u*(3-2*u);};
 const rig={part,pivot:shoulder,weight:p=>clamp(Math.hypot(p[0]-shoulder[0],p[1]-shoulder[1],p[2]-shoulder[2])/.22)*(pose==='seated'?seatedBlend(p):1),torsoWeight:pose==='seated'?p=>clamp((p[1]-.57)/.17):1};
 const upper=[side*.170,1.282+off,z+.003],curve=new THREE.CatmullRomCurve3([shoulder,upper,elbow,wrist].map(p=>new THREE.Vector3(...p)),false,'centripetal'),points=curve.getPoints((lod===0?11:lod===1?5:4)-1).map(p=>p.toArray());
 const radii=points.map((p,i)=>{const u=i/(points.length-1);return [.040+.014*Math.sin(u*Math.PI)+.008*u,.044+.014*Math.sin(u*Math.PI)+.010*u];});
 yield* b.tube(points,radii,seg,t.robe,rig,false);
 const dir=new THREE.Vector3(...wrist).sub(new THREE.Vector3(...points.at(-2))).normalize(),last=radii.at(-1),back=length=>wrist.map((v,i)=>v-dir.getComponent(i)*length);
 if(lod<2){
  yield* b.tube([back(.032),wrist],[[last[0]+.0015,last[1]+.0015],[last[0]+.002,last[1]+.002]],seg,t.trim,rig,false);
  yield* b.tube([back(.019),wrist],[[last[0]-.008,last[1]-.008],[last[0]-.007,last[1]-.007]],seg,0x26302f,rig,false);
  if(lod===0){
   // A recessed lining and a real forearm close the cavity, not a blank disc
   // placed at the cuff or a hand floating in an opening to the background.
   yield* b.tube([back(.036),back(.034)],[[last[0]-.009,last[1]-.009],[last[0]-.009,last[1]-.009]],seg,0x26302f,rig,true);
   yield* b.tube([back(.038),wrist],[[.020,.018],[.020,.014]],10,FEMALE_SKIN,rig,true);
  }
  const u=new THREE.Vector3(0,0,1).cross(dir).normalize(),v=new THREE.Vector3().crossVectors(dir,u).normalize(),rim=b.p.length/3;
  for(const inner of [false,true])for(let i=0;i<seg;i++){const angle=i/seg*Math.PI*2,rx=last[0]+(inner?-.007:.002),rz=last[1]+(inner?-.007:.002);b.vertex(wrist.map((x,k)=>x+u.getComponent(k)*Math.cos(angle)*rx+v.getComponent(k)*Math.sin(angle)*rz),t.trim,rig);if(b.units===MAX_WORK_UNITS)yield b.progress();}
  for(let i=0;i<seg;i++){b.quad(rim+i,rim+(i+1)%seg,rim+seg+(i+1)%seg,rim+seg+i);if(b.units===MAX_WORK_UNITS)yield b.progress();}
  if(a)yield* b.tube([back(.025),back(.021)],[[last[0]+.0025,last[1]+.0025],[last[0]+.0025,last[1]+.0025]],seg,t.accent,rig,false);
 }
 yield* femaleHand(b,wrist,direction,lod,rig,side,walking,pose);
}
function femaleTorsoRings(t,off,z){return [{y:.948+off,rx:.184,rz:.139,z},{y:1.06+off,rx:.181,rz:.137,z},{y:1.23+off,rx:.184,rz:.139,z},{y:1.32+off,rx:t.hat==='dressed-hair'?.180:.177,rz:.125,z},{y:1.365+off,rx:.148,rz:.105,z},{y:1.397+off,rx:.113,rz:.079,z},{y:1.416+off,rx:.068,rz:.059,z},{y:1.432+off,rx:.054,rz:.052,z}];}
function femaleClothPoint(t,x,y,off,z,sign=1){
 const rings=femaleTorsoRings(t,0,0);let j=0;while(j<rings.length-2&&y>rings[j+1].y)j++;const a=rings[j],b=rings[j+1],u=clamp((y-a.y)/(b.y-a.y)),rx=a.rx+(b.rx-a.rx)*u,rz=a.rz+(b.rz-a.rz)*u;
 return [x,y+off,z+sign*(rz*Math.sqrt(Math.max(.05,1-(x/rx)**2))+.005)];
}
function* femaleClothRibbon(b,t,path,width,color,rig,off,z,lod){
 const points=[];
 for(let k=0;k<path.length-1;k++){
  const a=path[k],c=path[k+1],steps=Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/(lod===0?.016:.04));
  for(let j=0;j<steps;j++){const u=j/steps;points.push([a[0]+(c[0]-a[0])*u,a[1]+(c[1]-a[1])*u]);}
 }
 points.push(path.at(-1));
 for(let k=0;k<points.length-1;k++){
  const a=points[k],c=points[k+1],dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy),ox=-dy/len*width/2,oy=dx/len*width/2,ids=[];
  for(const [x,y] of [[a[0]+ox,a[1]+oy],[a[0]-ox,a[1]-oy],[c[0]-ox,c[1]-oy],[c[0]+ox,c[1]+oy]]){ids.push(b.vertex(femaleClothPoint(t,x,y,off,z),color,rig));if(b.units===MAX_WORK_UNITS)yield b.progress();}
  b.quad(...ids);if(b.units===MAX_WORK_UNITS)yield b.progress();
 }
}
function femaleLowerPoint(lower,x,y,zOffset=.006){
 let j=0;while(j<lower.length-2&&y>lower[j+1].y)j++;const a=lower[j],b=lower[j+1],u=clamp((y-a.y)/Math.max(.001,b.y-a.y)),rx=a.rx+(b.rx-a.rx)*u,rz=a.rz+(b.rz-a.rz)*u,z=(a.z??0)+((b.z??0)-(a.z??0))*u;
 return [x,y,z+rz*Math.sqrt(Math.max(.04,1-(x/rx)**2))+zOffset];
}
function* femaleSurfaceRibbon(b,path,width,color,rig,point,lod=0){
 const samples=[];for(let k=0;k<path.length-1;k++){const a=path[k],c=path[k+1],n=Math.max(1,Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/(lod===0?.012:.045)));for(let j=0;j<n;j++){const u=j/n;samples.push([a[0]+(c[0]-a[0])*u,a[1]+(c[1]-a[1])*u]);}}samples.push(path.at(-1));
 for(let k=0;k<samples.length-1;k++){const a=samples[k],c=samples[k+1],dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy)||1,ox=-dy/len*width/2,oy=dx/len*width/2,ids=[];for(const [x,y]of [[a[0]+ox,a[1]+oy],[a[0]-ox,a[1]-oy],[c[0]-ox,c[1]-oy],[c[0]+ox,c[1]+oy]]){ids.push(b.vertex(point(x,y),color,rig));if(b.units===MAX_WORK_UNITS)yield b.progress();}b.quad(...ids);if(b.units===MAX_WORK_UNITS)yield b.progress();}
}
function* femaleFloralBranch(b,x,y,size,rig,point,color){
 yield* femaleSurfaceRibbon(b,[[x-size*.5,y-size],[x,y],[x+size*.30,y+size]],.0014,color,rig,point);
 for(const [cx,cy]of [[x,y+size*.50],[x+size*.40,y-size*.10]]){
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2,px=cx+.007*Math.cos(a),py=cy+.007*Math.sin(a),pts=[];for(let q=0;q<6;q++){const z=q/6*Math.PI*2;pts.push(point(px+.0045*Math.cos(z),py+.0055*Math.sin(z)));}yield* b.patch(pts,color,rig);}
  yield* b.patch([point(cx-.002,cy-.002),point(cx+.002,cy-.002),point(cx+.002,cy+.002),point(cx-.002,cy+.002)],0xc3ab70,rig);
 }
 for(const [dx,dy,side]of [[-.1,-.7,-1],[.12,.80,1],[.15,-.18,1]]){const xx=x+dx*size,yy=y+dy*size;yield* b.patch([point(xx,yy),point(xx+side*.012,yy+.014),point(xx+side*.017,yy+.006),point(xx+side*.004,yy-.003)],0xa58e57,rig);}
}
function* femaleOutfit(b,t,pose,lod,off,z,bodyRig,skirtRig,lower,seg){
 const a=t.hat==='dressed-hair',hem=lower[0];
 if(lod<2){
  yield* b.loft([hem,{...hem,y:hem.y+.026,rx:hem.rx*.999,rz:hem.rz*.999}],seg,t.trim,skirtRig,.018);
  if(a&&lod===0)yield* b.loft([{...hem,y:hem.y+.023,rx:hem.rx*1.002,rz:hem.rz*1.002},{...hem,y:hem.y+.029,rx:hem.rx*1.002,rz:hem.rz*1.002}],seg,t.accent,skirtRig,.018);
 }
 if(lod===2)yield* b.loft(femaleTorsoRings(t,off,z),seg,t.robe,bodyRig,.018);
 if(lod<2){
  yield* b.loft([{y:1.405+off,rx:.066,rz:.061,z},{y:1.430+off,rx:.055,rz:.053,z}],seg,t.trim,bodyRig);
  if(a&&lod===0)yield* b.loft([{y:1.427+off,rx:.056,rz:.054,z},{y:1.431+off,rx:.055,rz:.053,z}],seg,t.accent,bodyRig);
  const upper=[[.036,1.411],[.027,1.384],[-.050,1.349],[-.121,1.294],[-.157,1.205],[-.165,1.06],[-.166,.949]];
  yield* femaleClothRibbon(b,t,upper,a?.012:.010,t.trim,bodyRig,off,z,lod);
  if(a)yield* femaleClothRibbon(b,t,upper.map(([x,y])=>[x+.002,y]),.0028,t.accent,bodyRig,off,z,lod);
  yield* femaleClothRibbon(b,t,[[.025,1.383],[.111,1.344],[.167,1.286]],a?.004:.005,a?t.accent:t.trim,bodyRig,off,z,lod);
  const lowerPath=pose==='standing'?[[-.166,.968],[-.19,.72],[-.218,.45],[-.240,.20],[-.244,hem.y+.025]]:[[-.166,lower.at(-1).y],[-.195,lower.at(-2).y],[-.224,lower[1].y],[-.244,hem.y+.025]];
  yield* femaleSurfaceRibbon(b,lowerPath,a?.015:.012,t.trim,skirtRig,(x,y)=>femaleLowerPoint(lower,x,y),lod);
  if(a&&lod===0)yield* femaleSurfaceRibbon(b,lowerPath.map(([x,y])=>[x+.003,y]),.0035,t.accent,skirtRig,(x,y)=>femaleLowerPoint(lower,x,y,.008),lod);
  if(lod===0){
   for(const [x,y]of [[-.071,1.335],[-.112,1.299],[-.154,1.212]]){
    const cp=(dx,dy)=>femaleClothPoint(t,x+dx,y+dy,off,z);
    yield* b.ribbon([cp(-.016,.007),cp(.012,-.006)],.0034,a?t.accent:t.trim,bodyRig);
    yield* b.tube([cp(-.003,.001),cp(.007,-.004)],[[.003,.003],[.003,.003]],6,a?t.accent:t.trim,bodyRig);
   }
  }
 }
 if(a&&lod===0){
  for(const [x,y,size]of [[-.055,1.245,.035],[.102,1.325,.028],[.085,1.095,.033],[-.040,1.025,.024]])yield* femaleFloralBranch(b,x,y,size,bodyRig,(xx,yy)=>femaleClothPoint(t,xx,yy,off,z),0xa68f59);
  for(const [x,y,size]of pose==='standing'?[[.130,.32,.044],[-.075,.58,.033],[-.13,.20,.035]]:[[.140,.20,.045],[-.095,.31,.033],[-.055,.55,.025]])yield* femaleFloralBranch(b,x,y,size,skirtRig,(xx,yy)=>femaleLowerPoint(lower,xx,yy,.009),0xae965b);
  // A small back branch keeps the garment complete in rotation, not a frontal decal.
  const backStart=b.idx.length;yield* femaleFloralBranch(b,.055,1.22,.035,bodyRig,(xx,yy)=>femaleClothPoint(t,-xx,yy,off,z,-1),0xa68f59);for(let i=backStart;i<b.idx.length;i+=3){[b.idx[i+1],b.idx[i+2]]=[b.idx[i+2],b.idx[i+1]];if(b.record('flippedTriangles'))yield b.progress();}
 }
}

function* head(b,t,lod,off,z,closedEyes=false){
  if(isFemale(t)){yield* femaleHead(b,t,lod,off,z,closedEyes);return;}
  const seg=[20,8,6][lod],pivot=[0,1.425+off,z],rig={part:1,pivot,weight:p=>clamp((p[1]-(1.405+off))/.04),torsoWeight:1};
  yield* b.loft([{y:1.405+off,rx:.049,rz:.046,z},{y:1.465+off,rx:.054,rz:.051,z}],seg,SKIN,rig);
  yield* b.loft([{y:1.452+off,rx:.035,rz:.042,z:z+.012},{y:1.47+off,rx:.057,rz:.066,z:z+.008},{y:1.51+off,rx:.076,rz:.077,z},{y:1.56+off,rx:.081,rz:.076,z},{y:1.61+off,rx:.077,rz:.069,z:z-.004},{y:1.665+off,rx:.055,rz:.047,z:z-.006},{y:1.70+off,rx:.012,rz:.012,z:z-.007}],seg,SKIN_LIGHT,rig);
  if(lod===0){
    for(const s of [-1,1]){
      yield* b.loft([{x:s*.078,y:1.512+off,rx:.008,rz:.013,z:z-.003},{x:s*.083,y:1.544+off,rx:.012,rz:.015,z:z-.004},{x:s*.077,y:1.565+off,rx:.005,rz:.01,z:z-.004}],8,SKIN,rig);
      const ey=1.566+off,ex=s*.034,ez=z+.071;
      yield* b.patch([[ex-.019,ey,ez],[ex-.009,ey+.004,ez+.003],[ex+.012,ey+.003,ez],[ex+.018,ey-.001,ez],[ex+.004,ey-.004,ez+.002]],HAIR,rig);
      yield* b.ribbon([[ex-.019,ey+.015,ez-.002],[ex,ey+.019,ez+.001],[ex+.018,ey+.014,ez-.002]],.006,HAIR,rig);
    }
    yield* b.patch([[-.013,1.575+off,z+.071],[.013,1.575+off,z+.071],[.017,1.526+off,z+.080],[0,1.526+off,z+.104],[-.017,1.526+off,z+.080]],SKIN,rig);
    yield* b.patch([[-.024,1.500+off,z+.075],[0,1.496+off,z+.084],[.024,1.500+off,z+.075],[0,1.504+off,z+.083]],0x865647,rig);
    yield* b.ribbon([[-.019,1.500+off,z+.080],[0,1.499+off,z+.086],[.019,1.500+off,z+.080]],.002,0x5c3e34,rig);
  }
  if(t.hat==='dressed-hair'||t.hat==='simple-hair'){
    yield* b.loft([{y:1.603+off,rx:.08,rz:.072,z:z-.005},{y:1.66+off,rx:.079,rz:.070,z:z-.01},{y:1.703+off,rx:.043,rz:.044,z:z-.012}],seg,HAIR,rig);
    yield* b.loft([{y:1.67+off,rx:.041,rz:.045,z:z-.058},{y:1.735+off,rx:.043,rz:.039,z:z-.05},{y:1.755+off,rx:.01,rz:.01,z:z-.04}],seg,HAIR,rig);
    if(t.hat==='dressed-hair'&&lod<2){yield* b.tube([[-.115,1.693+off,z-.025],[.115,1.713+off,z-.025]],[[.006,.006],[.006,.006]],6,t.accent,rig);for(const s of [-1,1]){yield* circularPatch(b,[s*.075,1.684+off,z+.043],.018,0xc6a15a,rig,10);yield* b.tube([[s*.084,1.546+off,z],[s*.084,1.51+off,z]],[[.003,.003],[.004,.004]],6,t.accent,rig);}}
  } else {
    const court=t.hat==='court',guard=t.hat==='guard';
    yield* b.loft([{y:1.625+off,rx:.109,rz:.101,z:z-.007},{y:1.646+off,rx:.111,rz:.103,z:z-.007},{y:1.667+off,rx:.092,rz:.088,z:z-.007}],seg,t.trim,rig);
    yield* b.loft([{y:1.66+off,rx:.093,rz:.087,z:z-.007},{y:1.724+off,rx:guard?.064:.060,rz:guard?.060:.056,z:z-.007},{y:1.771+off,rx:.012,rz:.012,z:z-.007}],seg,court?0x9e4437:(guard?0x5b6467:t.trim),rig);
    if(court||guard)yield* b.loft([{y:1.766+off,rx:.018,rz:.018,z:z-.007},{y:1.792+off,rx:.016,rz:.016,z:z-.007},{y:1.808+off,rx:.004,rz:.004,z:z-.007}],seg,t.accent,rig);
    if(lod===0&&court){for(let i=0;i<12;i++){const a=i/12*Math.PI*2;yield* b.tube([[.013*Math.sin(a),1.765+off,z-.007+.013*Math.cos(a)],[.08*Math.sin(a),1.677+off,z-.007+.075*Math.cos(a)]],[[.002,.002],[.002,.002]],4,0xa94b3a,rig);}}
    if(lod<2){yield* b.tube([[0,1.60+off,z-.071],[0,1.43+off,z-.092],[.012,1.27+off,z-.148]],[[.013,.012],[.012,.012],[.006,.006]],6,HAIR,rig);}
  }
}
function* shoe(b,x,y,z,lod,part,pose){
 const rig={part,pivot:[x,pose==='standing'?.79:.43,z-.02],weight:1,torsoWeight:0};const seg=[12,6,5][lod];
 if(lod<2)yield* b.loft([{x,y,rx:.061,rz:.137,z:z+.025},{x,y:y+.021,rx:.065,rz:.139,z:z+.025},{x,y:y+.024,rx:.063,rz:.137,z:z+.025}],seg,SOLE,rig);
 yield* b.loft([{x,y:lod===2?y:y+.024,rx:.064,rz:.134,z:z+.025},{x,y:y+.065,rx:.060,rz:.124,z:z+.027},{x,y:y+.10,rx:.042,rz:.08,z:z-.01}],seg,0x242329,rig);
}
function* arm(b,t,pose,lod,off,z,side,femalePose='resting',seatVariant='standard'){
 if(isFemale(t)){yield* femaleArm(b,t,pose,lod,off,z,side,femalePose,seatVariant);return;}
 const seg=[12,6,5][lod],shoulder=[side*.145,1.335+off,z],part=side<0?2:3;
 const guard=t.silhouette==='guard'&&pose==='standing';
 let elbow,wrist;
 if(guard){elbow=[side*.283,1.095+off,z+.012];wrist=[side*.266,.905+off,z+.07];}
 else if(pose==='seated'){elbow=[side*.281,.895,z+.10];wrist=[side*.195,.745,z+.34];}
 else if(pose==='kneeling'){elbow=[side*.270,.565,z+.13];wrist=[side*.105,.465,z+.28];}
 else {elbow=[side*.283,1.105,z+.025];wrist=[side*.12,.985,z+.24];}
 const rig={part,pivot:shoulder,weight:p=>clamp(Math.hypot(p[0]-shoulder[0],p[1]-shoulder[1],p[2]-shoulder[2])/.22),torsoWeight:1};
 const upper=[side*.235,1.292+off,z+.004];
 const curve=new THREE.CatmullRomCurve3([shoulder,upper,elbow,wrist].map(p=>new THREE.Vector3(...p)),false,'centripetal');
 const count=lod===0?8:lod===1?5:4,points=curve.getPoints(count-1).map(p=>p.toArray()),broad=t.silhouette==='female'?1.13:1;
 const radii=points.map((p,i)=>{const u=i/(points.length-1);return [(.063+.030*Math.sin(u*Math.PI))*(u>.7?broad:1),.072+.018*Math.sin(u*Math.PI)];});
 radii[radii.length-1]=[.069*broad,.061];
 yield* b.tube(points,radii,seg,t.robe,rig);
 const direction=new THREE.Vector3(...wrist).sub(new THREE.Vector3(...points[points.length-2])).normalize();
 const cuffStart=wrist.map((v,i)=>v-direction.getComponent(i)*.040);
 if(lod<2)yield* b.tube([cuffStart,wrist],[[.077*broad,.069],[.073*broad,.065]],seg,t.trim,rig,false);
 if(lod===0){const goldStart=wrist.map((v,i)=>v-direction.getComponent(i)*.031),goldEnd=wrist.map((v,i)=>v-direction.getComponent(i)*.025);yield* b.tube([goldStart,goldEnd],[[.079*broad,.071],[.079*broad,.071]],seg,t.accent,rig,false);}
 const handEnd=wrist.map((v,i)=>v+direction.getComponent(i)*.085),handMid=wrist.map((v,i)=>v+direction.getComponent(i)*.042);
 yield* b.tube([wrist,handMid,handEnd],[[.031,.023],[.034,.025],[.024,.016]],seg,SKIN_LIGHT,rig);
 if(lod===0){const thumbStart=handMid.map((v,i)=>v+(i===0?-side*.025:0));const thumbEnd=thumbStart.map((v,i)=>v+(i===0?-side*.016:i===1?-.014:.021));yield* b.tube([thumbStart,thumbEnd],[[.012,.012],[.008,.008]],8,SKIN,rig);}
}
/** Prepare CPU geometry cooperatively; each next() performs <= 128 work units.
 * A face unit emits <= 2 triangles. A triangulation unit is isolated and takes
 * <= 20 authored contour points; contiguous typed-buffer allocation is isolated.
 * Yielded values are progress only. The finished geometry is next().value when
 * done === true. return()/throw() cancels preparation and retains no GPU resource.
 * Work is bounded, not wall-clock time: JS scheduling/GC may delay any step.
 */
export function* createCharacterGeometrySteps(templateId,pose='standing',lod=0,options={}){
 // R72 adult, normally clothed resting pose derived from the approved outfit.
 // Static sleeping pose deliberately has no standing/ kneeling shader motion.
 if(pose==='sleeping'){
  if(!['consort-daily','maid-daily'].includes(templateId))throw new Error('Sleeping pose requires an adult residential female template');
  const g=yield* createCharacterGeometrySteps(templateId,'standing',lod,{...options,[SLEEP_EYES]:true,seatVariant:'standard',femalePose:'resting'});
  // Preserve the preparation work budget: rigid transform in bounded batches,
  // with analytical bounds instead of synchronous whole-mesh rescans.
  const oldBounds=g.boundingBox.clone(),minZ=oldBounds.min.z,cy=(oldBounds.min.y+oldBounds.max.y)/2;
  const p=g.attributes.position,n=g.attributes.normal;let complete=false;
  try{
   for(let start=0;start<p.count;start+=MAX_WORK_UNITS){const end=Math.min(p.count,start+MAX_WORK_UNITS);
    for(let i=start;i<end;i++){const y=p.getY(i),z=p.getZ(i);p.setXYZ(i,p.getX(i),z-minZ,cy-y);if(n){const ny=n.getY(i),nz=n.getZ(i);n.setXYZ(i,n.getX(i),nz,-ny);}}
    yield{kind:'character-geometry',phase:'sleep-transform',workUnits:end-start,maxWorkUnits:MAX_WORK_UNITS,work:{transformedVertices:end-start}};
   }
   g.boundingBox.set(new THREE.Vector3(oldBounds.min.x,0,cy-oldBounds.max.y),new THREE.Vector3(oldBounds.max.x,oldBounds.max.z-minZ,cy-oldBounds.min.y));
   if(g.boundingSphere){const c=g.boundingSphere.center,y=c.y,z=c.z;c.set(c.x,z-minZ,cy-y);}else g.boundingSphere=g.boundingBox.getBoundingSphere(new THREE.Sphere());
   p.needsUpdate=true;if(n)n.needsUpdate=true;complete=true;
  }finally{if(!complete)g.dispose();}
  g.userData={...g.userData,eyeState:'closed',pose:'sleeping',poseIndex:3,groundContacts:[],seatContact:null,seatPelvis:null,
   bodyHeightMeters:g.boundingBox.max.y,sleepingBounds:g.boundingBox.toArray?.()??{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},
   poseTransitions:'discrete-checked-bed-transfer',historyStatus:'requested-gameplay-rest-not-historical-schedule'};
  return g;
 }
 const t=CHARACTER_TEMPLATES[templateId];if(!t)throw new Error(`Unknown character template: ${templateId}`);if(!CHARACTER_POSES.includes(pose))throw new Error(`Unknown character pose: ${pose}`);if(!Number.isInteger(lod)||lod<0||lod>2)throw new Error(`Invalid character LOD: ${lod}`);
 const femalePose=options.femalePose??'resting';if(!['resting','walking'].includes(femalePose))throw new Error('Unknown female sample pose');if(femalePose==='walking'&&!isFemale(t))throw new Error('Female sample pose requires a female template');if(femalePose==='walking'&&pose!=='standing')throw new Error('Female walking sample requires standing pose');
 const seatVariant=options.seatVariant??'standard';if(!['standard','raised-footstool','kang-low','throne-front-perch','qianqing-low-foot'].includes(seatVariant))throw new Error(`Unknown seat variant: ${seatVariant}`);if(pose!=='seated'&&seatVariant!=='standard')throw new Error('A seat variant requires seated pose');
 const footY=['raised-footstool','throne-front-perch'].includes(seatVariant)?.30:seatVariant==='kang-low'?.06:seatVariant==='qianqing-low-foot'?-.10:0,footZ=seatVariant==='raised-footstool'?.79:seatVariant==='throne-front-perch'?.555:.51;
 const b=new Builder(lod),seg=[28,12,7][lod],off=pose==='standing'?0:pose==='seated'?-.29:-.58,z=pose==='seated'?-.04:pose==='kneeling'?.04:0;
 try {
 const pelvis=pose==='standing'?.89:pose==='seated'?.57:.33;
 const bodyRig={part:0,pivot:[0,pelvis,z],weight:1,torsoWeight:p=>clamp((p[1]-pelvis)/.17)};
 const skirtRig={part:6,pivot:[0,pelvis,z],weight:p=>clamp((pelvis-p[1])/.65),torsoWeight:p=>clamp((p[1]-pelvis)/.17)};
 let lower;
 if(pose==='standing')lower=[{y:.10,rx:.28,rz:.192,z:.008,wave:.008},{y:.20,rx:.276,rz:.185,z:.006},{y:.45,rx:.247,rz:.170,z:.004},{y:.72,rx:.215,rz:.152,z:0},{y:.97,rx:.184,rz:.138,z:0}];
 else if(pose==='seated'&&seatVariant==='raised-footstool')lower=[{y:.32,rx:.265,rz:.139,z:.77,wave:.008},{y:.40,rx:.263,rz:.142,z:.73},{y:.50,rx:.25,rz:.18,z:.60},{y:.58,rx:.255,rz:.276,z:.29},{y:.66,rx:.185,rz:.14,z:-.04}];
 else if(pose==='seated'&&seatVariant==='throne-front-perch')lower=[{y:.32,rx:.265,rz:.139,z:.535,wave:.008},{y:.40,rx:.263,rz:.142,z:.53},{y:.57,rx:.25,rz:.14,z:.46},{y:.67,rx:.255,rz:.16,z:.37},{y:.70,rx:.23,rz:.20,z:.24},{y:.66,rx:.185,rz:.14,z:-.04}];
 else if(pose==='seated')lower=[{y:.055,rx:.265,rz:.139,z:.48,wave:.008},{y:.18,rx:.263,rz:.142,z:.48},{y:.40,rx:.25,rz:.148,z:.44},{y:.52,rx:.255,rz:.276,z:.20},{y:.66,rx:.185,rz:.14,z:-.04}];
 else lower=[{y:.032,rx:.302,rz:.397,z:-.015,wave:.009},{y:.075,rx:.308,rz:.368,z:.025},{y:.18,rx:.265,rz:.294,z:.105},{y:.29,rx:.205,rz:.205,z:.07},{y:.39,rx:.184,rz:.138,z:.04}];
 if(pose==='seated'&&seatVariant==='kang-low'){lower=lower.map((r,i)=>({...r,y:r.y+footY*Math.max(0,1-i/3)}));lower.splice(3,0,{y:.49,rx:.255,rz:.175,z:.36});}
 if(pose==='seated'&&seatVariant==='qianqing-low-foot')lower=lower.map((r,i)=>({...r,y:r.y+footY*Math.max(0,1-i/3)}));
 if(isFemale(t)&&lod<2){
  // One continuous garment shell removes the false blouse/skirt seam. The
  // existing part IDs, pivots and weights are retained below the waist.
  const torso=femaleTorsoRings(t,off,z),first=b.p.length/3;
  const garment=[...lower.slice(0,-1),...torso];
  yield* b.loft(garment,seg,t.robe,bodyRig,.022);
  for(let i=first;i<b.p.length/3;i++){const y=b.p[i*3+1];if(y<=torso[0].y+.001){b.part[i]=6;b.w[i]=clamp((pelvis-y)/.65);}if(b.record('clothRigVertices'))yield b.progress();}
 }else yield* b.loft(lower,seg,t.robe,skirtRig,isFemale(t)?.018:lod===2?.025:.05);
 if(pose==='seated')yield* b.loft([{y:.49,rx:.18,rz:.17,z:-.04},{y:.535,rx:.205,rz:.19,z:-.04},{y:.65,rx:.194,rz:.153,z:-.04}],seg,t.robe,bodyRig,.012);
 if(isFemale(t)){yield* femaleOutfit(b,t,pose,lod,off,z,bodyRig,skirtRig,lower,seg);}else{
 const hem=lower[0],hemTop={...hem,y:hem.y+.05,rx:hem.rx*.995,rz:hem.rz*.995};if(lod<2)yield* b.loft([hem,hemTop],seg,t.trim,skirtRig,.05);
 if(lod<2)yield* b.loft([{...hemTop,y:hemTop.y+.002},{...hemTop,y:hemTop.y+.012}],seg,t.accent,skirtRig,.05);
 yield* b.loft([{y:.965+off,rx:.185,rz:.14,z},{y:1.06+off,rx:.181,rz:.142,z},{y:1.25+off,rx:.22,rz:.153,z},{y:1.36+off,rx:.234,rz:.14,z},{y:1.412+off,rx:.105,rz:.093,z},{y:1.432+off,rx:.058,rz:.056,z}],seg,t.robe,bodyRig,.012);
 // Separate vest silhouette, front closure, raised collar, and real waist band.
 if(t.silhouette==='guard')yield* b.loft([{y:.91+off,rx:.213,rz:.158,z},{y:1.07+off,rx:.198,rz:.155,z},{y:1.30+off,rx:.231,rz:.161,z},{y:1.35+off,rx:.225,rz:.15,z}],seg,t.trim,bodyRig,.015);
 if(lod<2)yield* b.loft([{y:1.395+off,rx:.079,rz:.073,z},{y:1.433+off,rx:.061,rz:.058,z}],seg,t.trim,bodyRig);
 if(lod<2)yield* b.loft([{y:.956+off,rx:.191,rz:.146,z},{y:1.002+off,rx:.189,rz:.147,z}],seg,t.trim,bodyRig);
 if(lod<2){
  yield* b.ribbon([[-.048,1.405+off,z+.075],[.075,1.335+off,z+.141],[.113,1.21+off,z+.136],[.125,1.03+off,z+.109]],.016,t.trim,bodyRig);
  yield* b.ribbon([[-.045,1.408+off,z+.078],[.080,1.336+off,z+.146],[.119,1.21+off,z+.14],[.131,1.03+off,z+.112]],.004,t.accent,bodyRig);
  yield* b.patch([[-.023,.966+off,z+.150],[.023,.966+off,z+.150],[.023,.994+off,z+.150],[-.023,.994+off,z+.150]],t.accent,bodyRig);
  for(const side of [-1,1]){const yy=.77+off*.55;yield* b.tube([[side*.14,.955+off,z+.12],[side*.18,yy,z+.15]],[[.006,.006],[.006,.006]],6,t.accent,bodyRig);}
 }
 yield* motif(b,t,pose,lod,off,z,bodyRig);
 if(lod===0&&pose==='standing'){
  // Woven hem waves on both faces. Kept as opaque geometry in the same draw call.
  for(const sign of [-1,1])for(let row=0;row<2;row++){const first=b.idx.length,pts=[];for(let i=0;i<=24;i++){const x=(i/24-.5)*.48;pts.push([x,.24+row*.065+.016*Math.sin(i*Math.PI/3),sign*(.181*Math.sqrt(Math.max(.1,1-(x/.272)**2))+.007)]);}yield* b.ribbon(pts,.004,t.accent,skirtRig);if(sign<0)for(let i=first;i<b.idx.length;i+=3){[b.idx[i+1],b.idx[i+2]]=[b.idx[i+2],b.idx[i+1]];if(b.record('flippedTriangles'))yield b.progress();}}
 }
 }
 for(const side of [-1,1])yield* arm(b,t,pose,lod,off,z,side,femalePose,seatVariant);
 yield* head(b,t,lod,off,z,options[SLEEP_EYES]===true);
 if(pose==='standing'){yield* shoe(b,-.105,0,.005,lod,4,pose);yield* shoe(b,.105,0,.005,lod,5,pose);}
 else if(pose==='seated'){yield* shoe(b,-.12,footY,footZ,lod,4,pose);yield* shoe(b,.12,footY,footZ,lod,5,pose);}
 else{yield* shoe(b,-.15,0,-.26,lod,4,pose);yield* shoe(b,.15,0,-.26,lod,5,pose);}
 const g=yield* b.geometry();
 g.userData={templateId,pose,lod,seatVariant,bodyHeightMeters:1.70,frontBackDecoration:true,materialCount:1,poseIndex:CHARACTER_POSES.indexOf(pose),groundContacts:pose==='standing'?[[-.105,0,.03],[.105,0,.03]]:pose==='seated'?[[-.12,footY,seatVariant==='raised-footstool'?.815:seatVariant==='throne-front-perch'?.58:.535],[.12,footY,seatVariant==='raised-footstool'?.815:seatVariant==='throne-front-perch'?.58:.535]]:[[-.15,0,-.235],[.15,0,-.235],[-.15,.032,.31],[.15,.032,.31]],seatPelvis:pose==='seated'?[0,.57,-.04]:null,seatContact:pose==='seated'?[0,.49,-.04]:null,boundsPaddingMeters:.20,triangles:g.index.count/3,evidenceRefs:t.evidenceRefs,historyStatus:'interpretive-simplification',poseTransitions:'not-implemented'};
 if(femalePose==='walking'){g.userData.samplePose='walking';}
 return g;
 } finally { b.clear(); }
}

/** Compatibility API: execute exactly the same resumable production path. */
export function createCharacterGeometry(templateId,pose='standing',lod=0,options={}){
 const steps=createCharacterGeometrySteps(templateId,pose,lod,options);let result;
 do{result=steps.next();}while(!result.done);
 return result.value;
}
