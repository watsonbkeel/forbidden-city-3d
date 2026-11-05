import * as T from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236431.html';
const PHOTO='https://img.dpm.org.cn/Uploads/image/2025/09/29/c2f44b867bfa08-NeYmtDOcI218985.png';
const OLD=[['dougong_band',24],['rafters',732],['roof_tile',1080],['roof_ridge_glaze',924],['wall_red',96],['wood_column',96]];
// Complete public-base configurations, selected jointly by live UV inputs and
// cache identity, never material name alone or a per-mesh payload mixture.
// Current shipped HD/SD images and actual image/manifest failure fallback.
const PAYLOADS=[
 {tiles:[1,1,1,1],aspect:1,production:false,hashes:[1012903583,2708000945,838176517,266686026,1856956201,547719889]},
 ...[[1409/1024,3599949444],[705/512,383775208],[1,1012903583]].map(([aspect,band])=>({tiles:[3,3,1.5,4],aspect,production:true,hashes:[band,3678139485,1645782425,266686026,1610038169,57269497]}))
];
const done=new WeakSet(),near=(a,b)=>Math.abs(a-b)<1e-8;
const mutable=a=>Array.isArray(a)&&Object.getPrototypeOf(a)===Array.prototype&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable&&a.every((_,i)=>Object.getOwnPropertyDescriptor(a,i)?.writable);
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
function digest(g){let h=2166136261;for(const a of Object.values(g.attributes).map(a=>a.array))for(const v of new Uint8Array(a.buffer,a.byteOffset,a.byteLength)){h^=v;h=Math.imul(h,16777619)}return h>>>0}
function validate(kit,f,item){
 if(item?.name!=='古华轩'||item.structure!=='guhua-open-pavilion'||item.guhuaProfile!=='guhua-open-restored-2025-fit-v1'||!['x','z','w','d','ph','colH','bays'].every((k,i)=>item[k]===[-253.9,387.4,14.3,8.7,.5,5,3][i])||kit?.root?.name!=='ningshou'||kit.root.parent||!identity(kit.root)||kit.root.position.lengthSq()!==0||f?.parent!==kit.root||!identity(f)||!near(f.position.x,item.x)||f.position.y!==0||!near(f.position.z,item.z)||!mutable(f.children)||!mutable(kit.owned)||done.has(f))throw Error('Exact mutable Guhua roof host required, once only');
 const targets=[];f.traverse(o=>{if(o.name==='roof_xieshan')targets.push(o)});if(targets.length!==1||targets[0].parent!==f||f.children.some(o=>o.userData.guhuaRolledRoof))throw Error('One exact original Guhua roof required');
 const old=targets[0];if(!identity(old)||old.position.lengthSq()!==0||old.children.length!==6||!mutable(old.children)||old.userData.ownedMaterials?.length!==0)throw Error('Malformed Guhua original roof');
 for(const [i,[suffix,count]]of OLD.entries()){const m=old.children[i],g=m?.geometry,mat=suffix==='roof_ridge_glaze'?kit.ridge:kit.lib.material(suffix);if(!m?.isMesh||m.children.length||m.name!=='roof_xieshan_'+(suffix==='roof_ridge_glaze'?suffix:mat.name)||!identity(m)||m.position.lengthSq()!==0||m.material!==mat||g?.index!==null||Object.keys(g.attributes).sort().join(',')!=='normal,position,uv'||g.attributes.position.count!==count)throw Error('Guhua original roof payload mismatch: '+suffix)}
 const tiles=['roof_tile','rafters','wood_column','wall_red'].map(k=>kit.lib.tileSize(k)),aspect=kit.lib.aspect('dougong_band'),production=kit.lib.material('roof_tile').name==='roof_tile_material';
 const profile=PAYLOADS.find(p=>p.production===production&&p.aspect===aspect&&p.tiles.every((v,i)=>v===tiles[i]));
 if(!profile||!profile.hashes.every((h,i)=>digest(old.children[i].geometry)===h))throw Error('Guhua original complete six-mesh UV configuration/payload mismatch');
 return old;
}
/** Private one-building visual replacement. Official text establishes rolled
 * hip-gable/no straight ridge; only local tile/eave palette is photo checked.
 * Dimensions, curvature, timber sizes and hidden surfaces remain model fits.
 * No pedestrian collider, support template, walkable, room or map is added. */
