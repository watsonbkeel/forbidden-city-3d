// Observer/output relocation only. No source loader, geometry, control, clock,
// physics, test assertion or other filesystem operation is changed.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const map=new Map([
 ['../r157-a37-20261030-evidence/wuying-body-press.json','wuying-body-press-0812.json'],
 ['../r157-a37-20261030-evidence/wuying-high-drop.json','wuying-high-drop-0812.json'],
]);const root=path.resolve(process.env.WUYING_NEW_EVIDENCE_DIR),original=fs.writeFileSync;
fs.writeFileSync=function(file,...args){if(map.has(file)){const next=path.join(root,map.get(file));assert.equal(fs.existsSync(next),false,'never overwrite evidence');console.log('OUTPUT_ONLY_REDIRECT',file,next);return original.call(this,next,...args);}return original.call(this,file,...args);};
