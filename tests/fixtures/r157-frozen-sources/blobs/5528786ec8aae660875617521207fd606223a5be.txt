import * as THREE from 'three';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefdd3c1950.jpg';
/** Four photo-supported front rail runs, strictly around the existing three
 * stair apertures. Only fitted plain shafts/rails/panels, not copied lion caps,
 * carved cloud patterns, or guessed returns on unobserved sides. */
export function applyWuyingGateSouthRails(kit,frame){
 const g=frame?.userData.structure;
 if(!g||g.id!=='south-gate:wuying'||g.profile!=='wuying'||g.name!=='武英门'||g.wuyingSouthRails||!near(g.x,220.8)||!near(g.z,-249.8)||!near(g.w,34.9)||!near(g.d,17.9)||!near(g.ph,.8)||!near(g.colH,6.6)||frame.parent!==kit?.root||!near(frame.position.x,g.x)||!near(frame.position.y,0)||!near(frame.position.z,g.z)||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(new THREE.Vector3(1,1,1)))return false;
 const bay=g.w/5,width=bay-1.3,edge=-(g.d+1.6)/2;
 const deck=kit.walkables.filter(w=>w.type==='box'&&['min','max'].every(k=>near(w.box[k].y,.8))&&near(w.box.min.x,g.x-(g.w+1.6)/2)&&near(w.box.max.x,g.x+(g.w+1.6)/2)&&near(w.box.min.z,g.z+edge)&&near(w.box.max.z,g.z-edge));if(deck.length!==1)return false;
 const apertures=[];
 for(const x of[-bay,0,bay]){const ramp=kit.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&near(w.minX,g.x+x-width/2)&&near(w.maxX,g.x+x+width/2)&&near(w.a0,g.z+edge)&&near(w.a1,g.z+edge-1.28)&&near(w.y0,.8)&&near(w.y1,0));if(ramp.length!==1)return false;apertures.push([x-width/2,x+width/2]);}
 const outer=(g.w+1.6)/2-.12,runs=[[-outer,apertures[0][0]],[apertures[0][1],apertures[1][0]],[apertures[1][1],apertures[2][0]],[apertures[2][1],outer]],meta={objectId:'FC-77E2C07341',source:SOURCE,status:'VERIFY_PENDING',accepted:false,scope:'FOUR_SOUTH_PLATFORM_RAIL_RUNS_ONLY',dimensionStatus:'EXISTING_STAIR_INTERFACES_RETAINED__PLAIN_MEMBERS_PHOTO_FIT_NOT_SURVEYED',apertures,runs,unknown:'Carved panels, shaped post heads, actual post count, exact metric bay/stair proportions and unobserved return rails are not reconstructed.',actualPostCountClaim:null,headSculptureModeled:false,sideReturnsModeled:false,colliders:[]};
 const mat=new THREE.MeshStandardMaterial({name:'wuying_gate_photo_pale_rail',color:0xcec7b9,roughness:.96,metalness:0});kit.owned.push(mat);
 const box=(role,w,h,d,x,y,z)=>{const m=kit.mesh(frame,new THREE.BoxGeometry(w,h,d),mat,x,y,z);m.name='wuying-gate-south-'+role;m.userData.wuyingGateSouthRail={role,objectId:meta.objectId,dimensionStatus:meta.dimensionStatus};const index=kit.colliders.length;kit.col(frame,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);const b=kit.colliders[index];meta.colliders.push({role,min:b.min.toArray(),max:b.max.toArray()});return m;};
 const z=edge+.18,t=.32;
 for(const[a,b]of runs){const n=Math.max(1,Math.ceil((b-a-t)/2.3)),centres=Array.from({length:n+1},(_,i)=>a+t/2+i*(b-a-t)/n);
  for(const x of centres)box('plain-post-shaft',t,1.06,t,x,g.ph+.53,z);
  box('lower-base',b-a,.12,.28,(a+b)/2,g.ph+.06,z);
  for(let i=1;i<centres.length;i++){const left=centres[i-1]+t/2,right=centres[i]-t/2;box('plain-unsculpted-panel',right-left,.57,.16,(left+right)/2,g.ph+.405,z);box('upper-rail',right-left,.19,.26,(left+right)/2,g.ph+.875,z);}
 }
 g.wuyingSouthRails=meta;return true;
}
