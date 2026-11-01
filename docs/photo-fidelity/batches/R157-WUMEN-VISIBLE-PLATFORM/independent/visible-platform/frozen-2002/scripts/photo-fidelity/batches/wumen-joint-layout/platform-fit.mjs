import{isDeepStrictEqual}from'node:util';
import{createWumenJointProfile}from'./profile.mjs';
import{WUMEN_JOINT_ASCENT_FIT}from'../../../../src/controls/WumenJointAscentFit.js';
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const source=createWumenJointProfile();
// Offline proposed numbers. Neither the mapped lower outline nor reference
// column envelopes certify this deck, a bearing face, doorway or route.
const proposal=freeze({
 id:'R157-WUMEN-VISIBLE-PLATFORM-NUMERIC-PROPOSAL-V1',status:'ENGINEERING_NUMERIC_PROPOSAL_NOT_SOURCE_MEASURED',coordinateSpace:'WUMEN_LOCAL_XZ',frame:source.frame,
 runtimeInstalled:false,geometryAccepted:false,actualBearingAccepted:false,routeAcceptance:false,wholeObjectCompleted:false,
 envelope:{halfWidth:63.5,wingInner:40.6,wingSouth:-96,mainSouth:-13.3,north:14.5,shoulder:12,top:12.3},
 perimeter:[[-63.5,-96],[-40.6,-96],[-40.6,-13.3],[40.6,-13.3],[40.6,-96],[63.5,-96],[63.5,14.5],[-63.5,14.5],[-63.5,-96]],
 recesses:WUMEN_JOINT_ASCENT_FIT.pieces.filter(p=>!p.id.endsWith('/receiver')),
 recessEvidence:'VISIBLE_ENGINEERING_RECESS_PROPOSAL_NOT_INFERRED_FROM_OSM_INTERSECTION',
 receivingWindows:WUMEN_JOINT_ASCENT_FIT.pieces.filter(p=>p.id.endsWith('/receiver')).map(p=>({...p,sourceID:'wumen-joint/proposed-platform',authorityWindowNotPhysicalBoundary:true})),
 windowPhysicalDelta:{meshes:0,colliders:0,walkables:0},
 sourceLowerRole:source.lowerMapOutline.role,pavilionInterfaceShaftIdentity:'UNKNOWN',queGatesPolicy:'UNCHANGED',
 requiredReplacementSets:['lower-main-visible-slab-and-support','lower-two-wing-visible-slabs-and-supports','old-ascent-visible-solids-proxies-and-all-supports','old-six-platform-rails-and-paired-safety-proxies'],
 pending:['actual-visible-platform-geometry','actual-column-foot-bearing','five-portal-preservation','paired-rail-opening-geometry-and-physics','actual-platform-authority-registration','raw-controller-routes','south-wall-interfaces'],
});
export function createWumenJointPlatformFit(){return proposal;}
export function validateWumenJointPlatformFit(fit){if(!isDeepStrictEqual(fit,proposal))throw Error('platform proposal differs from frozen engineering/uncertainty contract');return true;}
function distance(q,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dz);}
export function wumenPlatformReferenceDiagnostics(){
 const e=proposal.envelope,edge=proposal.perimeter;
 const lowerRows=source.lowerMapOutline.points.map((q,i)=>{const localXZ=q.map((v,j)=>v-proposal.frame.worldXZ[j]),[x,z]=localXZ;return{nodeID:source.lowerMapOutline.nodeIDs[i],localXZ,boundaryDistance:Math.min(...edge.slice(1).map((b,j)=>distance(localXZ,edge[j],b))),insideEngineeringEnvelope:x>=-e.halfWidth&&x<=e.halfWidth&&z>=e.wingSouth&&z<=e.north&&(z>=e.mainSouth||Math.abs(x)>=e.wingInner)};});
 const pavilionAxisEnvelopes=source.pavilions.map(p=>{const b=p.referenceBounds;return{id:p.id,referenceBounds:b,actualColumnFootProof:false,outerXMargin:e.halfWidth-Math.max(...b.x.map(Math.abs)),southMargin:b.z[0]-e.wingSouth,northMargin:e.north-b.z[1],innerWingAxisMargin:Math.min(...b.x.map(Math.abs))-e.wingInner,positiveAreaRecessOverlaps:proposal.recesses.filter(r=>Math.max(b.x[0],r.minX)<Math.min(b.x[1],r.maxX)&&Math.max(b.z[0],r.minZ)<Math.min(b.z[1],r.maxZ)).length};});
 const points=lowerRows.map(r=>r.localXZ),uniqueNodes=new Set(source.lowerMapOutline.nodeIDs).size;
 const proposedVertexRows=edge.map(localXZ=>({localXZ,sourcePolylineDistance:Math.min(...points.slice(1).map((b,j)=>distance(localXZ,points[j],b)))}));
 return{scope:'REFERENCE_RESIDUALS_NOT_ACTUAL_MESH_BEARING',acceptance:false,distanceMeaning:'SAMPLED_VERTICES_TO_OPPOSITE_POLYLINE_NOT_COMPLETE_HAUSDORFF',completeContourErrorUpperBound:null,sourceCounts:{rows:lowerRows.length,uniqueNodes,closedRepeatRows:lowerRows.length-uniqueNodes},outsideMaxDistance:Math.max(...lowerRows.filter(r=>!r.insideEngineeringEnvelope).map(r=>r.boundaryDistance)),lowerRows,proposedVertexRows,pavilionAxisEnvelopes};
}
