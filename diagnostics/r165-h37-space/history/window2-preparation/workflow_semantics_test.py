import unittest
from workflow_semantics import validate_expressions,validate_scripts
class WorkflowSemantics(unittest.TestCase):
 def test_original_job_runner_context_is_rejected(self):
  with self.assertRaisesRegex(ValueError,'runner'):validate_expressions({'jobs':{'diagnose':{'env':{'EVIDENCE_DIR':'${{ runner.temp }}/evidence'}}}})
 def test_step_runner_and_github_contexts_are_valid(self):
  validate_expressions({'jobs':{'diagnose':{'if':"github.run_number == 2",'steps':[{'with':{'path':'${{ runner.temp }}/evidence','ref':'${{ github.sha }}'}},{'if':'always()','env':{'RESULT':'${{ steps.probe.outcome }}'}}]}}})
 def test_unknown_context_and_malformed_expression_fail(self):
  for value in ['${{ mystery.foo }}','${{ runner.temp }','${{ unknown }}']:
   with self.assertRaises(ValueError):validate_expressions({'jobs':{'diagnose':{'steps':[{'run':value}]}}})
 def test_uses_does_not_allow_expressions(self):
  with self.assertRaises(ValueError):validate_expressions({'jobs':{'diagnose':{'steps':[{'uses':'${{ github.sha }}'}]}}})
 def test_bash_and_embedded_python_are_parsed_not_executed(self):
  q=validate_scripts({'jobs':{'diagnose':{'steps':[{'run':"python3 - <<'PY'\nraise RuntimeError('must never execute')\nPY\n"}]}}});self.assertEqual(q,{'shellScripts':1,'pythonHeredocs':1,'javascriptHeredocs':0})
 def test_broken_embedded_python_fails(self):
  with self.assertRaises(SyntaxError):validate_scripts({'jobs':{'diagnose':{'steps':[{'run':"python3 - <<'PY'\nif:\nPY\n"}]}}})
if __name__=='__main__':unittest.main()
