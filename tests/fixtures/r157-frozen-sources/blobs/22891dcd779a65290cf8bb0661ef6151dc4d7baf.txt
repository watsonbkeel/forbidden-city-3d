import * as THREE from 'three';

const PLAN = 'https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf';
const near = (a,b) => Number.isFinite(a) && Math.abs(a-b)<1e-7;
const pose = (o,x,y,z) => o?.isGroup && near(o.position.x,x) && near(o.position.y,y) && near(o.position.z,z)
  && o.quaternion.equals(new THREE.Quaternion()) && o.scale.equals(new THREE.Vector3(1,1,1));
const ID = side => `INSTANCE-A-WUMEN-${side.toUpperCase()}-SOUTH-PAVILION`;

// Each row was read from its OWN page, not copied or mirrored from the other.
// Approximate pixel centres in the 2304x3000 local renders (source SHA in audit).
// Retained 11m width / 7.5m body height remain MODEL FITS, never survey claims.
export const WUMEN_SOUTH_PAVILION_COLUMN_FITS = Object.freeze({
  east: Object.freeze({id:ID('east'),printedPage:152,planAxes:Object.freeze([839,877,938,1028,1089,1126]),rowY:2723}),
  west: Object.freeze({id:ID('west'),printedPage:153,planAxes:Object.freeze([1599,1636,1697,1787,1849,1885]),rowY:2725}),
});
export const registeredWumenSouthXs = side => {
  const p=WUMEN_SOUTH_PAVILION_COLUMN_FITS[side].planAxes;
  return p.map(x=>5.5-(x-p[0])*11/(p.at(-1)-p[0])).reverse(); // image east = model -X
};
const row = body => body.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&near(m.position.z,-5.5)).sort((a,b)=>a.position.x-b.position.x);

function sourceRow(body,side) {
  const columns=row(body),oldXs=[-5.5,-11/6,11/6,5.5];
  const proxies=body?.userData.colliders?.filter(b=>near((b.min.z+b.max.z)/2,-5.5))??[];
  if(!pose(body,side==='east'?-47.7:47.7,12.3,-56.4)||!near(body.userData.topY,7.5)||columns.length!==4||proxies.length!==4
    ||!columns.every((m,i)=>near(m.position.x,oldXs[i])&&near(m.position.y,3.3)
      &&m.quaternion.equals(new THREE.Quaternion())&&m.scale.equals(new THREE.Vector3(1,1,1))
      &&m.geometry===columns[0].geometry&&m.material===columns[0].material)
    ||!oldXs.every(x=>proxies.filter(b=>near((b.min.x+b.max.x)/2,x)&&near(b.min.y,0)&&near(b.max.y,3)
      &&near(b.max.x-b.min.x,.5)&&near(b.max.z-b.min.z,.5)).length===1))
    throw Error(`R157 retained ${side} southern pavilion row mismatch`);
  return {body,side,columns,proxies};
}

function replaceRow({body,side,columns,proxies}) {
  const xs=registeredWumenSouthXs(side),added=xs.slice(1,-1).map(x=>{const m=columns[1].clone();m.position.x=x;return m;});
  const next=[columns[0],...added,columns[3]],geometry=columns[0].geometry;
  geometry.computeBoundingBox();
  const newProxies=next.map(m=>{const b=geometry.boundingBox.clone().translate(m.position);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);return b;});
  let inserted=false;
  body.userData.colliders=body.userData.colliders.flatMap(b=>{if(!proxies.includes(b))return[b];if(inserted)return[];inserted=true;return newProxies;});
  body.remove(columns[1],columns[2]);body.add(...added); // NEVER dispose shared HallKit buffers/materials.
  return {revision:'r157-own-plan-south-six-v1',source:PLAN,printedPage:WUMEN_SOUTH_PAVILION_COLUMN_FITS[side].printedPage,
    planAxes:[...WUMEN_SOUTH_PAVILION_COLUMN_FITS[side].planAxes],southColumnXs:xs,southColumnZ:-5.5,columnCount:6,
    dimensionBasis:'APPROXIMATE_SOURCE_PIXEL_REGISTRATION_IN_RETAINED_11M_MODEL_NOT_SURVEY',
    runtimeCollision:'UNCHANGED_EXISTING_CLOSED_MODEL_NO_ACCESS_ACCEPTANCE',wholeObjectAccepted:false};
}

