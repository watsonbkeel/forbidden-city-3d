import {GATE_TOWER_MEASUREMENTS} from './GateTowerMeasurements.js';
import {WUMEN_VERTICAL_PROFILE} from './WumenVerticalProfile.js';
const PROVISIONAL='PROVISIONAL_PREVIEW_NOT_SURVEYED';
/** Wumen retains its horizontal frame/enclosure and door topology; only the
 * reviewed main-tower vertical profile changes. gallerySetback is an axis distance. */
export function wumenTowerGeometry({gallerySetback=2.9}={}) {
  if(!Number.isFinite(gallerySetback)||gallerySetback<2.6||gallerySetback>3.2)throw new Error('Wumen gallery axis setback must stay within the approved 2.6–3.2m model band');
  const width=60.05,depth=25,height=WUMEN_VERTICAL_PROFILE.body.height,bays=9,beamH=WUMEN_VERTICAL_PROFILE.body.beamHeight,wallH=height-beamH,T=.9;
  const enclosureWidth=width-1.6,wallAxisZ=depth/2-gallerySetback,outerZ=wallAxisZ+T/2;
  const door={width:5,height:5.2,leafWidth:2.3,leafThickness:.25,leafCountPerOpening:2,openingRadians:Math.PI/2,status:PROVISIONAL,type:'lattice'};
  const outerRadius=width/bays*.06,columns=[];
  // Retained horizontal interior positions; column heights follow the reviewed body.
  const innerWidth=width-1.6-1.8,legacyDepth=depth-1.6;
  for(let i=1;i<bays;i++)for(const z of [-legacyDepth*.18,legacyDepth*.18])columns.push({kind:'interior-column',x:-innerWidth/2+i*innerWidth/bays,z,radius:.42,bottomRadius:.42*1.05,height:wallH,status:'RETAINED_PLAN_SOURCE_REGISTERED_HEIGHT_NOT_SURVEYED'});
  for(let i=0;i<=bays;i++)for(const z of [-depth/2,depth/2])columns.push({kind:'outer-column',x:-width/2+i/bays*width,z,radius:outerRadius,bottomRadius:outerRadius*1.05,height:wallH,status:'RETAINED_PLAN_SOURCE_REGISTERED_HEIGHT_NOT_SURVEYED'});
  return {id:'axis/wumen-upper-tower',name:'午门',width,depth,height,bays,beamH,wallH,T,columns,
    enclosure:{width:enclosureWidth,outerZ,wallAxisZ,innerZ:wallAxisZ-T/2},
    openings:[{side:'north',sign:1,...door},{side:'south',sign:-1,...door}],
    floor:{width:enclosureWidth-2*T,depth:2*(wallAxisZ-T/2),visualOffset:.04,support:'retained-main-platform'},
    veneer:{thickness:.12,status:'RETAINED_PREVIEW_THICKNESS'},
    metadata:{id:'axis/wumen-upper-tower',status:'EVIDENCE_BOUNDED_PREVIEW',galleryAxisSetback:gallerySetback,gallerySource:GATE_TOWER_MEASUREMENTS.wumen.gallery,
      wallThickness:{value:T,status:'RETAINED_PREVIEW_NOT_SURVEYED'},upperDoor:door,otherBayOperation:'CLOSED_UNVERIFIED',publicAccess:GATE_TOWER_MEASUREMENTS.publicAccess,
      verticalGeometry:{status:WUMEN_VERTICAL_PROFILE.status,profileId:WUMEN_VERTICAL_PROFILE.id,body:WUMEN_VERTICAL_PROFILE.body,provenance:WUMEN_VERTICAL_PROFILE.provenance},retainedInteriorColumns:'Legacy horizontal placeholders, not recomputed from recessed wall depth; vertical height follows the reviewed exterior profile'},
  };
}

/** Orthogonal/symmetric preview assembled from the published pooled bays.
 * Raw front/rear and side chains remain in the source card, not averaged away. */
