/** FC-9252CFFDAB 贞度门. Historic documentary envelope, bounded contemporary
 * photo-visible detail, and explicitly uncertain engineering closure are kept
 * separate. Never a survey or an accepted whole-building reconstruction. */
const FACE={south:0,east:Math.PI/2,north:Math.PI,west:-Math.PI/2};
const PHOTO='https://taociguan.dpm.org.cn/images/zjcphoto/2023-12-05/9f53a288418e4364b1c3b3b5e98321ec.jpg';
const PAPER='https://img.dpm.org.cn/Uploads/pdf/2198/T00018_00.pdf';

export function zhenduGateGeometry(item={}) {
  if(item.gateProfile!=='zhendu')throw new Error('Unsupported Zhendu gate profile');
  if(item.gateKind!=='three-bay')throw new Error('Zhendu topology requires explicit three-bay gateKind');
  const x=item.x??0,z=item.z??0;
  if(item.x===null||item.z===null||typeof x!=='number'||typeof z!=='number'||!Number.isFinite(x)||!Number.isFinite(z))throw new Error('Zhendu position must be finite numeric x/z');
  for(const key of ['w','h','t'])if(item[key]!==undefined&&(typeof item[key]!=='number'||!Number.isFinite(item[key])||item[key]<=0))throw new Error(`Zhendu dimension ${key} must be positive and finite`);
  if(item.open!==undefined&&typeof item.open!=='boolean')throw new Error('Zhendu open state must be boolean');
  const angle=item.rot===undefined?0:typeof item.rot==='string'&&Object.hasOwn(FACE,item.rot)?FACE[item.rot]:item.rot;
  if(typeof angle!=='number'||!Number.isFinite(angle))throw new Error('Zhendu rotation must be cardinal');
  const quarter=Math.PI/2,turn=2*Math.PI,n=((angle%turn)+turn)%turn,k=Math.round(n/quarter);
  if(Math.abs(n-k*quarter)>1e-8)throw new Error('Zhendu rotation must be cardinal');
  const quadrant=k%4,rot=quadrant*quarter,c=[1,0,-1,0][quadrant],s=[0,1,0,-1][quadrant];
  const toWorld=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
  const documentary={source:'WANG-1983-p18',url:PAPER,appliesTo:'昭德门、贞度门',
    raw:{widthChi:62.9,depthChi:41.4,plinthToRidgeChi:40.45,groundToRidgeChi:50.5},metresPerChi:.32,
    topology:{coreWidthBays:3,coreDepthBays:1,surroundingVeranda:true,purlins:9,eaves:1,roof:'xieshan'},
    boundary:'Outer column envelope includes lateral verandas; depth includes front veranda, not an independently measured symmetric split.',
    datum:'Historic rebuilding document and 1983 comparison; not contemporary pavement survey.'};
  const derived={buildingWidth:20.128,buildingDepth:13.248,plinthRise:3.216,ridgeAbovePlatform:12.944,ridgeAboveHistoricGround:16.16};
  const photoFit={status:'PHOTO_FIT',source:PHOTO,coverage:'Cropped oblique front detail; not complete facade, rear or plan.',
    columnHeight:{value:6,range:[5.47,6.75],relativeTo:'documentary platform rise',ratioRange:[1.7,2.1]},
    columnDiameter:{value:.58,range:[.45,.69],relativeTo:'visible column height',ratioRange:[.075,.115]},
    railHeight:{value:1.05,range:[.84,1.22],relativeTo:'documentary platform rise',ratioRange:[.26,.38]},
    caveat:'Conservative observation envelopes under perspective/occlusion, not statistical confidence bounds. Refit after camera match.'};
  const assumptions={status:'ENGINEERING_ASSUMPTION',coreBayWidths:[4.95,5.85,4.95],frontVerandaDepth:2.5,rearVerandaDepth:2.3,
    platformWidth:{value:24,range:[22.5,26.5]},platformDepth:{value:19.6,range:[17.5,23]},
    frontRun:{value:17.8,range:[14,21]},rearRun:{value:16.8,range:[13,22]},
    clearPortalWidth:{value:4.65,range:[4.1,5.2]},rampTravelWidth:{value:9,range:[7.5,10.5]},cheekWidth:{value:.9,range:[.6,1.3]},
    doorHeight:5.1,wallThickness:.4,roofOverhang:1.55,railMaximumSpacing:1.85,
    north:'Aligned open outlet and closed side panels preserve gameplay; rear facade and leaf arrangement are unobserved.',
    lateralBays:'Core side walls are inset from outer columns; narrow front/rear bay closures are conservative unknown access, not observed additional portals.',
    wings:'Closed contacts at inherited corridor centreline only; no invented lateral floor connection.',
    envelope:'Width/depth/ramp projections are bounded engineering choices, NOT measurements from the cropped photo.'};
  const coreWidth=assumptions.coreBayWidths.reduce((a,b)=>a+b,0),coreColumns=[-coreWidth/2];
  for(const w of assumptions.coreBayWidths)coreColumns.push(coreColumns.at(-1)+w);
  const building={width:derived.buildingWidth,depth:derived.buildingDepth,columnH:photoFit.columnHeight.value,columnRadius:photoFit.columnDiameter.value/2,
    columnXs:[-derived.buildingWidth/2,...coreColumns,derived.buildingWidth/2],columnZs:[-derived.buildingDepth/2,derived.buildingDepth/2]};
  const core={width:coreWidth,bayWidths:[...assumptions.coreBayWidths],frontZ:-building.depth/2+assumptions.frontVerandaDepth,rearZ:building.depth/2-assumptions.rearVerandaDepth,panelHeight:building.columnH,wallThickness:assumptions.wallThickness};
  const platform={width:assumptions.platformWidth.value,depth:assumptions.platformDepth.value,topY:derived.plinthRise,pavingThickness:.08,
    minX:-12,maxX:12,minZ:-9.8,maxZ:9.8,supportId:'zhendu-platform',rescue:false};
  const roof={type:'xieshan',eaves:1,width:building.width+.4,depth:building.depth+.4,overhang:assumptions.roofOverhang,
    ridgeAbovePlatform:derived.ridgeAbovePlatform,ridgeWorldY:derived.ridgeAboveHistoricGround};
  const ramps=[['front',-1,assumptions.frontRun.value],['rear',1,assumptions.rearRun.value]].map(([side,sign,run])=>({
    side,supportId:`zhendu-${side}-ramp`,zTop:sign*platform.depth/2,zToe:sign*(platform.depth/2+run),yTop:platform.topY,yToe:0,
    leftTop:-4.5,rightTop:4.5,leftToe:-4.5,rightToe:4.5,outerLeft:-5.4,outerRight:5.4,run,slope:platform.topY/run,
    evidence:side==='front'?'Partial slope is photo-visible; full run is engineering assumption':'Unobserved engineering continuity'}));
  const portals=[{centerX:0,clearWidth:assumptions.clearPortalWidth.value,frontZ:core.frontZ,rearZ:core.rearZ,doorZ:core.frontZ,doorHeight:assumptions.doorHeight}];
  const routeContacts={frontGround:[0,ramps[0].zToe-2],frontToe:[0,ramps[0].zToe],frontTop:[0,ramps[0].zTop],portalFront:[0,core.frontZ],portalRear:[0,core.rearZ],rearTop:[0,ramps[1].zTop],rearToe:[0,ramps[1].zToe],rearGround:[0,ramps[1].zToe+2]};
  const joins=Object.fromEntries([['left',-1,'to'],['right',1,'from']].map(([side,sign,end])=>[side,{side,end,local:[sign*platform.width/2,-3.1],world:toWorld(sign*platform.width/2,-3.1),
    buildingEdge:sign*building.width/2,platformEdge:sign*platform.width/2,capZMin:-6.72,capZMax:.5,capThickness:.28,wallThickness:1,wallBaseY:platform.topY,topY:7,status:'provisional-closed-contact'}]));
  const corners=[[platform.minX,platform.minZ],[platform.maxX,platform.minZ],[platform.minX,platform.maxZ],[platform.maxX,platform.maxZ]].map(p=>toWorld(...p));
  const supports={platform:{type:'box',supportId:platform.supportId,min:[Math.min(...corners.map(p=>p[0])),platform.topY,Math.min(...corners.map(p=>p[1]))],max:[Math.max(...corners.map(p=>p[0])),platform.topY,Math.max(...corners.map(p=>p[1]))],rescue:false},
    ramps:ramps.map(r=>{const a=toWorld(r.leftTop,r.zTop),b=toWorld(r.rightTop,r.zTop),cc=toWorld(r.leftToe,r.zToe),d=toWorld(r.rightToe,r.zToe),ai=quadrant%2?0:1,ci=1-ai;
      return{type:'ramp',supportId:r.supportId,axis:ai?'z':'x',minX:Math.min(a[0],b[0],cc[0],d[0]),maxX:Math.max(a[0],b[0],cc[0],d[0]),minZ:Math.min(a[1],b[1],cc[1],d[1]),maxZ:Math.max(a[1],b[1],cc[1],d[1]),a0:a[ai],a1:cc[ai],y0:r.yTop,y1:r.yToe,crossMin0:Math.min(a[ci],b[ci]),crossMax0:Math.max(a[ci],b[ci]),crossMin1:Math.min(cc[ci],d[ci]),crossMax1:Math.max(cc[ci],d[ci])};})};
  const unknowns=['Current north/rear facade and leaf arrangement','Complete modern plan, platform edges and pavement datum','Exact individual bays and door plane','Full roof framing and ceiling interior','Entire wing interfaces and south-solid orientation','Ramp profile, rail carving and surveyed dimensions','Current visitor access'];
  return {profile:'zhendu',id:'axis-courts/obj-012',objectId:'FC-9252CFFDAB',name:'贞度门',x,z,rot,toWorld,transform:{x,z,rot},documentary,derived,photoFit,assumptions,unknowns,
    acceptance:{exterior:'VERIFY_PENDING',interior:'BLOCKED_SOURCE',accepted:false},building,core,platform,roof,portals,portalCenters:[0],ramps,joins,supports,routeContacts,
    front:{ground:routeContacts.frontGround,toe:routeContacts.frontToe,top:routeContacts.frontTop},rear:{ground:routeContacts.rearGround,toe:routeContacts.rearToe,top:routeContacts.rearTop},
    width:building.width,depth:building.depth,platformY:platform.topY,platformWidth:platform.width,platformDepth:platform.depth,wallGapWidth:platform.width,
    facing:['south','east','north','west'][quadrant],sourceFacing:'likely south-oblique; camera unverified'};
}
