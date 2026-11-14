// Test-only public native input observation. No app access, cursor inference or synthetic event.
export function validateTravelClick(state){
 if(!state||state.disposed!==true||!Array.isArray(state.events)||state.events.length!==1||!Array.isArray(state.errors)||state.errors.length)throw Error('exact one disposed native travel click required');
 const e=state.events[0];if(e.isTrusted!==true||e.button!==0||e.target!=='place-travel'||e.mapOpen!==true||e.locked!==false||![e.x,e.y,e.width,e.height].every(Number.isFinite)||e.width<=0||e.height<=0||e.x<0||e.y<0||e.x>=e.width||e.y>=e.height)throw Error('native travel click identity/coordinates invalid');
 return{x:e.x,y:e.y};
}
export async function trackedTravelClick(page,locator,{timeout=180000}={}){
 if(!(Number.isFinite(timeout)&&timeout>0&&timeout<=180000))throw Error('bounded native travel click timeout required');
 let handle,state,failure;
 try{
  handle=await page.evaluateHandle(()=>{
   const events=[],errors=[];let disposed=false;
   const click=e=>{
    if(events.length>=2){if(errors.length<2)errors.push('native travel click overflow');return;}
    events.push({isTrusted:e.isTrusted,button:e.button,x:e.clientX,y:e.clientY,target:e.target?.closest?.('#place-travel')?.id??null,mapOpen:document.body.classList.contains('map-open'),locked:!!document.pointerLockElement,width:innerWidth,height:innerHeight,timeStamp:e.timeStamp,at:performance.now()});
   };
   document.addEventListener('click',click,true);
   return{dispose(){if(!disposed){document.removeEventListener('click',click,true);disposed=true;}return{events,errors,disposed};}};
  });
  await locator.click({timeout});
 }catch(error){failure=error;}
 finally{
  if(handle){try{state=await handle.evaluate(o=>o.dispose());}catch(error){failure??=error;}finally{try{await handle.dispose();}catch(error){failure??=error;}}}
 }
 if(failure)throw failure;
 return{pointer:validateTravelClick(state),observation:state};
}
