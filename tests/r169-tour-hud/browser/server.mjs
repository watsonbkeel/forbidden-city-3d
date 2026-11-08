import {pathToFileURL} from 'node:url';
import {config,repo,vite} from './fixture-config.mjs';
const {createServer}=vite;
export async function startFixtureServer(){
 const server=await createServer({...config,server:{host:'127.0.0.1',port:4179,strictPort:true,fs:{allow:[repo]}},optimizeDeps:{noDiscovery:true},logLevel:'error'});
 await server.listen();return server;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){await startFixtureServer();console.log('Independent UI fixture: http://127.0.0.1:4179');}
