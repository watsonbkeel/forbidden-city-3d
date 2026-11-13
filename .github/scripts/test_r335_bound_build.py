"""Wrapper control tests only; real resource/identity/exit controls have separate unchanged tests."""
import importlib.util,json,os,sys,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
p=Path(__file__).with_name('r335_bound_build.py');s=importlib.util.spec_from_file_location('wrapper',p);w=importlib.util.module_from_spec(s);s.loader.exec_module(w)
class Wrapper(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.e=Path(self.tmp.name);self.identity={'head':'a'*40,'tree':'b'*40};(self.e/'checkout-identity.json').write_text(json.dumps(self.identity));self.calls=[];self.code=0;self.term={'identity':self.identity,'status':'PASS','exit_code':0,'child_exit_code':0,'cleanup_complete':True};self.raiseMain=False
  def atomic(p,v):p.write_text(json.dumps(v))
  def build():
   self.calls.append('main');self.assertEqual(sys.argv,['entry']);self.assertFalse(os.environ.get('NODE_OPTIONS'));atomic(self.e/'build-terminal.json',self.term)
   if self.raiseMain:raise RuntimeError('fixture real delegation failure')
   return self.code
  self.guard=SimpleNamespace(main=build,atomic_json=atomic,RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16')
  def install(g,r,j,f):
   self.assertIs(g,self.guard);self.calls.append('install');return SimpleNamespace(summary=lambda:{'actualTestObserver':True}),{'events':[]}
  self.modules={'r327_bound_exit_guard':self.guard,'r262_exit_recheck':object(),'r267_owned_rss_observation':SimpleNamespace(install=install)}
  self.patchers=[patch.object(w,'load',side_effect=lambda n:self.modules[n]),patch.dict(os.environ,{'EVIDENCE_DIR':str(self.e),'GITHUB_SHA':'a'*40},clear=True),patch.object(sys,'argv',['entry'])]
  for p in self.patchers:p.start()
 def tearDown(self):
  for p in reversed(self.patchers):p.stop()
  self.tmp.cleanup()
 def test_installs_once_before_unchanged_main_and_records_exact_success(self):
  self.assertEqual(w.main(),0);self.assertEqual(self.calls,['install','main']);self.assertTrue((self.e/'ordinary-build-exit-rechecks.json').is_file());r=json.loads((self.e/'ordinary-build-observation.json').read_text());self.assertEqual(r['status'],'PASS');self.assertEqual(r['guardExitCode'],0);self.assertTrue(r['observation']['actualTestObserver']);self.assertEqual(r['limits']['rss_bytes'],4294967296)
 def test_original_nonzero_is_not_reclassified(self):
  self.code=1;self.term.update(status='FAIL',exit_code=1,child_exit_code=-15,reason='RESOURCE_MEASUREMENT_FAILED');self.assertEqual(w.main(),1);self.assertTrue((self.e/'ordinary-build-observation.json').is_file());self.assertEqual(json.loads((self.e/'ordinary-build-observation.json').read_text())['status'],'FAIL')
 def test_incomplete_success_receipt_rejected(self):
  self.term['cleanup_complete']=False
  with self.assertRaises(ValueError):w.main()
 def test_wrong_terminal_identity_rejected(self):
  self.term['identity']={'head':'c'*40,'tree':'b'*40}
  with self.assertRaises(ValueError):w.main()
 def test_duplicate_attempt_does_not_reinvoke_guard(self):
  w.main()
  with self.assertRaises(FileExistsError):w.main()
  self.assertEqual(self.calls,['install','main'])
 def test_arguments_rejected_before_guard(self):
  sys.argv.append('--change-budget')
  with self.assertRaises(ValueError):w.main()
  self.assertEqual(self.calls,[])
 def test_failed_delegation_still_saves_failure_journal_and_summary(self):
  self.raiseMain=True
  with self.assertRaisesRegex(RuntimeError,'delegation'):w.main()
  self.assertTrue((self.e/'ordinary-build-observation.json').is_file());self.assertEqual(json.loads((self.e/'ordinary-build-observation.json').read_text())['status'],'FAIL');self.assertTrue((self.e/'ordinary-build-exit-rechecks.json').is_file())
 def test_in_tree_evidence_rejected_before_guard(self):
  with patch.dict(os.environ,{'EVIDENCE_DIR':str(Path.cwd())}):
   with self.assertRaises(ValueError):w.main()
  self.assertEqual(self.calls,[])
if __name__=='__main__':unittest.main(verbosity=2)
