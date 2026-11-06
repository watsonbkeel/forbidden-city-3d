"""Read-only, bounded native Linux cgroup-v2 memory admission for UI validation."""
import json
import math
import os
from pathlib import Path
import re
import stat
import sys
import time

MiB = 1024 ** 2
POLICY = {'schema': 1, 'rssThresholdBytes': 1536 * MiB,
          'minimumTotalBytes': 4096 * MiB, 'admissionAvailableBytes': 3072 * MiB,
          'pressureFloorBytes': 512 * MiB, 'pollIntervalSeconds': .25,
          'maximumGapSeconds': 1.0, 'maximumReadSeconds': 1.0,
          'maximumSamples': 1024, 'maximumAncestors': 32, 'maximumOwnedProcesses': 64}
# Linux UAPI include/uapi/linux/nsfs.h: CGROUP_NS_INIT_INO = 0xEFFFFFFB.
# The initial namespace plus a full '/' mount excludes hidden cgroup ancestors.
INITIAL_NAMESPACE = 'cgroup:[4026531835]'
SAFE_INTEGER = 2 ** 53 - 1


class MemoryPolicyError(RuntimeError):
    pass


def require(value, message):
    if not value:
        raise MemoryPolicyError(message)


def canonical(p):
    require(isinstance(p, str) and p.startswith('/') and os.path.normpath(p) == p
            and not any(c in p for c in ['\0', '\n', '\r'])
            and (p == '/' or not p.endswith('/')), 'Noncanonical memory path')
    return p


def walk_directories(p):
    canonical(str(p)); parts = Path(p).parts; current = Path('/')
    for part in parts[1:]:
        current /= part
        row = os.lstat(current)
        require(stat.S_ISDIR(row.st_mode) and not stat.S_ISLNK(row.st_mode),
                'Memory directory alias or non-directory')
    return os.lstat(p)


class MemorySource:
    def __init__(self):
        self.pid = os.getpid()
    def read_text(self, p, limit=65536):
        p = str(p); canonical(p); walk_directories(str(Path(p).parent))
        before = os.lstat(p)
        require(stat.S_ISREG(before.st_mode), 'Memory source must be a regular file')
        fd = os.open(p, os.O_RDONLY | os.O_NONBLOCK | os.O_NOFOLLOW)
        try:
            opened = os.fstat(fd)
            require(stat.S_ISREG(opened.st_mode) and (opened.st_dev, opened.st_ino) ==
                    (before.st_dev, before.st_ino), 'Memory source identity changed')
            data = bytearray()
            while len(data) <= limit:
                chunk = os.read(fd, min(4096, limit + 1 - len(data)))
                if not chunk: break
                data.extend(chunk)
            require(len(data) <= limit, 'Memory source size exceeded')
            return bytes(data).decode('utf-8', errors='strict')
        finally:
            os.close(fd)
    def readlink(self, p):
        require(str(p) == f'/proc/{self.pid}/ns/cgroup', 'Unexpected namespace read')
        value = os.readlink(p)
        require(len(value) <= 64 and os.stat(p).st_ino == 4026531835,
                'Initial cgroup namespace is required')
        return value
    def directory_identity(self, p):
        row = walk_directories(str(p))
        return {'device': f'{os.major(row.st_dev)}:{os.minor(row.st_dev)}', 'inode': str(row.st_ino)}


def integer(text, maximum=SAFE_INTEGER):
    value = text.strip()
    require(re.fullmatch(r'0|[1-9][0-9]*', value) is not None, 'Invalid memory integer')
    number = int(value)
    require(number <= maximum, 'Memory integer exceeds supported range')
    return number


def limit_value(text):
    value = text.strip()
    if value == 'max': return value
    integer(value, 2 ** 63 - 1)
    return value


def counters(text):
    out = {}
    for line in text.splitlines():
        fields = line.split()
        require(len(fields) == 2 and re.fullmatch('[a-zA-Z_][a-zA-Z_0-9]*', fields[0])
                and fields[0] not in out, 'Malformed or duplicate memory counter')
        out[fields[0]] = integer(fields[1])
    return out


