import { PAVILION_MEASUREMENTS } from './PavilionMeasurements.js';

const FACE = { south: 0, east: Math.PI / 2, north: Math.PI, west: -Math.PI / 2 };
const NAMES = { hongyi: '弘义阁', tiren: '体仁阁' };
const PROVISIONAL = 'PROVISIONAL_NOT_SURVEYED';
const sum = values => values.reduce((a,b) => a+b,0);
// u follows the page left→right convention; local X=-u, rather than silently
// mirroring the four-millimetre asymmetry in Tiren's front dimension chain.
function grid(intervals,z) {
  const u=[-sum(intervals.slice(0,4))-intervals[4]/2];
  for(const width of intervals)u.push(u.at(-1)+width);
  return {intervals:[...intervals],u,x:u.map(v=>-v),z,width:sum(intervals),
    openingBays:intervals.slice(1,8).map((width,i)=>({bay:i+1,width,x:-(u[i+1]+u[i+2])/2}))};
}
function supportLine(principal,offset,z,status) {
  // Dimension ticks at the round corner columns are not gallery square posts.
  const u=[principal.u[0]-offset,...principal.u.slice(1,-1),principal.u.at(-1)+offset];
  return {u,x:u.map(v=>-v),z,width:u.at(-1)-u[0],status};
}

