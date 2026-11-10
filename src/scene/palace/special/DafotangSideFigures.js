import * as T from 'three';

const SUBJECTS=new Set(['amitabha','bhaisajyaguru']);
/** Independently generated side figures, not copies of the central photograph-
 * guided model. Hands, face, drapery and back are explicit user-directed fits.
 * The caller owns the borrowed materials; this component owns geometry only. */
export function createDafotangSideFigure({subjectId,materials}={}){
 if(!SUBJECTS.has(subjectId)||!['gold','red','dark'].every(k=>materials?.[k]?.isMaterial))throw Error('Named side subject and three borrowed materials required');
 const medicine=subjectId==='bhaisajyaguru',group=new T.Group(),meshes=[],owned=new Set();let disposed=false;
 group.name='dafotang-'+subjectId+'-yuan-style-fit';
 const keep=g=>(owned.add(g),g);
 function clean(g){const p=g.attributes.position,ix=g.index,out=[];for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k),v=ids.map(n=>new T.Vector3().fromBufferAttribute(p,n));if(new T.Triangle(...v).getArea()>1e-12)out.push(...ids)}g.setIndex(out);g.computeVertexNormals();g.computeBoundingBox();return g;}
 function add(role,g,material=materials.gold,part='figure'){keep(g);const m=new T.Mesh(clean(g),material);m.name=group.name+'/'+role;m.userData={subjectId,role,part,detailStatus:'USER_DESIGN_FIT_NOT_VERIFIED_ARTIFACT_DETAIL'};m.castShadow=m.receiveShadow=true;group.add(m);meshes.push(m);return m;}
 function oval(role,p,s,mat=materials.gold,rot=0,seg=20,rings=12,part='figure'){const g=keep(new T.SphereGeometry(1,seg,rings));g.scale(...s).rotateZ(rot).translate(...p);return add(role,g,mat,part);}
 function tube(role,points,radius,mat=materials.gold){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),g=keep(new T.TubeGeometry(path,18,1,8,false)),p=g.attributes.position;for(let j=0;j<=18;j++){const t=j/18,c=path.getPointAt(t),r=typeof radius==='function'?radius(t):radius;for(let k=0;k<=8;k++){const i=j*9+k,v=new T.Vector3().fromBufferAttribute(p,i).sub(c).multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z)}}const a=Array.from(p.array),ix=Array.from(g.index.array);for(const j of[0,18]){const c=path.getPointAt(j/18),id=a.length/3;a.push(...c.toArray());for(let k=0;k<8;k++){let b=j*9+k,d=j*9+k+1;const normal=new T.Triangle(c,new T.Vector3(...a.slice(b*3,b*3+3)),new T.Vector3(...a.slice(d*3,d*3+3))).getNormal(new T.Vector3());if(normal.dot(path.getTangentAt(j/18))*(j===0?-1:1)<0)[b,d]=[d,b];ix.push(id,b,d)}}for(const k of Object.keys(g.attributes))g.deleteAttribute(k);g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setIndex(ix);return add(role,g,mat);}
 function loft(role,knots){const curve=new T.CatmullRomCurve3(knots.map(([y,rx,rz])=>new T.Vector3(y,rx,rz)));const rows=Array.from({length:28},(_,i)=>[...curve.getPoint(i/27).toArray(),.035]);const v=[],ix=[],n=24;for(const[y,rx,rz,z]of rows)for(let k=0;k<n;k++){const a=k*2*Math.PI/n;v.push(rx*Math.sin(a),y,z+rz*Math.cos(a))}for(let j=0;j<rows.length-1;j++)for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ix.push(a,b,a+n,b,b+n,a+n)}for(const j of[0,rows.length-1]){const c=v.length/3;v.push(0,rows[j][0],rows[j][3]);for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ix.push(c,...(j===0?[b,a]:[a,b]))}}const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);return add(role,g);}
 function petal(tier,k,count,r,y){const angle=2*Math.PI*(k+(tier%2)*.5)/count,v=[],ix=[],rings=5,sides=8;for(let j=0;j<=rings;j++){const t=j/rings,s=Math.sin(Math.PI*t),w=.085*Math.pow(s,.7)*(1.1-.3*t);for(let q=0;q<sides;q++){const a=q*2*Math.PI/sides,rad=r+.028*s+.030*s*Math.sin(a),across=w*Math.cos(a);v.push(rad*Math.sin(angle)+across*Math.cos(angle),y+.18*t,rad*.94*Math.cos(angle)-across*Math.sin(angle))}}for(let j=0;j<rings;j++)for(let q=0;q<sides;q++){const a=j*sides+q,b=j*sides+(q+1)%sides;ix.push(a,a+sides,b,b,a+sides,b+sides)}const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);return add('lotus-tier-'+tier+'-petal-'+k,g,materials.gold,'lotus');}
 try{
  // High rounded lotus family. Petal count/profile are fits; no unknown motif.
  oval('curled-lotus-foot',[0,.065,0],[.49,.065,.43],materials.gold,0,24,10,'lotus');
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval('lotus-base-leaf-'+i,[.28*Math.sin(a),.07,.26*Math.cos(a)],[.22,.035,.18],materials.gold,.13*Math.sin(a),16,8,'lotus')}
  const profile=[[0,.09],[.30,.09],[.37,.18],[.48,.34],[.58,.55],[.64,.73],[.64,.82],[.57,.87],[0,.87]].map(([r,y])=>new T.Vector2(r,y));const core=keep(new T.LatheGeometry(profile,32));core.scale(1,1,.94);add('rounded-lotus-core',core,materials.gold,'lotus');
  const radii=[.37,.44,.52,.59,.64,.67,.68,.66];for(let j=0;j<8;j++)for(let k=0;k<20;k++)petal(j+1,k,20,radii[j],.07+j*.095);
  oval('lotus-seat',[0,.85,0],[.65,.055,.55],materials.gold,0,24,10,'lotus');
  // Independent torso profiles: fuller symmetric meditation drape versus the
  // narrower, asymmetric bowl-bearing robe. No central figure geometry reused.
  loft(medicine?'medicine-robe-body':'meditation-robe-body',medicine?[[.99,.31,.22,.02],[1.13,.32,.23,.03],[1.34,.30,.20,.045],[1.52,.35,.21,.04],[1.66,.36,.19,.04],[1.73,.32,.175,.035],[1.78,.235,.15,.03],[1.80,.17,.13,.025]]:[[.99,.35,.23,.02],[1.14,.36,.24,.025],[1.34,.33,.23,.035],[1.53,.37,.23,.04],[1.65,.40,.21,.04],[1.73,.35,.19,.035],[1.78,.245,.16,.03],[1.80,.17,.14,.025]]);
  oval('left-crossed-knee',[-.34,.99,-.075],[.30,.15,.28],materials.gold,-.10);oval('right-crossed-knee',[.34,.98,-.06],[.30,.15,.27],materials.gold,.11);
  oval(medicine?'medicine-folded-shin':'meditation-folded-shin',[medicine?.05:-.03,1.065,-.25],[.42,.105,.14],materials.gold,medicine?-.10:.08);
  oval('visible-folded-foot',[medicine?-.22:.23,1.13,-.245],[.16,.065,.11],materials.gold,medicine?.1:-.1,16,10);
  const left=medicine?[[-.24,1.68,.025],[-.36,1.47,-.01],[-.34,1.28,-.15],[-.20,1.18,-.31]]:[[-.24,1.68,.025],[-.39,1.45,0],[-.33,1.24,-.17],[-.14,1.14,-.34]];
  const right=medicine?[[.24,1.67,.02],[.35,1.45,-.015],[.36,1.25,-.16],[.34,1.08,-.34]]:[[.24,1.68,.025],[.39,1.44,.01],[.34,1.22,-.16],[.11,1.12,-.34]];
  for(const[side,points]of[['left',left],['right',right]]){tube(side+'-draped-sleeve',points,t=>.10+.025*Math.sin(Math.PI*t)-.028*t*t);for(let k=0;k<2;k++){const fold=points.map((p,i)=>[p[0]+(k?-.018:.018),p[1]-.01,p[2]-.083+(i===3?.025:0)]);tube(side+'-sleeve-fold-'+k,fold,.006,materials.red)}}
  if(medicine){
   oval('bowl-supporting-left-palm',[-.13,1.17,-.35],[.13,.035,.085]);
   const p=[[0,0],[.07,0],[.115,.045],[.14,.13],[.14,.145],[.122,.145],[.106,.055],[.065,.022],[0,.022]].map(([r,y])=>new T.Vector2(r,y)),bowl=keep(new T.LatheGeometry(p,24));bowl.translate(-.13,1.19,-.35);add('medicine-bowl',bowl);
   oval('relaxed-knee-palm',[.33,1.045,-.37],[.08,.105,.038],materials.gold,-.12,16,10);oval('right-knee-thumb',[.397,1.08,-.355],[.022,.048,.026],materials.gold,-.2,12,8);
  }else{
   oval('meditation-lower-palm',[-.025,1.12,-.36],[.15,.035,.09]);oval('meditation-upper-palm',[.015,1.18,-.365],[.14,.032,.085]);
   oval('meditation-left-thumb',[-.055,1.215,-.35],[.045,.018,.026],materials.gold,-.12,12,8);oval('meditation-right-thumb',[.047,1.213,-.35],[.043,.018,.026],materials.gold,.12,12,8);
  }
  const foldCount=medicine?4:5;for(let k=0;k<foldCount;k++){const skew=medicine?.025*k:-.018*k;tube((medicine?'medicine':'meditation')+'-leg-fold-'+k,[[-.51+.045*k,1.035,-.26],[-.25+.045*k,1.11+skew,-.35],[.13+.04*k,1.04,-.385],[.44+.015*k,1.02,-.25]],.006,materials.red)}
  for(const side of[-1,1])tube('robe-edge-'+side,[[side*.12,1.79,-.07],[side*(medicine?.20:.23),1.64,-.16],[side*.23,1.44,-.20],[side*.23,1.24,-.23]],.012,materials.gold);
  oval('neck',[0,1.84,.025],[.10,.085,.09]);const face=medicine?[.159,.193,.137]:[.174,.18,.145];oval(medicine?'longer-medicine-face':'rounded-meditation-face',[0,2.025,0],face,materials.gold,0,28,18);
  for(const side of[-1,1]){oval('long-ear-'+side,[side*(face[0]-.004),1.995,.015],[.034,.108,.032],materials.gold,side*.07,16,10);oval('ear-recess-'+side,[side*(face[0]+.004),2.015,-.014],[.009,.041,.005],materials.red,side*.07,12,8);tube('lowered-eye-'+side,[[side*.032,2.047,-.142],[side*.075,2.043,-.137],[side*.111,2.052,-.112]],.0024,materials.dark);tube('shallow-brow-'+side,[[side*.027,2.077,-.136],[side*.077,2.083,-.126],[side*.117,2.067,-.099]],.003,materials.red)}
  oval('integrated-nose',[0,2.026,-.137],[.019,.043,.022],materials.gold,0,16,10);tube('quiet-lips',[[-.041,1.968,-.135],[0,1.963,-.148],[.041,1.968,-.135]],.003,materials.red);
  // Closed low hair crown; curl relief is fitted, not historical hair counts.
  oval('low-rounded-hair',[0,2.115,.017],[face[0]+.008,.13,.151],materials.dark,0,24,14);
  for(let row=0;row<4;row++){const theta=.17+row*.33,count=row?12:8;for(let k=0;k<count;k++){const a=2*Math.PI*(k+(row%2)*.5)/count;oval('hair-curl-'+row+'-'+k,[(face[0]+.008)*Math.sin(theta)*Math.sin(a),2.115+.13*Math.cos(theta),.017+.151*Math.sin(theta)*Math.cos(a)],[.015,.010,.015],materials.dark,0,8,6)}}
  let low=Infinity,high=-Infinity;for(const m of meshes){low=Math.min(low,m.geometry.boundingBox.min.y);high=Math.max(high,m.geometry.boundingBox.max.y)}const scale=2.25/(high-low);for(const m of meshes){m.geometry.translate(0,-low,0).scale(scale,scale,scale);m.geometry.computeBoundingBox()}
  const bounds=new T.Box3().setFromObject(group),size=bounds.getSize(new T.Vector3());if(size.x>=1.55||size.z>=1.55)throw Error('Side figure exceeds fitted bay reserve');
  const metadata={id:group.name,subjectId,style:'YUAN_INSPIRED_GOLD_BODY',styleOrigin:'USER_DESIGN_BRIEF',dateAttribution:'NOT_RESOLVED_BY_THIS_DESIGN',artifactHandsVerified:false,photographicReplica:false,hasSquareDais:false,figureAndLotusHeight:2.25,lotusPetalTiers:8,fitStatus:'USER_DESIGN_FIT_NOT_SURVEY',gesture:medicine?'FITTED_LEFT_BOWL_AND_RELAXED_RIGHT_KNEE_HAND':'FITTED_HANDS_GATHERED_IN_LAP',front:'LOCAL_NEGATIVE_Z',unknown:['target artifact hand details','back','fine textile carving','exact facial proportions'],geometryStatus:'DETACHED_COMPONENT_PENDING_VISUAL_AND_HOST_ACCEPTANCE'};group.userData.dafotangSideFigure=metadata;
  return{group,meshes,metadata,dispose(){if(disposed)return;disposed=true;for(const g of owned)g.dispose();group.removeFromParent()}};
 }catch(error){for(const g of owned)g.dispose();throw error;}
}
