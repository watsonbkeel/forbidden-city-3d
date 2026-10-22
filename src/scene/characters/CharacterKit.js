import * as THREE from 'three';

/** Qing-themed interpretation, not a reconstruction of a dated individual costume.
 *  One opaque, vertex-coloured merged mesh per template / pose / LOD.
 *  Metres, Y up, facing +Z; bare-headed standing calibration height 1.70 m.
 */
export const CHARACTER_POSES = Object.freeze(['standing', 'seated', 'kneeling']);
export const CHARACTER_TEMPLATES = Object.freeze({
  'emperor-ceremonial': { label:'Imperial ceremonial', robe:0xc9982d, trim:0x332c25, lining:0x87702e, accent:0xe7c66a, hat:'court', motif:'roundel', silhouette:'imperial', evidenceRefs:['H1','H3'] },
  'official-ceremonial': { label:'Court official', robe:0x253b55, trim:0x182331, lining:0x546b78, accent:0xc5ab67, hat:'court', motif:'rank-square', silhouette:'official', evidenceRefs:['H1','H3'] },
  'ritual-attendant': { label:'Ritual attendant', robe:0x703b36, trim:0x30282b, lining:0x90584a, accent:0xb99b5f, hat:'court', motif:'border', silhouette:'attendant', evidenceRefs:['H1'] },
  'consort-daily': { label:'Unnamed consort', robe:0x456e6b, trim:0x244743, lining:0x91a89b, accent:0xd9b875, hat:'dressed-hair', motif:'floral', silhouette:'female', evidenceRefs:['H4','H6'] },
  'maid-daily': { label:'Palace maid', robe:0x8999a2, trim:0x354a59, lining:0xb2a5a0, accent:0xba8e78, hat:'simple-hair', motif:'border', silhouette:'maid', evidenceRefs:['H4','H6'] },
  'eunuch-daily': { label:'Palace attendant', robe:0x646d7c, trim:0x292f3c, lining:0x8c9296, accent:0xa5a086, hat:'cap', motif:'border', silhouette:'attendant', evidenceRefs:['H6'] },
  'guard-duty': { label:'Gate guard', robe:0x35475d, trim:0x1f2935, lining:0x596576, accent:0xb89955, hat:'guard', motif:'studs', silhouette:'guard', evidenceRefs:['H1'] },
});