export function replaceGuhuaRoof(kit,f,item){
 const old=validate(kit,f,item),geometries=[],materials=[],r=new T.Group();r.name='guhua-rolled-hip-gable';
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='guhua_roof_'+(borrow?'roof_tile_':'')+name+'_fit';m.color.setHex(color);m.roughness=.72;m.side=T.FrontSide;return m};
 const mesh=(role,g,m)=>{const o=new T.Mesh(g,m);o.name='guhua-roof/'+role;o.userData.guhuaRoofPart=true;o.castShadow=o.receiveShadow=true;r.add(o);return o};
 // Every new piece is a closed solid. Top/bottom have matching tessellation;
 // the complete front-to-back field crosses the crown without a ridge box.
 function solid(role,m,nx,nz,point,bottom=.14){const g=own(),p=[],uv=[],ix=[],N=(nx+1)*(nz+1),n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(const lower of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const v=point(i/nx,j/nz);p.push(v[0],lower?(typeof bottom==='function'?bottom(v):v[1]-bottom):v[1],v[2]);uv.push(v[0],v[2]);}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+N,d+N,c+N,b+N)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+N,a+N);q(d,c,c+N,d+N)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+N,b+N);q(c,d,d+N,c+N)}
  g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m);
 }
 const EX=8.95,EZ=6.15,GX=5.4,GZ=2.9,EY=5.72,RISE=3.18;
 const L=(x,z)=>.55*Math.pow(Math.abs(x)/EX,6)*Math.pow(Math.abs(z)/EZ,6);
 const Y=z=>EY+RISE*Math.pow(Math.max(0,Math.cos(Math.abs(z)/EZ*Math.PI/2)),1.3);
 const Z=t=>t<6/32?-EZ+(t*32/6)*(EZ-GZ):t<=26/32?-GZ+(t*32-6)/20*(2*GZ):GZ+(t*32-26)/6*(EZ-GZ);
 const HX=z=>GX+(EX-GX)*Math.max(0,(Math.abs(z)-GZ)/(EZ-GZ));
 try{
  const yellow=mat('yellow_field',0xc49b48,'roof_tile'),green=mat('green_edge',0x35634d,'roof_tile'),wood=mat('plain_bearing',0x725039);
  solid('continuous-yellow-field',yellow,20,32,(u,v)=>{const z=Z(v);const x=(2*u-1)*HX(z);return[x,Y(z)+L(x,z),z]});
  for(const sign of[-1,1]){
   // x increases on both sides, keeping outward orientation identical.
   solid('lower-hip-skirt-'+sign,yellow,6,20,(u,v)=>{const t=sign>0?u:1-u,z=GZ+(EZ-GZ)*t;const x=sign*(GX+(EX-GX)*t),zz=(2*v-1)*z;return[x,Y(z)+L(x,zz),zz]});
  }
  // Decorations and bearing tops sample the actual low-detail triangles, not
  // a separately tessellated analytic curve that can cut through their skin.
  const triangles=[];
  for(const m of r.children){const p=m.geometry.attributes.position,ix=m.geometry.index,N=p.count/2;for(let i=0;i<ix.count;i+=3){const a=ix.getX(i),b=ix.getX(i+1),c=ix.getX(i+2);if(a>=N||b>=N||c>=N)continue;const x=p.getX(a),z=p.getZ(a),y=p.getY(a),dx=p.getX(b)-x,dz=p.getZ(b)-z,dy=p.getY(b)-y,ex=p.getX(c)-x,ez=p.getZ(c)-z,ey=p.getY(c)-y,den=dx*ez-ex*dz;triangles.push({x,z,y,dx,dz,dy,ex,ez,ey,den,minX:Math.min(x,x+dx,x+ex),maxX:Math.max(x,x+dx,x+ex),minZ:Math.min(z,z+dz,z+ez),maxZ:Math.max(z,z+dz,z+ez)})}}
  const skinY=(x,z)=>{x=Math.max(-EX+1e-5,Math.min(EX-1e-5,x));z=Math.max(-EZ+1e-5,Math.min(EZ-1e-5,z));let y=-Infinity;for(const t of triangles){if(x<t.minX-1e-7||x>t.maxX+1e-7||z<t.minZ-1e-7||z>t.maxZ+1e-7)continue;const u=((x-t.x)*t.ez-t.ex*(z-t.z))/t.den,v=(t.dx*(z-t.z)-(x-t.x)*t.dz)/t.den;if(u>=-1e-7&&v>=-1e-7&&u+v<=1+1e-7)y=Math.max(y,t.y+u*t.dy+v*t.ey)}if(!Number.isFinite(y))throw Error('Guhua fitted roof skin sample missing');return y};
  for(const sign of[-1,1]){
   const points=Array.from({length:21},(_,i)=>new T.Vector2(-GZ+2*GZ*i/20,Y(-GZ+2*GZ*i/20)+L(GX,-GZ+2*GZ*i/20)-.14));
   const g=own(),p=[],uv=[],ix=[],N=points.length;
   for(const x of[sign*GX-.07,sign*GX+.07])for(const v of points){p.push(x,v.y,v.x);uv.push(v.x,v.y)}
   for(const[a,b,c]of T.ShapeUtils.triangulateShape(points,[]))ix.push(a,b,c,a+N,c+N,b+N);
   for(let i=0;i<N;i++){const j=(i+1)%N;ix.push(i,j,i+N,i+N,j,j+N)}
   // Shape triangulation is in z/y; front/back must face -x/+x.
   let vol=0;for(let i=0;i<ix.length;i+=3){const a=new T.Vector3(...p.slice(ix[i]*3,ix[i]*3+3)),b=new T.Vector3(...p.slice(ix[i+1]*3,ix[i+1]*3+3)),c=new T.Vector3(...p.slice(ix[i+2]*3,ix[i+2]*3+3));vol+=a.dot(b.cross(c))/6}if(vol<0)for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];
   g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh('closed-curved-gable-'+sign,g,wood);
   solid('green-eave-'+sign,green,20,2,(u,v)=>{const z=sign*(EZ-.22+(.22+.04*(EZ-GZ)/(EX-GX))*(sign>0?v:1-v));const x=(2*u-1)*HX(z);return[x,skinY(x,z)+.045,z]},.17);
   solid('green-curved-gable-border-'+sign,green,1,20,(u,v)=>{const z=-GZ+2*GZ*v;return[sign*GX-.11+.22*u,Y(z)+L(sign*GX,z)+.028,z]},.18);
   solid('green-hip-eave-'+sign,green,2,20,(u,v)=>{const x=sign*(EX-.22+.26*(sign>0?u:1-u)),z=(2*v-1)*(GZ+(EZ-GZ)*(Math.abs(x)-GX)/(EX-GX));return[x,skinY(x,z)+.045,z]},.17);
   // Exact top profile meets the actual underside, not a flat floating lid.
   solid('bearing-long-'+sign,wood,24,1,(u,v)=>{const x=-7.4+14.8*u,z=sign*(4.6-.16+.16*(sign>0?v:1-v));return[x,skinY(x,z)-.13,z]},()=>6.1);
   solid('bearing-end-'+sign,wood,1,24,(u,v)=>{const x=sign*(7.4-.16+.16*(sign>0?u:1-u)),z=-4.44+8.88*v;return[x,skinY(x,z)-.13,z]},()=>6.1);
  }
  // Small continuous low-detail tile rolls fit the locally seen course cue.
  // They follow the same crown and stop at green eaves, never a main ridge.
  for(let k=0;k<31;k++){const x=-5.1+10.2*k/30;solid('continuous-tile-roll-'+k,yellow,2,32,(u,v)=>{const z=Math.max(-EZ+.26,Math.min(EZ-.26,Z(v))),xx=x+(u-.5)*.13;return[xx,skinY(xx,z)+.018+.045*Math.sin(Math.PI*u),z]},.045)}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 r.userData.guhuaRolledRoof={sourceObjectId:'FC-A1EA21A7C3',scope:'TEXT_GUIDED_ROOF_FORM_WITH_LOCAL_PHOTO_PALETTE_FIT',source:SOURCE,palettePhoto:PHOTO,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,fullCrownGablePhotoVerified:false,dimensions:'MODEL_FIT_NOT_SURVEY',noStraightMainRidge:true,retainedBearing:old.children.slice(0,2).map(m=>m.name),limits:'Full crown/gable pixels unavailable; all curvature, thickness, tile spacing, border widths and hidden construction are fitted.'};
 const before=[...f.children],index=before.indexOf(old),owned=kit.owned.length;
 // Publish fully staged geometry first. Failed publication leaves the exact old
 // target attached; only private staged resources may be released.
 try{f.add(r);Array.prototype.push.apply(kit.owned,materials)}catch(e){f.children.splice(0,f.children.length,...before);for(const c of before)c.parent=f;r.parent=null;kit.owned.splice(owned);for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const retained=old.children.slice(0,2),removed=old.children.slice(2);for(const m of retained){old.children.splice(old.children.indexOf(m),1);r.children.unshift(m);m.parent=r;}
 f.children.splice(0,f.children.length,...before.map((o,i)=>i===index?r:o));old.parent=null;for(const m of removed)m.geometry.dispose();done.add(f);return r;
}
