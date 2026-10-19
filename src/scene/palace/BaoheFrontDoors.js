import {baoheFrontBox} from './BaoheFrontEnclosure.js';

/** Four-part front enclosure from the museum's modern front photograph and
 * 1941 elevation49. Thickness, hinge mechanics and the inward90-degree open
 * pose are modeling estimates. Photographed barriers do not grant real entry. */
export const BAOHE_FRONT_DOORS = Object.freeze({
  id: 'baohe-front-four-part-door-assembly',
  divisions: 4, thickness: .12,
  status: 'PHOTO_COMPOSITION_WITH_ESTIMATED_HINGES_AND_THICKNESS',
  access: 'VIRTUAL_WALK_THROUGH_NOT_MUSEUM_ACCESS_PERMISSION',
  source: 'https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/dlV1Td6ERs6f20zINpkskcSWnuy6tdjhfEpVP0B9.jpg',
});

export function baoheFrontDoorLeaves({xc, zf, y, height, bayWidth, columnRadius}) {
  if (![xc,zf,y,height,bayWidth,columnRadius].every(Number.isFinite)
      || height<=0 || columnRadius<=0 || bayWidth<5 || bayWidth>7.5) {
    throw Error('Baohe front door requires its registered central three bays');
  }
  const clear=bayWidth-2*columnRadius, width=clear/4;
  if (width<1 || width>1.8) throw Error('Unreviewed Baohe door clear width');
  const t=BAOHE_FRONT_DOORS.thickness;
  return [-1,1].flatMap(side=>[
    {kind:'outer-closed', side, x:xc+side*(clear/2-width/2), y:y+height/2,
      z:zf, width, height, depth:t, rotateY:0},
    {kind:'inner-folded', side, x:xc+side*width, y:y+height/2,
      z:zf+width/2, width, height, depth:t, rotateY:Math.PI/2},
  ]);
}

export function buildBaoheFrontDoors(b,g,args) {
  const leaves=baoheFrontDoorLeaves(args);
  for (const p of leaves) {
    const m=baoheFrontBox(b,g,{kind:'leaf',w:p.width,h:p.height,d:p.depth,x:p.x,y:p.y,z:p.z,hiddenBottom:true});
    m.rotation.y=p.rotateY;
    m.name=BAOHE_FRONT_DOORS.id+':'+p.kind+':'+p.side;
    m.userData.baoheFrontDoor={...BAOHE_FRONT_DOORS,kind:p.kind,side:p.side};
    // AABB follows the exact visible rectangular leaf, including the folded
    // leaf's depth into the room. Never retain the former invisible pass-through.
    const hx=(p.rotateY?p.depth:p.width)/2, hz=(p.rotateY?p.width:p.depth)/2;
    b.col(p.x-hx,p.y-p.height/2,p.z-hz,p.x+hx,p.y+p.height/2,p.z+hz);
  }
  return leaves;
}
