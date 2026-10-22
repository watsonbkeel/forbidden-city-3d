import profile from '../../../../data/architecture/qinan.json' with { type: 'json' };
const freeze = value => { if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value; };
export const QINAN_PROFILE=freeze(profile);
const axes=bays=>{const out=[-bays.reduce((a,b)=>a+b,0)/2];for(const b of bays)out.push(out.at(-1)+b);return out;};
const finiteTree=value=>{if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Qinan profile requires finite dimensions');if(value&&typeof value==='object')Object.values(value).forEach(finiteTree);};

/** Evidence-bounded geometry with an exterior landing and separate virtual side-entry contract. */
export function qinanGeometry(item={},source=QINAN_PROFILE){
 if(item.structure!=='qinan-hall'||item.qinanProfile!=='qinan')throw new Error('Qinan requires explicit qinan-hall structure and qinan profile');
 finiteTree(source);
 const p=source,f=p.frameExpectation,rotation=item.rot===undefined?0:item.rot;
 if(!f||![item.x,item.z,rotation].every(Number.isFinite)||item.x!==f.x||item.z!==f.z||rotation!==f.rot)throw new Error('Qinan frame drift: preserve inherited anchor and rotation');
 for(const k of ['w','d','ph','pad','colH','bays','roof','roofH','layers','backDoor','throne','enter','open','interior'])if(item[k]!==undefined)throw new Error(`Qinan generic override is not supported: ${k}`);
 if(!p.southAnnex?.required||p.southAnnex.plan.frontBayCount!==5)throw new Error('Qinan profile requires its five-bay south annex');
 const foot=p.mainBody?.columnFootGrid,upper=p.upperColumnHeadGrid;
 if(!foot||foot.baysX.length!==5||foot.baysZ.length!==3||foot.baysX.some(v=>v<=0)||foot.baysZ.some(v=>v<=0)||!upper||upper.baysX.length!==5||upper.depth<=0||p.roofBoard.width<=0||p.roofBoard.depth<=0)throw new Error('Invalid Qinan profile dimensions or column grid');
 const positive=[p.southAnnex.plan.projection,p.southAnnex.heights.frontColumnTopRelativeY,p.southAnnex.heights.rearRoofRelativeY,p.southAnnex.skin.rearRidgeInset,p.terraceGuide.sideStairWidth,p.terraceGuide.sideStairProjection,p.supportApproximation.stairStepCount,p.supportApproximation.railThickness,p.supportApproximation.railHeight,p.supportApproximation.pavingThickness,p.roofSkinApproximation.tileThickness];
 if(positive.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<=0)||p.southAnnex.heights.rearRoofRelativeY<=p.southAnnex.heights.frontColumnTopRelativeY||p.roofBoard.width>=p.cutRafterProfile.upper.width||p.roofBoard.depth>=p.cutRafterProfile.upper.depth)throw new Error('Invalid Qinan profile dependent dimensions');
 for(const k of ['slopeSubdivisions','edgeSubdivisions','flatCoverSubdivisions','finialSegments'])if(!Number.isInteger(p.roofSkinApproximation[k])||p.roofSkinApproximation[k]<2)throw new Error('Invalid Qinan roof sampling dimensions');
 if(!Number.isInteger(p.supportApproximation.stairStepCount)||p.mainBody.perimeterColumnNodes.length!==16||new Set(p.mainBody.perimeterColumnNodes.map(n=>n.join(','))).size!==16)throw new Error('Invalid Qinan stair or perimeter grid');
 const floorY=p.surveyDatum.floorWorldY,baseY=floorY+p.surveyDatum.columnBaseAboveFloor;
 if(!(floorY>0&&baseY>=floorY&&p.roofSkinApproximation.tileThickness>0))throw new Error('Invalid Qinan datum or skin dimension');
 const xs=axes(foot.baysX),zs=axes(foot.baysZ),width=xs.at(-1)-xs[0],depth=zs.at(-1)-zs[0];
 const upperXs=axes(upper.baysX),upperWidth=upperXs.at(-1)-upperXs[0];
 const levels=Object.fromEntries(Object.entries(p.measuredLevels).filter(([,v])=>typeof v==='number').map(([k,v])=>[k,baseY+v]));
 levels.eaveColumnTop=levels.eaveColumnNetTop;
 const mainBody={...p.mainBody,columnFootGrid:{...foot,xs,zs,width,depth},perimeterColumns:p.mainBody.perimeterColumnNodes.map(([xi,zi])=>{
  if(!Number.isInteger(xi)||!Number.isInteger(zi)||xs[xi]===undefined||zs[zi]===undefined||!(xi===0||xi===5||zi===0||zi===3))throw new Error('Invalid Qinan perimeter node');
  return {x:xs[xi],z:zs[zi],node:[xi,zi]};
 })};
 const golden=p.mainBody.interiorGoldenColumns;
 const expectedGolden=[[1,1],[4,1],[1,2],[4,2]];
 if(golden.expectedCount!==4||JSON.stringify(golden.axisNodes)!==JSON.stringify(expectedGolden))throw Error('Invalid Qinan source-derived golden interior axis nodes');
 mainBody.goldenColumns=golden.axisNodes.map(([xi,zi])=>({x:xs[xi],z:zs[zi],node:[xi,zi]}));
 const annex={...p.southAnnex,width,frontZ:zs[0]-p.southAnnex.plan.projection,rearZ:zs[0],columnXs:[...xs],columnTopY:baseY+p.southAnnex.heights.frontColumnTopRelativeY,rearRoofY:baseY+p.southAnnex.heights.rearRoofRelativeY};
 const t=p.terraceGuide,a=p.supportApproximation,o=a.stoneBeyondRailCenter;
 const slabs=[{supportId:'qinan-main-platform',minX:-t.mainRailWidth/2-o,maxX:t.mainRailWidth/2+o,minZ:t.insetTurnZ,maxZ:t.northRailZ+o,topY:floorY},
  {supportId:'qinan-annex-platform',minX:-t.southRailWidth/2-o,maxX:t.southRailWidth/2+o,minZ:t.southRailZ-o,maxZ:t.insetTurnZ,topY:floorY}];
 const stairs=[-1,1].map(sign=>({side:sign<0?'east':'west',sign,xTop:sign*(t.southRailWidth/2+o),xToe:sign*(t.southRailWidth/2+t.sideStairProjection),minZ:t.sideStairCenterZ-t.sideStairWidth/2,maxZ:t.sideStairCenterZ+t.sideStairWidth/2,count:a.stairStepCount,topY:floorY}));
 const steps=stairs.flatMap(s=>Array.from({length:s.count},(_,i)=>{const a=s.xToe+(s.xTop-s.xToe)*i/s.count,b=s.xToe+(s.xTop-s.xToe)*(i+1)/s.count;return {supportId:`qinan-${s.side}-step-${String(i+1).padStart(2,'0')}`,side:s.side,minX:Math.min(a,b),maxX:Math.max(a,b),minZ:s.minZ,maxZ:s.maxZ,topY:floorY*(i+1)/s.count};}));
 const toWorld=(x,z)=>[f.x+x,f.z+z];
 const supports=[...slabs,...steps].map(s=>({type:'box',supportId:s.supportId,rescue:false,min:[f.x+s.minX,s.topY,f.z+s.minZ],max:[f.x+s.maxX,s.topY,f.z+s.maxZ]}));
 const railSegments=[[-t.mainRailWidth/2,t.northRailZ,t.mainRailWidth/2,t.northRailZ],[-t.southRailWidth/2,t.southRailZ,t.southRailWidth/2,t.southRailZ]];
 for(const sign of [-1,1]){const x=sign*t.mainRailWidth/2,ax=sign*t.southRailWidth/2,z=t.sideStairCenterZ,half=t.sideStairWidth/2;railSegments.push([x,t.northRailZ,x,t.insetTurnZ],[x,t.insetTurnZ,ax,t.insetTurnZ],[ax,t.insetTurnZ,ax,z+half],[ax,z-half,ax,t.southRailZ]);}
 const footprints=slabs.map(s=>({kind:'platform',supportId:s.supportId,x:f.x+(s.minX+s.maxX)/2,z:f.z+(s.minZ+s.maxZ)/2,w:s.maxX-s.minX,d:s.maxZ-s.minZ}));
 const omittedFeatures=[{id:'qinan-south-axial-composite',status:'KNOWN_VISIBLE_OMISSION',reason:'Composite levels unresolved; no invisible support or collider',footprint:{minX:f.x-t.southAxialProjection.width/2,maxX:f.x+t.southAxialProjection.width/2,minZ:f.z+t.southRailZ-t.southAxialProjection.length,maxZ:f.z+t.southRailZ}}];
 const v=p.virtualAccess;
 if(!v||![v.portalWidth,v.portalHeight,v.leafThickness,v.leafInset].every(n=>Number.isFinite(n)&&n>0)||v.portalWidth>t.sideStairWidth||v.portalHeight>=annex.columnTopY-floorY)throw new Error('Invalid Qinan virtual doorway dimensions');
 const portals=stairs.map(s=>({id:`qinan-${s.side}-virtual-entry`,side:s.side,sign:s.sign,x:s.sign*width/2,z:t.sideStairCenterZ,width:v.portalWidth,height:v.portalHeight,worldX:f.x+s.sign*width/2,worldZ:f.z+t.sideStairCenterZ,feetY:floorY,status:v.status}));
 const virtualRoutes=portals.map(portal=>({id:portal.id,points:[[f.x+portal.sign*18,f.z-16.1],[f.x+portal.sign*18,portal.worldZ],[f.x+portal.sign*8,portal.worldZ],[f.x,portal.worldZ],[f.x,f.z]],return:'same-way',status:v.status}));
 const navigation={...structuredClone(p.navigation),virtualRoutes,profileHash:p.profileHash,validatedAgainstProfileHash:null};
 return {profile:'qinan',profileId:p.profileId,profileRevision:p.revision,profileHash:p.profileHash,id:'garden/qinan',name:'钦安殿',x:f.x,z:f.z,rot:f.rot,toWorld,datum:{floorY,columnBaseTopY:baseY,offsetAboveFloor:p.surveyDatum.columnBaseAboveFloor},mainBody,upperColumnHeadGrid:{...upper,xs:upperXs,width:upperWidth},levels,roofBoard:{...p.roofBoard,bottomY:levels.boardUnderside,topY:levels.boardTop},cutRafterProfile:p.cutRafterProfile,roofSkinApproximation:p.roofSkinApproximation,southAnnex:annex,terraceGuide:t,supportApproximation:a,slabs,stairs,steps,railSegments,supports,omittedFeatures,portals,virtualAccess:v,navigation,map:{footprints,labelAnchor:{x:f.x,z:f.z},profileId:p.profileId,profileHash:p.profileHash,mode:'exterior-view'},provenance:structuredClone(p)};
}
