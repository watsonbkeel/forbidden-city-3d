// Test-only adapter to evaluate the ALREADY EXISTING exact surface motion path.
// Product ownership validators are intentionally not changed by this hypothesis.
export function installExactMotionHypothesis(cm){
 for(const c of cm.colliders)if(c.triangleSupport?.id.startsWith('xishang-')){const t=c.triangleSupport;c.xiqingRoofSurface={id:'diagnostic-'+t.id,template:t.template,box:t.box};delete c.triangleSupport;}
 const owner=cm.colliders[0];if(owner.box.min.y!==.5||owner.box.max.y!==5)throw Error('Retained actual first column owner missing');
 owner.furnitureMotionScope={kind:'diagnostic-xishang-exact-motion',id:'diagnostic-xishang',minX:-246.5,maxX:-234.9,minZ:363.7,maxZ:379.1,};cm._grid=null;cm._furnitureRegionIndex=null;
 // Test-only threshold adapter: below 1.5m feet preserve the old channel/rail
 // ground path; at/above it use existing exact motion. Source bars start3.92m.
 const scope=owner.furnitureMotionScope;
 const call=(fn,args,y)=>{owner.furnitureMotionScope=y>=1.5?scope:null;cm._furnitureRegionIndex=null;try{return fn(...args)}finally{owner.furnitureMotionScope=scope;cm._furnitureRegionIndex=null;}};
 const vertical=cm.resolveFurnitureVertical.bind(cm),move=cm.getValidPosition.bind(cm),ground=cm.getGroundHeight.bind(cm);
 cm.resolveFurnitureVertical=(...a)=>call(vertical,a,a[0].feetY);
 cm.getValidPosition=(...a)=>call(move,a,a[6]?.feetY??a[3]??a[0].y-1.7);
 cm.getGroundHeight=(...a)=>call(ground,a,a[2]);
}
