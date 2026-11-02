import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as T from 'three';
const target=new URL('../../src/scene/palace/special/WuyingMoonTerrace.js',import.meta.url).href;
let hook;
if(process.argv.includes('--parent')) {
 const source=execFileSync('git',['show','c376ef094e0377ecee183a31252d3eadb95c54a2:src/scene/palace/special/WuyingMoonTerrace.js'],{encoding:'utf8'});
 hook=registerHooks({load(url,context,next){return url===target?{format:'module',source,shortCircuit:true}:next(url,context);}});
}
const{fixture}=await import('./fixture.mjs');hook?.deregister();
const{z,lib}=fixture();
const physical={colliders:z.kit.colliders,walkables:z.kit.walkables,rooms:z.kit.rooms,mapItems:z.kit.mapItems};
const hash=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
const triangles=[];
z.kit.root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;
 for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k),v=ids.map(j=>new T.Vector3().fromBufferAttribute(p,j));
  // Exclude precisely the old duplicate lids, not the real paving caps.
  if(['wuying-moon-terrace-surface','wuying-moon-terrace-north-shoulder'].includes(m.userData.role)&&new T.Triangle(...v).getNormal(new T.Vector3()).y>.9)continue;
  triangles.push(v.map(q=>q.applyMatrix4(m.matrixWorld).toArray()).flat());
 }
});
triangles.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
console.log(JSON.stringify({geometryExceptDuplicateLidsHash:hash(triangles),triangles:triangles.length,physicalHash:hash(physical),counts:Object.fromEntries(Object.entries(physical).map(([k,v])=>[k,v.length]))}));
z.kit.dispose(z.kit.root);lib.dispose();
