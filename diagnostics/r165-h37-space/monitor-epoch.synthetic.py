"""Real run_process wiring with a pure fake Popen and proc table. No Node starts."""
import unittest,io,tempfile
from pathlib import Path
from unittest.mock import patch
import probe_monitor as m
class Thread:
 def __init__(self,target,daemon):self.target=target
 def start(self):self.target()
 def join(self,timeout):pass
class Popen:
 pid=999999
 def __init__(self,*args,**kwargs):self.stdout=io.StringIO('PROBE_WORKER_PID=999998\n')
 def poll(self):return 0
class Tests(unittest.TestCase):
 def run_fake(self,epoch):
  with tempfile.TemporaryDirectory()as d,patch.object(m.subprocess,'Popen',Popen),patch.object(m.threading,'Thread',Thread),patch.object(m,'scan_proc',lambda:{}),patch.object(m.time,'monotonic',lambda:181),patch.object(m,'signal_known',lambda*args:[]):
   return m.run_process(['never-real'],Path(d),{},Path(d)/'mock.log',started_at=epoch)
 def test_supplied_batch_epoch_is_not_reset_by_second_run_process(self):
  r,s,f=self.run_fake(0);self.assertEqual(r['terminationReason'],'watchdog180s');self.assertTrue(f['complete']);self.assertEqual(r['durationSeconds'],181)
 def test_optional_default_retains_original_single_process_time_origin(self):
  r,s,f=self.run_fake(None);self.assertIsNone(r['terminationReason']);self.assertTrue(f['complete']);self.assertEqual(r['durationSeconds'],0)
if __name__=='__main__':unittest.main()
