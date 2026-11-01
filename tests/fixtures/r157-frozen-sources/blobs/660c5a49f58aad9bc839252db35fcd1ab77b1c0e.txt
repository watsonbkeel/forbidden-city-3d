/** South-facing surfaces only. The museum's frontal views show one wider,
 * slightly taller central field flanked by narrow fields in each end bay.
 * Width/height ratios and lattice pitch are photo fits, not surveyed sizes.
 * The retained north-facing surface and rear-eave windows are not extrapolated.
 * Reuses existing owned materials; creates no colliders, supports or textures.
 */
export function buildQianqingGateSouthWindow(builder, group, { x, z, width, height, bottom, grid, frame }) {
  const panels = [
    { x: x - width * .38, width: width * .22, height: height * .90 },
    { x, width: width * .50, height },
    { x: x + width * .38, width: width * .22, height: height * .90 },
  ];
  const face = z - .19;
  for (const p of panels) {
    p.bottom = bottom;
    for (const s of [-1, 1]) builder.box(group, frame, .085, p.height + .085, .10,
      p.x + s * p.width / 2, bottom + p.height / 2, face);
    builder.box(group, frame, p.width + .085, .085, .10, p.x, bottom + p.height, face);
  }
  // All fields share the existing level sill: one bottom trim and continuous
  // lattice courses behind the narrow front frame joints avoid triplicating
  // hidden horizontal pieces. The former coarse lattice pitch is retained;
  // fine historical joinery remains unverified. Red upper infill occludes the
  // taller grid behind the lower outer fields, with no coplanar surfaces.
  builder.box(group, frame, width, .085, .10, x, bottom, face);
  const nx = Math.max(2, Math.round(width / .4)), ny = Math.max(2, Math.round(height / .4));
  for (let k = 0; k <= nx; k++) builder.box(group, grid, .055, height, .07,
    x - width / 2 + width * k / nx, bottom + height / 2, z - .162);
  for (let k = 1; k < ny; k++) builder.box(group, grid, width, .055, .07,
    x, bottom + height * k / ny, z - .162);
  // Plain red infill above the lower side frames, within the old opaque window
  // boundary. It does not move or enlarge the retained end wall/sill proxy.
  for (const p of [panels[0], panels[2]]) {
    const top = bottom + p.height + .043, h = bottom + height - top;
    builder.libBox(group, 'wall_red', width * .24, h, .08, p.x, top + h / 2, z - .18);
  }
  return {
    source: 'https://www.dpm.org.cn/explore/building/236473.html',
    photos: ['https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c38de7.jpg', 'https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c3ba59.jpg'],
    sourcePhotoDate: null, sourceURLDate: '2020-11-17',
    basis: 'VISIBLE_THREE_FIELD_RELATION_AND_PHOTO_FITTED_RATIOS_NOT_SURVEY',
    outerFaceOnly: true, completeWindowRestoration: false,
    retainedInnerSurface: true, retainedRearWindows: true,
    x, z, width, height, bottom, panels,
  };
}
