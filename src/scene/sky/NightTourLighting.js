/** Deliberately modest virtual-tour aid, not a measured lunar ephemeris or
 * historical palace illumination. Daylight and renderer exposure stay exact. */
export function nightTourLighting(daylight){
 const d=Math.max(0,Math.min(1,Number.isFinite(daylight)?daylight:1));
 const x=Math.max(0,Math.min(1,(.35-d)/.33)),night=x*x*(3-2*x);
 return{night,moonIntensity:.42*night,hemisphereBoost:.20*night,fillBoost:.15*night,
  meaning:'virtual-night-tour-readability-not-historical-or-astronomical-lighting'};
}
