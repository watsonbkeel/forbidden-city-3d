import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
// This import supplies canvas only. Every fixture below uses REAL TextureLibrary.
import './lib/inner-palace-fixture.mjs';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {CourtKit,FACE} from '../src/scene/palace/kit.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';

const rows=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-scope.json',import.meta.url))).filter(r=>['凝道殿','焕章殿'].includes(r.name));
const measurements=[];
const keyOf=r=>r.name==='凝道殿'?'ningdao':'huanzhang';
function fixture(row,existingLibrary=null){
  const lib=existingLibrary??new TextureLibrary();
  if(!existingLibrary)for(const [name,spec] of Object.entries(TEXTURE_SPECS)){
    const color=new T.Color(spec.fallback),data=new Uint8Array([color.r*255,color.g*255,color.b*255,255]);
    lib.colors.set(name,lib.configure(new T.DataTexture(data,1,1,T.RGBAFormat),name,'color'));
  }
  const kit=new CourtKit(lib,row.zone),item={...row.baselineItem,rot:FACE[row.baselineItem.rot]},built=kit.hall(item);
  kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);
  const profile=api.resolveRemainingProfile(row.zone,row.baselineItem);assert.ok(profile,'production resolver enables exact paired identity');assert.equal(profile.key,keyOf(row));
  return{row,lib,kit,item,built,profile,f:built.f};
}
function integrate(c){assert.equal(c.integrationCalls??0,0,'one production augmentation per fixture');c.integrationCalls=1;c.result=api.augmentRemainingHall(c.kit,c.item,c.built,c.profile);assert.equal(c.result.f,c.f);assert.equal(c.f.userData.remainingOuter.id,c.row.id);return c.result.g.pairedExposedRoof;}
const list=(root,p)=>{const a=[];root.traverse(n=>{if(n.isMesh&&p(n))a.push(n)});return a};
function triangles(mesh){const p=mesh.geometry.attributes.position,ix=mesh.geometry.index;return Array.from({length:(ix?.count??p.count)/3},(_,i)=>[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i*3+j):i*3+j)));}
function digest(mesh){return createHash('sha256').update(JSON.stringify({attributes:Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:mesh.geometry.index?[...mesh.geometry.index.array]:null,matrix:mesh.matrix.toArray(),material:mesh.material.uuid})).digest('hex')}
const nav=kit=>JSON.stringify({c:kit.colliders,w:kit.walkables,r:kit.rooms,m:kit.mapItems,g:kit.regions});
const tolerance=1e-5;
const pointKey=p=>p.map(v=>Math.round(v/tolerance)).join(',');
function weldedEdges(meshes){const edges=new Map();for(const m of meshes)for(const tri of triangles(m)){const ps=tri.map(p=>p.applyMatrix4(m.matrixWorld).toArray()),ks=ps.map(pointKey);for(let j=0;j<3;j++){const a=ks[j],b=ks[(j+1)%3];assert.notEqual(a,b,'noncollapsed edge');const k=[a,b].sort().join('|'),e=edges.get(k)??{count:0,orientation:0};e.count++;e.orientation+=a<b?1:-1;edges.set(k,e)}}return edges;}
function rayHits(f,mesh,x,z,y,up){const p=f.localToWorld(new T.Vector3(x,y,z));return new T.Raycaster(p,new T.Vector3(0,up?1:-1,0),0,30).intersectObject(mesh).map(h=>h.point.y)}
function verticalInterval(f,mesh,x,z){const above=rayHits(f,mesh,x,z,30,false)[0],below=rayHits(f,mesh,x,z,0,true)[0];return Number.isFinite(above)&&Number.isFinite(below)?[below,above]:null;}
function intervalsOverlap(a,b){return a&&b&&Math.min(a[1],b[1])-Math.max(a[0],b[0])>1e-4;}
function exactBoxContact(a,b){a.geometry.computeBoundingBox();const inverse=a.matrixWorld.clone().invert(),box=a.geometry.boundingBox.clone().expandByScalar(1e-6);return triangles(b).some(v=>box.intersectsTriangle(new T.Triangle(...v.map(p=>p.applyMatrix4(b.matrixWorld).applyMatrix4(inverse)))));}

