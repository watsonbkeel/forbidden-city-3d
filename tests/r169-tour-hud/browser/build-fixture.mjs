import {config,root,vite} from './fixture-config.mjs';
const {build}=vite;
await build({...config,build:{outDir:root+'/compiled-fixture',emptyOutDir:false},logLevel:'info'});
