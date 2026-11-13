"""Synthetic stale /proc row with real owned children, prior pidfd and actual exit.
Both supervisors use identical reduced fixture limits and the same injected read race.
No product/browser check or historical result is replaced by these tests.
"""
import importlib.util,json,os,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
HERE=Path(__file__).resolve().parent

def load(name):
 s=importlib.util.spec_from_file_location(name,HERE/(name+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def exercise(name):
 m=load(name)
 with tempfile.TemporaryDirectory() as tmp:
  root=Path(tmp);pidfile=root/'worker.pid';release=root/'release';exited=root/'exited';state={}
  original=m.process_table;original_pidfd_open=m.os.pidfd_open
  def bind(pid,*args):
   fd=original_pidfd_open(pid,*args)
   state.setdefault('opened_pids',[]).append(pid)
   return fd
  def race_table():
   rows=original()
   if pidfile.exists() and not state.get('injected'):
    pid=int(pidfile.read_text())
    if 'observed'not in state and pid in rows and not rows[pid].get('rss_unknown'):
     state['observed']=dict(rows[pid])
    elif 'observed'in state and pid in state.get('opened_pids',[]):
     release.touch();deadline=time.monotonic()+1
     while not exited.exists() and time.monotonic()<deadline:time.sleep(.002)
     if not exited.exists():raise AssertionError('controlled child did not exit')
     rows=original();assert pid not in rows
     rows[pid]={**state['observed'],'state':'R','rss':0,'rss_unknown':True};state['injected']=True
   return rows
  code=f"import subprocess,sys,time,pathlib;c=subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)']);pathlib.Path({str(pidfile)!r}).write_text(str(c.pid));r=pathlib.Path({str(release)!r});\nwhile not r.exists():time.sleep(.002)\nc.terminate();c.wait();pathlib.Path({str(exited)!r}).write_text('done');time.sleep(.05)"
  sample=lambda:{'capacity':16*m.GIB,'available':14*m.GIB,'quota':[['fixture','max']],'oom':[['fixture',0]],'raw':{'synthetic':True},'at':time.time()}
  with patch.object(m,'process_table',race_table),patch.object(m.os,'pidfd_open',bind),patch.multiple(m,ADMISSION_INTERVAL=.001,SAMPLE_SECONDS=.01,WALL_SECONDS=3,RSS_CAP=128*m.MIB):
   result=m.supervise([sys.executable,'-c',code],root/'evidence',sample,{'synthetic_r326_exit_race':True},os.environ.copy())
  proof=root/'evidence/bound-exit-proofs.json'
  receipt={'result':result,'fixture_state':state,'proof':json.loads(proof.read_text()) if proof.exists() else None}
  if os.environ.get('R327_FIXTURE_EVIDENCE'):
   out=Path(os.environ['R327_FIXTURE_EVIDENCE']);out.mkdir(parents=True,exist_ok=True);(out/(name+'.json')).write_text(json.dumps(receipt,indent=2)+'\n')
  return result,state,receipt['proof']
class ExitRace(unittest.TestCase):
 def test_original_fails_the_same_stale_live_row_after_actual_exit(self):
  r,s,p=exercise('r177_build_bound');self.assertTrue(s.get('injected'));self.assertEqual(r['reason'],'RESOURCE_MEASUREMENT_FAILED');self.assertIn('lacks RSS',r['measurement_error']);self.assertTrue(r['cleanup_complete']);self.assertIsNone(p)
 def test_successor_passes_only_with_prior_bound_kernel_exit_receipt(self):
  r,s,p=exercise('r327_bound_exit_guard');self.assertTrue(s.get('injected'));self.assertEqual(r['status'],'PASS');self.assertEqual(r['child_exit_code'],0);self.assertTrue(r['cleanup_complete']);self.assertEqual(len(p['proofs']),1);proof=p['proofs'][0];self.assertEqual(proof['original']['state'],'R');self.assertTrue(proof['rss_unknown_retained']);self.assertLess(proof['binding']['bound_ns'],proof['scan_started_ns']);self.assertEqual(proof['proc'],'MISSING')
if __name__=='__main__':unittest.main(verbosity=2)
