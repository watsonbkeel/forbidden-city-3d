import * as THREE from 'three';
import source from '../../../data/characters/night-beds.json' with {type:'json'};
export const NIGHT_BEDS=Object.freeze(source.beds.map(b=>Object.freeze(b)));
export const SHARED_REST_AREAS=Object.freeze((source.sharedRestAreas??[]).map(a=>Object.freeze(a)));
export const BED_TOP=.60;
export const NIGHT_PARTITIONS=Object.freeze((source.partitions??[]).map(p=>Object.freeze(p)));
/** Beds are explicitly fictional gameplay fittings. Ordinary assigned beds remain
 * unchanged; the two shared-rest adults bind the existing northwest canopy
 * separately instead of adding another gameplay bed. */
export function buildNightBeds(kit,zone){
 const beds=NIGHT_BEDS.filter(b=>b.zoneRef===zone.id);if(!beds.length)return;
 const wood=new THREE.MeshStandardMaterial({name:'r72-gameplay-bed-wood',color:0x563b2a,roughness:.9});
 const quilt=new THREE.MeshStandardMaterial({name:'r72-gameplay-bed-quilt',color:0x567268,roughness:1});
 const pillow=new THREE.MeshStandardMaterial({name:'r72-gameplay-bed-pillow',color:0xc7b991,roughness:1});kit.owned.push(wood,quilt,pillow);
 for(const b of beds){
  const f=kit.frame(b.x,b.z);f.name=b.id;f.userData.gameplayBed={...b};
  const box=(material,w,h,d,x,y,z)=>{const g=new THREE.BoxGeometry(w,h,d),m=new THREE.Mesh(g,material);m.position.set(x,b.floorY+y,z);m.castShadow=false;m.receiveShadow=true;f.add(m);return m;};
  const w=b.width,d=b.depth;
  box(wood,w,.42,d,0,.29,0);box(quilt,w-.05,.10,d-.09,0,.55,0);
  box(wood,w+.05,.85,.08,0,.425,d/2-.005);box(pillow,w*.6,.10,.35,0,.65,d/2-.345);
  kit.col(f,-w/2,b.floorY,-d/2,w/2,b.floorY+BED_TOP,d/2);
  // Full footprint support lasts until the player's body clears the edge.
  kit.walkables.push({type:'box',rescue:false,box:new THREE.Box3(
   new THREE.Vector3(b.x-w/2-.5,b.floorY,b.z-d/2-.5),new THREE.Vector3(b.x+w/2+.5,b.floorY+BED_TOP,b.z+d/2+.5))});
 }
 for(const p of NIGHT_PARTITIONS.filter(p=>p.zoneRef===zone.id)){
  const f=kit.frame(0,0);f.name=p.id;f.userData.gameplayPrivacy={status:p.status,palace:p.palace};
  for(const panel of p.panels){const[a,b]=[panel.min,panel.max];const mesh=new THREE.Mesh(new THREE.BoxGeometry(b[0]-a[0],b[1]-a[1],b[2]-a[2]),wood);mesh.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);mesh.receiveShadow=true;f.add(mesh);kit.col(f,...a,...b);}
 }

}
export {resolveChuxiuSharedRest} from './SharedRestSlots.js';
