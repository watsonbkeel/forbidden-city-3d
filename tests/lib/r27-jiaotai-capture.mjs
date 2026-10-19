import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from './inner-palace-fixture.mjs';
import {captureNameboardScene} from './r25-nameboard-capture.mjs';

/** The earlier complete capture binds every attribute byte and material value.
 * Also bind every node, ancestor/world transform, child order and metadata,
 * including both resident LOD levels even when one is invisible. */
export function captureJiaotaiScene(Builder){
  const result=captureNameboardScene(Builder);
  const scene=new THREE.Scene(),builder=new Builder(scene,library());
  try{
    builder.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);
    const graph=[],materials=[],textures=[];
    function visit(node,path,parent){
      const row={path,parent,name:node.name,type:node.type,matrix:node.matrix.toArray(),matrixWorld:node.matrixWorld.toArray(),
        position:node.position.toArray(),quaternion:node.quaternion.toArray(),scale:node.scale.toArray(),
        visible:node.visible,castShadow:node.castShadow,receiveShadow:node.receiveShadow,
        frustumCulled:node.frustumCulled,renderOrder:node.renderOrder,layers:node.layers.mask,
        matrixAutoUpdate:node.matrixAutoUpdate,matrixWorldAutoUpdate:node.matrixWorldAutoUpdate,
        userData:structuredClone(node.userData),children:node.children.map((_,i)=>path+'.'+i)};
      if(node.isLOD)row.levels=node.levels.map(level=>({object:path+'.'+node.children.indexOf(level.object),distance:level.distance,hysteresis:level.hysteresis}));
      if(node.isMesh){
        if(!materials.includes(node.material))materials.push(node.material);
        if(node.material.map&&!textures.includes(node.material.map))textures.push(node.material.map);
        row.material=node.material.name;
        row.textureImage=node.material.map?.image?{width:node.material.map.image.width,height:node.material.map.image.height}:null;
        row.triangles=(node.geometry.index?.count??node.geometry.attributes.position.count)/3;
      }
      graph.push(row);node.children.forEach((child,i)=>visit(child,path+'.'+i,path));
    }
    scene.children.forEach((node,i)=>visit(node,String(i),null));
    return{...result,graph,uniqueMaterials:materials.length,uniqueTextures:textures.length};
  }finally{builder.dispose();}
}