// Clip actual 3-D triangle polygons against the display top's XZ footprint.
// Linear edge interpolation preserves the triangle plane, so the minimum is
// actual triangle clearance, not a broad roof AABB or sparse point sampling.
function clipRoofTriangle(points,rect){
  let out=points.map(p=>p.clone());
  for(const [axis,value,sign]of[['x',rect.min.x,1],['x',rect.max.x,-1],['z',rect.min.z,1],['z',rect.max.z,-1]]){
    const input=out;out=[];if(!input.length)break;
    for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign,ia=da>=-1e-9,ib=db>=-1e-9;if(ia)out.push(a);if(ia!==ib)out.push(a.clone().lerp(b,da/(da-db)));}
  }
  return out;
}
function localBounds(c,mesh){mesh.geometry.computeBoundingBox();return mesh.geometry.boundingBox.clone().applyMatrix4(c.f.matrixWorld.clone().invert().multiply(mesh.matrixWorld));}
function actualClearance(c,panel){
  const rect=localBounds(c,panel),inverse=c.f.matrixWorld.clone().invert();let min=Infinity,part=null,clipped=0;
  for(const mesh of list(c.f,m=>m.userData.pairedRoofPart))for(const t of triangles(mesh)){
    const points=clipRoofTriangle(t.map(p=>p.applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse)),rect);if(points.length<3)continue;clipped++;
    const low=Math.min(...points.map(p=>p.y));if(low<min){min=low;part=mesh.name;}
  }
  assert.ok(clipped>0,'actual roof triangles exist above display footprint');return{clearance:min-rect.max.y,lowestRoofY:min,topY:rect.max.y,part,clipped};
}
function assertDisplayClearance(c,panel){const r=actualClearance(c,panel);assert.ok(r.clearance>.25,`${panel.name}: actual ancient roof clearance ${r.clearance}m from ${r.part}`);return r;}
function assertEndSupport(c,theme){
  const prefix=c.profile.key+'-'+theme+'-',one=suffix=>list(c.f,m=>m.name===prefix+suffix),top=one('low-modern-ceiling')[0],posts=one('case-post'),rails=[...one('case-top-rail'),...one('case-top-return')];
  assert.ok(top);assert.equal(posts.length,4);assert.equal(rails.length,4);
  for(const post of posts){assert.equal(post.material.side,T.FrontSide);const b=localBounds(c,post);assert.ok(Math.abs(b.min.y-c.item.ph)<1e-6,'actual case post reaches floor');assert.ok(exactBoxContact(post,top),'actual case post supports red top');assert.ok(rails.filter(r=>exactBoxContact(post,r)).length>=2,'actual post meets two perpendicular top rails');}
  for(const rail of rails){assert.ok(exactBoxContact(rail,top),'top rail supports real lower ceiling panel');assert.ok(posts.filter(p=>exactBoxContact(rail,p)).length>=2,'each rail has two post bearings');}
  return{top,posts,rails};
}

