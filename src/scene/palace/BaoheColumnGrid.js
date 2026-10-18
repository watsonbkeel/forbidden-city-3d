/** Column stations read from the museum's1941 plan, rounded to decimetres.
 * Inner stations only: the inherited49.7m exterior envelope remains provisional.
 * No global rescale, depth recalibration or new/removal of columns is implied. */
export function baoheColumnGrid(width) {
  if(!Number.isFinite(width)||width<44)throw Error('Baohe retained envelope must contain the registered inner grid');
  const x=[-width/2,-19.9,-14.7,-9.15,-3.65,3.65,9.15,14.7,19.9,width/2];
  return {id:'baohe-inner-frontage-1941-registration',x,openBayIndices:[3,4,5],openLeft:x[3],openRight:x[6],
    source:'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/b1ced0e6c4924342bf1d7cfb86b47788.jpg',
    dimensionsStatus:'ROUNDED_DRAWING_REGISTRATION_NOT_CURRENT_SURVEY',perimeterStatus:'RETAINED_PROVISIONAL',
    centralBayRange:[7.1,7.5],centralBay:7.3};
}
