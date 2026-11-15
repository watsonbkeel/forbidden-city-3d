import * as T from 'three';
/** Original procedural fit informed by the documented eight-tier upward lotus.
 * No image, material, collision or host ownership. Caller owns returned geometry.
 * Positive Z is front; every metric and petal count is engineering-fit. */
export function createEightTierLotus(){
 const positions=[],indices=[],tierValues=[],tiers=[],groups=[];
 const vertex=(x,y,z,tier=0)=>{const i=positions.length/3;positions.push(x,y,z*.85);tierValues.push(tier);return i;};
 const tri=(a,b,c)=>indices.push(a,b,c);
 const profile=[[0,.28],[.07,.32],[.17,.39],[.29,.46],[.43,.53],[.57,.575],[.70,.595],[.77,.58]];
 const coreR=y=>{for(let i=1;i<profile.length;i++){if(y<=profile[i][0]){const [a,b]=profile[i-1],[c,d]=profile[i];return b+(d-b)*(y-a)/(c-a);}}return profile.at(-1)[1];};
 // Closed leaf: single tip vertices, three six-sided rings. No collapsed rings.
 function leaf(angle,baseY,length,width,bulge,tier,curl=false){
  const faceStart=indices.length;const start=positions.length/3,point=(t,across,depth)=>{const r=curl?.26+.13*t:coreR(baseY+length*t)+.003+.006*Math.sin(Math.PI*t)+.014*t**4;const y=curl?.025+.12*Math.sin(t*Math.PI*.9)+depth:baseY+length*t;return vertex(r*Math.sin(angle)+across*Math.cos(angle),y,(r+(curl?0:depth))*Math.cos(angle)-across*Math.sin(angle),tier);};
  // Radial depth must contribute along both horizontal axes for upright petals.
  const ringPoint=(t,a)=>{const s=Math.sin(Math.PI*t),across=(curl?width*s*(1.12-.32*t):coreR(baseY+length*t)*Math.tan(Math.PI/20)*.97*(t<=.6?(.15+1.40*t):(.99*(1-t)/.4)))*Math.cos(a),depth=bulge*s*Math.sin(a);if(curl)return point(t,across,depth);const r=coreR(baseY+length*t)+.003+.002*s+.014*t**4+depth;return vertex(r*Math.sin(angle)+across*Math.cos(angle),baseY+length*t,r*Math.cos(angle)-across*Math.sin(angle),tier);};
  const bottom=point(0,0,0);for(const t of [.20,.60,.85])for(let k=0;k<6;k++)ringPoint(t,2*Math.PI*k/6);const top=point(1,0,0);
  for(let k=0;k<6;k++)tri(bottom,start+1+(k+1)%6,start+1+k);
  for(let j=0;j<2;j++)for(let k=0;k<6;k++){const a=start+1+j*6+k,b=start+1+j*6+(k+1)%6,c=a+6,d=b+6;tri(a,b,c);tri(b,d,c);}
  for(let k=0;k<6;k++)tri(start+13+k,start+13+(k+1)%6,top);
  if(!curl)for(let i=faceStart;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
  return{vertexStart:start,vertexCount:20,baseY:curl?.025:baseY,tipY:curl?.025+.12*Math.sin(Math.PI*.9):baseY+length};
 }
 // Closed upper-wide rounded core, restrained neck beneath the final petal tips.
 const segments=32;
 const bottom=vertex(0,0,0);for(const[y,r]of profile)for(let k=0;k<segments;k++){const a=k*2*Math.PI/segments;vertex(r*Math.sin(a),y,r*Math.cos(a));}const top=vertex(0,.77,0);
 for(let k=0;k<segments;k++)tri(bottom,1+(k+1)%segments,1+k);
 for(let j=0;j<profile.length-1;j++)for(let k=0;k<segments;k++){const a=1+j*segments+k,b=1+j*segments+(k+1)%segments,c=a+segments,d=b+segments;tri(a,b,c);tri(b,d,c);}
 for(let k=0;k<segments;k++)tri(1+7*segments+k,1+7*segments+(k+1)%segments,top);
 groups.push({start:0,count:indices.length,materialIndex:0});let first=indices.length;
 for(let i=0;i<8;i++){const baseY=.08+i*.083,length=.115,petals=[];for(let k=0;k<20;k++)petals.push(leaf(2*Math.PI*(k+(i%2)*.5)/20,baseY,length,.074,.018,i+1));tiers.push({id:i+1,baseY,tipY:baseY+length,petals});}
 groups.push({start:first,count:indices.length-first,materialIndex:1});first=indices.length;
 for(let k=0;k<6;k++)leaf(2*Math.PI*k/6,0,0,.16,.014,0,true);
 groups.push({start:first,count:indices.length-first,materialIndex:2});
 const geometry=new T.BufferGeometry();try{
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(positions.flatMap((v,i)=>i%3===0?[.5+v/1.32,positions[i+1]/.8]:[]),2));geometry.setAttribute('lotusTier',new T.Uint8BufferAttribute(tierValues,1));geometry.setIndex(indices);for(const g of groups)geometry.addGroup(g.start,g.count,g.materialIndex);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  geometry.userData={id:'original-eight-tier-lotus-fit',front:'LOCAL_POSITIVE_Z',eightTiers:true,tiers,materialSlots:['rounded-core','eight-upturned-petal-tiers','curled-base-leaves'],precisionClass:'ALL_METRICS_PETAL_COUNT_COLOR_ENGINEERING_FIT',historicalClaim:'EIGHT_UPWARD_TIERS_ONLY_NOT_MEASURED_PROFILE',sourceReference:'DPM2015 Investigation p303-304 figure13, locally viewed; no photo embedded',surfaceFit:'PETALS_FOLLOW_COMMON_GLOBAL_Y_CORE_WITH_PARTIAL_EMBEDDING',collisionProvided:false,baseLeaves:6,originalSupportIncluded:false};return geometry;
 }catch(error){geometry.dispose();throw error;}
}
