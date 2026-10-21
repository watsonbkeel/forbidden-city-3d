// Run from target checkout, or provide its absolute path as the first argument.
// Read-only bounded historical supplement. This is not a current-Yanxi source pass.
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(process.argv[2]??process.cwd());
const receipt=JSON.parse(readFileSync(new URL('./yanxi-tail-inputs.json',import.meta.url)));
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern='^(?:'+receipt.selectedNames.map(escape).join('|')+')$';
const result=spawnSync(process.execPath,['--import',fileURLToPath(new URL('./yanxi-source-input-hook.mjs',import.meta.url)),'--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern',pattern,...receipt.selectedFiles],{cwd:root,stdio:'inherit',env:{...process.env,R48_REPO:root}});
if(result.error)throw result.error;
process.exitCode=result.status??1;
