import {replayKunning as original} from "../../tests/lib/kunning-walk.mjs";
import {hash} from "../../tests/r164-three-entry-navigation/snapshot.mjs";
import {FrameEvidence} from './frame-evidence.mjs';
export const frameEvidence=new FrameEvidence({dir:process.env.H37_EVIDENCE_DIR,phase:process.env.H37_DIAGNOSTIC_PHASE});
let rows=[];
export function resetRouteCapture(){rows=[];}
export function getRouteCapture(){return rows;}
export function replayKunning(...args){let q;try{q=original(...args);}catch(error){try{frameEvidence.thrown(error,{kind:'old',points:args[2],options:args[3]});}catch{}throw error;}frameEvidence.capture(q,{kind:'old',points:args[2],options:args[3]},hash);rows.push({points:args[2],options:args[3],arrived:q.arrived,end:q.end,frameCount:q.frames?.length,frameSHA256:hash(q.frames)});return q;}
