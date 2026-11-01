/** Six source-attested rear halls. Coordinates/envelopes remain inherited model
 * fits; museum text establishes five bays and hard-gable type, not these metres.
 * Named runtime identities are retained so maps/routes do not silently rename.
 */
const page=n=>`https://www.dpm.org.cn/explore/building/${n}.html`;
export const REAR_HALL_PROFILES=Object.freeze({
 'jingren-rear':{zone:'east-six',x:-93,z:347.4,w:24,d:9.6,name:null,canonicalName:'景仁宫后殿',source:page(236509)},
 'chengqian-rear':{zone:'east-six',x:-93,z:403.9,w:24,d:9.6,name:null,canonicalName:'承乾宫后殿',source:page(236438)},
 'zhongcui-rear':{zone:'east-six',x:-93,z:456,w:24,d:9.6,name:null,canonicalName:'钟粹宫后殿',source:page(236484)},
 'yonghe-rear':{zone:'east-six',x:-148.7,z:401.9,w:24,d:9.6,name:null,canonicalName:'同顺斋',source:page(236518)},
 lijingxuan:{zone:'west-six',x:94.5,z:450.2,w:26.2,d:12.9,name:'储秀宫后殿',canonicalName:'丽景轩',source:page(236486)},
 tongdaotang:{zone:'west-six',x:149.3,z:449.8,w:26.2,d:12.9,name:'咸福宫后殿',canonicalName:'同道堂',source:page(236507)},
});
export function rearHallProfile(zone,item){
 const id=item.rearHallProfile;if(id===undefined)return null;
 const p=REAR_HALL_PROFILES[id];
 if(!p||p.zone!==zone||item.kind!=='hall'||(item.name??null)!==p.name)throw Error('Rear hall profile identity mismatch');
 for(const k of ['x','z','w','d'])if(item[k]!==p[k])throw Error(`Rear hall retained model fit mismatch: ${k}`);
 if(item.roof!=='gable'||item.bays!==5||(item.layers??1)!==1||item.rot!==undefined||item.structure!==undefined)throw Error('Rear hall requires source-attested five-bay single-eave hard-gable shell');
 return {...p,id,dimensionStatus:'RETAINED_SHELL_MODEL_FIT_NOT_SURVEYED',sourceClaim:'Five-bay rear hall with hard-gable roof; canonical name/relative court identity only',interiorStatus:'EXISTING_GENERIC_INTERIOR_UNVERIFIED',photographyDate:null};
}
