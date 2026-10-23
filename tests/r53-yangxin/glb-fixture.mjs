// Test-only: decode the checked-in GLB with the checked-in Draco JavaScript
// decoder. Every mesh, including COL_/WALK_ proxies, comes from actual bytes.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
let decoded;
export async function actualYangxinRoot() {
  if (!decoded) decoded = (async()=>{
    const root=new URL('../../',import.meta.url),b=readFileSync(new URL('public/models/interiors/yangxin.glb',root)),n=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+n)),binary=b.subarray(28+n);
    const factory=vm.runInNewContext(readFileSync(new URL('public/draco/draco_decoder.js',root),'utf8')+';DracoDecoderModule;',{console,setTimeout,clearTimeout,performance});
    const mod=await factory({}),rows=[];
    for(const node of g.nodes){
      if(node.mesh===undefined)continue;
      if(node.children?.length)throw Error('Decoder fixture must be updated for hierarchical GLB');
      const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...(node.translation??[0,0,0])),new THREE.Quaternion(...(node.rotation??[0,0,0,1])),new THREE.Vector3(...(node.scale??[1,1,1])));
      for(const p of g.meshes[node.mesh].primitives){
        const ext=p.extensions.KHR_draco_mesh_compression,v=g.bufferViews[ext.bufferView],bytes=binary.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength);
        const buffer=new mod.DecoderBuffer(),decoder=new mod.Decoder(),mesh=new mod.Mesh();buffer.Init(new Int8Array(bytes),bytes.length);
        const status=decoder.DecodeBufferToMesh(buffer,mesh);if(!status.ok())throw Error(status.error_msg());
        const attr=decoder.GetAttributeByUniqueId(mesh,ext.attributes.POSITION),values=new mod.DracoFloat32Array();decoder.GetAttributeFloatForAllPoints(mesh,attr,values);
        const positions=[],q=new THREE.Vector3();for(let i=0;i<mesh.num_points();i++){q.set(values.GetValue(i*3),values.GetValue(i*3+1),values.GetValue(i*3+2)).applyMatrix4(matrix);positions.push(...q);}
        const faces=new mod.DracoInt32Array(),indices=[];for(let i=0;i<mesh.num_faces();i++){decoder.GetFaceFromMesh(mesh,i,faces);for(let j=0;j<3;j++)indices.push(faces.GetValue(j));}
        rows.push({name:node.name,material:g.materials[p.material],positions,indices});
        for(const o of[faces,values,mesh,buffer,decoder])mod.destroy(o);
      }
    }
    return rows;
  })();
  const root=new THREE.Group();root.name='actual-decoded-yangxin';
  for(const r of await decoded){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(r.positions,3));geo.setIndex(r.indices);geo.computeVertexNormals();const color=r.material?.pbrMetallicRoughness?.baseColorFactor??[.6,.6,.6,1];const mat=new THREE.MeshStandardMaterial({name:r.material?.name??'source',color:new THREE.Color(...color.slice(0,3)),side:r.material?.doubleSided?THREE.DoubleSide:THREE.FrontSide});const m=new THREE.Mesh(geo,mat);m.name=r.name;root.add(m);}
  root.updateMatrixWorld(true);return root;
}
