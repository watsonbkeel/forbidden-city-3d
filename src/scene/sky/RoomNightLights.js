import * as THREE from 'three';
import {CollisionManager} from '../../utils/Collision.js';
import {nightTourLighting} from './NightTourLighting.js';
/** Fitted virtual-tour fixtures, not a historical lamp inventory. All room
 * fixtures share one instanced mesh; only four non-shadow local lights exist.
 * Registration is independent of optional S assets and their streaming state. */
export class RoomNightLights {
 constructor({scene,rooms=[],collisionManager=null,additionalColliders=[]}){
  this.scene=scene;this.unplaced=[];const cm=new CollisionManager();if(collisionManager)cm.colliders=[...collisionManager.colliders];cm.addColliders(additionalColliders);
  this.rooms=rooms.filter(r=>r.min&&r.max&&Number.isFinite(r.floorY));this.sites=[];
  for(const [index,r]of this.rooms.entries()){
   const nx=Math.max(1,Math.ceil((r.max.x-r.min.x)/8)),nz=Math.max(1,Math.ceil((r.max.z-r.min.z)/8));
   for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
    const x=r.min.x+(ix+.5)*(r.max.x-r.min.x)/nx,z=r.min.z+(iz+.5)*(r.max.z-r.min.z)/nz;
    let site=null;
    // Low ceiling fits are verified against actual merged timber surfaces, not room-box height.
    const localCeilingCap=/文渊阁|倦勤斋|碧螺亭/.test(r.name??'')?2.1:3.2;
    for(let h=Math.min(localCeilingCap,r.max.y-r.floorY-.5);h>=1.9&&!site;h-=.25)for(const [dx,dz]of [[0,0],[.7,0],[-.7,0],[0,.7],[0,-.7],[.7,.7],[-.7,-.7]]){
      const px=x+dx,pz=z+dz,y=r.floorY+h;if(px<r.min.x+.2||px>r.max.x-.2||pz<r.min.z+.2||pz>r.max.z-.2)continue;
      const box=new THREE.Box3(new THREE.Vector3(px-.16,y-.16,pz-.16),new THREE.Vector3(px+.16,y+.16,pz+.16));
      if(cm.queryBox(box).some(c=>c.box.intersectsBox(box)))continue;
      site={room:index,x:px,y,z:pz};break;
    }
    if(site)this.sites.push(site);else this.unplaced.push({room:index,x,z,reason:'No clear fitted lamp volume'});
   }
  }
  this.root=new THREE.Group();this.root.name='r72-interpretive-room-lights';scene.add(this.root);
  this.geometry=new THREE.CylinderGeometry(.13,.13,.28,6);
  this.lampMaterial=new THREE.MeshStandardMaterial({color:0xd2b377,emissive:0xffcc88,emissiveIntensity:0,roughness:.9});
  this.fixtures=new THREE.InstancedMesh(this.geometry,this.lampMaterial,this.sites.length);
  this.fixtures.name='virtual-room-lamp-fit-not-historical-inventory';this.fixtures.castShadow=false;this.fixtures.receiveShadow=false;
  const m=new THREE.Matrix4();this.sites.forEach((s,i)=>this.fixtures.setMatrixAt(i,m.makeTranslation(s.x,s.y,s.z)));this.fixtures.instanceMatrix.needsUpdate=true;this.root.add(this.fixtures);
  this.lights=Array.from({length:4},()=>{const l=new THREE.PointLight(0xffd8a0,0,18,2);l.castShadow=false;this.root.add(l);return l;});
 }
 update(daylight,position,quality='high'){
  const n=nightTourLighting(daylight).night;this.lampMaterial.emissiveIntensity=1.4*n;this.fixtures.visible=n>0;
  if(!position||!n){this.previous=null;this.lights.forEach(l=>{l.intensity=0;l.visible=false;});return;}
  if(this.previous&&this.previous.quality===quality&&Math.abs(this.previous.n-n)<.005&&position.distanceToSquared(this.previous.position)<.25)return;
  this.previous={quality,n,position:position.clone()};
  const contains=r=>position.x>=r.min.x&&position.x<=r.max.x&&position.z>=r.min.z&&position.z<=r.max.z&&position.y>=r.floorY&&position.y<r.max.y;
  const local=new Set(this.rooms.flatMap((r,i)=>contains(r)?[i]:[]));
  const score=s=>(local.has(s.room)?0:10000)+(s.x-position.x)**2+(s.z-position.z)**2+4*(s.y-position.y)**2;
  const selected=this.sites.map(s=>({s,d:score(s)})).sort((a,b)=>a.d-b.d).slice(0,quality==='low'?2:4);
  this.lights.forEach((l,i)=>{const s=selected[i]?.s;if(!s||Math.hypot(s.x-position.x,s.z-position.z)>28){l.intensity=0;l.visible=false;return;}l.visible=true;l.position.set(s.x,s.y-.2,s.z);l.intensity=42*n;});
 }
 dispose(){this.scene.remove(this.root);this.fixtures.dispose();this.geometry.dispose();this.lampMaterial.dispose();this.lights.forEach(l=>l.dispose());}
}
