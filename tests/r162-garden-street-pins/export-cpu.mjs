// Diagnostic only: actual CourtKit gate meshes and new pin meshes, no World.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {applyGardenStreetGatePins} from '../../src/scene/palace/special/GardenStreetGatePins.js';
import {CASES,fixture,T} from './fixture.mjs';
const out=process.argv[2];if(!out)throw Error('output directory required');fs.mkdirSync(out,{recursive:true});
for(const c of CASES)for(const stage of ['before','after']){
 const f=fixture(c);
 try{
  const result=stage==='after'?applyGardenStreetGatePins(f.kit,f.frame,f.context):null;
  f.kit.buildPlaqueAtlas();f.kit.root.updateMatrixWorld(true);
  const eye=new T.Vector3(2.8,5.6,c.side*9).applyMatrix4(f.frame.matrixWorld).toArray(),target=new T.Vector3(0,4.75,0).applyMatrix4(f.frame.matrixWorld).toArray();
  const camera=new T.PerspectiveCamera(36,1000/600,.03,100);camera.position.set(...eye);camera.lookAt(...target);camera.updateMatrixWorld(true);
  const triangles=[];f.frame.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;let pin=-1;for(let o=m;o&&o!==f.frame;o=o.parent)if(o.parent===result?.frame)pin=result.pins.indexOf(o);for(let i=0;i<(ix?.count??p.count);i+=3)triangles.push({v:[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld).toArray()),color:TEXTURE_SPECS[m.material.name.replace(/_material$/,'')]?.fallback??('#'+m.material.color.getHexString()),side:m.material.side,pin});});
  const file=out+'/'+c.itemIndex+'-'+stage+'.json.gz';fs.writeFileSync(file,gzipSync(JSON.stringify({view:c.itemIndex+' '+stage,gate:c.item.name,stage,photoFaceLocalZ:c.side,triangles,camera:{width:1000,height:600,fov:36,eye,matrixWorldInverse:camera.matrixWorldInverse.toArray()}})));console.log(JSON.stringify({file,triangles:triangles.length,pins:result?.pins.length??0}));
 }finally{f.dispose();}
}
