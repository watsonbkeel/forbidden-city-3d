import * as THREE from 'three';

// Photo-informed topology inside the retained model envelope, not a tracing or
// a 27-metre measured reconstruction. Local directions are model coordinates.
const CONTROLS=[[-.43,-.40],[-.45,-.15],[-.40,.20],[-.30,.35],[-.16,.35],[-.12,.25],[-.16,.15],[-.28,.12],[-.30,0],[-.23,-.32],[-.12,-.32],[-.06,-.04],[-.06,.10],[0,.16],[.06,.10],[.06,-.04],[.12,-.32],[.23,-.32],[.30,0],[.28,.12],[.16,.15],[.12,.25],[.16,.35],[.30,.35],[.40,.20],[.45,-.15],[.43,-.40]];
const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
export function channelOutlineIntersections(points){let n=0;for(let i=0;i<points.length;i++)for(let j=i+2;j<points.length;j++){if(i===0&&j===points.length-1)continue;const a=points[i],b=points[(i+1)%points.length],c=points[j],d=points[(j+1)%points.length];if(cross(a,b,c)*cross(a,b,d)<-1e-14&&cross(c,d,a)*cross(c,d,b)<-1e-14)n++;}return n;}
export function xishangChannelProfile(p){
 const width=p.localW*.66*.78,depth=p.localD*.32,zCenter=-p.localD*.32;
 let controls=CONTROLS.map(([x,z])=>new THREE.Vector3(x*width,0,z*depth));for(let pass=0;pass<3;pass++){const next=[controls[0]];for(let i=1;i<controls.length;i++){next.push(controls[i-1].clone().lerp(controls[i],.25),controls[i-1].clone().lerp(controls[i],.75));}next.push(controls.at(-1));controls=next;}
 const curve=new THREE.CatmullRomCurve3(controls,false,'centripetal'),count=400,samples=[],left=[],right=[];
 let length=0,minRadius=Infinity,minRadiusAt=null,maxSampleStep=0;
 for(let i=0;i<=count;i++){const t=i/count,v=curve.getPoint(t),d=curve.getTangent(t),w=.11+.035*Math.sin(Math.PI*t)**2,normal={x:-d.z,z:d.x};const q={x:v.x,z:v.z+zCenter,width:w};samples.push(q);left.push({x:q.x+normal.x*w/2,z:q.z+normal.z*w/2});right.push({x:q.x-normal.x*w/2,z:q.z-normal.z*w/2});if(i){const step=Math.hypot(q.x-samples[i-1].x,q.z-samples[i-1].z);length+=step;maxSampleStep=Math.max(maxSampleStep,step);}}
 for(let i=1;i<count;i++){const a=samples[i-1],b=samples[i],c=samples[i+1],ab=Math.hypot(a.x-b.x,a.z-b.z),bc=Math.hypot(b.x-c.x,b.z-c.z),ac=Math.hypot(a.x-c.x,a.z-c.z),area2=Math.abs(cross(a,b,c));if(area2>1e-12){const r=ab*bc*ac/(2*area2);if(r<minRadius){minRadius=r;minRadiusAt=b;}}}
 const outline=[...left,...right.reverse()],intersections=channelOutlineIntersections(outline);
 // Non-local opposing banks: exclude neighbours along the same bend. The
 // band subtracts both segment sampling errors from sample clearance. It
 // bounds the non-local (>23 sample intervals) segment-pair clearance only.
 let minBand=Infinity;for(let i=0;i<samples.length;i++)for(let j=i+24;j<samples.length;j++)minBand=Math.min(minBand,Math.hypot(samples[i].x-samples[j].x,samples[i].z-samples[j].z)-(samples[i].width+samples[j].width)/2);
 minBand-=2*maxSampleStep;
 if(intersections||minBand<=0||minRadius<=Math.max(...samples.map(q=>q.width))/2)throw Error(`Unsafe fitted Xishang channel offsets: intersections=${intersections}, band=${minBand}, radius=${minRadius}, at=${JSON.stringify(minRadiusAt)}`);
 return{status:'PHOTO_INFORMED_MODEL_FIT_NOT_SURVEY',accepted:false,historicalLengthMetres:27,metricSampleCount:count+1,metricStatus:"SAMPLED_MODEL_DIAGNOSTICS_NOT_ANALYTICAL_EXTREMA",modelLengthMetres:length,lengthResidualMetres:27-length,minimumCurvatureRadius:minRadius,minimumStoneBand:minBand,stoneBandMetric:"NONLOCAL_SAMPLE_PAIR_CLEARANCE_MINUS_TWO_MAX_SAMPLE_STEPS",maxSampleStep,outlineSelfIntersections:intersections,stoneTop:p.ph+.2,bottomY:p.ph+.14,waterY:p.ph+.15,width,depth,zCenter,samples,outline,source:'https://www.dpm.org.cn/explore/building/236514.html',residual:'Retained small envelope does not reproduce the official 27m length; bend radii, widths and depths are reversible fits.'};
}
function path(points,Type=THREE.Path){let ring=[...points],changed=true;while(changed&&ring.length>3){changed=false;for(let i=0;i<ring.length;i++){const a=ring[(i+ring.length-1)%ring.length],b=ring[i],c=ring[(i+1)%ring.length];if(Math.abs(cross(a,b,c))/Math.hypot(c.x-a.x,c.z-a.z)<1e-5){ring.splice(i,1);changed=true;break;}}}const s=new Type();ring.forEach((q,i)=>i?s.lineTo(q.x,-q.z):s.moveTo(q.x,-q.z));s.closePath();return s;}
export function buildXishangChannel(c){const p=xishangChannelProfile(c.p),outer=[{x:-p.width/2,z:p.zCenter-p.depth/2},{x:p.width/2,z:p.zCenter-p.depth/2},{x:p.width/2,z:p.zCenter+p.depth/2},{x:-p.width/2,z:p.zCenter+p.depth/2}],stone=path(outer,THREE.Shape);stone.holes.push(path(p.outline));const geo=new THREE.ExtrudeGeometry(stone,{depth:p.stoneTop-p.bottomY,bevelEnabled:false});geo.rotateX(-Math.PI/2);c.tag(c.kit.mesh(c.f,geo,c.mats.stone,0,p.bottomY,0),'channel-stone-field',{part:'closed-cut-stone-with-channel-walls'});
 c.box('channel-stone-field','stone',p.width,.11,p.depth,0,p.bottomY-.055,p.zCenter,false).userData.part='closed-channel-bottom';
 const water=new THREE.ShapeGeometry(path(p.outline,THREE.Shape));water.rotateX(-Math.PI/2);const origin=p.samples[0];water.translate(-origin.x,0,-origin.z);c.tag(c.kit.mesh(c.f,water,c.mats.water,origin.x,p.waterY,origin.z),'stream-channel-bed',{part:'continuous-water-at-real-shallow-recess'});
 // The player's 1m footprint straddles the <=.145m shallow channel; both
 // stone banks support it. This local surface fixes the inherited .20m foot
 // burial without raising the pavilion floor or enabling a water route.
 c.walk(-p.width/2,p.zCenter-p.depth/2,p.width/2,p.zCenter+p.depth/2,p.stoneTop);
 p.supportPolicy='LOCAL_STONE_FIELD_BODY_FOOTPRINT_STRADDLES_NARROW_SHALLOW_CHANNEL';
 return p;
}
