"""Small shared actual orchestrator. No scene imports or subprocess starts here."""
import math

def phase_proof(phase,report,result,final,inputs_unchanged,expected_ledger,expected_collections):
 """Treat absent/partial reports as failure, even after a zero child exit."""
 r=report if isinstance(report,dict)else{}
 return {'phase':phase,'success':r.get('success')is True,'cleanup':r.get('cleanup',{}).get('success')is True and r.get('cleanup',{}).get('errors')==[],
  'restoration':r.get('restoration',{}).get('complete')is True,'ledgerComplete':r.get('ledgerComplete')is True and r.get('ledger')==expected_ledger and [q.get('label')for q in r.get('collectionReceipts',[])]==expected_collections and all(q.get('completed')is True and q.get('collectionCalls')==1 for q in r.get('collectionReceipts',[])),
  'receiptPresent':isinstance(report,dict)and r.get('phase')==phase,'processComplete':final.get('complete')is True,
  'readerClosed':result.get('readerClosed')is True and final.get('readerDone')is True,
  'unknownRSS':not(final.get('hadUnknown')is False and final.get('unknown')==[]),
  'residualProcesses':not(final.get('alive')==[] and final.get('zombies')==[] and result.get('uncertainOutcome')is False),
  'inputsUnchanged':inputs_unchanged is True,'exitCode':result.get('exitCode'),
  'monitorFailure':('monitor-receipt-missing'if'failureReason'not in final or'terminationReason'not in result else final['failureReason']or result['terminationReason'])}

def run_batch(phases,*,started_at,now,verify_inputs,launch):
 if tuple(phases)!=('P1','P2C'):raise RuntimeError('Only the frozen P1 then P2C sequence is allowed')
 def deadline():
  elapsed=now()-started_at
  if not math.isfinite(elapsed)or elapsed<0 or elapsed>=180:raise RuntimeError('Aggregate monotonic180s budget exhausted/invalid')
  return elapsed
 rows=[];deadline();verify_inputs('before');deadline()
 for phase in phases:
  deadline();q=launch(phase,started_at);deadline()
  if not isinstance(q,dict)or q.get('phase')!=phase:raise RuntimeError('Missing or wrong phase receipt: '+phase)
  for key in ['success','cleanup','restoration','ledgerComplete','receiptPresent','processComplete','readerClosed','inputsUnchanged']:
   if q.get(key)is not True:raise RuntimeError('Phase '+phase+' failed '+key)
  if q.get('exitCode')!=0 or q.get('unknownRSS')is not False or q.get('residualProcesses')is not False or q.get('monitorFailure'):
   raise RuntimeError('Phase '+phase+' process/RSS/monitor failure')
  rows.append(q)
  verify_inputs('between'if phase=='P1'else'after');deadline()
 return {'success':True,'phases':rows,'aggregateSeconds':deadline(),'scope':'Two-process staged evidence, not the original complete single-process probe'}
