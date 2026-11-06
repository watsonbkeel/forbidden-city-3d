import unittest,tempfile
from unittest.mock import patch
from types import SimpleNamespace
from pathlib import Path
from resource_contract import evaluate,effective_memory,descendants,parse_memory,snapshot_resources,evidence_size
M=1024*1024
S={'capacityBytes':4096*M,'availableBytes':2048*M,'nodeRSSBytes':768*M,'nonNodeRSSBytes':256*M,'wrapperHighWaterBytes':256*M,'diskAvailableBytes':2048*M,'evidenceBytes':512*M}
class Resources(unittest.TestCase):
 def test_minimum_and_unlimited(self):
  self.assertEqual(effective_memory(8192*M,6000*M,[{'limit':None,'current':100*M},{'limit':4096*M,'current':2048*M}]),{'capacityBytes':4096*M,'availableBytes':2048*M})
 def test_unknown_negative_overlimit(self):
  for layers in [[{'limit':100,'current':101}],[{'limit':None,'current':-1}],[{'limit':0,'current':0}],[{'limit':'max','current':0}]]:
   with self.assertRaises(ValueError):effective_memory(8192,4096,layers)
 def test_exact_start_threshold(self):self.assertTrue(evaluate(S,start=True)['ok'])
 def test_each_start_failure(self):
  for key,value in [('capacityBytes',4096*M-1),('availableBytes',2048*M-1),('nodeRSSBytes',768*M+1),('nonNodeRSSBytes',256*M+1),('wrapperHighWaterBytes',256*M+1),('diskAvailableBytes',2048*M-1),('evidenceBytes',512*M+1)]:
   with self.subTest(key=key):self.assertFalse(evaluate({**S,key:value},start=True)['ok'])
 def test_live_reserves(self):
  self.assertTrue(evaluate({**S,'availableBytes':1024*M,'diskAvailableBytes':1024*M},start=False)['ok'])
  for key in ['availableBytes','diskAvailableBytes']:self.assertFalse(evaluate({**S,key:1024*M-1},start=False)['ok'])
 def test_unknown_fails_not_zero(self):
  for key in S:self.assertFalse(evaluate({**S,key:None},start=True)['ok'])
 def test_complete_descendant_graph(self):
  table={1:{'kind':'present','ppid':0},2:{'kind':'present','ppid':1},3:{'kind':'present','ppid':2},4:{'kind':'present','ppid':1},9:{'kind':'present','ppid':0}}
  self.assertEqual(descendants(table,1),{1,2,3,4})
class Cgroups(unittest.TestCase):
 def test_v2_all_ancestors(self):
  files={'/sys/fs/cgroup/foo/bar/memory.max':str(4096*M),'/sys/fs/cgroup/foo/bar/memory.current':str(1024*M),'/sys/fs/cgroup/foo/memory.max':'max','/sys/fs/cgroup/foo/memory.current':str(1000*M),'/sys/fs/cgroup/cgroup.controllers':'memory cpu'}
  def read(p):
   if p not in files:raise FileNotFoundError(p)
   return files[p]
  q=parse_memory('MemTotal: 8388608 kB\nMemAvailable: 6291456 kB\n','0::/foo/bar\n','29 23 0:26 / /sys/fs/cgroup rw - cgroup2 cgroup rw\n',read)
  self.assertEqual(q['capacityBytes'],4096*M);self.assertEqual(q['availableBytes'],3072*M);self.assertEqual(len(q['layers']),3)
 def test_v1_root_mapping_and_unlimited(self):
  files={'/sys/fs/cgroup/memory/x/memory.limit_in_bytes':str(2**63-4096),'/sys/fs/cgroup/memory/x/memory.usage_in_bytes':str(100*M),'/sys/fs/cgroup/memory/memory.limit_in_bytes':str(4096*M),'/sys/fs/cgroup/memory/memory.usage_in_bytes':str(2048*M)}
  q=parse_memory('MemTotal: 8388608 kB\nMemAvailable: 6291456 kB\n','5:memory:/x\n','29 23 0:26 / /sys/fs/cgroup/memory rw - cgroup cgroup rw,memory\n',files.__getitem__)
  self.assertEqual(q['availableBytes'],2048*M);self.assertEqual(len(q['layers']),2)
 def test_unknown_missing_limit_fails(self):
  with self.assertRaises((ValueError,KeyError)):parse_memory('MemTotal: 8 kB\nMemAvailable: 4 kB\n','0::/x\n','29 23 0:26 / /sys/fs/cgroup rw - cgroup2 cgroup rw\n',{}.__getitem__)
 def test_true_v2_root_only_uses_physical_memory(self):
  def read(p):
   if p.endswith('/cgroup.controllers'):return 'cpu memory pids'
   raise FileNotFoundError(p)
  q=parse_memory('MemTotal: 8388608 kB\nMemAvailable: 6291456 kB\n','0::/\n','29 23 0:26 / /sys/fs/cgroup rw - cgroup2 cgroup rw\n',read)
  self.assertEqual(q['capacityBytes'],8192*M);self.assertEqual(q['availableBytes'],6144*M);self.assertIsNone(q['layers'][0]['current']);self.assertTrue(q['layers'][0]['rootNonAccounting'])
 def test_root_ambiguity_missing_one_permission_and_subtree_rejected(self):
  for values in [{'cgroup.controllers':'cpu'},{'cgroup.controllers':'memory','memory.max':'max'},{'cgroup.controllers':'memory','memory.max':'max','memory.current':'0'}]:
   def read(p):
    k=p.rsplit('/',1)[-1]
    if k not in values:raise FileNotFoundError(p)
    return values[k]
   with self.assertRaises(ValueError):parse_memory('MemTotal: 8 kB\nMemAvailable: 4 kB\n','0::/\n','29 23 0:26 / /sys/fs/cgroup rw - cgroup2 cgroup rw\n',read)
  with self.assertRaises(PermissionError):parse_memory('MemTotal: 8 kB\nMemAvailable: 4 kB\n','0::/\n','29 23 0:26 / /sys/fs/cgroup rw - cgroup2 cgroup rw\n',lambda p:(_ for _ in ()).throw(PermissionError(p)))
  with self.assertRaises(ValueError):parse_memory('MemTotal: 8 kB\nMemAvailable: 4 kB\n','0::/hidden/\n','29 23 0:26 /hidden /sys/fs/cgroup rw - cgroup2 cgroup rw\n',lambda p:'max')
