import {TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import fs from 'node:fs';import zlib from 'node:zlib';
import {fixture,T,zone} from './fixture.mjs';
import {buildYinghuaStelePavilion} from '../../src/scene/palace/special/YinghuaStelePavilion.js';
const f=fixture(),out=process.argv[2];fs.mkdirSync(out,{recursive:true});
try{const r=buildYinghuaStelePavilion(f.kit,zone);f.kit.box(f.kit.root,'stone_slab',24,.06,24,277.2,-.04,469);f.kit.root.updateMatrixWorld(true);const triangles=[];f.kit.root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const mat=m.material,key=mat.name.replace(/^r163_yinghua_stele_/,'').replace(/_material$/,'');triangles.push({v:[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld).toArray()),color:TEXTURE_SPECS[key]?.fallback??('#'+mat.color.getHexString()),side:mat.side});}});
for(const [view,eye,target] of [['front',[277.2,3.6,456],[277.2,3.1,469]],['oblique',[287,7,458],[277.2,3,469]]]){const c=new T.PerspectiveCamera(45,1000/650,.03,150);c.position.set(...eye);c.lookAt(...target);c.updateMatrixWorld(true);fs.writeFileSync(out+'/'+view+'.json.gz',zlib.gzipSync(JSON.stringify({view,triangles,camera:{width:1000,height:650,fov:45,eye,matrixWorldInverse:c.matrixWorldInverse.toArray()}})));}
console.log(JSON.stringify({triangles:triangles.length,bounds:new T.Box3().setFromObject(r.frame),owners:f.kit.colliders.length,supports:f.kit.walkables.length}));}finally{f.dispose();}
