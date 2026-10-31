import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance,triangleBodyIntersects,triangleBodySweepFraction} from '../../../utils/TriangleSupport.js';

const issuedTemplates=new WeakMap();
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg';
const isBridge=b=>b?.id==='wenyuan-pond'&&b.family==='pond'&&b.x===-186.5&&b.z===-149&&b.axis==='z'&&b.length===13.2&&b.width===3.4&&b.minWidth===3.4&&b.crest===.18&&b.railEndInset===1.5&&JSON.stringify(b.railSides)==='[-1,1]';
/** Both visible rail runs of this ONE pond bridge. The retained deck, channel,
 * banks and approach stay untouched. Count/metrics are fits, not a survey. */
export function buildWenyuanPondBridgeRails(library,b){
 if(!isBridge(b))throw Error('Wenyuan pond bridge retained identity mismatch');
 const group=new T.Group();group.name='wenyuan-pond-own-source-rails';
 const colliders=[],geometries=new Set(),marble=library.material('marble'),runs=[];
 // Match the actual 32-piece deck, rather than inventing a new curved support.
 const deck=a=>{const u=Math.max(0,Math.min(32,(a+6.6)/.4125)),i=Math.min(31,Math.floor(u)),t=u-i,y=k=>.18*(1-(-1+k/16)**2);return y(i)+(y(i+1)-y(i))*t;};
 const mesh=(geo,role,parts)=>{geometries.add(geo);const tileSize=library.tileSize('marble');let g=geo;if(geo.index){g=geo.toNonIndexed();geometries.add(g);geometries.delete(geo);geo.dispose();}applyBoxUV(g,tileSize);const m=new T.Mesh(g,marble);m.name=`wenyuan-pond-${role}`;m.castShadow=m.receiveShadow=true;m.userData.wenyuanPondRail={objectId:'FC-4591AC1E97',role};group.add(m);parts.push(m);return m;};
 const box=(parts,role,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),role,parts);
 const radial=(parts,role,x,z,y,profile)=>{const n=role==='one-central-short-support'?8:16,p=[],index=[];for(const[h,r]of profile)for(let i=0;i<n;i++){const a=i*2*Math.PI/n;p.push(x+r*Math.cos(a),y+h,z+r*Math.sin(a));}for(let k=0;k<profile.length-1;k++)for(let i=0;i<n;i++){const a=k*n+i,c=k*n+(i+1)%n;index.push(a,a+n,c,c,a+n,c+n);}const lo=p.length/3;p.push(x,y+profile[0][0],z);const hi=p.length/3;p.push(x,y+profile.at(-1)[0],z);for(let i=0;i<n;i++){index.push(lo,i,(i+1)%n);const a=(profile.length-1)*n+i,c=(profile.length-1)*n+(i+1)%n;index.push(hi,c,a);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(index);g.computeVertexNormals();return mesh(g,role,parts);};
 const extrude=(parts,role,x,shape,thickness=.22)=>{const g=new T.ExtrudeGeometry(shape,{depth:thickness,steps:1,bevelEnabled:false,curveSegments:3});g.rotateY(Math.PI/2);g.translate(x-thickness/2,0,b.z);return mesh(g,role,parts);};
 const strip=(parts,role,x,a,c,low,high,thickness=.22)=>{const s=new T.Shape();s.moveTo(-a,deck(a)+low);s.lineTo(-c,deck(c)+low);s.lineTo(-c,deck(c)+high);s.lineTo(-a,deck(a)+high);s.closePath();return extrude(parts,role,x,s,thickness);};
 const hanging=(parts,x,a,y,half)=>{const s=new T.Shape();s.moveTo(-a-half,y+.04);s.lineTo(-a+half,y+.04);s.lineTo(-a+half,y);s.quadraticCurveTo(-a+half*.7,y-.07,-a+half*.45,y);s.quadraticCurveTo(-a,y-.10,-a-half*.45,y);s.quadraticCurveTo(-a-half*.7,y-.07,-a-half,y);s.closePath();return extrude(parts,'plain-cloud-opening-head-type-fit',x,s,.23);};
 const own=(parts,id)=>{const values=[];for(const m of parts){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++){const k=ix?ix.getX(i):i;values.push(p.getX(k),p.getY(k),p.getZ(k));}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(values,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],`wenyuan-pond-rails:${id}`),c=shape.box.clone();c.triangleSupport=shape;const flat=[];for(const q of shape.template.triangles)for(const v of[q.triangle.a,q.triangle.b,q.triangle.c,q.normal,q.box.min,q.box.max])flat.push(v.x,v.y,v.z);issuedTemplates.set(shape.template,{id:shape.id,box:c.clone(),flat:new Float64Array(flat)});colliders.push(c);}finally{g.dispose();}};
 const stations=Array.from({length:8},(_,i)=>-4.7+9.4*i/7);
 try{for(const side of[-1,1]){const x=b.x+side*(b.width/2-.12);
  // The source resolves cylindrical heads, not these dimensions or fine relief.
  // Flat visible tops avoid invented multi-ring shoulders; the 16-sided 0.2m
  // head covers the .28m square shaft corners without hidden support pads.
  for(const[i,a]of stations.entries()){const parts=[],y=deck(a);box(parts,'square-post-stem',.28,.96,.28,x,y+.48,b.z+a);radial(parts,'cylindrical-carved-head-type-fit',x,b.z+a,y,[[.96,.2],[1.37,.2]]);own(parts,`${side}:post:${i}`);}
  for(let i=1;i<stations.length;i++){const a=stations[i-1]+.14,c=stations[i]-.14,mid=(a+c)/2,parts=[];
   strip(parts,'lower-solid-panel',x,a,c,-.002,.54);strip(parts,'continuous-top-rail',x,a,c,.91,1.03,.28);
   radial(parts,'one-central-short-support',x,b.z+mid,deck(mid)+.54,[[0,.07],[.07,.105],[.13,.07],[.24,.07],[.30,.115],[.37,.13]]);
   hanging(parts,x,mid,deck(mid)+.89,.19);hanging(parts,x,a,deck(a)+.89,.10);hanging(parts,x,c,deck(c)+.89,.10);
   // Plain raised borders describe the visible panel division, NOT aquatic relief.
   for(const face of[-1,1]){const xx=x+face*.116;strip(parts,'plain-lower-panel-border',xx,a+.04,c-.04,.10,.13,.012);strip(parts,'plain-lower-panel-border',xx,a+.04,c-.04,.44,.47,.012);for(const z of[a+.055,c-.055])box(parts,'plain-lower-panel-border',.012,.34,.03,xx,deck(z)+.30,b.z+z);}
   own(parts,`${side}:panel:${i-1}`);
  }
  for(const dir of[-1,1]){const parts=[],start=dir*4.7,end=dir*5.1,at=(u,h)=>[-(start+(end-start)*u),deck(start+(end-start)*u)+h],s=new T.Shape();s.moveTo(...at(0,-.002));s.lineTo(...at(1,-.002));s.lineTo(...at(1,.12));s.quadraticCurveTo(...at(.9,.31),...at(.73,.30));s.quadraticCurveTo(...at(.6,.22),...at(.55,.49));s.quadraticCurveTo(...at(.57,.67),...at(.35,.68));s.quadraticCurveTo(...at(.46,.9),...at(.16,.95));s.quadraticCurveTo(...at(.04,1.02),...at(0,1.01));s.closePath();extrude(parts,'descending-cloud-end-panel-type-fit',x,s,.25);own(parts,`${side}:end:${dir}`);}
  runs.push({side,posts:8,panels:7,endSlopes:2,stations:[...stations]});
 }}catch(e){for(const g of geometries)g.dispose();throw e;}
 const metadata={objectId:'FC-4591AC1E97',bridgeId:b.id,sourcePhoto:SOURCE,source:'https://www.dpm.org.cn/explore/building/236513.html',photographyDate:null,scope:'BOTH_COMPLETE_VISIBLE_RAIL_RUNS_DECK_BANKS_VAULT_UNCHANGED',dimensions:'RETAINED_BRIDGE_ENVELOPE_PHOTO_TYPE_FIT_NOT_SURVEY',countStatus:'EIGHT_RETAINED_POSTS_PER_SIDE_FIT_NOT_EXACT_PHOTO_CENSUS',carving:'PLAIN_CYLINDRICAL_HEAD_TYPE_AND_CLOUD_SILHOUETTE_ONLY_AQUATIC_RELIEF_UNMODELED',hiddenFaces:'UNKNOWN_NOT_BORROWED_FROM_WUYING_OR_DUANHONG',wholeObjectAccepted:false,runs};
 group.userData.wenyuanPondRails=metadata;return{group,colliders,metadata};
}


