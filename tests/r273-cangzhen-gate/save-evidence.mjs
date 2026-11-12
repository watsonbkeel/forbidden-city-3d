import fs from 'node:fs';import path from 'node:path';
export function saveEvidence(name,value){if(process.env.CANGZHEN_EVIDENCE_DIR)fs.writeFileSync(path.join(process.env.CANGZHEN_EVIDENCE_DIR,name),value);}
