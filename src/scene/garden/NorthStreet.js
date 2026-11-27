import * as THREE from 'three';
import {DIMENSIONS,LAYOUT} from '../../config/constants.js';

// Existing modeled fronts, not surveyed street dimensions. Keep these
// outside the courtyard owner: the street is north of its north gate.
const shunzhenZ=518.3, shunzhenHalfDepth=1.75;
const streetStart=shunzhenZ+shunzhenHalfDepth;
const streetEnd=LAYOUT.SHENWU_Z-DIMENSIONS.SHENWU.depth/2-.2; // visible slab edge
const halfWidth=DIMENSIONS.SHENWU.width/2;

export function northApproachLocation(x,z,bodyRadius){
  if(Math.abs(x)>halfWidth||z<509.17||z>streetEnd) return null;
  if(z-bodyRadius>streetStart) return '北横街';
  if(z>=shunzhenZ-shunzhenHalfDepth&&Math.abs(x-.5)<=10.3) return '顺贞门';
  return '御花园北口';
}

function pave(library,name,texture,rectangles,y){
  const tile=library.tileSize(texture),vertices=[],normals=[],uv=[];
  for(const [x0,x1,z0,z1] of rectangles){
    for(const [x,z] of [[x0,z0],[x0,z1],[x1,z1],[x0,z0],[x1,z1],[x1,z0]]){
      vertices.push(x,y,z);normals.push(0,1,0);uv.push(x/tile,-z/tile);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const mesh=new THREE.Mesh(geometry,library.material(texture));
  mesh.name=name;mesh.receiveShadow=true;
  return mesh;
}

export function buildNorthStreetPaving(library){
  // Only the central forecourt: consumes no neighboring building geometry.
  return pave(library,'north-street-paving','stone_slab',[
    [-halfWidth,halfWidth,streetStart,streetEnd],
  ],.016);
}

export function buildShunzhenApproachPaving(library){
  // The east turn hugs the clear corridor BESIDE Duixiu, not the
  // nominal x=-17 garden path that intersects the rock at standing height.
  // Rectangles meet at shared edges and stop within the open gate passages.
  return pave(library,'shunzhen-side-approach-paving','ground_brick',[
    [-16.2,-14.55,508.7,515.05],
    [-14.55,-10.3,513.95,515.05],
    [16.18,17.82,508.7,515.05],
    [10.3,16.18,513.95,515.05],
  ],.035);
}
