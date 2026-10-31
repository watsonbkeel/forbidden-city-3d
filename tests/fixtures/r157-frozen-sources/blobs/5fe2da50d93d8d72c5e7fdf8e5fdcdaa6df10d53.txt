import {applyKunningNorthBalustrades} from './KunningNorthBalustrades.js';
import * as THREE from 'three';
import {buildStuddedDoor} from '../../HallKit.js';
import {createGatePlaque} from './GatePlaques.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236582.html';
const FIT='REVERSIBLE_PHOTO_RELATION_FIT_NOT_SURVEY';
const ROUTE=[[2.8,-8.5],[2.8,-7.2],[2.8,-4.5],[1.65,-2.8],[1.65,2.8],[2.8,4.5],[2.8,7.2],[2.8,8.5]];
export function kunningGateAccess(item){if(item.gateProfile!=='kunning'||item.name!=='坤宁门'||item.rot!=='north'||![item.x,item.z].every(Number.isFinite))throw Error('Kunning access requires the actual north-facing registration');return ROUTE.map(([x,z])=>[item.x+x,item.z+z]);}
/** FC-60FCD2B8CC. The official text resolves the otherwise ambiguous photo
 * orientation: NORTH walls/nameplate, SOUTH square-lattice guardroom windows.
 * Retained world envelope is not a claim of real measured dimensions. */
