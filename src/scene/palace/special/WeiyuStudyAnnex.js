import * as T from 'three';
export const WEIYU_ID='weiyu-study-annex-source-fit';
export const WEIYU_FIT=Object.freeze({sourceObjectId:'FC-59F7BB24CB',x:-134.5,z:282.5,floor:.3,annex:Object.freeze([-12.7,-10,-4.1,3.2]),back:Object.freeze([-14.6,-12.7,-4.1,3.2]),circle:Object.freeze({x:-12.7,z:.1,y:1.5,radius:1.2}),status:'MODEL_FIT_NOT_SURVEY'});
const PAPERS=['https://img.dpm.org.cn/Uploads/File/2019/11/30/u5de1e229041a9.pdf','https://www.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf'];
function portalGeometry(depth,from,to,y0,y1,center,width,height){const s=new T.Shape();s.moveTo(from,y0);s.lineTo(center-width/2,y0);s.lineTo(center-width/2,y0+height);s.lineTo(center+width/2,y0+height);s.lineTo(center+width/2,y0);s.lineTo(to,y0);s.lineTo(to,y1);s.lineTo(from,y1);s.closePath();return new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,steps:1,curveSegments:32});}
/** A named, compressed annex and the connected eastern side-hall excerpt.
 * Source layout, not a measured room or a reconstruction of all furnishings. */
