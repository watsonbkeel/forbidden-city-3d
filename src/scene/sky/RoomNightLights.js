import * as THREE from 'three';
import {CollisionManager} from '../../utils/Collision.js';
import {householdLightingPolicy} from './HouseholdLightingPolicy.js';
import {NIGHT_BEDS} from '../characters/NightBeds.js';
/** Fitted virtual-tour fixtures, not a historical lamp inventory. All room
 * fixtures use two instanced groups for independent sleeping-quarter dimming;
 * only four non-shadow local lights exist.
 * Registration is independent of optional S assets and their streaming state. */
export class RoomNightLights {
 constructor({scene,rooms=[],collisionManager=null,additionalColliders=[],beds=NIGHT_BEDS}){
  this.scene=scene;this.unplaced=[];const cm=new CollisionManager();if(collisionManager)cm.colliders=[...collisionManager.colliders];cm.addColliders(additionalColliders);
  this.sleepAreas=beds.filter(b=>b.actorId&&b.roomBounds).map(b=>({bounds:b.roomBounds,floorY:b.floorY}));
  this.isSleepPoint=(x,y,z)=>this.sleepAreas.some(a=>x>=a.bounds[0]&&x<=a.bounds[1]&&z>=a.bounds[2]&&z<=a.bounds[3]&&y>=a.floorY&&y<a.floorY+5);
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
  this.sleepLampMaterial=this.lampMaterial.clone();
  const createFixtures=(sites,material,name)=>{const mesh=new THREE.InstancedMesh(this.geometry,material,sites.length);mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=false;const m=new THREE.Matrix4();sites.forEach((s,i)=>mesh.setMatrixAt(i,m.makeTranslation(s.x,s.y,s.z)));mesh.instanceMatrix.needsUpdate=true;this.root.add(mesh);return mesh;};
  this.sites.forEach(s=>{s.sleepingQuarter=this.isSleepPoint(s.x,this.rooms[s.room].floorY,s.z);});
  this.fixtures=createFixtures(this.sites.filter(s=>!s.sleepingQuarter),this.lampMaterial,'virtual-working-room-lamps');
  this.sleepFixtures=createFixtures(this.sites.filter(s=>s.sleepingQuarter),this.sleepLampMaterial,'virtual-sleep-room-lamps');
  this.lights=Array.from({length:4},()=>{const l=new THREE.PointLight(0xffd8a0,0,18,2);l.castShadow=false;this.root.add(l);return l;});
 }
 update(daylight,position,quality='high',beijingTime=null){
  const policy=householdLightingPolicy(daylight,beijingTime),n=policy.gain;this.lampMaterial.emissiveIntensity=1.4*n;this.sleepLampMaterial.emissiveIntensity=policy.resting?0:1.4*n;this.fixtures.visible=this.sleepFixtures.visible=n>0;
  if(!position||!n){this.previous=null;this.lights.forEach(l=>{l.intensity=0;l.visible=false;});return;}
  const inSleepRoom=policy.resting&&this.isSleepPoint(position.x,position.y,position.z);
  if(this.previous&&this.previous.inSleepRoom===inSleepRoom&&this.previous.resting===policy.resting&&this.previous.quality===quality&&Math.abs(this.previous.n-n)<.005&&position.distanceToSquared(this.previous.position)<.25)return;
  this.previous={quality,n,inSleepRoom,resting:policy.resting,position:position.clone()};
  if(inSleepRoom){this.lights.forEach(l=>{l.intensity=0;l.visible=false;});return;}
  const contains=r=>position.x>=r.min.x&&position.x<=r.max.x&&position.z>=r.min.z&&position.z<=r.max.z&&position.y>=r.floorY&&position.y<r.max.y;
  const local=new Set(this.rooms.flatMap((r,i)=>contains(r)?[i]:[]));
  const score=s=>(local.has(s.room)?0:10000)+(s.x-position.x)**2+(s.z-position.z)**2+4*(s.y-position.y)**2;
  const selected=this.sites.filter(s=>!policy.resting||!s.sleepingQuarter).map(s=>({s,d:score(s)})).sort((a,b)=>a.d-b.d).slice(0,quality==='low'?2:4);
  this.lights.forEach((l,i)=>{const s=selected[i]?.s;if(!s||Math.hypot(s.x-position.x,s.z-position.z)>28){l.intensity=0;l.visible=false;return;}l.visible=true;l.position.set(s.x,s.y-.2,s.z);l.intensity=42*n;});
 }
 dispose(){this.scene.remove(this.root);this.fixtures.dispose();this.sleepFixtures.dispose();this.geometry.dispose();this.lampMaterial.dispose();this.sleepLampMaterial.dispose();this.lights.forEach(l=>l.dispose());}
}