export function shenwuTowerGeometry() {
  const evidence=GATE_TOWER_MEASUREMENTS.shenwu;
  const intervals=[2.8488,6.4975,6.6375,9.755,6.6375,6.4975,2.8488];
  const width=41.7226,depth=17.9651,height=7,beamH=.84,wallH=height-beamH,T=.9;
  const xAxes=[-width/2];for(const bay of intervals)xAxes.push(Number((xAxes.at(-1)+bay).toFixed(6)));
  const innerX=18.0125,innerZ=6.13375,outerZ=depth/2;
  const columns=[];
  const addColumn=(x,z,inner=false)=>columns.push({x,z,height:wallH,kind:inner?'interior-column':'outer-column',radius:inner?.375:.3275,bottomRadius:inner?.375:.3275,status:'NOMINAL_PLAN_SHAFT_CONSTANT_SECTION_PREVIEW_NOT_FOOTING'});
  for(const x of xAxes)for(const z of [-outerZ,outerZ])addColumn(x,z);
  for(const x of [-width/2,width/2])for(const z of [-innerZ,innerZ])addColumn(x,z);
  for(const x of xAxes.slice(1,-1))for(const z of [-innerZ,innerZ])addColumn(x,z,true);
  const door={height:5.2,leafThickness:.25,leafCountPerOpening:2,openingRadians:Math.PI/2,status:PROVISIONAL};
  const faces=[];
  for(const sign of [-1,1]){
    const openings=[-8.19625,0,8.19625].map(center=>({center,width:center===0?5:4.8,leafWidth:center===0?2.3:2.2,type:'lattice',...door}));
    faces.push({axis:'z',side:sign===1?'north':'south',sign,wallAxis:innerZ,span:2*(innerX+T/2),openings});
    faces.push({axis:'x',side:sign===-1?'east':'west',sign,wallAxis:innerX,span:2*(innerZ+T/2),openings:[{center:0,width:3,leafWidth:1.4,type:'board',...door}]});
  }
  const localOutline={width:43.68,depth:20.075,modelOffsets:{x:.9787,z:1.05495},railThickness:.2,railHeight:1.1,accessGaps:{north:{center:0,width:5.5},south:{center:0,width:5.5},east:{center:0,width:3.5},west:{center:0,width:3.5}},status:PROVISIONAL};
  return {id:'axis/shenwu-upper-tower',name:'神武门',width,depth,height,beamH,wallH,T,columns,faces,xAxes,intervals,
    enclosure:{innerX,innerZ},floor:{width:2*innerX-T,depth:2*innerZ-T,visualOffset:.04,support:'nominal-city-platform'},
    veneer:{thickness:.12,status:'RETAINED_PREVIEW_THICKNESS'},localOutline,
    metadata:{id:'axis/shenwu-upper-tower',status:'EVIDENCE_BOUNDED_PREVIEW',grid:{width,depth,intervals,xAxes,adoption:'Published pooled symmetric width bays; pooled galleries plus mean surveyed middle depth. Not the mean of front/rear totals.',evidence},
      localOutline:{adoptedSize:[localOutline.width,localOutline.depth],modelOffsets:localOutline.modelOffsets,source:evidence.localOutlineMm,adoption:'Retain drawn overall outline, centered on pooled model grid; derived offsets differ from raw figure offsets.',accessTopology:'One central cardinal rail gap per side, independent of three north/south hall door groups; gap widths provisional'},
      cityPlatform:evidence.nominalCityPlatformM,verticalGeometry:{status:'FLAT_PREVIEW_RAISED_PLINTH_AND_STAIRS_DEFERRED',inheritedFloorY:10.3,inheritedBodyHeight:height},
      provisional:{wallThickness:T,veneerThickness:.12,railHeight:localOutline.railHeight,railThickness:localOutline.railThickness,railAccessGaps:localOutline.accessGaps,doorGroups:faces.map(f=>({side:f.side,openings:f.openings})),shaftShape:'constant section; bases and taper deferred',roof:'unchanged generator; derived height is not a surveyed ridge'},
      publicAccess:GATE_TOWER_MEASUREMENTS.publicAccess},
  };
}
