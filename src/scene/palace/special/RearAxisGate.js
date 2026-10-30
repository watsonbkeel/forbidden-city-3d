import * as T from 'three';
const RECORDS=Object.freeze({
 houzuo:{index:16,name:'后左门',objectId:'FC-E3F4369B07',x:-76.4,z:123,group:21,northPanel:0x80593d,paleSouthRight:false},
 houyou:{index:18,name:'后右门',objectId:'FC-48D7D69238',x:79.4,z:123,group:15,northPanel:0x896448,paleSouthRight:true},
});
const tag=(m,role,extra={})=>{m.name=role;Object.assign(m.userData,{role,...extra});return m;};
export function rearAxisGateGeometry(item,zoneId,index){
 const p=RECORDS[item.rearAxisGate];
 if(!p||zoneId!=='axis-courts'||index!==p.index||item.name!==p.name||item.x!==p.x||item.z!==p.z||item.kind!=='gate'||item.gateKind!=='three-bay'||item.style!=='hall'||(item.rot!==undefined&&item.rot!==0))throw Error('Rear-axis gate identity mismatch');
 return{...p,profile:`rear-axis-${item.rearAxisGate}`,width:15.2,depth:6.4,coreBays:[3.8,5.2,3.8],coreWidth:12.8,sideVeranda:1.2,columnH:6.2,portalWidth:3.6,floorY:0,doorZ:0,toWorld:(x,z)=>[p.x+x,p.z+z]};
}
/** Own south/north photographs, not a common gate style inferred from name.
 * Ground/portal are retained. Long ramps, rail census and adjoining five-bay
 * corridor extent are NOT invented by this bounded roofed-envelope correction. */
