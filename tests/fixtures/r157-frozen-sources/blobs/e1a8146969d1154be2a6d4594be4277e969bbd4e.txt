import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {CHUXIU_MAIN_Z,CHUXIU_FRONT_WING_Z} from './ChuxiuRearCourtFrame.js';
import {chuxiuWingOriginalDeclaration} from './ChuxiuCourtyard.js';

// Official facade composition, not measured dimensions or an exact carved pattern.
// No photo/atlas is embedded. All replacements stay in the existing solid envelope;
// registered contacts, door widths, room bounds and unknown inventory are retained.
const palettes=new WeakMap();
function palette(kit){let p=palettes.get(kit);if(p)return p;const make=(key,color,extra={})=>{const m=new THREE.MeshStandardMaterial({name:`chuxiu_front_${key}_fit`,color,roughness:.72,...extra});kit.owned.push(m);return m;};p={wood:make('wood',0x583724),glass:make('glass',0x9aafb3,{transparent:true,opacity:.28,roughness:.22,depthWrite:false,side:THREE.DoubleSide}),red:make('red',0x731b19),pale:make('pale',0xc0bda7),green:make('green',0x315643),trim:make('trim',0x8c805a)};palettes.set(kit,p);return p;}
const near=(a,b)=>Math.abs(a-b)<1e-6;
function piece(kit,parent,role,mat,w,h,d,x=0,y=0,z=0){if(Math.min(w,h,d)<=0)throw Error('Chuxiu facade nonpositive solid');const m=kit.mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z);m.name=role;m.userData={role,dimensionStatus:'PHOTO_COMPOSITION_MODEL_FIT_NOT_SURVEYED',patternStatus:'ORIGINAL_SCHEMATIC_NOT_EXACT_CARVING'};return m;}
function replacement(mesh){const g=new THREE.Group();g.position.copy(mesh.position);g.quaternion.copy(mesh.quaternion);g.scale.copy(mesh.scale);mesh.parent.add(g);mesh.geometry.computeBoundingBox();const size=mesh.geometry.boundingBox.getSize(new THREE.Vector3());mesh.removeFromParent();mesh.geometry.dispose();return{g,size};}
function nested(kit,parent,p,w,h,d,x,y,z,role='chuxiu-front-nested-lattice'){
 for(const inset of[0,.15]){const ww=w*(.88-inset*2),hh=h*(.88-inset*2),t=.035;for(const sign of[-1,1]){piece(kit,parent,role,p.red,t,hh,d,x+sign*(ww-t)/2,y,z);piece(kit,parent,role,p.red,ww-2*t,t,d,x,y+sign*(hh-t)/2,z);}}
 // Two finite ties connect inner ring through outer ring to the existing top/bottom rails.
 const innerH=h*.58,run=(h-innerH)/2+.0175;
 for(const sign of[-1,1])piece(kit,parent,'chuxiu-front-lattice-bridge',p.red,.035,run,d,x,y+sign*(h/2-run/2),z);
}
function door(kit,m,p,axis='x'){
 const {g,size}=replacement(m),W=axis==='x'?size.x:size.z,H=size.y,D=axis==='x'?size.z:size.x,t=Math.min(.09,W*.12),skirt=Math.min(1.05,H*.27);
 const add=(role,mat,w,h,d,x,y,z)=>piece(kit,g,role,mat,axis==='x'?w:d,h,axis==='x'?d:w,axis==='x'?x:z,y,axis==='x'?z:x);
 // Closed core plus inset border: never project outside the old skirt solid.
 const sy=(-H+skirt)/2,relief=Math.min(.024,D*.2),edge=Math.min(.075,W*.12);
 add('chuxiu-front-door-skirt',p.wood,W,skirt,D-relief,0,sy,relief/2);
 for(const sign of[-1,1]){
  add('chuxiu-front-skirt-panel-border',p.wood,edge,skirt-.12,relief,sign*(W/2-edge/2-.045),sy,-D/2+relief/2);
  add('chuxiu-front-skirt-panel-border',p.wood,W-.09-2*edge,edge,relief,0,sy+sign*(skirt/2-edge/2-.06),-D/2+relief/2);
 }
 const lo=-H/2+skirt,hi=H/2,split=lo+(hi-lo)*.57;
 for(const x of[-(W-t)/2,(W-t)/2])add('chuxiu-front-door-stile',p.wood,t,hi-lo,D,x,(hi+lo)/2,0);
 for(const yy of[lo+t/2,split,hi-t/2])add('chuxiu-front-door-rail',p.wood,W-2*t,t,D,0,yy,0);
 for(const[a,b]of[[lo+t,split-t/2],[split+t/2,hi-t]])add('chuxiu-front-door-glass',p.glass,W-2*t,b-a,Math.min(.04,D),0,(a+b)/2,0);
}
function beam(kit,m,p,bays,id,span){
 const{g,size:s}=replacement(m),skin=.025,z=-s.z/2+skin/2,t=.055;
 piece(kit,g,'chuxiu-front-beam-core',p.green,s.x,s.y,s.z-skin,0,0,skin/2);
 for(let k=0;k<bays;k++){const width=s.x/bays,x=-s.x/2+(k+.5)*width;
  const end=(width-2*t)*.17;
  piece(kit,g,'chuxiu-front-pale-field',p.pale,width-2*t-2*end,s.y-2*t,skin,x,0,z);
  for(const sign of[-1,1])piece(kit,g,'chuxiu-front-green-end-field',p.green,end,s.y-2*t,skin,x+sign*(width/2-t-end/2),0,z);
  for(const sign of[-1,1]){piece(kit,g,'chuxiu-front-field-edge',p.trim,t,s.y,skin,x+sign*(width-t)/2,0,z);piece(kit,g,'chuxiu-front-field-edge',p.trim,width-2*t,t,skin,x,sign*(s.y-t)/2,z);}
 }
 // Source-observed paired column-head silhouettes. Fine floral carving is UNKNOWN.
 // Only the inward half at the two end columns is made; no outside-bay projection.
 for(let k=0;k<bays;k++)for(const sign of[-1,1]){
  const at=-span/2+(sign===1?k:k+1)*span/bays,length=Math.min(1.28,span/bays*.30),drop=Math.min(.57,s.y*.76);
  const outline=[[0,0],[1,0],[.92,-.29],[.79,-.24],[.68,-.48],[.53,-.42],[.40,-.71],[.22,-.65],[0,-1]],shape=new THREE.Shape();
  const points=outline.map(([x,y])=>[sign*x*length,y*drop]);shape.moveTo(...points[0]);points.slice(1).forEach(q=>shape.lineTo(...q));shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:false,curveSegments:1,steps:1}),mesh=kit.mesh(g,geo,p.pale,at,-s.y/2,-.10);
  mesh.name='chuxiu-front-hanging-outline';mesh.userData={role:mesh.name,dimensionStatus:'PHOTO_COMPOSITION_MODEL_FIT_NOT_SURVEYED',patternStatus:'SIMPLIFIED_OUTLINE_NOT_FLORAL_CARVING'};
  // Actual finished faces, not the bounding box filling the scalloped underside.
  mesh.updateWorldMatrix(true,false);const world=geo.clone().applyMatrix4(mesh.matrixWorld),template=createTriangleTemplate(world),owner=triangleInstance(template,[0,0,0],`chuxiu-front-hanging:${id}:${k}:${sign}`),b=owner.box.clone();b.triangleSupport=owner;kit.colliders.push(b);world.dispose();
 }
}
function validateBeamSource(m,item){
 const raw=new THREE.BoxGeometry(item.w+.5,THREE.MathUtils.clamp(item.colH*.12,.45,.85),.45),ref=raw.toNonIndexed(),p=m.geometry?.attributes?.position,q=ref.attributes.position;
 const valid=!m.geometry.index&&p?.itemSize===3&&p.array.constructor===q.array.constructor&&p.count===q.count&&p.array.every((v,i)=>v===q.array[i])&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0&&m.scale.equals(new THREE.Vector3(1,1,1))&&m.visible;
 raw.dispose();ref.dispose();if(!valid)throw Error('Chuxiu front beam source geometry changed');
}
function frontBeam(f,kit,item){return f.children.filter(m=>m.isMesh&&m.material===kit.lib.material('caihua_beam')&&near(m.position.z,-item.d/2)&&near(m.position.x,0)&&near(m.position.y,item.ph+item.colH-THREE.MathUtils.clamp(item.colH*.12,.45,.85)/2));}
function validateFrame(kit,f,item,rot){if(!f?.isGroup||f.parent!==kit.root||f.position.x!==item.x||f.position.y!==0||f.position.z!==item.z||f.rotation.y!==rot||f.scale.toArray().some(v=>v!==1)||f.userData.chuxiuFrontEnsemble)throw Error('Chuxiu facade frame/duplicate mismatch');}
export function applyChuxiuMainFront(kit,f,item){
 if(item.name!=='储秀宫'||item.structure!=='chuxiu-household'||item.x!==94.8||item.z!==CHUXIU_MAIN_Z||item.w!==27.1||item.d!==13.8||item.ph!==.6||item.bays!==5)throw Error('Chuxiu main facade identity mismatch');validateFrame(kit,f,item,0);
 const byRole=r=>f.children.filter(m=>m.isMesh&&m.userData.role===r),jambs=byRole('chuxiu-central-door-jamb'),leaves=byRole('chuxiu-open-door-leaf'),oldLattice=byRole('chuxiu-window-lattice'),glass=byRole('chuxiu-window-glass'),beams=frontBeam(f,kit,item);
 if(jambs.length!==2||leaves.length!==2||oldLattice.length!==80||glass.length!==4||beams.length!==1)throw Error('Chuxiu main facade source mismatch');
 validateBeamSource(beams[0],item);
 const p=palette(kit);for(const m of jambs)door(kit,m,p);for(const m of leaves)door(kit,m,p,'z');
 for(const m of oldLattice){m.removeFromParent();m.geometry.dispose()}
 const bay=item.w/5,width=bay-.68,base=item.ph+.9+1.55,z=-item.d/2+1.9;
 for(const i of[0,1,3,4]){const cx=-item.w/2+(i+.5)*bay,cell=width/4;for(let k=0;k<4;k++)nested(kit,f,p,cell,1.5,.08,cx-width/2+(k+.5)*cell,base+.75,z-.08);for(let k=1;k<4;k++)piece(kit,f,'chuxiu-front-lower-mullion',p.red,.065,1.55,.05,cx-width/2+k*cell,item.ph+.9+1.55/2,z-.075);}
 beam(kit,beams[0],p,5,'main',item.w);f.userData.chuxiuFrontEnsemble={id:'main',source:'official-group58-8-9',scope:'same-envelope-enclosure-plus-source-owned-column-head-silhouette',centralInterior:'REVIEWED_RETAINED_NOT_RECONSTRUCTED'};
}
function wingWindow(kit,m,p){const{g,size:s}=replacement(m),sill=.85,glass=1.25,base=-s.y/2+sill,top=base+glass,upper=s.y-sill-glass;
 piece(kit,g,'chuxiu-wing-window-sill',kit.lib.material('wall_brick'),s.x,sill,s.z,0,(-s.y+sill)/2,0);
 piece(kit,g,'chuxiu-wing-window-glass',p.glass,s.x,glass,.04,0,base+glass/2,0);
 const t=.06;for(const x of[-(s.x-t)/2,0,(s.x-t)/2])piece(kit,g,'chuxiu-wing-window-frame',p.red,t,s.y-sill,s.z,x,(sill)/2,0);
 for(const y of[base+t/2,top,s.y/2-t/2])piece(kit,g,'chuxiu-wing-window-frame',p.red,s.x,t,s.z,0,y,0);
 for(const sign of[-1,1])nested(kit,g,p,s.x/2,upper,.06,sign*s.x/4,top+upper/2,-.02,'chuxiu-wing-window-lattice');
}
export function applyChuxiuFrontWing(kit,zoneId,itemIndex,item,built){
 if(zoneId!=='west-six'||![25,26].includes(itemIndex))return built;
 chuxiuWingOriginalDeclaration(item,itemIndex);if(item.z!==CHUXIU_FRONT_WING_Z||item.w!==11.2||item.d!==7.04||item.ph!==.45||item.colH!==5.44||item.structure!==undefined)throw Error('Chuxiu front wing identity mismatch');
 const f=built.f;validateFrame(kit,f,item,itemIndex===25?-Math.PI/2:Math.PI/2);if(f.userData.westUnknownAnnexInventory?.mode!=='unknown-inventory')throw Error('Chuxiu front wing requires retained unknown inventory policy');
 const lattice=kit.lib.material('lattice_doors'),panels=f.children.filter(m=>m.isMesh&&m.material===lattice&&near(m.position.z,-item.d/2)),leaves=f.children.filter(m=>m.isMesh&&m.material===lattice&&near(m.rotation.y,Math.PI/2)),columns=f.children.filter(m=>m.isMesh&&m.geometry.type==='CylinderGeometry'&&m.material===kit.lib.material('wood_column')&&near(m.position.z,-item.d/2)),beams=frontBeam(f,kit,item);
 if(panels.length!==2||leaves.length!==2||columns.length!==4||beams.length!==1)throw Error('Chuxiu front wing facade source mismatch');
 validateBeamSource(beams[0],item);
 const p=palette(kit);for(const m of panels)wingWindow(kit,m,p);for(const m of leaves)door(kit,m,p);for(const m of columns){m.material=p.green;m.name='chuxiu-wing-green-column';m.userData.role=m.name;}beam(kit,beams[0],p,3,itemIndex===25?'yanghe':'suifu',item.w);
 f.userData.chuxiuFrontEnsemble={id:itemIndex===25?'yanghe-east':'suifu-west',sourceGroup:itemIndex===25?62:59,scope:'same-envelope-enclosure-plus-source-owned-column-head-silhouette',inventory:'UNKNOWN_UNCHANGED'};return built;
}
