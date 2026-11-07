#!/usr/bin/env python3
"""Bounded exact single-host verification for an exact CI event checkout."""
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
from memory_budget import MemoryWatch, POLICY

REPO = Path(__file__).resolve().parents[3]
OUT = None
SCRATCH = None
WORK_ROOT = None
INPUTS = None
RSS_THRESHOLD = POLICY['rssThresholdBytes']
EVIDENCE_THRESHOLD = 32 * 1024 * 1024
METADATA_RESERVE = 4 * 1024 * 1024
FREE_MINIMUM = 512 * 1024 * 1024
TIMEOUT = 90
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
        'node', '--max-old-space-size=128', str(Path(__file__).with_name('preflight.mjs')), '--mode', 'recheck',
        '--inputs', str(INPUTS), '--work-root', str(WORK_ROOT),
    ], cwd=REPO, env=ENV, text=True, timeout=60)
    return json.loads(checked)


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


def budget_usage():
    tool = metadata = 0
    seen = set()
    for directory, folders, files in os.walk(WORK_ROOT, followlinks=False):
        for name in folders:
            if (Path(directory) / name).is_symlink(): raise RuntimeError('Evidence directory alias')
        for name in files:
            p = Path(directory) / name; q = p.lstat()
            if not stat.S_ISREG(q.st_mode) or q.st_nlink != 1: raise RuntimeError('Nonregular or aliased evidence')
            key = (q.st_dev, q.st_ino)
            if key in seen: raise RuntimeError('Duplicate evidence inode')
            seen.add(key)
            if p.is_relative_to(WORK_ROOT / 'tool'): tool += q.st_size
            else: metadata += q.st_size
    return {'tool': tool, 'metadata': metadata, 'total': tool + metadata}


def evidence_size():
    used = budget_usage()
    if used['tool'] > 28 * 1024 ** 2 or used['metadata'] > METADATA_RESERVE:
        return EVIDENCE_THRESHOLD
    return used['total']


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
    used = budget_usage()
    remaining = max(0, min(512 * 1024 - log.tell(), METADATA_RESERVE - used['metadata'],
                           EVIDENCE_THRESHOLD - used['total']))
    keep = min(len(chunk), remaining)
    if keep: log.write(chunk[:keep])
    result['discardedLogBytes'] += len(chunk) - keep
    if keep < len(chunk):
        result['logComplete'] = False
        return False
    return True


ROLE_LIMITS = {'maxProcesses': 64, 'maxReadBytes': 32768, 'maxPathBytes': 4096,
               'maxCmdlineBytes': 4096, 'maxStatBytes': 4096, 'maxSeconds': .05}


class RoleBudgetExhausted(Exception):
    pass


class RoleReader:
    def __init__(self, node_executable, clock=time.monotonic, started=None):
        self.node_executable = node_executable
        self.read_bytes = 0
        self.clock = clock
        self.started = clock() if started is None else started
    def check(self, reserve=0):
        # Checked between reads and after return, not a kernel syscall deadline.
        if not 0 <= self.clock()-self.started <= ROLE_LIMITS['maxSeconds'] or self.read_bytes+reserve > ROLE_LIMITS['maxReadBytes']:
            raise RoleBudgetExhausted()
    def read_file(self, name, maximum):
        self.check(maximum+1)
        before=os.lstat(name)
        if not stat.S_ISREG(before.st_mode): raise ValueError('Nonregular role source')
        fd=os.open(name, os.O_RDONLY | os.O_NONBLOCK | os.O_NOFOLLOW)
        try:
            opened=os.fstat(fd)
            if not stat.S_ISREG(opened.st_mode) or (opened.st_dev,opened.st_ino)!=(before.st_dev,before.st_ino):
                raise ValueError('Role source changed')
            chunks=[];length=0
            while True:
                self.check(maximum+1-length)
                chunk=os.read(fd,maximum+1-length);self.read_bytes+=len(chunk)
                self.check()
                if not chunk: break
                chunks.append(chunk);length+=len(chunk)
                if length>maximum: raise ValueError('Oversized role source')
            return b''.join(chunks)
        finally:
            os.close(fd)
    def identity(self,pid):
        try:
            raw=self.read_file(f'/proc/{pid}/stat',ROLE_LIMITS['maxStatBytes']).decode('utf8')
            fields=raw[raw.rfind(')')+2:].split()
            return {'starttime':int(fields[19])}
        except (OSError,ValueError,IndexError,UnicodeError):
            return None
    def read(self,pid,root_pid):
        self.check(ROLE_LIMITS['maxPathBytes'])
        executable=os.readlink(f'/proc/{pid}/exe')
        size=len(os.fsencode(executable));self.read_bytes+=size
        self.check()
        if size>ROLE_LIMITS['maxPathBytes']: raise ValueError('Oversized executable name')
        if executable==self.node_executable:
            return 'node','host-controller' if pid==root_pid else 'node-auxiliary'
        if executable==str(REPO/'node_modules/@esbuild/linux-x64/bin/esbuild'):
            return 'esbuild','esbuild'
        if executable!='/opt/google/chrome/chrome': return 'unknown','unknown'
        raw=self.read_file(f'/proc/{pid}/cmdline',ROLE_LIMITS['maxCmdlineBytes'])
        if not raw.endswith(b'\0'): raise ValueError('Incomplete role source')
        values=raw.split(b'\0')
        if b'--type' in values: return 'chrome','unknown'
        types=[value[7:] for value in values if value.startswith(b'--type=')]
        if not types: return 'chrome','browser'
        allowed={b'zygote':'zygote',b'renderer':'renderer',b'gpu-process':'gpu',b'utility':'utility'}
        return 'chrome',allowed.get(types[0],'unknown') if len(types)==1 else 'unknown'


