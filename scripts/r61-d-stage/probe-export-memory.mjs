// Isolated synthetic merged-mesh resource probe. Not a game/world performance test.
import * as THREE from 'three';
import fs from 'node:fs';
import {exportProductionView} from '../../tests/lib/r51-production-raster.mjs';
const count=Number(process.env.TRIANGLES??100000),p=new Float32Array(count*9);
for(let i=0;i<count;i++)p.set([-.2,0,-3,.2,0,-3,0,.4,-3],i*9);
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.computeVertexNormals();
const scene=new THREE.Scene(),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x997755}));scene.add(mesh);
const camera=new THREE.PerspectiveCamera(65,16/9,.1,200);camera.updateMatrixWorld(true);
const app={scene,camera,characters:{manager:{simulationSeconds:1}}};global.gc?.();const before=process.memoryUsage();
const exporter=process.env.BOUNDED==='1'?(await import('../../tests/lib/r61-bounded-production-raster.mjs')).exportProductionViewBounded:exportProductionView;
const path='/tmp/r61-export-probe-'+process.pid+'.json.gz',start=performance.now(),r=exporter(app,path,{far:45});
const after=process.memoryUsage();console.log(JSON.stringify({exporter:process.env.BOUNDED==='1'?'bounded':'legacy',triangles:r.triangles,before,after,resource:process.resourceUsage(),milliseconds:performance.now()-start,bytes:fs.statSync(path).size}));fs.unlinkSync(path);
