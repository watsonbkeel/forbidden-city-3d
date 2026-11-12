// Real caller uses these independent attempts; no movement or collision replacement.
export function finishRouteController(controller,restoreGround,restoreMethods,primary){
 const errors=[],report={stopAttempted:false,disposeAttempted:false,disposeReturned:false,groundRestored:false,methodsRestored:false,errors:[]};
 const attempt=(label,fn)=>{try{fn();return true}catch(e){errors.push(e);report.errors.push({stage:label,error:String(e.stack??e)});return false}};
 report.groundRestored=attempt('restoreGround',restoreGround);
 report.stopAttempted=true;attempt('stop',()=>controller.stop());
 report.disposeAttempted=true;report.disposeReturned=attempt('dispose',()=>controller.dispose());
 report.methodsRestored=attempt('restoreMethods',restoreMethods);
 report.complete=errors.length===0;
 return{report,releaseReference:report.disposeReturned&&report.methodsRestored,error:errors.length?new AggregateError([...(primary?[primary]:[]),...errors],'route failed or controller cleanup incomplete'):primary};
}
