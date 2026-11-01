import {registerBPrincipalStairs} from '../BPrincipalStairContact.js';
import {nansansuoNorthStairGroups,authorizeNansansuoNorthStairHost,revokeNansansuoNorthStairHost} from './NansansuoNorthStairHost.js';
import * as T from 'three';
import {validateNansansuoInventoryPolicy} from '../NansansuoInventoryPolicy.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const certifiedNorthHosts=new WeakSet();
export const isCertifiedNansansuoNorthHost=parent=>certifiedNorthHosts.has(parent);
const KEY='nansansuoNorthEaves',ARRAYS=['colliders','walkables','rooms','regions','mapItems','plaques','owned'];
const RECORDS=[{index:13,key:'sansuo-west-rear',id:'place-outer-east-3f2ebd1b02'},{index:15,key:'sansuo-center-rear',id:'place-outer-east-1db501eb23'},{index:17,key:'sansuo-east-rear',id:'place-outer-east-4642f5088e'}];
const fail=m=>{throw Error(`Nansansuo north eaves ${m}`)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),writable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const params=item=>{const p={};for(const k of['x','z','w','d','colH','roof','enter','interior','name'])if(Object.hasOwn(item,k))p[k]=item[k];return{...p,rot:0}};
const fresh=k=>{const s=Object.assign(Object.create(Object.getPrototypeOf(k)),k,{root:new T.Group()});s.root.name=k.root.name;for(const a of ARRAYS)s[a]=[];return s};
function disposeSource(k){const geos=new Set();k.root.traverse(m=>{if(m.isMesh)geos.add(m.geometry)});for(const g of geos)g.dispose();for(const m of k.owned)m.dispose();}
function signature(f){f.updateWorldMatrix(true,true);const inverse=f.matrixWorld.clone().invert(),out=[];f.traverse(m=>{if(!m.isMesh)return;const a=m.material;out.push({name:m.name,matrix:new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld).toArray(),visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,material:a?{name:a.name,color:a.color?.getHex(),map:a.map?.uuid??null,normal:a.normalMap?.uuid??null,roughness:a.roughness,metalness:a.metalness,side:a.side,opacity:a.opacity,transparent:a.transparent}:null,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([n,a])=>[n,{type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,values:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null})});return out;}
// Reference-only replay of the frozen R48 Sansuo green-hard-gable branch.
// No generic RemainingOuter import: CourtKit may itself be the entry module.
// Actual hosts are required before this runs; this never publishes a fallback.
function referenceNorthHall(kit,item,zoneId,itemIndex){
 const b=kit.nansansuoUnknownHall(params(item),{zoneId,itemIndex,item}),discarded=new Set();for(const node of[...b.f.children])if(node.name.startsWith('roof_')){node.traverse(m=>{if(m.geometry)discarded.add(m.geometry)});node.removeFromParent();}for(const g of discarded)g.dispose();
 const roof=kit.roof(b.f,{type:'gable',width:item.w,depth:item.d+.5,baseY:(item.ph??.9)+item.colH,layers:1,brackets:false,hardGableEnd:true});
 let green=kit._northReferenceGreen;if(!green){green=new T.MeshStandardMaterial({name:'r48_outer_green_glaze',color:0x3d684b,roughness:.48});kit._northReferenceGreen=green;kit.owned.push(green);}
 roof.traverse(m=>{if(m.isMesh&&(m.material===kit.lib.material('roof_tile')||m.material===kit.ridge||m.material.name==='roof_ridge_glaze'))m.material=green;});return b;
}
function preflight(k,d){
 if(d?.id!=='outer-east')return null;const items=d.items??[];
 if(!items.some(q=>q?.kind==='hall'&&RECORDS.some(r=>q.name===d.items?.[r.index]?.name)&&q.name?.startsWith('南三所')))return null;
 const root=k.root;if(root.name!==d.id||root.parent||!root.visible||!root.matrixAutoUpdate||!writable(root.children)||!Object.getOwnPropertyDescriptor(root,'children')?.writable||ARRAYS.some(a=>!writable(k[a]))||root.position.lengthSq()||root.rotation.toArray().slice(0,3).some(Boolean)||!root.scale.equals(new T.Vector3(1,1,1)))fail('root/array source mismatch');
 const rows=[];for(const r of RECORDS){const item=items[r.index];validateNansansuoInventoryPolicy({zoneId:d.id,itemIndex:r.index,item},params(item));if(items.filter(q=>q?.name===item.name).length!==1)fail('duplicate source declaration');const hosts=root.children.filter(f=>f.userData.structure?.remainingId===r.id&&f.userData.structure?.remainingProfile===r.key);if(hosts.length!==1)fail('requires unique actual north host');const host=hosts[0];if(host.children.some(c=>c.userData[KEY]))fail('already installed / duplicate');if(host.parent!==root||!host.visible||!host.matrixAutoUpdate||!writable(host.children)||!Object.getOwnPropertyDescriptor(host,'children')?.writable||!eq(host.position.toArray(),[item.x,0,item.z])||host.rotation.toArray().slice(0,3).some(Boolean)||!host.scale.equals(new T.Vector3(1,1,1)))fail('actual host transform/source mismatch');const roofs=host.children.filter(q=>q.name.startsWith('roof_'));if(roofs.length!==1||roofs[0].userData.remainingRoof!=='sansuo-green-hard-gable')fail('requires exact retained green roof source');const group=nansansuoNorthStairGroups.find(g=>g.host.itemIndex===r.index),surfaces=group.surfaces.map(p=>{const found=k.walkables.filter(w=>w.type===p.type&&(p.type==='box'?w.box?.isBox3&&eq(w.box.min.toArray(),p.min)&&eq(w.box.max.toArray(),p.max):['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(key=>w[key]===p[key])));if(found.length!==1)fail('requires exact unique original platform/ramp source');return found[0]});rows.push({r,item,host,roof:roofs[0],group,surfaces});}
 const reference=fresh(k);try{for(const row of rows){const b=referenceNorthHall(reference,row.item,d.id,row.r.index);if(!eq(signature(row.host),signature(b.f)))fail('actual retained geometry/material/roof source mismatch');}}finally{disposeSource(reference)}return rows;
}
/** Only common middle/rear typology is fitted. Existing north-shell identities,
 * fenestration, roof, steps, supports and UNKNOWN inventories are not resolved. */
export function finishNansansuoNorthEaves(kit,zoneJson){
 const rows=preflight(kit,zoneJson);if(!rows)return null;const stage=fresh(kit),geos=new Set(),mats=[],sourceMesh=kit.mesh;
 stage.mesh=function(p,g,...args){geos.add(g);return sourceMesh.call(this,p,g,...args)};
 const dispose=()=>{for(const g of geos)g.dispose();for(const m of mats)m.dispose()};let ordinal=0;
 try{
  const owned=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.84});mats.push(m);stage.owned.push(m);return m;};
  const timber=owned('nansansuo_north_plain_timber',0x4b4439),bracket=owned('nansansuo_north_plain_bracket',0x64716c),brick=kit.lib.material('wall_brick');
  for(const row of rows){const {item,r}=row,temp=stage.frame(item.x,item.z,0),addon=new T.Group();temp.add(addon);row.temp=temp;row.addon=addon;addon.name=`nansansuo-north-eaves:${r.index}`;
   const roof=roofSampler(row.host,row.roof),bearing=roof.heightAt(0,item.d/2);if(Math.abs(bearing-5.94)>1e-5)fail('unexpected retained roof bearing');
   const box=(role,mat,x0,x1,y0,y1,z0,z1)=>{const m=stage.mesh(addon,new T.BoxGeometry(x1-x0,y1-y0,z1-z0),mat,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=`nansansuo-north:${role}`;m.userData[KEY]={role,itemIndex:r.index};register(stage,m,`nansansuo-north:${r.index}:${role}:${ordinal++}`);return m;};
   const anchors=[],ends=[];for(const side of[-1,1])for(let i=0;i<=5;i++){const x=-item.w/2+i*item.w/5,z=side*item.d/2;anchors.push({columnIndex:i,side,x,z,bearingY:bearing,countStatus:'RETAINED_COLUMN_GRID_ENGINEERING_REPEAT_NOT_HISTORIC_DOUKOU_OR_PUZUO_CENSUS'});
    for(const[role,mat,w,y0,y1,center,depth]of[['plain-bearing-block',bracket,.34,bearing-.73,bearing-.57,item.d/2+.25,.40],['plain-cross-arm',bracket,1.0,bearing-.57,bearing-.43,item.d/2+.30,.45],['plain-projecting-arm',timber,.26,bearing-.43,bearing-.25,item.d/2+.25,.70],['plain-upper-bearing',bracket,.8,bearing-.25,bearing,item.d/2,.46]]){
     // End assemblies are clipped to the existing flush gable plane, never
     // pushed outside the unchanged roof to fabricate exposed corner joinery.
     const x0=Math.max(-item.w/2,x-w/2),x1=Math.min(item.w/2,x+w/2),z0=side*(center-depth/2),z1=side*(center+depth/2);
     box(role,mat,x0,x1,y0,y1,Math.min(z0,z1),Math.max(z0,z1));
    }
   }
   for(const end of[-1,1])for(const side of[-1,1]){const start=item.d/2,to=start+1.25,stations=[start,to,...roof.zStations.filter(z=>z>start&&z<to)],zs=[...new Set(stations)].sort((a,b)=>a-b),top=zs.map(z=>[z,roof.heightAt(end*(item.w/2-.01),side*z)]),bottom=[[start,4.5],[start+.4,4.5],[start+.4,4.72],[start+.75,4.72],[start+.75,4.94],[start+1.03,4.94],[start+1.03,5.16],[to,5.16]],poly=[...bottom,...top.slice().reverse()];
    const g=closedPrism(poly,end*item.w/2,.7,side),m=stage.mesh(addon,g,brick,0,0,0);m.name='nansansuo-north:plain-upper-chitou';m.userData[KEY]={role:'plain-upper-chitou',itemIndex:r.index};register(stage,m,`nansansuo-north:${r.index}:chitou:${end}:${side}`);ends.push({end,side,fromZ:side*start,toZ:side*to,bottomY:4.5,topProfile:top,scope:'UPPER_STEPPED_MASONRY_ONLY_NOT_FULL_GABLE_RECONSTRUCTION'});
   }
   row.meta={id:`nansansuo-north-eaves:${r.index}`,scope:'EXISTING_THREE_NORTH_SHELLS_COMMON_EAVES_ONLY',itemIndex:r.index,retainedSourceId:r.id,identityStatus:'EXISTING_NORTH_SHELL_ONLY_MIDDLE_REAR_UNRESOLVED',bracketAnchors:anchors,corbelEnds:ends,surveyed:false,wholeBuildingAccepted:false,source:'https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf',sourcePage:142,sourceBoundary:'COMMON_MIDDLE_AND_REAR_HALLS_HAVE_BRACKETS_AND_PROJECTING_HARD_GABLE_CORBELS__NO_PHOTO_STAGE_REASSIGNMENT',dimensionStatus:'ORIGINAL_SHELL_COLUMN_GRID_AND_ROOF_UNDERSIDE_WITH_PLAIN_ENGINEERING_FIT_NOT_SURVEY',unseen:'Exact doukou, cai count, intercolumn assemblies, carving, pigment and hidden individual details unverified; no template painting or copied middle-hall fenestration.',preserved:'Original roof, windows, steps, platforms, geometry/material streams, colliders, walkables, inventories and court rows unchanged',contact:'Every new visible closed piece owns its complete actual source-triangle stream; no envelope proxy, low-route override or new walkable'};
   addon.userData[KEY]=row.meta;addon.userData.structure=row.meta;
  }
 }catch(error){dispose();throw error;}
 const originals=rows.map(row=>[row.host,row.host.children,[...row.host.children]]),arrays=Object.fromEntries(ARRAYS.map(a=>[a,[...kit[a]]]));
 try{for(const row of rows)row.host.add(row.addon);for(const a of ARRAYS)kit[a].push(...stage[a]);for(const row of rows){certifiedNorthHosts.add(row.host);if(!authorizeNansansuoNorthStairHost(kit,row.host,zoneJson,row.r.index,row.surfaces)||!registerBPrincipalStairs(kit,row.host,row.group.id,0))fail('actual original north stair source registration failed');}}
 catch(error){for(const row of rows){revokeNansansuoNorthStairHost(row.host);certifiedNorthHosts.delete(row.host);}for(const[host,list,children]of originals){host.children=list;Array.prototype.splice.call(list,0,list.length,...children);for(const c of children)c.parent=host;}for(const row of rows)row.addon.parent=row.temp;for(const a of ARRAYS)Array.prototype.splice.call(kit[a],0,kit[a].length,...arrays[a]);dispose();throw error;}
 return rows.map(row=>row.meta);
}
function roofSampler(host,roof){host.updateWorldMatrix(true,true);const inverse=host.matrixWorld.clone().invert(),triangles=[],zs=new Set();roof.traverse(m=>{if(!m.isMesh)return;const matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(matrix));if(new T.Triangle(...v).getArea()<1e-12)continue;triangles.push(v);for(const q of v)zs.add(Math.abs(q.z));}});return{zStations:[...zs],heightAt(x,z){const ray=new T.Ray(new T.Vector3(x,-100,z),new T.Vector3(0,1,0)),point=new T.Vector3();let y=Infinity;for(const v of triangles){if(ray.intersectTriangle(...v,false,point)&&point.y>4.4)y=Math.min(y,point.y);}if(!Number.isFinite(y))fail('missing actual roof underside');return y;}};}
function closedPrism(points,cx,width,side){
 // One Float32-welded contour is shared by caps and extrusion walls. Removing
 // redundant profile samples prevents Earcut from leaving cap/side T-junctions.
 let p=[];for(const[u,y]of points){const v=new T.Vector2(Math.fround(u),Math.fround(y));if(!p.length||p.at(-1).distanceToSquared(v)>1e-12)p.push(v);}if(p[0].distanceToSquared(p.at(-1))<=1e-12)p.pop();
 let changed=true;while(changed){changed=false;for(let i=0;i<p.length;i++){const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length],ab=b.clone().sub(a),bc=c.clone().sub(b);if(Math.abs(ab.x*bc.y-ab.y*bc.x)<1e-7&&ab.dot(bc)>=0){p.splice(i,1);changed=true;break;}}}if(T.ShapeUtils.area(p)<0)p=p.reverse();const faces=T.ShapeUtils.triangulateShape(p,[]),positions=[],uv=[];
 const vertex=(i,x)=>[x,p[i].y,side*p[i].x];const triangle=(a,b,c,n)=>{const normal=new T.Vector3(...b).sub(new T.Vector3(...a)).cross(new T.Vector3(...c).sub(new T.Vector3(...a)));if(normal.lengthSq()<1e-18)return;const q=normal.dot(new T.Vector3(...n))<0?[a,c,b]:[a,b,c];for(const v of q){positions.push(...v);uv.push(v[2],v[1]);}};
 for(const f of faces){triangle(...f.map(i=>vertex(i,cx-width/2)),[-1,0,0]);triangle(...f.map(i=>vertex(i,cx+width/2)),[1,0,0]);}for(let i=0;i<p.length;i++){const j=(i+1)%p.length,a=vertex(i,cx-width/2),b=vertex(j,cx-width/2),c=vertex(j,cx+width/2),d=vertex(i,cx+width/2),n=[0,-(p[j].x-p[i].x),side*(p[j].y-p[i].y)];triangle(a,b,c,n);triangle(a,c,d,n);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
function register(kit,m,id){kit.root.updateMatrixWorld(true);const p=m.geometry.attributes.position,ix=m.geometry.index,values=[];for(let i=0;i<(ix?.count??p.count);i++){const v=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);values.push(...v.toArray());}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],id),b=owner.box.clone();b.triangleSupport=owner;kit.colliders.push(b);}finally{g.dispose();}}