const SKIN=0xbe8e6d, SKIN_LIGHT=0xd0a281, HAIR=0x201c1b, SOLE=0x695b48;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const scaleColor=(hex,f)=>{const c=new THREE.Color(hex);c.multiplyScalar(f);return c;};
class Builder {
  constructor(lod=0){this.lod=lod;this.p=[];this.c=[];this.part=[];this.piv=[];this.w=[];this.tw=[];this.idx=[];}
  vertex(p,color,rig={}) {const i=this.p.length/3;this.p.push(...p);const c=color.isColor?color:new THREE.Color(color);this.c.push(c.r,c.g,c.b);this.part.push(rig.part??0);this.piv.push(...(rig.pivot??[0,0,0]));this.w.push(typeof rig.weight==='function'?rig.weight(p):(rig.weight??1));this.tw.push(typeof rig.torsoWeight==='function'?rig.torsoWeight(p):(rig.torsoWeight??0));return i;}
  tri(a,b,c){this.idx.push(a,b,c);}
  quad(a,b,c,d){this.tri(a,b,d);this.tri(b,c,d);}
  loft(rings,segments,color,rig={},pleats=0) {
    if(this.lod===2&&rings.length>3)rings=[rings[0],rings[Math.floor(rings.length/2)],rings[rings.length-1]];
    const start=this.p.length/3;
    rings.forEach((r,j)=>{for(let i=0;i<segments;i++){const a=2*Math.PI*i/segments;const f=1+pleats*Math.cos(a*12+(j%2)*.14);const p=[(r.x??0)+r.rx*Math.sin(a)*f,r.y+(r.wave??0)*Math.cos(a*12),(r.z??0)+r.rz*Math.cos(a)*f];this.vertex(p,scaleColor(color,1+.025*Math.cos(a*12)),rig);}});
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const ni=(i+1)%segments;this.quad(start+j*segments+i,start+j*segments+ni,start+(j+1)*segments+ni,start+(j+1)*segments+i);}
    for(const [j,flip] of [[0,true],[rings.length-1,false]]){const r=rings[j];const c=this.vertex([r.x??0,r.y,r.z??0],color,rig);for(let i=0;i<segments;i++){const a=start+j*segments+i,b=start+j*segments+(i+1)%segments;flip?this.tri(c,b,a):this.tri(c,a,b);}}
  }
  tube(points,radii,segments,color,rig={},caps=true) {
    if(this.lod===2&&points.length>3){const mid=Math.floor(points.length/2);radii=[radii[0],radii[mid],radii[radii.length-1]];points=[points[0],points[mid],points[points.length-1]];}
    const start=this.p.length/3;
    points.forEach((p,j)=>{const prev=points[Math.max(0,j-1)],next=points[Math.min(points.length-1,j+1)],t=new THREE.Vector3(...next).sub(new THREE.Vector3(...prev)).normalize();let u=new THREE.Vector3(0,0,1).cross(t).normalize();if(u.length()<.1)u.set(1,0,0);const v=new THREE.Vector3().crossVectors(t,u).normalize();const r=radii[j];for(let i=0;i<segments;i++){const a=2*Math.PI*i/segments;this.vertex([p[0]+u.x*Math.cos(a)*r[0]+v.x*Math.sin(a)*r[1],p[1]+u.y*Math.cos(a)*r[0]+v.y*Math.sin(a)*r[1],p[2]+u.z*Math.cos(a)*r[0]+v.z*Math.sin(a)*r[1]],scaleColor(color,1+.035*Math.cos(a*6)),rig);}});
    for(let j=0;j<points.length-1;j++)for(let i=0;i<segments;i++)this.quad(start+j*segments+i,start+j*segments+(i+1)%segments,start+(j+1)*segments+(i+1)%segments,start+(j+1)*segments+i);
    if(caps)for(const [j,flip]of[[0,true],[points.length-1,false]]){const c=this.vertex(points[j],color,rig);for(let i=0;i<segments;i++){const a=start+j*segments+i,b=start+j*segments+(i+1)%segments;flip?this.tri(c,b,a):this.tri(c,a,b);}}
  }
  ribbon(points,width,color,rig={}) {for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;const ox=-dy/l*width/2,oy=dx/l*width/2;const ids=[[a[0]+ox,a[1]+oy,a[2]],[a[0]-ox,a[1]-oy,a[2]],[b[0]-ox,b[1]-oy,b[2]],[b[0]+ox,b[1]+oy,b[2]]].map(p=>this.vertex(p,color,rig));this.quad(...ids);}}
  patch(points,color,rig={}) {const ids=points.map(p=>this.vertex(p,color,rig));const contour=points.map(p=>new THREE.Vector2(p[0],p[1]));for(const tri of THREE.ShapeUtils.triangulateShape(contour,[]))this.tri(ids[tri[0]],ids[tri[1]],ids[tri[2]]);}
  geometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.setAttribute('characterPart',new THREE.Float32BufferAttribute(this.part,1));g.setAttribute('characterPivot',new THREE.Float32BufferAttribute(this.piv,3));g.setAttribute('characterWeight',new THREE.Float32BufferAttribute(this.w,1));g.setAttribute('characterTorsoWeight',new THREE.Float32BufferAttribute(this.tw,1));g.setIndex(this.idx);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;}
}

