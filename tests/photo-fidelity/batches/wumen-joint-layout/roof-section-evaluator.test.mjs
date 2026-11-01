import test from 'node:test';
import assert from 'node:assert/strict';
import {createUpperReassemblyContract} from '../../../../scripts/photo-fidelity/batches/wumen-joint-layout/upper-contract.mjs';
import {createRoofSection} from '../../../../scripts/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.mjs';
const C=createUpperReassemblyContract();
const pairs=C.roofKnots.instances.flatMap(i=>(i.kind==='pavilion'?['lower','upper']:['single']).map(layer=>({i,layer,r:C.roofRecipe[layer==='lower'?'pavilionLower':layer==='upper'?'pavilionUpper':'wingSingle']})));
const near=(a,b,e=1e-12)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
// Independent canonical oracle: no section method participates in expected positions/Y/UV.
function oracleY(r,t){return r.eaveY+r.H*(r.profileCoefficient*(1-t)+(1-r.profileCoefficient)*(1-t)*(1-t));}
function oracleRing(i,layer,t,mode='proposal'){
 const k=i[layer],r=C.roofRecipe[layer==='lower'?'pavilionLower':layer==='upper'?'pavilionUpper':'wingSingle'];
 const src=layer==='lower'?[k.oldSkirtKnotsInnerBearingEave,k.oldSkirtKnotsInnerBearingEave]:k.knotsPerAxis.old;
 const dst=mode==='predecessor'?src:layer==='lower'?k.newSkirtKnotsInnerBearingEave:k.knotsPerAxis.proposal;
 const xy=layer==='lower'?src.map(a=>a[0]*(1-t)+a.at(-1)*t):layer==='upper'?src.map(a=>a.at(-1)*t):[r.ridgeHalf+(src[0].at(-1)-r.ridgeHalf)*t,src[1].at(-1)*t];
 const h=xy.map((x,axis)=>{const a=src[axis],b=dst[axis];let n=a.findIndex(v=>v>=x);if(n<0)n=a.length-1;if(n===0)return b[0];const f=(x-a[n-1])/(a[n]-a[n-1]);return (1-f)*b[n-1]+f*b[n];});
 return [[-h[0],-h[1]],[h[0],-h[1]],[h[0],h[1]],[-h[0],h[1]]];
}
test('all ten sections preserve pinned no-lift Y anchors and exact stored horizontal knots',()=>{assert.equal(pairs.length,10);for(const {i,layer,r} of pairs)for(const mode of ['predecessor','proposal']){const q=createRoofSection(i.id,layer,mode);for(const a of r.anchors)assert.equal(q.baseY(a.t),a.baseY);const k=i[layer],foot=layer==='lower'?(mode==='predecessor'?k.oldFootprintHalf:k.newFootprintHalf):k[mode==='predecessor'?'old':'proposal'].footprintHalf;assert.deepEqual(q.ring(r.tw)[2],foot);assert.equal(q.accepted,false);assert.equal(q.runtimeInstalled,false);assert.equal(q.recipe,r);if(layer==='single')assert.equal(q.ring(0)[2][0],k.ridgeHalf[mode==='predecessor'?'old':'proposal']);}});
test('actual sampling retains original counts and inserts one common exact bearing parameter',()=>{for(const {i,layer,r} of pairs){const q=createRoofSection(i.id,layer,'proposal');const tile=q.sampleT('tile'),soffit=q.sampleT('soffit'),arc=q.sampleT('arc');assert.ok(tile.includes(r.tw));assert.equal(soffit[0],r.tw);assert.equal(soffit.length,layer==='lower'?4:3);for(let j=0;j<=r.sampleCounts.nT;j++)assert.ok(tile.includes(j/r.sampleCounts.nT));for(let j=0;j<=64;j++)assert.ok(arc.includes(j/64));assert.ok(arc.includes(r.tw));for(const a of [tile,soffit,arc])for(let j=1;j<a.length;j++)assert.ok(a[j]>a[j-1]);}});
test('mapped corners then interpolation preserve face directions and no-lift versus lift separation',()=>{for(const {i,layer,r} of pairs){const q=createRoofSection(i.id,layer,'proposal');for(const t of [0,r.tw,.91,1])for(let f=0;f<4;f++){const ring=q.ring(t),a=ring[f],b=ring[(f+1)%4],s=.37,p=q.point(f,t,s,{lift:false});near(p[0],a[0]+(b[0]-a[0])*s);near(p[2],a[1]+(b[1]-a[1])*s);assert.equal(p[1],q.baseY(t));}for(let f=0;f<4;f++){assert.deepEqual(q.point(f,r.tw,0),q.point(f,r.tw,0,{lift:false}));near(q.point(f,1,0)[1]-q.baseY(1),r.lift.L);}}});
test('UV uses original centred no-lift tangent projection and nonuniform mapped arc table',()=>{for(const {i,layer,r} of pairs){const q=createRoofSection(i.id,layer,'proposal');for(let f=0;f<4;f++){const e=oracleRing(i,layer,1),a=e[f],b=e[(f+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]),T=[(b[0]-a[0])/len,(b[1]-a[1])/len],N=[T[1],-T[0]],ts=q.sampleT('arc'),cum=[0];let prev;for(let j=0;j<ts.length;j++){const ring=oracleRing(i,layer,ts[j]),u=ring[f],v=ring[(f+1)%4],z=[((u[0]+v[0])*N[0]+(u[1]+v[1])*N[1])/2,oracleY(r,ts[j])];if(j)cum.push(cum[j-1]+Math.hypot(z[0]-prev[0],z[1]-prev[1]));prev=z;}for(const t of [r.tw,.80123,1]){let j=Math.min(ts.length-2,ts.findIndex(v=>v>=t)-1);if(j<0)j=0;const value=cum[j]+(cum[j+1]-cum[j])*(t-ts[j])/(ts[j+1]-ts[j]);const R=oracleRing(i,layer,t),A=R[f],B=R[(f+1)%4],p=[A[0]+(B[0]-A[0])*.23,oracleY(r,t),A[1]+(B[1]-A[1])*.23],uv=q.uv(f,t,.23,2.7);near(uv[0],(p[0]*T[0]+p[2]*T[1])/2.7);near(uv[1],(cum.at(-1)-value)/2.7);assert.deepEqual(q.uv(f,t,.23,1).map(x=>x/2.7),uv);}}}});
test('fascia V retains explicitly legacy convention distinct from actual total height',()=>{for(const {i,layer,r}of pairs){const q=createRoofSection(i.id,layer,'proposal');near(q.fasciaUV(0,.4,1,2)[1],1.5*r.thickness/2);assert.notEqual(q.fasciaUV(0,.4,1,2)[1],(.03+1.5*r.thickness)/2);assert.equal(q.fasciaUV(0,.4,0,2)[1],0);}});
test('closed input domains fail before evaluation and mutable results cannot poison future calls',()=>{const {i,layer}=pairs[0],q=createRoofSection(i.id,layer,'proposal');for(const args of [['unknown',layer,'proposal'],[i.id,'single','proposal'],[i.id,layer,'unknown']])assert.throws(()=>createRoofSection(...args));for(const x of [-.1,1.1,NaN,Infinity,undefined,'0']){assert.throws(()=>q.ring(x));assert.throws(()=>q.baseY(x));assert.throws(()=>q.point(0,.5,x));assert.throws(()=>q.fasciaUV(0,.5,x,1));}for(const f of [-1,4,.5,NaN,'0'])assert.throws(()=>q.point(f,.5,.5));for(const v of [0,-1,NaN,Infinity,undefined,'1'])assert.throws(()=>q.uv(0,.5,.5,v));assert.throws(()=>q.sampleT('other'));assert.throws(()=>q.point(0,.5,.5,{lift:'yes'}));const expected=q.ring(1);q.ring(1)[0][0]=99;q.sampleT('tile').push(.999);assert.deepEqual(q.ring(1),expected);assert.ok(!q.sampleT('tile').includes(.999));assert.equal(Object.isFrozen(q),true);});