/** Run once on the ORIGINAL raw, unmerged Wumen, after R145 endpoint guards.
 * No platform/tower/opening/roof/runtime-collision changes. All preflight checks
 * occur before mutation. The existing two links are historical-region candidates,
 * not two newly invented pavilions and NOT proof of surviving bells/drums. */
export function refineWumenWingPavilionInstances(b,parent) {
  if(b.ox!==0||b.oz!==-419.6)return false;
  if(parent?.userData.r157WumenWingPavilionInstances)return false;
  if(parent?.name!=='午门'||!pose(parent,0,0,0))throw Error('R157 original Wumen host mismatch');
  const entries=[];
  for(const side of ['east','west']) {
    const x=side==='east'?-47.7:47.7;
    const getBody=z=>{const a=parent.children.filter(o=>pose(o,x,12.3,z)&&near(o.userData.topY,7.5));if(a.length!==1)throw Error(`R157 unique ${side} pavilion body missing`);return a[0];};
    const south=getBody(-56.4),north=getBody(-6);
    const wings=parent.children.filter(o=>o.isGroup&&near(o.position.x,x)&&near(o.position.y,12.3)&&near(o.position.z,-31.2)
      &&near(o.rotation.y,Math.PI/2)&&o.children.length===2&&near(o.children[0].userData.topY,6.5));
    const links=parent.children.filter(o=>o.name===`r145-wumen-${side}-transverse-link`&&o.userData.r145WumenLink);
    if(wings.length!==1||links.length!==1)throw Error(`R157 unique retained ${side} wing/link missing`);
    for(const z of[-56.4,-6])if(parent.children.filter(o=>pose(o,x,0,z)&&o.userData.topY>20).length!==1)throw Error(`R157 ${side} pavilion roof mismatch`);
    entries.push({side,south,north,wing:wings[0],link:links[0],prepared:sourceRow(south,side)});
  }
  const records=[];
  for(const e of entries) {
    const fit=replaceRow(e.prepared),side=e.side;
    const wingId=side==='east'?'FC-B0439D9BED':'FC-FB99F593DB';
    e.wing.userData.structure={id:wingId,parentId:'FC-AD4377DF51',kind:'existing-wumen-wing-instance',side,
      source:PLAN,printedPage:side==='east'?152:153,bays:13,bayCountBasis:'OFFICIAL_TEXT_MODEL_HAS_14_EXTERNAL_COLUMNS_PER_ROW_NOT_SURVEYED_SPACING',
      review:'EXISTING_GENERIC_ENCLOSURE_ROOF_AND_INTERIOR_NOT_ACCEPTED',wholeObjectAccepted:false};
    for(const [end,body]of [['south',e.south],['north',e.north]]) {
      const id=`INSTANCE-A-WUMEN-${side.toUpperCase()}-${end.toUpperCase()}-PAVILION`;
      body.userData.structure={...body.userData.structure,id,parentId:'FC-86C9330D65',kind:'existing-wumen-corner-pavilion-instance',side,end,
        source:PLAN,printedPage:side==='east'?152:153,roofBinding:{position:[body.position.x,0,body.position.z],form:'RETAINED_DOUBLE_EAVE_PYRAMIDAL_FIT_NOT_REVIEWED_DETAIL'},
        ...(end==='south'?{southColumnFit:fit}:{}),wholeObjectAccepted:false};
      records.push(id);
    }
    e.link.userData.structure={id:`INSTANCE-A-WUMEN-${side.toUpperCase()}-CLOCK-DRUM-REGION`,parentId:'FC-08AF02314B',
      kind:'existing-transverse-link-historical-region-candidate',existingObjectName:e.link.name,
      attribution:'REGION_ASSOCIATION_ONLY_NOT_VERIFIED_CURRENT_BELL_OR_DRUM_FUNCTION',
      source:PLAN,printedPage:side==='east'?152:153,instruments:'UNKNOWN_NO_INSTRUMENT_GEOMETRY_ADDED',wholeObjectAccepted:false};
    records.push(wingId,e.link.userData.structure.id);
  }
  parent.userData.r157WumenWingPavilionInstances={records,wholeObjectAccepted:false};
  return true;
}
