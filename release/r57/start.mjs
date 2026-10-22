// Local-only static server for the already-built R57 package. No dependencies.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
if(!fs.existsSync(path.join(root,'index.html')))throw Error('Missing dist/index.html. Extract the complete R57 production package first.');
const server=http.createServer((req,res)=>{
 let target;try{target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));}catch{res.writeHead(400);res.end('Bad request');return}
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
 if(target===root||req.url.split('?')[0].endsWith('/'))target=path.join(target,'index.html');
 fs.stat(target,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404);res.end('Not found');return}
  res.writeHead(200,{'Content-Type':types[path.extname(target).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache'});
  if(req.method==='HEAD'){res.end();return}const stream=fs.createReadStream(target);stream.on('error',()=>res.destroy());stream.pipe(res);
 });
});
server.listen(port,'127.0.0.1',()=>console.log(`R57 production package: http://127.0.0.1:${server.address().port}\nCharacters are on by default. Ctrl+C to stop. Not a deployment.`));