function circularPatch(b,c,r,color,rig,segments=20){const pts=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2;pts.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),c[2]]);}b.patch(pts,color,rig);}
function circleLine(b,c,r,width,color,rig,segments=24){const pts=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;pts.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),c[2]]);}b.ribbon(pts,width,color,rig);}
function motif(b,t,pose,lod,off,z,rig){
  if(lod===2)return;
  const y=1.215+off;
  for(const sign of [1,-1]){
    const firstTriangle=b.idx.length,firstVertex=b.p.length/3;
    const zz=z+sign*.166;
    if(t.motif==='roundel'){
      // Open embroidered roundel follows the cloth, without a floating flat badge plate.
      circleLine(b,[0,y,zz+sign*.001],.088,.006,t.accent,rig,lod===0?24:12);
      // Authored ornamental coil: a simplified dragon roundel, not a rank-square.
      const coil=[[.044,.043],[.012,.057],[-.032,.043],[-.052,.014],[-.041,-.027],[-.009,-.046],[.028,-.028],[.034,.006],[.009,.024],[-.012,.009],[-.006,-.014]];
      b.ribbon(coil.map(([x,dy])=>[x,y+dy,zz+sign*.002]),.011,t.accent,rig);
      b.patch([[.033,y+.045,zz+sign*.003],[.047,y+.062,zz+sign*.003],[.065,y+.053,zz+sign*.003],[.072,y+.037,zz+sign*.003],[.053,y+.029,zz+sign*.003],[.038,y+.035,zz+sign*.003]],t.accent,rig);
      b.ribbon([[.046,y+.055,zz+sign*.004],[.039,y+.075,zz+sign*.004],[.025,y+.072,zz+sign*.004]],.004,t.accent,rig);
      for(const side of [-1,1]){b.ribbon([[side*.025,y+.003,zz+sign*.003],[side*.054,y+.013,zz+sign*.003],[side*.065,y-.004,zz+sign*.003]],.006,t.accent,rig);b.ribbon([[side*.054,y+.013,zz+sign*.003],[side*.071,y+.019,zz+sign*.003]],.003,t.accent,rig);}
      if(lod===0)circularPatch(b,[.053,y+.048,zz+sign*.005],.003,t.trim,rig,6);
    } else if(t.motif==='rank-square'){
      const s=.082;for(let ix=0;ix<3;ix++)for(let iy=0;iy<3;iy++){const x0=-s+ix*s*2/3,x1=x0+s*2/3,y0=y-s+iy*s*2/3,y1=y0+s*2/3;b.patch([[x0,y0,zz],[x1,y0,zz],[x1,y1,zz],[x0,y1,zz]],t.trim,rig);}
      b.ribbon([[-s,y-s,zz+sign*.001],[s,y-s,zz+sign*.001],[s,y+s,zz+sign*.001],[-s,y+s,zz+sign*.001],[-s,y-s,zz+sign*.001]],.006,t.accent,rig);
      // Stylised bird with opened wing, not a specific unverified official rank.
      b.patch([[-.061,y+.005,zz+sign*.002],[-.015,y+.035,zz+sign*.002],[.018,y+.015,zz+sign*.002],[.057,y+.046,zz+sign*.002],[.035,y-.002,zz+sign*.002],[.009,y-.025,zz+sign*.002],[-.027,y-.015,zz+sign*.002]],t.accent,rig);
      b.ribbon([[-.052,y-.049,zz+sign*.003],[0,y-.037,zz+sign*.003],[.053,y-.049,zz+sign*.003]],.004,t.accent,rig);
    } else if(t.motif==='floral'){
      for(const cx of [-.08,.08])for(let k=0;k<5;k++){const a=k/5*Math.PI*2; circularPatch(b,[cx+.017*Math.cos(a),y+.022*Math.sin(a),zz],.016,t.accent,rig,8);}
    } else if(t.motif==='studs') {
      for(let row=0;row<(lod===0?4:3);row++)for(let col=0;col<5;col++)circularPatch(b,[(col-2)*.057,y+(row-1.5)*.063,zz],lod===0?.006:.008,t.accent,rig,6);
    }
    for(let vi=firstVertex;vi<b.p.length/3;vi++){
      const xx=b.p[vi*3],yy=b.p[vi*3+1]-off;
      const rr=t.silhouette==='guard'?.164:.155;
      const rx=t.silhouette==='guard'?.231:.22;
      const layer=Math.abs(b.p[vi*3+2]-zz);
      b.p[vi*3+2]=z+sign*(rr*Math.sqrt(Math.max(.1,1-(xx/rx)**2))+.006+layer*3);
    }
    if(sign<0)for(let i=firstTriangle;i<b.idx.length;i+=3)[b.idx[i+1],b.idx[i+2]]=[b.idx[i+2],b.idx[i+1]];
  }
}