for(const row of rows){
  test(`paired roof integration ${row.name}: removes only two obsolete ceilings and preserves roof exterior and inherited walkables/rooms`,()=>{
    const c=fixture(row);try{const roof=c.f.children.find(n=>n.name==='roof_gable'),tile=list(roof,m=>m.material===c.lib.material('roof_tile'))[0],oldTile=digest(tile),others=new Map([...list(roof,m=>m.material!==c.lib.material('rafters')),...list(c.f,m=>m.geometry.type==='CylinderGeometry'&&m.material===c.lib.material('wood_column'))].map(m=>[m,digest(m)])),originalNav=JSON.stringify({w:c.kit.walkables,r:c.kit.rooms,m:c.kit.mapItems,g:c.kit.regions}),bounds=new T.Box3().setFromObject(roof),rafters=list(roof,m=>m.material===c.lib.material('rafters'))[0],oldRafterTriangles=triangles(rafters).filter(v=>!v.every(p=>Math.abs(p.y-c.item.ph-c.item.colH)<1e-5)).map(v=>v.map(p=>p.toArray()));
      const result=integrate(c);assert.ok(result);c.kit.root.updateMatrixWorld(true);
      assert.equal(result.removedLegacyCeilingPlanes,1);assert.equal(result.removedHorizontalSoffitTriangles,4);
      assert.equal(digest(tile),oldTile,'all tile attributes and material identity retained');for(const [mesh,h]of others)assert.equal(digest(mesh),h,mesh.name+' retained');
      assert.deepEqual(triangles(rafters).map(v=>v.map(p=>p.toArray())),oldRafterTriangles,'retained exterior soffit/fascia actual triangles');
      const after=new T.Box3().setFromObject(roof);assert.ok(bounds.min.distanceTo(after.min)<1e-6&&bounds.max.distanceTo(after.max)<1e-6,'existing roof outer bounds unchanged');assert.equal(JSON.stringify({w:c.kit.walkables,r:c.kit.rooms,m:c.kit.mapItems,g:c.kit.regions}),originalNav);
      assert.equal(list(c.f,m=>m.geometry.type==='PlaneGeometry'&&m.material===c.lib.material('caihua_beam')).length,0);assert.equal(result.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');assert.equal(result.photographyDate,null);assert.equal(result.targetPeriod,'2021_CERAMICS_OPENING_PANORAMA');assert.equal(result.wholeBuildingComplete,false);
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: actual top and underside have opposite winding, FrontSide rays, and welded closed shell`,()=>{
    const c=fixture(row);try{integrate(c);c.kit.root.updateMatrixWorld(true);const tile=list(c.f,m=>m.material===c.lib.material('roof_tile'))[0],bottom=list(c.f,m=>m.userData.pairedRoofPart==='underboard')[0],edge=list(c.f,m=>m.userData.pairedRoofPart==='board-edge')[0];assert.ok(bottom&&edge);
      const tops=triangles(tile),bottoms=triangles(bottom);assert.equal(tops.length,bottoms.length);
      for(let i=0;i<tops.length;i++){const a=tops[i],b=bottoms[i];for(let j=0;j<3;j++){assert.ok(Math.abs(a[j].x-b[[0,2,1][j]].x)<1e-6);assert.ok(Math.abs(a[j].z-b[[0,2,1][j]].z)<1e-6);assert.ok(Math.abs(a[j].y-b[[0,2,1][j]].y-.12)<1e-6)}
        for(const [m,v,s]of[[tile,a,1],[bottom,b,-1]]){assert.equal(m.material.side,T.FrontSide);const n=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0]));assert.ok(n.y*s>1e-8);const p=v[0].clone().add(v[1]).add(v[2]).divideScalar(3).applyMatrix4(m.matrixWorld),ray=new T.Raycaster(p.clone().add(new T.Vector3(0,s*.03,0)),new T.Vector3(0,-s,0),0,.06);assert.ok(ray.intersectObject(m).length,'actual outward front-side visible');const back=new T.Raycaster(p.clone().add(new T.Vector3(0,-s*.03,0)),new T.Vector3(0,s,0),0,.06);assert.equal(back.intersectObject(m).length,0,'back faces not papered over by DoubleSide');}
      }
      for(const e of weldedEdges([tile,bottom,edge]).values()){assert.equal(e.count,2,'every welded shell edge has exactly two triangles');assert.equal(e.orientation,0,'shell edge directions oppose');}
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: each real column/frame/purlin/rafter has physical contact`,()=>{
    const c=fixture(row);try{const r=integrate(c);c.kit.root.updateMatrixWorld(true);const byId=id=>list(c.f,n=>n.userData.pairedBearingId===id)[0];assert.equal(r.loadPath.frames.length,6);assert.equal(r.loadPath.purlins.length,7);assert.ok(r.loadPath.rafters.length>40);
      for(const frame of r.loadPath.frames){const main=byId(frame.beams[0]);for(const col of frame.columns)assert.ok(exactBoxContact(main,byId(col)),'transverse beam intersects actual column triangles');for(const support of frame.supports){const post=byId(support.mesh);assert.ok(exactBoxContact(post,byId(support.below)),'post bottom contacts beam');assert.ok(exactBoxContact(post,byId(support.above)),'post top contacts beam/purlin');}for(const bearing of frame.purlinBearings)assert.ok(exactBoxContact(byId(bearing.beam),byId(bearing.purlin)),'purlin rests on actual beam, not AABB-only');}
      const under=list(c.f,m=>m.userData.pairedRoofPart==='underboard')[0];for(const row of r.loadPath.purlins){const p=byId(row.mesh);for(const entry of r.loadPath.rafters){const q=byId(entry.mesh),z=row.contactZ;assert.ok(intervalsOverlap(verticalInterval(c.f,p,entry.x,z),verticalInterval(c.f,q,entry.x,z)),`purlin ${row.z} connects actual rafter ${entry.x}`);const roofY=rayHits(c.f,under,entry.x,z,0,true)[0],interval=verticalInterval(c.f,q,entry.x,z);assert.ok(interval&&interval[0]<roofY&&interval[1]>=roofY-1e-5,'rafter reaches actual downward board');}}
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: roof is exposed from 1.7m eye and access replay body never intersects a new beam`,()=>{
    const c=fixture(row);try{integrate(c);c.kit.root.updateMatrixWorld(true);const added=list(c.f,m=>m.userData.pairedRoofPart),ray=new T.Raycaster(c.f.localToWorld(new T.Vector3(.213,c.item.ph+PLAYER.HEIGHT,.41)),new T.Vector3(0,1,0),0,20),hit=ray.intersectObjects(list(c.f,()=>true))[0];assert.ok(hit);assert.ok(hit.object.userData.pairedRoofPart,'new frame is not concealed by old flat ceiling');
      const cm=new CollisionManager();cm.rivers=[];cm.addColliders(c.kit.colliders);cm.addWalkables(c.kit.walkables);const front=-c.item.d/2,inner=c.item.w/2-.55-5.55-1,aisle=front+1.15,deep=front+3.2;const points=[[0,front-2],[0,deep],[-inner,deep],[-inner,aisle],[-c.item.w/2+1.25,aisle],[-inner,aisle],[-inner,deep],[inner,deep],[inner,aisle],[c.item.w/2-1.25,aisle],[inner,aisle],[inner,deep],[0,deep],[0,0]];let current=c.f.localToWorld(new T.Vector3(...[points[0][0],PLAYER.HEIGHT,points[0][1]])),feet=0,checked=0;
      // Only the two explicitly identified low architectural stepping surfaces
      // are excluded. Low furniture is NEVER exempted by its height alone.
      const stepNames=new Set([c.profile.key+'-photo-low-threshold-strip',c.profile.key+'-photo-entrance-mat']);
      const addedTriangles=list(c.f,m=>m.userData.remainingOuterId===c.profile.id).filter(m=>{
        if(!stepNames.has(m.name))return true;
        const b=new T.Box3().setFromObject(m);assert.ok(b.max.y<=c.item.ph+PLAYER.STEP_UP);assert.ok(b.max.y-b.min.y<=.025001,'only thin architectural threshold/mat is a stepping exception');return false;
      }).map(m=>({box:new T.Box3().setFromObject(m),tris:triangles(m).map(v=>new T.Triangle(...v.map(p=>p.applyMatrix4(m.matrixWorld))))}));
      for(const [x,z]of points.slice(1)){const target=c.f.localToWorld(new T.Vector3(x,0,z)),delta=target.clone().sub(current),n=Math.ceil(Math.hypot(delta.x,delta.z)/.12);for(let k=0;k<n;k++){const step=current.clone();step.x+=delta.x/n;step.z+=delta.z/n;current=cm.getValidPosition(current,step,.5,feet,PLAYER.STEP_UP);feet=cm.lastGroundY;const body=new T.Box3(new T.Vector3(current.x-.5,feet+.02,current.z-.5),new T.Vector3(current.x+.5,feet+PLAYER.HEIGHT,current.z+.5));for(const q of addedTriangles)if(body.intersectsBox(q.box))assert.ok(!q.tris.some(t=>body.intersectsTriangle(t)),'full 1.7m body clips no architectural frame or modern display component');checked++;}assert.ok(Math.hypot(current.x-target.x,current.z-target.z)<.15,'real controller reaches floor route target');}assert.ok(checked>100);assert.ok(Math.abs(feet-c.item.ph)<.001);assert.equal(PLAYER.HEIGHT,1.7);
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: all added solids are closed, lie within retained roof bounds and close inward gables`,()=>{
    const c=fixture(row);try{const roof=c.f.children.find(n=>n.name==='roof_gable'),bounds=new T.Box3().setFromObject(roof);integrate(c);c.kit.root.updateMatrixWorld(true);const solids=list(c.f,m=>m.userData.pairedRoofPart&&!['underboard','board-edge'].includes(m.userData.pairedRoofPart));for(const m of solids){assert.ok(bounds.clone().expandByScalar(1e-5).containsBox(new T.Box3().setFromObject(m)),m.name+' stays inside original roof exterior bounds');for(const v of triangles(m))assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).lengthSq()>1e-14,m.name+' has no degenerate face');for(const e of weldedEdges([m]).values()){assert.equal(e.count,2,m.name+' solid edge has two faces');assert.equal(e.orientation,0,m.name+' winding closes');}}
      const gables=list(c.f,m=>m.userData.pairedRoofPart==='inner-gable');assert.equal(gables.length,2);for(const side of[-1,1]){const origin=c.f.localToWorld(new T.Vector3(side*(c.item.w/2-1),c.item.ph+c.item.colH+1,0)),direction=new T.Vector3(side,0,0).transformDirection(c.f.matrixWorld),hits=new T.Raycaster(origin,direction,0,2).intersectObjects(gables);assert.ok(hits.length,'new exposed gable is inward FrontSide-visible without changing old outward wall');}
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: both low red display roofs have actual triangle clearance from every ancient frame`,()=>{
    const c=fixture(row);try{integrate(c);c.kit.root.updateMatrixWorld(true);const tops=list(c.f,m=>m.name.endsWith('-low-modern-ceiling'));assert.equal(tops.length,2);for(const top of tops){assert.equal(top.material.side,T.FrontSide);assert.equal(top.userData.notHistoricCeiling,true);assert.ok(top.userData.source.includes('.tiles/f/'));const r=assertDisplayClearance(c,top);measurements.push({building:row.name,kind:'end-display-clearance',panel:top.name,...r});assert.ok(r.clipped>100,'do not exempt hidden end-area roof triangles');const b=localBounds(c,top),x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2,y=b.min.y-.15;assert.ok(rayHits(c.f,top,x,z,y,true).length,'red low ceiling has real downward FrontSide surface');}
      const central=list(c.f,m=>m.name===c.profile.key+'-central-long-case-red-cap');assert.equal(central.length,1);measurements.push({building:row.name,kind:'central-case-clearance',panel:central[0].name,...assertDisplayClearance(c,central[0])});
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: modern case roofs are carried by actual floor posts/rails, not ancient beams or metadata`,()=>{
    const c=fixture(row);try{integrate(c);c.kit.root.updateMatrixWorld(true);for(const r of c.result.g.modernDisplay.endDisplays){const parts=assertEndSupport(c,r.theme);measurements.push({building:row.name,kind:'actual-case-bearing',theme:r.theme,posts:parts.posts.length,rails:parts.rails.length,postFeetY:localBounds(c,parts.posts[0]).min.y,postTopY:localBounds(c,parts.posts[0]).max.y,ceilingUndersideY:localBounds(c,parts.top).min.y});}
      const cap=list(c.f,m=>m.name===c.profile.key+'-central-long-case-red-cap')[0],frames=list(c.f,m=>m.name===c.profile.key+'-central-long-case-frame'),back=list(c.f,m=>m.name===c.profile.key+'-central-long-case-back')[0];assert.equal(frames.length,2);for(const post of frames){assert.ok(Math.abs(localBounds(c,post).min.y-c.item.ph)<1e-6);assert.ok(exactBoxContact(post,cap),'central case post actually reaches red cap');}assert.ok(exactBoxContact(back,cap),'central backing supports rear edge of cap');
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: public front aisle still sees ancient roof while only end exhibits have low tops`,()=>{
    const c=fixture(row);try{integrate(c);c.kit.root.updateMatrixWorld(true);const meshes=list(c.f,()=>true),front=-c.item.d/2,cm=new CollisionManager();cm.rivers=[];cm.addColliders(c.kit.colliders);cm.addWalkables(c.kit.walkables);let ancientHits=0,doorDetours=0;
      for(let x=-c.item.w/2+1.3;x<=c.item.w/2-1.3;x+=.49){const y=c.item.ph+PLAYER.HEIGHT;let z=front+1.15,eye=c.f.localToWorld(new T.Vector3(x,y,z));
        if(cm.checkCollision(eye,.5)){assert.ok(Math.abs(x)<c.item.w/c.item.bays/2+.6,'only the central folded-door zone may need the verified behind-door detour');z=front+3.2;eye=c.f.localToWorld(new T.Vector3(x,y,z));doorDetours++;}
        assert.equal(cm.checkCollision(eye,.5),false,'every eye sample is on actual body-clear public circulation');const hit=new T.Raycaster(eye,new T.Vector3(0,1,0),0,20).intersectObjects(meshes)[0];assert.ok(hit,'public aisle has a physical roof');assert.ok(hit.object.userData.pairedRoofPart,JSON.stringify({reason:'reachable public aisle first obstruction',x,z,hit:hit.object.name,y:hit.point.y,role:hit.object.userData.role}));ancientHits++;}assert.ok(ancientHits>45);assert.ok(doorDetours>0&&doorDetours<10,'folded-door occupation is explicitly checked, not a general hidden-roof exemption');
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: clearance and support checks reject actual intersecting/floating mutated objects`,()=>{
    const c=fixture(row);try{integrate(c);c.kit.root.updateMatrixWorld(true);const record=c.result.g.modernDisplay.endDisplays[0],parts=assertEndSupport(c,record.theme),y=parts.top.position.y;parts.top.position.y=5.60;c.kit.root.updateMatrixWorld(true);assert.throws(()=>assertDisplayClearance(c,parts.top),/actual ancient roof clearance/);parts.top.position.y=y;parts.posts[0].scale.y=.5;c.kit.root.updateMatrixWorld(true);assert.throws(()=>assertEndSupport(c,record.theme),/actual case post/);
    }finally{c.kit.dispose(c.kit.root);c.lib.dispose();}
  });
  test(`paired roof integration ${row.name}: each added material is private, FrontSide, registered, and disposed only by kit`,()=>{
    const c=fixture(row);try{const shared=[...c.lib.materials.values()],before=new Map(shared.map(m=>[m,{side:m.side,color:m.color.getHex(),map:m.map,normalMap:m.normalMap}])),sharedDisposed=new Map(shared.map(m=>[m,0]));for(const m of shared)m.addEventListener('dispose',()=>sharedDisposed.set(m,sharedDisposed.get(m)+1));integrate(c);const privateMaterials=new Set(list(c.f,m=>m.userData.remainingOuterId===c.profile.id).map(m=>m.material)),counts=new Map([...privateMaterials].map(m=>[m,0]));assert.ok(privateMaterials.size>=8);for(const m of privateMaterials){assert.equal(m.side,T.FrontSide);assert.ok(c.kit.owned.includes(m));assert.ok(!c.lib.owns(m));m.addEventListener('dispose',()=>counts.set(m,counts.get(m)+1))}for(const [m,a]of before)assert.deepEqual({side:m.side,color:m.color.getHex(),map:m.map,normalMap:m.normalMap},a);const merged=c.kit.finish();c.kit.dispose(merged);for(const n of counts.values())assert.equal(n,1);for(const n of sharedDisposed.values())assert.equal(n,0);
    }finally{c.lib.dispose();}
  });
}
test('paired integration rejects wrong exact identity / malformed baseline before making changes',()=>{const c=fixture(rows[0]);try{const before=nav(c.kit),children=c.f.children.length;assert.throws(()=>api.augmentRemainingHall(c.kit,{...c.item,w:28},c.built,c.profile),/identity|baseline/i);assert.equal(c.f.children.length,children);assert.equal(nav(c.kit),before);assert.throws(()=>api.augmentRemainingHall(c.kit,c.item,c.built,{...c.profile,key:'wuying'}),/identity|profile/i);}finally{c.kit.dispose(c.kit.root);c.lib.dispose();}});

test('paired integration rejects a renamed private lookalike ceiling material and repeat installation',()=>{const c=fixture(rows[0]);try{const ceiling=c.f.children.find(n=>n.geometry?.type==='PlaneGeometry'&&n.material===c.lib.material('caihua_beam')),shared=ceiling.material,lookalike=shared.clone();lookalike.name=shared.name;ceiling.material=lookalike;const children=c.f.children.length,owned=c.kit.owned.length;assert.throws(()=>api.augmentRemainingHall(c.kit,c.item,c.built,c.profile),/original hall ceiling/);assert.equal(c.f.children.length,children);assert.equal(c.kit.owned.length,owned);ceiling.material=shared;lookalike.dispose();api.augmentRemainingHall(c.kit,c.item,c.built,c.profile);const added=c.f.children.length;assert.throws(()=>api.augmentRemainingHall(c.kit,c.item,c.built,c.profile),/already installed/);assert.equal(c.f.children.length,added);}finally{c.kit.dispose(c.kit.root);c.lib.dispose();}});

test('paired integration load-path IDs are deterministic, unique and resolve actual mesh objects',()=>{for(const row of rows){const a=fixture(row),b=fixture(row);try{const ra=integrate(a),rb=integrate(b);assert.deepEqual(ra.loadPath,rb.loadPath);const nodes=list(a.f,m=>m.userData.pairedBearingId),ids=nodes.map(m=>m.userData.pairedBearingId);assert.equal(new Set(ids).size,ids.length);assert.ok(ids.length>140);for(const frame of ra.loadPath.frames)for(const id of [...frame.columns,...frame.beams,...frame.supports.flatMap(x=>[x.mesh,x.below,x.above])])assert.ok(nodes.some(n=>n.userData.pairedBearingId===id),'bearing ID resolves actual mesh');}finally{a.kit.dispose(a.kit.root);a.lib.dispose();b.kit.dispose(b.kit.root);b.lib.dispose();}}});

test('paired integration repeated raw/merged disposal keeps shared library resources alive across fresh hall builds',()=>{
  for(const row of rows){let lib=null;const used=new Set(),sharedDisposals=new Map(),cycleCounts=[];try{
    for(let cycle=0;cycle<3;cycle++){
      const c=fixture(row,lib);lib=c.lib;
      const watchShared=()=>{for(const resource of [...lib.materials.values(),...lib.allTextures()])if(!sharedDisposals.has(resource)){sharedDisposals.set(resource,0);resource.addEventListener('dispose',()=>sharedDisposals.set(resource,sharedDisposals.get(resource)+1));}};
      watchShared();integrate(c);watchShared();
      const own=new Set(list(c.f,m=>m.userData.remainingOuterId===c.profile.id).map(m=>m.material)),disposed=new Map();for(const m of own){assert.ok(c.kit.owned.includes(m));assert.ok(!lib.owns(m));assert.ok(!used.has(m),'fresh kit cannot reuse previously disposed private material');used.add(m);disposed.set(m,0);m.addEventListener('dispose',()=>disposed.set(m,disposed.get(m)+1));}
      const mode=cycle%2?'merged':'raw',root=cycle%2?c.kit.finish():c.kit.root;
      // finish() may add a new private plaque atlas. Watch every kit-owned
      // material and texture after that transition, not just used roof paint.
      const ownedMaterials=new Set(c.kit.owned),ownedTextures=new Set(c.kit.ownedTextures??[]),allOwnedDisposals=new Map();
      assert.equal(ownedMaterials.size,c.kit.owned.length,'owned material registry has no duplicates');
      for(const resource of [...ownedMaterials,...ownedTextures]){assert.ok(!sharedDisposals.has(resource),'kit ownership must not include a library resource');allOwnedDisposals.set(resource,0);resource.addEventListener('dispose',()=>allOwnedDisposals.set(resource,allOwnedDisposals.get(resource)+1));}
      c.kit.dispose(root);for(const n of disposed.values())assert.equal(n,1,'exactly one disposal per paired private material');for(const n of allOwnedDisposals.values())assert.equal(n,1,'exactly one disposal per kit-owned material/texture');for(const n of sharedDisposals.values())assert.equal(n,0,'shared material/texture remains alive across raw and merged disposal');
      cycleCounts.push({cycle:cycle+1,mode,pairedPrivateMaterials:own.size,pairedPrivateDisposals:[...disposed.values()].reduce((a,b)=>a+b,0),kitOwnedMaterials:ownedMaterials.size,kitOwnedMaterialDisposals:[...ownedMaterials].reduce((n,m)=>n+allOwnedDisposals.get(m),0),kitOwnedTextures:ownedTextures.size,kitOwnedTextureDisposals:[...ownedTextures].reduce((n,m)=>n+allOwnedDisposals.get(m),0),sharedMaterialsWatched:[...sharedDisposals.keys()].filter(m=>m.isMaterial).length,sharedTexturesWatched:[...sharedDisposals.keys()].filter(m=>m.isTexture).length,sharedPrematureDisposals:[...sharedDisposals.values()].reduce((a,b)=>a+b,0)});
    }
    measurements.push({building:row.name,kind:'lifecycle-repeated',cycles:3,modes:['raw','merged','raw'],uniquePrivateMaterials:used.size,sharedResourcesWatched:sharedDisposals.size,sharedPrematureDisposals:[...sharedDisposals.values()].reduce((a,b)=>a+b,0),cycleCounts});
  }finally{lib?.dispose();}}
});

test.after(()=>{if(process.env.R48_WRITE_PAIRED_ROOF_INTEGRATION)writeFileSync(new URL('../docs/current-state/r48-remaining/outer-paired-roof-integration-measurements.json',import.meta.url),JSON.stringify({status:'MEASUREMENTS_FROM_ASSERTED_REAL_RESOLVE_PLUS_AUGMENT_BUILDS',node:process.version,measurements},null,2)+'\n');});
