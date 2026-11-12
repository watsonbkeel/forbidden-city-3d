import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const requested=process.env.EVIDENCE_DIR;if(requested&&!path.isAbsolute(requested))throw Error('EVIDENCE_DIR must be absolute');
const dir=requested?path.join(requested,'r291-b23'):fs.mkdtempSync(path.join(os.tmpdir(),'r291-b23-'));fs.mkdirSync(dir,{recursive:true});
export const evidenceFile=name=>path.join(dir,name);
