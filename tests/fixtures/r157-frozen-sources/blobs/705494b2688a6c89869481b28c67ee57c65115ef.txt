import * as THREE from 'three';
// Own official description + sole exterior photograph. This fitted small court
// is not a surveyed rock garden or a reconstruction of the unseen east stair.
export function buildForiForecourt(c){
 const{p,box}=c,half=p.localW/2+.18,gateZ=-p.localD/2-3,rearZ=-p.localD/2+.12,height=3.5,radius=1.8,cy=1.4,depth=.36;
 const mats={};for(const[n,color]of Object.entries({mortar:0x777163,rim:0xa3a193,rubble0:0x868477,rubble1:0x55594f,rubble2:0xaaa18b,rubble3:0x737468})){mats[n]=new THREE.MeshStandardMaterial({name:'fori_court_'+n+'_fit',color,roughness:.95});c.kit.owned.push(mats[n]);}
 function mesh(role,shape,thickness,mat,x,y,z){const geo=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,curveSegments:1});return c.tag(c.kit.mesh(c.f,geo,mats[mat],x,y,z),'fori-court-'+role,{source:p.source,dimensionStatus:'MODEL_FIT_NOT_SURVEY'});}
 function arc(shape,r,reverse=false){const end=-Math.asin(cy/r),start=Math.PI-end,n=64;for(let i=1;i<=n;i++){const t=reverse?end+(start-end)*i/n:start+(end-start)*i/n;shape.lineTo(i===n?(reverse?-1:1)*Math.sqrt(r*r-cy*cy):r*Math.cos(t),i===n?0:cy+r*Math.sin(t));}}
 const foot=Math.sqrt(radius*radius-cy*cy),shape=new THREE.Shape();shape.moveTo(-half,0);shape.lineTo(-foot,0);arc(shape,radius);shape.lineTo(half,0);shape.lineTo(half,height);shape.lineTo(-half,height);shape.closePath();mesh('front-wall',shape,depth,'mortar',0,0,gateZ-depth/2);
 const band=new THREE.Shape(),outer=radius+.18;band.moveTo(-Math.sqrt(outer*outer-cy*cy),0);arc(band,outer);band.lineTo(foot,0);arc(band,radius,true);band.closePath();mesh('moon-ring',band,.075,'rim',0,0,gateZ-.245);
 // Slice only the real solid side of the circle. Using the maximum aperture
 // radius in each slice avoids invisible boxes intruding into the passage.
 const slices=40;for(let j=0;j<slices;j++){const y0=height*j/slices,y1=height*(j+1)/slices,near=Math.min(Math.abs(y0-cy),Math.abs(y1-cy),y0<=cy&&y1>=cy?0:Infinity),gap=near<radius?Math.sqrt(radius*radius-near*near):0;
  if(gap===0)c.kit.col(c.f,-half,y0,gateZ-.245,half,y1,gateZ+depth/2);
  else for(const s of[-1,1])c.kit.col(c.f,s<0?-half:gap,y0,gateZ-.245,s<0?-gap:half,y1,gateZ+depth/2);
 }
 // Shallow side returns follow only the retained plot; their exact hidden
 // interfaces and unphotographed inner finish are explicitly fitted.
 for(const s of[-1,1]){const m=box('fori-court-side-return','brick',.28,height,rearZ-gateZ,s*half,height/2,(gateZ+rearZ)/2,true);m.material=mats.mortar;}
 // Staggered irregular polygon veneers: a rubble-material cue, never an exact
 // mapping of historic stones. No mesh can cross the circular reveal.
 const rh=.26,cw=.49;for(let row=0;row<13;row++)for(let col=0;col<25;col++){
  const x=-half+.08+(col+(row%2)*.5)*cw,y=.10+row*rh,ww=cw-.035,hh=rh-.035;if(x+ww>half-.06)continue;
  const nx=Math.max(x,Math.min(0,x+ww)),ny=Math.max(y,Math.min(cy,y+hh));if(nx*nx+(ny-cy)**2<(radius+.205)**2)continue;
  const j=((row*29+col*17)%13)/13,stone=new THREE.Shape();stone.moveTo(.04+j*.04,0);stone.lineTo(ww-.025,.015);stone.lineTo(ww,hh*.63);stone.lineTo(ww-.06,hh);stone.lineTo(.025,hh-.014);stone.lineTo(0,hh*.32);stone.closePath();mesh('rubble-face',stone,.055,'rubble'+((row*7+col*3)%4),x,y,gateZ-.228);
 }
 // Gate is at courtyard level; the low stair lies wholly behind it and joins
 // the old platform without raising the moon opening or changing the player.
 const edge=-(p.localD/2+Math.min(c.item.pad??.5,.8)),run=1.25,clear=3.2;
 for(let i=0;i<5;i++){const top=p.ph*(i+1)/5;box('fori-court-step','stone',clear,top,run/5+.008,0,top/2,edge-run+(i+.5)*run/5);}c.kit.walkRamp(c.f,-clear/2,clear/2,edge-run,edge,0,p.ph);
 const data={object:'FC-2318B5F73B',source:'https://www.dpm.org.cn/explore/building/236573.html',accepted:false,scope:'FRONT_SMALL_COURT_MOON_GATE_AND_CENTRAL_ENTRY',dimensions:'MODEL_FIT_NOT_SURVEY',gateZ,rearZ,halfWidth:half,height,radius,centerY:cy,groundOpeningWidth:2*foot,colliderPolicy:'HORIZONTAL_INSCRIBED_SOLID_SLICES_NO_APERTURE_INTRUSION',circlePolicy:'BELOW_GROUND_ARC_CLIPPED_FOR_RETAINED_COURTYARD_LEVEL',surfacePolicy:'STAGGERED_POLYGON_RUBBLE_CUE_NOT_ORIGINAL_STONE_LAYOUT',newGroundRamps:1,newUpperDestinations:0,missing:['exact court footprint and wall return junctions','original rockscape and individual stone placement','east stair to Fanhua level alignment','hidden wall inner finishes','current Buddha inventories'],retained:['all original hall meshes and colliders','old lower partitions and altar outlines','view-only upper navigation']};c.f.userData.foriForecourt=data;return data;
}
