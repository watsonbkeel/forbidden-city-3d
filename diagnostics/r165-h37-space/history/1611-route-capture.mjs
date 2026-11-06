import {replayKunning as original} from '../r165-f49-tishun-beam-1331/tests/lib/kunning-walk.mjs';
import {hash} from '../r165-f49-tishun-beam-1331/tests/r164-three-entry-navigation/snapshot.mjs';
let rows=[];
export function resetRouteCapture(){rows=[];}
export function getRouteCapture(){return rows;}
export function replayKunning(...args){const q=original(...args);rows.push({points:args[2],options:args[3],arrived:q.arrived,end:q.end,frameCount:q.frames?.length,frameSHA256:hash(q.frames)});return q;}
