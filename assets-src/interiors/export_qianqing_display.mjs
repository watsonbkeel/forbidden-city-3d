// Transfer our own frozen R31 ornament geometry into the permanent display owner.
// No museum photo is embedded; carvings remain simplified model interpretations.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const path=new URL('../../public/models/interiors/qianqing-r31.glb',import.meta.url),bytes=fs.readFileSync(path),sha=createHash('sha256').update(bytes).digest('hex');
if(sha!=='76b14ddf270ba1a6c1d0109b47c7c99f441af49b469c908f5af41d93697d3d5d')throw Error('Frozen R31 source mismatch');
const root=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;root.updateMatrixWorld(true);
const groups=new Map(),v=new T.Vector3(),normal=new T.Vector3();
root.traverse(m=>{
 if(!m.isMesh||!['gold_lacquer','bronze','qianqing_enamel','brick_grout'].includes(m.material.name))return;
 const g=m.geometry.clone().applyMatrix4(m.matrixWorld),p=g.attributes.position,n=g.attributes.normal,ix=g.index;
 for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k),ys=ids.map(j=>p.getY(j)),zs=ids.map(j=>p.getZ(j));
  if(m.material.name==='brick_grout'&&Math.max(...ys)<.1)continue; // Floor slab stays optional.
  const x=ids.reduce((s,j)=>s+p.getX(j),0)/3,sign=x<0?-1:1,pavilion=Math.max(...zs)<2.65;
  const kind=pavilion?'incense':Math.abs(x)<2.55?'luduan':'crane',material=m.material.name==='brick_grout'?'dark':m.material.name==='gold_lacquer'?'gold':m.material.name==='qianqing_enamel'?'enamel':'bronze';
  const key=`${kind}:${sign}:${material}`;if(!groups.has(key))groups.set(key,{kind,sign,material,position:[],normal:[]});const out=groups.get(key);
  for(const j of ids){v.fromBufferAttribute(p,j);normal.fromBufferAttribute(n,j);out.position.push(...v.toArray().map(x=>+x.toFixed(6)));out.normal.push(...normal.toArray().map(x=>+x.toFixed(6)));}
 }
 g.dispose();
});
const result={id:'qianqing-r32-permanent-display-source',sourceAsset:'qianqing-r31.glb',sourceSHA256:sha,status:'SELF_AUTHORED_APPROXIMATION_TRANSFER_NOT_SCANNED_ARTIFACT',parts:[...groups.values()]};
fs.writeFileSync(new URL('../../data/architecture/qianqing-display-geometry.json',import.meta.url),JSON.stringify(result)+'\n');
console.log(JSON.stringify({parts:result.parts.length,triangles:result.parts.reduce((s,p)=>s+p.position.length/9,0),bytes:JSON.stringify(result).length}));
