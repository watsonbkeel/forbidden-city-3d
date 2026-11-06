import unittest,tempfile,json,hashlib
from pathlib import Path
from run_space import check_frames,run_session,finalize_result
class Wrapper(unittest.TestCase):
 def test_raw_evidence_missing_or_captured_not_passed_rejected(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d)
   with self.assertRaises((ValueError,FileNotFoundError)):check_frames(p,'P1',1)
   (p/'FRAME-INDEX-P1.json').write_text(json.dumps({'phase':'P1','rows':[{'index':0,'status':'captured'}]}))
   with self.assertRaises(ValueError):check_frames(p,'P1',1)
 def test_exact_frame_readback(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d);raw=b'[{"x":1}]\n';(p/'P1-000.frames.json').write_bytes(raw);row={'index':0,'status':'passed','file':'P1-000.frames.json','bytes':len(raw),'frameCount':1,'fileSHA256':hashlib.sha256(raw).hexdigest(),'frameSHA256':'a'*64};(p/'FRAME-INDEX-P1.json').write_text(json.dumps({'phase':'P1','rows':[row]}));self.assertTrue(check_frames(p,'P1',1)['complete']);(p/'P1-000.frames.json').write_bytes(b'bad')
   with self.assertRaises(ValueError):check_frames(p,'P1',1)
 def test_failed_first_phase_never_launches_second_and_final_lock_checked(self):
  calls=[];locks=[]
  def check(label):locks.append(label)
  def launch(phase,epoch):calls.append(phase);return {'phase':phase,'success':False}
  r=run_session(started_at=0,now=lambda:1,verify_inputs=check,launch=launch)
  self.assertFalse(r['success']);self.assertEqual(calls,['P1']);self.assertEqual(locks,['before','final'])
 def test_final_lock_failure_cannot_green(self):
  def check(label):raise ValueError('drift')
  calls=[];r=run_session(started_at=0,now=lambda:1,verify_inputs=check,launch=lambda*p:calls.append(p));self.assertFalse(r['success']);self.assertEqual(calls,[])
 def test_final_result_write_is_inside_deadline(self):
  clock=[179];writes=[]
  def write(name,value):writes.append(json.loads(json.dumps(value)));clock[0]+=2
  r={'success':True};self.assertEqual(finalize_result(r,write=write,now=lambda:clock[0],started_at=0),1);self.assertFalse(writes[-1]['success']);self.assertTrue(writes[-1]['deadlineFailed'])
 def test_final_result_success_is_provisional_until_exit(self):
  rows=[];r={'success':True};self.assertEqual(finalize_result(r,write=lambda n,v:rows.append(v.copy()),now=lambda:1,started_at=0),0);self.assertTrue(rows[-1]['requiresZeroWrapperExit'])
if __name__=='__main__':unittest.main()