export function buildKunningGate(kit,item){
 if(item.gateProfile!=='kunning'||item.gateKind!=='three-bay'||item.name!=='坤宁门'||item.rot!=='north')throw Error('Kunning requires explicit named north three-bay profile');
 if(![item.x,item.z].every(Number.isFinite)||item.w!==12)throw Error('Kunning requires retained registration and width marker');
 const W=20.8,D=6.4,ph=1.2,H=6.2,bw=8.32,sw=6.24,pw=22.4,pd=8,run=3.2,n=8,r=.26;
 const f=kit.frame(item.x,item.z,Math.PI),g={objectId:'FC-60FCD2B8CC',source:SOURCE,photoDate:null,urlDate:'2020-04-20',accepted:false,status:'PARTIAL_VERIFY_PENDING',width:W,depth:D,bayWidths:[sw,bw,sw],portalCount:1,front:'north',windowSide:'south',dimensionStatus:FIT,
  inherited:{x:item.x,z:item.z,bodyWidth:W,bodyDepth:D,wallGap:W,platformWidth:pw,platformDepth:pd,columnHeight:H},
  fitted:{platformY:ph,stairRisers:n,stairRun:run,centreBayFraction:.4,doorClearWidth:4.8,northStairWidth:10.4,southStairWidth:pw},
  unknowns:['Surveyed dimensions and absolute pavement datum','Exact stair count and imperial-stone carving','Guardroom interiors and internal access','Complete glazed screen/connected gallery interfaces','Verified Manchu transcription, original calligraphy and fine painted decoration','Current visitor access'],
  routeSpace:'WORLD_XZ_OFFSETS_FROM_REGISTRATION',route:ROUTE.map(p=>[...p])};
 f.name='坤宁门';f.userData.kunningGate=g;
 const mark=(m,role)=>{m.name=role;m.userData.role=role;m.userData.source=SOURCE;m.userData.dimensionStatus=FIT;return m;};
 const box=(role,mat,w,h,d,x,y,z)=>mark(kit.box(f,mat,w,h,d,x,y,z),role);
 const solid=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
 const support=(id,x0,z0,x1,z1,y)=>{kit.walkBox(f,x0,z0,x1,z1,y);Object.assign(kit.walkables.at(-1),{rescue:false,supportId:id,kunningGate:true});};
 solid('kunning-platform-masonry','wall_brick',pw,ph-.08,pd,0,(ph-.08)/2,0);
 solid('kunning-platform-paving','stone_slab',pw,.08,pd,0,ph-.04,0);support('kunning-platform',-pw/2,-pd/2,pw/2,pd/2,ph);
 // Real horizontal treads: no invisible ramp over the side stair noses.
 for(const sign of[-1,1]){const width=sign<0?10.4:pw,toe=sign*(pd/2+run),halfStone=1.2;
  for(let i=0;i<n;i++){const h=ph*(i+1)/n,z=toe-sign*(i+.5)*run/n;
   for(const side of[-1,1]){const w=width/2-halfStone,x=side*(halfStone+w/2);solid('kunning-stair-tread','stone_slab',w,h,run/n,x,h/2,z);support(`kunning-${sign}-${side}-tread-${i+1}`,x-w/2,z-run/n/2,x+w/2,z+run/n/2,h);}
  }
  // The photograph establishes a centre stone, not its carved subject.
  // A plain closed sloping solid and matching existing ramp support retain
  // physical consistency; the formal route uses the steps beside it.
  const zTop=sign*pd/2,zToe=toe,yToe=.15,geo=wedge(-halfStone,halfStone,zTop,zToe,ph,yToe);
  mark(kit.mesh(f,geo,kit.lib.material('stone_slab'),0,0,0),'kunning-imperial-stone-unornamented');
  const wzTop=item.z-zTop,wzToe=item.z-zToe;
  kit.walkables.push({type:'ramp',axis:'z',minX:item.x-halfStone,maxX:item.x+halfStone,minZ:Math.min(wzTop,wzToe),maxZ:Math.max(wzTop,wzToe),a0:wzTop,a1:wzToe,y0:ph,y1:yToe,rescue:false,supportId:`kunning-${sign}-stone`,kunningGate:true});
  for(let i=0;i<32;i++){const a=i/32,b=(i+1)/32,h=ph+(yToe-ph)*b;kit.col(f,-halfStone,0,zTop+(zToe-zTop)*a,halfStone,h,zTop+(zToe-zTop)*b);}
 }
 const colGeo=new THREE.CylinderGeometry(r,r*1.05,H,12);
 for(const x of[-W/2,-bw/2,bw/2,W/2])for(const z of[-D/2,D/2]){mark(kit.mesh(f,colGeo,kit.lib.material('wood_column'),x,ph+H/2,z),'kunning-outer-column');kit.col(f,x-r,ph,z-r,x+r,ph+H,z+r);}
 // Actual north/red masonry and south/lattice are different. Unknown room
 // interiors remain unregistered/unfurnished rather than filled generically.
 for(const sign of[-1,1]){const x=sign*(bw/2+sw/2),w=sw-.52,base=1.15;
  solid('kunning-north-side-foot','wall_brick',w,base,.48,x,ph+base/2,-2.7);
  solid('kunning-north-side-wall','wall_red',w,H-base,.42,x,ph+base+(H-base)/2,-2.7);
  solid('kunning-guardroom-end-wall','wall_red',.42,H,5.4,sign*(W/2-.2),ph+H/2,0);
  solid('kunning-guardroom-portal-side-wall','wall_red',.32,H,5.4,sign*(bw/2+.16),ph+H/2,0);
  solid('kunning-south-window-foot','wall_brick',w,base,.48,x,ph+base/2,2.7);
  const low=ph+base+.12,high=ph+H-.95;
  solid('kunning-south-window-head','caihua_beam',w,.83,.42,x,ph+H-.415,2.7);
  const win=mark(new THREE.Group(),'kunning-south-window-group');f.add(win);win.userData.fields=3;
  const winbox=(role,mat,ww,hh,dd,xx,yy,zz)=>{const m=box(role,mat,ww,hh,dd,xx,yy,zz);win.attach(m);return m;};
  const positions=[[-.375,.25],[0,.5],[.375,.25]],height=high-low;
  for(const [offset,fraction]of positions){const cx=x+offset*w,width=w*fraction,th=.1;
   for(const ss of[-1,1])winbox('kunning-south-window-frame','wood_column',th,height,.16,cx+ss*(width-th)/2,low+height/2,2.76);
   for(const yy of[low+th/2,high-th/2])winbox('kunning-south-window-frame','wood_column',width,th,.16,cx,yy,2.76);
   const rows=Math.ceil(height/.32),cols=Math.ceil(width/.32);
   for(let i=1;i<rows;i++)winbox('kunning-south-window-lattice','wood_column',width-th,.035,.07,cx,low+height*i/rows,2.74);
   for(let i=1;i<cols;i++)winbox('kunning-south-window-lattice','wood_column',.035,height-th,.07,cx-width/2+width*i/cols,low+height/2,2.74);
  }
  // Closed window envelope corresponds to its continuous lattice/frame;
  // no invented transparent passage into an unverified guardroom.
  kit.col(f,x-w/2,low,2.67,x+w/2,high,2.84);
 }
 const clear=4.8,doorH=4.4,doorZ=.4,sideW=(bw-clear)/2;
 for(const sign of[-1,1])solid('kunning-door-side-panel','wood_column',sideW,doorH,.32,sign*(clear/2+sideW/2),ph+doorH/2,doorZ);
 solid('kunning-door-head','wood_column',bw,H-doorH,.4,0,ph+(H+doorH)/2,doorZ);
 solid('kunning-threshold','wood_column',clear,.10,.28,0,ph+.05,doorZ);support('kunning-threshold',-clear/2,doorZ-.14,clear/2,doorZ+.14,ph+.1);
 const leafWidth=clear/2-.04,open=item.open!==false;
 for(const sign of[-1,1]){const leaf=mark(buildStuddedDoor(kit.lib,{width:leafWidth,height:doorH}),'kunning-door-leaf');leaf.position.set(open?sign*(clear/2+.12):sign*leafWidth/2,ph,open?doorZ+leafWidth/2:doorZ);if(open)leaf.rotation.y=Math.PI/2;f.add(leaf);const dx=open?.125:leafWidth/2,dz=open?leafWidth/2:.125;kit.col(f,leaf.position.x-dx,ph,leaf.position.z-dz,leaf.position.x+dx,ph+doorH,leaf.position.z+dz);}
 for(const sign of[-1,1]){box('kunning-painted-eave-beam','caihua_beam',W+.5,.6,.4,0,ph+H-.3,sign*D/2);box('kunning-painted-side-beam','caihua_beam',.4,.6,D,sign*W/2,ph+H-.3,0);}
 kit.roof(f,{type:'xieshan',width:W+.5,depth:D+.5,baseY:ph+H,layers:1,brackets:true});
 // Reuse a self-authored simplified ribbon, never a copied source bitmap.
 const own=new Map(),adapter={_own:own,ownMat(key,args){if(!own.has(key)){const mat=new THREE.MeshStandardMaterial(args);own.set(key,mat);kit.owned.push(mat);}return own.get(key);}};
 const plaque=createGatePlaque(adapter,{id:'kunning-north-name-plaque',text:'坤寧門',width:1.2,height:1.6,depth:.1,layout:'vertical',style:'gate-name',side:'south'});
 plaque.position.set(0,ph+H-.92,doorZ-.24);plaque.userData.gatePlaque.source=SOURCE;plaque.userData.gatePlaque.unrenderedScript='Manchu: transcription and glyph verification pending';f.add(plaque);
 kit.mapRect(f,'gate','坤宁门',W,D,{gateProfile:'kunning',platformY:ph,front:'north',dimensionStatus:FIT});
 g.supports=kit.walkables.filter(w=>w.kunningGate).map(w=>w.type==='box'?{type:w.type,min:w.box.min.toArray(),max:w.box.max.toArray(),rescue:false,supportId:w.supportId}:{...w});
 f.userData.structure={...g,id:'garden/kunning-gate',x:item.x,z:item.z,gateKind:'three-bay',gateProfile:'kunning',storeys:1,eaveCount:1,portalCount:1,front:'north',dimensionStatus:FIT,accepted:false};
 applyKunningNorthBalustrades(kit,f,item);
 return W;
}
function wedge(x0,x1,z0,z1,y0,y1){
 const p=[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y1,z1],[x0,y1,z1]],faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],pos=[],uv=[];
 for(const q of faces)for(const tri of[[q[0],q[1],q[2]],[q[0],q[2],q[3]]]){if(z1>z0)tri.reverse();for(const i of tri){pos.push(...p[i]);uv.push(p[i][0]/2,p[i][2]/2);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return geo;
}
