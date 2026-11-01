import * as THREE from 'three';
/** Real visible ground source for the isolated contact experiment only. It is
 * never an Environment/World witness and never an elevated replacement floor. */
export function buildWumenJointTestGround(material){
 if(!material?.isMaterial)throw TypeError('Wumen local test ground requires material');
 const geometry=new THREE.BoxGeometry(220,.25,80);geometry.translate(0,-.125,0);geometry.computeBoundingBox();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='wumen-joint/test-ground';
 const collider=geometry.boundingBox.clone(),walkable={type:'box',box:new THREE.Box3(new THREE.Vector3(-110,0,-40),new THREE.Vector3(110,0,40)),rescue:false};
 let disposed=false;
 return{mesh,collider,walkable,scope:'LOCAL_TEST_GROUND_NOT_ENVIRONMENT_WORLD_ACCEPTANCE',runtimeInstalled:false,dispose(){if(disposed)return;disposed=true;geometry.dispose();}};
}