test('independent canonical oracle locks non-anchor profile and all inner ridge bearing eave maps',()=>{for(const {i,layer,r}of pairs)for(const mode of ['predecessor','proposal']){const q=createRoofSection(i.id,layer,mode);for(const t of [0,.17,.37,r.tw,.67,.91,1]){near(q.baseY(t),oracleY(r,t),1e-14);const expected=oracleRing(i,layer,t,mode),actual=q.ring(t);for(let f=0;f<4;f++)for(let axis=0;axis<2;axis++)near(actual[f][axis],expected[f][axis],2e-14);}}});
test('route authority remains false',()=>{for(const {i,layer}of pairs)assert.equal(createRoofSection(i.id,layer,'proposal').routeAccepted,false);});
test('representationally overflowing UV is rejected',()=>{for(const {i,layer}of pairs){const q=createRoofSection(i.id,layer,'proposal');assert.throws(()=>q.uv(0,.5,.23,Number.MIN_VALUE),/finite/);assert.throws(()=>q.fasciaUV(0,.5,1,Number.MIN_VALUE),/finite/);}});
test('independent interior lift XYZ locks fixed L O D exponent and both corner influence branches',()=>{
 let interiorCases=0;
 for(const {i,layer,r}of pairs)for(const mode of ['predecessor','proposal']){
  const q=createRoofSection(i.id,layer,mode);
  for(const progress of [.2,.6,.9]){const t=r.tw+(1-r.tw)*progress,R=oracleRing(i,layer,t,mode);
   for(let f=0;f<4;f++){const A=R[f],B=R[(f+1)%4],len=Math.hypot(B[0]-A[0],B[1]-A[1]);
    for(const fraction of [.2,.7,1.3])for(const end of [0,1]){const d=Math.min(.49,r.lift.D*fraction/len),s=end?1-d:d,corner=end?B:A,weight=(1-Math.min(Math.min(s,1-s)*len/r.lift.D,1))**2*((t-r.tw)/(1-r.tw))**1.6;
     const expected=[A[0]+(B[0]-A[0])*s+Math.sign(corner[0])/Math.sqrt(2)*r.lift.O*weight,oracleY(r,t)+r.lift.L*weight,A[1]+(B[1]-A[1])*s+Math.sign(corner[1])/Math.sqrt(2)*r.lift.O*weight],actual=q.point(f,t,s);
     for(let axis=0;axis<3;axis++)near(actual[axis],expected[axis],3e-14);if(weight>0&&weight<1)interiorCases++;
    }
   }
  }
 }
 assert.ok(interiorCases>100);
});
test('soffit intermediate parameters exactly retain the independently derived original rs lattice',()=>{for(const {i,layer,r}of pairs){const q=createRoofSection(i.id,layer,'proposal'),rs=Math.max(2,Math.round(r.sampleCounts.nT*(1-r.tw)*1.5)),expected=[];for(let j=0;j<=rs;j++)expected.push(j===0?r.tw:j===rs?1:r.tw+(1-r.tw)*(j/rs));assert.deepEqual(q.sampleT('soffit'),expected);}});
