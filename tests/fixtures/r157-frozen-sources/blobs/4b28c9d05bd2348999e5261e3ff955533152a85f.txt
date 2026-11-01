/**
 * Evidence-specific profiles for the four axial-court side gates.
 * +Z is north; -X east. Each gate faces outward along its local -Z.
 * Only values in `verified` are sourced measurements. All other dimensions,
 * detailed column lines, leaf sizes and ramp polygons are engineering assumptions.
 * Sources and independent unknowns: docs/current-state/cards/{profile}-gate.md.
 */
const profiles = {
  xiehe: {
    name:'协和门', id:'axis-courts/obj-002', facing:'east', source:'https://www.dpm.org.cn/explore/building/236540.html',
    bayWidths:[5,5.6,6,5.6,5], depth:10, depthBays:2, platformY:2.62, columnH:6.2,
    ridgeAbovePlatform:11.43, frontRun:17.75, rearRun:17.75,
    rearFlare:{left:0,right:11.9}, railings:true, doorLine:'provisional-middle', doorRatio:0,
    verified:{bays:5,depthBays:2,portals:3,platformHeight:2.62,frontRampLength:17.75,rearRampLength:17.75,ridgeAbovePlatform:11.43,rearToeWidth:29.9,rearFlareSide:'south'},
  },
  xihe: {
    name:'熙和门', id:'axis-courts/obj-003', facing:'west', source:'https://www.dpm.org.cn/explore/building/236567.html',
    bayWidths:[5,5.5,5.8,5.5,5], depth:9.6, depthBays:2, platformY:2.62, columnH:6,
    ridgeAbovePlatform:10.9, frontRun:17.75, rearRun:17.75,
    rearFlare:{left:8,right:0}, railings:true, doorLine:'ridge-grid', doorRatio:0, sideDoor:true,
    verified:{bays:5,depthBays:2,portals:3,platformHeight:2.62,frontRampLength:17.75,rearRampLength:17.75,doorLine:'ridge-grid',endWindows:'front-and-rear',sideDoor:true,rearFlare:'river-following east courtyard side; exact outline unknown'},
  },
  jingyun: {
    name:'景运门', id:'axis-courts/obj-006', facing:'east', source:'https://www.dpm.org.cn/explore/building/236497.html',
    bayWidths:[4.4,4.7,5,4.7,4.4], depth:8.4, depthBays:null, platformY:.48, columnH:4.4,
    ridgeAbovePlatform:8.6, frontRun:4.8, rearRun:5.2,
    rearFlare:{left:0,right:0}, railings:false, doorLine:'rear-inner-column', doorRatio:.25,
    verified:{bays:5,portals:3,doorLine:'rear-inner-column',ramps:'both sides; low platform visible in photographs'},
  },
  longzong: {
    name:'隆宗门', id:'axis-courts/obj-007', facing:'west', source:'https://www.dpm.org.cn/explore/building/236496.html',
    bayWidths:[4.5,4.7,5,4.7,4.5], depth:8.2, depthBays:null, platformY:.42, columnH:4.5,
    ridgeAbovePlatform:8.7, frontRun:4.5, rearRun:4.7,
    rearFlare:{left:0,right:0}, railings:false, doorLine:'rear-inner-column', doorRatio:.25,
    verified:{bays:5,portals:3,doorLine:'rear-inner-column',ramps:'both sides; low platform visible in photograph'},
  },
};
const FACE={south:0,north:Math.PI,east:Math.PI/2,west:-Math.PI/2};

/** Shared by the builder and route QA; never infers gate type from width/name. */
export function sideGateGeometry(item) {
  const key=item.gateProfile;
  if(typeof key!=='string'||!Object.hasOwn(profiles,key)) throw new Error(`Unsupported side gate profile: ${String(key)}`);
  const source=profiles[key];
  const p=structuredClone(source);
  const width=p.bayWidths.reduce((a,b)=>a+b,0);
  const columnXs=[-width/2];
  for(const bay of p.bayWidths) columnXs.push(columnXs.at(-1)+bay);
  const bayCenters=p.bayWidths.map((w,i)=>(columnXs[i]+columnXs[i+1])/2);
  const radius=.28, platformWidth=width+1.2, platformDepth=p.depth+2;
  const rampHalf=(p.bayWidths[1]+p.bayWidths[2]+p.bayWidths[3]+.8)/2;
  const ramps=[['front',-1,p.frontRun],['rear',1,p.rearRun]].map(([side,sign,run])=>({
    side,zTop:sign*platformDepth/2,zToe:sign*(platformDepth/2+run),yTop:p.platformY,yToe:0,
    leftTop:-rampHalf,rightTop:rampHalf,
    leftToe:-rampHalf-(side==='rear'?p.rearFlare.left:0),
    rightToe:rampHalf+(side==='rear'?p.rearFlare.right:0),
  }));
  // The one supported 29.9 m measurement is a ramp toe, never a hall width.
  if(key==='xiehe') ramps[1].rightToe=ramps[1].leftToe+29.9;
  const rawRot=item.rot===undefined?FACE[p.facing]:typeof item.rot==='string'&&Object.hasOwn(FACE,item.rot)?FACE[item.rot]:item.rot;
  if(typeof rawRot!=='number'||!Number.isFinite(rawRot)) throw new Error('Side gate rotation must be a finite cardinal angle or named direction');
  const turn=Math.PI*2,quarter=Math.PI/2;
  const normalized=((rawRot%turn)+turn)%turn;
  const cardinal=Math.round(normalized/quarter)*quarter;
  if(Math.abs(normalized-cardinal)>1e-8) throw new Error('Side gate rotation must be cardinal; tapered walkables are axis-aligned');
  const rot=cardinal===turn?0:cardinal;
  const x=item.x===undefined?0:item.x,z=item.z===undefined?0:item.z;
  if(!Number.isFinite(x)||!Number.isFinite(z)) throw new Error('Side gate position must contain finite numeric x/z coordinates');
  const c=Math.cos(rot),s=Math.sin(rot);
  const facing=['south','east','north','west'][Math.round(rot/quarter)];
  const toWorld=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
  return {...p,sourceFacing:p.facing,facing,x,z,profile:key,width,platformWidth,platformDepth,radius,columnXs,bayCenters,
    ridgeZ:0,doorZ:p.depth*p.doorRatio,
    columnZs:p.depthBays===2?[-p.depth/2,0,p.depth/2]:[-p.depth/2,-p.depth*.25,p.depth*.25,p.depth/2],
    portals:[1,2,3].map(i=>({bay:i,centerX:bayCenters[i],clearWidth:p.bayWidths[i]-2*radius-.2})),
    portalCenters:bayCenters.slice(1,4),ramps,rot,toWorld,
  };
}
