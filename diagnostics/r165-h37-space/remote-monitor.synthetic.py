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
 def __init__(self,*a,**k):self.stdout=io.StringIO('PROBE_WORKER_PID=999998\n')
 def poll(self):return 0
class Tests(unittest.TestCase):
 def test_fixed_remote_node_threshold(self):
  def proc(rss):return {99:{'kind':'present','pid':99,'starttime':1,'state':'R','ppid':1,'pgid':99,'rssKiB':rss,'hwmKiB':rss}}
  self.assertIsNone(m.MonitorState(99,99,limit_mib=768).tick(1,proc(768*1024),False,None)['failureReason'])
  self.assertEqual(m.MonitorState(99,99,limit_mib=768).tick(1,proc(768*1024+1),False,None)['failureReason'],'node-tree-RSS-over768MiB')
  self.assertEqual(m.MonitorState(99,99).tick(1,proc(350*1024+1),False,None)['failureReason'],'node-tree-RSS-over350MiB')
 def test_remote_guard_failure_closes_batch(self):
  with tempfile.TemporaryDirectory()as d,patch.object(m.subprocess,'Popen',Popen),patch.object(m.threading,'Thread',Thread),patch.object(m,'scan_proc',lambda:{}),patch.object(m.time,'monotonic',lambda:1),patch.object(m,'signal_known',lambda*args:[]),patch.object(m,'guard_write',lambda*args:None):
   result,samples,final=m.run_process(['never-real'],Path(d),{},Path(d)/'mock.log',started_at=0,node_limit_mib=768,resource_guard=lambda table,alive:{'ok':False,'violations':['disk']})
   self.assertEqual(result['terminationReason'],'remote-resource-contract');self.assertFalse(m.wrapper_exit(0,final,True)==0);self.assertFalse(samples[0]['remoteResources']['ok'])
if __name__=='__main__':unittest.main()
