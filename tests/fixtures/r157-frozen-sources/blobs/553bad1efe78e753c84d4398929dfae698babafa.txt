import { createGatePlaque } from './GatePlaques.js';

const SOURCE = 'https://www.dpm.org.cn/explore/building/236473.html';
const PHOTO = 'https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c36cf3.jpg';

/** The official close-up and south views put this vertical plaque above the
 * central rear-eave door, not on the open porch's outer beam. The original has
 * Han at the viewer's left and Manchu at right. Render verified Han only until
 * a reviewed transcription and shaping font exist; never invent Manchu marks.
 * Sizes and the simplified frame are model fits, not measured originals. */
export function buildQianqingGatePlaque(builder, { rearEaveZ, doorTopY, beamTopY }) {
  const height = 1.65, width = 1.55;
  const mesh = createGatePlaque(builder, {
    id: 'qianqing-rear-eave-gate-name-plaque', text: '乾清門',
    width, height, depth: .12, layout: 'vertical', style: 'gate-name', side: 'south',
  });
  mesh.position.set(0, doorTopY + .05 + height / 2, rearEaveZ - .42);
  Object.assign(mesh.userData.gatePlaque, {
    source: SOURCE, photograph: PHOTO,
    originalLayout: 'VERTICAL_HAN_LEFT_MANCHU_RIGHT',
    renderedLayout: 'HAN_ONLY_SEMANTIC_APPROXIMATION',
    omittedScript: { script: 'Manchu', status: 'DEFERRED_UNVERIFIED_TRANSCRIPTION_AND_FONT' },
    mount: { kind: 'rear-eave-central-lintel', doorTopY, beamTopY,
      dimensionBasis: 'PHOTO_LOCATION_MODEL_FIT_NOT_SURVEY' },
  });
  return mesh;
}
