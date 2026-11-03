import fs from 'node:fs';
import zlib from 'node:zlib';
import {registerHooks,createRequire} from 'node:module';
import * as T from 'three';
import {TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {createDOM} from '../lib/ui-dom.mjs';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {materialPrefix} from './flow.mjs';
registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {ZoneBase}=await import('../../src/scene/zones/ZoneBase.js');
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas'),dom=createDOM(),create=dom.document.createElement;
dom.document.createElement=t=>t==='canvas'?createCanvas(1,1):create(t);globalThis.document=dom.document;globalThis.window=dom.window;
const lib=createActualLibrary(),zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url))),builder=new ZoneBase(lib.library,zone),out=process.argv[2];
fs.mkdirSync(out,{recursive:true});
try{
 const data=builder.build(),triangles=[];let meshes=0;data.group.updateMatrixWorld(true);
 data.group.traverse(m=>{if(!m.isMesh||!m.material?.name?.startsWith(materialPrefix))return;meshes++;const p=m.geometry.attributes.position,ix=m.geometry.index,key=m.material.name.replace(/^r163_yinghua_stele_/,'').replace(/_material$/,'');for(let i=0;i<(ix?.count??p.count);i+=3)triangles.push({v:[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld).toArray()),color:TEXTURE_SPECS[key]?.fallback??('#'+m.material.color.getHexString()),side:m.material.side});});
 const runtimeTriangles=triangles.length;
 // Twelve temporary display-ground faces only in this CPU stream, never
 // inserted into the scene, native colliders, production source or data.
 const ground=new T.BoxGeometry(24,.06,24).translate(277.2,-.04,469),p=ground.attributes.position,ix=ground.index;
 for(let i=0;i<ix.count;i+=3)triangles.push({v:[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+j)).toArray()),color:'#a9a49b',side:0});ground.dispose();
 for(const [view,eye,target]of[['front',[277.2,3.6,456],[277.2,3.1,469]],['oblique',[287,7,458],[277.2,3,469]]]){const c=new T.PerspectiveCamera(45,1000/650,.03,150);c.position.set(...eye);c.lookAt(...target);c.updateMatrixWorld(true);fs.writeFileSync(out+'/'+view+'.json.gz',zlib.gzipSync(JSON.stringify({view,triangles,camera:{width:1000,height:650,fov:45,eye,matrixWorldInverse:c.matrixWorldInverse.toArray()}})));}
 const receipt={normalZoneBaseSoleHook:true,sourceRecords:data.group.userData.architecture.filter(q=>q.sourceObjectId==='FC-D385802B72').length,mergedMeshes:meshes,runtimeTriangles,diagnosticGroundTriangles:12,totalTriangles:triangles.length};fs.writeFileSync(out+'/cpu-export.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{builder.dispose();lib.dispose();}
