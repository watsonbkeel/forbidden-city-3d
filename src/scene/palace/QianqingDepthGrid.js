/** Five depth bays and reduced front central columns are official facts.
 * The six metric stations below are a reversible spatial fit in the retained
 * 25 m envelope, NOT measured axes. Narrow front/rear verandas surround the
 * three larger interior intervals. The retained central display is not moved.
 */
export const QIANQING_SPATIAL_FIT = Object.freeze({
  id: 'qianqing-five-depth-bays-r33',
  status: 'OFFICIAL_TOPOLOGY_WITH_REVERSIBLE_FIT_NOT_SURVEY',
  source: 'https://www.dpm.org.cn/explore/building/236472.html',
  plan: 'https://img.dpm.org.cn/Uploads/pdf/2201/T00008_00.pdf',
  official: Object.freeze({frontageBays:9,depthBays:5,frontCentralReduction:true,endPassages:2}),
  fittedDepthStations: Object.freeze([-12.5,-9.5,-4.5,4.5,9.5,12.5]),
  assumption: '3m verandas; 5/9/5m inner intervals; row identities and metric offsets are model-fit.',
  reducedFrontIndices: Object.freeze([4,5]),
  displayClearanceIndices: Object.freeze([4,5]),
  columnsOwner: 'PalaceBuilder',
});

export function qianqingDepthGrid(depth) {
  if(!Number.isFinite(depth)||Math.abs(depth-25)>1e-8)throw Error('Unregistered Qianqing fitted envelope');
  const z=[...QIANQING_SPATIAL_FIT.fittedDepthStations];
  return {...QIANQING_SPATIAL_FIT,z,depthBays:5,frontDoorZ:z[1],rearDoorZ:z[4],
    southEaveZ:z[0],northEaveZ:z[5],frontVerandaDepth:z[1]-z[0],rearVerandaDepth:z[5]-z[4]};
}

export function qianqingColumnPresent(j,k) {
  if(!Number.isInteger(j)||j<0||j>9||!Number.isInteger(k)||k<0||k>5)
    throw Error('Unknown Qianqing fitted column identity');
  // Front central inner pair is omitted by the official reduced-column relation.
  // The second omission preserves the existing platform's occupied volume;
  // this does not claim an independently surveyed historic missing-column list.
  return !([4,5].includes(j)&&(k===1||k===3));
}