def capture_process_roles(rows,root_pid,node_executable,seconds,skip=False,reader=None,clock=time.monotonic):
    out={'schema':1,'triggerSeconds':seconds,'triggerRSSBytes':sum(r['rssBytes'] for r in rows),
         'thresholdBytes':RSS_THRESHOLD*3//4,'limits':dict(ROLE_LIMITS),
         'status':'skipped-stop' if skip else 'partial','complete':False,
         'observedProcessCount':len(rows),'truncatedCount':0,'skippedCount':0,
         'readBytes':0,'elapsedSeconds':0,'rows':[]}
    if skip:
        out['skippedCount']=len(rows)
        return out
    started=clock();reader=reader or RoleReader(node_executable,clock,started)
    for row in rows[:ROLE_LIMITS['maxProcesses']]:
        item={key:row[key] for key in ['pid','starttime','rssBytes']}
        item.update(executableKind='unknown',role='unknown',status='budget-exhausted')
        try:
            if not 0 <= clock()-started <= ROLE_LIMITS['maxSeconds']: raise RoleBudgetExhausted()
            before=reader.identity(row['pid'])
            if before is None: item['status']='exited-or-unreadable'
            elif before['starttime']!=row['starttime']: item['status']='identity-changed'
            else:
                kind,role=reader.read(row['pid'],root_pid)
                after=reader.identity(row['pid'])
                if after is None: item['status']='exited-or-unreadable'
                elif after['starttime']!=row['starttime']: item['status']='identity-changed'
                elif not 0 <= clock()-started <= ROLE_LIMITS['maxSeconds']: item['status']='budget-exhausted'
                else: item.update(executableKind=kind,role=role,status='observed')
        except RoleBudgetExhausted: pass
        except (OSError,ValueError,UnicodeError): item['status']='read-unavailable'
        out['rows'].append(item)
    out['readBytes']=reader.read_bytes
    out['elapsedSeconds']=max(0,clock()-started)
    out['truncatedCount']=max(0,len(rows)-len(out['rows']))
    out['skippedCount']=sum(r['status']!='observed' for r in out['rows'])+out['truncatedCount']
    out['complete']=out['skippedCount']==0
    out['status']='captured' if out['complete'] else 'partial'
    return out


