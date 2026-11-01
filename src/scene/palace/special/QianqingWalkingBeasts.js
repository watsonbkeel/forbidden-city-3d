/** Qianqing-specific count contract, not a reconstruction of individual species.
 * The museum's own building text states nine ridge beasts at the eave corners;
 * its south and southwest photographs show rows on both tiers. Rear-corner
 * counts follow that building-wide description, not an unseen rear photograph.
 * Retained roof dimensions, animal size, spacing and simplified box forms are
 * model fits. Rider, terminal hip beast and fine carving remain unresolved.
 */
export const QIANQING_WALKING_BEAST_PROFILE = Object.freeze({
  id: 'qianqing-nine-walking-beasts',
  entityId: 'FC-38B23747E9',
  counts: Object.freeze({lower:9,upper:9}),
  type: 'wudian', width:46.6, depth:25.6, layers:2,
  source: 'https://www.dpm.org.cn/explore/building/236472.html',
  photos: Object.freeze([
    'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997affc5961.jpg',
    'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997b60369a5.jpg',
  ]),
  status: 'DOCUMENTED_COUNT_WITH_MODEL_FIT_PLACEMENT_NOT_SPECIES_RECONSTRUCTION',
});
