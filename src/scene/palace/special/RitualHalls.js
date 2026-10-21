import * as THREE from 'three';
const PAGE=n=>`https://www.dpm.org.cn/explore/building/${n}.html`;
const P={yinghua:{name:'英华殿',profile:'yinghua-five-bay-wudian-v1',x:276.6,z:489.9,w:32.7,d:18.2,pad:1,ph:.9,colH:7.36,roof:'wudian',source:PAGE(236568)},xianruo:{name:'咸若馆',profile:'xianruo-enclosed-baoxia-dated-cabinets-v1',x:258.6,z:107.8,w:26.7,d:20.6,pad:.8,ph:.6,colH:7.36,roof:'xieshan',source:PAGE(236534)}};
export function ritualHallGeometry(item){
 const key=Object.keys(P).find(k=>P[k].profile===item.ritualProfile),p=P[key];
 if(!p||item.kind!=='hall'||item.structure!=='ritual-hall'||item.name!==p.name)throw Error('Ritual hall exact identity/profile required');
 for(const k of['x','z','w','d','pad','ph','colH'])if(item[k]!==p[k])throw Error('Ritual hall retained metric mismatch: '+k);
 if(item.bays!==5||item.roof!==p.roof||item.enter!==true)throw Error('Ritual hall five-bay shell required');
 for(const k of['rot','layers','eaveCount','roofH','brackets','storeys','hardGableEnd','frontEnclosureInset','frontSteps','panelBuilder','ceilingBuilder','map','plaque','plaqueText','roomBays','backDoor','open','throne','interior'])if(item[k]!==undefined)throw Error('Ritual hall unreviewed override: '+k);
 return{id:'outer-west/'+key+'-ritual-hall',key,profile:p.profile,storeys:1,eaveCount:1,mainBays:5,source:p.source,sources:[p.source,...(key==='xianruo'?['https://www.dpm.org.cn/show/225718.html','https://img.dpm.org.cn/Uploads/Picture/2017/01/06/s586f3aa33ca11.jpg','https://img.dpm.org.cn/Uploads/Picture/2017/01/06/s586f3aeb1a9eb.jpg','https://www.dpm.org.cn/Uploads/File/pdf/13/8b/24/138b2441379f977dd61a1f30bdb1ea8f.pdf']:['https://img.dpm.org.cn/Uploads/Picture/dc/8416.jpg'])],photographyDate:null,currentInventoryVerified:false,siteAccessVerified:false,dimensionStatus:'RETAINED_OVERALL_ENVELOPE_WITH_FITTED_AXES_DEPTHS_AND_HEIGHTS',doorPoseStatus:'OPEN_FOR_MODEL_ACCESS_NOT_HISTORICAL_POSE_OR_VISITOR_PERMISSION',navigationStatus:'VIEWING_REGIONS_NOT_HISTORICAL_ROOM_COUNT',roofStatus:key==='yinghua'?'SOURCE_WUDIAN_TYPE_WITH_FITTED_SHARED_ROOF_GEOMETRY':'HIGHER_XIESHAN_AND_LOWER_ROUNDED_PROJECTION_CONCEALED_JOINT_FIT',furnitureStatus:key==='yinghua'?'SEVEN_SHRINES_TEXT_ATTESTED_LOCATIONS_UNRECONSTRUCTED':'DATED_OFFICIAL_REFERENCE_PLAIN_ENW_STEPPED_CONTOURS_CURRENT_INVENTORY_UNKNOWN',...(key==='xianruo'?{documentedDepthBays:3,frontAnnexBays:3,frontAnnexEnclosed:true,verandaInset:1.5,mainOuterBand:[-5.3,10.3],frontAnnexOuterBand:[-10.3,-5.3],mainEnclosure:{halfWidth:11.85,front:-3.8,rear:8.8},annexEnclosure:{halfWidth:6.51,front:-8.8},cabinetFit:{depth:1.6,height:3.6,levels:3,sideStart:-1.8,sideEnd:7,rearEnd:8.6},cabinetDateStatus:'2004_DISPLAY_PAGE_UNDATED_PHOTOS_2017_STORAGE_NOT_CAPTURE_DATE_NO_REMOVAL_EVIDENCE',roofJointStatus:'CONCEALED_OVERLAP_FIT_NOT_MEASURED_ROOF_PLAN'}:{}),limitations:['No statues, altar objects, weapons or generic office furniture reconstructed.','Dimensions, column axes, doors and access are model fits, not surveyed complete reconstruction.','Current complete furnishings and photography date are unknown.','Xianruo rounded projection is a simplified contour; exact juanpeng-xieshan hip ends and concealed joint are not reconstructed.']};
}
function curved(width,z0,z1,y,rise,offset=0,reverse=false){const pos=[],uv=[],idx=[];for(let i=0;i<=32;i++){const t=i/32;for(const x of[-width/2,width/2]){pos.push(x,y+rise*Math.sin(Math.PI*t)+offset,z0+(z1-z0)*t);uv.push((x+width/2)/1.2,t*6);}}for(let i=0;i<32;i++){const a=i*2;idx.push(...(reverse?[a,a+1,a+2,a+1,a+3,a+2]:[a,a+2,a+1,a+1,a+2,a+3]));}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
export function buildRitualHall(kit,item){
 const g=ritualHallGeometry(item),p=P[g.key],y=p.ph,H=p.colH-.85,key=g.key,cs=kit.colliders.length,rs=kit.rooms.length,gs=kit.regions.length;
 const {structure,ritualProfile,...shell}=item;
 // Exact original empty shell retains platform, floor, plaque, south stairs and supports.
 // Old furnishing is never instantiated; roof/enclosure/columns are explicitly replaced.
 const built=kit.hall({...shell,roof:'xieshan',bays:key==='yinghua'?9:7,interior:'empty'}),f=built.f,removed=new Set();
 for(const m of [...f.children])if(m.name.startsWith('roof_')||(m.isMesh&&['wood_column','caihua_beam','wall_red','lattice_doors'].some(key=>m.material===kit.lib.material(key)))){m.traverse(o=>{if(o.isMesh)removed.add(o.geometry);});m.removeFromParent();}
 for(const geo of removed)geo.dispose();kit.colliders.splice(cs,kit.colliders.length-cs,...kit.colliders.slice(cs).filter(c=>c.min.y<y-1e-7));kit.rooms.splice(rs);kit.regions.splice(gs);
 const mats={};for(const[name,color]of Object.entries({red:0x8a382c,wood:0x57382c,wall:0x9e4f3d,panel:0xbeb29a,ceiling:0x837965,gold:0x9d814b})){mats[name]=new THREE.MeshStandardMaterial({name:key+'_'+name+'_fit',color,roughness:.85});kit.owned.push(mats[name]);}
 function box(role,mat,w,h,d,x,yy,z,solid=true){if(Math.min(w,h,d)<=1e-7)throw Error('Ritual hall degenerate box');const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name=role;m.userData={role,dimensionStatus:g.dimensionStatus};if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);return m;}
 function col(x,z,h=p.colH){const r=.3,m=kit.mesh(f,new THREE.CylinderGeometry(r,r*1.05,h,12),mats.red,x,y+h/2,z);m.name=key+'-column';m.userData.role=m.name;kit.col(f,x-r,y,z-r,x+r,y+3,z+r);}
 function wallX(x,z0,z1){box(key+'-side-wall','wall',.26,H,z1-z0,x,y+H/2,(z0+z1)/2);}
 function wallZ(z,x0,x1){box(key+'-rear-wall','wall',x1-x0,H,.26,(x0+x1)/2,y+H/2,z);}
 const doorH=4.6;
 function front(x0,x1,z,door=false){const w=x1-x0,c=(x0+x1)/2;box(key+'-facade-head','red',w,H-doorH,.24,c,y+doorH+(H-doorH)/2,z);for(const x of[x0,x1])box(key+'-facade-post','red',.14,doorH,.24,x,y+doorH/2,z);const lw=(w-.4)/4;
  if(door){for(const s of[-1,1])for(let i=0;i<2;i++)box(key+'-front-door-leaf','wood',.1,doorH-.1,lw,c+s*(w/2-.26-i*.15),y+(doorH-.1)/2,z+lw/2+.04);}
  else{box(key+'-sill-wall','wall',w,.9,.28,c,y+.45,z);for(let i=0;i<4;i++){const x=x0+.2+(i+.5)*lw;box(key+'-window-leaf','panel',lw-.025,doorH-.9,.12,x,y+.9+(doorH-.9)/2,z);for(let j=1;j<4;j++)box(key+'-plain-window-grid','wood',.05,doorH-1,.17,x-lw/2+j*lw/4,y+.9+(doorH-.9)/2,z,false);for(let j=1;j<5;j++)box(key+'-plain-window-grid','wood',lw,.05,.17,x,y+.9+j*(doorH-.9)/5,z,false);}}
 }
 function ceiling(x0,x1,z0,z1,yy=y+H){box(key+'-plain-ceiling','ceiling',x1-x0,.08,z1-z0,(x0+x1)/2,yy,(z0+z1)/2,false);}
 if(key==='yinghua'){
  const A=p.w/2,B=p.d/2,bay=p.w/5;for(let i=0;i<=5;i++)for(const z of[-B,B])col(-A+i*bay,z);for(const x of[-A,A])for(const z of[-B/3,B/3])col(x,z);
  wallX(-A,-B,B);wallX(A,-B,B);wallZ(B,-A,A);for(let i=0;i<5;i++)front(-A+i*bay,-A+(i+1)*bay,-B,i===2);ceiling(-A,A,-B,B);
  for(const z of[-B,B])box('yinghua-frame-beam','red',p.w+.5,.5,.4,0,y+p.colH-.25,z,false);
  const roof=kit.roof(f,{type:'wudian',width:p.w+.5,depth:p.d+.5,baseY:y+p.colH,brackets:true});
  // The shared hip-roof parameterization repeats ridge-pole vertices. Remove
  // only zero-area indexed faces on this opt-in roof, not any shared builder.
  roof.traverse(m=>{if(!m.isMesh)return;const geo=m.geometry,a=geo.attributes.position;if(!geo.index)geo.setIndex(Array.from({length:a.count},(_,i)=>i));const index=geo.index,keep=[],v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3();for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];v0.fromBufferAttribute(a,ids[0]);v1.fromBufferAttribute(a,ids[1]).sub(v0);v2.fromBufferAttribute(a,ids[2]).sub(v0);if(v1.cross(v2).lengthSq()>1e-16)keep.push(...ids);}if(keep.length!==index.count){m.userData.removedDegenerateFaces=(index.count-keep.length)/3;geo.setIndex(keep);}});
  kit._lastFurnish={cover:[],spawns:[{x:0,z:0}]};kit.registerRoom(f,{name:p.name,kind:'yinghua-ritual-viewing-region',x0:-A+.4,x1:A-.4,z0:-B,z1:B-.4,y,h:H,doors:[{x:0,z:-B}]});
 }else{
  const A=11.85,AF=6.51,bay=p.w/5,outerA=p.w/2,annexOuter=bay*1.5;
  for(let i=0;i<=5;i++)for(const z of[-5.3,10.3])col(-outerA+i*bay,z);for(const x of[-outerA,outerA])for(const z of[-.1,5.1])col(x,z);
  for(let i=0;i<=3;i++)col(-annexOuter+i*bay,-10.3,5.8);
  wallX(-A,-3.8,8.8);wallX(A,-3.8,8.8);wallZ(8.8,-A,A);front(-A,-AF,-3.8);front(AF,A,-3.8);
  wallX(-AF,-8.8,-3.8);wallX(AF,-8.8,-3.8);for(let i=0;i<3;i++)front(-AF+i*2*AF/3,-AF+(i+1)*2*AF/3,-8.8,i===1);
  ceiling(-A,A,-3.2,8.8);ceiling(-A,-AF,-3.8,-3.2);ceiling(AF,A,-3.8,-3.2);ceiling(-AF,AF,-8.8,-3.2,y+5.2);
  kit.roof(f,{type:'xieshan',width:p.w+.5,depth:16.1,baseY:y+p.colH,brackets:true},0,2.5);
  const rw=annexOuter*2+.8,z0=-11,z1=-3.7,ey=6.4,rise=2.6;
  for(const[role,offset,reverse,material]of[['xianruo-rounded-roof-tiles',0,false,'roof_tile'],['xianruo-rounded-roof-underside',-.1,true,'rafters']]){const m=kit.mesh(f,curved(rw,z0,z1,ey,rise,offset,reverse),kit.lib.material(material),0,0,0);m.name=role;m.userData={role,jointStatus:g.roofJointStatus};}
  // Plain fitted bearing caps close the curved-roof/column gap. Their upper
  // faces follow the actual sampled underside, never a tall box through tiles.
  const roofY=z=>{const u=(z-z0)/(z1-z0)*32,i=Math.min(31,Math.max(0,Math.floor(u))),t=u-i;return ey-.1+rise*((1-t)*Math.sin(Math.PI*i/32)+t*Math.sin(Math.PI*(i+1)/32));};
  for(let k=0;k<=3;k++){
   const cx=-annexOuter+k*bay,za=-10.5,zb=-10.1,zs=[za,...Array.from({length:33},(_,i)=>z0+(z1-z0)*i/32).filter(z=>z>za&&z<zb),zb],pos=[];
   const tri=(a,b,c)=>pos.push(...a,...b,...c),quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);},xl=cx-.2,xr=cx+.2,bottom=6.4;
   for(let i=0;i<zs.length-1;i++){const a=zs[i],b=zs[i+1],ya=roofY(a),yb=roofY(b);quad([xl,ya,a],[xl,yb,b],[xr,yb,b],[xr,ya,a]);quad([xl,bottom,a],[xl,bottom,b],[xl,yb,b],[xl,ya,a]);quad([xr,bottom,b],[xr,bottom,a],[xr,ya,a],[xr,yb,b]);}
   quad([xl,bottom,zb],[xl,bottom,za],[xr,bottom,za],[xr,bottom,zb]);quad([xr,bottom,za],[xl,bottom,za],[xl,roofY(za),za],[xr,roofY(za),za]);quad([xl,bottom,zb],[xr,bottom,zb],[xr,roofY(zb),zb],[xl,roofY(zb),zb]);
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();const cap=kit.mesh(f,geo,mats.red,0,0,0);cap.name='xianruo-fitted-bearing-cap';cap.userData={role:cap.name,dimensionStatus:g.dimensionStatus,interpretation:'PLAIN_MODEL_SUPPORT_NOT_COPIED_HISTORICAL_BRACKET'};
  }
  for(const side of[-1,1])for(let i=0;i<32;i++){const t0=i/32,t1=(i+1)/32,za=z0+(z1-z0)*t0,zb=z0+(z1-z0)*t1,ya=ey+rise*Math.sin(Math.PI*t0)-.1,yb=ey+rise*Math.sin(Math.PI*t1)-.1,m=box('xianruo-rounded-bargeboard','red',.16,.3,Math.hypot(zb-za,yb-ya),side*rw/2,(ya+yb)/2-.15,(za+zb)/2,false);m.rotation.x=-Math.atan2(yb-ya,zb-za);}
  box('xianruo-annex-front-beam','red',annexOuter*2+.3,.4,.35,0,6.2,-10.3,false);
  const heights=[.8,1.2,1.6],depths=[1.6,1.05,.55];let base=y;
  for(let i=0;i<3;i++){const h=heights[i],d=depths[i];for(const s of[-1,1])box('xianruo-side-cabinet-level','wood',d,h,8.8,s*(11.65-d/2),base+h/2,2.6);box('xianruo-rear-cabinet-level','wood',23.3,h,d,0,base+h/2,8.6-d/2);base+=h;}
  // Side cabinets stop at z7 and rear begins there at its lowest step; no overlapping faces.
  kit._lastFurnish={cover:[],spawns:[{x:0,z:0}]};kit.registerRoom(f,{name:p.name,kind:'xianruo-main-viewing-region',x0:-9.8,x1:9.8,z0:-3.8,z1:6.5,y,h:H,doors:[{x:0,z:-3.8}]});
  kit._lastFurnish={cover:[],spawns:[{x:0,z:-6}]};kit.registerRoom(f,{name:p.name,kind:'xianruo-enclosed-baoxia-viewing-region',x0:-AF+.3,x1:AF-.3,z0:-8.8,z1:-3.8,y,h:5.2,doors:[{x:0,z:-8.8},{x:0,z:-3.8}]});
 }
 f.userData.structure=g;f.name=p.name+'·佛堂布局局部拟合';return{...built,g};
}
