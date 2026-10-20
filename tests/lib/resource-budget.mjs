/** CPU-side retained Three.js geometry inventory. Not GPU allocation or FPS.
 * Counts hidden LODs and cached roots explicitly. Shared buffers/resources count
 * once across all roots; triangles count every mesh/instance that references them.
 */
export function resourceBudget(roots) {
 const geometries=new Set(),materials=new Set(),textures=new Set(),buffers=new Set(),instanceBuffers=new Set(),visited=new Set();
 const result={meshes:0,visibleMeshes:0,triangles:0,visibleTriangles:0,geometries:0,geometryBytes:0,instanceBytes:0,materials:0,textures:0};
 const arrayOf=a=>a?.isInterleavedBufferAttribute?a.data.array:a?.array;
 function retain(a,set){const array=arrayOf(a);if(array)set.add(array.buffer);}
 function visit(o,parentVisible){
  if(visited.has(o))return;visited.add(o);const visible=parentVisible&&o.visible;
  if(o.isMesh){
   result.meshes++;if(visible)result.visibleMeshes++;
   const g=o.geometry,instances=o.isInstancedMesh?o.count:1,triangles=(g.index?.count??g.attributes.position?.count??0)/3*instances;
   result.triangles+=triangles;if(visible)result.visibleTriangles+=triangles;
   if(!geometries.has(g)){geometries.add(g);retain(g.index,buffers);Object.values(g.attributes).forEach(a=>retain(a,buffers));Object.values(g.morphAttributes).flat().forEach(a=>retain(a,buffers));}
   retain(o.instanceMatrix,instanceBuffers);retain(o.instanceColor,instanceBuffers);
   for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m)continue;materials.add(m);for(const value of Object.values(m)){if(value?.isTexture)textures.add(value);}}
  }
  for(const child of o.children??[])visit(child,visible);
 }
 for(const root of roots)if(root)visit(root,true);
 Object.assign(result,{geometries:geometries.size,geometryBytes:[...buffers].reduce((n,b)=>n+b.byteLength,0),instanceBytes:[...instanceBuffers].reduce((n,b)=>n+b.byteLength,0),materials:materials.size,textures:textures.size});
 return result;
}
