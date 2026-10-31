import * as THREE from 'three';

const FIT='REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const TOUR='https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/';
const HALF=11.1, RUN=3.2, STAIR_CENTERS={west:-15.8,east:-15.6};
const sources={west:TOUR+'panos/02.tiles/l/l2/02/l2_l_02_02.jpg',westReturn:TOUR+'panos/w02.tiles/r/l2/02/l2_r_02_03.jpg',east:TOUR+'panos/w15.tiles/f/l2/02/l2_f_02_02.jpg',south:TOUR+'panos/01.tiles/b/l1/01/l1_b_01_01.jpg'};

/** Canonical ground-to-door route for consumers whose old direct ground
 * approach is now occupied by the new terrace. y/feetY are feet heights. */
export function wuyingMoonTerraceAccess(item,side='west'){
 if(item.southCourtProfile!=='wuying-front'||!(side in STAIR_CENTERS))throw Error('Wuying moon terrace access requires a known side');
 const sign=side==='west'?1:-1,z=STAIR_CENTERS[side],toe=sign*(HALF+RUN);
 const local=[[toe+sign*.85,z,0],[toe+sign*.01,z,0],...Array.from({length:8},(_,k)=>[toe-sign*(k+.5)*RUN/8,z,item.ph*(k+1)/8]),[sign*(HALF-.9),z,item.ph],[0,-11.8,item.ph],[0,-7,item.ph]];
 return {id:'wuying-moon-terrace-'+side,status:FIT,points:local.map(([x,z,y])=>({x:item.x+x,z:item.z+z,y,feetY:y})),side};
}

/** Visible 2021 topology only. No surveyed widths, stair counts, carved art,
 * north-end closure, or claim about present museum access is inferred. */
