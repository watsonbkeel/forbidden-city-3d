import assert from'node:assert/strict';
export const bounds=[-256,0,416.55,-250.2,.5,418.3];
export const isHandoff=b=>['x','y','z'].every((k,i)=>Math.abs(b.min[k]-bounds[i])<1e-8&&Math.abs(b.max[k]-bounds[i+3])<1e-8);
export function withoutHandoff(rows){assert.equal(rows.filter(isHandoff).length,1,'one exact fitted platform subvolume only');return rows.filter(b=>!isHandoff(b))}
export const landing={"name":"遂初堂","x":-253.1,"z":414.15000000000003,"lookAtX":-253.1,"lookAtZ":418.3,"distance":4.149999999999977,"lateral":0,"entryProfile":"place-ningshou-e604d58704","y":0,"walk":4.85,"approachVerified":true,"fallback":false};
export function assertSuichuLanding(value){assert.deepEqual(value,landing,'exact later Suichu strict landing only');return true}
