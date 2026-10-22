import { REGISTERED_CHARACTER_LIMIT } from './CharacterLimits.js';
import frozenScope from '../../../data/characters/scope.json' with {type:'json'};
const vec=(value,n=3)=>Array.isArray(value)&&value.length===n&&value.every(Number.isFinite);
const text=value=>typeof value==='string'&&value.length>0;
const finiteRange=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
const horizontal=value=>vec(value)&&Math.hypot(value[0],value[2])>1e-6&&Math.abs(value[1])<1e-6;
const orderedBounds=value=>vec(value,4)&&value[0]<value[1]&&value[2]<value[3];
const POSES=['standing','seated','kneeling'];
const REQUIRED_IDS=Object.freeze([...frozenScope.requiredActorIds]);
const REQUIRED_SCENES=Object.freeze({...frozenScope.requiredScenes});
const RELEASE_COVERAGE=Object.freeze(structuredClone(frozenScope.releaseCoverage));

/** Runtime counterpart to data/characters/schema.json. Cross-references,
 *  scope preservation and physical invariants are checked here as well.
 *  Invalid content is reported, never silently repaired or dropped. */
export function validateCharacterRegistry(registry){
 const errors=[],err=(path,message)=>errors.push({path,message});
 if(!registry||typeof registry!=='object'||Array.isArray(registry))return{valid:false,errors:[{path:'$',message:'Registry must be an object'}],counts:{registered:0,required:0,scenes:{}}};
 const r=registry;
 if(r.schemaVersion!==2)err('schemaVersion','Expected version 2');
 if(r.unit!=='meter')err('unit','World lengths must be meters');
 const maps={},globalIds=new Set();
 for(const key of ['actors','templates','anchors','surfaces','seats','paths','ceremonies','evidence']){
  const m=maps[key]=new Map();
  if(!Array.isArray(r[key])){err(key,'Expected an array');continue;}
  for(const [i,value]of r[key].entries()){
   if(!value||typeof value!=='object'||!text(value.id)){err(`${key}[${i}].id`,'Nonempty stable ID required');continue;}
   if(globalIds.has(value.id))err(`${key}.${value.id}`,'Duplicate globally stable ID');
   globalIds.add(value.id);m.set(value.id,value);
  }
 }
 const ref=(type,id,path)=>{const value=maps[type].get(id);if(!value)err(path,`Unresolved ${type} reference: ${String(id)}`);return value;};
 const sameZone=(a,b,path)=>{if(a&&b&&a.zoneRef!==b.zoneRef)err(path,'Binding and referenced object must share a zone');};
 const evidence=(ids,path)=>{if(!Array.isArray(ids)||ids.length===0){err(path,'Evidence references required');return;}for(const id of ids)ref('evidence',id,path);};
 const scope=r.scope&&typeof r.scope==='object'?r.scope:{};
 if(scope.registeredHardLimit!==REGISTERED_CHARACTER_LIMIT)err('scope.registeredHardLimit','Registered limit must match the bounded runtime capacity');
 const forbiddenIds=new Set((Array.isArray(scope.forbiddenAreas)?scope.forbiddenAreas:[]).map(v=>v?.id));
 for(const e of maps.evidence.values()){
  if(!text(e.title)||!/^https:\/\/(?:www\.|img\.)?dpm\.org\.cn\//.test(e.url??''))err(`evidence.${e.id}`,'Official museum title and HTTPS URL required');
  for(const key of ['supportedDetails','simplifications','era','referenceImageOrPage'])if(!text(e[key]))err(`evidence.${e.id}.${key}`,'Evidence scope and simplification boundary required');
 }
 for(const t of maps.templates.values()){
  const q=`templates.${t.id}`;
  if(!Array.isArray(t.allowedPoses)||!t.allowedPoses.length||t.allowedPoses.some(p=>!POSES.includes(p)))err(q+'.allowedPoses','Allowed pose list invalid');
  if(!finiteRange(t.heightMeters,1.55,1.8))err(q+'.heightMeters','Unhatted height must be 1.55–1.80 m');
  if(!horizontal(t.modelForward))err(q+'.modelForward','Finite horizontal model-forward vector required');
  evidence(t.evidenceRefs,q+'.evidenceRefs');
 }
 if(maps.templates.size!==7)err('templates','Seven independently identifiable templates are required');
 for(const a of maps.anchors.values()){
  const q=`anchors.${a.id}`;
  if(!['layout','zone-item','zone-region','world'].includes(a.resolver))err(q,'Unsupported anchor resolver');
  if(!text(a.zoneRef)||!text(a.source))err(q,'Zone and frozen source required');
  if(a.resolver==='world'&&!vec(a.positionMeters))err(q,'World anchor needs finite coordinates');
  if(a.resolver!=='world'&&!text(a.building))err(q,'Named architectural anchor required');
 }
 for(const s of maps.surfaces.values()){
  const q=`surfaces.${s.id}`,a=ref('anchors',s.anchorRef,q+'.anchorRef');sameZone(s,a,q);
  if(!orderedBounds(s.localBoundsMeters))err(q+'.localBoundsMeters','Ordered nonempty XZ bounds required');
  if(!Number.isFinite(s.expectedHeightMeters)||!finiteRange(s.heightToleranceMeters,.000001,.03))err(q,'Finite support layer and ≤3 cm tolerance required');
  if(!['ground','walkable'].includes(s.kind)||!text(s.source))err(q,'Support kind and geometry source required');
 }
 for(const s of maps.seats.values()){
  const q=`seats.${s.id}`,a=ref('anchors',s.anchorRef,q+'.anchorRef'),surface=ref('surfaces',s.surfaceRef,q+'.surfaceRef');sameZone(s,a,q);sameZone(s,surface,q);
  if(!vec(s.localSeatContactMeters)||!vec(s.localPelvisMeters)||!orderedBounds(s.seatBoundsLocalMeters)||!Number.isFinite(s.seatTopHeightMeters)||!horizontal(s.forwardLocal))err(q,'Complete finite seat contact, pelvis and facing required');
  if(!['standard','raised-footstool','throne-front-perch','kang-low'].includes(s.seatVariant))err(q+'.seatVariant','Verified pose variant required');
  if(!Array.isArray(s.footSupport?.localContactsMeters)||s.footSupport.localContactsMeters.length!==2||s.footSupport.localContactsMeters.some(v=>!vec(v)))err(q+'.footSupport','Two real foot-support contacts required');
  if(!finiteRange(s.footSupport?.heightToleranceMeters,.000001,.03)||!text(s.geometrySource))err(q,'Foot tolerance and geometry source required');
  if(vec(s.localSeatContactMeters)&&Math.abs(s.localSeatContactMeters[1]-s.seatTopHeightMeters)>.001)err(q,'Seat contact must use the named actual seat height');
  evidence(s.evidenceRefs,q+'.evidenceRefs');
 }
 for(const p of maps.paths.values()){
  const q=`paths.${p.id}`,a=ref('anchors',p.anchorRef,q+'.anchorRef'),surface=ref('surfaces',p.surfaceRef,q+'.surfaceRef');sameZone(p,a,q);sameZone(p,surface,q);
  const points=p.pointsLocalMeters;
  if(!Array.isArray(points)||points.length<2||points.some(v=>!vec(v)))err(q+'.pointsLocalMeters','At least two finite points required');
  else if(points.slice(1).some((v,i)=>Math.hypot(v[0]-points[i][0],v[2]-points[i][2])<1e-6))err(q+'.pointsLocalMeters','Zero-length segments are not permitted');
  if(!finiteRange(p.radiusMeters,.1,1)||!finiteRange(p.safetyMarginMeters,0,1)||!finiteRange(p.validationSpacingMeters,.001,.25))err(q,'Finite body radius, margin and ≤0.25 m sampling required');
  if(!Number.isInteger(p.formationSize)||p.formationSize<1||p.formationSize>8)err(q+'.formationSize','Bounded positive formation size required');
  if(!finiteRange(p.turningRadiusMeters,p.radiusMeters+p.safetyMarginMeters,2))err(q+'.turningRadiusMeters','Turn disc must cover body plus margin');
  if(p.crossZone!==false)err(q,'First version only permits same-zone paths');
  if(!Array.isArray(p.allowedDoorRefs)||p.allowedDoorRefs.length!==0)err(q+'.allowedDoorRefs','This release has no verified doorway crossings');
  if(!Array.isArray(p.forbiddenAreaRefs)||p.forbiddenAreaRefs.some(id=>!forbiddenIds.has(id)))err(q+'.forbiddenAreaRefs','Unknown forbidden-area reference');
 }
 for(const c of maps.ceremonies.values()){
  if(c.mode!=='waiting-only'||c.formalExcerptEnabled!==false||c.sharedPhase!==true||!finiteRange(c.minimumWaitingSeconds,60,3600))err(`ceremonies.${c.id}`,'Only shared waiting tableau is verified in this release');
  evidence(c.evidenceRefs,`ceremonies.${c.id}.evidenceRefs`);
 }
 const scenes={},actors=Array.isArray(r.actors)?r.actors:[],routeSlots=new Map();let required=0;
 for(const a of maps.actors.values()){
  const q=`actors.${a.id}`,t=ref('templates',a.templateId,q+'.templateId'),b=a.behavior??{},p=a.placement??{};
  if(typeof a.required!=='boolean')err(q+'.required','Boolean required flag needed');
  if(a.required)required++;scenes[a.sceneRef]=(scenes[a.sceneRef]??0)+1;
  if(!text(a.zoneRef)||!text(a.sceneRef))err(q,'Zone and scene required');
  if(!['essential','core','ambient'].includes(a.priority))err(q+'.priority','Stable priority required');
  if(!['ceremony-daylight','daily-daylight','guard-duty'].includes(a.schedule))err(q+'.schedule','Unknown day/night schedule');
  if(a.history?.presentation!=='interpretive'||!text(a.history?.era)||a.history?.namedIdentity!==false)err(q+'.history','Anonymous interpretation and era boundary required');
  evidence(a.history?.evidenceRefs,q+'.history.evidenceRefs');
  if(!POSES.includes(b.basePose)||!Array.isArray(t?.allowedPoses)||!t.allowedPoses.includes(b.basePose))err(q+'.behavior.basePose','Template does not support pose');
  if(!Number.isSafeInteger(b.seed)||b.seed<0)err(q+'.behavior.seed','Stable nonnegative seed required');
  if(!['surface','seat','path'].includes(p.mode))err(q+'.placement.mode','Select exactly one supported placement mode');
  if(p.mode==='surface'){
   const surface=ref('surfaces',p.surfaceRef,q+'.placement.surfaceRef'),anchor=ref('anchors',p.anchorRef,q+'.placement.anchorRef');sameZone(a,surface,q);sameZone(a,anchor,q);
   if(surface&&surface.anchorRef!==p.anchorRef)err(q+'.placement','Actor and surface need the same reference frame');
   if(!vec(p.offsetMeters)||!horizontal(p.forwardLocal))err(q+'.placement','Finite offset and horizontal facing required');
   if(b.basePose==='seated')err(q+'.placement','Seated actors need a seat reference');
  }
  if(p.mode==='seat'){
   const seat=ref('seats',p.seatRef,q+'.placement.seatRef');sameZone(a,seat,q);
   if(b.basePose!=='seated')err(q+'.placement','Seat placement needs seated pose');
   if(seat&&b.seatVariant!==seat.seatVariant)err(q+'.behavior.seatVariant','Actor must use the contact-verified furniture pose variant');
   if(!vec(p.offsetMeters)||p.offsetMeters.some(v=>v!==0))err(q+'.placement.offsetMeters','This release uses the exact verified seat contact, not an extra offset');
  }
  if(p.mode==='path'){
   const path=ref('paths',p.pathRef,q+'.placement.pathRef'),surface=ref('surfaces',p.surfaceRef,q+'.placement.surfaceRef');sameZone(a,path,q);sameZone(a,surface,q);
   if(path&&path.surfaceRef!==p.surfaceRef)err(q+'.placement','Route and actor support must match');
   if(!finiteRange(b.speedMetersPerSecond,.1,1.2)||!finiteRange(b.pauseSeconds,2,4)||!Number.isInteger(b.followerIndex)||b.followerIndex<0||!finiteRange(b.followerSpacingMeters,1,3))err(q+'.behavior','Finite bounded speed, pauses and follower spacing required');
   if(path&&b.followerIndex>=path.formationSize)err(q+'.behavior.followerIndex','Follower is outside route formation');
   const slots=routeSlots.get(p.pathRef)??[];if(slots.some(other=>other.behavior.followerIndex===b.followerIndex))err(q+'.behavior.followerIndex','Duplicate route follower slot');slots.push(a);routeSlots.set(p.pathRef,slots);
  }
  if(b.type==='ceremony-participant')ref('ceremonies',b.ceremonyRef,q+'.behavior.ceremonyRef');
 }
 for(const [id,members]of routeSlots){const path=maps.paths.get(id);if(path&&members.length!==path.formationSize)err(`paths.${id}.formationSize`,'Logical members must fill the declared formation');for(const a of members)for(const key of ['speedMetersPerSecond','pauseSeconds','followerSpacingMeters'])if(a.behavior[key]!==members[0].behavior[key])err(`paths.${id}.${key}`,'One shared formation requires identical timing and spacing');}
 if(actors.length>REGISTERED_CHARACTER_LIMIT||actors.length>(scope.registeredHardLimit??REGISTERED_CHARACTER_LIMIT))err('actors','Registered hard limit exceeded');
 if(required<38)err('scope.minimumRequired','At least 38 required logical actors must exist');
 if(scope.baselineCommit!==frozenScope.baselineCommit||scope.sceneEnabledByDefault!==false||scope.releaseGate!=='c1-user-visual-approval')err('scope','Frozen building baseline and C1 visual release gate are mandatory');
 if(!Array.isArray(scope.requiredActorIds)||scope.requiredActorIds.length!==REQUIRED_IDS.length||REQUIRED_IDS.some(id=>!scope.requiredActorIds.includes(id)))err('scope.requiredActorIds','Frozen required coverage manifest cannot be rewritten');
 for(const id of REQUIRED_IDS)if(!maps.actors.get(id)?.required)err(`scope.requiredActorIds.${id}`,'Required actor is missing or downgraded');
 for(const [scene,min]of Object.entries(REQUIRED_SCENES))if([...maps.actors.values()].filter(a=>a.sceneRef===scene&&a.required).length<min)err(`scope.requiredScenes.${scene}`,'Frozen required scene coverage not met');
 for(const [release,coverage]of Object.entries(RELEASE_COVERAGE)){
  const supplied=scope.releaseCoverage?.[release],ids=coverage.additionalRequiredActorIds;
  if(!Array.isArray(supplied?.additionalRequiredActorIds)||supplied.additionalRequiredActorIds.length!==ids.length||ids.some(id=>!supplied.additionalRequiredActorIds.includes(id))||supplied.minimumRegistered!==coverage.minimumRegistered)err(`scope.releaseCoverage.${release}`,'Versioned additional required coverage cannot be removed or rewritten');
  if(actors.length<coverage.minimumRegistered)err(`scope.releaseCoverage.${release}.minimumRegistered`,'Registered release coverage not met');
  for(const id of ids)if(!maps.actors.get(id)?.required)err(`scope.releaseCoverage.${release}.${id}`,'Release-required actor is missing or downgraded');
 }

 return{valid:errors.length===0,errors,counts:{registered:actors.length,required,scenes}};
}
export class CharacterSchema{static validate(registry){return validateCharacterRegistry(registry);}}
export function assertCharacterRegistry(registry){const result=validateCharacterRegistry(registry);if(!result.valid)throw new Error(result.errors.map(e=>`${e.path}: ${e.message}`).join('\n'));return result;}
