import * as THREE from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236516.html';
const PLAN='https://www.dpm.org.cn/Uploads/file/2025/02/13/1739432388igVFOKaLW260.pdf';
export const YIHE_FIT=Object.freeze({profile:'yihe-ground-plan-2025-fit-v1',front:-11.45,mainFront:-5.25,endFront:-7.75,mainRear:6.4,rear:11.45,vestibuleDoorZ:-4.15,vestibuleDoorWidth:1.6,northPassageWidth:1.55,neckWidth:2.4,firstNeckZ:-7.25,secondNeckZ:-9.2});
export function yiheGeometry(item){
 if(item.name!=='颐和轩'||item.structure!=='yihe-ground-hall'||item.yiheProfile!==YIHE_FIT.profile)throw Error('Yihe single-building profile required');
 for(const[k,v]of Object.entries({x:-293.7,z:470.8,w:34.1,d:22.9,pad:.8,ph:1,colH:6.72,bays:7}))if(!Number.isFinite(item[k])||Math.abs(item[k]-v)>1e-7)throw Error('Yihe retained envelope mismatch: '+k);
 for(const k of['layers','eaveCount','roofH','brackets','storeys','hardGableEnd','frontEnclosureInset','frontSteps','panelBuilder','ceilingBuilder','map','plaque','plaqueText','roomBays','backDoor','open','throne','interior','enter'])if(item[k]!==undefined)throw Error('Yihe forbids unreviewed shell override: '+k);
 if(item.roof!=='xieshan'||(item.rot!==undefined&&item.rot!==0&&item.rot!=='south'))throw Error('Yihe incompatible roof/orientation');
 return{id:'ningshou/yihe-ground-hall',profile:YIHE_FIT.profile,mainBays:7,frontAnnexBays:5,frontOpenBays:3,rearAnnexBays:3,storeys:1,eaveCount:1,dimensionStatus:'MODEL_FIT_NOT_MEASURED_PLAN',sources:[SOURCE,PLAN,'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff004189c37.jpg'],sourcePage:108,planPublication:'2025年第1期《紫禁城》张淑娴《尺幅窗 无心画》',planOrientation:'NORTH_UP_EAST_NEGATIVE_X',photographyDate:null,currentInventoryVerified:false,siteAccessVerified:false,roofStatus:'UNCHANGED_APPROXIMATE_OVERALL_ROOF_JUNCTIONS_UNRECONSTRUCTED',navigationStatus:'FITTED_VIEWING_REGIONS_NOT_EXHAUSTIVE_HISTORICAL_ROOM_COUNT',fit:YIHE_FIT,limitations:['Overall footprint, equal axes, depth allocation, heights and open door poses are model fits.','Western main subdivisions, rear connector beyond the retained envelope and exact roof junctions are not reconstructed.','Suian north window remains a window; entry is west-facing in its north vestibule. Exact embroidery, rockscape and furnishings are deferred.','Southern bed-niche contour is architectural interpretation, not a claim of occupied bedding or current inventory.']};
}
export function buildYiheHall(kit,item){
 const g=yiheGeometry(item),p=YIHE_FIT,bay=item.w/7,half=item.w/2,annex=bay*2.5,rear=bay*1.5,y=item.ph,H=item.colH-.82;
 const{structure,yiheProfile,...shell}=item,cs=kit.colliders.length,rs=kit.rooms.length,gs=kit.regions.length;
 // The old nine-bay shell is used ONLY to preserve its roof/platform/front stair.
 // All generic columns, enclosure, beams, room registration and furniture are removed.
 const built=kit.hall({...shell,bays:9,rot:0,interior:'empty'}),f=built.f;
 const removeMats=new Set(['wood_column','wall_red','lattice_doors','caihua_beam']),geos=new Set();
 for(const m of [...f.children])if(m.isMesh&&removeMats.has(m.material?.name)){geos.add(m.geometry);m.removeFromParent();}
 for(const geo of geos)geo.dispose();
 kit.colliders.splice(cs,kit.colliders.length-cs,...kit.colliders.slice(cs).filter(c=>c.min.y<y-1e-7));
 kit.rooms.splice(rs);kit.regions.splice(gs);
 const mats={};for(const[n,c]of Object.entries({plaster:0xbda77d,wood:0x663b27,red:0x84352b,ceiling:0xa99b7f})){mats[n]=new THREE.MeshStandardMaterial({name:'yihe_'+n+'_fit',color:c,roughness:.8});kit.owned.push(mats[n]);}
 function box(role,mat,w,h,d,x,yy,z,solid=true){const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name=role;m.userData={role,dimensionStatus:g.dimensionStatus};if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);return m;}
 const wallX=(x,z0,z1,role='yihe-enclosure')=>box(role,role==='yihe-enclosure'?'red':'plaster',.24,H,z1-z0,x,y+H/2,(z0+z1)/2);
 const wallZ=(z,x0,x1,role='yihe-enclosure')=>box(role,role==='yihe-enclosure'?'red':'plaster',x1-x0,H,.24,(x0+x1)/2,y+H/2,z);
 function openingZ(z,x0,x1,cx,width,role){wallZ(z,x0,cx-width/2,role);wallZ(z,cx+width/2,x1,role);box(role+'-lintel','wood',width,.18,.25,cx,y+3.2,z);}
 function column(x,z,role){const r=.25,m=kit.mesh(f,new THREE.CylinderGeometry(r,r*1.05,item.colH,12),mats.red,x,y+item.colH/2,z);m.name=role;m.userData={role};kit.col(f,x-r,y,z-r,x+r,y+3,z+r);}
 for(let i=0;i<=7;i++){const x=-half+i*bay;column(x,i<=1||i>=6?p.endFront:p.mainFront,'yihe-main-front-column');column(x,p.mainRear,'yihe-main-rear-column');}
 for(let i=0;i<=5;i++)column(-annex+i*bay,p.front,'yihe-front-annex-column');
 // Actual stepped enclosure, not the separate platform silhouette in the plan.
 for(const s of[-1,1]){wallX(s*half,p.endFront,p.mainRear);wallX(s*annex,p.front,p.mainFront);wallX(s*rear,p.mainRear,p.rear);wallZ(p.endFront,s<0?-half:annex,s<0?-annex:half);wallZ(p.mainRear,s<0?-half:rear,s<0?-rear:half);wallZ(p.front,s<0?-annex:rear,s<0?-rear:annex);}
 // Rear passage beyond this envelope is unknown; a closed fitted door pose avoids
 // advertising an absent connection. Main-to-rear projection stays genuinely open.
 openingZ(p.rear,-rear,rear,0,2.8,'yihe-rear-enclosure');box('yihe-rear-door-closed-fit','wood',2.8,3.2,.14,0,y+1.6,p.rear);
 // Three open front annex bays. Recessed main facade has a central doorway.
 openingZ(p.mainFront,-rear,rear,0,3.2,'yihe-main-front');
 wallX(rear,p.front,p.mainFront);wallZ(p.mainFront,rear,annex);
 // Photo-backed closed window/panel surfaces on the two annex ends and the
 // recessed side bays. Plain fitted grids, not an exact carved pattern or glazing claim.
 for(const [z,cx] of [[p.front,-2*bay],[p.front,2*bay],[p.mainFront,-bay],[p.mainFront,bay]]){
  for(const side of[-1,1]){
   const zz=z+side*.135,w=bay-.65;
   box('yihe-facade-panel','wood',w,2.5,.025,cx,y+2.25,zz,false);
   for(let i=0;i<=5;i++)box('yihe-facade-grid','red',.045,2.5,.04,cx-w/2+i*w/5,y+2.25,zz+side*.03,false);
   for(let i=0;i<=4;i++)box('yihe-facade-grid','red',w,.045,.04,cx,y+1+i*.625,zz+side*.03,false);
  }
 }
 // East-side partition continues north. WEST-facing entrance, not north-window door.
 const dx=-rear,dz=p.vestibuleDoorZ,dw=p.vestibuleDoorWidth;
 wallX(dx,p.front,dz-dw/2,'yihe-east-wing-partition');wallX(dx,dz+dw/2,p.mainRear,'yihe-east-wing-partition');box('yihe-suian-west-entry-lintel','wood',.25,.18,dw,dx,y+3.2,dz);
 const passX=dx-p.northPassageWidth;
 wallZ(p.mainFront,-annex,passX,'yihe-suian-north-window');
 const windowX=(-annex+passX)/2;
 for(const side of[-1,1]){const z=p.mainFront+side*.15;box('yihe-suian-window-panel','plaster',1.7,1.7,.035,windowX,y+2.1,z,false);for(const sign of[-1,1]){box('yihe-suian-window-frame','wood',.1,1.9,.08,windowX+sign*.9,y+2.1,z+side*.03,false);box('yihe-suian-window-frame','wood',1.9,.1,.08,windowX,y+2.1+sign*.9,z+side*.03,false);}}
 // Paired short frame returns form communicating necks, never full cross-walls.
 const center=-2*bay;
 for(const z of[p.firstNeckZ,p.secondNeckZ])for(const s of[-1,1]){const x0=s<0?-annex:center+p.neckWidth/2,x1=s<0?center-p.neckWidth/2:dx;box('yihe-suian-neck','wood',x1-x0,3.1,.14,(x0+x1)/2,y+1.55,z);}
 box('yihe-bed-niche-contour','wood',bay-.38,.12,p.secondNeckZ-p.front-.3,center,y+.06,(p.secondNeckZ+p.front)/2,false);
 // Plain high ceiling panels show only footprint bands; no copied imperial motifs.
 function ceiling(x0,x1,z0,z1){box('yihe-plain-ceiling','ceiling',x1-x0,.08,z1-z0,(x0+x1)/2,y+H,(z0+z1)/2,false);}
 ceiling(-half,half,p.mainFront,p.mainRear);ceiling(-annex,annex,p.front,p.mainFront);ceiling(-rear,rear,p.mainRear,p.rear);for(const s of[-1,1])ceiling(s<0?-half:annex,s<0?-annex:half,p.endFront,p.mainFront);
 // Fitted beams follow the new rows; the retained roof above is explicitly partial.
 for(const[z,w]of[[p.mainFront,item.w],[p.mainRear,item.w],[p.front,annex*2],[p.rear,rear*2]])box('yihe-frame-beam','wood',w,.35,.28,0,y+item.colH-.2,z,false);
 const regions=[{kind:'yihe-main-viewing-zone',x0:-rear+.3,x1:half-.4,z0:p.mainFront+.3,z1:p.mainRear-.3,doors:[{x:0,z:p.mainFront},{x:dx,z:dz}],spawn:{x:0,z:0}},{kind:'yihe-east-wing-viewing-zone',x0:-half+.4,x1:dx-.3,z0:p.mainFront+.2,z1:p.mainRear-.3,doors:[{x:dx,z:dz},{x:dx-.78,z:p.mainFront}],spawn:{x:-10,z:0}},{kind:'yihe-suian-viewing-zone',x0:-annex+.3,x1:dx-.3,z0:p.front+.3,z1:p.mainFront,doors:[{x:dx-.78,z:p.mainFront}],spawn:{x:center,z:-6.1}}];
 for(const r of regions){kit._lastFurnish={cover:[],spawns:[r.spawn]};kit.registerRoom(f,{...r,name:item.name,y,h:H});}
 f.userData.structure=g;f.name='颐和轩·地面布局局部拟合';return{...built,g};
}