export function buildWeiyuStudyAnnex(kit,jide){
 if(kit.root.name!=='east-six'||jide.name!=='jide-rear-text-fit'||jide.position.x!==WEIYU_FIT.x||jide.position.z!==WEIYU_FIT.z)throw Error('Exact Jide host required');
 const east=jide.children.filter(m=>m.name==='jide-rear-text-fit/closed-side-wall-fit'&&m.position.x===-9.825),leaves=jide.children.filter(m=>m.name==='jide-rear-text-fit/closed-center-door-leaf-fit');
 if(east.length!==1||leaves.length!==4||![24,36].includes(east[0].geometry.attributes.position.count))throw Error('Original eastern wall and four hinged leaves required');
 const f=kit.frame(WEIYU_FIT.x,WEIYU_FIT.z,0);f.name=WEIYU_ID;
 const plaster=new T.MeshStandardMaterial({name:'weiyu-warm-plaster-color-fit',color:0xd4c7a9,roughness:.95});kit.owned.push(plaster);
 const box=(role,mat,w,h,d,x,y,z,parent=f)=>{const m=kit.box(parent,mat,w,h,d,x,y,z);m.name=WEIYU_ID+'/'+role;return m;};
 const mesh=(role,geo,mat,parent=f)=>{const m=new T.Mesh(geo,typeof mat==='string'?kit.lib.material(mat):mat);m.name=WEIYU_ID+'/'+role;m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const wallX=(role,x,z0,z1,center,width,parent=f)=>{const g=portalGeometry(.16,z0,z1,.3,3.65,center,width,2.65);g.rotateY(Math.PI/2);g.translate(x-.08,0,0);return mesh(role,g,'wood_column',parent);};
 // The local Shape X becomes world -Z after rotation: mirror first to preserve named Z positions.
 const wallZ=(role,z,x0,x1,center,width,parent=f)=>{const g=portalGeometry(.14,x0,x1,.3,3.65,center,width,2.65);g.translate(0,0,z-.07);return mesh(role,g,'wood_column',parent);};
 // Replace only the source-qualified east-side wall with its southern connecting doorway.
 const replacement=portalGeometry(.35,-5.15,5.15,.3,5.1,3.1,1.5,2.65);replacement.rotateY(Math.PI/2);replacement.translate(-10,0,0);
 const old=east[0].geometry;east[0].geometry=replacement;east[0].position.set(0,0,0);east[0].name='jide-rear-text-fit/east-wall-weiyu-portal';old.dispose();
 // Original four physical leaves remain unchanged in shape, now opened inward
 // as two articulated pairs. This is a game visit state, not an archival claim.
 leaves.forEach((m,i)=>{const left=i<2,j=left?i:3-i;m.position.set(left?-1.9:1.9,2.45,-4.7+.475+j*.95);m.rotation.y=left?-Math.PI/2:Math.PI/2;m.userData.weiyuDoorState='GAME_VISIT_OPEN_FIT';m.userData.originalClosedPosition=[(i-1.5)*.95,2.45,-4.7];});
 // Necessary circulation only: central hall -> E1 west/south/north passage ->
 // E2 west/east/south passage -> annex south passage/north room. No invented furniture.
 wallX('east-one-west-entry',-2,-5.15,5.15,1.2,1.5,jide);
 wallX('east-one-east-north-link',-6,-5.15,5.15,-2.7,1.5,jide);
 for(const[x,z0,z1]of[[-3.5,-2.5,1.8],[-4.5,-2.5,1.8]])box('east-one-known-center-partition','wood_column',.14,3.35,z1-z0,x,1.975,(z0+z1)/2,jide);
 for(const z of[-2.5,1.8])box('east-one-known-center-partition','wood_column',1.0,3.35,.14,-4,1.975,z,jide);
 wallZ('east-two-south-passage',-2.2,-10,-6,-9.15,1.5,jide);
 // The published north enclosure leaves the known southern turning passage free.
 box('east-two-north-enclosure','wood_column',1.9,3.35,.14,-8.5,1.975,.35,jide);
 for(const x of[-7.55,-9.45])box('east-two-north-enclosure','wood_column',.14,3.35,3.0,x,1.975,1.85,jide);
 // Existing Jide platform ends at local X=-11. New floor starts there,
 // avoiding a second coplanar top over the original 22m platform.
 const threshold=box('round-opening-low-visit-step-fit','wood_column',1.7,.2,1.6,-12.7,.4,.1);threshold.userData.weiyuStoneTop=true;
 const floor=box('annex-and-back-floor','wall_brick',3.6,.3,7.3,-12.8,.15,-.45);floor.userData.weiyuStoneTop=true;
 for(const z of[-4.1,3.2])box('annex-end-wall-fit','wall_red',4.6,3.35,.18,-12.3,1.975,z);
 box('east-side-hall-back-wall-fit','wall_red',.18,3.35,7.3,-14.6,1.975,-.45);
 wallZ('annex-south-to-north-passage',-2.2,-12.7,-10,-11.35,1.5);
 // An actual circular void, with a closed inner reveal and visible wood rim.
 const s=new T.Shape();s.moveTo(-3.2,.3);s.lineTo(4.1,.3);s.lineTo(4.1,3.65);s.lineTo(-3.2,3.65);s.closePath();const hole=new T.Path();hole.absarc(-.1,1.5,1.2,0,Math.PI*2,true);s.holes.push(hole);
 const g=new T.ExtrudeGeometry(s,{depth:.18,bevelEnabled:false,steps:1,curveSegments:48});g.rotateY(Math.PI/2);g.translate(-12.79,0,0);mesh('east-circular-wall',g,plaster);
 const ring=new T.TorusGeometry(1.2,.055,8,96);ring.rotateY(Math.PI/2);ring.translate(-12.57,1.5,.1);mesh('east-circular-wood-rim',ring,'wood_column');
 // Source photograph supports the plaque/wood surround, not exact fine carving.
 box('plaque-board-fit','wood_column',.12,.52,1.7,-12.55,3.08,.1);
 for(const z of[-1.3,1.5])box('circle-side-post-fit','wood_column',.18,3.35,.16,-12.49,1.975,z);
 box('circle-head-beam-fit','wood_column',.2,.18,3.0,-12.49,3.58,.1);
 const roof=kit.roof(f,{type:'gable',width:2.7,depth:7.3,baseY:3.75,height:.9,overhang:.08,brackets:false});roof.name=WEIYU_ID+'/annex-roof-fit';roof.position.set(-11.35,0,-.45);
 const backRoof=kit.roof(f,{type:'gable',width:7.3,depth:1.9,baseY:3.75,height:.7,overhang:.08,brackets:false});backRoof.name=WEIYU_ID+'/east-side-hall-roof-excerpt-fit';backRoof.rotation.y=Math.PI/2;backRoof.position.set(-13.65,0,-.45);
 f.updateWorldMatrix(true,true);
 kit.registerRoom(f,{name:'味余书室',kind:'study',x0:-12.6,x1:-10,z0:-4,z1:3.1,y:.3,h:3.35,doors:[{x:-10,z:-3.1},{x:-12.7,z:.1}]});
 const room=kit.rooms.at(-1);Object.assign(room,{sourceObjectId:WEIYU_FIT.sourceObjectId,sourceHostId:WEIYU_ID,scope:'NAMED_ANNEX_NOT_COMPLETE_JIDE_INTERIOR',fit:WEIYU_FIT.status});
 const meta={id:WEIYU_ID,sourceObjectId:WEIYU_FIT.sourceObjectId,name:'味余书室',parentSourceObjectId:'FC-7AACE4D51F',source:PAPERS[0],sources:PAPERS,sourcePages:['2019 print125 named circulation plan','2019 print132 named annex','2019 print133 altered west partition and east circular opening','2021 print110 regional plan'],photo:'https://img.dpm.org.cn/Uploads/Picture/dc/8350.jpg',fit:WEIYU_FIT.status,currentAdmissionVerified:false,wholeInteriorAccepted:false,westernPartitionPresentBy:{sourceDate:'嘉庆四年七月初八日',calendar:'QING_LUNISOLAR',reignYearGregorianLabel:1799,gregorianDate:null},eastCircularOpeningDate:null,sourceSupported:['named eastern annex, distinct west rectangular passage and east circular opening','connected eastern side hall beyond circular opening'],gameFit:['all dimensions, compressed annex/side-hall footprint and unseen roof details','four existing main leaves opened inward for game access, not a claim of historical open state','visible low 0.2m round-opening step for full-body game clearance, not a surveyed threshold','limited circulation partitions, no complete maze or furnishings'],rooms:1};f.userData.structure=meta;
 return{frame:f,meta};
}
