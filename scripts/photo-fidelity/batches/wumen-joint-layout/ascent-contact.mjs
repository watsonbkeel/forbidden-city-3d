import {buildWumenJointRampSolid} from './ramp-solid.mjs';
/** Isolated contact experiment, NOT an installed or accepted architectural model.
 * Regions follow separately read exhibition-plan bands; elevations and the small
 * receiving test blocks are explicit engineering choices, not documentary facts.
 * The receiving blocks do NOT certify pavilion entrances or lower masonry. */
import {WUMEN_JOINT_ASCENT_FIT} from '../../../../src/controls/WumenJointAscentFit.js';
export function buildWumenAscentContactRig(material){
 const pieces=[],seams=[];
 try{
 for(const side of ['east','west']){
  const authored=WUMEN_JOINT_ASCENT_FIT.pieces.filter(p=>p.id.startsWith(side+'/'));
  for(const p of authored)pieces.push(buildWumenJointRampSolid(p,material));
  const names=authored.map(p=>p.id.split('/')[1]);
  for(let i=1;i<names.length;i++){
   const from=`${side}/${names[i-1]}`,to=`${side}/${names[i]}`,a=pieces.find(p=>p.mesh.name===from).walkable,b=pieces.find(p=>p.mesh.name===to).walkable;
   const loX=Math.max(a.minX,b.minX),hiX=Math.min(a.maxX,b.maxX),loZ=Math.max(a.minZ,b.minZ),hiZ=Math.min(a.maxZ,b.maxZ);
   if(loX>hiX||loZ>hiZ||!(loX===hiX||loZ===hiZ))throw Error(`invalid authored seam ${from}/${to}`);
   seams.push({from,to,points:[[loX,loZ],[hiX,hiZ]],length:Math.hypot(hiX-loX,hiZ-loZ)});
  }
 }
 }catch(e){for(const p of pieces)p.dispose();throw e;}
 return{pieces,seams,contract:{coordinateSpace:'WUMEN_LOCAL_XZ',runtimeInstalled:false,routeAcceptance:false,heightsStatus:'ENGINEERING_FIT_NOT_SURVEY',receiverStatus:'CONTACT_TEST_BLOCK_NOT_CERTIFIED_PAVILION_ENTRY',sourceLimits:['entry includes transition beyond visible dense lines','outer fold obscured by exhibition poster','25m overall registration not certified column-axis scale','map lower outline and plan bands not assumed coplanar']},dispose(){for(const p of pieces)p.dispose();}};
}
