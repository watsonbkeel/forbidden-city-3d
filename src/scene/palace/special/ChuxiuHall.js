import * as THREE from 'three';

const SOURCE='https://www.dpm.org.cn/explore/building/236486.html';
const ARTICLE='https://www.dpm.org.cn/building/talk/223365.html';
const RESTORED_DISPLAY_SOURCE='https://www.dpm.org.cn/Uploads/File/2024/07/22/u669dcd8dc5647.pdf';
// Printed p265 quotes1982 descriptions of the display restored in1971. These
// plain volumes do not claim an unchanged2026 inventory or exact historic carving.
export const CHUXIU_RESTORED_KANG=Object.freeze([
 Object.freeze({id:'west-next-north',bay:'west-next',side:'north',x:5.42,z:4.9,w:4.1,d:2.4,h:.45}),
 Object.freeze({id:'west-next-south',bay:'west-next',side:'south',x:5.42,z:-3.7,w:4.1,d:1.8,h:.45}),
 Object.freeze({id:'west-end-south',bay:'west-end',side:'south',x:10.84,z:-3.7,w:3.8,d:1.8,h:.45}),
]);
/** All lengths below are reversible modelling fits, not survey measurements. */
export const CHUXIU_FIT=Object.freeze({
 id:'west-six/chuxiu-household',profile:'chuxiu-official-topology-fit-v1',
 porchDepth:1.9,passageZ:-.8,passageWidth:2.4,partitionHeight:4.5,
 frameThickness:.14,panelThickness:.09,lowerPanelHeight:.95,glassOpacity:.28,
 frontDoorWidth:3.2,windowSillHeight:.9,windowGlassHeight:1.55,latticeHeight:1.5,
 settingZ:3.6,screenWidth:4.25,screenHeight:2.7,screenDepth:.18,
 alcoveWidth:3.8,alcoveDepth:2.7,alcoveHeight:2.9,alcovePlatformHeight:.45,
 windScreenOffset:1.2,windScreenDepth:1.3,
});
const tag=(o,role,data={})=>{o.name=role;Object.assign(o.userData,{role,...data});return o;};
const near=(a,b)=>Math.abs(a-b)<1e-7;
function count(root){let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});return{meshes,triangles};}
export function chuxiuGeometry(item){
 if(item.name!=='储秀宫'||item.structure!=='chuxiu-household'||item.chuxiuProfile!==CHUXIU_FIT.profile)throw Error('Chuxiu single-building profile required');
 for(const[k,v]of Object.entries({x:94.8,z:434.3,w:27.1,d:13.8,ph:.6,colH:6.72,bays:5}))if(!near(item[k],v))throw Error(`Chuxiu retained envelope mismatch: ${k}`);
 if(item.roof!=='xieshan'||item.enter!==true||item.backDoor||item.open||item.roomBays)throw Error('Chuxiu requires retained five-bay shell and central entry');
 if(item.rot!==undefined&&item.rot!==0&&item.rot!=='south')throw Error('Chuxiu requires south-facing rotation');
 const b=item.w/5,front=-item.d/2+CHUXIU_FIT.porchDepth,rear=item.d/2;
 const identities=['grape-openwork','bamboo-glass','magnolia-glass','longevity-glass'];
 return{id:CHUXIU_FIT.id,profile:CHUXIU_FIT.profile,dimensionStatus:'official-topology-model-fit',sources:[SOURCE,ARTICLE],x:item.x,z:item.z,w:item.w,d:item.d,floorY:item.ph,bay:b,front,rear,
  passageZ:CHUXIU_FIT.passageZ,porch:{depth:CHUXIU_FIT.porchDepth,centerZ:-item.d/2+CHUXIU_FIT.porchDepth/2},
  partitions:identities.map((identity,i)=>({identity,x:-item.w/2+(i+1)*b,leafCount:i===1||i===2?8:null,opening:[CHUXIU_FIT.passageZ-CHUXIU_FIT.passageWidth/2,CHUXIU_FIT.passageZ+CHUXIU_FIT.passageWidth/2],solidProbeZ:front+.5})),
  warmAlcove:{x:2*b,z:rear-CHUXIU_FIT.alcoveDepth/2-.45},
  limitations:['Equal bay spacing, depths, aperture widths, leaf opening state and furniture geometry are model fits.','Five navigation zones are not a claim that the historic interior contained only five undivided rooms.','Courtyard return-porch connections outside this building are not reconstructed by this profile.']};
}

