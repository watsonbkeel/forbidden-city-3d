import * as THREE from 'three';
import { CharacterResourcePool } from './CharacterResourcePool.js';
import { CHARACTER_DEFORM_GLSL } from './CharacterAnimation.js';

const CAPACITY = 96;
const bytesOf = geometry => Object.values(geometry.attributes).reduce((n,a)=>n+a.array.byteLength,geometry.index?.array.byteLength??0);
/** Actual InstancedMesh renderer. Template cache is shared; each live spatial
 * batch owns its instance stream and GPU-safe clone, reported separately. */
export class CharacterRenderer {
  constructor({ scene, pool = new CharacterResourcePool() }) {
    this.scene=scene; this.pool=pool; this.batches=new Map(); this.disposed=false;
    this.root=new THREE.Group();this.root.name='QingInterpretationCharacters';this.root.userData.nonInteractive=true;this.root.userData.characterLayer=true;scene.add(this.root);
    this.timeUniform={value:0};
    this.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.91,metalness:.02,transparent:false,depthWrite:true});
    this.material.name='qing-character-shared-opaque';
    this.material.onBeforeCompile=shader=>{
      shader.uniforms.characterTime=this.timeUniform;
      shader.vertexShader=shader.vertexShader
        .replace('#include <common>', `#include <common>\nuniform float characterTime;\nattribute vec4 characterAnim;\nattribute float characterVisibility;\nvarying float vCharacterVisibility;\n${CHARACTER_DEFORM_GLSL}`)
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvec3 characterPosition = position;\ncharacterDeform(characterPosition, objectNormal, characterTime, characterAnim);')
        .replace('#include <begin_vertex>', 'vec3 transformed = characterPosition; vCharacterVisibility = characterVisibility;');
      shader.fragmentShader=shader.fragmentShader?.replace('#include <common>', '#include <common>\nvarying float vCharacterVisibility;').replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nvec2 cp = mod(floor(gl_FragCoord.xy), 4.0);\nfloat ct = (mod(cp.x,2.0)*8.0 + mod(cp.y,2.0)*4.0 + floor(cp.x/2.0)*2.0 + floor(cp.y/2.0) + 0.5)/16.0;\nif(vCharacterVisibility <= ct) discard;');
    };
    this.material.customProgramCacheKey=()=> 'qing-character-r50-v2';
    this.matrix=new THREE.Matrix4();this.quaternion=new THREE.Quaternion();this.scale=new THREE.Vector3(1,1,1);this.position=new THREE.Vector3();
    this.last={visible:0,renderCopies:0,batches:0,trianglesEstimate:0};
  }
  _create(key, actor) {
    const resource=this.pool.acquire(actor.templateId,actor.pose,actor.lod,{seatVariant:actor.behavior?.seatVariant??'standard'});
    // Separate GPU BufferAttributes prevent disposing one zone from invalidating
    // another zone's buffers. The finite immutable authoring cache is shared.
    const geometry=resource.geometry.clone();
    geometry.setAttribute('characterAnim',new THREE.InstancedBufferAttribute(new Float32Array(CAPACITY*4),4).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('characterVisibility',new THREE.InstancedBufferAttribute(new Float32Array(CAPACITY).fill(1),1).setUsage(THREE.DynamicDrawUsage));
    const padding=resource.geometry.userData.boundsPaddingMeters??.16;
    geometry.computeBoundingBox();geometry.boundingBox.expandByScalar(padding);geometry.computeBoundingSphere();geometry.boundingSphere.radius+=padding;
    const mesh=new THREE.InstancedMesh(geometry,this.material,CAPACITY);
    mesh.name=`characters:${key}`;mesh.count=0;mesh.castShadow=false;mesh.receiveShadow=true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.raycast=()=>{};mesh.userData.nonInteractive=true;mesh.userData.characterBatch=true;
    this.root.add(mesh);
    const batch={mesh,resourceKey:resource.key,geometryBytes:bytesOf(geometry),triangles:(geometry.index?.count??geometry.attributes.position.count)/3};
    this.batches.set(key,batch);return batch;
  }
  _remove(key,batch){this.root.remove(batch.mesh);batch.mesh.geometry.dispose();batch.mesh.dispose();this.pool.release(batch.resourceKey);this.batches.delete(key);}
  render(actors, { simulationSeconds = 0 } = {}) {
    if(this.disposed)return this.last;
    this.timeUniform.value=simulationSeconds;
    const groups=new Map();
    for(const actor of actors){const key=[actor.templateId,actor.pose,actor.lod,actor.zoneRef,actor.behavior?.seatVariant??'standard'].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(actor);}
    for(const [key,batch]of this.batches)if(!groups.has(key))this._remove(key,batch);
    let trianglesEstimate=0,renderCopies=0;
    for(const [key,list]of groups){
      if(list.length>CAPACITY)throw new Error('Character instance capacity exceeded');
      const batch=this.batches.get(key)??this._create(key,list[0]),mesh=batch.mesh,anim=mesh.geometry.attributes.characterAnim;
      mesh.count=list.length;
      list.forEach((actor,index)=>{
        this.position.fromArray(actor.position);this.quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP,actor.rotationYRad);
        this.matrix.compose(this.position,this.quaternion,this.scale);mesh.setMatrixAt(index,this.matrix);
        mesh.geometry.attributes.characterVisibility.setX(index,actor.visibility??1);
        const a=actor.animation;anim.setXYZW(index,a.phase,a.amplitude,a.walkSpeed,a.poseIndex);
      });
      mesh.instanceMatrix.needsUpdate=true;anim.needsUpdate=true;mesh.geometry.attributes.characterVisibility.needsUpdate=true;
      mesh.computeBoundingBox();mesh.computeBoundingSphere();
      trianglesEstimate+=batch.triangles*list.length;renderCopies+=list.length;
    }
    this.last={visible:actors.length,renderCopies,batches:this.batches.size,trianglesEstimate};return {...this.last};
  }
  snapshot(){let batchGeometryBytes=0,instanceBytes=0;for(const b of this.batches.values()){batchGeometryBytes+=b.geometryBytes;instanceBytes+=b.mesh.instanceMatrix.array.byteLength;}
    return {batchGeometryBytes,instanceBytes,sharedResources:this.pool.stats(),textureGpuEstimateBytes:0,castShadow:false,
      performanceEvidence:'CPU submission estimates; full-frame WebGL A/B not measured',drawCallsEstimate:this.batches.size};}
  clear(){for(const [key,batch]of this.batches)this._remove(key,batch);this.last={visible:0,renderCopies:0,batches:0,trianglesEstimate:0};}
  dispose(){if(this.disposed)return;this.clear();this.scene.remove(this.root);this.material.dispose();this.pool.dispose();this.disposed=true;}
}
