import assert from'node:assert/strict';
export const delta=" // Retained solid platform, only within the south-stair handoff footprint.\n // Keep outer side/rear platform edges unchanged; a full box blocks the old rear route.\n kit.col(f,-width/2-cheekWidth-.5,0,edge,width/2+cheekWidth+.5,p.ph,p.portals.find(q=>q.side==='front').z);\n";
export function stripDelta(s){assert.equal(s.split(delta).length,2,'one exact south-platform handoff call');return s.replace(delta,'')}
