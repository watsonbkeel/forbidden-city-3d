import * as THREE from 'three';
const page=n=>`https://www.dpm.org.cn/explore/building/${n}.html`;
/** Existing shell/bay axes are retained fits, NOT the different column-head
 * measurement basis in the Changchun structural paper. +X west, +Z north. */
export const WEST_DOMESTIC_PROFILES=Object.freeze({
 'changchun-domestic':{name:'长春宫',x:150.2,z:379.6,source:page(236436),boundaries:[{bay:2,kind:'curtain-cover'},{bay:3,kind:'curtain-cover'}],targetState:'OFFICIAL_UNDATED_DISPLAY_PHOTO_AND_DOCUMENTED_HOUSEHOLD_TOPOLOGY'},
 'yikun-domestic':{name:'翊坤宫',x:94,z:382.5,source:page(236517),boundaries:[{bay:1,kind:'partition-door'},{bay:2,kind:'openwork-cover',motif:'喜鹊登梅'},{bay:3,kind:'openwork-cover',motif:'藤萝松缠枝'},{bay:4,kind:'partition-door'}],targetState:'OFFICIAL_DESCRIBED_ORIGINAL_SETTING_DISPLAY_NOT_CURRENT_INVENTORY'},
});
const tag=(o,role,info={})=>{o.name=role;Object.assign(o.userData,{role,...info});return o;};
export function westDomesticProfile(item){
 const p=WEST_DOMESTIC_PROFILES[item.domesticProfile];
 if(!p||item.name!==p.name||item.kind!=='hall')throw Error('West domestic identity mismatch');
 for(const [k,v] of Object.entries({x:p.x,z:p.z,w:27.1,d:13.8,ph:.6,colH:6.72,bays:5}))if(item[k]!==v)throw Error(`West domestic retained envelope mismatch: ${k}`);
 if(item.structure!=='west-domestic-hall'||item.roof!=='xieshan'||item.enter!==true||item.backDoor||item.rot!==undefined||item.roomBays)throw Error('West domestic requires its retained south-facing five-bay shell');
 return {...p,id:`west-six/${item.domesticProfile}`,profile:item.domesticProfile,dimensionStatus:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED',interiorStatus:'SOURCE_TOPOLOGY_WITH_FITTED_OPENINGS_NOT_COMPLETE_INVENTORY',passageZ:-1.2,passageWidth:2.8,doorPose:'FITTED_MODEL_VIEWING_ACCESS_NOT_HISTORICAL_OR_CURRENT_OPEN_STATE',ornamentPolicy:'MOTIF_IDENTIFIED_WHERE_ATTESTED__EXACT_CARVING_NOT_REPRODUCED',photographyDate:null};
}
export function buildWestDomesticHall(kit,item){
 const p=westDomesticProfile(item),start=kit.rooms.length,{structure,domesticProfile,...shell}=item;
 const ownSeat=p.profile==='changchun-domestic';
 const built=kit.hall({...shell,interior:'empty',throne:ownSeat?false:true}),f=built.f;
 if(kit.rooms.length!==start+1)throw Error('West domestic expected one disposable generic navigation room');
 kit.rooms.splice(start,1);
 const make=(name,color,extra={})=>{const m=new THREE.MeshStandardMaterial({name,color,roughness:.84,...extra});kit.owned.push(m);return m;};
 const wood=make(`${p.profile}_timber_fit`,ownSeat?0x342824:0x573a27),cloth=ownSeat?make(`${p.profile}_plain_cloth_fit`,0x435258):null,cushion=ownSeat?make('changchun_plain_cushion_fit',0xc7baa0):null,panel=ownSeat?make('changchun_unpainted_screen_fit',0xb4ad94):null;
 const y=item.ph,front=-item.d/2+.35,rear=item.d/2-.35,bay=item.w/5,H=4.25;
 const provenance={source:p.source,dimensionStatus:p.dimensionStatus,targetState:p.targetState,photographyDate:null,doorPose:p.doorPose};
 const box=(parent,role,mat,w,h,d,x,yy,z,solid=false,extra={})=>{
  const mesh=tag(kit.mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,yy,z),role,{...provenance,...extra});
  if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);
  return mesh;
 };
 // Boundary groups have identity transforms. Every collision below follows an
 // actual timber/panel solid, not a fictitious full wall across openwork.
 for(const boundary of p.boundaries){
  const x=-item.w/2+boundary.bay*bay,group=tag(new THREE.Group(),'west-domestic-boundary',{...provenance,kind:boundary.kind,motif:boundary.motif??null,x,carvingStatus:'EXACT_MOTIF_NOT_REPRODUCED'});f.add(group);
  const a=p.passageZ-p.passageWidth/2,b=p.passageZ+p.passageWidth/2;
  const curtain=boundary.kind==='curtain-cover';
  const openLo=curtain?front+.55:a,openHi=curtain?rear-.55:b;
  for(const z of [openLo,openHi])box(group,'west-domestic-frame-post',wood,.16,H,.16,x,y+H/2,z,true);
  box(group,'west-domestic-frame-head',wood,.18,.24,rear-front,x,y+H-.12,(front+rear)/2,false);
  if(curtain){
   // The official west-secondary photograph shows a high cloth valance,
   // not a drawn curtain closing the player's whole passage.
   box(group,'changchun-curtain-valance',cloth,.055,.48,openHi-openLo,x,y+H-.44,(openLo+openHi)/2,false,{photoSource:'https://img.dpm.org.cn/Uploads/Picture/dc/1456%5B1024%5D.jpg'});
  }else for(const [lo,hi] of [[front,openLo-.08],[openHi+.08,rear]]){
   const length=hi-lo;if(length<=0)continue;const z=(lo+hi)/2;
   const low=boundary.kind==='partition-door'?.95:.55;
   box(group,'west-domestic-lower-panel',wood,.10,low,length,x,y+low/2,z,true);
   // Plain rectilinear frame cues preserve the attested openwork/door class;
   // named botanical/bird motifs are deliberately not made up from their names.
   const top=H-.28;
   for(let k=0;k<4;k++)box(group,'west-domestic-openwork-stile',wood,.09,top-low*.15,.07,x,y+low*.15+(top-low*.15)/2,lo+(k+.5)*length/4,true);
   box(group,'west-domestic-openwork-rail',wood,.10,.07,length,x,y+2.3,z,false);
  }
 }
 if(ownSeat){
  const photo='https://img.dpm.org.cn/Uploads/Picture/dc/1454%5B1024%5D.jpg',info={...provenance,photoSource:photo,representation:'VISIBLE_FIVE_PANEL_DARK_WOOD_SEAT_RELATION__UNPAINTED_FITTED_FORMS'};
  box(f,'changchun-low-dais',wood,4.8,.12,2.8,0,y+.06,4.1,true,info);
  box(f,'changchun-low-seat',wood,1.7,.16,1.05,0,y+.65,3.85,true,info);
  for(const sx of [-1,1])for(const sz of [-1,1])box(f,'changchun-seat-leg',wood,.13,.48,.13,sx*.7,y+.36,3.85+sz*.4,true,info);
  box(f,'changchun-seat-back',wood,1.7,1.25,.14,0,y+1.2,4.3,true,info);
  box(f,'changchun-seat-cushion',cushion,1.45,.12,.85,0,y+.79,3.8,false,info);
  for(const side of [-1,1])box(f,'changchun-seat-arm',wood,.14,.22,.85,side*.79,y+1.03,3.85,false,info);
  box(f,'changchun-footstool',wood,1.1,.2,.45,0,y+.1,2.5,true,info);
  for(let k=0;k<5;k++){
   const hh=2.9-Math.abs(k-2)*.35,x=(k-2)*.85;
   box(f,'changchun-five-screen-panel',wood,.84,hh,.15,x,y+.12+hh/2,5.35,true,{...info,panel:k+1});
   box(f,'changchun-screen-unpainted-inset',panel,.68,hh-.3,.035,x,y+.12+hh/2,5.25,false,{...info,decoration:'PAINTED_BAMBOO_AND_BIRDS_NOT_REPRODUCED'});
  }
  for(const side of [-1,1]){
   const x=side*2*bay,z=4.6,w=3.7,d=2.7,h=3.1;
   box(f,'changchun-north-kang',wood,w,.5,d,x,y+.25,z,true);
   for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])box(f,'changchun-kang-cover-post',wood,.13,h,.13,x+dx,y+h/2,z+dz,true);
   for(const dz of [-d/2,d/2])box(f,'changchun-kang-cover-head',wood,w,.22,.16,x,y+h-.11,z+dz,false);
   for(const dx of [-w/2,w/2])box(f,'changchun-kang-cover-head',wood,.16,.22,d,x+dx,y+h-.11,z,false);
  }
 }
 const cuts=[-item.w/2,...p.boundaries.map(b=>-item.w/2+b.bay*bay),item.w/2];
 for(let i=0;i<cuts.length-1;i++){
  const x0=cuts[i]+.2,x1=cuts[i+1]-.2,doors=[];
  if(i>0)doors.push({x:cuts[i],z:p.passageZ});if(i<cuts.length-2)doors.push({x:cuts[i+1],z:p.passageZ});if(x0<0&&x1>0)doors.push({x:0,z:-item.d/2});
  kit._lastFurnish={cover:[],spawns:[{x:(x0+x1)/2,z:p.passageZ}]};
  kit.registerRoom(f,{name:`${item.name}·观览区${i+1}`,kind:'source-domestic-viewing-zone',x0,x1,z0:-item.d/2,z1:item.d/2,y,h:item.colH-.8,doors});
 }
 f.userData.structure={...f.userData.structure,...p,roomInterpretation:'NAVIGATION_ZONES_NOT_COMPLETE_HISTORICAL_ROOM_COUNT',retainedEnvelope:{w:item.w,d:item.d,bays:5},furnitureStatus:ownSeat?'SOURCE_PHOTO_FITTED_CENTRAL_SEAT_NOT_FULL_INVENTORY':'ATTESTED_SEAT_CLASS_WITH_GENERIC_FALLBACK_SHAPE'};
 return {...built,p};
}
