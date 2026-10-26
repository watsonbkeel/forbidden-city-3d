/** Existing registered engineering floors, not newly created physical surfaces.
 * The visible retained terrace is 0.02 m above its old engineering support. */
export const QIANQING_ASSEMBLY_IDS=Object.freeze([...Array.from({length:4},(_,i)=>'qianqing-terrace-burner-'+i),...['3','4','5'].map(i=>'qianqing-front-doors-'+i)]);
export const QIANQING_FLOORS=Object.freeze({terrace:Object.freeze({minX:-28,maxX:28,minZ:298.3,maxZ:334.3,height:2}),hall:Object.freeze({minX:-24.5,maxX:24.5,minZ:302.8,maxZ:330.8,height:2.16})});
export function cloneQianqingFloor(input,id,region){
 const key=id.startsWith('qianqing-terrace-burner-')?'terrace':'hall',expected=QIANQING_FLOORS[key];
 if(!QIANQING_ASSEMBLY_IDS.includes(id)||!input||Object.keys(expected).some(k=>input[k]!==expected[k])||region.minX-1<expected.minX||region.maxX+1>expected.maxX||region.minZ-1<expected.minZ||region.maxZ+1>expected.maxZ)throw new TypeError('Qianqing scope must preserve the full body handoff inside its exact existing floor');
 return Object.freeze({...expected,key});
}
export function registeredQianqingFloor(source,scope,x,z,radius){
 const f=scope.floor;if(scope.kind!=='qianqing-assemblies'||!f)return null;
 const local=x+radius>=scope.minX&&x-radius<=scope.maxX&&z+radius>=scope.minZ&&z-radius<=scope.maxZ;
 // The last horizontal substep may leave the explicit solver domain. There
 // it must hand back the original registered center-floor semantics, not a
 // fake ground zero. Inside the local domain the complete square stays on it.
 const r=local?radius:0;
 if(x-r<f.minX||x+r>f.maxX||z-r<f.minZ||z+r>f.maxZ)return null;
 // Deliberately inspect the live source on each synchronous query: removing or
 // replacing a walkable cannot leave a cached synthetic floor behind.
 const owner=source.walkables?.find(w=>w.type==='box'&&w.box.min.x===f.minX&&w.box.max.x===f.maxX&&w.box.min.z===f.minZ&&w.box.max.z===f.maxZ&&w.box.min.y===f.height&&w.box.max.y===f.height);
 return owner?{height:f.height,owner,source:'existing-qianqing-engineering-floor',regionId:scope.id}:null;
}
