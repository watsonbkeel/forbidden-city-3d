"""Tiny fixtures only. Never imports the product, ZoneBase or native canvas.

The injected result checker is fixture-only. These tests do not prove the
production acceptance schema, import closure, native writes or runner admission.
"""
import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
import r181_e45_bound as e

HERE=Path(__file__).resolve().parent
LOCAL=HERE.parents[3]
FROZEN=HERE/'r177_build_bound.py'
if not FROZEN.exists():
    FROZEN=LOCAL/'r177-ci-preparation-rev3-20261108/proposed-delta/.github/scripts/r177_build_bound.py'

class E45Fixtures(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.frozen=e.load_frozen(FROZEN.resolve())
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
    def tearDown(self): self.temp.cleanup()
    def budget(self): return e.EvidenceBudget(self.root)
    def sample(self):
        return {'at':time.time(),'capacity':16*e.GIB,'available':14*e.GIB,
                'quota':[['synthetic','test','finite']], 'oom':[['synthetic',0,0]],
                'raw':{'cgroup':'synthetic-only','mountinfo':'synthetic-only','host':{'MemAvailable':14*e.GIB}}}
    def run_tiny(self,program=None,*,full_validator=lambda obj,binding: None,budget=None,sampler=None,wall=1.2):
        budget=budget or self.budget();seal=budget.seal_input(b'{"synthetic":true}\n')
        binding={'candidate_commit':'a'*40,'candidate_tree':'b'*40,'input_manifest_sha256':seal.sha256}
        result={'schema':'e45-eight-zone-result/v1','status':'PASS','completed':True,'cleanup_complete':True,**binding}
        if program is None: program='import time;time.sleep(.04);print('+repr(json.dumps(result))+')'
        plan=e.CommandPlan((sys.executable,'-c',program),self.root,{'LANG':'C.UTF-8'})
        with patch.object(e,'ADMISSION_INTERVAL',.001),patch.object(e,'SAMPLE_SECONDS',.01),patch.object(e,'WALL_SECONDS',wall):
            return e.supervise(plan,self.root,self.frozen,sampler or self.sample,binding,seal,
                               evidence_budget=budget,full_validator=full_validator)
    def test_fixed_limits_and_cli_inert(self):
        self.assertEqual((e.RSS_CAP,e.WALL_SECONDS,e.OUTPUT_CAP,e.TERMINAL_RESERVE),
                         (3*e.GIB,90.,16*e.MIB,65536))
        p=subprocess.run([sys.executable,str(HERE/'r181_e45_bound.py'),'--activate'],capture_output=True)
        self.assertEqual(p.returncode,78);self.assertIsNone(json.loads(p.stdout)['child_pid'])
    def test_fixed_plan_no_inherited_overrides_or_h17_tree(self):
        candidate=self.root/'candidate';candidate.mkdir()
        entry=candidate/e.ENTRY;entry.parent.mkdir(parents=True);entry.write_text('// not executed')
        out=self.root/'evidence';out.mkdir()
        node=Path(sys.executable).resolve()
        with patch.dict(os.environ,{'NODE_OPTIONS':'--expose-gc','LD_PRELOAD':'bad','TEST_ROLE':'baseline'}):
            p=e.command_plan(node,candidate,out,'a'*64)
        self.assertEqual(p.command,(str(node),'--max-old-space-size=1536','--max-semi-space-size=16',str(entry)))
        self.assertEqual(p.cwd,candidate)
        self.assertEqual(p.env['DISABLE_SYSTEM_FONTS_LOAD'],'1')
        self.assertNotIn('NODE_OPTIONS',p.env);self.assertNotIn('LD_PRELOAD',p.env)
        self.assertFalse(any('H17' in k for k in p.env))
        with self.assertRaises(TypeError):p.env['NODE_OPTIONS']='--expose-gc'
    def test_descendants_are_reaped_or_result_cannot_pass(self):
        code="import subprocess,sys,time;subprocess.Popen([sys.executable,'-c','import time;time.sleep(5)']);time.sleep(.04)"
        r=self.run_tiny(code,wall=.5)
        self.assertNotEqual(r['status'],'PASS');self.assertFalse(r['completed'])
        self.assertGreaterEqual(r['owned_processes_observed'],2)
    def test_final_schema_exception_cannot_escape_finalization(self):
        def broken(obj,binding):raise KeyError('required exact payload key absent')
        r=self.run_tiny(full_validator=broken)
        self.assertNotEqual(r['status'],'PASS');self.assertFalse(r['completed'])
        self.assertTrue(r['cleanup_complete']);self.assertTrue((self.root/'terminal.json').exists())
    def test_font_query_requires_actual_face_and_finite_ranges(self):
        self.assertTrue(hasattr(e,'parse_font_query'),'fixed fc-query parser missing')
        raw=b'Noto Sans CJK SC\nRegular\n2\nNotoSansCJKsc-Regular\n20-7e a0-ff 4e00-9fff\n'
        self.assertEqual(e.parse_font_query(raw,'Noto Sans CJK SC',2,'NotoSansCJKsc-Regular'),[[32,126],[160,255],[19968,40959]])
        for raw in (b'Noto Sans CJK JP\nRegular\n2\nNotoSansCJKsc-Regular\n20-7e\n',
                    b'Noto Sans CJK SC\nRegular\n0\nNotoSansCJKsc-Regular\n20-7e\n',
                    b'Noto Sans CJK SC\nRegular\n2\nNotoSansCJKsc-Regular\n7e-20\n',
                    b'Noto Sans CJK SC\nRegular\n2\nNotoSansCJKsc-Regular\n20-7e 7e-ff\n',
                    b'Noto Sans CJK SC\nRegular\n2\nNotoSansCJKsc-Regular\n110000\n',
                    b'Noto Sans CJK SC\nRegular\n2\nNotoSansCJKsc-Regular\n\n'):
            with self.subTest(raw=raw),self.assertRaises(e.BindingError):
                e.parse_font_query(raw,'Noto Sans CJK SC',2,'NotoSansCJKsc-Regular')
    def test_one_prewrite_budget_and_reserve(self):
        b=e.EvidenceBudget(self.root,cap=200,reserve=60)
        b.write('stderr.log',b'x'*140)
        with self.assertRaises(e.EvidenceError): b.write('stdout.json',b'x')
        self.assertEqual((self.root/'stderr.log').stat().st_size,140)
        b.terminal({'ok':False});self.assertLessEqual(b.audit(terminal=True),200)
    def test_no_unregistered_writer_names(self):
        b=self.budget()
        for name in ('../escape','tmp/cache','unknown.json','/absolute'):
            with self.subTest(name=name),self.assertRaises(e.EvidenceError): b.write(name,b'x')
    def test_unknown_file_even_below_limit(self):
        b=self.budget();(self.root/'rogue').write_bytes(b'one')
        with self.assertRaises(e.EvidenceError):b.audit()
    def test_unknown_empty_directory(self):
        b=self.budget();(self.root/'rogue').mkdir()
        with self.assertRaises(e.EvidenceError):b.audit()
    def test_symlink_rejected(self):
        b=self.budget();(self.root/'rogue').symlink_to('/tmp')
        with self.assertRaises(e.EvidenceError):b.audit()
    def test_mutation_rejected(self):
        b=self.budget();b.write('stderr.log',b'ab');(self.root/'stderr.log').write_bytes(b'cd')
        with self.assertRaises(e.EvidenceError):b.audit()
    def test_hardlink_rejected(self):
        b=self.budget();b.write('stderr.log',b'ab');os.link(self.root/'stderr.log',self.root/'other')
        with self.assertRaises(e.EvidenceError):b.audit()
    def test_failed_write_not_refunded(self):
        b=self.budget()
        with patch.object(os,'fsync',side_effect=OSError('synthetic fsync failure')):
            with self.assertRaises(e.EvidenceError):b.write('stderr.log',b'abc')
        self.assertEqual(b.pending,3)
        with self.assertRaises(e.EvidenceError):b.audit()
    def test_only_terminal_correction_after_terminal(self):
        b=self.budget();b.terminal({'status':'FAIL'})
        with self.assertRaises(e.EvidenceError):b.write('stderr.log',b'more')
        b.terminal({'status':'EVIDENCE_UNCERTAIN'});b.audit(terminal=True)
    def test_input_seal_detects_change(self):
        b=self.budget();seal=b.seal_input(b'{}');seal.verify()
        (self.root/'input-manifest.json').write_bytes(b'[]')
        with self.assertRaises(e.BindingError):seal.verify()
    def test_parser_rejects_duplicate_nan_infinity_overflow(self):
        for raw in (b'{"x":1,"x":2}',b'{"x":NaN}',b'{"x":Infinity}',b'{"x":1e999}',b'{}\n{}'):
            with self.subTest(raw=raw),self.assertRaises(e.EvidenceError):e.strict_json(raw)
    def test_missing_full_auditor_fails_closed(self):
        raw=e.canonical({'schema':'e45-eight-zone-result/v1','status':'PASS','completed':True,'cleanup_complete':True})
        with self.assertRaisesRegex(e.EvidenceError,'NOT_BOUND'):e.validate_result(raw,{},None)
    def test_full_auditor_is_called(self):
        raw=e.canonical({'schema':'e45-eight-zone-result/v1','status':'PASS','completed':True,'cleanup_complete':True})
        def reject(obj,binding):raise e.EvidenceError('missing actual required phase')
        with self.assertRaisesRegex(e.EvidenceError,'missing actual'):e.validate_result(raw,{},reject)
    def test_schema_missing_identity_and_incomplete_rejected(self):
        good={'schema':'e45-eight-zone-result/v1','status':'PASS','completed':True,'cleanup_complete':True,'id':'a'}
        for key,value in [('schema','old'),('id','b'),('completed',False),('cleanup_complete',0),('status','OK')]:
            with self.subTest(key=key),self.assertRaises(e.EvidenceError):
                e.validate_result(e.canonical({**good,key:value}),{'id':'a'},lambda *_:None)
    def test_result_one_mib_limit(self):
        with self.assertRaisesRegex(e.EvidenceError,'RESULT_SIZE'):
            e.validate_result(b' '*(e.MAX_RESULT+1),{},lambda *_:None)
    def test_tiny_success_has_three_samples_and_cleanup(self):
        r=self.run_tiny()
        self.assertEqual(r['status'],'PASS',r);self.assertTrue(r['cleanup_complete'])
        self.assertEqual(len(r['admission']),3);self.assertEqual(r['exit_code'],0)
        self.assertLess(r['validation_elapsed_seconds'],1.2)
        self.assertTrue(r['requires_supervisor_return'])
        self.assertEqual(set(p.name for p in self.root.iterdir()),{'tmp','home','cache','input-manifest.json',
                         'admission.json','resource-initial-raw.json','resource-decisions.jsonl','started.json','stdout.json','terminal.json'})
    def test_stdout_stderr_separate(self):
        # Invalid stdout still records every diagnostic byte, without combining it into JSON.
        r=self.run_tiny("import sys,time;time.sleep(.03);print('{}');sys.stderr.write('diagnostic\\n')")
        self.assertEqual((self.root/'stdout.json').read_bytes(),b'{}\n')
        self.assertEqual((self.root/'stderr.log').read_bytes(),b'diagnostic\n')
        self.assertNotEqual(r['status'],'PASS')
    def test_nonzero_cleanup(self):
        r=self.run_tiny('import time;time.sleep(.03);raise SystemExit(7)')
        self.assertEqual(r['reason'],'CHILD_EXIT_NONZERO',r)
        self.assertTrue(r['cleanup_complete'],r)
    def test_complete_failure_result_is_audited_without_success(self):
        raw={'schema':'e45-eight-zone-result/v1','status':'FAIL','completed':False,'cleanup_complete':True,
             'candidate_commit':'a'*40,'candidate_tree':'b'*40,
             'input_manifest_sha256':e.digest(b'{"synthetic":true}\n')}
        calls=[]
        program='import time;time.sleep(.03);print('+repr(json.dumps(raw))+');raise SystemExit(1)'
        r=self.run_tiny(program,full_validator=lambda *args:calls.append(args))
        self.assertEqual(len(calls),1)
        self.assertEqual(r['child_result_status'],'FAIL');self.assertFalse(r['completed'])
        self.assertEqual(r['reason'],'CHILD_EXIT_NONZERO');self.assertEqual(r['exit_code'],1)
    def test_no_result_fails(self):
        r=self.run_tiny('import time;time.sleep(.03)')
        self.assertEqual(r['reason'],'RESULT_INVALID');self.assertFalse(r['completed'])
    def test_timeout_cleanup(self):
        r=self.run_tiny('import time;time.sleep(5)',wall=.3)
        self.assertEqual(r['reason'],'WALL_LIMIT');self.assertTrue(r['cleanup_complete'])
        self.assertFalse(r['completed'])
    def test_admission_insufficient_no_spawn(self):
        r=self.run_tiny(sampler=lambda:{**self.sample(),'available':e.GIB})
        self.assertEqual(r['status'],'PRECHECK_REJECTED');self.assertIsNone(r['child_pid'])
    def test_stale_admission_no_spawn(self):
        r=self.run_tiny(sampler=lambda:{**self.sample(),'at':time.time()-5})
        self.assertIsNone(r['child_pid']);self.assertIn('stale',r['detail'])
    def test_fresh_prelaunch_resource_loss_cannot_spawn(self):
        count=[0]
        def sample():
            count[0]+=1;s=self.sample()
            if count[0]>3:s['oom']=[['synthetic',1,1]]
            return s
        r=self.run_tiny(sampler=sample)
        self.assertIsNone(r['child_pid']);self.assertFalse(r['completed'])
    def test_oom_change_stops_and_cleans(self):
        count=[0]
        def sample():
            count[0]+=1;s=self.sample()
            if count[0]>4:s['oom']=[['synthetic',1,1]]
            return s
        r=self.run_tiny('import time;time.sleep(2)',sampler=sample)
        self.assertEqual(r['reason'],'OOM_COUNTER_CHANGED');self.assertTrue(r['cleanup_complete'])
    def test_unknown_child_file_stops(self):
        r=self.run_tiny("import pathlib,time;pathlib.Path('tmp/rogue').write_text('x');time.sleep(.15)")
        self.assertNotEqual(r['status'],'PASS');self.assertFalse(r['completed']);self.assertTrue(r['cleanup_complete'])
    def test_oversize_stdout_stops_without_persisted_overshoot(self):
        r=self.run_tiny("import sys,time;time.sleep(.03);sys.stdout.write('x'*(2*1024**2));sys.stdout.flush();time.sleep(1)")
        self.assertNotEqual(r['status'],'PASS');self.assertTrue(r['cleanup_complete'])
        p=self.root/'stdout.json';self.assertLessEqual(p.stat().st_size if p.exists() else 0,e.MAX_RESULT)
    def test_finalization_overrun_is_not_pass(self):
        b=self.budget();original=b.terminal
        def delayed(receipt):time.sleep(.16);original(receipt)
        b.terminal=delayed
        r=self.run_tiny(budget=b,wall=.16)
        self.assertEqual(r['reason'],'WALL_LIMIT');self.assertFalse(r['completed']);self.assertEqual(r['exit_code'],1)

class NonzeroCleanupDiagnostics(unittest.TestCase):
    def test_failure_receipts_are_complete_and_success_is_quiet(self):
        # Stub only the process-running boundary; execute the real fixture and
        # unittest failure formatter without launching another resource sample.
        for reason,cleanup in (('RESOURCE_MEASUREMENT_FAILED',True),
                               ('CHILD_EXIT_NONZERO',False),
                               ('CHILD_EXIT_NONZERO',True)):
            with self.subTest(reason=reason,cleanup=cleanup):
                receipt={'schema':'e45-supervisor-terminal-draft/v1',
                         'status':'PRODUCT_FAILURE','reason':reason,'completed':False,
                         'exit_code':1,'child_pid':123,'child_exit_code':7,
                         'cleanup_complete':cleanup,
                         'measurement_error':'synthetic measurement detail',
                         'cleanup_errors':['synthetic cleanup detail'],
                         'identity':{'candidate_commit':'a'*40,'candidate_tree':'b'*40},
                         'nested_extra':{'values':[None,False,{'detail':'unfiltered receipt'}]}}
                output=io.StringIO()
                suite=unittest.TestSuite([E45Fixtures('test_nonzero_cleanup')])
                with patch.object(E45Fixtures,'run_tiny',return_value=receipt), \
                     contextlib.redirect_stdout(output),contextlib.redirect_stderr(output):
                    result=unittest.TextTestRunner(stream=output).run(suite)
                self.assertEqual(result.testsRun,1)
                self.assertEqual(result.errors,[])
                failed=reason!='CHILD_EXIT_NONZERO' or not cleanup
                self.assertEqual(len(result.failures),int(failed))
                if failed:self.assertIn(str(receipt),output.getvalue())
                else:
                    self.assertNotIn(str(receipt),output.getvalue())
                    self.assertNotIn('synthetic measurement detail',output.getvalue())
                    self.assertNotIn('synthetic cleanup detail',output.getvalue())

if __name__=='__main__':unittest.main(verbosity=2)