class OwnedIdentity(unittest.TestCase):
 def test_seen_non_node_unknown_zombie_gone_and_reuse(self):
  def proc(pid,ppid,start=1):return {'kind':'present','pid':pid,'ppid':ppid,'starttime':start,'state':'R','rssKiB':10,'hwmKiB':20}
  with tempfile.TemporaryDirectory()as d,patch('resource_contract.Path.read_text',return_value=''),patch('resource_contract.parse_memory',return_value={'capacityBytes':8*1024**3,'availableBytes':6*1024**3}),patch('resource_contract.os.statvfs',return_value=SimpleNamespace(f_bavail=10*1024**3,f_frsize=1)):
   known={};table={1:proc(1,0),2:proc(2,1)};r=snapshot_resources(table,set(),d,wrapper_pid=1,known_non_node=known);self.assertEqual(r['nonNodeRSSBytes'],20*1024);self.assertEqual(r['wrapperHighWaterBytes'],20*1024)
   for q in [{'kind':'unknown','pid':2},{**proc(2,1),'state':'Z'}]:
    with self.assertRaises(ValueError):snapshot_resources({1:proc(1,0),2:q},set(),d,wrapper_pid=1,known_non_node=known)
   for q in [None,proc(2,999,2)]:
    table={1:proc(1,0)}
    if q:table[2]=q
    r=snapshot_resources(table,set(),d,wrapper_pid=1,known_non_node=known);self.assertEqual(r['nonNodeRSSBytes'],10*1024)
class EvidenceRace(unittest.TestCase):
 def test_known_atomic_index_rename_rescans_once(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d);tmp=p/'FRAME-INDEX-P1.json.tmp';tmp.write_bytes(b'new');original=Path.lstat;changed=[False]
   def lstat(q,*args,**kwargs):
    if q==tmp and not changed[0]:changed[0]=True;q.rename(p/'FRAME-INDEX-P1.json')
    return original(q,*args,**kwargs)
   with patch.object(Path,'lstat',lstat):self.assertEqual(evidence_size(p),3)
 def test_arbitrary_disappearing_file_is_not_ignored(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d);tmp=p/'unexpected';tmp.write_bytes(b'new');original=Path.lstat;changed=[False]
   def lstat(q,*args,**kwargs):
    if q==tmp and not changed[0]:changed[0]=True;q.unlink()
    return original(q,*args,**kwargs)
   with patch.object(Path,'lstat',lstat),self.assertRaises(FileNotFoundError):evidence_size(p)
if __name__=='__main__':unittest.main()