export function buildWuyingMoonTerrace(kit,item,f,stone){
 if(item.southCourtProfile!=='wuying-front'||item.x!==219.5||item.z!==-199.2||item.ph!==1.2)throw Error('Moon terrace requires the retained Wuying front-hall registration');
 const y=item.ph,edge=item.w/2+item.pad,back=-item.d/2-item.pad,north=back-1.1,south=-21.3,half=HALF,railInset=.14;
 const causeway={north:south,south:-40.85,halfWidth:4.3,northX:0,southX:1.3,northY:y,southY:.8,
  heightTransitionStatus:'MODEL_DATUM_JOIN_NOT_PHOTOGRAPHIC_EVIDENCE_OF_A_SLOPE',rise:-.4,run:19.55,slope:-.4/19.55,route:[[0,-22],[.65,-31],[1.3,-41.6],[1.3,-44]]};
 const result={dimensionStatus:FIT,photographyDate:null,period:'2021_OPENING_PANORAMA_NOT_CURRENT_SURVEY',sources,deckY:y,northEnd:'UNMODELED_RETAINED_WEST_MIDDLE_NOT_CLOSED_RING',railSegments:[],stairs:[],surfaceSamples:[],causeway,
  limitations:['All extents, post spacing, eight fitted risers and rail profiles are reversible fits, not measurements.','Simple solid lower panels and open upper rail fields omit all carved ornament.','The 19.55 m causeway joins incompatible retained hall/gate datums by a 2.05% fitted grade; the photo does not establish a real ramp.','The old narrow hall south stair is buried by the terrace and its exact ramp support is removed; no below-deck navigation remains.']};
 const c0=kit.colliders.length;
 const mark=(m,role,extra={})=>{m.name=role;Object.assign(m.userData,{role,remainingOuterId:'wuying',wuyingMoonTerrace:true,dimensionStatus:FIT,photographyDate:null,source:extra.source??sources.south,...extra});return m;};
 const solid=(m)=>{m.updateWorldMatrix(true,false);const bb=new THREE.Box3().setFromObject(m);kit.colliders.push(bb);return m;};
 const box=(role,w,h,d,x,yy,z,mat=stone,collision=false,extra={})=>{const m=mark(kit.mesh(f,new THREE.BoxGeometry(w,h,d),mat,x,yy,z),role,extra);return collision?solid(m):m;};
 const support=(x0,z0,x1,z1,yy)=>{kit.walkBox(f,x0,z0,x1,z1,yy);Object.assign(kit.walkables.at(-1),{rescue:false,wuyingMoonTerrace:true});result.surfaceSamples.push({x:(x0+x1)/2,z:(z0+z1)/2,y:yy});};
 // A sloped, closed prism whose exact top is also used for walkable heights.
 const prism=(role,a,b,width,lo,hi,extra={})=>{
  const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),ox=-dz/L*width/2,oz=dx/L*width/2;
  const points=[[a.x+ox,a.y+lo,a.z+oz],[a.x-ox,a.y+lo,a.z-oz],[b.x-ox,b.y+lo,b.z-oz],[b.x+ox,b.y+lo,b.z+oz],
   [a.x+ox,a.y+hi,a.z+oz],[a.x-ox,a.y+hi,a.z-oz],[b.x-ox,b.y+hi,b.z-oz],[b.x+ox,b.y+hi,b.z+oz]];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i);g.index.setX(i,g.index.getX(i+2));g.index.setX(i+2,a);}g.computeVertexNormals();return mark(kit.mesh(f,g,stone,0,0,0),role,extra);
 };
 const slab=(role,x0,z0,x1,z1)=>{box(role,x1-x0,y,z1-z0,(x0+x1)/2,y/2,(z0+z1)/2,kit.lib.material('sumeru_band'),true);box(role+'-paving',x1-x0,.06,z1-z0,(x0+x1)/2,y-.03,(z0+z1)/2,kit.lib.material('stone_slab'));support(x0,z0,x1,z1,y);};
 slab('wuying-moon-terrace-north-shoulder',-edge,north,edge,back);
 slab('wuying-moon-terrace-surface',-half,south,half,north);
 // The hall's old centre stair now lies under the real new slab. Remove only
 // this exact owned support, not foreign ramps or the retained rear approach.
 const oldIndex=kit.walkables.findIndex(w=>w.type==='ramp'&&w.axis==='z'&&Math.abs(w.a0-(item.z+back))<1e-8&&Math.abs(w.a1-(item.z+back-y*1.6))<1e-8&&Math.abs((w.minX+w.maxX)/2-item.x)<1e-8&&w.y0===y&&w.y1===0);
 if(oldIndex<0)throw Error('Wuying retained south stair support must resolve exactly once');
 result.removedCoveredHallRamp=structuredClone(kit.walkables[oldIndex]);kit.walkables.splice(oldIndex,1);
 // In production the gate is built before this hall. Its centre north stair
 // is covered too; retain both lateral gate stairs and every unrelated ramp.
 const gateIndex=kit.walkables.findIndex(w=>w.type==='ramp'&&w.axis==='z'&&Math.abs(w.a0+240.05)<1e-8&&Math.abs(w.a1+238.77)<1e-8&&Math.abs((w.minX+w.maxX)/2-220.8)<1e-8&&w.y0===.8&&w.y1===0);
 result.removedCoveredGateRamp=gateIndex<0?null:structuredClone(kit.walkables[gateIndex]);if(gateIndex>=0)kit.walkables.splice(gateIndex,1);
 // Join the gate's north platform at its original centre and height. The
 // shallow grade is explicitly a MODEL DATUM JOIN, not a claimed real ramp.
 const deckA={x:0,z:south,y},deckB={x:1.3,z:causeway.south,y:.8};
 const deck=prism('wuying-moon-causeway-surface',deckA,deckB,causeway.halfWidth*2,-.8,0,{heightTransitionStatus:causeway.heightTransitionStatus});
 deck.material=kit.lib.material('stone_slab');
 // Straight X cross-sections match the production tapered ramp contract;
 // avoid a tiny rotation-dependent mismatch in the walkable outline.
 const pa=deck.geometry.attributes.position;for(let i=0;i<8;i++){const southEnd=i%4>=2,positive=[0,3,4,7].includes(i);pa.setXYZ(i,(southEnd?1.3:0)+(positive?causeway.halfWidth:-causeway.halfWidth),i<4?0:(southEnd?.8:y),southEnd?causeway.south:south);}pa.needsUpdate=true;deck.geometry.computeVertexNormals();
 kit.walkables.push({type:'ramp',axis:'z',minX:item.x-causeway.halfWidth,maxX:item.x+1.3+causeway.halfWidth,minZ:item.z+causeway.south,maxZ:item.z+south,a0:item.z+south,a1:item.z+causeway.south,y0:y,y1:.8,crossMin0:item.x-causeway.halfWidth,crossMax0:item.x+causeway.halfWidth,crossMin1:item.x+1.3-causeway.halfWidth,crossMax1:item.x+1.3+causeway.halfWidth,rescue:false,wuyingMoonTerrace:true});
 for(let k=0;k<50;k++){const t=(k+.5)/50,x=1.3*t,z=south+(causeway.south-south)*t,yy=y-.4*t;kit.col(f,x-causeway.halfWidth+.03,0,z-.1955,x+causeway.halfWidth-.03,yy-.004,z+.1955);if(k%10===0)result.surfaceSamples.push({x,z,y:yy});}
 // LatheGeometry emits one zero-area face per segment at a radius-zero
 // tip. Drop only those index triples; preserve cap triangles, attributes,
 // bounding volume and the collision shape derived from those vertices.
 const finialGeometry=()=>{
  const g=new THREE.LatheGeometry([[.07,0],[.12,.04],[.14,.13],[.10,.22],[0,.30]].map(v=>new THREE.Vector2(...v)),10),a=g.attributes.position,ix=g.index,kept=[];
  const tri=new THREE.Triangle();
  for(let k=0;k<ix.count;k+=3){const ids=[ix.getX(k),ix.getX(k+1),ix.getX(k+2)];tri.a.fromBufferAttribute(a,ids[0]);tri.b.fromBufferAttribute(a,ids[1]);tri.c.fromBufferAttribute(a,ids[2]);if(tri.getArea()>0)kept.push(...ids);}
  g.setIndex(kept);return g;
 };
 const postKeys=new Set();
 const post=(p,source)=>{const key=[p.x,p.y,p.z].map(v=>v.toFixed(5)).join('/');if(postKeys.has(key))return;postKeys.add(key);box('wuying-moon-rail-post',.22,.94,.22,p.x,p.y+.47,p.z,stone,true,{source});const m=mark(kit.mesh(f,finialGeometry(),stone,p.x,p.y+.94,p.z),'wuying-moon-rail-post-finial',{source,detail:'COARSE_BUD_OUTLINE_NO_CARVING'});solid(m);};
 const rail=(id,a,b,source)=>{
  const L=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(L/1.55),at=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});result.railSegments.push({id,a,b,source});
  for(let k=0;k<n;k++){const aa=at(k/n),bb=at((k+1)/n),mid=at((k+.5)/n);for(const [role,w,lo,hi]of[['base',.23,0,.12],['lower-panel',.13,.12,.43],['top',.19,.72,.84]])solid(prism('wuying-moon-rail-'+role,aa,bb,w,lo,hi,{source,segment:id,panelHeight:hi-lo}));box('wuying-moon-rail-openwork-baluster',.12,.29,.12,mid.x,mid.y+.575,mid.z,stone,true,{source,segment:id,detail:'PLAIN_SUPPORT_NO_UNVERIFIED_CARVING'});post(aa,source);}post(b,source);
 };
 const p=(x,z,yy=y)=>({x,y:yy,z});
 for(const [side,sign,centerZ,source]of[['west',1,STAIR_CENTERS.west,sources.west],['east',-1,STAIR_CENTERS.east,sources.east]]){
  const width=3.8,n=8,run=RUN,toe=sign*(half+run),openNorth=centerZ+width/2,openSouth=centerZ-width/2;
  const stair={side,source,centerZ,width,steps:n,run,rise:y,upperX:sign*half,toeX:toe,route:[[toe+sign*.85,centerZ],[toe,centerZ],[sign*(half-.9),centerZ]]};result.stairs.push(stair);
  for(let k=0;k<n;k++){const h=y*(k+1)/n,xx=toe-sign*(k+.5)*run/n;box('wuying-moon-stair-tread',run/n,h,width,xx,h/2,centerZ,stone,true,{source,side,step:k+1,countStatus:'FITTED_RISERS_NOT_PHOTO_COUNT'});support(xx-run/n/2,openSouth,xx+run/n/2,openNorth,h);}
  const rx=sign*(half-railInset),gx=sign*(edge-railInset);
  rail(side+'-north-flank',p(rx,openNorth+.12),p(rx,north+railInset),source);
  rail(side+'-north-return',p(rx,north+railInset),p(gx,north+railInset),source);
  // Only the photographed near-corner return is added on the east. The
  // existing west middle is joined at its original open southern end.
  rail(side+'-hall-corner-return',p(gx,north+railInset),p(gx,-item.d/2+.4),side==='west'?sources.westReturn:source);
  rail(side+'-south-flank',p(rx,openSouth-.12),p(rx,south+railInset),source);
  rail(side+'-south-wing',p(rx,south+railInset),p(sign*causeway.halfWidth,south+railInset),sources.south);
  for(const [end,zz]of[['north',openNorth+.12],['south',openSouth-.12]])rail(side+'-stair-'+end,p(sign*half,zz),p(toe,zz,0),source);
  rail(side+'-causeway',p(sign*causeway.halfWidth,south+railInset),p(1.3+sign*causeway.halfWidth,causeway.south,.8),sources.south);
 }
 result.addedColliders=kit.colliders.slice(c0).map(b=>({min:b.min.toArray(),max:b.max.toArray()}));
 result.addedWalkables=kit.walkables.filter(w=>w.wuyingMoonTerrace).map(w=>w.type==='box'?{type:w.type,min:w.box.min.toArray(),max:w.box.max.toArray(),rescue:w.rescue}:{...w});
 result.accessRoutes=['west','east'].map(side=>wuyingMoonTerraceAccess(item,side));
 result.navigation={entry:{x:item.x+result.stairs[0].route[0][0],z:item.z+result.stairs[0].route[0][1],feetY:0},inside:{x:item.x,z:item.z-item.d/2+2,feetY:y},entryStatus:'SOURCE_SIDE_STAIR_WITH_MODEL_FIT_ROUTE_NOT_CURRENT_VISITOR_PERMISSION'};
 if(f.userData.southCourt)f.userData.southCourt={...f.userData.southCourt,navigation:result.navigation};
 return result;
}
