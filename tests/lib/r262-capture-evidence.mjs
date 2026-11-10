// Host-side evidence orchestration only. No app hooks, rendering or retry backend.
export function createCaptureEvidence({result,checkpoint,getStage}) {
  for(const key of ['observations','captureAttempts','captureMilestones','captureFailures','requiredAppCaptures','captureControls','diagnosticImages','screenshots'])result[key]??=[];
  const unavailable=new Set();
  const append=(key,value)=>{if(result[key].length>=2000)throw Error('Capture evidence exceeds fixed 2000-event bound');result[key].push(value);};
  const errorRecord=error=>({message:String(error.message??error),stack:error.stack??null});
  const milestone=(row,phase)=>{append('captureMilestones',{name:row.name,kind:row.kind,stage:getStage(),phase,at:new Date().toISOString()});checkpoint();};
  const fail=(row,error,phase)=>{row.status='FAIL';row.failurePhase=phase;row.error=errorRecord(error);result.status='FAIL';append('captureFailures',{name:row.name,kind:row.kind,stage:row.stage,phase,error:row.error});milestone(row,phase+'-failed');};
  return {
    observe(name,state){
      const row={name,stage:getStage(),observedAt:new Date().toISOString(),...state};
      append('observations',row);milestone({name,kind:'app'},'state-persisted');return row;
    },
    async capture({page,name,kind='app',required=false,file,outputPath,timeout,validate}){
      if(required&&kind!=='app')throw Error('Only actual application captures can be required app evidence');
      if(required)append('requiredAppCaptures',name);
      const channel=kind==='control'?'control':'app';
      const row={name,kind,required,file,stage:getStage(),status:'PENDING',timeout,requestedAt:new Date().toISOString()};
      append('captureAttempts',row);
      if(unavailable.has(channel)){
        row.status='NOT_ATTEMPTED_CAPTURE_UNAVAILABLE';row.reason='Earlier capture operation failed; its underlying browser command may still be unresolved.';
        milestone(row,'capture-not-attempted');return null;
      }
      milestone(row,'capture-preparation');
      let hudBefore,bytes;
      try{
        if(kind==='app'){
          hudBefore=await page.locator('#perf-hud').isVisible();
          if(hudBefore)await page.keyboard.press('F3');
          row.perfHiddenForCapture=!await page.locator('#perf-hud').isVisible();
          milestone(row,'hud-observed-before-capture');
        }
        milestone(row,'screenshot-requested');
        try{bytes=await page.screenshot({path:outputPath,timeout});}
        catch(error){unavailable.add(channel);fail(row,error,'screenshot');return null;}
        milestone(row,'screenshot-returned');
      }finally{
        if(hudBefore!==undefined){
          try{
            if(await page.locator('#perf-hud').isVisible()!==hudBefore)await page.keyboard.press('F3');
            row.hudRestored=await page.locator('#perf-hud').isVisible()===hudBefore;
            if(!row.hudRestored)throw Error('F3 HUD visibility was not restored');
          }catch(error){row.restoreError=errorRecord(error);result.status='FAIL';milestone(row,'hud-restore-failed');throw error;}
          milestone(row,'hud-restored');
        }
      }
      let image;
      try{image=await validate(bytes,row);}
      catch(error){fail(row,error,'image-validation');return null;}
      row.status='PASS';row.bytes=bytes.length;
      const imageRow={...image,name,kind,file,bytes:bytes.length,perfHiddenForCapture:row.perfHiddenForCapture};
      append(kind==='control'?'captureControls':kind==='diagnostic'?'diagnosticImages':'screenshots',imageRow);
      milestone(row,'image-validated');return imageRow;
    },
    complete(){
      const required=result.requiredAppCaptures;
      const complete=required.length>0&&required.every(name=>result.captureAttempts.some(r=>r.name===name&&r.kind==='app'&&r.required&&r.status==='PASS')&&result.screenshots.some(r=>r.name===name&&r.kind==='app'))&&result.captureFailures.length===0&&!result.captureAttempts.some(r=>r.restoreError);
      result.captureStatus=complete?'PASS':'FAIL';if(!complete)result.status='FAIL';checkpoint();return complete;
    }
  };
}
