import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {restoreReports} from './r52-restore-report-archives.mjs';
const index=JSON.parse(fs.readFileSync(new URL('../reports/r53-transport/ARCHIVES.json',import.meta.url)));
export const restoreR53Reports=({destination=null,...options}={})=>restoreReports({index,destination,...options});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify({verified:restoreR53Reports({destination:process.argv[2]?path.resolve(process.argv[2]):null})},null,2));
