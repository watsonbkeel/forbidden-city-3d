// Exact hall-local cameras. World +X=west; front faces south(-Z).
export const SETTINGS=Object.freeze({width:1280,height:800,dpr:1,date:'2026-11-11T04:00:00.000Z',exposure:.7,postProcessing:'DISABLED_DECLARED'});
const target=[0,2.825,5.6],radius=7.5;
export const VIEWS=Object.freeze([0,-30,30].map((degrees,i)=>Object.freeze({id:['triad-front','triad-left30','triad-right30'][i],degrees,position:Object.freeze([Math.sin(degrees*Math.PI/180)*radius,target[1],target[2]-Math.cos(degrees*Math.PI/180)*radius]),target:Object.freeze([...target]),fov:48})));
// Aisles outside the shrine, NOT 0.22m statue-to-statue slots. No invented ability to squeeze through.
export const LEGACY_BLOCKED_ROUTES=Object.freeze([
 {id:'front-cross-aisle',localPoints:[[-4,2],[0,2],[4,2],[0,2],[-4,2]]},
 {id:'west-shrine-flank',localPoints:[[4,2],[4,6.4],[4,2]]},
 {id:'east-shrine-flank',localPoints:[[-4,2],[-4,6.4],[-4,2]]},
]);

// Fixed before R309 execution; passed finite production-controller CPU diagnostic, not browser acceptance.
export const ROUTES=Object.freeze([
 {id:'central-entry-to-front-view',localPoints:[[0,-7],[0,0],[0,3],[0,0],[0,-7]]},
 {id:'west-around-pagoda-view',localPoints:[[0,0],[5,0],[5,5.6],[5,0],[0,0]]},
 {id:'east-around-pagoda-view',localPoints:[[0,0],[-5,0],[-5,5.6],[-5,0],[0,0]]},
]);
