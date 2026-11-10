// Independent literal anatomical endpoints, not metadata or total volume.
import test from 'node:test';import assert from 'node:assert/strict';import {pathToFileURL,fileURLToPath} from 'node:url';
const repo=process.env.R255_REPO??fileURLToPath(new URL('../../',import.meta.url));
const T=await import(pathToFileURL(repo+'/node_modules/three/build/three.module.js'));
const {createDafotangWeituo}=await import(pathToFileURL(repo+'/src/scene/palace/special/DafotangWeituo.js'));
const ends=[
 ['left-upper-arm',[-.30,1.56,0],[-.34,1.37,-.04],[-.34,1.37,-.04],[-.25,1.31,-.16]],
 ['left-gathered-forearm',[-.25,1.31,-.16],[-.13,1.40,-.23],[-.13,1.40,-.23],[-.045,1.49,-.25]],
 ['right-upper-arm',[.30,1.56,0],[.33,1.40,-.07],[.33,1.40,-.07],[.24,1.35,-.18]],
 ['right-gathered-forearm',[.24,1.35,-.18],[.13,1.46,-.25],[.13,1.46,-.25],[.035,1.52,-.26]],
 ['right-waist-ribbon',[.22,1.15,.12],[.32,.89,.11],[.45,.34,.04],[.55,.43,.04]],
 ['left-waist-ribbon',[-.23,1.15,.12],[-.34,.89,.10],[-.36,.27,.02],[-.29,.31,.02]],
];
test('R255 all twelve open-tube end caps close outward against independent endpoint directions',()=>{
 const materials={body:new T.MeshStandardMaterial(),trim:new T.MeshStandardMaterial()},out=createDafotangWeituo({materials});let checked=0;
 try{
  for(const[role,start,next,penultimate,end]of ends){
   const meshes=out.meshes.filter(m=>m.userData.dafotangWeituoRole===role);assert.equal(meshes.length,1);const g=meshes[0].geometry,p=g.attributes.position,ix=g.index;
   const key=n=>[p.getX(n),p.getY(n),p.getZ(n)].map(x=>Math.round(x*1e6)).join(',');
   const closedEdges=new Map();for(let i=0;i<ix.count;i+=3)for(let k=0;k<3;k++){const a=key(ix.getX(i+k)),b=key(ix.getX(i+(k+1)%3));assert.notEqual(a,b);const edge=[a,b].sort().join('|'),r=closedEdges.get(edge)??{count:0,winding:0};r.count++;r.winding+=a<b?1:-1;closedEdges.set(edge,r);}
   assert.ok([...closedEdges.values()].every(r=>r.count===2&&r.winding===0),role+' spatially welded seam and end rims are closed and oppositely wound');
   for(const[endpoint,inward]of[[start,next],[end,penultimate]]){
    const centre=new T.Vector3(...endpoint),expected=new T.Vector3(...endpoint).sub(new T.Vector3(...inward)).normalize(),centres=[];
    for(let i=0;i<p.count;i++)if(new T.Vector3().fromBufferAttribute(p,i).distanceTo(centre)<1e-6)centres.push(i);
    assert.equal(centres.length,1,role+' explicit cap centre');const id=centres[0],edges=new Map();let count=0;
    for(let i=0;i<ix.count;i+=3){const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)];if(!ids.includes(id))continue;count++;const v=ids.map(n=>new T.Vector3().fromBufferAttribute(p,n)),tri=new T.Triangle(...v);assert.ok(tri.getArea()>1e-10);assert.ok(tri.getNormal(new T.Vector3()).dot(expected)>.99,role+' cap faces out of independent first/last segment');
     for(let k=0;k<3;k++){const a=ids[k],b=ids[(k+1)%3];if(a===id||b===id){const ka=key(a),kb=key(b),edge=[ka,kb].sort().join('|');edges.set(edge,(edges.get(edge)??0)+(ka<kb?1:-1));}}
    }
    assert.equal(count,5,role+' five actual cap triangles');assert.equal(edges.size,5);assert.ok([...edges.values()].every(n=>n===0),role+' radial cap edges pair with opposite winding');checked++;
   }
  }
  assert.equal(checked,12);console.log('R255_CAPS_QA '+JSON.stringify({openTubes:6,endCaps:checked}));
 }finally{out.dispose();Object.values(materials).forEach(m=>m.dispose());}
});
