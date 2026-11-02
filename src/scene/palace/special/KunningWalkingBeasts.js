/** Kunning-only count/placement fit. Zheng Lianzhang's Palace Museum text
 * states seven animals; the palace's own southwest photograph separately
 * shows seven behind a rider on the far right upper AND lower target eaves.
 * The overlapping roof at image upper right belongs to another building.
 * Hidden corners follow the building-wide count, not independent photographs.
 * Existing dimensions and simple bodies/heads are engineering fits, not a
 * species sculpture, survey or whole-building fidelity claim. */
export const KUNNING_WALKING_BEAST_PROFILE = Object.freeze({
  id:'kunning-seven-walking-beasts',entityId:'FC-8FF65D8732',
  counts:Object.freeze({lower:7,upper:7}),
  type:'wudian',width:46.6,depth:20.6,layers:2,baseY:9.40375,
  source:'https://img.dpm.org.cn/Uploads/pdf/1602/T00091_00.pdf',
  photos:Object.freeze(['https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997ecca81fc.jpg']),
  photoCoverage:'TWO_TIERS_AT_ONE_VISIBLE_FAR_CORNER; OTHER_BUILDING_EXCLUDED; HIDDEN_CORNERS_TEXT_INFERENCE',
  status:'DOCUMENTED_COUNT_WITH_MODEL_FIT_PLACEMENT_NOT_SPECIES_RECONSTRUCTION',
});
