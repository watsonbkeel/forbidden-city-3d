"""Synthetic stale /proc row with real owned children, prior pidfd and actual exit.
Both supervisors use identical reduced fixture limits and the same injected read race.
No product/browser check or historical result is replaced by these tests.
"""
import importlib.util,json,os,select,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
HERE=Path(__file__).resolve().parent

def atomic_write_pid(path,pid):
 if type(pid)is not int or pid<=0:raise ValueError('positive integer PID required')
 pending=path.with_name(path.name+'.pending')
 if pending.exists():raise FileExistsError(str(pending))
 pending.write_text(str(pid));pending.replace(path)

def release_fixture_parent(release,fd):
 release.touch()
 poller=select.poll();poller.register(fd,select.POLLIN);events=poller.poll(1000)
 assert len(events)==1 and events[0][0]==fd,'fixture parent exit receipt missing'
 mask=events[0][1]
 assert mask&select.POLLIN and not mask&~(select.POLLIN|select.POLLHUP),'fixture parent exit receipt inconclusive'
 return mask

def persist_fixture_receipt(directory,name,receipt):
 out=Path(directory)
 if not out.is_absolute()or out.resolve().is_relative_to(Path.cwd().resolve()):raise ValueError('external absolute fixture evidence required')
 if name not in ('r177_build_bound','r327_bound_exit_guard'):raise ValueError('known fixture only')
 data=json.dumps(receipt,indent=2)+'\n'
 if len(data.encode())>262144:raise ValueError('bounded fixture evidence exceeded')
 out=out/'exit-race-fixture';out.mkdir(parents=True,exist_ok=True)
 with(out/(name+'.json')).open('x')as f:f.write(data);f.flush();os.fsync(f.fileno())

def load(name):
 s=importlib.util.spec_from_file_location(name,HERE/(name+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def exercise(name):
 m=load(name)
 with tempfile.TemporaryDirectory() as tmp:
  root=Path(tmp);pidfile=root/'worker.pid';release=root/'release';exited=root/'exited';parent_release=root/'parent-release';state={};parent_handle=[]
  original=m.process_table;original_pidfd_open=m.os.pidfd_open
  def bind(pid,*args):
   fd=original_pidfd_open(pid,*args)
   state.setdefault('opened_pids',[]).append(pid)
   if not parent_handle:
    stat=Path(f'/proc/{pid}/stat').read_text();start=int(stat[stat.rfind(')')+2:].split()[19])
    parent_handle.append(os.dup(fd));state['parent_binding']={'pid':pid,'start':start,'bound_ns':time.monotonic_ns(),'source':'prior-direct-child-pidfd-duplicate'}
   return fd
  def race_table():
   # A later scan only: the prior injected target row has already returned to the guard.
   # Keep the unrelated direct parent stable until its real kernel terminal is known.
   if state.get('injected') and not state.get('parent_released'):
    assert parent_handle,'fixture parent was not bound before target injection'
    state['parent_release_mask']=release_fixture_parent(parent_release,parent_handle[0]);state['parent_released']=True
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
  code=f"import subprocess,sys,time,pathlib;c=subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)']);sys.path.insert(0,{str(HERE)!r});from test_r327_supervisor_exit_race import atomic_write_pid;atomic_write_pid(pathlib.Path({str(pidfile)!r}),c.pid);r=pathlib.Path({str(release)!r});\nwhile not r.exists():time.sleep(.002)\nc.terminate();c.wait();pathlib.Path({str(exited)!r}).write_text('done');p=pathlib.Path({str(parent_release)!r});\nwhile not p.exists():time.sleep(.002)"
  sample=lambda:{'capacity':16*m.GIB,'available':14*m.GIB,'quota':[['fixture','max']],'oom':[['fixture',0]],'raw':{'synthetic':True},'at':time.time()}
  result=None;fixture_exception=None
  try:
   with patch.object(m,'process_table',race_table),patch.object(m.os,'pidfd_open',bind),patch.multiple(m,ADMISSION_INTERVAL=.001,SAMPLE_SECONDS=.01,WALL_SECONDS=3,RSS_CAP=128*m.MIB):
    result=m.supervise([sys.executable,'-c',code],root/'evidence',sample,{'synthetic_r326_exit_race':True},os.environ.copy())
  except BaseException as error:
   fixture_exception=repr(error);raise
  finally:
   for fd in parent_handle:os.close(fd)
   proof=root/'evidence/bound-exit-proofs.json';terminal=root/'evidence/build-terminal.json'
   receipt={'result':result,'fixture_state':state,'proof':json.loads(proof.read_text())if proof.exists()else None,'fixture_exception':fixture_exception,'original_terminal':json.loads(terminal.read_text())if terminal.exists()else None}
   if os.environ.get('R327_FIXTURE_EVIDENCE'):
    out=Path(os.environ['R327_FIXTURE_EVIDENCE']);out.mkdir(parents=True,exist_ok=True);(out/(name+'.json')).write_text(json.dumps(receipt,indent=2)+'\n')
   elif os.environ.get('EVIDENCE_DIR'):persist_fixture_receipt(os.environ['EVIDENCE_DIR'],name,receipt)
  return result,state,receipt['proof']
class ExitRace(unittest.TestCase):
 def test_original_fails_the_same_stale_live_row_after_actual_exit(self):
  r,s,p=exercise('r177_build_bound');self.assertTrue(s.get('injected'));self.assertEqual(r['reason'],'RESOURCE_MEASUREMENT_FAILED');self.assertIn('lacks RSS',r['measurement_error']);self.assertTrue(r['cleanup_complete']);self.assertIsNone(p)
 def test_successor_passes_only_with_prior_bound_kernel_exit_receipt(self):
  r,s,p=exercise('r327_bound_exit_guard');self.assertTrue(s.get('injected'));self.assertEqual(r['status'],'PASS');self.assertEqual(r['child_exit_code'],0);self.assertTrue(r['cleanup_complete']);self.assertEqual(len(p['proofs']),1);proof=p['proofs'][0];self.assertEqual(proof['original']['state'],'R');self.assertTrue(proof['rss_unknown_retained']);self.assertLess(proof['binding']['bound_ns'],proof['scan_started_ns']);self.assertEqual(proof['proc'],'MISSING')
if __name__=='__main__':unittest.main(verbosity=2)
