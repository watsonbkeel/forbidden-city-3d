import select
from unittest.mock import patch
import importlib.util,os,signal,subprocess,sys,tempfile,time,unittest,json
from pathlib import Path
p=Path(__file__).with_name('r327_bound_exit_guard.py');spec=importlib.util.spec_from_file_location('bound_guard',p);g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
class ExitProof(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'proof.json';self.child=subprocess.Popen([sys.executable,'-c','import time;time.sleep(20)']);self.pid=self.child.pid;self.start=int(Path(f'/proc/{self.pid}/stat').read_text().rsplit(')',1)[1].split()[19]);self.fd=os.pidfd_open(self.pid);self.key=(self.pid,self.start);self.handles={self.key:self.fd};self.bindings={self.key:{'pid':self.pid,'start':self.start,'fd':self.fd,'bound_ns':time.monotonic_ns(),'source':'verified-prior-owned-pid-start-handle'}};self.row={'pid':self.pid,'start':self.start,'state':'R','rss':0,'hwm':1024,'rss_unknown':True,'ppid':os.getpid(),'pgid':os.getpgrp()};self.scan_started_ns=time.monotonic_ns();self.journal={'kind':'r327-kernel-bound-exit-proof','proofs':[]}
 def tearDown(self):
  if self.child.poll() is None:self.child.terminate()
  self.child.wait()
  try:os.close(self.fd)
  except OSError:pass
  self.tmp.cleanup()
 def dead(self):self.child.terminate();self.child.wait()
 def prove(self):return g.confirm_bound_exit(self.row,self.handles,self.bindings,self.journal,self.path,self.scan_started_ns)
 def test_dead_reaped_kernel_handle_and_missing_proc_are_positive_proof(self):
  self.dead();self.assertTrue(self.prove());d=json.loads(self.path.read_text());self.assertEqual(d,self.journal);e=d['proofs'][0];self.assertEqual(e['original'],self.row);self.assertEqual(e['binding'],self.bindings[self.key]);self.assertEqual(e['proc'],'MISSING');self.assertTrue(e['poll_mask']&1);self.assertGreaterEqual(e['confirmed_ns'],e['binding']['bound_ns']);self.assertEqual(self.row['state'],'R')
 def test_live_kernel_handle_does_not_pass(self):self.assertFalse(self.prove());self.assertFalse(self.path.exists())
 def test_exited_but_still_present_zombie_is_not_this_narrow_missing_proc_case(self):
  self.child.terminate();os.waitid(os.P_PID,self.pid,os.WEXITED|os.WNOWAIT);self.assertFalse(self.prove())
 def test_missing_prior_handle_still_fails_after_exit(self):self.dead();self.handles.clear();self.assertFalse(self.prove())
 def test_wrong_start_is_not_same_instance(self):self.dead();self.row['start']+=1;self.assertFalse(self.prove())
 def test_missing_binding_record_fails(self):self.dead();self.bindings.clear();self.assertFalse(self.prove())
 def test_closed_handle_fails(self):self.dead();os.close(self.fd);self.assertFalse(self.prove())
 def test_readable_pipe_is_not_kernel_process_exit_proof(self):
  self.dead();a,b=os.pipe();os.write(b,b'x');self.handles[self.key]=a;self.bindings[self.key]['fd']=a
  try:self.assertFalse(self.prove())
  finally:os.close(a);os.close(b)
 def test_binding_fd_mismatch_fails(self):self.dead();self.bindings[self.key]['fd']+=1;self.assertFalse(self.prove())
 def test_write_failure_cannot_be_success(self):
  self.dead();self.path=Path(self.tmp.name)/'absent'/'proof.json';self.assertFalse(self.prove());self.assertEqual(self.journal['proofs'],[])
 def test_journal_overflow_cannot_be_success(self):
  self.dead();self.journal['proofs']=[{'padding':'x'*2048}]*128;self.assertFalse(self.prove())
 def test_non_unknown_rss_not_eligible(self):self.dead();self.row['rss_unknown']=False;self.assertFalse(self.prove())
 def test_binding_created_during_this_scan_is_rejected(self):
  self.dead();self.bindings[self.key]['bound_ns']=self.scan_started_ns;self.assertFalse(self.prove())
 def test_permission_error_on_fresh_proc_read_is_not_disappearance(self):
  self.dead()
  with patch.object(Path,'read_text',side_effect=PermissionError('fixture')):self.assertFalse(self.prove())
 def test_bad_poll_masks_and_poll_errors_fail_closed(self):
  self.dead()
  for value in [[],[(self.fd,select.POLLHUP)],[(self.fd,select.POLLERR)],[(self.fd,select.POLLIN|select.POLLNVAL)],[(self.fd+1,select.POLLIN)]]:
   class Poll:
    def register(inner,*args):pass
    def poll(inner,*args):return value
   with patch.object(g.select,'poll',Poll):self.assertFalse(self.prove())
  with patch.object(g.select,'poll',side_effect=OSError('fixture')):self.assertFalse(self.prove())
 def test_proof_does_not_erase_original_state_or_unknown_rss(self):
  self.dead();original=g.process_table;g.process_table=lambda:{self.pid:self.row}
  try:
   result=g.owned_processes(os.getpgrp(),{},0,terminal_recheck=lambda row:self.prove())
   self.assertEqual(result[self.pid]['state'],'R');self.assertTrue(result[self.pid]['rss_unknown']);self.assertTrue(result[self.pid]['terminal_pidfd_proven']);self.assertNotIn('terminal_pidfd_proven',self.row)
  finally:g.process_table=original
 def test_original_strict_owned_gate_remains_default(self):
  original=g.process_table;g.process_table=lambda:{self.pid:self.row}
  try:
   with self.assertRaisesRegex(g.ResourceError,'lacks RSS'):g.owned_processes(os.getpgrp(),{},0)
  finally:g.process_table=original
 def test_injected_terminal_flag_is_never_trusted(self):
  row={**self.row,'rss':1024,'rss_unknown':False,'terminal_pidfd_proven':True}
  with patch.object(g,'process_table',lambda:{self.pid:row}):
   result=g.owned_processes(os.getpgrp(),{},0,terminal_recheck=lambda r:False)
  self.assertNotIn('terminal_pidfd_proven',result[self.pid]);self.assertTrue(row['terminal_pidfd_proven'])
 def test_injected_terminal_flag_cannot_hide_unknown_rss(self):
  row={**self.row,'terminal_pidfd_proven':True}
  with patch.object(g,'process_table',lambda:{self.pid:row}):
   with self.assertRaisesRegex(g.ResourceError,'lacks RSS'):g.owned_processes(os.getpgrp(),{},0,terminal_recheck=lambda r:False)
if __name__=='__main__':unittest.main()
