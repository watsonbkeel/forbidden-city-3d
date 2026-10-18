import source from '../../../../data/architecture/taihe-column-grid.json' with { type: 'json' };

// +X is west. Published means are column-grid dimensions, not facade envelope.
// Keep the existing outer wall/eave registration explicitly provisional. The
// inner grid agrees with the independently retained core's six gold columns.
export function taiheColumnGrid(width, depth) {
  if (!Number.isFinite(width) || !Number.isFinite(depth) || width < 61 || depth < 34) {
    throw new Error('Taihe retained envelope must contain the published inner grid');
  }
  const metres = values => values.map(v => v / 1000);
  const f = metres(source.frontageWestToEast), half = f[5] / 2;
  const west = [half], east = [-half];
  for (let i = 4; i >= 0; i--) west.push(west.at(-1) + f[i]);
  for (let i = 6; i < f.length; i++) east.push(east.at(-1) - f[i]);
  const measuredX = [...east.reverse(), ...west];
  const d = metres(source.depthSouthToNorth), measuredZ = [-d.reduce((a,b)=>a+b,0)/2];
  for (const length of d) measuredZ.push(measuredZ.at(-1) + length);
  const x = [...measuredX], z = [...measuredZ];
  x[0] = -width/2; x[x.length-1] = width/2;
  z[0] = -depth/2; z[z.length-1] = depth/2;
  return { x, z, measuredX, measuredZ, centralColumnIndices: [5,6],
    openBayIndices: [4,5,6], openLeft: x[4], openRight: x[7],
    perimeterStatus: 'retained-model-envelope-not-surveyed' };
}
