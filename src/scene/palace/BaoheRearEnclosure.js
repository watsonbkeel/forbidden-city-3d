/** Museum rear photograph + labelled1941 rear elevations show continuous solid
 * wings around three central door bays. Thickness uses the retained1m lower
 * side-wall envelope to enclose tapered post bases, not a new survey. Existing doorway/collision registration owns
 * passage limits; this visual-only helper cannot add or remove navigation. */
export const BAOHE_REAR_ENCLOSURE = Object.freeze({
  wallDepth: 1,
  solidBays: Object.freeze([0,1,2,6,7,8]),
  status: 'PHOTO_AND_HISTORICAL_TOPOLOGY_RETAINED_DIMENSIONS_NOT_SURVEY',
});

export function buildBaoheRearEnclosure(builder, group, {x0,zf,y,w,height,openLeft,openRight}) {
  if (![x0,zf,y,w,height,openLeft,openRight].every(Number.isFinite)
      || w<=0 || height<=0 || !(-w/2<openLeft && openLeft<openRight && openRight<w/2)) {
    throw Error('Baohe rear solid wings require two bounded sides and an open central span');
  }
  for (const [side,a,b] of [['negativeX',-w/2,openLeft],['positiveX',openRight,w/2]]) {
    const wall=builder.libBox(group,'wall_red',b-a,height,BAOHE_REAR_ENCLOSURE.wallDepth,
      x0+(a+b)/2,y+height/2,zf,'box');
    wall.userData.baoheRearEnclosure={side,bounds:[a,b],status:BAOHE_REAR_ENCLOSURE.status};
  }
}
