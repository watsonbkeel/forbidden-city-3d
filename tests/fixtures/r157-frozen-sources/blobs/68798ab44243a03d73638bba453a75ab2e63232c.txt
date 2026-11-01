import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import anchors from '../../../data/anchors.json' with {type:'json'};

const SOURCE='https://www.dpm.org.cn/explore/building/236498.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e998d952596d.jpg';
const fail=message=>{throw Error('Fubi whole envelope: '+message)};
const TARGET=/^(bridge-(main|annex)-roof-(tiles|underside|edge-closure)|bridge-main-yellow-(edge|hip)|bridge-annex-yellow-edge|bridge-(main|annex)-bearing|bridge-finial)$/;
/** All dimensions and analytic curves below are reversible visual fits to the
 * pavilion's own exterior views, not a survey or recovered Qing joinery. */
export function fubiRoofHeight(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>4.250001||z< -6.650001||z>4.250001)fail('outside fitted roof domain');
 const r=Math.min(1,Math.max(Math.abs(x),Math.abs(z))/4.25);
 const main=z>=-4.25?4.85+2.55*Math.pow(1-r,1.55)+.24*Math.pow(Math.abs(x*z)/(4.25*4.25),4):-Infinity;
 const t=Math.min(1,Math.abs(z+4.8)/1.85);
 const annex=z<=-2.95?4.55+1.10*Math.pow(Math.max(0,Math.cos(t*Math.PI/2)),1.65)+.18*Math.pow(Math.abs(x)/4.25,5):-Infinity;
 return Math.max(main,annex);
}
function geometry(faces){const p=faces.flat(2),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const uv=[];for(let i=0;i<p.length;i+=3)uv.push(p[i],p[i+2]);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
// Clip actual triangles, rather than resampling an analytic surface with a
// different tessellation. Coordinates are local X/Y/Z and Y is interpolated.
function clipPolygon(poly,nx,nz,limit,below=true){
 const out=[],value=v=>(nx*v[0]+nz*v[2]-limit)*(below?1:-1);
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=value(a),db=value(b),ia=da<=1e-10,ib=db<=1e-10;if(ia)out.push(a);if(ia!==ib){const t=da/(da-db);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}
 return out.filter((v,i)=>{const a=out[(i+out.length-1)%out.length];return !a||Math.hypot(...v.map((n,k)=>n-a[k]))>1e-9});
}
function solidBelow(top,bottom){
 const faces=[...top],boundary=new Map(),key=v=>v.map(n=>Math.round(n*1e7)).join(',');
 for(const t of top){faces.push(t.map(v=>[v[0],bottom,v[2]]).reverse());for(let i=0;i<3;i++){const a=t[i],b=t[(i+1)%3],id=[key(a),key(b)].sort().join('|');if(boundary.has(id))boundary.delete(id);else boundary.set(id,[a,b]);}}
 for(const[a,b]of boundary.values()){const c=[b[0],bottom,b[2]],d=[a[0],bottom,a[2]];faces.push([a,d,c],[a,c,b]);}return geometry(faces);
}
export function applyFubiWholeEnvelope(builder,g,p){
 if(p.name!=='浮碧亭'||builder.fubiWholeEnvelope===false)return null;
 if(builder.fubiWholeEnvelope!==undefined&&builder.fubiWholeEnvelope!==true)fail('explicit selection must be boolean');
 const a=anchors['浮碧亭'];
 if(p.x!==a.x||p.z!==a.z||p.mainFloor!==.9||p.annexFloor!==.5||p.mainColumnWidth!==7.6||g.position.x!==a.x||g.position.z!==a.z||g.position.y!==0||g.rotation.toArray().slice(0,3).some(v=>v!==0)||g.scale.toArray().some(v=>v!==1)||g.getObjectByName('fubi-whole-envelope'))fail('noncanonical or duplicate host');
 const old=g.children.filter(m=>m.isMesh&&TARGET.test(m.name));
 const count=role=>old.filter(m=>m.name===role).length;
 if(old.length!==38||count('bridge-finial')!==1||count('bridge-main-bearing')!==12||count('bridge-annex-bearing')!==4||count('bridge-main-roof-tiles')!==1||count('bridge-annex-roof-tiles')!==1)fail('retained complete envelope required');
 // Pin the finite original positions/topology/UVs and local transforms as a
 // drift guard (not a security hash); a changed source must be re-reviewed.
 let signature=2166136261;const sourceRows=JSON.stringify(old.map(m=>[m.name,m.position.toArray(),m.quaternion.toArray(),m.scale.toArray(),Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)])),Array.from(m.geometry.index?.array??[])]));for(let i=0;i<sourceRows.length;i++)signature=Math.imul(signature^sourceRows.charCodeAt(i),16777619);if((signature>>>0)!==0x1cb9d781)fail('retained source geometry changed');
 const oldGeometry=new Set(old.map(m=>m.geometry));if(oldGeometry.size!==old.length)fail('shared target geometry');
 builder.group.traverse(m=>{if(m.isMesh&&!old.includes(m)&&oldGeometry.has(m.geometry))fail('borrowed target geometry')});
 for(const m of old)if(!m.geometry.attributes.position||!Array.from(m.geometry.attributes.position.array).every(Number.isFinite))fail('invalid retained geometry');
 const cofferBars=g.children.filter(m=>m.name==='r64-bridge-coffer-frame'),frame=cofferBars[0]?.material;if(!frame||cofferBars.some(m=>m.material!==frame))fail('retained ceiling frame required');
 const result=new THREE.Group();result.name='fubi-whole-envelope';
 const tile=new THREE.MeshStandardMaterial({name:'fubi_green_glaze_fit',color:0x3d9690,roughness:.5});
 const finialGold=new THREE.MeshStandardMaterial({name:'fubi_gold_finial_fit',color:0xbc8425,roughness:.74});
 const red=new THREE.MeshStandardMaterial({name:'fubi_red_gable_apron_fit',color:0x89392d,roughness:.82});
 const field=new THREE.MeshStandardMaterial({name:'fubi_green_coffer_field_fit',color:0x4c8c7a,roughness:.87});
 const blue=new THREE.MeshStandardMaterial({name:'fubi_plain_medallion_field_fit',color:0x304b68,roughness:.87});
 const cofferRed=new THREE.MeshStandardMaterial({name:'fubi_red_coffer_grid_fit',color:0xa53d32,roughness:.87});
 const gold=old.find(m=>m.name==='bridge-main-yellow-edge').material,under=old.find(m=>m.name==='bridge-main-roof-underside').material,wood=old.find(m=>m.name==='bridge-main-bearing').material;
 const owned=[tile,finialGold,blue,red,field,cofferRed],created=new Set(),add=(name,geo,mat,part,parent=result)=>{created.add(geo);const mesh=new THREE.Mesh(geo,mat);mesh.name=name;mesh.userData={role:name,part,fubiWholeEnvelope:true};mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const merged=(name,pieces,mat,part)=>{if(!pieces.length)return;const geo=mergeGeometries(pieces,false);if(!geo)fail('merge failed');for(const piece of pieces){piece.dispose();created.delete(piece)}return add(name,geo,mat,part);};
 try{
  // One height field is the exterior union of both fitted roof forms. It has
  // one perimeter and one underside, so there is no exposed interpenetrating
  // annex/main seam or coplanar overlay at the connection.
  const xs=Array.from({length:29},(_,i)=>-4.25+8.5*i/28),zs=[...new Set([...Array.from({length:37},(_,i)=>-6.65+10.9*i/36),-4.8,-4.25,-2.95,0])].sort((a,b)=>a-b),top=[],bottom=[],edge=[];
  const point=(x,z,offset=0)=>[x,fubiRoofHeight(x,z)+offset,z];
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
   const a=point(xs[i],zs[j]),b=point(xs[i],zs[j+1]),c=point(xs[i+1],zs[j+1]),d=point(xs[i+1],zs[j]);top.push([a,b,c],[a,c,d]);
   const lo=v=>[v[0],v[1]-.12,v[2]];bottom.push([lo(a),lo(c),lo(b)],[lo(a),lo(d),lo(c)]);
  }
  const border=[...xs.map(x=>point(x,-6.65)),...zs.slice(1).map(z=>point(4.25,z)),...xs.slice(0,-1).reverse().map(x=>point(x,4.25)),...zs.slice(1,-1).reverse().map(z=>point(-4.25,z))];
  for(let i=0;i<border.length;i++){const a=border[i],b=border[(i+1)%border.length],c=[b[0],b[1]-.12,b[2]],d=[a[0],a[1]-.12,a[2]];edge.push([a,b,c],[a,c,d]);}
  const roof=new THREE.Group();roof.name='fubi-joined-roof';result.add(roof);add('fubi-joined-roof-tiles',geometry(top),tile,'roof',roof);const underside=add('fubi-joined-roof-underside',geometry(bottom),under,'roof',roof);add('fubi-joined-roof-edge',geometry(edge),under,'roof',roof);
  // Bounded raised tile rolls and perimeter/ridge strips follow the same top
  // function. Counts and radii are fitted rhythm, not a roof-tile inventory.
  const rolls=[],trim=[];
  const tube=(points,radius,bucket,segments=4)=>{if(points.length<2)return;const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)),false,'centripetal');const geo=new THREE.TubeGeometry(curve,Math.max(1,points.length-1),radius,segments,false);created.add(geo);bucket.push(geo);};
  const surface=(x,z,lift=.035)=>[x,fubiRoofHeight(x,z)+lift,z];
  for(let side=0;side<4;side++)for(let k=0;k<25;k++){
   const cross=-4.08+k*8.16/24,start=Math.abs(cross)+.08,points=[];if(start>=4.25)continue;
   for(let j=0;j<=10;j++){const along=start+(4.25-start)*j/10,angle=side*Math.PI/2,x=cross*Math.cos(angle)-along*Math.sin(angle),z=cross*Math.sin(angle)+along*Math.cos(angle);
    // South face tile courses end where the annex covers that face.
    const r=Math.max(Math.abs(x),Math.abs(z))/4.25,main=4.85+2.55*Math.pow(1-r,1.55)+.24*Math.pow(Math.abs(x*z)/(4.25*4.25),4);
    if(fubiRoofHeight(x,z)>main+.0001){tube(points,.037,rolls);points.length=0;continue;}points.push(surface(x,z));
   }tube(points,.037,rolls);
  }
  for(let k=0;k<25;k++){const x=-4.08+k*8.16/24,points=[];for(let j=0;j<=18;j++){const z=-6.65+3.7*j/18,t=Math.abs(z+4.8)/1.85,annex=4.55+1.10*Math.pow(Math.max(0,Math.cos(t*Math.PI/2)),1.65)+.18*Math.pow(Math.abs(x)/4.25,5);if(fubiRoofHeight(x,z)>annex+.0001){tube(points,.037,rolls);points.length=0;continue;}points.push(surface(x,z));}tube(points,.037,rolls);}
  tube([...border,border[0]].map(v=>[v[0],v[1]+.04,v[2]]),.075,trim,6);
  for(const sx of[-1,1])for(const sz of[-1,1]){const points=[];for(let j=0;j<=16;j++){const t=4.25*j/16,x=sx*t,z=sz*t,r=t/4.25,main=4.85+2.55*Math.pow(1-r,1.55)+.24*Math.pow(t*t/(4.25*4.25),4);if(fubiRoofHeight(x,z)>main+.0001){tube(points,.075,trim,6);points.length=0;continue;}points.push(surface(x,z,.07));}tube(points,.075,trim,6);}
  for(const x of[-4.25,4.25])tube(Array.from({length:19},(_,i)=>surface(x,-6.65+3.7*i/18,.07)),.075,trim,6);
  merged('fubi-raised-tile-rolls',rolls,tile,'tile-rhythm');merged('fubi-yellow-roof-borders',trim,gold,'yellow-borders');
  // Each upper contact is clipped from the ACTUAL Float32 roof underside,
  // then extends 15 mm into its 120 mm shell. This bounded hidden overlap
  // removes contact cracks without inventing a walking surface or collider.
  const caps=[],roofPoints=underside.geometry.attributes.position;
  for(const oldCap of old.filter(m=>m.name.endsWith('-bearing'))){const bounds=new THREE.Box3().setFromBufferAttribute(oldCap.geometry.attributes.position),cx=(bounds.min.x+bounds.max.x)/2,cz=(bounds.min.z+bounds.max.z)/2,topFaces=[];
   for(let i=0;i<roofPoints.count;i+=3){let poly=[0,1,2].map(j=>[roofPoints.getX(i+j),roofPoints.getY(i+j),roofPoints.getZ(i+j)]);for(const[nx,nz,limit]of[[1,0,cx+.16],[-1,0,-cx+.16],[0,1,cz+.16],[0,-1,-cz+.16]])poly=clipPolygon(poly,nx,nz,limit);if(poly.length<3)continue;poly=poly.map(v=>[v[0],v[1]+.015,v[2]]).reverse();for(let j=1;j<poly.length-1;j++){const t=[poly[0],poly[j],poly[j+1]];if(new THREE.Triangle(...t.map(v=>new THREE.Vector3(...v))).getArea()>1e-10)topFaces.push(t);}}
   if(!topFaces.length)fail('missing actual roof contact');const geo=solidBelow(topFaces,bounds.min.y);created.add(geo);caps.push(geo);
  }
  merged('fubi-fitted-roof-bearings',caps,wood,'bearings');
  // Source-visible red curved end apron. Both ends use the same explicit
  // roof-form symmetry fit; neither is claimed as surveyed carved decoration.
  for(const side of[-1,1]){const points=zs.filter(z=>z>=-6.65&&z<=-2.95).map(z=>[-z,Math.fround(fubiRoofHeight(side*4.25,z)-.12)]),shape=new THREE.Shape();points.forEach(([z,y],i)=>shape[i?'lineTo':'moveTo'](z,y));for(const[z,y]of[...points].reverse())shape.lineTo(z,y-.45);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.10,steps:1,bevelEnabled:false});geo.rotateY(Math.PI/2);geo.translate(side*4.25-.05,0,0);add('fubi-red-gable-apron-'+side,geo,red,'gable-apron');}
  const finial=new THREE.Group();finial.name='fubi-shaped-finial';result.add(finial);
  const profiles=[['base',gold,[[0,7.36],[.22,7.36],[.26,7.45],[.24,7.52],[.19,7.55],[.19,7.64],[.29,7.67],[.29,7.76],[.21,7.80],[0,7.80]]],['body',finialGold,[[0,7.76],[.18,7.76],[.19,7.85],[.29,7.97],[.34,8.12],[.32,8.25],[.24,8.34],[.11,8.39],[0,8.40]]]];
  for(const [name,mat,points]of profiles){const faces=[],point=(j,i)=>[points[j][0]*Math.sin(i*Math.PI/12),points[j][1],points[j][0]*Math.cos(i*Math.PI/12)];for(let j=0;j<points.length-1;j++)for(let i=0;i<24;i++){const a=point(j,i),b=point(j+1,i),c=point(j+1,i+1),d=point(j,i+1);if(points[j][0]>0)faces.push([a,d,b]);if(points[j+1][0]>0)faces.push([b,d,c]);}add('fubi-finial-'+name,geometry(faces),mat,'finial',finial);}
  // Fubi's own photograph shows red cross bars, green square fields and
  // blue/gold circular fields. These are plain color masses, NOT invented
  // flower paintings. Its text-attested octagonal well stays unchanged.
  for(const kind of ['main','annex']){const parts=[[],[],[]],cells=[];
   if(kind==='main'){for(let i=0;i<8;i++)for(let j=0;j<8;j++)cells.push([-3.325+i*.95,-3.325+j*.95,.95,.95,4.525]);}
   else for(let i=0;i<8;i++)for(let j=0;j<2;j++)cells.push([-3.325+i*.95,-5.6+j*1.2,.95,1.2,3.97]);
   const slab=(bucket,w,depth,d,x,topY,z)=>{
    let poly=[[x-w/2,topY,z-d/2],[x-w/2,topY,z+d/2],[x+w/2,topY,z+d/2],[x+w/2,topY,z-d/2]],pieces=[];
    if(kind==='main'){// Subtract only the real octagonal opening, not a 4x4 square.
     const r=1.42;for(const[nx,nz,limit]of Array.from({length:8},(_,i)=>[Math.sin((i+.5)*Math.PI/4),Math.cos((i+.5)*Math.PI/4),r*Math.cos(Math.PI/8)])){const outside=clipPolygon(poly,nx,nz,limit,false);if(outside.length>=3)pieces.push(outside);poly=clipPolygon(poly,nx,nz,limit);if(poly.length<3)break;}
    }else pieces=[poly];
    for(const points of pieces){const faces=[];for(let j=1;j<points.length-1;j++){const t=[points[0],points[j],points[j+1]];if(new THREE.Triangle(...t.map(v=>new THREE.Vector3(...v))).getArea()>1e-10)faces.push(t);}if(!faces.length)continue;const geo=solidBelow(faces,topY-depth);created.add(geo);parts[bucket].push(geo);}
   };
   for(const[x,z,w,d,y]of cells){
    // Green is an actual ring, not an opaque slab obscuring a recessed field.
    for(const sign of[-1,1]){slab(0,w-.16,.0375,.07,x,y,z+sign*(d/2-.115));slab(0,.07,.0375,d-.30,x+sign*(w/2-.115),y,z);}
    slab(1,w-.30,.022,d-.30,x,y,z);
    for(const sign of[-1,1]){slab(2,w-.22,.012,.017,x,y-.0375,z+sign*(d/2-.11));slab(2,.017,.012,d-.22,x+sign*(w/2-.11),y-.0375,z);}
   }
   for(const[i,pieces]of parts.entries())merged(`fubi-${kind}-coffer-layer-${i}`,pieces,[frame,field,gold][i],kind+'-coffers');
   if(kind==='main'){
    const discs=[],rings=[];
    for(const[x,z,w,d,y]of cells){
     // Keep partial cells by the central well plain; never cover the hole or
     // import Chengrui's separately photographed dragon caisson contours.
     if(Math.hypot(x,z)<1.85)continue;
     const radius=.235,discTop=[],ringTop=[];
     for(let i=0;i<16;i++){
      const a=i*Math.PI/8,b=(i+1)*Math.PI/8;
      const point=(angle,r)=>[x+r*Math.sin(angle),y-.022,z+r*Math.cos(angle)];
      discTop.push([[x,y-.022,z],point(a,radius),point(b,radius)]);
      const p=point(a,radius),q=point(b,radius),r=point(b,radius+.015),t=point(a,radius+.015);
      ringTop.push([p,r,q],[p,t,r]);
     }
     // 6 mm paint/field relief is an explicit visibility fit, flush to its
     // backing field; no floating colored disks or fabricated floral motif.
     const dg=solidBelow(discTop,y-.028),rg=solidBelow(ringTop,y-.028);created.add(dg);created.add(rg);discs.push(dg);rings.push(rg);
    }
    merged('fubi-main-plain-blue-medallions',discs,blue,'main-medallion-fields');
    merged('fubi-main-gold-medallion-borders',rings,gold,'main-medallion-fields');
   }
  }
  const metadata={originalObjectId:'FC-DE4C06C5F7',source:SOURCE,exteriorSource:PHOTO,scope:'MAIN_AND_SOUTH_ANNEX_JOINED_ROOF_BEARINGS_FINIAL_AND_COFFERS_WITH_RETAINED_BRIDGE',accepted:false,photographyDate:null,dimensions:'RETAINED_MODEL_ENVELOPE_PHOTO_GUIDED_CURVES_NOT_SURVEY',roof:'ONE_CLOSED_CONTINUOUS_EXTERIOR_UNION_NOT_TWO_INTERPENETRATING_SHELLS',bearingContact:'ACTUAL_ROOF_TRIANGLE_CLIP_WITH_15MM_HIDDEN_OVERLAP',gableApron:'PHOTOGRAPHED_RED_CURVED_END_TYPE_BILATERAL_SYMMETRY_FIT_NOT_CARVING',ceilingArtwork:'FLOWER_PAINTINGS_AND_DOUBLE_DRAGON_CARVING_UNRECONSTRUCTED',cofferSource:'https://img.dpm.org.cn/Uploads/Picture/dc/8274.jpg',cofferFit:'RED_GRID_GREEN_FIELDS_BLUE_GOLD_CIRCLES_PLAIN_COLOR_MASSES_NOT_ARTWORK_COPY',annexCoffers:'CONTINUATION_FIT_NOT_INDEPENDENT_INTERIOR_PHOTO',retained:'All pool, bridge, steps, seats, columns, beams, caisson, original collision/walkable rows and neighboring pavilions',unknown:['Rear decorative details','Exact roof curves and tile count','Ridge animal carving','Exact wooden bracket joinery','Stone arch and pool survey','Site access and current condition'],gpuAcceptance:false};
  // Construction is complete before disposing any old target geometry.
  for(const m of old){m.removeFromParent();m.geometry.dispose();}for(const bar of cofferBars)bar.material=cofferRed;g.add(result);for(const m of owned)builder.own(m);p.wholeEnvelope=metadata;result.userData=metadata;return result;
 }catch(error){for(const geo of created)geo.dispose();for(const mat of owned)mat.dispose();throw error;}
}
