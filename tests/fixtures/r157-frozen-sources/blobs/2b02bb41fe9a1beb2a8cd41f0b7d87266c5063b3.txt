// Frozen, Wumen-only source-registered experiment. Arithmetic precision is not
// survey precision. No reference images or fonts are shipped with this card.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const WUMEN_VERTICAL_PROFILE = freeze({
  "status": "SOURCE_REGISTERED_EXPERIMENT_NOT_MEASURED_2026_STATE",
  "units": "model metres; arithmetic precision is not source precision",
  "retained": {
    "floorY": 12.3,
    "worldAnchorZ": -419.6,
    "outerGridWidth": 60.05,
    "outerGridDepth": 25,
    "roofInputWidth": 60.65,
    "roofInputDepth": 25.6,
    "upperWallWidth": 54.506,
    "upperWallDepth": 19.456,
    "lowerOverhang": 3.072,
    "lowerInset": 3.072,
    "lowerBracketHeight": 1.28,
    "lowerRafterThickness": 0.3072,
    "lowerRidgeRadius": 0.2304,
    "upperRidgeHalfWidth": 17.525,
    "upperEaveHalfWidth": 29.58772,
    "upperEaveCornerLift": "retain until evidence supports change"
  },
  "body": {
    "height": 6.960213793103446,
    "beamHeight": 0.8352256551724134,
    "wallHeight": 6.124988137931032,
    "doorHeight": 5.2,
    "doorHeadClearance": 0.9249881379310319,
    "basis": "Solve actual lower skirt eave equation; preserve existing beam proportion as labelled approximation."
  },
  "roof": {
    "baseY": 19.260213793103446,
    "lowerBracketTopY": 20.540213793103447,
    "lowerEaveY": 20.00114942528736,
    "lowerTileInnerY": 22.18505747126437,
    "lowerRoofRise": 2.1839080459770095,
    "lowerRidgeTopY": 22.599777471264368,
    "lowerProfileCoefficient": 0.55,
    "upperWoodTopY": 22.932183908045978,
    "upperCaihuaTopY": 24.02413793103448,
    "upperBearingSoffitY": 25.460919540229888,
    "upperBracketHeight": 1.4367816091954069,
    "upperCaihuaHeight": 1.091954022988503,
    "upperEaveY": 25.748275862068965,
    "upperFasciaBottomY": 25.231034482758623,
    "upperTileRidgeY": 34.713793103448275,
    "upperTileRise": 8.96551724137931,
    "upperProfileCoefficient": 0.48,
    "upperEaveHalfDepth": 13.045977011494253,
    "upperOverhangZ": 3.3179770114942535,
    "upperRafterEndThickness": 0.3448275862068944,
    "upperEaveSoffitY": 25.403448275862072,
    "upperTileAtWallY": 27.144328725878207,
    "upperTileToBearingDepthAtWall": 1.683409185648319,
    "upperSoffitPolicy": "Separate bearing/soffit profile from tile profile: wall end at registered bearing, eave end at rafter-end underside. Straight provisional interpolation; no claim of exact rafters/joinery.",
    "bandInterpretation": "355±8 and380±8 are neutral section support/reference levels.399–402 is an internal strip boundary, not the full beam assembly bottom; another horizontal band continues to412–414. Wood/caihua/dougong are implementation material labels, not direct identifications from the monochrome section. Preserve lower layered region in exterior approximation; check official color close-up qualitatively."
  },
  "plaque": {
    "blueToUpperWallWidth": 0.03,
    "blueWidth": 1.6351799999999999,
    "blueHeight": 2.18024,
    "outerWidth": 2.9730545454545454,
    "outerHeight": 3.3033939393939393,
    "innerHeightToOuterHeight": 0.66,
    "outerWidthToOuterHeight": 0.9,
    "depth": 0.12,
    "backZ": -10.728,
    "frontZ": -10.847999999999999,
    "wallStandOff": 1.0,
    "centerY": 23.47933751306165,
    "frameTopY": 25.131034482758622,
    "frameBottomY": 21.82764054336468,
    "analyticLowerTileAtBackY": 21.695683697813774,
    "analyticUpperFrameClearance": 0.10000000000000142,
    "analyticLowerFrameClearance": 0.13195684555090637,
    "mountStatus": "PROVISIONAL_MODEL_CLEARANCE_FIT_NOT_MEASURED_INSTALLATION. 1m stand-off is rounded conservative local fit after source-profile correction, not a source dimension. Recompute against generated mesh; do not silently increase if blocked.",
    "frameChoice": "Keep self-authored simplified silhouette and panel/frame proportions; do not trace image. Official0.642 inner/fullheight vs model0.66 is secondary to whole-scale issue.",
    "fontChoice": "Keep existing system-font semantic approximation; no resolution-driven enlargement or invented calligraphy."
  },
  "review": "Conditional independent source support for neutral bearing/support bands and Wumen-only decoupled soffit. Exact exposed painted-material partition and mount remain provisional.",
  "id": "wumen-main-tower-2005-section-experiment",
  "provenance": {
    "cardSha256": "72960da6a440e4809b8d48f6aeda2d46e9ec73a84dad7bc7ad6160388c129662",
    "section": "https://img.dpm.org.cn/Uploads/pdf/4884/T00114_00.pdf",
    "photos": [
      "https://www.dpm.org.cn/explore/building/236454.html",
      "https://www.dpm.org.cn/light/371147.html"
    ],
    "registration": "2005 report p114: 435 graphical pixels registered provisionally to published 25m depth; crop floor y584 anchored to retained model floor 12.3. Isotropic reproduction assumed; not a measured height.",
    "neutralSectionReferences": {
      "bearingYpx": 355,
      "supportLowerYpx": 380,
      "internalLayerPartitionYpx": 399,
      "lowerLayerJunctionYpx": [
        412,
        414
      ]
    },
    "materialInterpretation": "Wood/caihua/dougong are provisional exterior material labels, not identifications from monochrome section lines. Source y399 is an internal partition; lower visible layer continues to y412–414.",
    "absoluteHeight": "Retained floor datum and ornament morphology do not verify total height. Official tourism 37.95m and older Museum 35m+ have unresolved endpoints/baselines; tile ridge and actual ornament bounds are distinct."
  }
});