/** Shared assembly/route geometry. All dimensions are metres. No UI guesses. */
export function pavilionGeometry(item={}) {
  const key=item.pavilionProfile;
  if(!Object.hasOwn(NAMES,key))throw new Error(`Unsupported pavilion profile: ${String(key)}`);
  const measurements=structuredClone(PAVILION_MEASUREMENTS.evidenced_measurements[key]);
  const defaultFacing=key==='hongyi'?'east':'west';
  const rawRot=item.rot===undefined?FACE[defaultFacing]:typeof item.rot==='string'?FACE[item.rot]:item.rot;
  if(!Number.isFinite(rawRot))throw new Error('Pavilion rotation must be a finite named or numeric cardinal angle');
  const turn=Math.PI*2,normalized=((rawRot%turn)+turn)%turn,quadrant=Math.round(normalized/(Math.PI/2));
  if(Math.abs(normalized-quadrant*Math.PI/2)>1e-8)throw new Error('Pavilion rotation must be cardinal for axis-aligned collision');
  const rot=quadrant===4?0:quadrant*Math.PI/2;
  const x=item.x??0,z=item.z??0;
  if(!Number.isFinite(x)||!Number.isFinite(z))throw new Error('Pavilion position must be finite numeric x/z');
  const floorY=item.interiorFloorWorldY??3.8;
  if(!Number.isFinite(floorY))throw new Error('Pavilion interior floor datum must be finite');
  const c=Math.cos(rot),s=Math.sin(rot),toWorld=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
  const pointToWorld=p=>{const [x,z]=toWorld(p.x,p.z);return {...p,x,z};};
  const elevations=Object.fromEntries(Object.entries(measurements.elevations).map(([name,m])=>[name,floorY+m.value]));
  const lowerGrid=grid(measurements.lower.width_intervals.value,0);
  const depthIntervals=measurements.lower.depth_intervals.value;
  const depth=sum(depthIntervals),columnZs=[-depth/2];depthIntervals.forEach(d=>columnZs.push(columnZs.at(-1)+d));
  // Column tops are adopted structural joints, expressly not the eave markers.
  const lowerColumnTop=elevations.lower_eave-.8;
  const lower={...lowerGrid,columnXs:lowerGrid.x,columnZs,depthIntervals:[...depthIntervals],depth,front:-depth/2,rear:depth/2,floorY,height:lowerColumnTop-floorY,columnTop:lowerColumnTop};
  const rearChain=measurements.upper.rear_outer_support_chain.value.slice(1,-1);
  const frontChain=key==='hongyi'?measurements.upper.front_principal_chain.value:measurements.upper.front_outer_support_chain.value.slice(1,-1);
  const [upperFront,upperRear]=measurements.upper.principal_depth_line_coordinates.value;
  const front=grid(frontChain,upperFront),rear=grid(rearChain,upperRear);
  const roofDepth=measurements.upper.outer_support_depth.value;
  const overhang=1.75,tw=(roofDepth/2)/(roofDepth/2+overhang),q=1-tw;
  // H01 Fig11's marker rests on the continuous main-ridge cap CREST,
  // not the tile meeting surface or the chiwen. RoofBuilder's central cap
  // rises3.324*hr above its tile peak. Keep this local calibration explicit.
  const ridgeRadius=Math.min(.42,Math.max(.1,roofDepth*.011));
  const ridgeCapRise=3.324*ridgeRadius,tilePeakY=elevations.ridge-ridgeCapRise;
  const rise=tilePeakY-elevations.upper_eave;
  const roofHeight=rise*(1-(.48*q+.52*q*q))+.175;
  const roofBase=tilePeakY-roofHeight-Math.min(1.8,Math.max(.6,roofDepth*.05));
  const upperColumnTop=roofBase;
  const upper={front,rear,width:Math.max(front.width,rear.width),depth:upperRear-upperFront,floorY:elevations.upper_floor,height:upperColumnTop-elevations.upper_floor,columnTop:upperColumnTop};
  const galleryOffset=key==='hongyi'?1.408:1.480;
  const [gf,gr]=measurements.upper.outer_support_depth_line_coordinates.value;
  const galleryFront=supportLine(front,galleryOffset,gf,key==='hongyi'?PROVISIONAL:'DERIVED');
  const galleryRear=supportLine(rear,galleryOffset,gr,'DERIVED');
  const supports=[...galleryFront.x.map(x=>({x,z:gf,line:'front'})),...galleryRear.x.map(x=>({x,z:gr,line:'rear'}))];
  const innerDepths=key==='hongyi'?[-4.020,4.032]:[-4.048,4.048];
  for(const side of [0,9])for(const dz of innerDepths){const t=(dz-gf)/(gr-gf);supports.push({x:galleryFront.x[side]*(1-t)+galleryRear.x[side]*t,z:dz,line:'end'});}
  const gallery={front:galleryFront,rear:galleryRear,supports,width:Math.max(galleryFront.width,galleryRear.width),depth:gr-gf,offset:galleryOffset,floorY:upper.floorY,flatFloor:true};
  const deck={x0:Math.min(...galleryFront.x,...galleryRear.x)-.28,x1:Math.max(...galleryFront.x,...galleryRear.x)+.28,z0:gf-.28,z1:gr+.28,status:PROVISIONAL};
  deck.width=deck.x1-deck.x0;deck.depth=deck.z1-deck.z0;
  const roof={width:gallery.width+3.5,depth:gallery.depth+3.5,front:gf-1.75,rear:gr+1.75,centerZ:(gf+gr)/2,overhang:1.75,baseY:roofBase,height:roofHeight,tilePeakY,ridgeCapRise,ridgeReferenceObject:'central-main-ridge-cap-crest',ornamentFidelity:'LOW_DETAIL_CHIWEN_OMITTED',status:PROVISIONAL};
  const waist={rearWidth:key==='hongyi'?41.6:41.65,frontWidth:key==='hongyi'?41.6:41.65,depth:key==='hongyi'?14.496:14.610,
    floorY:elevations.upper_floor,supportBaseY:elevations.upper_floor-2.2,landingY:floorY+measurements.waist_layer.stair_landing_elevation.value,
    frontStatus:key==='hongyi'?'PROVISIONAL_SOURCE_CONFLICT':'DIMENSIONED'};
  // A deliberate adoption of the shared narrative rectangle, NOT two surveys.
  const platform={x0:-31.65,x1:31.65,z0:-18.3,z1:9.2,y:floorY-.1,width:63.3,depth:27.5,status:'ADOPTED_TEXT_APPROX_SHARED_SCOPE'};
  const frontFlights=[['frontLeft',-1],['frontRight',1]].map(([side,sign])=>({side,centerX:sign*2.45,width:2.6,zTop:platform.z0,zToe:platform.z0-10.24,yTop:platform.y,yToe:elevations.front_court,steps:32,run:10.24,status:PROVISIONAL,stepCountStatus:'TEXT_H01_P139'}));
  const royalStrip={width:2.3,zTop:platform.z0,zToe:frontFlights[0].zToe,playable:false,widthStatus:'TEXT_APPROX',outlineStatus:PROVISIONAL};
  const approaches=Object.fromEntries(frontFlights.map(f=>{
    const points=[
      {kind:'outside',x:f.centerX,y:f.yToe,z:f.zToe-2.4},
      {kind:'groundToe',x:f.centerX,y:f.yToe,z:f.zToe},
      {kind:'stairTop',x:f.centerX,y:f.yTop,z:f.zTop},
      {kind:'platform',x:f.centerX,y:f.yTop,z:f.zTop+2.2},
      {kind:'terraceTurn',x:0,y:f.yTop,z:f.zTop+2.2},
      {kind:'centralDoor',x:0,y:floorY,z:lower.front},
      {kind:'interior',x:0,y:floorY,z:lower.front+2.4},
    ];return [f.side,{side:f.side,points,worldPoints:points.map(pointToWorld)}];
  }));
  const sideConnections=['south','north'].map(direction=>{
    const sign=(direction==='south')===(key==='hongyi')?1:-1;
    return {direction,sign,kind:direction==='south'?'steps':'ridged-incline',width:4.9,zCenter:lower.front+1.7,xTop:sign*31.65,xLanding:sign*34.65,xOuter:sign*35.85,landingLength:1.2,yTop:platform.y,yLanding:platform.y-.9,neighborConnection:'DEFERRED_ELEVATION_UNRESOLVED',geometryStatus:PROVISIONAL,guardStatus:'PROVISIONAL_GAME_SAFETY_GUARD'};
  });
  const roomBounds={x0:-lower.width/2+.4,x1:lower.width/2-.4,z0:lower.front+.4,z1:lower.rear-.4,y:floorY,h:lower.height-.65};
  const assumptions={
    terraceFootprint:{value:[63.3,27.5],status:'ADOPTED_TEXT_APPROX_SHARED_SCOPE',source:'H01 p138; no independent corner chain'},
    terraceY:{value:platform.y,status:key==='hongyi'?'FLAT_SIMPLIFICATION_OF_DIMENSIONED_CENTRAL_SPOT':PROVISIONAL},
    frontOuterSupportWidth:{value:galleryFront.width,status:key==='hongyi'?PROVISIONAL:'DERIVED',note:key==='hongyi'?'Front principal chain plus adopted 1.408 end offsets; separate front support width is UNKNOWN.':'Independent Fig6 front chain.'},
    waistFrontWidth:{value:waist.frontWidth,status:waist.frontStatus,note:key==='hongyi'?'Rear width adopted provisionally; printed front total40.573 conflicts with chain sum41.587.':'Fig4 own 41.650 width.'},
    waistBearingFraming:{status:PROVISIONAL,note:'Two tiers of transverse/longitudinal transfer beams connect the actual lower perimeter frame to principal continuations and waist short posts. The adopted short-post base is upper floor minus2.2m, independent of the measured stair landing; joint heights, beam sections and exact member positions are provisional.'},
    waistPostLayout:{status:PROVISIONAL,note:'Upper support spacing is proportionally mapped to the independently measured waist outer spans; individual short-post positions and centering remain unsurveyed implementation choices.'},
    roofReferenceMapping:{status:'GENERATOR_CALIBRATION_DERIVED',surveyPoint:'central-main-ridge-cap-crest',tilePeakY,ridgeCapRise,note:'Cap crest uses H01 reference; tile meeting surface is lower by the shared generator cap rise. Low-detail generator omits chiwen, so ornament height and total historical bbox are not accepted.'},
    deckEdge:{value:deck,status:PROVISIONAL},roofEdge:{value:roof,status:PROVISIONAL},
    galleryFloor:{value:upper.floorY,status:PROVISIONAL,note:'Flat simplification. Detail shows outward fall but outer elevation is unlabelled.'},
    upperRail:{height:key==='hongyi'?.8:.85,status:key==='hongyi'?'DIMENSIONED_LOCAL_DETAIL':PROVISIONAL},
    columnTops:{value:[lowerColumnTop,upperColumnTop],status:PROVISIONAL,note:'Adopted joints below eave references, not measured clear column heights.'},
    frontFlights:{run:10.24,width:2.6,status:PROVISIONAL,note:'32 steps each and approx2.3m center strip sourced; run/flight width adopted.'},
    sideConnections:{status:PROVISIONAL,note:'Approx0.9m drop and4.9m width sourced jointly; run/location/landing/guards adopted. Existing ground corridors are not survey-height verandas.'},
    rearGround:{value:elevations.rear_ground,status:'DIMENSIONED_NOT_GLOBAL_TERRAIN_CHANGE'},
  };
  return {profile:key,id:`axis-courts/${key==='hongyi'?'hongyige':'tirenge'}`,name:NAMES[key],source:PAVILION_MEASUREMENTS.sources[key==='hongyi'?'S13':'S12'].url,
    surveySource:PAVILION_MEASUREMENTS.sources.H01.url,measurements,assumptions,sourceFacing:defaultFacing,facing:['south','east','north','west'][quadrant%4],x,z,rot,toWorld,
    lower,upper,gallery,deck,roof,waist,platform,elevations,frontFlights,royalStrip,approaches,sideConnections,roomBounds,
    terraceCentralSpot:measurements.terrace_spot_elevations?.central_front??{value:null,status:'UNKNOWN'},
    lowerRoof:{width:lower.width+4.4,depth:lower.depth+4.4,front:lower.front-2.2,rear:lower.rear+2.2,innerWidth:waist.frontWidth-.2,innerDepth:waist.depth-.2,innerY:upper.floorY-1.12,outerY:elevations.lower_eave,status:PROVISIONAL},
    interface:{wallGapWidth:lower.width-.5,corridorTrimHalfLength:platform.width/2+.8,status:'PROVISIONAL_LOCAL_COMPATIBILITY'},
  };
}
