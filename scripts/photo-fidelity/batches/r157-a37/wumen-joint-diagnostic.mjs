/** Private-use, reversible source-axis model. NOT imported by production.
 * Markers are coordinate/elevation diagnostics, not reconstructed columns,
 * roofs, hidden rooms, lower masonry, supports or collision grants.
 */
import * as T from 'three';
import {WUMEN_PLAN_REGISTRATION as plan} from '../../../../src/scene/palace/special/WumenPlanRegistration.js';
export function buildWumenJointPlanDiagnostic({origin}={}){
 if(!Array.isArray(origin)||origin.length!==2||!origin.every(Number.isFinite))throw Error('Explicit finite common origin required');
 const group=new T.Group();group.name='wumen-joint-plan-axis-diagnostic';group.position.set(origin[0],0,origin[1]);
 group.userData={runtimeEnabled:false,wholeObjectAccepted:false,kind:'SOURCE_AXIS_DIAGNOSTIC_NOT_COMPLETE_ARCHITECTURE',heightBasis:'RETAINED_ENGINEERING_NOT_SOURCE_ELEVATION',source:plan.sourceURL,sourceSHA256:plan.sourcePDFsha256,missing:['full-pavilion-column-net','roof-forms-and-heights','enclosures-and-openings','real-lower-support','wall-and-ascent-interfaces','photo-camera-acceptance']};
 const ownedGeometries=[],ownedMaterials=[];
 const material=(params)=>{const m=new T.MeshBasicMaterial(params);ownedMaterials.push(m);return m;};
 const axisMat=material({color:0xa82b29}),wingMat=material({color:0xc38b35}),lineMat=new T.LineBasicMaterial({color:0x405d7a});ownedMaterials.push(lineMat);
 // Thin square rods intentionally distinguish diagnostics from architectural columns.
 const axisGeometry=new T.BoxGeometry(.10,7.5,.10);ownedGeometries.push(axisGeometry);
 const addAxis=(c,mat)=>{const m=new T.Mesh(axisGeometry,mat);m.position.set(c.localXZ[0],plan.platformTopRetainedEngineering+3.75,c.localXZ[1]);m.userData.sourceAxis={id:c.id,ownerId:c.ownerId};group.add(m);};
 for(const p of plan.pavilions)for(const c of p.cornerColumns)addAxis(c,axisMat);
 for(const w of plan.wings)for(const c of w.columns)if(c.ownerId===w.id)addAxis(c,wingMat);
 const line=(points,id)=>{const g=new T.BufferGeometry().setFromPoints(points.map(([x,z])=>new T.Vector3(x,plan.platformTopRetainedEngineering,z)));ownedGeometries.push(g);const m=new T.Line(g,lineMat);m.userData.sourceFootprint=id;group.add(m);};
 for(const p of plan.pavilions){const[x,z]=p.centerLocalXZ,[w,d]=p.axisDimensionsXZ;line([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2],[x-w/2,z-d/2]],p.id);}
 for(const w of plan.wings)for(const row of[0,1])line(w.columns.filter((_,i)=>i%2===row).map(c=>c.localXZ),w.id+'/row-'+row);
 line([[-30.025,-12.5],[30.025,-12.5],[30.025,12.5],[-30.025,12.5],[-30.025,-12.5]],'main-independent-column-reference');
 let disposed=false;return{group,colliders:[],walkables:[],ownedGeometries,ownedMaterials,dispose(){if(disposed)return;disposed=true;for(const g of ownedGeometries)g.dispose();for(const m of ownedMaterials)m.dispose();}};
}
