import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

// Offline candidate only. No src module imports this profile or installs it.
// Mixed map / nominal drawing registration is deliberately not a measured plan.
const bytes=readFileSync(new URL('./source-registration.json',import.meta.url));
if(createHash('sha256').update(bytes).digest('hex')!=='43b9e70aab13b69bb51af12ceffd2e40ba695d327c7dba3933096332e64ee3fb')throw Error('joint profile source-registration SHA mismatch');
const source=JSON.parse(bytes);
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const object=id=>source.objects[String(id)];
const body=object(638156994).geographicBBoxCenterProjected;
const ids=[638156677,638156655,638156830,638156665];
const outline=(id,role)=>({id,role,coordinateSpace:'TAIHE_WORLD_XZ',points:object(id).projectedPointsXZ,nodeIDs:object(id).nodeIDs,version:object(id).version});
const canonical=freeze({
 id:'R157-WUMEN-JOINT-SOURCE-PROFILE-V1',
 runtimeInstalled:false,routeAcceptance:false,wholeObjectCompleted:false,
 frame:{worldXZ:[0,body[1]],mapBodyCenterXZ:body,xRegistration:'RETAINED_CENTRAL_AXIS_ENGINEERING_FIT',centerStatistic:'GEOGRAPHIC_BBOX_MIDPOINT_THEN_PROJECT',originSourceWay:638156994},
 upperRegistration:{status:'NOMINAL_OVERALL_25M_REGISTRATION_NOT_CERTIFIED_COLUMN_AXIS',scale:source.upperPlan.registrationScale,pdfSHA256:source.upperPlan.pdfSHA256,renderSHA256:source.upperPlan.renderSHA256},
 pavilions:source.upperPlan.pavilions.map((p,i)=>({id:p.id,coordinateSpace:'WUMEN_LOCAL_XZ',osmWay:ids[i],page:p.page,center:p.nominalLocalCenterXZ,referenceBounds:p.outerColumnAxisBoundsLocal,sourcePixels:{u:p.outerColumnPixelU,v:p.outerColumnPixelV},status:'UPPER_PLAN_REFERENCE_FIT_NOT_SURVEY',interfaceShaftIdentity:'UNKNOWN'})),
 wings:source.upperPlan.wings.map(w=>({id:w.id,coordinateSpace:'WUMEN_LOCAL_XZ',page:w.page,referenceX:w.outerColumnLocalX,referenceZ:w.longitudinalColumnLocalZ,length:w.longitudinalColumnLocalZ[0]-w.longitudinalColumnLocalZ.at(-1),bayLengths:w.thirteenBayLengths,sourcePixels:{u:w.pairedOuterColumnPixelU,v:w.longitudinalColumnPixelV},endpointPhysicalColumnCount:null,status:'THIRTEEN_INTERVAL_REFERENCE_TOPOLOGY_ENDPOINT_SHAFT_IDENTITY_UNKNOWN'})),
 lowerMapOutline:outline(638157005,'LOWER_MAP_OUTLINE_NOT_CERTIFIED_TOP_SURFACE'),
 southBarrier:outline(638176319,'SOURCE_POLYLINE_NOT_CONSTANT_Z_WALL'),
 ascent:{neckRegions:[{side:'east',coordinateSpace:'DOCUMENT_PIXELS_UV',page:152,pixelBox:[1145,1420,1168,1500]},{side:'west',coordinateSpace:'DOCUMENT_PIXELS_UV',page:153,pixelBox:[1558,1440,1582,1524]}],neckRise:null,neckClearWidth:null,thirdWidth:null,heightFit:{top:12.3,status:'ENGINEERING_FIT_NOT_SURVEY'},documentary:{firstWidth:6.2,horizontalLengths:[15.3,25.59,25.5],thirdWidth:'FOLLOWS_CITY_WALL_TOP',endpointDefinition:null},status:'SOURCE_REFERENCE_REGIONS_NOT_ACCEPTED_ROUTE_GEOMETRY'},
 queGatesPolicy:'UNCHANGED',
 exclusions:['NO_RUNTIME_HOOK','NO_GLOBAL_PALACE_RECT_MOVE','NO_INVISIBLE_SUPPORT','NO_OSM_HEIGHT_ADOPTION','NO_ACCEPTED_ROUTE_FROM_PROFILE_ONLY'],
 source:{rawSHA256:source.rawSHA256,attribution:source.attribution,snapshotStatus:source.status},
});
export function createWumenJointProfile(){return canonical;}
export function validateWumenJointProfile(profile){
 // This stage has no adjustable geometry or acceptance fields. Exact comparison
 // covers array holes/order, nonfinite substitutions, extra keys and all source
 // layer labels. A later geometry-fit contract must be separately reviewed.
 if(!isDeepStrictEqual(profile,canonical))throw Error('joint profile differs from the frozen source/uncertainty contract');
 return true;
}
