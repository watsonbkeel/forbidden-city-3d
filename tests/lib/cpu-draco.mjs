import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {BufferGeometry,BufferAttribute} from 'three';

// Test/report adapter only. Execute the repository's pinned, already shipped
// Draco JS decoder locally. No worker, network, browser or production override.
// The extraction follows Three r162 DRACOLoader's unique-ID glTF branch.
let ready;
async function decoderModule(){
 if(!ready)ready=(async()=>{
  const url=new URL('../../public/draco/draco_decoder.js',import.meta.url),source=fs.readFileSync(url,'utf8');
  if(createHash('sha256').update(source).digest('hex')!=='8625489da79a805f4f2a7d511c3e52d8b4085608a9d2a4d5f4f9de5db0aea04f')throw Error('Unrecognized bundled CPU Draco decoder');
  const module={exports:{}},filename=fileURLToPath(url);
  const context={module,exports:module.exports,require:createRequire(import.meta.url),__filename:filename,__dirname:dirname(filename),process,console,Buffer,TextDecoder,TextEncoder,setTimeout,clearTimeout,performance};
  vm.runInNewContext(source,context,{filename});return module.exports({});
 })();
 return ready;
}
export async function cpuDracoLoader(){
 const draco=await decoderModule();
 return {preload(){return this;},decodeDracoFile(buffer,callback,attributeIDs,attributeTypes,_colorSpace,onError=()=>{}){
  const promise=Promise.resolve().then(()=>{
   const decoder=new draco.Decoder(),mesh=new draco.Mesh(),geometry=new BufferGeometry();
   try{
    const array=new Int8Array(buffer),type=decoder.GetEncodedGeometryType(array);
    if(type!==draco.TRIANGULAR_MESH)throw Error('CPU inventory accepts Draco triangular meshes only');
    const status=decoder.DecodeArrayToMesh(array,array.byteLength,mesh);
    if(!status.ok()||!mesh.ptr)throw Error('CPU Draco decode failed: '+status.error_msg());
    const types={Float32Array:[Float32Array,draco.DT_FLOAT32],Int8Array:[Int8Array,draco.DT_INT8],Int16Array:[Int16Array,draco.DT_INT16],Int32Array:[Int32Array,draco.DT_INT32],Uint8Array:[Uint8Array,draco.DT_UINT8],Uint16Array:[Uint16Array,draco.DT_UINT16],Uint32Array:[Uint32Array,draco.DT_UINT32]};
    for(const[name,id]of Object.entries(attributeIDs)){
     const [ArrayType,type]=types[attributeTypes[name]]??[];if(!ArrayType)throw Error('Unsupported Draco attribute type');
     const attribute=decoder.GetAttributeByUniqueId(mesh,id),size=attribute.num_components(),count=mesh.num_points()*size,bytes=count*ArrayType.BYTES_PER_ELEMENT,ptr=draco._malloc(bytes);
     try{if(!decoder.GetAttributeDataArrayForAllPoints(mesh,attribute,type,bytes,ptr))throw Error('Draco attribute extraction failed');geometry.setAttribute(name,new BufferAttribute(new ArrayType(draco.HEAPF32.buffer,ptr,count).slice(),size));}finally{draco._free(ptr);}
    }
    const count=mesh.num_faces()*3,bytes=count*4,ptr=draco._malloc(bytes);
    try{if(!decoder.GetTrianglesUInt32Array(mesh,bytes,ptr))throw Error('Draco index extraction failed');geometry.setIndex(new BufferAttribute(new Uint32Array(draco.HEAPF32.buffer,ptr,count).slice(),1));}finally{draco._free(ptr);}
    callback(geometry);return geometry;
   }catch(error){geometry.dispose();throw error;}finally{draco.destroy(mesh);draco.destroy(decoder);}
  });
  promise.catch(onError);return promise;
 }};
}
