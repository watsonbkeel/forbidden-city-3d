/**
 * 昭德门: documentary three-core-bay building, surrounding veranda, one portal.
 * This is a bounded topology prototype, NOT a surveyed contemporary model.
 * All local coordinates face -Z (south); world east is -X. Source photographs
 * stay research-only; no source image is used as a runtime texture.
 */
const FACE={south:0,north:Math.PI,east:Math.PI/2,west:-Math.PI/2};

export function zhaodeGateGeometry(item={}) {
  if(item.gateProfile!=='zhaode')throw new Error(`Unsupported Zhaode gate profile: ${String(item.gateProfile)}`);
  if(item.gateKind!=='three-bay')throw new Error('Zhaode topology requires explicit three-bay gateKind');
  const x=item.x===undefined?0:item.x,z=item.z===undefined?0:item.z;
  if(typeof x!=='number'||typeof z!=='number'||!Number.isFinite(x)||!Number.isFinite(z))throw new Error('Zhaode position must contain finite numeric x/z coordinates');
  for(const key of ['w','h','t'])if(item[key]!==undefined&&(typeof item[key]!=='number'||!Number.isFinite(item[key])||item[key]<=0))throw new Error(`Zhaode dimension ${key} must be finite and positive`);
  if(item.open!==undefined&&typeof item.open!=='boolean')throw new Error('Zhaode topology open state must be boolean');
  const angle=item.rot===undefined?0:typeof item.rot==='string'&&Object.hasOwn(FACE,item.rot)?FACE[item.rot]:item.rot;
  if(typeof angle!=='number'||!Number.isFinite(angle))throw new Error('Zhaode rotation must be a finite cardinal angle or named direction');
  const quarter=Math.PI/2,turn=2*Math.PI,normalized=((angle%turn)+turn)%turn,nearest=Math.round(normalized/quarter)*quarter;
  if(Math.abs(normalized-nearest)>1e-8)throw new Error('Zhaode rotation must be cardinal for exact axis-aligned support');
  const rot=nearest===turn?0:nearest,c=Math.cos(rot),s=Math.sin(rot);
  const toWorld=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
  const documentary={source:'G04',url:'https://www.dpm.org.cn/building/talk/223393.html',
    raw:{widthChi:62.9,depthChi:41.4,plinthToRidgeChi:40.45,groundToRidgeChi:50.5},metresPerChi:.32,
    depthMeaning:'Depth stated including the front veranda; no independent symmetric front/rear allocation.',
    envelopeMeaning:'Documentary building / outer-column envelope including lateral verandas, not masonry or roof bounds.',
    topology:{coreWidthBays:3,coreDepthBays:1,surroundingVeranda:true,eaves:1,purlins:9,roof:'xieshan'},
    datum:'Historical documentary design and site comparison, not a contemporary pavement survey.'};
  const derived={buildingWidth:20.128,buildingDepth:13.248,ridgeAbovePlatform:12.944,ridgeAboveDocumentaryGround:16.16,plinthRise:3.216,printedMetricDifference:3.22,
    formula:'(50.5 - 40.45) chi * 0.32 m/chi; printed rounded metre subtraction is 16.16 - 12.94.'};
  const digitized={source:'G06',url:'https://www.dpm.org.cn/building/talk/223358.html',explicitBarUnit:false,independentVerticalCalibration:false,
    conditionalUnit:'metres, assuming graphic-bar units and isotropic reproduction',outerColumnWidth:21.17,outerColumnDepth:13.81,platformRailProxyWidth:24.4,platformRailProxyDepth:21,
    northProjection:17.18,southProjection:16.56,outerWidthRange:[11,11.5],innerGraphicWidthRange:[9,9.5],runAllowance:1.2,widthAllowance:1.1,platformProxyAllowanceAtLeast:1.6,
    limitations:'Graphic rail outline is not an identified masonry edge; scan deskew is not architectural yaw; small projection differences do not establish real asymmetry.'};
  const provisional={status:'engineering-assumptions',coreBayWidths:[4.8,6,4.8],lateralVerandaWidth:2.264,frontVerandaDepth:2.4,rearVerandaDepth:2.4,columnH:6.2,columnRadius:.3,
    platformWidth:24.4,platformDepth:21,frontRun:16.5,rearRun:17,approachOuterWidth:11.2,approachTravelWidth:9.2,clearPortalWidth:4.8,
    railHeight:1.05,railMaximumSpacing:2,railMemberWidth:.2,cheekWidth:1,roofOverhang:1.6,wallThickness:.4,
    recessedPanelClosure:'Conservative engineering closure to the existing door-head top; not a newly documented historical panel-head detail.',
    northElevation:'Own group 8 north view observes ochre panels and plain red leaf backs; retained panel depth and door-plane relationship remain provisional; no second pair.',
    wingContacts:'Closed caps only. Entire inherited south-open wing orientation remains unresolved; no playable lateral floor connection.'};
  const unknowns=['Complete measured north elevation, panel depth and door-plane relationship','Individual surveyed bays, door plane and aperture','Exact masonry outline, slope profile, landings, crossfall and current ground datum','Full wing interfaces and wing south-solid reconstruction','Railing measurements and ornament','Present-day visitor access and smooth accessible strip geometry'];
  const coreWidth=provisional.coreBayWidths.reduce((a,b)=>a+b,0);
  const coreColumns=[-coreWidth/2];
  for(const width of provisional.coreBayWidths)coreColumns.push(coreColumns.at(-1)+width);
  const building={width:derived.buildingWidth,depth:derived.buildingDepth,columnH:provisional.columnH,columnRadius:provisional.columnRadius,
    columnXs:[-derived.buildingWidth/2,...coreColumns,derived.buildingWidth/2],columnZs:[-derived.buildingDepth/2,derived.buildingDepth/2]};
  const core={bayWidths:[...provisional.coreBayWidths],width:coreWidth,frontZ:-building.depth/2+provisional.frontVerandaDepth,rearZ:building.depth/2-provisional.rearVerandaDepth,panelHeight:building.columnH,wallThickness:provisional.wallThickness};
  const platform={width:provisional.platformWidth,depth:provisional.platformDepth,topY:derived.plinthRise,pavingThickness:.08,minX:-provisional.platformWidth/2,maxX:provisional.platformWidth/2,minZ:-provisional.platformDepth/2,maxZ:provisional.platformDepth/2,supportId:'zhaode-platform',rescue:false};
  const roof={type:'xieshan',eaves:1,width:building.width+.4,depth:building.depth+.4,overhang:provisional.roofOverhang,ridgeAbovePlatform:derived.ridgeAbovePlatform,
    ridgeWorldY:derived.plinthRise+derived.ridgeAbovePlatform,boundsMeaning:'RoofBuilder width/depth are supporting outer skin. Actual roof bounds are recorded by the builder.'};
  const ramps=[['front',-1,provisional.frontRun],['rear',1,provisional.rearRun]].map(([side,sign,run])=>({side,supportId:`zhaode-${side}-ramp`,
    zTop:sign*platform.depth/2,zToe:sign*(platform.depth/2+run),yTop:platform.topY,yToe:0,leftTop:-provisional.approachTravelWidth/2,rightTop:provisional.approachTravelWidth/2,leftToe:-provisional.approachTravelWidth/2,rightToe:provisional.approachTravelWidth/2,outerLeft:-provisional.approachOuterWidth/2,outerRight:provisional.approachOuterWidth/2,run,slope:platform.topY/run}));
  const portals=[{centerX:0,clearWidth:provisional.clearPortalWidth,frontZ:core.frontZ,rearZ:core.rearZ,doorZ:core.frontZ,doorHeight:5.2}];
  const routeContacts={frontGround:[0,ramps[0].zToe-2],frontToe:[0,ramps[0].zToe],frontTop:[0,ramps[0].zTop],portalFront:[0,core.frontZ],portalRear:[0,core.rearZ],rearTop:[0,ramps[1].zTop],rearToe:[0,ramps[1].zToe],rearGround:[0,ramps[1].zToe+2]};
  const front={toe:routeContacts.frontToe,top:routeContacts.frontTop,ground:routeContacts.frontGround};
  const rear={toe:routeContacts.rearToe,top:routeContacts.rearTop,ground:routeContacts.rearGround};
  const joins=Object.fromEntries([['left',-1,'to'],['right',1,'from']].map(([side,sign,end])=>[side,{side,end,local:[sign*platform.width/2,-3.1],world:toWorld(sign*platform.width/2,-3.1),
    buildingEdge:sign*building.width/2,platformEdge:sign*platform.width/2,capZMin:-6.72,capZMax:.5,capHeight:7,wallBaseY:platform.topY,topY:7,capThickness:.28,wallThickness:1,status:'provisional-closed-contact'}]));
  const corners=[[platform.minX,platform.minZ],[platform.maxX,platform.minZ],[platform.minX,platform.maxZ],[platform.maxX,platform.maxZ]].map(p=>toWorld(...p));
  const supports={platform:{type:'box',supportId:platform.supportId,min:[Math.min(...corners.map(p=>p[0])),platform.topY,Math.min(...corners.map(p=>p[1]))],max:[Math.max(...corners.map(p=>p[0])),platform.topY,Math.max(...corners.map(p=>p[1]))],rescue:false},
    ramps:ramps.map(r=>{const a=toWorld(r.leftTop,r.zTop),b=toWorld(r.rightTop,r.zTop),cc=toWorld(r.leftToe,r.zToe),d=toWorld(r.rightToe,r.zToe);const ai=Math.abs(b[0]-a[0])>=Math.abs(b[1]-a[1])?1:0,ci=1-ai;return {type:'ramp',supportId:r.supportId,axis:ai===1?'z':'x',minX:Math.min(a[0],b[0],cc[0],d[0]),maxX:Math.max(a[0],b[0],cc[0],d[0]),minZ:Math.min(a[1],b[1],cc[1],d[1]),maxZ:Math.max(a[1],b[1],cc[1],d[1]),a0:a[ai],a1:cc[ai],y0:r.yTop,y1:r.yToe,crossMin0:Math.min(a[ci],b[ci]),crossMax0:Math.max(a[ci],b[ci]),crossMin1:Math.min(cc[ci],d[ci]),crossMax1:Math.max(cc[ci],d[ci])};})};
  // Internal invariants fail closed before a builder registers any geometry.
  if(core.bayWidths.length!==3||core.bayWidths.some(n=>!Number.isFinite(n)||n<=0)||Math.abs(core.bayWidths.reduce((a,b)=>a+b)-core.width)>1e-8||building.width<=core.width||platform.width<=building.width||platform.depth<=building.depth||platform.topY<=0||portals.length!==1||portals[0].clearWidth>=core.bayWidths[1]||ramps.some(r=>r.run<=0||r.rightTop<=r.leftTop))throw new Error('Contradictory Zhaode topology or nonpositive profile dimension');
  return {profile:'zhaode',id:'axis-courts/obj-010',name:'昭德门',x,z,rot,toWorld,transform:{x,z,rot},documentary,derived,digitized,provisional,unknowns,building,core,platform,roof,portalCenters:[0],portals,ramps,wallGapWidth:platform.width,joins,routeContacts,front,rear,supports,
    width:building.width,depth:building.depth,platformWidth:platform.width,platformDepth:platform.depth,platformY:platform.topY,sourceFacing:'south',facing:['south','east','north','west'][Math.round(rot/quarter)]};
}
