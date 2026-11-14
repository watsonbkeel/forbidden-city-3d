import unittest,tempfile,json
from pathlib import Path
from unittest.mock import patch
import test_r327_supervisor_exit_race as f
class FixtureHandoff(unittest.TestCase):
 def test_atomic_pid_is_not_visible_until_complete(self):
  with tempfile.TemporaryDirectory()as t:
   p=Path(t)/'worker.pid';original=Path.write_text;seen=[]
   def paused(q,text,*a,**kw):
    result=original(q,text,*a,**kw);seen.append((q.name,p.exists()));return result
   with patch.object(Path,'write_text',paused):f.atomic_write_pid(p,123)
   self.assertEqual(p.read_text(),'123');self.assertEqual(seen,[('worker.pid.pending',False)])
 def test_pid_validation_does_not_publish(self):
  with tempfile.TemporaryDirectory()as t:
   p=Path(t)/'worker.pid'
   for bad in (0,-1,'12',True):
    with self.assertRaises(ValueError):f.atomic_write_pid(p,bad)
   self.assertFalse(p.exists())
 def test_full_failure_receipt_before_assertion_preserved_once(self):
  with tempfile.TemporaryDirectory()as t:
   receipt={'result':{'status':'FAIL','reason':'SUPERVISOR_ERROR','detail':'synthetic'},'fixture_state':{'injected':False},'proof':None}
   f.persist_fixture_receipt(t,'r177_build_bound',receipt);p=Path(t)/'exit-race-fixture/r177_build_bound.json';self.assertEqual(json.loads(p.read_text()),receipt)
   with self.assertRaises(FileExistsError):f.persist_fixture_receipt(t,'r177_build_bound',receipt)
 def test_unsafe_or_unbounded_receipts_are_rejected(self):
  with tempfile.TemporaryDirectory()as t:
   for root,name,r in [('relative','r177_build_bound',{}),(str(Path.cwd()),'r177_build_bound',{}),(t,'../arbitrary',{}),(t,'r177_build_bound',{'huge':'x'*262145})]:
    with self.assertRaises(ValueError):f.persist_fixture_receipt(root,name,r)
 def test_parent_exit_handoff_requires_exact_kernel_terminal(self):
  with tempfile.TemporaryDirectory()as t:
   release=Path(t)/'release';poller=unittest.mock.Mock();poller.poll.return_value=[(123,f.select.POLLIN)]
   with patch.object(f.select,'poll',return_value=poller):self.assertEqual(f.release_fixture_parent(release,123),f.select.POLLIN)
   self.assertTrue(release.exists());poller.register.assert_called_once_with(123,f.select.POLLIN);poller.poll.assert_called_once_with(1000)
 def test_parent_exit_handoff_rejects_timeout_wrong_fd_or_error(self):
  with tempfile.TemporaryDirectory()as t:
   for events in ([],[(124,f.select.POLLIN)],[(123,f.select.POLLERR)],[(123,f.select.POLLIN|f.select.POLLERR)]):
    poller=unittest.mock.Mock();poller.poll.return_value=events
    with patch.object(f.select,'poll',return_value=poller),self.assertRaises(AssertionError):f.release_fixture_parent(Path(t)/'release',123)
if __name__=='__main__':unittest.main(verbosity=2)
