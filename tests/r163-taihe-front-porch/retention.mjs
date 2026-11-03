import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from '../lib/inner-palace-fixture.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const near=(a,b)=>Math.abs(a-b)<1e-6;
export function retainedHall(Builder,name){
 const builder=new Builder(new THREE.Scene(),library()),group=new THREE.Group(),data=PALACE_LAYOUT.find(h=>h.name===name);
 builder.buildHall(group,data,9.9375);group.updateMatrixWorld(true);
 const target=name==='太和殿',frontZ=-18.5,doorZ=-13.0646;
 const frontScreen=m=>{if(!target||m.parent!==group)return false;m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new THREE.Vector3()),p={width:size.x,height:size.y,depth:size.z},atScreen=near(m.position.z,frontZ)||near(m.position.z,doorZ);return m.material.name==='lattice_doors'&&m.position.z<0||atScreen&&((['wall_red','caihua_beam'].includes(m.material.name)&&p.width>=63)||(m.material.name==='wood_column'&&near(p.height,.25)&&near(p.depth,.3)));};
 const rows=[],columns=[],frontPanels=[];let excluded=0;
 group.traverse(m=>{if(!m.isMesh)return;const row={matrix:m.matrixWorld.toArray(),position:[...m.geometry.attributes.position.array],normal:[...(m.geometry.attributes.normal?.array??[])],uv:[...(m.geometry.attributes.uv?.array??[])],index:[...(m.geometry.index?.array??[])],material:{name:m.material.name,color:m.material.color?.getHex(),roughness:m.material.roughness,metalness:m.material.metalness,side:m.material.side,transparent:m.material.transparent},cast:m.castShadow,receive:m.receiveShadow};if(target&&m.parent===group&&m.material.name==='lattice_doors'&&m.position.z<0){const matrix=[...row.matrix];matrix[14]=Number((matrix[14]-(group.userData.taiheFrontPorch?.doorZ??frontZ)).toFixed(8));frontPanels.push(hash({...row,matrix}));}if(frontScreen(m)){excluded++;return;}rows.push(hash(row));if(m.geometry.type==='CylinderGeometry'&&m.material.name==='wood_column')columns.push(hash(row));});
 const frontSolids=c=>target&&c.max.x-c.min.x>15&&near(c.max.z-c.min.z,.5)&&(near((c.min.z+c.max.z)/2,frontZ)||near((c.min.z+c.max.z)/2,doorZ));
 const colliders=builder.colliders.filter(c=>!frontSolids(c)).map(c=>({min:c.min.toArray(),max:c.max.toArray()}));
 const result={meshes:rows.length,visible:hash(rows.sort()),redColumns:columns.length,columnGeometry:hash(columns.sort()),colliders:colliders.length,physics:hash(colliders),walkables:hash(builder.walkables),excludedFrontElements:excluded,frontDoorPanelCount:frontPanels.length,frontDoorPanels:hash(frontPanels.sort())};builder.dispose();return result;
}
