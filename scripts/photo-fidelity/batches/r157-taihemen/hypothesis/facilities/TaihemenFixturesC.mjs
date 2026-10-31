// Own-source coarse class-form candidates, NOT individual artifact replicas.
// No box contents, invented missing dragon, walkable pavilion, or lion proxy.
import * as T from'three';
import{withTaihemenCandidateTransaction}from'./TaihemenCandidateTransaction.mjs';
function removeAxisDegenerates(geo){const a=geo.attributes.position,ix=geo.index,n=ix?.count??a.count,keep=[];for(let i=0;i<n;i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k),v=ids.map(j=>new T.Vector3().fromBufferAttribute(a,j));if(new T.Vector3().crossVectors(v[1].clone().sub(v[0]),v[2].clone().sub(v[0])).length()>1e-10)keep.push(...ids);}if(keep.length!==n)geo.setIndex(keep);return geo;}
function hipRoof(){const rows=[[.78,.60,2.79,.07],[.73,.55,2.85,.04],[.30,.09,3.32,.01],[.23,.025,3.44,0]],points=[],ix=[];for(const[w,d,y,curl]of rows)for(const[x,z]of[[-w,-d],[0,-d],[w,-d],[w,0],[w,d],[0,d],[-w,d],[-w,0]])points.push(x,y+(x&&z?curl:0),z);for(let r=0;r<rows.length-1;r++)for(let i=0;i<8;i++){const a=r*8+i,b=r*8+(i+1)%8,c=(r+1)*8+(i+1)%8,d=(r+1)*8+i;ix.push(a,c,b,a,d,c);}const bottom=points.length/3;points.push(0,2.79,0);const top=points.length/3;points.push(0,3.44,0);for(let i=0;i<8;i++){ix.push(bottom,i,(i+1)%8);ix.push(top,24+(i+1)%8,24+i);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(ix);g.computeVertexNormals();return g;}
export function validateTaihemenFixturesC(builder,parent,p){
 const wanted=['censer','censer','censer','censer','stone-box','stone-pavilion'];
 if(p?.candidateStatus!=='ISOLATED_C_SOURCE_FIT_NOT_SURVEY'||parent?.name!=='太和门'||p.fixtures?.length!==6||!Array.isArray(p.fixtureIds)||p.fixtureIds.length!==6||new Set(p.fixtureIds).size!==6||p.fixtures.some((f,i)=>![f?.x,f?.z].every(Number.isFinite)||f.type!==wanted[i]||f.id!==p.fixtureIds[i]||f.accepted!==false))throw Error('Taihemen fixtures C invalid source/host/type');
 if(parent.children.some(c=>p.fixtureIds.includes(c.userData.structure?.id))||parent.userData.architecture?.some(c=>p.fixtureIds.includes(c.id)))throw Error('Taihemen fixtures C duplicate build');
 if(!builder?.library||typeof builder.col!=='function'||typeof builder.ownMat!=='function')throw Error('Taihemen fixtures C invalid builder');
}
export function buildTaihemenFixturesC(builder,parent,p){validateTaihemenFixturesC(builder,parent,p);return withTaihemenCandidateTransaction(builder,parent,p,()=>buildFixtures(builder,parent,p));}
function buildFixtures(builder,parent,p){
 const stone=builder.library.material('marble'),bronze=builder.ownMat('taihemen-c-censer-bronze',{name:'taihemen-c-censer-bronze',color:0x3d5c50,metalness:.6,roughness:.64}),dark=builder.ownMat('taihemen-c-censer-dark',{name:'taihemen-c-censer-dark',color:0x293f36,metalness:.55,roughness:.68});
 for(const f of p.fixtures){const g=new T.Group();g.name=f.id;g.position.set(f.x,0,f.z);g.userData.structure={id:f.id,entityId:'FC-B3B12CF397',profile:f};parent.add(g);
 const put=(geo,mat,x=0,y=0,z=0,role='class-form')=>{const m=new T.Mesh(removeAxisDegenerates(geo),mat);m.position.set(x,y,z);m.name=f.id+':'+role;m.castShadow=m.receiveShadow=true;m.userData.fixturePart={id:f.id,role,accepted:false};g.add(m);return m;};
 const box=(w,h,d,x,y,z,role='stone-mass')=>put(new T.BoxGeometry(w,h,d),stone,x,y,z,role);
 const block=(w,h,d,x,y,z)=>{builder.col(f.x+x-w/2,y-h/2,f.z+z-d/2,f.x+x+w/2,y+h/2,f.z+z+d/2);};
 const lathe=(points,mat,y,role,segments=20)=>put(new T.LatheGeometry(points.map(([r,h])=>new T.Vector2(r,h)),segments),mat,0,y,0,role);
 if(f.type==='censer'){
  // A6-pier support proxy resolves the observed front openings; exact count/
  // rear carving is unknown, not asserted by this fitted repeat.
  lathe([[0,0],[.49,0],[.55,.025],[.55,.07],[.50,.09],[0,.09]],stone,0,'stone-bottom-ring');
  lathe([[0,0],[.50,0],[.54,.035],[.54,.08],[.48,.10],[0,.10]],stone,.30,'stone-top-ring');
  for(let i=0;i<6;i++){const a=i*Math.PI/3;box(.12,.23,.13,Math.sin(a)*.44,.195,Math.cos(a)*.44,'pier-count-proxy-not-source-count');}
  const body=put(new T.SphereGeometry(1,20,10),bronze,0,1.05,0,'round-belly');body.scale.set(.43,.30,.43);
  for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3,x=Math.cos(a)*.29,z=Math.sin(a)*.29;const m=lathe([[0,0],[.085,0],[.105,.035],[.075,.13],[.07,.23],[.10,.42],[.135,.52],[0,.52]],bronze,.40,'tripod-leg',12);m.position.x=x;m.position.z=z;put(new T.TorusGeometry(.087,.013,5,12),bronze,x,.48,z,'foot-ring').rotation.x=Math.PI/2;}
  lathe([[0,0],[.31,0],[.34,.04],[.34,.12],[.30,.13],[0,.13]],dark,1.25,'neck-frieze');
  put(new T.CylinderGeometry(.30,.30,.27,20),bronze,0,1.505,0,'upper-drum');
  lathe([[0,0],[.30,0],[.44,.02],[.46,.04],[.36,.085],[.23,.10],[0,.10]],bronze,1.61,'lower-flared-circular-cover');
  // Explicit coarse vents,not a claim to exact observed fretwork count.
  for(let i=0;i<16;i++){const a=i*Math.PI/8;const m=put(new T.BoxGeometry(.035,.17,.045),dark,Math.sin(a)*.26,1.80,Math.cos(a)*.26,'vent-upright-proxy');m.rotation.y=a;}
  lathe([[0,0],[.25,0],[.38,.02],[.40,.045],[.30,.085],[.16,.10],[0,.10]],bronze,1.88,'upper-flared-circular-cover');
  const knob=put(new T.SphereGeometry(.085,12,8),bronze,0,2.035,0,'top-knob');knob.scale.y=1.1;
  for(const side of[-1,1]){const ear=new T.Shape();ear.moveTo(side*.33,1.04);ear.bezierCurveTo(side*.5,1.04,side*.47,1.22,side*.47,1.33);ear.bezierCurveTo(side*.46,1.46,side*.55,1.62,side*.61,1.64);ear.lineTo(side*.64,1.53);ear.bezierCurveTo(side*.58,1.51,side*.57,1.39,side*.58,1.30);ear.bezierCurveTo(side*.60,1.12,side*.56,1.02,side*.43,.98);ear.closePath();const geo=new T.ExtrudeGeometry(ear,{depth:.055,bevelEnabled:false,curveSegments:8,steps:1});geo.translate(0,0,-.0275);put(geo,bronze,0,0,0,'flat-curved-ear-section-fit');}
  f.modelHeight=2.1285;f.modelRadius=.64;f.shapeStatus='ONE_OWN_OBSERVED_CLASS_FORM_REPEAT_NOT4_INDIVIDUAL_CARVING_REPLICAS';f.unknown=['Which4 close-photo instance','Exact vents/pier count,rear,fine carving and ear section','Metric censer height/width'];block(1.28,2.13,1.12,0,1.065,0);
 }else if(f.type==='stone-box'){
  box(1.33,.13,1.33,0,.065,0,'plain-base-cloud-carving-unreproduced');box(1.23,.70,1.23,0,.48,0,'closed-box-no-contents');box(1.23,.15,1.23,0,.905,0,'separate-lid');
  const lid=new T.BoxGeometry(1.23,.075,1.23),a=lid.attributes.position;for(let i=0;i<a.count;i++)if(a.getY(i)>0){a.setX(i,a.getX(i)*1.13/1.23);a.setZ(i,a.getZ(i)*1.13/1.23);}lid.computeVertexNormals();put(lid,stone,0,1.0175,0,'lid-bevel-fit');
  const s=new T.Shape();s.absellipse(0,.11,.35,.11,0,Math.PI*2,false);const hole=new T.Path();hole.absellipse(0,.05,.0225,.0225,0,Math.PI*2,true);s.holes.push(hole);const geo=new T.ExtrudeGeometry(s,{depth:.62,bevelEnabled:false,curveSegments:20,steps:1});geo.translate(0,0,-.31);geo.rotateY(Math.PI/2);put(geo,stone,0,1.055,0,'low-weathered-knob-mass-through-hole-NOT-dragon-replica');
  f.modelHeight=1.275;f.modelRadius=.665;f.shapeStatus='OLD_DIMENSION_BOUND_CLOSED_MASS_LOW_KNOB_HOLE_FINE_DRAGON_CLOUD_RELIEF_UNREPRODUCED';f.boxContentsBuilt=false;f.unknown=['Exact coiled-dragon/cloud surface','Footprint depth fit,not separately measured','2026 survey'];block(1.33,1.055,1.33,0,.5275,0);
 }else if(f.type==='stone-pavilion'){
  for(const[w,h,d,y]of[[1.60,.18,1.60,.09],[1.35,.18,1.35,.27],[1.15,.15,1.15,.435],[.82,.70,.82,.86],[1.24,.13,1.24,1.275],[1.30,.18,1.15,1.43],[1.10,.13,.90,1.585]]){box(w,h,d,0,y,0,'pedestal-mass');block(w,h,d,0,y,0);}
  for(const z of[-1.28,-.96]){const h=z< -1?.18:.36;box(.85,h,.34,0,h/2,z,'independent-south-step');block(.85,h,.34,0,h/2,z);}
  for(const x of[-.37,.37])for(const z of[-.30,.30]){put(new T.CylinderGeometry(.075,.075,1,8),stone,x,2.15,z,'octagonal-stone-post');block(.15,1,.15,x,2.15,z);}
  for(const x of[-.40,.40]){box(.08,1,.60,x,2.15,0,'closed-east-west-panel');block(.08,1,.60,x,2.15,0);}
  for(const x of[-.285,.285])for(const z of[-.30,.30]){box(.23,1,.08,x,2.15,z,'closed-front-rear-flank-panel');block(.23,1,.08,x,2.15,z);}
  f.openingWidth=.34;f.frontBodyWidth=.89;
  for(const y of[1.6675,2.6325])for(const z of[-.10,.10])box(.64,.035,.15,0,y,z,'two-observed-slot-banks');
  box(1.17,.14,.84,0,2.72,0,'stone-entablature');block(1.17,.14,.84,0,2.72,0);put(hipRoof(),stone,0,0,0,'small-hip-roof-fit');box(.50,.05,.05,0,3.465,0,'ridge-fit');
  f.modelHeight=3.49;f.modelRadius=.8;f.shapeStatus='SMALL_STONE_FIXTURE_EW_CLOSED_NS_NARROW_OPENING_WITH_FLANK_PANELS_TWO_SLOTS_TWO_SOUTH_STEPS_NOT_ENTERABLE_HALL';f.unknown=['Exact bracket/ridge/relief profiles','Metric subdivision from approximate3.5m total','Current access'];
 }else throw Error('Taihemen fixture unsupported type');
 f.groundY=0;f.newWalkables=0;f.accepted=false;
 }
}
