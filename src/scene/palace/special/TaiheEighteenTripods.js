import * as T from 'three';
// Official text establishes eighteen. The 4/4/4/6 distribution is read from
// two own south photos; all metre locations below are reversible engineering fits.
export function buildTaiheEighteenTripods(builder,parent,bronze,tiers){
 const a=tiers.filter(t=>!t.plinth).sort((a,b)=>a.tier-b.tier);
 if(a.length!==3||a.some((t,i)=>t.tier!==i+1||!Number.isFinite(t.zEdge)||!Number.isFinite(t.y1)))throw Error('Taihe tripods require actual three south tiers');
 const rows=[{level:0,y:0,z:a[0].zEdge-a[0].run-2,x:[-15.5,-5.5,5.5,15.5]},...a.map((t,i)=>({level:i+1,y:t.y1,z:t.zEdge+2.4,x:i===2?[-31,-22,-5.5,5.5,22,31]:[-15.5,-5.5,5.5,15.5]}))];
 const records=[];
 for(const row of rows)for(const x of row.x){
  const id=`axis/taihe-eighteen-tripods/${row.level}/${x}`,g=new T.Group();g.name=id;
  const record={id,level:row.level,x,z:row.z,floorY:row.y,positionStatus:'PHOTO_DISTRIBUTION_ENGINEERING_FIT_NOT_SURVEY'};
  g.userData.taiheTripodOwner=record;g.userData.structure={...record,entityId:'FC-A478209231',scope:'EIGHTEEN_BRONZE_TRIPODS_ONLY',accepted:false,documentaryCount:18,photoFitDistribution:[4,4,4,6],hiddenCarving:'UNMODELED'};parent.add(g);
  const start=builder.colliders.length;
  const base=builder.box(g,builder.library.material('stone_slab'),1.4,.16,1.4,x,row.y+.08,row.z,{box:builder.library.tileSize('stone_slab')});
  builder.col(x-.7,row.y,row.z-.7,x+.7,row.y+.16,row.z+.7);
  builder.tripod(g,bronze,x,row.y+.16,row.z);
  g.traverse(o=>{if(o.isMesh){o.userData.taiheTripod=id;o.castShadow=o.receiveShadow=true;}});
  for(const c of builder.colliders.slice(start))c.taiheTripod=id;
  records.push(record);
 }
 return records;
}