/** Reuse the existing shell exactly; replace only this shell's enclosure and room registration. */
export function buildChuxiuHall(kit,item){
 const g=chuxiuGeometry(item),p=CHUXIU_FIT,roomStart=kit.rooms.length,colStart=kit.colliders.length;
 const {structure,chuxiuProfile,...shell}=item;
 // Empty preset is deliberate: never construct the generic gold throne or household preset.
 const built=kit.hall({...shell,rot:0,throne:false,interior:'empty'}),f=built.f;
 if(kit.rooms.length!==roomStart+1)throw Error('Chuxiu expected exactly one disposable shell room');
 kit.rooms.splice(roomStart,1);
 const baseline=count(f),frontColumn=-item.d/2;
 const red=kit.lib.material('wall_red'),lattice=kit.lib.material('lattice_doors'),columnMat=kit.lib.material('wood_column');
 for(const m of [...f.children]){
  if(!m.isMesh)continue;
  const frontPanel=m.material===lattice||(m.material===red&&near(m.position.z,frontColumn))||(m.material===columnMat&&m.geometry.type==='BoxGeometry'&&near(m.position.z,frontColumn));
  const sideWall=m.material===red&&near(Math.abs(m.position.x),item.w/2);
  if(frontPanel||sideWall){f.remove(m);m.geometry.dispose();}
 }
 // Keep porch column colliders and every platform/stair proxy. Remove only the
 // old full-width front panels and full-depth side walls of this shell.
 const kept=kit.colliders.slice(colStart).filter(c=>{
  const width=c.max.x-c.min.x,depth=c.max.z-c.min.z;
  const front=near((c.min.z+c.max.z)/2,item.z+frontColumn)&&near(depth,.5)&&width>1;
  const side=near(width,.7)&&near(depth,item.d)&&near(Math.abs((c.min.x+c.max.x)/2-item.x),item.w/2);
  return!front&&!side;
 });
 kit.colliders.splice(colStart,kit.colliders.length-colStart,...kept);
 const mats={};
 function material(name,color,extra={}){const m=new THREE.MeshStandardMaterial({name,color,roughness:.68,metalness:0,...extra});kit.owned.push(m);return m;}
 mats.wood=material('chuxiu_huali_fit',0x583724);mats.dark=material('chuxiu_zitan_fit',0x30221e);
 mats.glass=material('chuxiu_glass_fit',0x9aafb3,{transparent:true,opacity:p.glassOpacity,roughness:.22,depthWrite:false,side:THREE.DoubleSide});
 mats.mirror=material('chuxiu_mirror_fit',0xa7aaa0,{roughness:.3,metalness:.5});
 mats.brick=material('chuxiu_window_sill_fit',0x585b59);mats.trim=material('chuxiu_trim_fit',0x9a7545);
 mats.cloth=material('chuxiu_plain_alcove_cloth_fit',0x9c8664,{roughness:.95});
 const box=(role,mat,w,h,d,x,y,z,data={})=>tag(kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat]??mat,x,y,z),role,data);
 const solid=(role,mat,w,h,d,x,y,z,data={})=>{const m=box(role,mat,w,h,d,x,y,z,data);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
 const y=item.ph,beamH=THREE.MathUtils.clamp(item.colH*.12,.45,.85),h=item.colH-beamH;
 for(const sign of[-1,1])solid('chuxiu-side-wall',red,.7,h,g.rear-g.front,sign*item.w/2,y+h/2,(g.front+g.rear)/2);
 // Source photos show a recessed enclosure: side windows have a brick sill,
 // glazed lower lights and rectilinear upper lattice, rather than tall doors.
 const openingHalf=p.frontDoorWidth/2;
 // The retained columns stand at the outer porch edge, not this recessed plane.
 // Close their former .68 m inter-bay allowances with explicitly fitted jambs.
 for(const part of g.partitions)solid('chuxiu-frontage-closure-jamb','wood',.68,p.partitionHeight,.18,part.x,y+p.partitionHeight/2,g.front,{status:'recessed enclosure closure; model fit'});
 for(let i=0;i<5;i++){
  const cx=-item.w/2+(i+.5)*g.bay,width=g.bay-.68;
  if(i===2){
   for(const sign of[-1,1]){const w=(width-p.frontDoorWidth)/2;
    solid('chuxiu-central-door-jamb','wood',w,p.partitionHeight,.14,sign*(openingHalf+w/2),y+p.partitionHeight/2,g.front);
    solid('chuxiu-open-door-leaf','wood',.13,p.partitionHeight,1.05,sign*(openingHalf+.08),y+p.partitionHeight/2,g.front+.52);
   }
   box('chuxiu-door-lintel','wood',width,.22,.18,0,y+p.partitionHeight+.11,g.front);
   continue;
  }
  solid('chuxiu-window-sill','brick',width,p.windowSillHeight,.32,cx,y+p.windowSillHeight/2,g.front);
  solid('chuxiu-window-collision','glass',width,p.windowGlassHeight,.08,cx,y+p.windowSillHeight+p.windowGlassHeight/2,g.front);
  // The duplicate role is metadata only, not an overlaid pane.
  f.children.at(-1).userData.role='chuxiu-window-glass';f.children.at(-1).name='chuxiu-window-glass';
  const base=y+p.windowSillHeight+p.windowGlassHeight,top=base+p.latticeHeight;
  for(const sign of[-1,1])box('chuxiu-window-frame',columnMat,.1,top-y,.15,cx+sign*width/2,(top+y)/2,g.front-.04);
  for(const yy of[y+p.windowSillHeight,base,top])box('chuxiu-window-frame',columnMat,width,.1,.15,cx,yy,g.front-.04);
  for(let k=0;k<4;k++){
   const cell=width/4,xx=cx-width/2+(k+.5)*cell;
   for(const s of[-1,1])box('chuxiu-window-lattice',columnMat,.055,p.latticeHeight-.16,.08,xx+s*(cell*.31),base+p.latticeHeight/2,g.front-.08);
   for(const t of[.22,.5,.78])box('chuxiu-window-lattice',columnMat,cell*.64,.055,.08,xx,base+p.latticeHeight*t,g.front-.08);
  }
  box('chuxiu-window-upper-panel',red,width,p.partitionHeight-(top-y),.14,cx,(top+y+p.partitionHeight)/2,g.front);
  kit.col(f,cx-width/2,y+p.windowSillHeight+p.windowGlassHeight,g.front-.18,cx+width/2,y+h,g.front+.18);
 }
 // Continuous top enclosure strip, behind the retained outer porch beam.
 box('chuxiu-enclosure-head',red,item.w,h-p.partitionHeight,.18,0,y+p.partitionHeight+(h-p.partitionHeight)/2,g.front);
 function ornament(identity,x,zc,width,base){
  const face=x-.095;
  if(identity==='bamboo-glass'){
   for(const dz of[-width*.2,width*.19]){box('chuxiu-bamboo-stem','trim',.06,.64,.035,face,base+.45,zc+dz);for(const yy of[.25,.45,.65])box('chuxiu-bamboo-node','trim',.08,.025,.06,face,base+yy,zc+dz);}
  }else if(identity==='magnolia-glass'){
   box('chuxiu-magnolia-branch','trim',.055,.6,.05,face,base+.43,zc);
   for(const dz of[-width*.17,width*.17])for(let k=0;k<5;k++){const a=k*Math.PI*2/5;tag(kit.mesh(f,new THREE.SphereGeometry(.045,5,4),mats.trim,face,base+.63+Math.sin(a)*.085,zc+dz+Math.cos(a)*.085),'chuxiu-magnolia-petal');}
  }else if(identity==='longevity-glass'){
   for(const dz of[-width*.18,width*.18]){box('chuxiu-longevity-frame','trim',.06,.6,.035,face,base+.45,zc+dz);for(const yy of[.2,.45,.7])box('chuxiu-longevity-frame','trim',.06,.035,width*.36,face,base+yy,zc);}
  }
 }
 for(const part of g.partitions){
  const [a,b]=part.opening,ph=p.partitionHeight;
  const group=new THREE.Group();group.name=`chuxiu-partition-${part.identity}`;Object.assign(group.userData,{role:'chuxiu-partition',identity:part.identity,x:part.x,leafCount:part.leafCount,source:SOURCE,openingFit:part.opening});f.add(group);
  const oldCount=f.children.length;
  for(const zz of[g.front,a,b,g.rear])box('chuxiu-partition-post','wood',p.frameThickness,ph,p.frameThickness,part.x,y+ph/2,zz);
  box('chuxiu-partition-head','wood',p.frameThickness,.24,g.rear-g.front,part.x,y+ph-.12,(g.front+g.rear)/2);
  for(const [lo,hi]of[[g.front,a],[b,g.rear]]){
   const length=hi-lo,zc=(lo+hi)/2;
   kit.col(f,part.x-.12,y,lo,part.x+.12,y+ph,hi);
   if(part.identity==='grape-openwork'){
    // Openwork is framed holes, never a filled opaque wall or invented moon gate.
    for(let k=0;k<4;k++){const zz=lo+(k+.5)*length/4;
     const stem=box('chuxiu-grape-vine','wood',.10,ph-.4,.10,part.x,y+ph/2,zz);stem.rotation.x=(k%2?1:-1)*.05;
     for(let j=0;j<3;j++)tag(kit.mesh(f,new THREE.SphereGeometry(.105,6,4),mats.wood,part.x,y+ph*.67-j*.13,zz+(j%2)*.12),'chuxiu-grape-cluster');
    }
    for(const yy of[y+.3,y+ph*.55,y+ph-.35])box('chuxiu-grape-trellis','wood',.10,.08,length,part.x,yy,zc);
   }else{
    const leaves=part.leafCount?4:2;
    for(let k=0;k<leaves;k++){
     const width=length/leaves,zz=lo+(k+.5)*width;
     box('chuxiu-partition-lower-panel','wood',p.panelThickness,p.lowerPanelHeight,width-.06,part.x,y+p.lowerPanelHeight/2,zz,{identity:part.identity});
     box('chuxiu-partition-glass','glass',.04,ph-p.lowerPanelHeight-.3,width-.13,part.x,y+p.lowerPanelHeight+(ph-p.lowerPanelHeight-.3)/2,zz,{identity:part.identity});
     box('chuxiu-partition-leaf-frame','wood',p.frameThickness,ph,.075,part.x,y+ph/2,lo+k*width);
     ornament(part.identity,part.x,zz,width,y);
    }
    box('chuxiu-partition-middle-rail','wood',p.frameThickness,.09,length,part.x,y+p.lowerPanelHeight,zc);
   }
  }
  // Parenting preserves the frame-local transforms; group itself is identity.
  for(const m of f.children.slice(oldCount))group.add(m);
 }
 // Low-profile winding screen leaves the chosen passage unobstructed at both ends.
 const windX=g.partitions[3].x+p.windScreenOffset,windZ=g.passageZ+2.1;
 solid('chuxiu-movable-wind-screen','wood',.12,2.4,p.windScreenDepth,windX,y+1.2,windZ);
 // Attested central throne/screen relationship, intentionally plain fitted forms.
 const sz=p.settingZ,sw=p.screenWidth/5;
 solid('chuxiu-central-dais','dark',4.5,.22,2.3,0,y+.11,sz-.45);
 for(let k=0;k<5;k++){
  const xx=(k-2)*sw,hh=p.screenHeight-(Math.abs(k-2)*.08);
  box('chuxiu-five-screen-panel','dark',sw-.025,hh,p.screenDepth,xx,y+.25+hh/2,sz+.6,{panel:k+1,materialIdentity:'zitan source; colour and shape fitted'});
  box('chuxiu-screen-mirror','mirror',sw-.18,hh-.3,.025,xx,y+.25+hh/2,sz+.6-p.screenDepth/2-.018);
 }
 kit.col(f,-p.screenWidth/2,y,sz+.45,p.screenWidth/2,y+p.screenHeight+.4,sz+.8);
 solid('chuxiu-throne-seat-fit','dark',1.45,.45,1.05,0,y+.65,sz-.65);
 solid('chuxiu-throne-back-fit','dark',1.45,1.1,.14,0,y+1.35,sz-.2);
 for(const sx of[-1,1])for(const zz of[-1,1])box('chuxiu-throne-leg-fit','dark',.15,.3,.15,sx*.59,y+.36,sz-.65+zz*.4);
 for(const s of[-1,1])box('chuxiu-throne-arm-fit','dark',.13,.23,.9,s*.7,y+1.1,sz-.6);
 // Native rendered inscription, horizontal and source-attested; no AI text.
 const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=1024;canvas.height=256;}const c=canvas?.getContext('2d');
 if(c){
 c.fillStyle='#24231d';c.fillRect(0,0,1024,256);c.strokeStyle='#927141';c.lineWidth=16;c.strokeRect(8,8,1008,240);c.fillStyle='#bca36c';c.font='bold 170px "STKaiti","KaiTi","Noto Serif CJK SC",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('大圆宝镜',512,132);}
 const tex=canvas?new THREE.CanvasTexture(canvas):null;if(tex)tex.colorSpace=THREE.SRGBColorSpace;
 const plaqueMat=material('chuxiu_attested_plaque',0xffffff,{map:tex,roughness:.8});plaqueMat.addEventListener('dispose',()=>tex?.dispose());
 const pg=new THREE.PlaneGeometry(3.55,.9);pg.rotateY(Math.PI);tag(kit.mesh(f,pg,plaqueMat,0,y+4.15,sz+.63),'chuxiu-attested-plaque',{text:'大圆宝镜',source:SOURCE});
 box('chuxiu-plaque-backing','dark',3.65,1,.1,0,y+4.15,sz+.7);
 const sc=typeof document==='undefined'?null:document.createElement('canvas');if(sc){sc.width=256;sc.height=512;}const sx=sc?.getContext('2d');if(sx){sx.clearRect(0,0,256,512);sx.fillStyle='#716342';sx.font='bold 164px "STKaiti","KaiTi","Noto Serif CJK SC",serif';sx.textAlign='center';sx.textBaseline='middle';sx.fillText('寿',128,256);}
 const st=sc?new THREE.CanvasTexture(sc):null;if(st)st.colorSpace=THREE.SRGBColorSpace;const sm=material('chuxiu_attested_shou',0xffffff,{map:st,transparent:true,roughness:.8});sm.addEventListener('dispose',()=>st?.dispose());
 for(let k=0;k<5;k++){const geo=new THREE.PlaneGeometry(sw-.2,p.screenHeight-.35);geo.rotateY(Math.PI);tag(kit.mesh(f,geo,sm,(k-2)*sw,y+.25+(p.screenHeight-Math.abs(k-2)*.08)/2,sz+.6-p.screenDepth/2-.035),'chuxiu-screen-shou-fit',{text:'寿',status:'native text; glyph and surface arrangement fitted'});}
 f.userData.inscriptions=['大圆宝镜','寿'];
 // The west rear bay's plain kang/canopy contour conveys a sleeping enclosure,
 // not an identified bed, cabinet, quilt or exact current museum display.
 const ac=g.warmAlcove,aw=p.alcoveWidth,ad=p.alcoveDepth,ah=p.alcoveHeight;
 solid('chuxiu-warm-alcove','dark',aw,p.alcovePlatformHeight,ad,ac.x,y+p.alcovePlatformHeight/2,ac.z,{identity:'west-rear warm compartment',status:'plain fitted kang/canopy contour'});
 for(const sx of[-1,1])for(const szn of[-1,1])box('chuxiu-alcove-post','wood',.13,ah,.13,ac.x+sx*aw/2,y+ah/2,ac.z+szn*ad/2);
 for(const s of[-1,1]){box('chuxiu-alcove-canopy','wood',aw,.22,.16,ac.x,y+ah,ac.z+s*ad/2);box('chuxiu-alcove-canopy','wood',.16,.22,ad,ac.x+s*aw/2,y+ah,ac.z);box('chuxiu-plain-side-curtain','cloth',.08,ah-.35,ad,ac.x+s*(aw/2-.1),y+.35+(ah-.35)/2,ac.z);}
 // Source names the north/south kang in the west next bay and south kang
 // in the west end bay. Keep the existing north sleeping contour, without
 // inventing its bed inventory or adding three generic bedroom ensembles.
 g.restoredDisplay={id:'chuxiu-west-kang-1982-text-fit-v1',source:RESTORED_DISPLAY_SOURCE,sourcePage:265,
  state:'1971_RESTORED_DISPLAY_DESCRIBED_IN_1982_NOT_2026_INVENTORY',currentInventoryVerified:false,
  dimensionStatus:'MODEL_FIT_NOT_MEASURED',placementEvidence:'TEXT_ATTESTED_CARDINAL_BAY_RELATIONSHIPS',
  geometryStatus:'PLAIN_KANG_VOLUMES_NOT_MATCHED_PHOTO_OR_CARVING',
  retainedNorthBed:'Existing west-end north plain canopy retained; exact bed inventory unverified.',
  components:CHUXIU_RESTORED_KANG.map(c=>({...c})),
  limitations:['The restored display is a stylistic reconstruction, not an intact Qing inventory.',
   'Figures11 and12 show east Chuxiu rooms and Tihe Hall; neither is a matched western-kang photograph.',
   'No dressing objects, bedding, kang tables or exact decorative patterns are added.']};
 for(const c of CHUXIU_RESTORED_KANG)solid('chuxiu-restored-kang','dark',c.w,c.h,c.d,c.x,y+c.h/2,c.z,
  {id:c.id,bay:c.bay,side:c.side,source:RESTORED_DISPLAY_SOURCE,sourcePage:265,
   state:g.restoredDisplay.state,dimensionStatus:g.restoredDisplay.dimensionStatus});
 const names=['东梢间','东次间','明间','西次间','西梢间暖阁'];
 for(let i=0;i<5;i++){
  const x0=-item.w/2+i*g.bay+.18,x1=-item.w/2+(i+1)*g.bay-.18,doors=[];
  if(i>0)doors.push({x:g.partitions[i-1].x,z:g.passageZ});if(i<4)doors.push({x:g.partitions[i].x,z:g.passageZ});if(i===2)doors.push({x:0,z:g.front});
  kit._lastFurnish={cover:[],spawns:[{x:(x0+x1)/2,z:g.passageZ}]};
  kit.registerRoom(f,{name:`储秀宫·${names[i]}`,kind:'chuxiu-navigation-zone',x0,x1,z0:g.front,z1:g.rear,y,h,doors});
 }
 const total=count(f);g.budget={baselineTriangles:baseline.triangles,totalTriangles:total.triangles,addedTriangles:total.triangles-baseline.triangles,addedMeshes:total.meshes-baseline.meshes};
 f.userData.structure={...g,storeys:1,eaveCount:1,fit:p,accessStatus:'model-circulation-not-site-permission'};
 f.name='储秀宫·官方拓扑拟合';
 return{...built,g};
}
