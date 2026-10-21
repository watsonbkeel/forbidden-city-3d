import * as THREE from 'three';

const PROFILES = {
  arrow: {name:'箭亭',zone:'outer-east',profile:'arrow-enclosed-gallery-fit-v1',x:-154.7,z:78.8,w:31.5,d:17.6,colH:8,ph:.9,pad:1,roof:'xieshan',bays:5,source:'https://www.dpm.org.cn/explore/building/236578.html',photo:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg'},
  linxi: {name:'临溪亭',zone:'outer-west',profile:'linxi-enclosed-flat-ceiling-fit-v1',x:259.2,z:46.7,w:9,d:8.4,colH:4.8,ph:.5,pad:.3,roof:'pavilion',bays:3,source:'https://www.dpm.org.cn/explore/building/236537.html',photo:'https://img.dpm.org.cn/Uploads/Picture/2020/07/15/s5f0ebf845b521.jpg'},
};

export function enclosedPavilionGeometry(item) {
  const key=Object.keys(PROFILES).find(k=>PROFILES[k].profile===item.enclosureProfile),p=PROFILES[key];
  if(!p||item.kind!=='hall'||item.structure!=='enclosed-pavilion'||item.name!==p.name)throw Error('Enclosed pavilion exact identity/profile required');
  for(const k of ['x','z','w','d','colH','ph','pad','bays'])if(item[k]!==p[k])throw Error('Enclosed pavilion retained metric mismatch: '+k);
  if(item.roof!==p.roof||item.enter!==true||item.open!==false||(item.rot!==undefined&&item.rot!==0))throw Error('Enclosed pavilion incompatible shell');
  for(const k of ['layers','eaveCount','roofH','brackets','storeys','hardGableEnd','frontEnclosureInset','frontSteps','panelBuilder','ceilingBuilder','map','plaque','plaqueText','roomBays','backDoor','interior','throne'])if(item[k]!==undefined)throw Error('Enclosed pavilion unreviewed override: '+k);
  return {id:p.zone+'/'+key+'-enclosed',key,profile:p.profile,storeys:1,eaveCount:1,source:p.source,sources:[p.source,p.photo,...(key==='linxi'?['https://www.dpm.org.cn/building/talk/248115.html','https://www.dpm.org.cn/Uploads/File/2018/12/11/u5c0f33bc7102e.pdf']:['https://www.dpm.org.cn/pavilion/247424.html'])],photographyDate:null,currentInventoryVerified:false,siteAccessVerified:false,dimensionStatus:'RETAINED_ENVELOPE_AND_CLEARANCE_FIT_NOT_SURVEYED',roofStatus:'RETAINED_APPROXIMATE_ROOF_NOT_UPDATED',navigationStatus:'ONE_MODEL_VIEWING_REGION_NOT_HISTORICAL_ROOM_COUNT',doorPoseStatus:'CENTRAL_NS_OPEN_FOR_MODEL_ACCESS_NOT_VISITOR_PERMISSION',...(key==='arrow'?{mainFacadeBays:5,documentedDepthBays:3,depthGridStatus:'UNSURVEYED_MAIN_DEPTH_GRID_NOT_CERTIFIED_BY_OUTER_GALLERY_FIT',southDoorGroups:5,northDoorGroups:3,documentedColumnCount:20,columnPlacementStatus:'PHOTO_INFORMED_OUTER_GALLERY_FIT_NOT_VERIFIED_SIDE_REAR_PLAN',galleryInset:2,doorLeafCountStatus:'FOUR_PLAIN_LEAVES_PER_GROUP_FIT_NOT_SOURCE_COUNT',targetState:'ARCHITECTURE_WITH_CURRENT_WUBEI_GALLERY_INVENTORY_UNRECONSTRUCTED'}:{bayWeights:[1,2,1],bayRatioStatus:'WIDER_CENTRE_PHOTO_FIT_NOT_MEASURED',ceilingStatus:'FLAT_PLAIN_SURFACE_PAINTED_ILLUSION_NOT_REPRODUCED',barrierEvidence:'BOTH_EW_TEXT_SUPPORTED_EAST_APPEARANCE_PHOTOGRAPHED_WEST_DETAIL_FIT',stairStatus:'NS_STAIRS_PHOTO_SUPPORTED_DIMENSIONS_AND_COUNT_FIT',stairFit:{rise:.5,run:.8,width:3.2,steps:3},targetState:'PHOTOGRAPHED_ENCLOSURE_WITH_UNVERIFIED_MOVABLE_INVENTORY'}),limitations:['No current complete interior inventory or visitor access verified.','Existing roof, footprint, elevation and fitted door poses are not measured reconstruction.','No generic royal throne, altar, weapon exhibits or household furniture added.']};
}

export function buildEnclosedPavilion(kit,item) {
  const g=enclosedPavilionGeometry(item),p=PROFILES[g.key],key=g.key,y=p.ph,H=p.colH-.5,doorH=key==='arrow'?4.6:3.35,cs=kit.colliders.length;
  const {structure,enclosureProfile,...shell}=item;
  // Build the exact old open shell first, retaining its roof, platform, floor,
  // plaque and Arrow's original north/south stairs and support geometry.
  const built=kit.hall({...shell,bays:key==='arrow'?9:3,open:true,enter:key==='arrow'?false:undefined}),f=built.f;
  const removed=new Set();
  for(const m of [...f.children])if(m.isMesh&&['wood_column','caihua_beam'].includes(m.material?.name)){removed.add(m.geometry);m.removeFromParent();}
  for(const geo of removed)geo.dispose();
  kit.colliders.splice(cs,kit.colliders.length-cs,...kit.colliders.slice(cs).filter(c=>c.min.y<y-1e-7));
  const mats={};
  for(const [name,color]of Object.entries({red:0x933f32,wood:0x623d2d,green:0x54745b,yellow:0xb49a53,ceiling:0x81785f,dark:0x363b32})){
    mats[name]=new THREE.MeshStandardMaterial({name:key+'_'+name+'_fit',color,roughness:.82});kit.owned.push(mats[name]);
  }
  function box(role,mat,w,h,d,x,yy,z,solid=true){
    if(Math.min(w,h,d)<=1e-7)throw Error('Enclosed pavilion degenerate fitted box');
    const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name=role;m.userData={role,dimensionStatus:g.dimensionStatus};
    if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);return m;
  }
  const A=key==='arrow'?p.w/2-2:p.w/2,B=key==='arrow'?p.d/2-2:p.d/2;
  const mainAxes=key==='arrow'?Array.from({length:6},(_,i)=>-A+i*2*A/5):[-A,-A/2,A/2,A];
  const xAxes=key==='arrow'?[-p.w/2,...mainAxes,p.w/2]:mainAxes;
  const zAxes=key==='arrow'?[-p.d/2,-B,B,p.d/2]:[-B,-B/2,B/2,B];
  const columnPoints=xAxes.flatMap(x=>[[-p.d/2,x],[p.d/2,x]]).map(([z,x])=>[x,z]);
  for(const z of zAxes.slice(1,-1))for(const x of[-p.w/2,p.w/2])columnPoints.push([x,z]);
  const radius=key==='arrow'?.29:.17;
  for(const[x,z]of columnPoints){const m=kit.mesh(f,new THREE.CylinderGeometry(radius,radius*1.05,p.colH,12),mats.red,x,y+p.colH/2,z);m.name=key+'-column';m.userData.role=m.name;kit.col(f,x-radius,y,z-radius,x+radius,y+3,z+radius);}
  // Face-local u is X on north/south and Z on east/west. All collision boxes
  // use the same actual transformed dimensions as their rendered boxes.
  function faceBox(face,role,mat,u,offset,w,h,t,yy,solid=true){
    const side=face==='north'||face==='west'?1:-1,axial=face==='north'||face==='south';
    return axial?box(role,mat,w,h,t,u,yy,side*B+offset,solid):box(role,mat,t,h,w,side*A+offset,yy,u,solid);
  }
  function grid(face,u,w,zHeight,h){
    // Plain orthogonal grid cue. Exact carved/painted patterns are not copied.
    for(let i=1;i<5;i++)faceBox(face,key+'-plain-lattice','yellow',u-w/2+i*w/5,0,w*.018,h,.18,zHeight,false);
    for(let i=1;i<5;i++)faceBox(face,key+'-plain-lattice','yellow',u,0,w,h*.018,.18,zHeight-h/2+i*h/5,false);
  }
  function leaf(face,u,w,h,role,open){
    if(open){const depth=w,m=faceBox(face,role,'wood',u,face==='south'?depth/2+.02:-depth/2-.02,.09,h,depth,y+h/2);return m;}
    faceBox(face,role,'wood',u,0,w-.025,h,.14,y+h/2);grid(face,u,w-.09,y+h*.65,h*.6);
  }
  const faces=key==='arrow'?['south','north']:['south','north','east','west'];
  for(const face of faces){
    const axes=face==='east'||face==='west'?zAxes:mainAxes;
    for(let i=0;i<axes.length-1;i++){
      const lo=axes[i],hi=axes[i+1],w=hi-lo,u=(lo+hi)/2;
      const isDoor=key==='linxi'?i===1:face==='south'||[1,2,3].includes(i);
      faceBox(face,key+'-facade-head','red',u,0,w,H-doorH,.24,y+doorH+(H-doorH)/2);
      for(const edge of[lo,hi])faceBox(face,key+'-facade-post','red',edge,0,.15,doorH,.24,y+doorH/2);
      if(isDoor){
        const marker=new THREE.Group();marker.userData={role:key+'-door-group',face,bay:i,leafCountStatus:key==='arrow'?g.doorLeafCountStatus:'FOUR_LEAVES_TEXT_ATTESTED'};f.add(marker);
        const open=(face==='north'||face==='south')&&i===Math.floor((axes.length-1)/2),lw=(w-.36)/4;
        if(open)for(const sign of[-1,1])for(let k=0;k<2;k++)leaf(face,u+sign*(w/2-.25-k*.14),lw,doorH-.1,key+'-door-leaf',true,sign,k);
        else for(let k=0;k<4;k++)leaf(face,lo+.18+(k+.5)*lw,lw,doorH-.1,key+'-door-leaf',false);
      }else if(key==='linxi'){
        faceBox(face,'linxi-glazed-lower-panel','green',u,0,w,.9,.24,y+.45);
        faceBox(face,'linxi-plain-glazed-border','yellow',u,0,w-.12,.07,.27,y+.87,false);
        const lw=(w-.3)/2;for(let k=0;k<2;k++){const c=lo+.15+(k+.5)*lw;faceBox(face,'linxi-window-leaf','wood',c,0,lw-.025,doorH-.9,.14,y+.9+(doorH-.9)/2);grid(face,c,lw-.09,y+.9+(doorH-.9)/2,doorH-1.04);}
      }else faceBox(face,'arrow-rear-closed-wall','red',u,0,w,doorH,.25,y+doorH/2);
    }
  }
  if(key==='arrow')for(const s of[-1,1])box('arrow-side-wall','red',.3,H,2*B,s*A,y+H/2,0);
  else {
    for(const face of['east','west']){faceBox(face,'linxi-water-side-rail','red',0,face==='east'?-.24:.24,B,.12,.12,y+1.08);for(const u of[-B/2,0,B/2])faceBox(face,'linxi-water-side-rail-post','yellow',u,face==='east'?-.24:.24,.09,1.08,.09,y+.54);}
    for(const dir of[-1,1])kit.steps(f,{zEdge:dir*(p.d/2+p.pad),dir,y,width:3.2});
  }
  box(key==='linxi'?'linxi-flat-ceiling':'arrow-plain-ceiling','ceiling',2*A,.08,2*B,0,y+H,0,false);
  for(const s of[-1,1]){box(key+'-frame-beam','red',p.w+.5,.4,.35,0,y+p.colH-.2,s*p.d/2,false);box(key+'-frame-beam','red',.35,.4,p.d+.5,s*p.w/2,y+p.colH-.2,0,false);}
  kit._lastFurnish={cover:[],spawns:[{x:0,z:0}]};
  kit.registerRoom(f,{name:item.name,kind:key+'-viewing-region',x0:-A+.25,x1:A-.25,z0:-B,z1:B,y,h:H,doors:[{x:0,z:-B},{x:0,z:B}]});
  f.userData.structure=g;f.name=item.name+'·有围护布局局部拟合';return{...built,g};
}
