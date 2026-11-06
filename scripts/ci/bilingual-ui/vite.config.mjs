import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const work=process.env.BILINGUAL_UI_WORK_ROOT,scratch=process.env.BILINGUAL_UI_SCRATCH_DIR;
if(!work||!path.isAbsolute(work)||scratch!==path.join(work,'scratch'))throw Error('Exact same-run Vite scratch required');
export default {root,base:'/',optimizeDeps:{entries:['tests/bilingual/browser/fixture.html']},cacheDir:path.join(scratch,'vite-cache'),server:{host:'127.0.0.1',port:4179,strictPort:true,open:false,fs:{strict:true,allow:[root]}}};