def run_one(command, before):
    name = command['name']
    if shutil.disk_usage(REPO).free < FREE_MINIMUM:
        raise RuntimeError('Less than 512 MiB free before ' + name)
    if shutil.disk_usage('/tmp').free < 64 * 1024 * 1024:
        raise RuntimeError('Less than64 MiB free in /tmp before ' + name)
    if not hasattr(os, 'pidfd_open') or not hasattr(signal, 'pidfd_send_signal'):
        raise RuntimeError('Safe pidfd signaling unavailable; no fixture launched')
    folder = OUT
    if (WORK_ROOT / 'tool').exists(): raise RuntimeError('Host tool output must not exist')
    publish_json('source-before.json', before, 512 * 1024)
    argv = [shutil.which(command['command']), *command['args']]
    overrides = {key: (str(WORK_ROOT / 'tool') if value == '$COMMAND_EVIDENCE_DIR' else value)
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
              'stopReason': None, 'hardDrainDeadlineReached': False, 'returncode': None, 'processRoles': None}
    memory = MemoryWatch()
    result['rootLaunched'] = False
    admission_called = time.monotonic()
    admission_returned = None
    finish_called = None
    finish_returned = None
    try:
        memory.admit()
        admission_returned = time.monotonic()
    except BaseException as exc:
        result.update(passed=False, rootReaped=False, sourceUnchanged=False,
                      durationSeconds=round(time.monotonic() - started, 3),
                      stopReason=f'memory admission blocked: {type(exc).__name__}: {exc}',
                      memory=memory.report(), remainingOwnedProcesses=[], unattributedSessionProcesses=[])
        (folder / 'full.log').write_text(result['stopReason'] + '\n')
        publish_json('monitor.json', result, 768 * 1024)
        return {k: result[k] for k in ('name', 'passed', 'returncode', 'stopReason', 'durationSeconds', 'peakTreeRSSBytes', 'sourceUnchanged', 'logComplete')}
    publish_json('summary.json', {'schema': 1, 'identity': before['identity'], 'status': 'admitted',
                 'monitorAdmission': {'schema': 1, 'identity': before['identity'], 'policy': dict(POLICY),
                 'admission': memory.admission, 'readSeconds': memory.admission_duration}}, 65536)
    child = subprocess.Popen(argv, cwd=REPO, env=env, stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT, start_new_session=True)
    result['rootLaunched'] = True
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
        with (folder / 'full.log').open('xb', buffering=0) as log:
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
                if stop_started is None:
                    try:
                        memory.check(rows, proc_stat)
                    except BaseException as exc:
                        reasons.append(f'memory pressure guard: {type(exc).__name__}: {exc}')
                if first is None:
                    reasons.append('root identity could not be established')
                if result['identityConflicts']:
                    reasons.append('PID/starttime identity conflict; mismatched PIDs excluded')
                if rss >= RSS_THRESHOLD:
                    reasons.append('sampled process-tree RSS reached 768 MiB polling threshold')
                if now - started >= TIMEOUT:
                    reasons.append('90-second command deadline reached')
                if evidence_size() >= EVIDENCE_THRESHOLD:
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
                if result['processRoles'] is None and rss >= RSS_THRESHOLD * 3 // 4:
                    result['processRoles'] = capture_process_roles(rows, child.pid, os.path.realpath(argv[0]) if not reasons and stop_started is None else None,
                        round(now-started,6), skip=bool(reasons) or stop_started is not None)
                if stop_started is None:
                    try:
                        publish_json('monitor.json', {**result, 'memory': memory.report(), 'passed': False}, 768 * 1024)
                    except BaseException as exc:
                        reasons.append('bounded monitor publication failed: ' + str(exc)[:256])
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
        if not result['stopReason']:
            try:
                finish_called = time.monotonic()
                memory.finish()
                finish_returned = time.monotonic()
            except BaseException as exc:
                result['stopReason'] = f'memory final check failed: {type(exc).__name__}: {exc}'
        result['memory'] = memory.report()
        ended = time.monotonic()
        result['durationSeconds'] = round(ended - started, 3)
        # Same OS monotonic clock, integer microseconds (sample seconds use 6 decimals).
        # None retains an actually absent finish on failure; it is never complete evidence.
        micros = lambda value: round(value * 1000000) if value is not None else None
        result['memoryClock'] = {'schema': 1, 'monitorStartedMicros': micros(started),
            'admissionCalledMicros': micros(admission_called), 'memoryStartedMicros': micros(memory.started),
            'admissionReturnedMicros': micros(admission_returned), 'finishCalledMicros': micros(finish_called),
            'memoryLastMicros': micros(memory.last), 'finishReturnedMicros': micros(finish_returned),
            'monitorEndedMicros': micros(ended)}
        result['diskFreeAfter'] = shutil.disk_usage(REPO).free
        try:
            source_after = snapshot()
            result['sourceUnchanged'] = source_after == before
            result['sourceAfter'] = publish_json('source-after.json', source_after, 512 * 1024)
            result['sourceAfter']['files'] = len(source_after['files'])
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
                            and result['sourceUnchanged'] and result['logComplete'] and result['memory']['complete']
                            and not result['remainingOwnedProcesses'] and not result['unattributedSessionProcesses'])
        publish_json('monitor.json', result, 768 * 1024)
    return {k: result[k] for k in ('name', 'passed', 'returncode', 'stopReason', 'durationSeconds', 'peakTreeRSSBytes', 'sourceUnchanged', 'logComplete')}



