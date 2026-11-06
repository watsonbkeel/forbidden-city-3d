#!/usr/bin/env python3
"""Bounded UI component verification for an exact CI event checkout."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import selectors
import shutil
import signal
import stat
import subprocess
import sys
import time

REPO = Path(__file__).resolve().parents[3]
OUT = None
SCRATCH = None
WORK_ROOT = None
INPUTS = None
RSS_THRESHOLD = 768 * 1024 * 1024
EVIDENCE_THRESHOLD = 128 * 1024 * 1024
METADATA_RESERVE = 4 * 1024 * 1024
FREE_MINIMUM = 512 * 1024 * 1024
TIMEOUT = 240
STOP_GRACE = 0.5
DRAIN_TIMEOUT = 2.0
FINAL_WAIT = 0.25
POLL_INTERVAL = 0.05
MAX_SAMPLES = 2048
MAX_SAMPLE_PIDS = 32
PAGE_SIZE = os.sysconf('SC_PAGE_SIZE')
ENV = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
COMMANDS = []


def git(*args):
    return subprocess.check_output(['git', '-C', str(REPO), *args], env=ENV, text=True).strip()


def snapshot():
    checked = subprocess.check_output([
        'node', str(Path(__file__).with_name('preflight.mjs')), '--recheck',
        '--inputs', str(INPUTS), '--work-root', str(WORK_ROOT),
    ], cwd=REPO, env=ENV, text=True, timeout=60)
    receipt = json.loads(checked)
    manifest = json.loads(INPUTS.read_text())
    files = []
    for row in manifest['files']:
        file = REPO / row['path']
        data = file.read_bytes()
        actual = hashlib.sha256(data).hexdigest()
        if actual != row['sha256'] or len(data) != row['bytes']:
            raise RuntimeError('Frozen input changed: ' + row['path'])
        files.append({'path': row['path'], 'sha256': actual})
    index = Path(git('rev-parse', '--git-path', 'index'))
    if not index.is_absolute():
        index = REPO / index
    result = {
        'head': git('rev-parse', 'HEAD'), 'tree': git('rev-parse', 'HEAD^{tree}'),
        'status': git('status', '--porcelain', '--untracked-files=all'),
        'files': files, 'indexSHA256': hashlib.sha256(index.read_bytes()).hexdigest(),
        'identity': receipt['identity'],
        'inputsSHA256': hashlib.sha256(INPUTS.read_bytes()).hexdigest(),
        'toolchainSHA256': hashlib.sha256((OUT / 'toolchain.json').read_bytes()).hexdigest(),
    }
    if result['head'] != receipt['identity']['eventSha'] or result['status']:
        raise RuntimeError('Candidate identity/cleanliness changed')
    return result


def proc_stat(pid):
    try:
        data = Path(f'/proc/{pid}/stat').read_text()
        fields = data[data.rfind(')') + 2:].split()
        return {'pid': int(pid), 'state': fields[0], 'ppid': int(fields[1]),
                'pgrp': int(fields[2]), 'session': int(fields[3]),
                'starttime': int(fields[19]), 'rssBytes': int(fields[21]) * PAGE_SIZE}
    except (OSError, ValueError, IndexError):
        return None


def members(root_pid, identities, blocked=None, conflicts=None):
    # Only a previously verified identity or a direct chain from one is owned.
    # pgrp/session numbers alone never establish ownership, even for root_pid.
    blocked = set() if blocked is None else blocked
    conflicts = [] if conflicts is None else conflicts
    rows = [q for p in Path('/proc').iterdir() if p.name.isdigit() and (q := proc_stat(p.name))]
    for q in rows:
        pid = q['pid']
        if pid in identities and q['starttime'] != identities[pid] and pid not in blocked:
            blocked.add(pid)
            conflicts.append({'pid': pid, 'expectedStarttime': identities[pid], 'observedStarttime': q['starttime']})
    own = {q['pid']: q for q in rows if q['pid'] not in blocked and
           q['pid'] in identities and identities[q['pid']] == q['starttime']}
    while True:
        new = [q for q in rows if q['pid'] not in identities and q['pid'] not in blocked and
               q['ppid'] in own and q['starttime'] >= own[q['ppid']]['starttime']]
        if not new:
            break
        for q in new:
            # Once registered, an identity is immutable for the entire run.
            identities.setdefault(q['pid'], q['starttime'])
            own[q['pid']] = q
    return list(own.values())


def evidence_size():
    total = 0
    seen = set()
    for root in (OUT, SCRATCH):
        if root is None or not root.exists():
            continue
        for directory, folders, files in os.walk(root, followlinks=False):
            folders[:] = [name for name in folders
                          if not (Path(directory) / name).is_symlink()]
            for name in files:
                try:
                    info = (Path(directory) / name).lstat()
                    key = (info.st_dev, info.st_ino)
                    if stat.S_ISREG(info.st_mode) and key not in seen:
                        total += info.st_size
                        seen.add(key)
                except FileNotFoundError:
                    pass
    return total


def checked_signal(row, sig, events):
    # A pidfd binds the signal to the inspected process, eliminating the
    # proc-check/os.kill PID-reuse race. Missing pidfd support fails closed.
    event = {'pid': row['pid'], 'starttime': row['starttime'], 'signal': sig}
    now = proc_stat(row['pid'])
    if not now or now['starttime'] != row['starttime']:
        events.append({**event, 'outcome': 'not-sent-identity-mismatch-or-exited'})
        return False
    fd = None
    try:
        fd = os.pidfd_open(row['pid'])
        current = proc_stat(row['pid'])
        if not current or current['starttime'] != row['starttime']:
            events.append({**event, 'outcome': 'not-sent-identity-changed-after-pidfd-open'})
            return False
        signal.pidfd_send_signal(fd, sig)
        events.append({**event, 'outcome': 'sent'})
        return True
    except ProcessLookupError:
        events.append({**event, 'outcome': 'not-sent-already-exited'})
    except (OSError, AttributeError) as exc:
        events.append({**event, 'outcome': 'not-sent-signal-error', 'error': str(exc)})
    finally:
        if fd is not None:
            os.close(fd)
    return False


def signal_owned(rows, sig, attempted, events):
    for row in rows:
        key = (row['pid'], row['starttime'], sig)
        if row['state'] != 'Z' and key not in attempted:
            attempted.add(key)
            checked_signal(row, sig, events)


def append_log(log, chunk, result):
    # Bound this writer using the last aggregate-size observation. Test-created
    # artifacts may grow between observations, so this is not a hard total cap.
    remaining = max(0, EVIDENCE_THRESHOLD - METADATA_RESERVE - evidence_size())
    keep = min(len(chunk), remaining)
    if keep:
        log.write(chunk[:keep])
    result['discardedLogBytes'] += len(chunk) - keep
    if keep < len(chunk):
        result['logComplete'] = False
        return False
    return True


def run_one(command):
    name = command['name']
    if shutil.disk_usage(REPO).free < FREE_MINIMUM:
        raise RuntimeError('Less than 512 MiB free before ' + name)
    if shutil.disk_usage('/tmp').free < 64 * 1024 * 1024:
        raise RuntimeError('Less than64 MiB free in /tmp before ' + name)
    if not hasattr(os, 'pidfd_open') or not hasattr(signal, 'pidfd_send_signal'):
        raise RuntimeError('Safe pidfd signaling unavailable; no fixture launched')
    before = snapshot()
    folder = OUT / name
    folder.mkdir()
    (folder / 'evidence').mkdir()
    (folder / 'source-before.json').write_text(json.dumps(before, indent=2) + '\n')
    argv = [shutil.which(command['command']), *command['args']]
    overrides = {key: (str(folder / 'evidence') if value == '$COMMAND_EVIDENCE_DIR' else value)
                 for key, value in command.get('env', {}).items()}
    env = dict(ENV, **overrides)
    started = time.monotonic()
    result = {'name': name, 'identity': before.get('identity'), 'argv': argv, 'cwd': str(REPO), 'commandEnv': overrides,
              'timeoutSeconds': TIMEOUT, 'rssPollingThresholdBytes': RSS_THRESHOLD,
              'evidencePollingThresholdBytes': EVIDENCE_THRESHOLD,
              'limitsAreHardCaps': False,
              'thresholdCaveat': 'Polling thresholds only; transient RSS and artifact-size overshoot are possible. No cgroup hard limit is claimed.',
              'stopGraceSeconds': STOP_GRACE, 'drainTimeoutSeconds': DRAIN_TIMEOUT, 'finalWaitSeconds': FINAL_WAIT,
              'diskFreeBefore': shutil.disk_usage(REPO).free, 'startedAtUTC': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
              'peakTreeRSSBytes': 0, 'samples': [], 'samplesOmitted': 0, 'signals': [],
              'identityConflicts': [], 'logComplete': True, 'discardedLogBytes': 0,
              'stopReason': None, 'hardDrainDeadlineReached': False, 'returncode': None}
    child = subprocess.Popen(argv, cwd=REPO, env=env, stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT, start_new_session=True)
    first = proc_stat(child.pid)
    result['rootIdentity'] = first
    identities = {child.pid: first['starttime']} if first else {}
    blocked, attempted = set(), set()
    selector = selectors.DefaultSelector()
    os.set_blocking(child.stdout.fileno(), False)
    selector.register(child.stdout, selectors.EVENT_READ)
    stop_started = None
    root_exit_at = None
    try:
        with (folder / 'full.log').open('wb', buffering=0) as log:
            while True:
                now = time.monotonic()
                rows = members(child.pid, identities, blocked, result['identityConflicts'])
                active = [q for q in rows if q['state'] != 'Z']
                rss = sum(q['rssBytes'] for q in rows)
                if rss > result['peakTreeRSSBytes']:
                    result['peakTreeRSSBytes'] = rss
                    result['peakProcesses'] = rows
                if len(result['samples']) < MAX_SAMPLES:
                    result['samples'].append({'seconds': round(now - started, 3), 'treeRSSBytes': rss,
                                              'pids': [q['pid'] for q in rows[:MAX_SAMPLE_PIDS]], 'processCount': len(rows)})
                else:
                    result['samplesOmitted'] += 1
                code = child.poll()
                if code is not None and root_exit_at is None:
                    root_exit_at = now
                reasons = []
                if first is None:
                    reasons.append('root identity could not be established')
                if result['identityConflicts']:
                    reasons.append('PID/starttime identity conflict; mismatched PIDs excluded')
                if rss >= RSS_THRESHOLD:
                    reasons.append('sampled process-tree RSS reached 768 MiB polling threshold')
                if now - started >= TIMEOUT:
                    reasons.append('240-second command deadline reached')
                if evidence_size() >= EVIDENCE_THRESHOLD - METADATA_RESERVE:
                    reasons.append('sampled evidence size reached safety reserve')
                if shutil.disk_usage(REPO).free < FREE_MINIMUM:
                    reasons.append('free disk fell below 512 MiB')
                if shutil.disk_usage('/tmp').free < 48 * 1024 * 1024:
                    reasons.append('/tmp free disk fell below48 MiB')
                if code is not None and code != 0:
                    reasons.append('command root exited unsuccessfully')
                if code is not None and active:
                    reasons.append('command root exited while verified descendants remain')
                if result['discardedLogBytes']:
                    reasons.append('log writer budget exhausted')
                if reasons and stop_started is None:
                    result['stopReason'] = '; '.join(reasons)
                    stop_started = now
                if stop_started is not None:
                    sig = signal.SIGTERM if now - stop_started < STOP_GRACE else signal.SIGKILL
                    signal_owned(rows, sig, attempted, result['signals'])
                    if now >= stop_started + STOP_GRACE + DRAIN_TIMEOUT:
                        result['hardDrainDeadlineReached'] = True
                        result['logComplete'] = result['logComplete'] and not selector.get_map()
                        break  # Never wait indefinitely for inherited stdout EOF.
                elif root_exit_at is not None and now >= root_exit_at + DRAIN_TIMEOUT:
                    result['stopReason'] = 'stdout did not close within post-exit drain deadline'
                    result['hardDrainDeadlineReached'] = True
                    result['logComplete'] = False
                    break
                for key, _ in selector.select(timeout=POLL_INTERVAL):
                    try:
                        chunk = os.read(key.fileobj.fileno(), 65536)
                    except BlockingIOError:
                        continue
                    if chunk:
                        if not append_log(log, chunk, result) and stop_started is None:
                            result['stopReason'] = 'log writer budget exhausted'
                            stop_started = time.monotonic()
                    else:
                        selector.unregister(key.fileobj)
                if child.poll() is not None and not selector.get_map() and not active:
                    break
    except BaseException as exc:
        result['stopReason'] = f'monitor exception: {type(exc).__name__}: {exc}'
        result['logComplete'] = False
    finally:
        # A final cleanup attempt is identity-bound and nonblocking. It also
        # catches descendants discovered after the first termination signal.
        rows = members(child.pid, identities, blocked, result['identityConflicts'])
        if result['stopReason'] or any(q['state'] != 'Z' for q in rows):
            signal_owned(rows, signal.SIGKILL, attempted, result['signals'])
        selector.close()
        child.stdout.close()
        try:
            result['returncode'] = child.wait(timeout=FINAL_WAIT)
            result['rootReaped'] = True
        except subprocess.TimeoutExpired:
            result['returncode'] = None
            result['rootReaped'] = False
            result['stopReason'] = result['stopReason'] or 'root did not exit within final bounded wait'
        result['durationSeconds'] = round(time.monotonic() - started, 3)
        result['diskFreeAfter'] = shutil.disk_usage(REPO).free
        try:
            result['sourceAfter'] = snapshot()
            result['sourceUnchanged'] = result['sourceAfter'] == before
        except BaseException as exc:
            result['sourceAfterError'] = f'{type(exc).__name__}: {exc}'
            result['sourceUnchanged'] = False
            result['stopReason'] = result['stopReason'] or 'frozen source postcheck failed'
        final_rows = members(child.pid, identities, blocked, result['identityConflicts'])
        result['finalOwnedProcessStates'] = final_rows
        result['remainingOwnedProcesses'] = [q for q in final_rows if q['state'] != 'Z']
        result['blockedPIDs'] = sorted(blocked)
        result['rootFinalObservedState'] = proc_stat(child.pid)
        # Group/session resemblance is diagnostic only, never signal authority.
        result['unattributedSessionProcesses'] = [q for p in Path('/proc').iterdir() if p.name.isdigit()
            and (q := proc_stat(p.name)) and q['pgrp'] == child.pid and q['session'] == child.pid
            and (q['pid'] in blocked or identities.get(q['pid']) != q['starttime'])]
        result['passed'] = (result['returncode'] == 0 and result['rootReaped'] and not result['stopReason']
                            and result['sourceUnchanged'] and result['logComplete']
                            and not result['remainingOwnedProcesses'] and not result['unattributedSessionProcesses'])
        (folder / 'monitor.json').write_text(json.dumps(result, indent=2) + '\n')
        (folder / 'exit.txt').write_text(str(result['returncode']) + '\n')
    return {k: result[k] for k in ('name', 'passed', 'returncode', 'stopReason', 'durationSeconds', 'peakTreeRSSBytes', 'sourceUnchanged', 'logComplete')}



def main():
    global REPO, OUT, SCRATCH, WORK_ROOT, INPUTS, COMMANDS, ENV
    parser = argparse.ArgumentParser(description='Run bounded UI verification on the exact CI event checkout.')
    parser.add_argument('--inputs', required=True)
    parser.add_argument('--work-root', required=True)
    args = parser.parse_args()
    INPUTS = Path(args.inputs)
    if not INPUTS.is_absolute():
        INPUTS = REPO / INPUTS
    WORK_ROOT = Path(args.work_root)
    if not WORK_ROOT.is_absolute() or WORK_ROOT.is_symlink():
        raise SystemExit('An absolute same-run work root is required.')
    OUT = WORK_ROOT / 'receipts'
    SCRATCH = WORK_ROOT / 'scratch'
    ENV = dict(os.environ, GIT_OPTIONAL_LOCKS='0', PYTHONDONTWRITEBYTECODE='1',
               BILINGUAL_UI_WORK_ROOT=str(WORK_ROOT), BILINGUAL_UI_INPUTS=str(INPUTS),
               BILINGUAL_UI_SCRATCH_DIR=str(SCRATCH))
    COMMANDS = [{'name': 'ui-components', 'command': 'node',
                 'args': [str(Path(__file__).with_name('browser-qa.mjs'))],
                 'env': {'BILINGUAL_UI_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR',
                         'TMPDIR': str(SCRATCH)}}]
    before = snapshot()
    if (REPO / 'dist').exists():
        raise SystemExit('Preexisting dist is not a UI verification input.')
    SCRATCH.mkdir()
    summary_path = OUT / 'ui-summary.json'
    with summary_path.open('x') as file:
        json.dump({'identity': before['identity'], 'runs': [], 'status': 'starting'}, file)
    summary = {'identity': before['identity'], 'head': before['head'],
               'tree': before['tree'], 'runs': [], 'status': 'running'}
    try:
        for command in COMMANDS:
            result = run_one(command)
            summary['runs'].append(result)
            if not result['passed']:
                summary['status'] = 'stopped-on-first-failure'
                break
        else:
            summary['status'] = 'passed'
    except BaseException as exc:
        summary['status'] = 'blocked-or-monitor-error'
        summary['error'] = f'{type(exc).__name__}: {exc}'
    summary['passed'] = summary['status'] == 'passed'
    summary['evidenceBytes'] = evidence_size()
    summary_path.write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps(summary, indent=2))
    return 0 if summary['status'] == 'passed' else 1


if __name__ == '__main__':
    sys.exit(main())