export function buildRearAxisGate(kit,item,zoneId,index){
 const g=rearAxisGateGeometry(item,zoneId,index),f=kit.frame(g.x,g.z,0),h=g.columnH;f.name=g.name;
 const box=(role,material,w,t,d,x,y,z)=>tag(kit.box(f,material,w,t,d,x,y,z),role);
 const solid=(role,material,w,t,d,x,y,z)=>{const m=box(role,material,w,t,d,x,y,z);kit.col(f,x-w/2,y-t/2,z-d/2,x+w/2,y+t/2,z+d/2);return m;};
 // Flush paving keeps existing whole-world ground; no new rescue/platform.
 box('rear-axis-flush-paving','stone_slab',g.width,.08,g.depth,0,-.04,0);
 const column=new T.CylinderGeometry(.24,.255,h,10);
 for(const x of[-7.6,-6.4,-2.6,2.6,6.4,7.6])for(const z of[-3.2,3.2]){tag(kit.mesh(f,column,kit.lib.material('wood_column'),x,h/2,z),'rear-axis-column');kit.col(f,x-.255,0,z-.255,x+.255,h,z+.255);box('rear-axis-column-foot','stone_slab',.57,.12,.57,x,.06,z);}
 for(const z of[-3.2,0,3.2])box('rear-axis-painted-beam','caihua_beam',g.width+.25,.55,.4,0,h-.275,z);
 for(const x of[-7.6,-2.6,2.6,7.6])box('rear-axis-transverse-beam','caihua_beam',.35,.48,g.depth,x,h-.24,0);
 const panelMat=new T.MeshStandardMaterial({color:g.northPanel,roughness:.94,name:`${g.profile}-north-ochre-fit`});kit.owned.push(panelMat);
 const edgeMat=new T.MeshStandardMaterial({color:0x41675a,roughness:.88,name:`${g.profile}-north-green-edge-fit`});kit.owned.push(edgeMat);
 const pale=g.paleSouthRight?new T.MeshStandardMaterial({color:0xb9b5a6,roughness:.95,name:'houyou-south-right-observed-cover-fit'}):null;if(pale)kit.owned.push(pale);
 for(const side of[-1,1]){
  const bodyW=(g.width-g.portalWidth)/2,cx=side*(g.portalWidth/2+bodyW/2);
  solid('rear-axis-closed-side-body','wall_red',bodyW,h-.55,.5,cx,(h-.55)/2,0);
  for(const face of[-1,1])box('rear-axis-side-stone-foot','wall_brick',bodyW,.7,.06,cx,.35,face*.28);
  const wx=side*4.5,bottom=.95,wh=4.1,ww=3.8-.45;
  // Looking north from the south, photograph-right is local -X/east.
  const window=tag(new T.Group(),'rear-axis-south-window',{side,sourceGroup:g.group,coverObserved:!!(pale&&side===-1)});f.add(window);
  tag(kit.mesh(window,new T.BoxGeometry(ww,wh,.06),pale&&side===-1?pale:kit.lacquer,wx,bottom+wh/2,-.31),'rear-axis-south-window-backing');
  for(const dx of[-1,1])box('rear-axis-south-window-frame','wood_column',.12,wh+.16,.15,wx+dx*ww/2,bottom+wh/2,-.38);
  for(const y of[bottom,bottom+wh])box('rear-axis-south-window-frame','wood_column',ww,.12,.15,wx,y,-.38);
  for(let i=1;i<12;i++)box('rear-axis-south-window-bar','wood_column',.04,wh,.08,wx-ww/2+i*ww/12,bottom+wh/2,-.395);
  for(let i=1;i<9;i++)box('rear-axis-south-window-bar','wood_column',ww,.04,.08,wx,bottom+i*wh/9,-.395);
  tag(kit.mesh(f,new T.BoxGeometry(ww,wh,.025),panelMat,wx,bottom+wh/2,.275),'rear-axis-north-ochre-panel',{side,sourceGroup:g.group});
  for(const dx of[-1,1])tag(kit.mesh(f,new T.BoxGeometry(.055,wh,.025),edgeMat,wx+dx*(ww/2-.025),bottom+wh/2,.301),'rear-axis-north-panel-border');
  for(const y of[bottom+.025,bottom+wh-.025])tag(kit.mesh(f,new T.BoxGeometry(ww,.055,.025),edgeMat,wx,y,.301),'rear-axis-north-panel-border');
  // Narrow outer back strips are distinct closed lattice, not extra portals.
  const ox=side*6.99;box('rear-axis-north-narrow-lattice-backing','wood_column',.82,wh,.06,ox,bottom+wh/2,.30);
  for(let i=1;i<5;i++)box('rear-axis-north-narrow-lattice-bar','wall_red',.035,wh,.05,ox-.41+i*.82/5,bottom+wh/2,.355);
  for(let i=1;i<6;i++)box('rear-axis-north-narrow-lattice-bar','wall_red',.82,.035,.05,ox,bottom+i*wh/6,.355);
 }
 // Main opening stays 3.6m. Both own sources show plain framed red leaves;
 // no generic stud texture is assigned to either unseen/reverse surface.
 solid('rear-axis-central-lintel','wood_column',3.6,1.15,.46,0,5.625,0);
 const open=item.open!==false,leafW=1.78,leafH=5.05;
 for(const side of[-1,1]){
  const leaf=tag(new T.Mesh(new T.BoxGeometry(leafW,leafH,.25).translate(0,leafH/2,0),kit.lacquer),'rear-axis-door-leaf',{open,sourceGroup:g.group});
  leaf.position.set(open?side*(g.portalWidth/2+.17):side*.89,0,open?leafW/2:0);if(open)leaf.rotation.y=Math.PI/2;f.add(leaf);
  for(const z of[-.145,.145])for(const y of[.12,leafH*.3,leafH-.12]){const bar=tag(new T.Mesh(new T.BoxGeometry(leafW*.94,.1,.04),kit.lacquer),'rear-axis-leaf-owned-batten');bar.position.set(0,y,z);leaf.add(bar);}
  leaf.castShadow=leaf.receiveShadow=true;const dx=open?.17:leafW/2,dz=open?leafW/2:.17;kit.col(f,leaf.position.x-dx,0,leaf.position.z-dz,leaf.position.x+dx,leafH,leaf.position.z+dz);
 }
 tag(kit.roof(f,{type:'xieshan',width:g.width+.4,depth:g.depth+.4,baseY:h,height:3,layers:1,brackets:true,detail:'low'}),'rear-axis-main-roof');
 kit.mapRect(f,'gate',g.name,g.width,g.depth,{profile:g.profile,portalCount:1,sourceGroup:g.group});
 f.userData.structure={profile:g.profile,gateKind:'three-bay',portalCount:1,eaveCount:1,roof:'xieshan',sourceGroup:g.group,sourceFacing:'south',floorY:0,dimensions:'RETAINED_ANCHOR_AND_CLEAR_PORTAL; ALL NEW ENVELOPE_DIMENSIONS_ARE_PHOTO_FIT_NOT_SURVEY',documentaryBayCount:'连廊共5间; not five core bays and not three portals',wholeObjectAccepted:false};
 f.userData.rearAxisGate={objectId:g.objectId,scope:'OWN_ROOFED_GATE_ENVELOPE_NOT_COMPLETE_COURT',northSouthIndependent:true,sourceGroup:g.group,notReconstructed:['adjoining corridor count/limits','long ramps and balustrades','full interior timber','Houyou demolished instrument store'],openState:open?'GAME_PLAYABLE_NOT_ACCESS_POLICY':'closed'};
 Object.assign(f.userData.structure,{id:`axis-courts/items/${g.index}`,objectId:g.objectId,...f.userData.rearAxisGate});
 return{width:g.width,geometry:g,frame:f};
}