def publish_json(name, value, limit):
    allowed = {'source-before.json': 524288, 'source-after.json': 524288,
               'monitor.json': 786432, 'summary.json': 65536}
    if allowed.get(name) != limit: raise RuntimeError('Unexpected monitor receipt')
    data = (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n').encode('utf-8')
    if len(data) > limit: raise RuntimeError('Monitor receipt byte limit')
    used = budget_usage()
    if used['tool'] > 28 * 1024 ** 2 or used['metadata'] + len(data) > METADATA_RESERVE or used['total'] + len(data) > EVIDENCE_THRESHOLD:
        raise RuntimeError('Atomic pending exceeds actual evidence budget')
    target = OUT / name; pending = OUT / (name + '.pending')
    prior = target.lstat() if target.exists() or target.is_symlink() else None
    if prior and (not stat.S_ISREG(prior.st_mode) or prior.st_nlink != 1): raise RuntimeError('Receipt target alias')
    fd = None; created = None
    try:
        fd = os.open(pending, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        created = os.fstat(fd); offset = 0
        while offset < len(data):
            count = os.write(fd, data[offset:])
            if count <= 0: raise RuntimeError('Short atomic monitor write')
            offset += count
        os.fsync(fd); now = pending.lstat()
        if (now.st_dev, now.st_ino, now.st_size) != (created.st_dev, created.st_ino, len(data)):
            raise RuntimeError('Pending identity changed')
        current = target.lstat() if target.exists() or target.is_symlink() else None
        fields = lambda q: (q.st_dev, q.st_ino, q.st_size, q.st_mtime_ns, q.st_ctime_ns, q.st_mode) if q else None
        if fields(prior) != fields(current): raise RuntimeError('Receipt target changed before publish')
        os.replace(pending, target)
        return {'path': 'receipts/' + name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    finally:
        if fd is not None:
            os.close(fd)
            try:
                q = pending.lstat()
                if (q.st_dev, q.st_ino) == (created.st_dev, created.st_ino): pending.unlink()
            except FileNotFoundError: pass


def main():
    global REPO, OUT, SCRATCH, WORK_ROOT, INPUTS, COMMANDS, ENV
    parser = argparse.ArgumentParser(description='Bounded exact remote single-host window, not release acceptance.')
    parser.add_argument('--inputs', required=True); parser.add_argument('--work-root', required=True)
    args = parser.parse_args(); INPUTS = Path(args.inputs)
    if not INPUTS.is_absolute(): INPUTS = REPO / INPUTS
    WORK_ROOT = Path(args.work_root); OUT = WORK_ROOT / 'receipts'; SCRATCH = WORK_ROOT / 'scratch'
    ENV = dict(os.environ, GIT_OPTIONAL_LOCKS='0', PYTHONDONTWRITEBYTECODE='1', TMPDIR=str(SCRATCH))
    before = snapshot()
    if not SCRATCH.is_dir() or (WORK_ROOT / 'tool').exists(): raise RuntimeError('Exclusive host root required')
    COMMANDS = [{'name': 'dafotang-single-host', 'command': 'node',
       'args': ['--max-old-space-size=512', '--max-semi-space-size=16', str(Path(__file__).with_name('launch.mjs')),
                '--repo', str(REPO), '--work-root', str(WORK_ROOT), '--inputs', str(INPUTS)],
       'env': {'TMPDIR': str(SCRATCH)}}]
    summary = {'schema': 1, 'identity': before['identity'], 'singleHostOnly': True, 'releaseAccepted': False,
               'runs': [], 'status': 'starting', 'passed': False}
    publish_json('summary.json', summary, 65536)
    try:
        result = run_one(COMMANDS[0], before); summary['runs'].append(result)
        summary['status'] = 'passed' if result['passed'] else 'failed'
    except BaseException as exc:
        summary['status'] = 'blocked-or-monitor-error'; summary['error'] = f'{type(exc).__name__}: {exc}'[:4096]
    summary['passed'] = summary['status'] == 'passed'; summary['evidenceBytes'] = evidence_size()
    publish_json('summary.json', summary, 65536)
    print(json.dumps(summary)); return 0 if summary['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
