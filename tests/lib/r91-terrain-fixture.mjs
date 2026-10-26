import*as THREE from'three';import{createTriangleTemplate,triangleInstance}from'../../src/utils/TriangleSupport.js';
let serial=0;
export function terrainBox(min,max){const a=new THREE.Vector3(...min),b=new THREE.Vector3(...max),size=b.clone().sub(a),center=a.clone().add(b).multiplyScalar(.5),g=new THREE.BoxGeometry(...size.toArray());g.translate(...center.toArray());const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],`test-terrain-${serial++}`),box=shape.box.clone();box.triangleSupport=shape;box.duixiuTerrain=true;g.dispose();return box;}
