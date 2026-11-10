#!/usr/bin/env python3
"""No child workloads; miniature admissions and fixed selector controls."""
import importlib.util
from pathlib import Path
import unittest
import subprocess
import os
import tempfile
import sys
from unittest.mock import patch

MODULE = Path(__file__).with_name('r265_dafotang_runtime_bound.py')

class Controls(unittest.TestCase):
    def setUp(self):
        self.assertTrue(MODULE.is_file(), 'fixed runtime selector must exist')
        spec = importlib.util.spec_from_file_location('r265_runtime', MODULE)
        self.m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.m)

    def fixture(self):
        m = self.m
        return dict(env={'CI':'true','GITHUB_ACTIONS':'true','GITHUB_REPOSITORY':m.REPO,
                         'GITHUB_EVENT_NAME':'push','GITHUB_REF':m.REF,'GITHUB_SHA':'a'*40,
                         'NPM_CONFIG_USERCONFIG':'/dev/null','RUNNER_TEMP':'/tmp/r265-test-runner',
                         'NPM_CONFIG_GLOBALCONFIG':'/tmp/r265-test-runner/r265-empty-global.npmrc'},
                    head='a'*40, parent=m.P, parent_tree=m.P_TREE,
                    grandparent=m.P_PARENT, grandparent_tree=m.P_PARENT_TREE, diff=m.PATHS,
                    clean=True, pins_ok=True)

    def test_exact_extended_path_admission(self):
        self.assertEqual(len(self.m.PATHS),13)
        self.assertEqual(sum(status == 'A' for status,_ in self.m.PATHS),11)
        self.assertEqual([p for status,p in self.m.PATHS if status == 'M'], [
            'tests/r265-dafotang-frieze/compatibility.test.mjs',
            'tests/r265-dafotang-frieze/snapshot-view.mjs'])

    def test_source_pins_distinguish_parent_and_candidate(self):
        digest=self.m.hashlib.sha256(b'P content').hexdigest()
        for path in ('tests/r265-dafotang-frieze/compatibility.test.mjs',
                     'tests/r265-dafotang-frieze/snapshot-view.mjs'):
            self.assertTrue(self.m.source_matches(path,digest,lambda _p:b'P content',lambda _p:'candidate'))
            self.assertFalse(self.m.source_matches(path,digest,lambda _p:b'wrong',lambda _p:digest))
        self.assertTrue(self.m.source_matches('src/example.js',digest,lambda _p:b'wrong',lambda _p:digest))
        self.assertFalse(self.m.source_matches('src/example.js',digest,lambda _p:b'P content',lambda _p:'changed'))

    def test_workflow_is_fixed_ordered_and_no_deploy(self):
        workflow=MODULE.parents[1]/'workflows'/'r265-dafotang-runtime-validation.yml'
        self.assertTrue(workflow.is_file(), 'no-deploy workflow must exist')
        text=workflow.read_text()
        for token in ('dev/r265-dafotang-runtime-receipt-fix','persist-credentials: false',
                      '11bd71901bbe5b1630ceea73d27597364c9af683',
                      '49933ea5288caeca8642d1e84afbd3f7d6820020',
                      'ea165f8d65b6e75b540449e92b4886f43607fa02',
                      'cancel-in-progress: false','fetch-depth: 3'):
            self.assertIn(token,text)
        self.assertIn('Verify retained test counts and no skips',text)
        self.assertIn('Verify new control counts and no skips',text)
        self.assertIn("('host-controls',35)",text)
        self.assertNotIn('dev/r265-dafotang-runtime-validation',text)
        self.assertIn("NPM_CONFIG_USERCONFIG: '/dev/null'",text)
        self.assertIn('NPM_CONFIG_GLOBALCONFIG=%s',text)
        self.assertIn('set -C',text)
        self.assertIn('Recheck npm configuration before build',text)
        self.assertIn('checkout-identity.txt"',text)
        self.assertIn('2>&1 | tee "$EVIDENCE_DIR/host-admission.log"',text)
        self.assertIn('2>&1 | tee "$EVIDENCE_DIR/visual-admission.log"',text)
        self.assertNotIn('deploy-pages',text)
        self.assertNotIn('workflow_dispatch:',text)
        host=text.index('r265_dafotang_runtime_bound.py host')
        build=text.index('python3 .github/scripts/r177_build_bound.py')
        visual=text.index('r265_dafotang_runtime_bound.py visual')
        self.assertLess(host,text.index('Recheck npm configuration before build'));self.assertLess(text.index('Recheck npm configuration before build'),build);self.assertLess(build,visual)

    def test_npm_config_overrides_and_selectors_fail_closed(self):
        env=self.fixture()['env']; self.m.check_npm_environment(env)
        for key in ('npm_config_node_options','NPM_CONFIG_NODE_OPTIONS','NpM_cOnFiG_NoDe_OpTiOnS',
                    'npm_config_node-options','npm_config_script_shell','NPM_CONFIG_SCRIPT_SHELL',
                    'npm_config_script-shell','npm_config_prefix','PREFIX','DESTDIR'):
            altered=dict(env); altered[key]='inert';
            with self.subTest(key=key), self.assertRaises(ValueError): self.m.check_npm_environment(altered)
        for key in ('npm_config_userconfig','npm_config_globalconfig'):
            altered=dict(env); altered[key]='/tmp/other-npmrc'
            with self.subTest(key=key), self.assertRaises(ValueError): self.m.check_npm_environment(altered)
        duplicate=dict(env);duplicate['NPM_CONFIG_GLOBALCONFIG']='/dev/null'
        with self.assertRaises(ValueError): self.m.check_npm_environment(duplicate)
        wrong=dict(env);wrong['NPM_CONFIG_GLOBALCONFIG']='/tmp/wrong'
        with self.assertRaises(ValueError): self.m.check_npm_environment(wrong)
        for key in ('NPM_CONFIG_USERCONFIG','NPM_CONFIG_GLOBALCONFIG'):
            altered=dict(env); altered.pop(key)
            with self.subTest(missing=key), self.assertRaises(ValueError): self.m.check_npm_environment(altered)
        self.m.check_npm_environment({**env,'npm_config_audit':'false','npm_config_fund':'false'})

    def test_fixed_npm_file_requires_empty_regular_non_symlink(self):
        root=Path(tempfile.mkdtemp(prefix='r265-npm-controls-'))
        good=root/'empty';good.write_bytes(b'');self.m.check_fixed_npm_file(good)
        nonempty=root/'nonempty';nonempty.write_bytes(b'node-options=bad');
        with self.assertRaises(ValueError): self.m.check_fixed_npm_file(nonempty)
        link=root/'symlink';os.symlink(good,link)
        with self.assertRaises((ValueError,OSError)): self.m.check_fixed_npm_file(link)
        with self.assertRaises((ValueError,OSError)): self.m.check_fixed_npm_file(root/'missing')

    def test_project_npmrc_is_forbidden_even_if_symlink(self):
        self.m.check_project_config(False,False)
        with self.assertRaises(ValueError): self.m.check_project_config(True,False)
        with self.assertRaises(ValueError): self.m.check_project_config(False,True)

    def test_fixed_selectors(self):
        self.assertEqual(self.m.select('host'), ['node','tests/r265-dafotang-runtime/host-run.mjs'])
        self.assertEqual(self.m.select('visual'), ['node','tests/r265-dafotang-runtime/visual.mjs'])
        for bad in ('', 'build', 'host;true', '../visual'):
            with self.assertRaises(ValueError): self.m.select(bad)

    def test_valid_identity(self):
        self.m.admit(**self.fixture())

    def test_reject_wrong_event_identity(self):
        for key, value in [('CI','false'),('GITHUB_ACTIONS','false'),('GITHUB_REPOSITORY','other/repo'),
                           ('GITHUB_EVENT_NAME','workflow_dispatch'),('GITHUB_REF','refs/heads/main'),
                           ('GITHUB_SHA','b'*40),('GITHUB_REF','refs/heads/dev/r265-dafotang-runtime-validation')]:
            f=self.fixture(); f['env'][key]=value
            with self.subTest(key=key), self.assertRaises(ValueError): self.m.admit(**f)

    def test_reject_wrong_git_identity(self):
        for key,value in [('parent','f'*40),('parent_tree','e'*40),('grandparent','d'*40),('grandparent_tree','c'*40),
                          ('diff', self.m.PATHS[:-1]),('diff',self.m.PATHS+[('M','x')]),
                          ('clean',False),('pins_ok',False)]:
            f=self.fixture(); f[key]=value
            with self.subTest(key=key,value=value), self.assertRaises(ValueError): self.m.admit(**f)

    def test_reject_inherited_overrides(self):
        for key in ('NODE_OPTIONS','NODE_PATH','PYTHONOPTIMIZE','PYTHONPATH','R265_REPO','R265_BASELINE',
                    'R262_REPO_ROOT','R262_DISABLE_EXIT_RECHECK','R264_DRIVER_MODULE','NODE_V8_COVERAGE','TEST_GC','GIT_DIR','GIT_WORK_TREE','GIT_CONFIG_COUNT'):
            f=self.fixture(); f['env'][key]='x'
            with self.subTest(key=key), self.assertRaises(ValueError): self.m.admit(**f)

    def test_preflight_checks_identity_without_workload(self):
        f=self.fixture()
        results=iter([f['head'],f['parent'],f['grandparent'],f['parent_tree'],f['grandparent_tree'],
                      '\n'.join('\t'.join(row) for row in f['diff']),''])
        with patch.dict(self.m.os.environ,f['env'],clear=True), \
             patch.object(self.m,'git',side_effect=lambda *a:next(results)), \
             patch.object(self.m,'verify_pins',return_value=True), \
             patch.object(self.m,'check_fixed_npm_file'), \
             patch.object(self.m.subprocess,'check_output',side_effect=AssertionError('unexpected workload')):
            self.assertEqual(self.m.validate_checkout(), f['head'])

    def test_override_is_rejected_before_git_or_child(self):
        with patch.object(self.m.sys, 'argv', ['runner', 'host']), \
             patch.dict(self.m.os.environ, {'NODE_OPTIONS':'--require=bad'}, clear=True), \
             patch.object(self.m, 'git', side_effect=AssertionError('git was called')):
            with self.assertRaises(ValueError): self.m.main()

    def test_real_optimized_python_stops_before_git(self):
        code = "import importlib.util,sys; p=sys.argv[1]; s=importlib.util.spec_from_file_location('r',p); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); m.git=lambda *x: (_ for _ in ()).throw(RuntimeError('GIT_CALLED')); m.validate_checkout()"
        env=self.fixture()['env'];env['PYTHONDONTWRITEBYTECODE']='1'
        result=subprocess.run([sys.executable,'-O','-c',code,str(MODULE)],capture_output=True,text=True,env=env,timeout=10)
        self.assertNotEqual(result.returncode,0);self.assertIn('optimization override',result.stderr);self.assertNotIn('GIT_CALLED',result.stderr)

    def test_npm_override_is_rejected_before_git_or_child(self):
        f=self.fixture(); f['env']['NpM_cOnFiG_NoDe_OpTiOnS']='inert'
        with patch.object(self.m.sys, 'argv', ['runner','host']), \
             patch.dict(self.m.os.environ,f['env'],clear=True), \
             patch.object(self.m,'git',side_effect=AssertionError('git was called')):
            with self.assertRaises(ValueError): self.m.main()

    def test_reject_optimization_flag(self):
        f=self.fixture(); f['optimized']=True
        with self.assertRaises(ValueError): self.m.admit(**f)

if __name__ == '__main__': unittest.main(verbosity=2)
