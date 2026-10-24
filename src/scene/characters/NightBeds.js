import * as THREE from 'three';
import source from '../../../data/characters/night-beds.json' with {type:'json'};
export const NIGHT_BEDS=Object.freeze(source.beds.map(b=>Object.freeze(b)));
export const BED_TOP=.60;
/** Beds are explicitly fictional gameplay fittings. One assigned bed per adult
 * female actor, plus one empty bed in each otherwise unoccupied six-palace site. */
export function buildNightBeds(kit,zone){
 const beds=NIGHT_BEDS.filter(b=>b.zoneRef===zone.id);if(!beds.length)return;
 const wood=new THREE.MeshStandardMaterial({name:'r72-gameplay-bed-wood',color:0x563b2a,roughness:.9});
 const quilt=new THREE.MeshStandardMaterial({name:'r72-gameplay-bed-quilt',color:0x567268,roughness:1});
 const pillow=new THREE.MeshStandardMaterial({name:'r72-gameplay-bed-pillow',color:0xc7b991,roughness:1});kit.owned.push(wood,quilt,pillow);
 for(const b of beds){
  const f=kit.frame(b.x,b.z);f.name=b.id;f.userData.gameplayBed={...b};
  const box=(material,w,h,d,x,y,z)=>{const g=new THREE.BoxGeometry(w,h,d),m=new THREE.Mesh(g,material);m.position.set(x,b.floorY+y,z);m.castShadow=false;m.receiveShadow=true;f.add(m);return m;};
  box(wood,1.2,.42,2.25,0,.29,0);box(quilt,1.15,.10,2.16,0,.55,0);
  box(wood,1.25,.85,.08,0,.425,1.12);box(pillow,.72,.10,.35,0,.65,.78);
  kit.col(f,-.6,b.floorY,-1.125,.6,b.floorY+BED_TOP,1.125);
  // Full footprint support lasts until the player's body clears the edge.
  kit.walkables.push({type:'box',rescue:false,box:new THREE.Box3(
   new THREE.Vector3(b.x-1.1,b.floorY,b.z-1.625),new THREE.Vector3(b.x+1.1,b.floorY+BED_TOP,b.z+1.625))});
 }
}
