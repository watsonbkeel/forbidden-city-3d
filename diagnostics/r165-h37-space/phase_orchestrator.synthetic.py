import unittest
from phase_orchestrator import run_batch
class Tests(unittest.TestCase):
 def scenario(self,fail=None):
  now=[0.0];calls=[];checks=[]
  def verify(label):
   checks.append(label);now[0]+=1
   if fail=='drift' and label=='between':raise RuntimeError('input drift')
   if fail=='bridge-timeout' and label=='between':now[0]=181
  def launch(phase,started):
   calls.append((phase,started));now[0]+=2
   if fail=='execution-timeout':now[0]=181
   q={'phase':phase,'success':True,'cleanup':True,'restoration':True,'ledgerComplete':True,'receiptPresent':True,'processComplete':True,'readerClosed':True,'unknownRSS':False,'residualProcesses':False,'inputsUnchanged':True,'exitCode':0}
   field={'cleanup':'cleanup','missing-receipt':'receiptPresent','missing-restoration':'restoration','missing-ledger':'ledgerComplete','unknown-rss':'unknownRSS','residual':'residualProcesses','unknown-process':'processComplete','reader':'readerClosed','phase-drift':'inputsUnchanged'}.get(fail)
   if field:q[field]=True if field in ['unknownRSS','residualProcesses'] else False
   if fail=='nonzero':q['exitCode']=1
   if fail=='cleanup-timeout':now[0]=181
   return q
  return now,calls,checks,lambda:run_batch(('P1','P2C'),started_at=0,now=lambda:now[0],verify_inputs=verify,launch=launch)
 def test_success_uses_same_epoch_and_closes_p1_before_p2(self):
  n,c,k,run=self.scenario();r=run();self.assertTrue(r['success']);self.assertEqual(c,[('P1',0),('P2C',0)]);self.assertEqual(k,['before','between','after'])
 def test_each_failure_blocks_second_launch(self):
  for failure in ['cleanup','missing-receipt','missing-restoration','missing-ledger','unknown-rss','residual','unknown-process','reader','phase-drift','nonzero','execution-timeout','cleanup-timeout','drift','bridge-timeout']:
   with self.subTest(failure=failure):
    n,c,k,run=self.scenario(failure)
    with self.assertRaises(RuntimeError):run()
    self.assertEqual([q[0]for q in c],['P1'])
 def test_prelaunch_timeout_blocks_every_child(self):
  n,c,k,run=self.scenario();n[0]=181
  with self.assertRaises(RuntimeError):run()
  self.assertEqual(c,[])
 def test_missing_and_wrong_phase_receipts_fail_closed(self):
  for receipt in [None,{}, {'phase':'wrong','success':True}]:
   calls=[]
   def launch(p,s):calls.append(p);return receipt
   with self.assertRaises(RuntimeError):run_batch(('P1','P2C'),started_at=0,now=lambda:1,verify_inputs=lambda l:None,launch=launch)
   self.assertEqual(calls,['P1'])
class RawProofTests(unittest.TestCase):
 def fixture(self):
  from phase_orchestrator import phase_proof
  r={'phase':'P1','success':True,'cleanup':{'success':True,'errors':[]},'restoration':{'complete':True},'ledgerComplete':True,'ledger':['a'],'collectionReceipts':[{'label':'done','completed':True,'collectionCalls':1}]}
  result={'exitCode':0,'readerClosed':True,'uncertainOutcome':False,'terminationReason':None}
  final={'complete':True,'readerDone':True,'hadUnknown':False,'unknown':[],'alive':[],'zombies':[],'failureReason':None}
  return phase_proof,r,result,final
 def test_zero_exit_requires_actual_report_cleanup_and_every_monitor_terminal_field(self):
  fn,r,e,f=self.fixture();q=fn('P1',r,e,f,True,['a'],['done'])
  self.assertTrue(q['cleanup']and q['receiptPresent']and q['processComplete']);self.assertFalse(q['unknownRSS']or q['residualProcesses']or q['monitorFailure'])
  for missing in ['report','cleanup','restoration','ledger','unknown','hadUnknown','alive','zombies','failureReason','terminationReason']:
   import copy
   a,b,c=copy.deepcopy((r,e,f))
   if missing=='report':a=None
   elif missing in ['cleanup','restoration']:a.pop(missing)
   elif missing=='ledger':a.pop('ledgerComplete')
   elif missing=='terminationReason':b.pop(missing)
   else:c.pop(missing)
   proof=fn('P1',a,b,c,True,['a'],['done']);calls=[]
   def launch(phase,epoch):calls.append(phase);return proof
   with self.subTest(missing=missing):
    with self.assertRaises(RuntimeError):run_batch(('P1','P2C'),started_at=0,now=lambda:1,verify_inputs=lambda label:None,launch=launch)
    self.assertEqual(calls,['P1'])
 def test_wrong_ledger_or_skipped_gc_cannot_be_green_despite_zero_exit(self):
  import copy
  fn,r,e,f=self.fixture()
  for mutate in ['ledger','collection-label','not-completed','call-count']:
   a=copy.deepcopy(r)
   if mutate=='ledger':a['ledger']=[]
   elif mutate=='collection-label':a['collectionReceipts'][0]['label']='wrong'
   elif mutate=='not-completed':a['collectionReceipts'][0]['completed']=False
   else:a['collectionReceipts'][0]['collectionCalls']=0
   with self.subTest(mutate=mutate):self.assertFalse(fn('P1',a,e,f,True,['a'],['done'])['ledgerComplete'])
 def test_final_hash_bridge_and_cleanup_time_are_in_aggregate_budget(self):
  fn,r,e,f=self.fixture();now=[0];calls=[]
  def launch(phase,epoch):calls.append(phase);a=dict(r,phase=phase);return fn(phase,a,e,f,True,['a'],['done'])
  def verify(label):
   if label=='after':now[0]=181
  with self.assertRaises(RuntimeError):run_batch(('P1','P2C'),started_at=0,now=lambda:now[0],verify_inputs=verify,launch=launch)
  self.assertEqual(calls,['P1','P2C'])

if __name__=='__main__':unittest.main()
