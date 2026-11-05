import fs from'node:fs';import assert from'node:assert/strict';import{fixture as prior,zone,meshes}from'../r165-yangxin-companions/fixture.mjs';import{buildYangxinCompanionHalls}from'../../src/scene/palace/special/YangxinCompanionHalls.js';
export{zone,meshes};
export function fixture(){const f=prior();try{buildYangxinCompanionHalls(f.kit,zone);return f}catch(e){f.dispose();throw e}}
export async function api(){assert.ok(fs.existsSync(new URL('../../src/scene/palace/special/YanxiRearEarHall.js',import.meta.url)),'F50 private Yanxi component absent');return import('../../src/scene/palace/special/YanxiRearEarHall.js')}
