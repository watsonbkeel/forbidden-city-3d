import fs from 'node:fs';
import assert from 'node:assert/strict';
import {footprintCovered,pathFootprintCovered} from '../r157-wumen-joint-layout-1622/scripts/photo-fidelity/batches/wumen-joint-layout/footprint-coverage.mjs';
// Independent complement-cell oracle, exact rational time intervals on a half-unit integer lattice.
const frac=(n,d=1)=>{n=BigInt(n);d=BigInt(d);return d<0n?[-n,-d]:[n,d]};
const cmp=(a,b)=>{const v=a[0]*b[1]-b[0]*a[1];return v<0n?-1:v>0n?1:0};
function crossesOpenCell(a,b,r,c){
 let lo=frac(0),hi=frac(1);const constraints=[];
 for(let k=0;k<2;k++){
  const start=a[k],delta=b[k]-start,low=c[k*2]-r,high=c[k*2+1]+r;
  constraints.push([start,delta,low,high]);
  if(!delta){if(!(start>low&&start<high))return false;continue;}
  let left=frac(low-start,delta),right=frac(high-start,delta);if(cmp(left,right)>0)[left,right]=[right,left];
  if(cmp(left,lo)>0)lo=left;if(cmp(right,hi)<0)hi=right;
 }
 if(cmp(lo,hi)<0)return true;if(cmp(lo,hi)>0)return false;
 return constraints.every(([s,d,l,h])=>{const v=BigInt(s)*lo[1]+BigInt(d)*lo[0];return v>BigInt(l)*lo[1]&&v<BigInt(h)*lo[1]});
}
function oracle(rs,a,b,r){
 const domain=[Math.min(a[0],b[0])-r,Math.max(a[0],b[0])+r,Math.min(a[1],b[1])-r,Math.max(a[1],b[1])+r];
 const cuts=k=>[...new Set([domain[k],domain[k+1],...rs.flatMap(q=>[q[k],q[k+1]]).filter(v=>v>domain[k]&&v<domain[k+1])])].sort((a,b)=>a-b);
 const xs=cuts(0),zs=cuts(2);
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
  const x=xs[i]+xs[i-1],z=zs[j]+zs[j-1];
  if(rs.some(q=>q[0]*2<x&&q[1]*2>x&&q[2]*2<z&&q[3]*2>z))continue;
  if(crossesOpenCell(a,b,r,[xs[i-1],xs[i],zs[j-1],zs[j]]))return false;
 }
 return true;
}
const world=rs=>rs.map(q=>({minX:q[0]/2,maxX:q[1]/2,minZ:q[2]/2,maxZ:q[3]/2}));
let pointChecks=0,pathChecks=0;const mismatches=[];
const paths=[[[1,1],[5,5]],[[1,5],[5,1]],[[1,3],[5,3]],[[3,1],[3,5]],[[1,1],[5,3]],[[1,3],[5,5]],[[1,5],[3,1]],[[1,1],[1,1]],[[0,0],[6,6]],[[2,2],[4,4]],[[1,1],[3,5]],[[5,1],[1,3]]];
for(let mask=0;mask<512;mask++){
 const rs=[];for(let i=0;i<9;i++)if(mask&(1<<i)){const x=i%3,z=Math.floor(i/3);rs.push([2*x,2*x+2,2*z,2*z+2]);}
 const w=world(rs),before=JSON.stringify(w);
 for(let x=0;x<=6;x++)for(let z=0;z<=6;z++){const actual=footprintCovered(w,x/2,z/2,.5),expected=oracle(rs,[x,z],[x,z],1);pointChecks++;if(actual!==expected)mismatches.push({mask,x,z,actual,expected});}
 for(const [a,b]of paths)for(const radius of [1,2])for(const reverse of [false,true]){
  const from=reverse?b:a,to=reverse?a:b;
  const actual=pathFootprintCovered(w,from.map(v=>v/2),to.map(v=>v/2),radius/2),expected=oracle(rs,from,to,radius);
  pathChecks++;if(actual!==expected)mismatches.push({mask,from,to,radius,actual,expected});
 }
 assert.equal(JSON.stringify(w),before,'input mutation');
}
const result={scope:'Half-unit lattice; 512 unions of 3x3 cells; independent complement/open-cell rational-time oracle. Not a proof for arbitrary IEEE inputs, heights or ownership.',pointChecks,pathChecks,mismatches};
fs.writeFileSync(new URL('./coverage-oracle.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));assert.equal(mismatches.length,0);