function head(b,t,lod,off,z){
  const seg=[20,8,6][lod],pivot=[0,1.425+off,z],rig={part:1,pivot,weight:p=>clamp((p[1]-(1.405+off))/.04),torsoWeight:1};
  b.loft([{y:1.405+off,rx:.049,rz:.046,z},{y:1.465+off,rx:.054,rz:.051,z}],seg,SKIN,rig);
  b.loft([{y:1.452+off,rx:.035,rz:.042,z:z+.012},{y:1.47+off,rx:.057,rz:.066,z:z+.008},{y:1.51+off,rx:.076,rz:.077,z},{y:1.56+off,rx:.081,rz:.076,z},{y:1.61+off,rx:.077,rz:.069,z:z-.004},{y:1.665+off,rx:.055,rz:.047,z:z-.006},{y:1.70+off,rx:.012,rz:.012,z:z-.007}],seg,SKIN_LIGHT,rig);
  if(lod===0){
    for(const s of [-1,1]){
      b.loft([{x:s*.078,y:1.512+off,rx:.008,rz:.013,z:z-.003},{x:s*.083,y:1.544+off,rx:.012,rz:.015,z:z-.004},{x:s*.077,y:1.565+off,rx:.005,rz:.01,z:z-.004}],8,SKIN,rig);
      const ey=1.566+off,ex=s*.034,ez=z+.071;
      b.patch([[ex-.019,ey,ez],[ex-.009,ey+.004,ez+.003],[ex+.012,ey+.003,ez],[ex+.018,ey-.001,ez],[ex+.004,ey-.004,ez+.002]],HAIR,rig);
      b.ribbon([[ex-.019,ey+.015,ez-.002],[ex,ey+.019,ez+.001],[ex+.018,ey+.014,ez-.002]],.006,HAIR,rig);
    }
    b.patch([[-.013,1.575+off,z+.071],[.013,1.575+off,z+.071],[.017,1.526+off,z+.080],[0,1.526+off,z+.104],[-.017,1.526+off,z+.080]],SKIN,rig);
    b.patch([[-.024,1.500+off,z+.075],[0,1.496+off,z+.084],[.024,1.500+off,z+.075],[0,1.504+off,z+.083]],0x865647,rig);
    b.ribbon([[-.019,1.500+off,z+.080],[0,1.499+off,z+.086],[.019,1.500+off,z+.080]],.002,0x5c3e34,rig);
  }
  if(t.hat==='dressed-hair'||t.hat==='simple-hair'){
    b.loft([{y:1.603+off,rx:.08,rz:.072,z:z-.005},{y:1.66+off,rx:.079,rz:.070,z:z-.01},{y:1.703+off,rx:.043,rz:.044,z:z-.012}],seg,HAIR,rig);
    b.loft([{y:1.67+off,rx:.041,rz:.045,z:z-.058},{y:1.735+off,rx:.043,rz:.039,z:z-.05},{y:1.755+off,rx:.01,rz:.01,z:z-.04}],seg,HAIR,rig);
    if(t.hat==='dressed-hair'&&lod<2){b.tube([[-.115,1.693+off,z-.025],[.115,1.713+off,z-.025]],[[.006,.006],[.006,.006]],6,t.accent,rig);for(const s of [-1,1]){circularPatch(b,[s*.075,1.684+off,z+.043],.018,0xc6a15a,rig,10);b.tube([[s*.084,1.546+off,z],[s*.084,1.51+off,z]],[[.003,.003],[.004,.004]],6,t.accent,rig);}}
  } else {
    const court=t.hat==='court',guard=t.hat==='guard';
    b.loft([{y:1.625+off,rx:.109,rz:.101,z:z-.007},{y:1.646+off,rx:.111,rz:.103,z:z-.007},{y:1.667+off,rx:.092,rz:.088,z:z-.007}],seg,t.trim,rig);
    b.loft([{y:1.66+off,rx:.093,rz:.087,z:z-.007},{y:1.724+off,rx:guard?.064:.060,rz:guard?.060:.056,z:z-.007},{y:1.771+off,rx:.012,rz:.012,z:z-.007}],seg,court?0x9e4437:(guard?0x5b6467:t.trim),rig);
    if(court||guard)b.loft([{y:1.766+off,rx:.018,rz:.018,z:z-.007},{y:1.792+off,rx:.016,rz:.016,z:z-.007},{y:1.808+off,rx:.004,rz:.004,z:z-.007}],seg,t.accent,rig);
    if(lod===0&&court){for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b.tube([[.013*Math.sin(a),1.765+off,z-.007+.013*Math.cos(a)],[.08*Math.sin(a),1.677+off,z-.007+.075*Math.cos(a)]],[[.002,.002],[.002,.002]],4,0xa94b3a,rig);}}
    if(lod<2){b.tube([[0,1.60+off,z-.071],[0,1.43+off,z-.092],[.012,1.27+off,z-.148]],[[.013,.012],[.012,.012],[.006,.006]],6,HAIR,rig);}
  }
}
function shoe(b,x,y,z,lod,part,pose){
 const rig={part,pivot:[x,pose==='standing'?.79:.43,z-.02],weight:1,torsoWeight:0};const seg=[12,6,5][lod];
 if(lod<2)b.loft([{x,y,rx:.061,rz:.137,z:z+.025},{x,y:y+.021,rx:.065,rz:.139,z:z+.025},{x,y:y+.024,rx:.063,rz:.137,z:z+.025}],seg,SOLE,rig);
 b.loft([{x,y:y+.024,rx:.064,rz:.134,z:z+.025},{x,y:y+.065,rx:.060,rz:.124,z:z+.027},{x,y:y+.10,rx:.042,rz:.08,z:z-.01}],seg,0x242329,rig);
}
function arm(b,t,pose,lod,off,z,side){
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
 b.tube(points,radii,seg,t.robe,rig);
 const direction=new THREE.Vector3(...wrist).sub(new THREE.Vector3(...points[points.length-2])).normalize();
 const cuffStart=wrist.map((v,i)=>v-direction.getComponent(i)*.040);
 if(lod<2)b.tube([cuffStart,wrist],[[.077*broad,.069],[.073*broad,.065]],seg,t.trim,rig,false);
 if(lod===0){const goldStart=wrist.map((v,i)=>v-direction.getComponent(i)*.031),goldEnd=wrist.map((v,i)=>v-direction.getComponent(i)*.025);b.tube([goldStart,goldEnd],[[.079*broad,.071],[.079*broad,.071]],seg,t.accent,rig,false);}
 const handEnd=wrist.map((v,i)=>v+direction.getComponent(i)*.085),handMid=wrist.map((v,i)=>v+direction.getComponent(i)*.042);
 b.tube([wrist,handMid,handEnd],[[.031,.023],[.034,.025],[.024,.016]],seg,SKIN_LIGHT,rig);
 if(lod===0){const thumbStart=handMid.map((v,i)=>v+(i===0?-side*.025:0));const thumbEnd=thumbStart.map((v,i)=>v+(i===0?-side*.016:i===1?-.014:.021));b.tube([thumbStart,thumbEnd],[[.012,.012],[.008,.008]],8,SKIN,rig);}
}
export function createCharacterGeometry(templateId,pose='standing',lod=0,options={}){
 const t=CHARACTER_TEMPLATES[templateId];if(!t)throw new Error(`Unknown character template: ${templateId}`);if(!CHARACTER_POSES.includes(pose))throw new Error(`Unknown character pose: ${pose}`);if(!Number.isInteger(lod)||lod<0||lod>2)throw new Error(`Invalid character LOD: ${lod}`);
 const seatVariant=options.seatVariant??'standard';if(!['standard','raised-footstool','kang-low','throne-front-perch'].includes(seatVariant))throw new Error(`Unknown seat variant: ${seatVariant}`);if(pose!=='seated'&&seatVariant!=='standard')throw new Error('A seat variant requires seated pose');
 const footY=['raised-footstool','throne-front-perch'].includes(seatVariant)?.30:seatVariant==='kang-low'?.04:0,footZ=seatVariant==='raised-footstool'?.79:seatVariant==='throne-front-perch'?.555:.51;
 const b=new Builder(lod),seg=[28,12,7][lod],off=pose==='standing'?0:pose==='seated'?-.29:-.58,z=pose==='seated'?-.04:pose==='kneeling'?.04:0;
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
 b.loft(lower,seg,t.robe,skirtRig,lod===2?.025:.05);
 if(pose==='seated')b.loft([{y:.49,rx:.18,rz:.17,z:-.04},{y:.535,rx:.205,rz:.19,z:-.04},{y:.65,rx:.194,rz:.153,z:-.04}],seg,t.robe,bodyRig,.012);
 const hem=lower[0],hemTop={...hem,y:hem.y+.05,rx:hem.rx*.995,rz:hem.rz*.995};if(lod<2)b.loft([hem,hemTop],seg,t.trim,skirtRig,.05);
 if(lod<2)b.loft([{...hemTop,y:hemTop.y+.002},{...hemTop,y:hemTop.y+.012}],seg,t.accent,skirtRig,.05);
 b.loft([{y:.965+off,rx:.185,rz:.14,z},{y:1.06+off,rx:.181,rz:.142,z},{y:1.25+off,rx:.22,rz:.153,z},{y:1.36+off,rx:.234,rz:.14,z},{y:1.412+off,rx:.105,rz:.093,z},{y:1.432+off,rx:.058,rz:.056,z}],seg,t.robe,bodyRig,.012);
 // Separate vest silhouette, front closure, raised collar, and real waist band.
 if(t.silhouette==='guard')b.loft([{y:.91+off,rx:.213,rz:.158,z},{y:1.07+off,rx:.198,rz:.155,z},{y:1.30+off,rx:.231,rz:.161,z},{y:1.35+off,rx:.225,rz:.15,z}],seg,t.trim,bodyRig,.015);
 if(lod<2)b.loft([{y:1.395+off,rx:.079,rz:.073,z},{y:1.433+off,rx:.061,rz:.058,z}],seg,t.trim,bodyRig);
 if(lod<2)b.loft([{y:.956+off,rx:.191,rz:.146,z},{y:1.002+off,rx:.189,rz:.147,z}],seg,t.trim,bodyRig);
 if(lod<2){
  b.ribbon([[-.048,1.405+off,z+.075],[.075,1.335+off,z+.141],[.113,1.21+off,z+.136],[.125,1.03+off,z+.109]],.016,t.trim,bodyRig);
  b.ribbon([[-.045,1.408+off,z+.078],[.080,1.336+off,z+.146],[.119,1.21+off,z+.14],[.131,1.03+off,z+.112]],.004,t.accent,bodyRig);
  b.patch([[-.023,.966+off,z+.150],[.023,.966+off,z+.150],[.023,.994+off,z+.150],[-.023,.994+off,z+.150]],t.accent,bodyRig);
  for(const side of [-1,1]){const yy=.77+off*.55;b.tube([[side*.14,.955+off,z+.12],[side*.18,yy,z+.15]],[[.006,.006],[.006,.006]],6,t.accent,bodyRig);}
 }
 motif(b,t,pose,lod,off,z,bodyRig);
 if(lod===0&&pose==='standing'){
  // Woven hem waves on both faces. Kept as opaque geometry in the same draw call.
  for(const sign of [-1,1])for(let row=0;row<2;row++){const first=b.idx.length,pts=[];for(let i=0;i<=24;i++){const x=(i/24-.5)*.48;pts.push([x,.24+row*.065+.016*Math.sin(i*Math.PI/3),sign*(.181*Math.sqrt(Math.max(.1,1-(x/.272)**2))+.007)]);}b.ribbon(pts,.004,t.accent,skirtRig);if(sign<0)for(let i=first;i<b.idx.length;i+=3)[b.idx[i+1],b.idx[i+2]]=[b.idx[i+2],b.idx[i+1]];}
 }
 for(const side of [-1,1])arm(b,t,pose,lod,off,z,side);
 head(b,t,lod,off,z);
 if(pose==='standing'){shoe(b,-.105,0,.005,lod,4,pose);shoe(b,.105,0,.005,lod,5,pose);}
 else if(pose==='seated'){shoe(b,-.12,footY,footZ,lod,4,pose);shoe(b,.12,footY,footZ,lod,5,pose);}
 else{shoe(b,-.15,0,-.26,lod,4,pose);shoe(b,.15,0,-.26,lod,5,pose);}
 const g=b.geometry();
 g.userData={templateId,pose,lod,seatVariant,bodyHeightMeters:1.70,frontBackDecoration:true,materialCount:1,poseIndex:CHARACTER_POSES.indexOf(pose),groundContacts:pose==='standing'?[[-.105,0,.03],[.105,0,.03]]:pose==='seated'?[[-.12,footY,seatVariant==='raised-footstool'?.815:seatVariant==='throne-front-perch'?.58:.535],[.12,footY,seatVariant==='raised-footstool'?.815:seatVariant==='throne-front-perch'?.58:.535]]:[[-.15,0,-.235],[.15,0,-.235],[-.15,.032,.31],[.15,.032,.31]],seatPelvis:pose==='seated'?[0,.57,-.04]:null,seatContact:pose==='seated'?[0,.49,-.04]:null,boundsPaddingMeters:.20,triangles:g.index.count/3,evidenceRefs:t.evidenceRefs,historyStatus:'interpretive-simplification',poseTransitions:'not-implemented'};
 return g;
}