def host_memory(text):
    out = {}
    for line in text.splitlines():
        if line.startswith(('MemTotal:', 'MemAvailable:')):
            match = re.fullmatch(r'(MemTotal|MemAvailable):[ \t]+([0-9]+)[ \t]+kB', line)
            require(match is not None and match[1] not in out, 'Invalid or duplicate host memory field')
            out[match[1]] = integer(match[2], SAFE_INTEGER // 1024) * 1024
    require(set(out) == {'MemTotal', 'MemAvailable'} and 0 < out['MemTotal']
            and 0 <= out['MemAvailable'] <= out['MemTotal'], 'Complete valid MemTotal/MemAvailable required')
    return out['MemTotal'], out['MemAvailable']


def membership(text):
    lines = text.splitlines()
    require(len(lines) == 1 and lines[0].startswith('0::'), 'Only unified cgroup v2 is supported')
    return canonical(lines[0][3:])


def unescape_path(value):
    return re.sub(r'\\(040|011|012|134)', lambda m: chr(int(m[1], 8)), value)


def mount(text):
    found = []
    for line in text.splitlines():
        halves = line.split(' - ')
        require(len(halves) == 2, 'Malformed mountinfo')
        left, right = halves[0].split(), halves[1].split()
        require(len(left) >= 6 and len(right) >= 3, 'Malformed mountinfo fields')
        require(right[0] != 'cgroup', 'Hybrid/legacy cgroup mounts are unsupported')
        if right[0] == 'cgroup2':
            require(re.fullmatch(r'[0-9]+:[0-9]+', left[2]) is not None, 'Invalid cgroup device')
            found.append({'id': str(integer(left[0])), 'parent': str(integer(left[1])),
                          'device': left[2], 'root': canonical(unescape_path(left[3])),
                          'point': canonical(unescape_path(left[4])),
                          'options': left[5], 'superOptions': right[2]})
    require(len(found) == 1 and found[0]['root'] == '/', 'A unique full cgroup-v2 hierarchy mount is required')
    return found[0]


def capture_memory(source=None):
    source = source or MemorySource(); proc = f'/proc/{source.pid}'
    namespace = source.readlink(proc + '/ns/cgroup')
    require(namespace == INITIAL_NAMESPACE, 'Initial cgroup namespace is required')
    selected = mount(source.read_text(proc + '/mountinfo'))
    group = membership(source.read_text(proc + '/cgroup', 4096))
    total, available = host_memory(source.read_text('/proc/meminfo', 16384))
    vm = counters(source.read_text('/proc/vmstat'))
    require('oom_kill' in vm, 'Global OOM counter is unavailable')
    root = selected['point']; root_id = source.directory_identity(root)
    require(root_id['device'] == selected['device'], 'Cgroup filesystem device mismatch')
    require('memory' in source.read_text(root + '/cgroup.controllers', 4096).split(),
            'Cgroup memory controller is unavailable')
    groups = ['/']; parts = group.strip('/').split('/') if group != '/' else []
    for i in range(len(parts)): groups.append('/' + '/'.join(parts[:i + 1]))
    require(len(groups) <= POLICY['maximumAncestors'], 'Cgroup hierarchy exceeds bounded depth')
    ancestors, currents, events = [], [], []
    effective = available
    for item in groups:
        directory = root if item == '/' else root + item
        directory_id = source.directory_identity(directory)
        require(directory_id['device'] == selected['device'], 'Cgroup ancestor filesystem changed')
        row = {'path': item, **directory_id, 'hierarchyRoot': item == '/'}
        if item == '/':
            # Official cgroup-v2 documentation defines these as non-root files.
            # This exception is only after the initial namespace and full root proof.
            for name in ['cgroup.type', 'memory.current', 'memory.high', 'memory.max', 'memory.events']:
                try: source.read_text(directory + '/' + name, 4096)
                except FileNotFoundError: continue
                raise MemoryPolicyError('Unexpected root memory control; root semantics need review')
            row.update(max='root-not-applicable', high='root-not-applicable')
            currents.append(None); events.append(None)
        else:
            require(source.read_text(directory + '/cgroup.type', 64).strip() == 'domain',
                    'Only domain memory cgroups are supported')
            maximum = limit_value(source.read_text(directory + '/memory.max', 64))
            high = limit_value(source.read_text(directory + '/memory.high', 64))
            current = integer(source.read_text(directory + '/memory.current', 64))
            event = counters(source.read_text(directory + '/memory.events', 4096))
            require('oom' in event and 'oom_kill' in event, 'Cgroup OOM counters are unavailable')
            for boundary in [maximum, high]:
                if boundary != 'max':
                    remaining = int(boundary) - current
                    require(remaining >= 0, 'Cgroup memory pressure boundary already exceeded')
                    effective = min(effective, remaining)
            require(maximum == limit_value(source.read_text(directory + '/memory.max', 64))
                    and high == limit_value(source.read_text(directory + '/memory.high', 64)),
                    'Cgroup limit changed during memory read')
            row.update(max=maximum, high=high)
            currents.append(current); events.append({'oom': event['oom'], 'oomKill': event['oom_kill']})
        require(source.directory_identity(directory) == directory_id, 'Cgroup directory identity changed')
        ancestors.append(row)
    require(namespace == source.readlink(proc + '/ns/cgroup')
            and group == membership(source.read_text(proc + '/cgroup', 4096))
            and selected == mount(source.read_text(proc + '/mountinfo')), 'Memory topology changed during read')
    return {'memTotalBytes': total, 'memAvailableBytes': available,
            'effectiveAvailableBytes': effective, 'globalOOMKills': vm['oom_kill'],
            'cgroupCurrentBytes': currents, 'ancestorOOM': events,
            'topology': {'namespace': namespace, 'mount': selected, 'group': group, 'ancestors': ancestors}}


def require_admission(sample):
    require(sample['memTotalBytes'] >= POLICY['minimumTotalBytes'], 'Less than 4 GiB host RAM')
    require(sample['effectiveAvailableBytes'] >= POLICY['admissionAvailableBytes'],
            'Less than 3 GiB effective memory headroom; browser is not admitted')


def require_pressure_safe(sample):
    require(sample['effectiveAvailableBytes'] >= POLICY['pressureFloorBytes'],
            'Effective memory headroom fell below 512 MiB')


def require_continuity(original, current):
    require(original['topology'] == current['topology']
            and original['memTotalBytes'] == current['memTotalBytes'], 'Memory topology/limit identity changed')
    require(original['globalOOMKills'] == current['globalOOMKills']
            and original['ancestorOOM'] == current['ancestorOOM'], 'OOM counter changed during validation')


class MemoryWatch:
    def __init__(self, source=None, clock=time.monotonic):
        self.source = source or MemorySource(); self.clock = clock
        self.admission = None; self.started = None; self.last = None
        self.samples = []; self.failure = None; self.complete = False; self.admission_duration = None
    def _capture(self):
        start = self.clock(); sample = capture_memory(self.source); end = self.clock()
        require(math.isfinite(end - start) and 0 <= end - start <= POLICY['maximumReadSeconds'],
                'Memory read is too slow or time is invalid')
        return sample, end, end - start
    def _append(self, sample, when, duration):
        require(len(self.samples) < POLICY['maximumSamples'], 'Memory sample budget exhausted')
        self.samples.append({'seconds': round(when - self.started, 6), 'readSeconds': duration,
                             **{k: sample[k] for k in ['memAvailableBytes', 'effectiveAvailableBytes',
                                  'globalOOMKills', 'cgroupCurrentBytes', 'ancestorOOM']}})
        self.last = when
    def admit(self):
        try:
            require(self.admission is None, 'Memory admission cannot be reused')
            sample, end, duration = self._capture(); require_admission(sample)
            self.admission = sample; self.admission_duration = duration; self.started = end
            self._append(sample, end, duration)
            return sample
        except BaseException as error:
            self.failure = str(error)[:512]; raise
    def check(self, rows, proc_stat, force=False):
        try:
            require(self.admission is not None and self.failure is None, 'Successful memory admission is required')
            now = self.clock(); gap = now - self.last
            require(math.isfinite(gap) and 0 <= gap <= POLICY['maximumGapSeconds'], 'Memory observation gap exceeded')
            if not force and gap < POLICY['pollIntervalSeconds']: return False
            sample, end, duration = self._capture()
            require(0 <= end - self.last <= POLICY['maximumGapSeconds'], 'Memory observation completion gap exceeded')
            require_continuity(self.admission, sample); require_pressure_safe(sample)
            require(len(rows) <= POLICY['maximumOwnedProcesses'], 'Owned process membership budget exceeded')
            for row in rows:
                if row['state'] == 'Z': continue
                current = proc_stat(row['pid'])
                if current is None: continue
                require(current['starttime'] == row['starttime'], 'PID identity changed during memory membership check')
                try: group = membership(self.source.read_text(f"/proc/{row['pid']}/cgroup", 4096))
                except FileNotFoundError:
                    require(proc_stat(row['pid']) is None, 'Live process memory membership is unreadable'); continue
                after = proc_stat(row['pid'])
                if after is None: continue
                require(after['starttime'] == row['starttime'], 'PID identity changed during memory membership check')
                require(group == sample['topology']['group'], 'Owned process changed its admitted cgroup')
            self._append(sample, end, duration); return True
        except BaseException as error:
            self.failure = str(error)[:512]; raise
    def finish(self):
        self.check([], lambda pid: None, force=True); self.complete = True
    def report(self):
        return {'schema': 1, 'policy': dict(POLICY), 'admission': self.admission,
                'admissionReadSeconds': self.admission_duration, 'samples': self.samples,
                'failure': self.failure, 'complete': self.complete and self.failure is None}


def event_identity(env):
    keys = {'eventSha': 'GITHUB_SHA', 'runId': 'GITHUB_RUN_ID', 'runAttempt': 'GITHUB_RUN_ATTEMPT',
            'repository': 'GITHUB_REPOSITORY', 'ref': 'GITHUB_REF'}
    identity = {k: env.get(v) for k, v in keys.items()}
    require(all(isinstance(v, str) and v and v.strip() == v for v in identity.values()), 'Complete event identity required')
    require(re.fullmatch('[a-f0-9]{40}', identity['eventSha']) and identity['runId'].isdigit()
            and re.fullmatch('[1-9][0-9]*', identity['runAttempt'])
            and identity['repository'] == 'watsonbkeel/forbidden-city-3d'
            and identity['ref'].startswith('refs/heads/'), 'Invalid event identity')
    return identity


if __name__ == '__main__':
    try:
        require(sys.argv[1:] == ['--admission'], 'Only --admission is supported')
        identity = event_identity(os.environ); watch = MemoryWatch(); sample = watch.admit()
        receipt = {'schema': 1, 'identity': identity, 'policy': dict(POLICY),
                   'admission': sample, 'readSeconds': watch.admission_duration}
        print(json.dumps(receipt, separators=(',', ':')))
    except BaseException as error:
        print('Memory admission blocked: ' + str(error)[:512], file=sys.stderr); sys.exit(1)
