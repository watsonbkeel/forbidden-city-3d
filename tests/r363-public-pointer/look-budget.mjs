// Test-only scheduling: cumulative native look activity60s, perlook30s.
// Screenshots retain their own60s limits and all actions remain under outer720s.
export function createLookBudget(clock=()=>performance.now()){
 let usedMs=0;
 return{get usedMs(){return usedMs;},async run(action){
  const before=clock();if(!Number.isFinite(before))throw Error('invalid look budget clock');
  const remaining=60000-usedMs;if(!(remaining>0))throw Error('look activity budget exhausted');
  let result,failure;
  try{result=await action(Math.min(30000,remaining));}catch(error){failure=error;}
  finally{const after=clock();if(!Number.isFinite(after)||after<before)failure??=Error('non-monotonic look budget clock');else{usedMs+=after-before;if(usedMs>60000)failure??=Error('look activity budget exceeded');}}
  if(failure)throw failure;return result;
 }};
}
