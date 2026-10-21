/** R36 southern precinct. +X west, +Z north, 1 unit = 1 metre.
 * Official sources constrain topology/bay count. Independent dimensions below
 * are reversible fits inside retained D1/OSM GROUP envelopes, NOT surveys.
 * An OSM group centroid must never be relabelled as a front-hall centre.
 */
const fit='OFFICIAL_TOPOLOGY_REVERSIBLE_MODEL_FIT';
export const SOUTH_COURTS=Object.freeze({
 wenhua:Object.freeze({
  zone:'outer-east',sources:[{url:'https://www.dpm.org.cn/explore/building/236531.html',use:'South-facing five by three front hall, shallower rear, connector, east Benren / west Jiyi'}, {url:'https://www.dpm.org.cn/classify_detail/379521.html',use:'2026-08-31 installation photograph, not second-period object inventory'}],
  referenceEnvelope:{x:-186.4,z:-186.1,width:37.5,depth:50.5,status:'LEGACY_D1_OSM_GROUP_INCLUDING_APRON_AND_REAR_NOT_OFFICIAL_SURVEY'},
  front:{name:'文华殿',x:-186.4,z:-199,w:30.8,d:17,colH:7.68,ph:1.2,pad:.8,bays:5},
  rear:{name:'主敬殿',x:-186.4,z:-167,w:26,d:12,colH:6.72,ph:1.2,pad:.8,bays:5},
  connector:{x:-186.4,z:-181.75,w:8.8,d:17.5,colH:5.9,ph:1.2,pad:0,bays:1},
  exhibit:{identity:'wenhua-calligraphy-painting',sourceDate:'2026-09',newsPublicationDate:'2026-08-31',panoramaPackageDate:'2026-09-11',photographyDate:null,period:'2026-09-01 to 09-27 first-period installation; second-period object locations unverified',fidelity:'DATED_PHOTO_LAYOUT_FIT_NOT_CURRENT_INVENTORY',source:'https://www.dpm.org.cn/classify_detail/379521.html',limitations:['Seven official first-period panorama viewpoints distinguish front island, passage screen, connector and rear circular display; dimensions and exact coordinates are visual fits.','No invented calligraphy, paintings, imperial throne or current object identities.']},
 }),
 wuying:Object.freeze({
  zone:'outer-west',sources:[{url:'https://www.dpm.org.cn/explore/building/236500.html',use:'Five by three front hall, rear Jingsi and connector; independent annex identities'}, {url:'https://www.dpm.org.cn/museology/talk/255000.html',use:'2020 design dimensions; not a current survey'}, {url:'https://www.dpm.org.cn/show/255509.html',use:'2021-05-01 completed ceramic-gallery photograph'}],
  referenceEnvelope:{x:219.5,z:-185.9,width:38.5,depth:53,status:'LEGACY_D1_OSM_GROUP_INCLUDING_APRON_AND_REAR_NOT_OFFICIAL_SURVEY'},
  front:{name:'武英殿',x:219.5,z:-199.2,w:31.8,d:16.8,colH:7.68,ph:1.2,pad:1,bays:5},
  rear:{name:'敬思殿',x:219.5,z:-165.4,w:28,d:12,colH:6.4,ph:1.2,pad:.8,bays:5},
  connector:{x:219.5,z:-181.1,w:9.2,d:19.4,colH:5.9,ph:1.2,pad:0,bays:1},
  exhibit:{identity:'wuying-ceramics',sourceDate:'2021-05',newsPublicationDate:'2021-04-30',panoramaPackageDate:'2021-05-17',photographyDate:null,referencePeriod:'2021 opening panorama; photography date not stated',designDate:'2020-12',fidelity:'DATED_PHOTO_LAYOUT_FIT_NOT_CURRENT_INVENTORY',source:'https://www.dpm.org.cn/show/255509.html',designSource:'https://www.dpm.org.cn/museology/talk/255000.html',caseHeight:3.65,glassHeight:2.53,caseDepth:.9,connectorCaseDepth:.8,maintenanceGap:.65,cornerDegrees:135,limitations:['Case dimensions are published design values; fitted run lengths and individual vessel positions are not surveyed.','Only observed ceramic form classes are represented, not an exact reproduction or current inventory.','Sixteen independent cases are verified individually in the 2021 built panorama as four front-outside, five rear, seven exhibit-in-exhibit. The superseded 2020 five-inside proposal is not used.']},
 }),
});
export function southCourtGeometry(item){
 const match=/^(wenhua|wuying)-(front|rear|connector)$/.exec(item?.southCourtProfile??'');
 if(!match||item.structure!=='south-court-hall')throw Error('South court requires a known dedicated profile');
 const[,court,part]=match,p=SOUTH_COURTS[court],s=p[part];
 if(item.rot!==undefined&&item.rot!==0&&item.rot!=='south')throw Error('South court requires south-facing registration');
 if(item.throne||item.open||item.roomBays||item.enter!==true)throw Error('South court cannot use generic furniture or segmented rooms');
 for(const key of['x','z','w','d','ph','pad','colH','bays'])if(!Number.isFinite(item[key])||Math.abs(item[key]-s[key])>1e-7)throw Error(`South court fitted ${key} mismatch`);
 if(part!=='connector'&&item.name!==s.name)throw Error('South court building identity mismatch');
 const front=s.z-s.d/2,rear=s.z+s.d/2;
 return{id:`${p.zone}/${item.southCourtProfile}`,profile:item.southCourtProfile,court,part,zone:p.zone,...s,
  floorY:s.ph,front,rear,dimensionStatus:fit,sources:p.sources,referenceEnvelope:p.referenceEnvelope,exhibit:p.exhibit,
  bounds:{minX:s.x-s.w/2,maxX:s.x+s.w/2,minZ:front,maxZ:rear},
  portals:[{x:s.x,z:front},{x:s.x,z:rear}],navigation:{entry:{x:s.x,z:front-(s.pad??0)-s.ph*1.6-1.1,feetY:0},inside:{x:s.x,z:front+(court==='wenhua'&&part==='rear'?1:2),feetY:s.ph}},
 };
}
