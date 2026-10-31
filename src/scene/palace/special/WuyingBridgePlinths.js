import * as T from 'three';

// Own bridge panoramas vp3532/3538/3539, complete six 640px cube faces,
// plus south vp3533 and north vp3535/3537. This is the visible low stone
// beneath the rails, NOT evidence for hidden bridge vaults or foundations.
export const WUYING_PLINTH_METADATA = Object.freeze({
 runs:2,endFeet:4,height:.10,panelWidth:.23,postWidth:.32,endWidth:.40,endExtent:9.04,
 dimensionStatus:'VISIBLE_TYPE_PHOTO_FIT_NOT_SURVEYED',
 segmentation:'RETAINED_RAIL_STATIONS_NOT_STONE_BLOCK_CENSUS',
 railAssemblyLift:.10,postTop:'LEVEL_SEAT_FOR_UNCHANGED_SQUARE_SHAFT',
 sourceViews:Object.freeze(['3532','3533','3535','3537','3538','3539']),
 scope:'LOW_RAIL_BASE_AND_END_FEET_ONLY_NO_BANK_OR_VAULT_CHANGE',
});

const stations=Array.from({length:10},(_,i)=>-7.85+15.7*i/9);
const intervals=[...stations.map(a=>[a-.145,a+.145]),...stations.slice(1).map((a,i)=>[stations[i]+.145,a-.145]),[-9.04,-7.995],[7.995,9.04]];

/** A closed, shallow bevelled solid for one existing triangle owner. The
 * builder joins these intervals before registering the owner's real triangles;
 * no extra walkable, top-only proxy or broad body box is manufactured. */
export function wuyingBridgePlinthGeometry(b,side,a,c){
 const i=['wuying-1','wuying-2','wuying-3'].indexOf(b?.id);
 const z=-249.8-(17.9+1.6)/2-.8*1.6-4.8-18.4/2;
 if(i<0||b.family!=='wuying'||b.axis!=='z'||b.x!==220.8+(i-1)*34.9/5||b.z!==z||b.length!==18.4||b.crest!==.45||b.width!==(i===1?5:3.8)||b.minWidth!==b.width||JSON.stringify(b.railSides)!=='[-1,1]'||![-1,1].includes(side)||![a,c].every(Number.isFinite)||a>=c||!intervals.some(([from,to])=>a===from&&c===to))throw Error('Wuying bridge plinth retained identity/span mismatch');
 // Unmeasured widths are conservatively fitted beneath the existing upper
 // rail/post footprints in the wet crossing. This retains a thin visible
 // shoulder beside each .20-wide panel without creating a new outside ledge
 // that a full-body impact could catch but the smaller circular foot cannot.
 // Only the already-dry bridge ends project to the observed wider end feet.
 const end=Math.abs(a)>=7.995&&Math.abs(c)>=7.995,post=!end&&c-a<.30;
 const x=b.x+side*(b.width/2-.12),mid=(a+c)/2,positions=[],indices=[];
 const alongs=post?[a,mid,c]:[a,c],seat=b.crest*(1-(mid/(b.length/2))**2)+.10;
 for(const along of alongs){
  const deck=b.crest*(1-(along/(b.length/2))**2);
  // Posts have a real horizontal seat. The exposed lower shoulder widens
  // only at the shaft centre, under the existing pointed crown footprint.
  // Adjacent joints stay within the retained .29 m shaft projection.
  const half=end?.20:post?(along===mid?.16:.145):.115;
  const upper=post?.145:half-.005,top=post?seat:deck+.10;
  const ring=[[-half,deck-.02],[half,deck-.02],[half,top-.025],[upper,top],[-upper,top],[-half,top-.025]];
  const widthScale=end&&Math.abs(along)>9?.84:1;
  for(const [cross,height]of ring)positions.push(x+cross*widthScale,height,b.z+along);
 }
 for(let r=0;r<alongs.length-1;r++)for(let k=0;k<6;k++){const j=(k+1)%6,u=r*6,v=u+6;indices.push(u+k,u+j,v+j,u+k,v+j,v+k);}
 if(post){
  // A fan from an interior point keeps the collinear shoulder/seat vertices
  // at end joints nondegenerate; no duplicate or coplanar overlapping caps.
  for(const [r,reverse]of[[0,true],[alongs.length-1,false]]){
   const centre=positions.length/3;let y=0;for(let k=0;k<6;k++)y+=positions[r*18+k*3+1]/6;
   positions.push(x,y,b.z+alongs[r]);
   for(let k=0;k<6;k++){const u=r*6+k,v=r*6+(k+1)%6;indices.push(centre,...(reverse?[v,u]:[u,v]));}
  }
 }else for(let k=1;k<5;k++)indices.push(0,k+1,k,6,6+k,6+k+1);
 const geometry=new T.BufferGeometry();
 try{geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;}
 catch(error){geometry.dispose();throw error;}
}
