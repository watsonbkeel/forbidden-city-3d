import * as THREE from 'three';
import evidence from '../../../../data/architecture/wuying-2021-cases.json' with {type:'json'};
export const WUYING_OBSERVED_CASES=evidence;
const shapes={
 d111:{h:.54,color:0xc5bca1,p:[[0,0],[.19,0],[.23,.12],[.28,.37],[.23,.55],[.25,.61],[.2,.67],[.23,.7],[.15,.75],[.17,.82],[.08,.84],[.1,.94],[0,1]]},
 d112:{h:.74,color:0x899b7b,p:[[0,0],[.24,.02],[.26,.08],[.18,.12],[.24,.2],[.34,.4],[.29,.5],[.31,.54],[.22,.59],[.24,.63],[.16,.7],[.13,.91],[.18,.94],[.18,1],[.13,.98]]},
 d102:{h:.44,color:0xd8dfda,p:[[0,0],[.29,0],[.31,.08],[.36,.85],[.53,.94],[.54,1],[.5,.98],[.32,.83],[.3,.08]]},
 d103:{h:.68,color:0xd1d6c9,p:[[0,0],[.18,0],[.21,.1],[.25,.4],[.2,.6],[.11,.73],[.12,.9],[.17,1],[.13,.98]]},
 '58':{h:.48,color:0xc6d3d9,p:[[0,0],[.22,.02],[.28,.1],[.34,.42],[.3,.66],[.2,.78],[.21,.82],[.12,.92],[.06,.94],[.06,.99],[0,1]]},
 '59':{h:.59,color:0x244c6e,p:[[0,.2],[.2,.2],[.34,.3],[.39,.59],[.36,.72],[.4,.75],[.39,.83],[.34,.82],[.3,.4],[0,.3]],tripod:true,ears:true},
 '60':{h:.86,color:0xd6ccaa,p:[[0,0],[.19,0],[.23,.055],[.22,.11],[.17,.15],[.25,.26],[.3,.46],[.25,.63],[.15,.68],[.14,.8],[.18,.92],[.25,.97],[.25,1],[.22,.985],[.15,.91]],ears:true},
 '61':{h:.70,color:0xe0ded5,p:[[0,0],[.22,0],[.29,.08],[.37,.36],[.33,.62],[.22,.76],[.23,.82],[.17,.91],[.05,.94],[.05,.99],[0,1]]},
 '62':{h:.56,color:0xd6d0b3,p:[[0,0],[.27,.015],[.33,.12],[.39,.43],[.32,.67],[.22,.75],[.24,.8],[.16,.91],[.04,.94],[.04,.99],[0,1]]},
 d104:{h:.67,color:0x547b99,p:[[0,0],[.19,0],[.23,.08],[.3,.26],[.31,.45],[.24,.59],[.15,.65],[.15,.9],[.24,.96],[.24,1],[.2,.98]]},
 d105:{h:.29,color:0xcbbd88,p:[[0,0],[.19,0],[.26,.2],[.24,.5],[.11,.67],[.11,.87],[.19,.96],[.19,1],[.14,.98]]},
 d106:{h:.39,color:0xb9a25e,p:[[0,0],[.22,0],[.34,.18],[.4,.42],[.31,.63],[.16,.75],[.17,.89],[.3,.96],[.3,1],[.24,.98]]},
 d107:{h:.28,color:0xc5bb76,p:[[0,0],[.27,0],[.47,.2],[.51,.43],[.39,.62],[.17,.73],[.16,.89],[.26,.96],[.26,1],[.21,.98]]},
 d108:{h:.47,color:0xd4c7ba,p:[[0,0],[.2,0],[.31,.18],[.29,.37],[.15,.5],[.13,.57],[.21,.69],[.2,.79],[.09,.91],[.1,.98],[.08,1]]},
 d109:{h:.32,color:0xcbd0bc,p:[[0,0],[.2,0],[.34,.23],[.33,.51],[.19,.68],[.16,.84],[.29,.95],[.29,1],[.24,.98]]},
 d110:{h:.38,color:0xaa9f9d,p:[[0,0],[.14,0],[.15,.13],[.18,.24],[.19,.52],[.1,.7],[.09,.87],[.13,.96],[.13,1],[.09,.98]]},
};
export function buildWuyingObservedCases(kit,f,g,m){
 const records=evidence.cases.filter(c=>g.part==='rear'?c.part==='rear':g.part==='front'?c.part!=='rear':false),y=g.ph;
 const put=(parent,geo,mat,x=0,yy=0,z=0,role)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,yy,z);mesh.castShadow=mesh.receiveShadow=true;if(role)mesh.userData.role=role;parent.add(mesh);return mesh;};
 const box=(parent,mat,w,h,d,x,yy,z,role)=>put(parent,new THREE.BoxGeometry(w,h,d),mat,x,yy,z,role);
 for(const record of records){const key=record.scene.replace('scene_',''),s=shapes[key],big=key==='60',size=big?1.2:1,h=big?2.9:2.7,{x,z}=record.fitPosition;
  const group=new THREE.Group();group.position.set(x,y,z);group.name=`wuying-independent-${key}`;group.userData={role:'wuying-independent-case',scene:record.scene,zone:record.part==='rear'?'rear':record.part==='front'?'front-outside':'front-exhibit',source:record.photoFront,relativePosition:record.relativePosition,positionStatus:record.positionStatus,actualPeriod:'2021_OPENING_PANORAMA_NOT_2026_INVENTORY',caseMetricStatus:'2020_DESIGN_DIMENSIONS_NOT_AS_BUILT_MEASUREMENT'};f.add(group);
  box(group,m.frame,size,.075,size,0,.0375,0,'independent-case-low-frame');
  box(group,m.glass,size-.025,h-.19,size-.025,0,.075+(h-.19)/2,0,'independent-case-glass');
  box(group,m.frame,size,.13,size,0,h-.065,0,'independent-case-top-frame');
  box(group,m.light,size-.14,.015,size-.14,0,h-.14,0,'independent-case-top-light');
  // As photographed: a separate pale pedestal inside almost-to-floor glass,
  // with a sloping broad shoulder and a smaller flat upper plinth.
  box(group,m.plinth,size*.55,.73,size*.55,0,.075+.365,0,'independent-case-plinth');
  const shoulder=new THREE.CylinderGeometry(size*.43*Math.SQRT2,size*.34*Math.SQRT2,.16,4);shoulder.rotateY(Math.PI/4);put(group,shoulder,m.plinth,0,.885,0,'independent-case-bevel');
  box(group,m.plinth,size*.69,.055,size*.69,0,.993,0,'independent-case-upper-pad');
  const mat=new THREE.MeshStandardMaterial({name:`wuying_observed_form_${key}`,color:s.color,roughness:.35});kit.owned.push(mat);
  const form=put(group,new THREE.LatheGeometry(s.p.map(([r,hh])=>new THREE.Vector2(r*s.h,hh*s.h)),24),mat,0,1.025,0,'wuying-ceramic-form');Object.assign(form.userData,{scene:record.scene,source:record.photoFront,observedClass:s.tripod?'tripod-vessel':key==='d102'?'flared-cylinder':s.p.length>13?'handled-broad-bellied-vase':'photographed-vessel',observedDescription:record.visibleObjectDescription,objectIdentity:record.objectIdentity,representation:'INDIVIDUAL_PHOTO_SILHOUETTE_FIT__PAINTED_DECORATION_NOT_REPRODUCED',dimensionStatus:'VISUAL_FIT_NOT_MEASURED'});
  if(s.ears)for(const side of[-1,1]){const ear=put(group,new THREE.TorusGeometry(s.h*.095,s.h*.021,6,18,Math.PI*1.65),mat,side*s.h*(s.tripod?.42:.18),1.025+s.h*(s.tripod?.75:.75),0,'observed-vessel-ear');ear.rotation.z=side*Math.PI/5;}
  if(s.tripod)for(let i=0;i<3;i++){const a=i*Math.PI*2/3;put(group,new THREE.CylinderGeometry(s.h*.05,s.h*.075,s.h*.24,8),mat,Math.cos(a)*s.h*.22,1.025+s.h*.12,Math.sin(a)*s.h*.22,'observed-tripod-leg');}
  kit.col(f,x-size/2,y,z-size/2,x+size/2,y+h,z+size/2);
 }
 if(g.part==='front'){
  const group=new THREE.Group();group.name='wuying-exhibit-in-exhibit';group.userData={role:'wuying-exhibit-in-exhibit',source:evidence.sourceTour,designSource:g.exhibit.designSource,planSize:[6,6],sizeStatus:'2020_DESIGN_SIZE__2021_BUILT_TOPOLOGY',doorSides:['east','west']};f.add(group);
  const H=4.15,cz=-1;
  // Red timber-pattern exhibition enclosure, not a historical throne room.
  const panel=(axis,at,lo,hi)=>{const alongX=axis==='x',w=alongX?hi-lo:.14,d=alongX?.14:hi-lo,cx=alongX?(lo+hi)/2:at,zz=alongX?at:(lo+hi)/2;
   box(group,m.frame,w,H,d,cx,y+H/2,zz,'wuying-exhibit-partition');
   box(group,m.paper,alongX?w-.16:.02,H-1.25,alongX?.02:d-.16,cx,y+1+(H-1.25)/2,zz+(alongX?-.08:0),'wuying-exhibit-lattice-backing');
   const count=Math.max(2,Math.round((hi-lo)/.35));for(let i=1;i<count;i++){const atAlong=lo+(hi-lo)*i/count;box(group,m.frame,alongX?.055:.07,H-1.2,alongX?.07:.055,alongX?atAlong:cx-(at>0?.08:-.08),y+1+(H-1.2)/2,alongX?zz-.09:atAlong,'wuying-exhibit-lattice');}
   if(alongX)kit.col(f,lo,y,at-.09,hi,y+H,at+.09);else kit.col(f,at-.09,y,lo,at+.09,y+H,hi);
  };
  panel('x',cz-3,-3,3);panel('x',cz+3,-3,3);for(const x of[-3,3]){panel('z',x,cz-3,cz-1.1);panel('z',x,cz+1.1,cz+3);}
  // The bright squares in case photographs are the INDIVIDUAL case tops,
  // not evidence for a six-metre luminous ceiling over the enclosure.
  for(const side of[-1,1]){box(group,m.frame,6.2,.14,.14,0,y+H+.07,cz+side*3,'wuying-exhibit-upper-frame');box(group,m.frame,.14,.14,6.2,side*3,y+H+.07,cz,'wuying-exhibit-upper-frame');}
 }
 return records.map(c=>({scene:c.scene,part:c.part,relativePosition:c.relativePosition,position:{...c.fitPosition},source:c.photoFront,positionStatus:c.positionStatus}));
}
