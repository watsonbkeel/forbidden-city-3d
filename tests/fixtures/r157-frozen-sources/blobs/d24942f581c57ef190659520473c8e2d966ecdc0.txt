import * as THREE from 'three';
import { applyPlanarUV } from '../../utils/GeometryUV.js';

/** Museum1941 sheets43–46; rounded scan registration, NOT current survey.
 * Central ceiling is higher than outer eave heads. Above-ceiling joinery and
 * complete column lengths are intentionally not reconstructed from one cut. */
export const BAOHE_INTERIOR_FRAME = Object.freeze({
  id: 'baohe-central-ceiling-1941-registration',
  minX: -19.9, maxX: 19.9, minZ: -8.3, maxZ: 8.2,
  clearHeight: 9.6, clearHeightBand: Object.freeze([9.4,9.8]),
  floorFaceOffset: .03, columnOverlap: .05,
  beamX: Object.freeze([-14.7,-9.15,-3.65,3.65,9.15,14.7]),
  beamSouth: -8.3, beamNorth: 3.6,
  beamWidth: .6, beamDepth: .35, edgeWidth: .4, edgeDepth: .3,
  sectionStatus: 'BEAM_CROSS_SECTIONS_VISUAL_ESTIMATES_NOT_JOINERY_MEASUREMENTS',
  transitionStatus: 'OPEN_FRAME_WITH_RETAINED_LOW_PERIMETER_CEILING_APPROXIMATION',
  plan: 'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/bd6d655c164747f8ad78a760b63750ef.jpg',
  section: 'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/7776fc4d6c3247cf86f04b6a49387405.jpg',
});

export function baoheInteriorFrame({w,d,y,H}) {
  const p=BAOHE_INTERIOR_FRAME;
  if (![w,d,y,H].every(Number.isFinite) || w<44 || w>52 || d<24.4 || d>25.6 || H<6 || H>8.5)
    throw Error('Baohe interior registration requires its retained exterior envelope and lower eave datum');
  const ceilingY=y+p.floorFaceOffset+p.clearHeight;
  return {...p,ceilingY,lowCeilingY:y+H-.05,columnHeight:ceilingY-y+p.columnOverlap};
}

export function baoheHighColumn(i,k) {
  if(!Number.isInteger(i)||!Number.isInteger(k)||i<0||i>9||k<0||k>5)throw Error('Baohe9by5 column station required');
  return i>=1&&i<=8&&k>=1&&k<=4;
}

export function buildBaoheInteriorCeiling(b,g,{x0,z0,y,w,d,H}) {
  const p=baoheInteriorFrame({w,d,y,H}),mat=b.ceilingMaterial();
  const panel=(id,x1,x2,z1,z2,height)=>{
    const geometry=new THREE.PlaneGeometry(x2-x1,z2-z1);geometry.rotateX(Math.PI/2);
    geometry.translate((x1+x2)/2,0,(z1+z2)/2);applyPlanarUV(geometry,'y',1.6);
    const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x0,height,z0);mesh.name=p.id+':'+id;g.add(mesh);
  };
  panel('high-panels',p.minX,p.maxX,p.minZ,p.maxZ,p.ceilingY);
  panel('low-south',-w/2,w/2,-d/2,p.minZ,p.lowCeilingY);
  panel('low-north',-w/2,w/2,p.maxZ,d/2,p.lowCeilingY);
  panel('low-east',-w/2,p.minX,p.minZ,p.maxZ,p.lowCeilingY);
  panel('low-west',p.maxX,w/2,p.minZ,p.maxZ,p.lowCeilingY);
  const beam=(id,bw,bd,x,z,depth)=>{
    const mesh=b.libBox(g,'caihua_beam',bw,depth,bd,x0+x,p.ceilingY-depth/2,z0+z,'band');mesh.name=p.id+':'+id;
  };
  for(const x of p.beamX)beam('main-beam:'+x,p.beamWidth,p.beamNorth-p.beamSouth,x,(p.beamSouth+p.beamNorth)/2,p.beamDepth);
  for(const x of[p.minX,p.maxX])beam('side-frame:'+x,p.edgeWidth,p.maxZ-p.minZ,x,(p.minZ+p.maxZ)/2,p.edgeDepth);
  for(const z of[p.minZ,p.maxZ])beam('end-frame:'+z,p.maxX-p.minX,p.edgeWidth,0,z,p.edgeDepth);
  return p;
}

/** Only the lower hidden closure is opened; the roof's visible slopes stay exact.
 * Four nonoverlapping downward quads retain the original x/z planar UV mapping. */
export function baoheLowerSoffitRing({W,D,inset,y,tile,opening}) {
  const p=BAOHE_INTERIOR_FRAME;
  if(!opening||opening.id!==p.id||![W,D,inset,y,tile].every(Number.isFinite)||tile<=0)
    throw Error('Explicit Baohe lower-soffit registration required');
  for(const k of['minX','maxX','minZ','maxZ'])if(opening[k]!==p[k])throw Error('Unregistered Baohe ceiling opening');
  if(p.minX<=-W/2+inset||p.maxX>=W/2-inset||p.minZ<=-D/2+inset||p.maxZ>=D/2-inset)
    throw Error('Baohe ceiling opening would intersect retained roof slopes');
  const pos=[],uv=[],idx=[];
  const quad=(x1,x2,z1,z2)=>{const n=pos.length/3;for(const[x,z]of[[x1,z1],[x2,z1],[x2,z2],[x1,z2]]){pos.push(x,y,z);uv.push(x/tile,z/tile);}idx.push(n,n+1,n+2,n,n+2,n+3);};
  quad(-W/2,W/2,-D/2,p.minZ);quad(-W/2,W/2,p.maxZ,D/2);
  quad(-W/2,p.minX,p.minZ,p.maxZ);quad(p.maxX,W/2,p.minZ,p.maxZ);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return geo;
}
