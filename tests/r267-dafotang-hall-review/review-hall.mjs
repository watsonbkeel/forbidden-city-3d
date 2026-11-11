import * as THREE from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {resolveRemainingProfile,buildRemainingHall} from '../../src/scene/palace/special/RemainingOuterHalls.js';
import {Environment} from '../../src/scene/Environment.js';
import {ShadowSetup} from '../../src/render/ShadowSetup.js';
import {setBuildingDetailQuality} from '../../src/render/BuildingDetailQuality.js';
import zone from '../../data/zones/outer-west.json';
import {LABEL,SETTINGS,VIEWS,requireReady} from './contract.mjs';

const receipt={status:'LOADING',label:LABEL,identity:__R267_REVIEW_IDENTITY__,settings:SETTINGS,physicsConsumer:'NONE',collisionStatus:'NOT_VALIDATED',releaseAccepted:false,visualReview:'REQUIRED',postProcessing:SETTINGS.postProcessing,errors:[],cleanup:null};
let renderer,library,kit,group,environment,shadow,camera,scene,disposed=false,finishing=false;
const tracked=new Map(),buttons=[],textureErrors=[];
const watch=resource=>{if(!resource?.addEventListener||tracked.has(resource.uuid))return;const row={uuid:resource.uuid,type:resource.type??resource.constructor.name,name:resource.name??'',disposals:0};tracked.set(resource.uuid,row);resource.addEventListener('dispose',()=>row.disposals++);};
const geometryWatch=root=>root?.traverse(n=>watch(n.geometry));
function publish(){document.querySelector('#status').textContent=receipt.status;}
function fail(error){receipt.status='FAILED';receipt.errors.push(String(error?.stack??error));publish();}
function dispose(){
 if(disposed)return receipt.cleanup;disposed=true;buttons.forEach(b=>b.disabled=true);
 const errors=[];const run=(name,fn)=>{try{fn();}catch(e){errors.push(name+': '+e.message);}};
 // Source geometries already released by finish are never traversed again.
 if(kit)run('kit',()=>kit.dispose(group??(!finishing?kit.root:null)));
 run('source references',()=>{group?.removeFromParent();kit?.root.clear();if(kit){kit.colliders.length=0;kit.walkables.length=0;kit.rooms.length=0;kit.regions.length=0;kit.plaques.length=0;kit.mapItems.length=0;kit.owned.length=0;if(kit.ownedTextures)kit.ownedTextures.length=0;}});
 run('environment',()=>environment?.dispose());run('library',()=>library?.dispose());
 run('renderer',()=>{renderer?.renderLists.dispose();renderer?.dispose();renderer?.forceContextLoss();});
 const resources=[...tracked.values()],bad=resources.filter(r=>r.disposals!==1);
 // The real merger's partial-failure ownership is not invented as successful.
 receipt.cleanup={status:errors.length||bad.length||finishing?'FAILED':'COMPLETE',errors,tracked:resources.length,disposals:resources,bad,partialFinish:finishing,physicsReferencesCleared:!kit?.colliders.length&&!kit?.walkables.length};
 if(receipt.cleanup.status!=='COMPLETE')fail(Error('Private hall cleanup incomplete'));
 group=kit=library=environment=renderer=shadow=camera=scene=null;return receipt.cleanup;
}
function renderView(id){
 if(disposed)throw Error('review disposed');const view=VIEWS.find(v=>v.id===id);if(!view)throw Error('unknown declared review camera');
 const world=a=>[a[0]+221.9,a[1],a[2]+241.1];camera.position.fromArray(world(view.position));camera.fov=view.fov;camera.lookAt(...world(view.target));camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 environment.update(camera,0);const meshes=[];scene.traverse(n=>{if(n.isMesh)meshes.push(n);});shadow.updateShadowLOD(camera,meshes,150);
 renderer.render(scene,camera);renderer.getContext().finish();
 const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
 receipt.view={...view,worldPosition:camera.position.toArray(),worldTarget:world(view.target),kind:'FIXED_REVIEW_CAMERA_NOT_NAVIGATION'};
 receipt.draw={...renderer.info.render};receipt.gl={lost:gl.isContextLost(),version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),unmaskedRenderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,width:gl.drawingBufferWidth,height:gl.drawingBufferHeight};
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));
}
window.__R267_HALL_REVIEW__=Object.freeze({read:()=>structuredClone(receipt),dispose});
window.addEventListener('error',e=>fail(e.error??e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));window.addEventListener('pagehide',dispose,{once:true});
for(const v of VIEWS){const b=document.createElement('button');b.textContent=v.label;b.dataset.view=v.id;b.disabled=true;b.onclick=()=>{try{renderView(v.id);requireReady(receipt);}catch(e){fail(e);dispose();}};document.querySelector('#views').append(b);buttons.push(b);}
async function initialize(){
try{
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(60,SETTINGS.width/SETTINGS.height,.1,2500);
 renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#hall'),antialias:true,alpha:false});renderer.setPixelRatio(SETTINGS.dpr);renderer.setSize(SETTINGS.width,SETTINGS.height,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=SETTINGS.exposure;renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.addEventListener('webglcontextlost',()=>{if(!disposed)fail(Error('WebGL context lost'));});
 shadow=new ShadowSetup(renderer);shadow.init('high');
 const manager=new THREE.LoadingManager();manager.onError=url=>textureErrors.push(url);
 library=new TextureLibrary({quality:'hd',anisotropy:Math.min(renderer.capabilities.getMaxAnisotropy(),8),manager});setBuildingDetailQuality(library,'high');await library.load();library.allTextures().forEach(watch);
 receipt.textures={manifest:!!library.manifest,baseURL:library.baseUrl,loadedFromFile:[...library.loadedFromFile].sort(),fallbacks:Object.keys(TEXTURE_SPECS).filter(n=>!library.has(n)),missingNormals:Object.entries(library.manifest?.textures??{}).filter(([n,v])=>v.normal&&!library.normals.has(n)).map(([n])=>n),errors:textureErrors,assets:Object.entries(library.manifest?.textures??{}).map(([name,info])=>({name,color:info.color??null,normal:info.normal??null,colorLoaded:library.has(name),normalLoaded:library.normals.has(name)}))};
 if(!receipt.textures.manifest||receipt.textures.fallbacks.length||receipt.textures.missingNormals.length||receipt.textures.errors.length)throw Error('Actual production textures incomplete; no hall build attempted');
 const loadedFonts=await document.fonts.load('16px "Noto Sans CJK SC"','大佛堂萬壽無疆');await document.fonts.ready;receipt.fonts={status:document.fonts.status,cjk:document.fonts.check('16px "Noto Sans CJK SC"','大佛堂萬壽無疆'),loadedFaceCount:loadedFonts.length,verification:'Browser FontFaceSet plus required external fc-match receipt'};
 environment=new Environment(scene,renderer,library);environment.init();environment.setTimePreview(new Date(SETTINGS.date));environment.setQuality(true);
 kit=new CourtKit(library,'outer-west');const matches=zone.items.filter(i=>i.name==='大佛堂');if(matches.length!==1)throw Error('Unique original Dafotang record required');const item=matches[0],profile=resolveRemainingProfile('outer-west',item);if(profile?.key!=='dafotang')throw Error('Original profile required');buildRemainingHall(kit,item,profile);
 const sources=[];kit.root.traverse(n=>{if(n.isMesh)sources.push(n);});
 const owners=sources.filter(n=>n.userData.dafotangLayoutRole),band=sources.filter(n=>n.userData.dafotangUpperCentralBandRole),west=sources.filter(n=>n.userData.dafotangUpperWestBandRole),east=sources.filter(n=>n.userData.dafotangUpperEastBandRole),principal=sources.filter(n=>n.name.startsWith('dafotang-shakyamuni-historical-fit/'));
 if(owners.length!==85||band.length!==1||west.length!==1||east.length!==1||new Set([...owners,...band,...west,...east].map(n=>n.uuid)).size!==88)throw Error('Exactly 85+central1+west1+east1 distinct source owners required');
 const bandBefore=[];
 const ownerRows=[...owners,...band,...west,...east].map(n=>{
  const kind=n.userData.dafotangLayoutRole?'layout':n.userData.dafotangUpperCentralBandRole?'central':n.userData.dafotangUpperWestBandRole?'west':'east',tag=kind==='layout'?'dafotangLayout':kind==='central'?'dafotangUpperCentralBand':kind==='west'?'dafotangUpperWestBand':'dafotangUpperEastBand',role=n.userData[tag+'Role'];
  const contacts=kit.colliders.filter(c=>c[tag+'Mesh']===n.uuid),contact=contacts[0];
  if(contacts.length!==1||contact[tag+'Role']!==role||contact.triangleSupport?.id!==n.name+'/'+n.uuid)throw Error('Original/new source contact identity changed');
  if(kind!=='layout')bandBefore.push({kind,mesh:n,geometry:n.geometry,material:n.material,contact});
  return{kind,name:n.name,uuid:n.uuid,role,geometryUuid:n.geometry.uuid,materialUuid:n.material.uuid,material:n.material.name,noMerge:n.userData.noMerge===true,geometryTriangles:(n.geometry.index?.count??n.geometry.attributes.position.count)/3,contact:{count:contacts.length,meshUuid:contact[tag+'Mesh'],role:contact[tag+'Role'],id:contact.triangleSupport.id}};
 });
 // Compare the actual west support to its actual source mesh, not a count proxy.
 const westBefore=bandBefore.find(row=>row.kind==='west'),wg=westBefore.geometry,ws=westBefore.contact.triangleSupport,wp=wg.attributes.position,wi=wg.index;
 if(!wi||wi.count!==876||wp.count!==584||ws.template.triangles.length!==292||JSON.stringify(ws.offset.toArray())!=='[221.9,0,241.1]')throw Error('West contact geometry/offset changed');
 for(let i=0;i<292;i++)for(let k=0;k<3;k++){const vertex=ws.template.triangles[i].triangle[['a','b','c'][k]],index=wi.getX(i*3+k);if(vertex.x!==wp.getX(index)||vertex.y!==wp.getY(index)||vertex.z!==wp.getZ(index))throw Error('West contact triangles differ from actual mesh');}
 const worldBounds=wg.boundingBox.clone().translate(new THREE.Vector3(...ws.offset.toArray()));
 if(!westBefore.contact.equals(worldBounds)||!ws.box.equals(worldBounds))throw Error('West contact bounds differ from actual mesh');
 // Compare the actual east support to its actual source mesh, not a count proxy.
 const eastBefore=bandBefore.find(row=>row.kind==='east'),eg=eastBefore.geometry,es=eastBefore.contact.triangleSupport,ep=eg.attributes.position,ei=eg.index;
 if(!ei||ei.count!==588||ep.count!==392||es.template.triangles.length!==196||JSON.stringify(es.offset.toArray())!=='[221.9,0,241.1]')throw Error('East contact geometry/offset changed');
 for(let i=0;i<196;i++)for(let k=0;k<3;k++){const vertex=es.template.triangles[i].triangle[['a','b','c'][k]],index=ei.getX(i*3+k);if(vertex.x!==ep.getX(index)||vertex.y!==ep.getY(index)||vertex.z!==ep.getZ(index))throw Error('East contact triangles differ from actual mesh');}
 const eastWorldBounds=eg.boundingBox.clone().translate(new THREE.Vector3(...es.offset.toArray()));
 if(!eastBefore.contact.equals(eastWorldBounds)||!es.box.equals(eastWorldBounds))throw Error('East contact bounds differ from actual mesh');
 receipt.source={item:structuredClone(item),profileId:profile.id,layoutOwners:owners.length,upperBandOwners:band.length,westBandOwners:west.length,eastBandOwners:east.length,owner88:ownerRows,eastContact:{meshUuid:eastBefore.mesh.uuid,geometryUuid:eg.uuid,triangleCount:es.template.triangles.length,indexCount:ei.count,positionCount:ep.count,trianglesMatch:true,boxMatches:true,offset:es.offset.toArray()},westContact:{meshUuid:westBefore.mesh.uuid,geometryUuid:wg.uuid,triangleCount:ws.template.triangles.length,trianglesMatch:true,boxMatches:true,offset:ws.offset.toArray()},principalSupports:principal.filter(n=>n.userData.part==='support').length,subjects:['amitabha','shakyamuni','bhaisajyaguru'].filter(s=>s==='shakyamuni'?principal.length:sources.some(n=>n.userData.subjectId===s)),oldPrincipalRoles:principal.map(n=>({name:n.name,part:n.userData.part,role:n.userData.role,material:n.material.name})),oldSideRoles:sources.filter(n=>n.userData.subjectId).map(n=>({name:n.name,subject:n.userData.subjectId,part:n.userData.part,role:n.userData.role,material:n.material.name})),sourceMeshes:sources.length,privateCollidersCreated:kit.colliders.length,privateWalkablesCreated:kit.walkables.length,triangleSupportsCreated:kit.colliders.filter(c=>c.triangleSupport).length,geometryMutationsByReview:0,newStatueModels:0,photoSessionCreated:false};
 const materialElements=meshes=>{const rows=new Map();for(const n of meshes){if(!n.material?.name?.startsWith('dafotang_principal_')&&n.material?.name!=='dafotang_layout_plain_gold_fit')continue;const id=n.material.uuid,row=rows.get(id)??{material:n.material.name,uuid:id,elements:0};row.elements+=n.geometry.index?.count??n.geometry.attributes.position.count;rows.set(id,row);}return [...rows.values()].sort((a,b)=>a.uuid.localeCompare(b.uuid));};
 const beforeElements=materialElements(sources);
 geometryWatch(kit.root);kit.owned.forEach(watch);kit.ownedTextures?.forEach(watch);
 finishing=true;group=kit.finish();finishing=false;geometryWatch(group);kit.owned.forEach(watch);kit.ownedTextures?.forEach(watch);kit.root.clear();scene.add(group);[...library.materials.values()].forEach(watch);
 const finalMeshes=[];group.traverse(n=>{if(n.isMesh)finalMeshes.push(n);});const afterElements=materialElements(finalMeshes),retainedBand=finalMeshes.filter(n=>n.userData.dafotangUpperCentralBandRole==='central-band'),retainedWest=finalMeshes.filter(n=>n.userData.dafotangUpperWestBandRole==='west-band'),retainedEast=finalMeshes.filter(n=>n.userData.dafotangUpperEastBandRole==='east-band');
 if(JSON.stringify(beforeElements)!==JSON.stringify(afterElements)||retainedBand.length!==1||retainedWest.length!==1||retainedEast.length!==1)throw Error('Real finish lost original statue/layout elements or a band');
 const bandLeaves=bandBefore.map(before=>{
  const leaf=(before.kind==='central'?retainedBand:before.kind==='west'?retainedWest:retainedEast)[0],row={kind:before.kind,uuid:leaf.uuid,geometryUuid:leaf.geometry.uuid,materialUuid:leaf.material.uuid,noMerge:leaf.userData.noMerge===true,visible:leaf.visible===true,materialVisible:leaf.material.visible===true,sameMesh:leaf===before.mesh,sameGeometry:leaf.geometry===before.geometry,sameMaterial:leaf.material===before.material,sameContact:kit.colliders.includes(before.contact)};
  if(!['sameMesh','sameGeometry','sameMaterial','sameContact','noMerge','visible','materialVisible'].every(k=>row[k]===true))throw Error('Real finish replaced or hid a retained source band');return row;
 });
 receipt.finish={method:'REAL_COURTKIT_FINISH',retainedMaterialElements:afterElements,sourceMaterialElements:beforeElements,finalMeshes:finalMeshes.length,upperBandLeaves:retainedBand.length,westBandLeaves:retainedWest.length,eastBandLeaves:retainedEast.length,bandLeaves};
 const plaques=[];group.traverse(n=>{if(n.userData.dafotangMainPlaqueRole)plaques.push(n);});
 const deadline=performance.now()+60000;while(plaques.length===2&&plaques.some(n=>n.userData.dafotangMainPlaqueState.status==='loading')&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
 receipt.plaque={leaves:plaques.length,status:plaques[0]?.userData.dafotangMainPlaqueState.status??'missing',states:plaques.map(n=>({...n.userData.dafotangMainPlaqueState})),visible:plaques.length===2&&plaques.every(n=>n.visible&&n.material.visible&&n.material.map?.image?.complete!==false)};
 receipt.architecture=structuredClone(group.userData.architecture);receipt.environment={method:'Original Environment.init, explicit Beijing noon preview, original high shadows',dayCycle:structuredClone(environment.dayCycle),postProcessing:SETTINGS.postProcessing};
 renderView(VIEWS[0].id);requireReady(receipt);receipt.status='READY';buttons.forEach(b=>b.disabled=false);publish();
}catch(error){fail(error);dispose();}
}
void initialize();
