import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const configured=process.env.EVIDENCE_DIR;
if(configured&&!path.isAbsolute(configured))throw Error('EVIDENCE_DIR must be absolute');
const root=configured||fs.mkdtempSync(path.join(os.tmpdir(),'r298-side-'));
fs.mkdirSync(root,{recursive:true});
export const evidenceFile=name=>path.join(root,name);
