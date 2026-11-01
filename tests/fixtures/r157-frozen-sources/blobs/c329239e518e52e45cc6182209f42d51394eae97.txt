/** Taihemen's observed south veranda, not a surveyed full-hall reconstruction.
 * The official four-depth-bay statement does NOT establish a 10 x 5 occupied
 * column grid. Keep the inherited 40 columns at their existing coordinates
 * until a usable plan / section resolves that separate structural discrepancy.
 */
export function taihemenSouthProfile({width, depth}) {
  if (![width,depth].every(Number.isFinite) || Math.abs(width-48.06)>1e-6 || Math.abs(depth-20.54)>1e-6)
    throw Error('Taihemen enclosure requires its retained 48.06 x 20.54 envelope');
  return {
    id:'taihemen-south-open-veranda-r58', entityId:'FC-B3B12CF397', accepted:false,
    frontageBays:9, southOpenBayIndices:[1,2,3,4,5,6,7], southClosedBayIndices:[0,8],
    // Retained game passage topology, NOT a source-confirmed leaf inventory.
    retainedInnerOpenBayIndices:[3,4,5],
    southEaveZ:-depth/2, innerEnclosureZ:-depth/2+depth/3,
    innerEnclosureStatus:'PHOTO_TOPOLOGY_FIT_TO_RETAINED_INNER_ROW',
    innerDoorInventoryStatus:'RETAINED_UNVERIFIED',
    documentedDepthBays:4, retainedModelDepthBays:3, depthStatus:'BLOCKED_SOURCE',
    columnOccupancyStatus:'RETAINED_40_NOT_VERIFIED', northStatus:'RETAINED_UNVERIFIED',
    ceilingFrameStatus:'RETAINED_UNVERIFIED',
    sources:[
      {url:'https://www.dpm.org.cn/explore/building/236439.html',
        use:'Official nine frontage / four depth bays; not a column-position survey',photographyDate:null},
      {url:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg',
        use:'South front: seven open porch bays, two closed end bays and recessed enclosure',
        uploadPathDate:'2020-04-16',photographyDate:null},
      {url:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e9837bfea847.jpg',
        use:'Taihemen foreground porch columns / overhead frame looking south toward Wumen; incomplete interior',
        uploadPathDate:'2020-04-16',photographyDate:null},
    ],
  };
}