/** Only a body resting on these exact authored rail triangles may move inward
 * across the planar water margin. No fake bank, lowered wall or general bypass.
 * All ordinary collision checks still execute after this narrow water grant. */
export function canRecoverInwardFromWenyuanRail(manager,river,from,to,radius,fromFeet,toFeet){
 if(river?.southWaterProfile!=='r36-south-precinct'||river.position?.x!==0||river.position?.z!==-310.8||!from||!to||radius!==.5||![from.x,from.z,to.x,to.z,fromFeet,toFeet].every(Number.isFinite)||fromFeet<.5||fromFeet>2||toFeet>fromFeet+1e-7||Math.abs(to.z-from.z)>1e-7||Math.abs(to.x-from.x)>.251||Math.abs(to.x+186.5)>=Math.abs(from.x+186.5)-1e-8)return false;
 const owners=manager.colliders.filter(c=>c.triangleSupport&&issuedTemplates.has(c.triangleSupport.template));
 if(owners.length!==34||new Set(owners.map(c=>c.triangleSupport.id)).size!==34)return false;
 // Broadphase follows actual issued bounds plus the full player footprint.
 // A center-only 2.2m cutoff trapped valid contacts on the outside crown edge.
 if(!owners.some(c=>{const b=issuedTemplates.get(c.triangleSupport.template).box;return from.x+radius>=b.min.x&&from.x-radius<=b.max.x&&from.z+radius>=b.min.z&&from.z-radius<=b.max.z&&fromFeet>=b.min.y-.002&&fromFeet<=b.max.y+.002;}))return false;
 for(const c of owners){const shape=c.triangleSupport,r=issuedTemplates.get(shape.template);if(shape.id!==r.id||shape.offset.lengthSq()!==0||!c.box.equals(r.box)||!shape.box.equals(r.box)||!shape.template.bounds.equals(r.box))return false;let k=0;for(const q of shape.template.triangles)for(const v of[q.triangle.a,q.triangle.b,q.triangle.c,q.normal,q.box.min,q.box.max])for(const axis of['x','y','z'])if(v[axis]!==r.flat[k++])return false;if(k!==r.flat.length)return false;}
 const ramps=manager.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&Math.abs(w.minX+188.2)<1e-9&&Math.abs(w.maxX+184.8)<1e-9);if(ramps.length!==32)return false;
 const seen=new Set(),near=(a,b)=>Math.abs(a-b)<1e-9;for(const w of ramps){const i=Math.round((w.a0+149+6.6)/.4125),a=-149+(-1+2*i/32)*6.6,c=-149+(-1+2*(i+1)/32)*6.6,y0=.18*(1-(-1+2*i/32)**2),y1=.18*(1-(-1+2*(i+1)/32)**2);if(i<0||i>=32||seen.has(i)||!near(w.a0,a)||!near(w.a1,c)||w.minZ!==w.a0||w.maxZ!==w.a1||w.y0!==y0||w.y1!==y1||!near(w.crossMin0,-187.96)||!near(w.crossMin1,-187.96)||!near(w.crossMax0,-185.04)||!near(w.crossMax1,-185.04))return false;seen.add(i);}
 const body=new T.Box3(new T.Vector3(from.x-radius,fromFeet+1e-8,from.z-radius),new T.Vector3(from.x+radius,fromFeet+1.7,from.z+radius)),below=body.clone().translate(new T.Vector3(0,-.002,0));
 // Match the real vertical resolver: exact tangency can stop a full body.
 // Inclusive contact is evidence only; positive penetration and later sweeps remain guarded.
 for(const c of owners){const shape=c.triangleSupport;if(fromFeet<shape.box.min.y-.002||fromFeet>shape.box.max.y+.002||!body.clone().expandByScalar(.002).intersectsBox(shape.box))continue;if(!triangleBodyIntersects(shape,body)&&triangleBodySweepFraction(shape,body,below,{includeBoundary:true})!==null)return true;}
 return false;
}
