#!/usr/bin/env python3
"""Finite official Ubuntu CJK preparation and receipt checks for this CI only."""
import argparse
import ctypes
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import tarfile
import time

SPEC_PATH = Path(__file__).with_name('font-spec.json')
SPEC_BYTES = SPEC_PATH.read_bytes()
SPEC = json.loads(SPEC_BYTES)
SPEC_SHA = hashlib.sha256(SPEC_BYTES).hexdigest()
BRANCH = 'refs/heads/dev/r166-cumulative-374-e46-20261106'
ROOT_LIMIT = 128 * 1024 * 1024
RECEIPT_LIMIT = 512 * 1024
LOG_LIMIT = 64 * 1024
PREPARE_SECONDS = 290


def require(value, message):
    if not value:
        raise ValueError(message)


def identity(env):
    keys = {'eventSha': 'GITHUB_SHA', 'runId': 'GITHUB_RUN_ID', 'runAttempt': 'GITHUB_RUN_ATTEMPT', 'repository': 'GITHUB_REPOSITORY', 'ref': 'GITHUB_REF'}
    q = {k: env.get(v, '') for k, v in keys.items()}
    require(re.fullmatch('[a-f0-9]{40}', q['eventSha']) and re.fullmatch('[0-9]+', q['runId']) and re.fullmatch('[1-9][0-9]*', q['runAttempt']) and q['repository'] == 'watsonbkeel/forbidden-city-3d' and q['ref'] == BRANCH, 'Wrong font event identity')
    return q


def ancestors(path, leaf=True):
    path = Path(path)
    require(path.is_absolute() and str(path) == os.path.normpath(path), 'Noncanonical absolute path')
    parts = list(reversed(path.parents)) + ([path] if leaf else [])
    for p in parts:
        s = p.lstat()
        require(not stat.S_ISLNK(s.st_mode), 'Path alias forbidden')
        if p != path:
            require(stat.S_ISDIR(s.st_mode), 'Nondirectory ancestor')
    return path


def regular(path, limit=RECEIPT_LIMIT):
    path = ancestors(path)
    before = path.lstat()
    require(stat.S_ISREG(before.st_mode) and before.st_size <= limit, 'Not a bounded regular file')
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino) == (before.st_dev, before.st_ino), 'File identity changed')
        chunks = []
        total = 0
        while True:
            b = os.read(fd, min(65536, limit + 1 - total))
            if not b:
                break
            chunks.append(b)
            total += len(b)
            require(total <= limit, 'File limit exceeded')
        after = os.fstat(fd)
        require((after.st_size, after.st_mtime_ns, after.st_ctime_ns) == (before.st_size, before.st_mtime_ns, before.st_ctime_ns) and total == before.st_size, 'File changed while reading')
        return b''.join(chunks)
    finally:
        os.close(fd)


def hash_regular(path, limit=32 * 1024 * 1024):
    path = ancestors(path)
    before = path.lstat()
    require(stat.S_ISREG(before.st_mode) and before.st_size <= limit, 'Not a bounded hash input')
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino) == (before.st_dev, before.st_ino), 'Hash file identity changed')
        total = 0
        digest = hashlib.sha256()
        while True:
            b = os.read(fd, 65536)
            if not b:
                break
            total += len(b)
            require(total <= limit, 'Hash input limit exceeded')
            digest.update(b)
        after = os.fstat(fd)
        require((after.st_size, after.st_mtime_ns, after.st_ctime_ns) == (before.st_size, before.st_mtime_ns, before.st_ctime_ns) and total == before.st_size, 'Hash input changed')
        return {'bytes': total, 'sha256': digest.hexdigest()}
    finally:
        os.close(fd)


def atomic_json(path, value):
    path = ancestors(path, False)
    data = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    require(len(data) <= RECEIPT_LIMIT, 'Font receipt size exceeded')
    old = None
    if path.exists() or path.is_symlink():
        regular(path)
        s = path.lstat()
        old = (s.st_dev, s.st_ino)
    temp = path.with_name('.' + path.name + '.pending')
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    owned = os.fstat(fd)
    try:
        view = memoryview(data)
        while view:
            n = os.write(fd, view)
            require(n > 0, 'Short receipt write')
            view = view[n:]
        os.fsync(fd)
        now = path.lstat() if path.exists() or path.is_symlink() else None
        require((None if now is None else (now.st_dev, now.st_ino)) == old, 'Receipt target changed')
        require((temp.lstat().st_dev, temp.lstat().st_ino) == (owned.st_dev, owned.st_ino), 'Pending receipt changed')
        os.replace(temp, path)
    finally:
        os.close(fd)
        try:
            s = temp.lstat()
            if (s.st_dev, s.st_ino) == (owned.st_dev, owned.st_ino):
                temp.unlink()
        except FileNotFoundError:
            pass


def validate_roots(env):
    i = identity(env)
    temp = ancestors(env.get('RUNNER_TEMP', ''))
    require(temp.is_dir(), 'Missing runner root')
    font = Path(env.get('FONT_WORK_ROOT', ''))
    require(font == temp / ('bf-' + i['runId'] + '-' + i['runAttempt']), 'Wrong font root')
    ancestors(font, False)
    others = [Path(env.get(k, '')) for k in ['UI_WORK_ROOT', 'EVIDENCE_DIR', 'GITHUB_WORKSPACE']]
    for p in others:
        require(p.is_absolute() and str(p) == os.path.normpath(p), 'Missing canonical other root')
        require(p != font and font not in p.parents and p not in font.parents, 'Overlapping roots')
        ancestors(p, False)
    require(len(set(others)) == len(others), 'Duplicate roots')
    for a in others:
        for b in others:
            if a != b:
                require(a not in b.parents, 'Other roots overlap')
    return font


def validate_font_environment(env):
    for k in ['FONTCONFIG_FILE', 'FONTCONFIG_PATH', 'FONTCONFIG_SYSROOT']:
        require(not env.get(k), 'Unexpected font configuration override')


def validate_member(row):
    expected = next((x for x in SPEC['members'] if x['path'] == row.get('path')), None)
    require(expected is not None, 'Unknown package member')
    for key in ['type', 'mode', 'bytes', 'linkTarget']:
        require(row.get(key) == expected.get(key), 'Wrong package member metadata')
    if expected['type'] == 'regular':
        require(row.get('sha256') == expected['sha256'], 'Wrong package member hash')


def validate_simulation(text, already_installed):
    operations = [line for line in text.splitlines() if re.match(r'^(Inst|Conf|Remv|Purg) ', line)]
    if already_installed:
        require(not operations, 'Unexpected reinstall/upgrade transaction')
        return []
    require(len(operations) == 2, 'Unexpected package transaction')
    for kind, line in zip(['Inst', 'Conf'], operations):
        require(re.match(r'^' + kind + r' fonts-noto-cjk \(' + re.escape(SPEC['version']) + r'(?:\s|\))', line), 'Unexpected package/version/removal')
    return [SPEC['package']]


def validate_transaction(before, after, before_audit, after_audit):
    require(before_audit.strip() == after_audit.strip() == '', 'Pending dpkg transaction')
    changes = sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))
    require(changes in [[], [SPEC['package']]], 'Unapproved package change')
    require(after.get(SPEC['package']) == (SPEC['version'], 'install ok installed'), 'Font not fully configured')
    require(SPEC['package'] not in before or before[SPEC['package']] == after[SPEC['package']], 'Upgrade/downgrade forbidden')
    return changes


def validate_glyphs(rows, required):
    require(isinstance(rows, list) and len(rows) == len(required), 'Incomplete glyph coverage')
    for row, cp in zip(rows, required):
        require(set(row) == {'codepoint', 'glyphIndex'} and row['codepoint'] == cp and type(row['glyphIndex']) is int and 0 < row['glyphIndex'] <= 0xffffffff, 'Missing or malformed glyph')


def validate_match(text, face):
    row = text.strip().split('\t')
    require(len(row) == 4 and row == [face['path'], str(face['index']), face['family'], face['postScriptName']], 'Fallback is not the verified SC face')
    return dict(zip(['path', 'index', 'family', 'postScriptName'], row))


def package_snapshot(text):
    rows = {}
    for line in text.splitlines():
        fields = line.split('\t')
        require(len(fields) == 3 and fields[0] not in rows, 'Malformed package inventory')
        rows[fields[0]] = tuple(fields[1:])
    require(rows, 'Empty package inventory')
    return rows


def installed_files():
    rows = []
    for r in SPEC['members']:
        if r['type'] != 'regular' or not (r['path'].startswith('./usr/share/fonts/') or '/fontconfig/' in r['path']):
            continue
        p = Path(r['path'][1:])
        actual = hash_regular(p)
        require(actual == {'bytes': r['bytes'], 'sha256': r['sha256']}, 'Installed font/config differs from official package')
        st = p.lstat()
        require(st.st_uid == 0 and stat.S_IMODE(st.st_mode) == int(r['mode'], 8), 'Unexpected font file ownership/mode')
        rows.append({'path': str(p), **actual})
    link = next(r for r in SPEC['members'] if r['type'] == 'symlink')
    p = ancestors(link['path'][1:], False)
    require(p.is_symlink() and os.readlink(p) == link['linkTarget'], 'Wrong official font config link')
    require(str(p.resolve(strict=True)) == link['linkTarget'], 'Config link does not resolve to exact package member')
    require(any(r['path'] == link['linkTarget'] for r in rows), 'Config target unverified')
    return {'files': rows, 'configLink': {'path': str(p), 'target': link['linkTarget']}}


def probe_glyphs():
    library_link = Path('/usr/lib/x86_64-linux-gnu/libfreetype.so.6')
    library_path = library_link.resolve(strict=True)
    require(str(library_path).startswith('/usr/lib/x86_64-linux-gnu/libfreetype.so.6.'), 'Unexpected FreeType library target')
    library_identity = hash_regular(library_path)
    lib = ctypes.CDLL(str(library_path))
    p = ctypes.c_void_p
    signatures = {'FT_Init_FreeType': ([ctypes.POINTER(p)], ctypes.c_int), 'FT_New_Face': ([p, ctypes.c_char_p, ctypes.c_long, ctypes.POINTER(p)], ctypes.c_int), 'FT_Select_Charmap': ([p, ctypes.c_uint], ctypes.c_int), 'FT_Get_Char_Index': ([p, ctypes.c_ulong], ctypes.c_uint), 'FT_Get_Postscript_Name': ([p], ctypes.c_char_p), 'FT_Done_Face': ([p], ctypes.c_int), 'FT_Done_FreeType': ([p], ctypes.c_int), 'FT_Library_Version': ([p, ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int)], None)}
    for name, (args, ret) in signatures.items():
        getattr(lib, name).argtypes = args
        getattr(lib, name).restype = ret
    handle = p()
    require(lib.FT_Init_FreeType(ctypes.byref(handle)) == 0, 'FreeType initialization failed')
    values = [ctypes.c_int() for _ in range(3)]
    faces = []
    try:
        lib.FT_Library_Version(handle, *(ctypes.byref(v) for v in values))
        for expected in SPEC['faces']:
            face = p()
            require(hash_regular(expected['path']) == {k: expected[k] for k in ['bytes', 'sha256']}, 'Glyph input file changed')
            require(lib.FT_New_Face(handle, os.fsencode(expected['path']), expected['index'], ctypes.byref(face)) == 0, 'Required SC face unavailable')
            try:
                require(lib.FT_Select_Charmap(face, 0x756e6963) == 0, 'Unicode charmap unavailable')
                ps = lib.FT_Get_Postscript_Name(face)
                require(ps and ps.decode() == expected['postScriptName'], 'Wrong SC PostScript identity')
                glyphs = [{'codepoint': cp, 'glyphIndex': lib.FT_Get_Char_Index(face, cp)} for cp in SPEC['requiredCodepoints']]
                validate_glyphs(glyphs, SPEC['requiredCodepoints'])
                require(lib.FT_Get_Char_Index(face, 0x10ffff) == 0, 'Missing-glyph negative did not return zero')
                faces.append({**expected, 'glyphs': glyphs, 'missingCodepoint': 0x10ffff, 'missingGlyphIndex': 0})
            finally:
                lib.FT_Done_Face(face)
    finally:
        lib.FT_Done_FreeType(handle)
    return {'freetype': {'path': str(library_path), **library_identity, 'version': '.'.join(str(v.value) for v in values)}, 'faces': faces}


def cache_snapshot():
    root = ancestors('/var/cache/fontconfig')
    rows = []
    for p in sorted(root.iterdir()):
        s = p.lstat()
        require(stat.S_ISREG(s.st_mode) and len(rows) < 256, 'Unexpected Fontconfig cache entry')
        rows.append({'name': p.name, 'bytes': s.st_size, 'mtimeNs': s.st_mtime_ns})
    require(sum(r['bytes'] for r in rows) <= 64 * 1024 * 1024, 'Unexpected cache footprint')
    return rows


class Commands:
    """Only the fixed commands below use this bounded output/deadline runner."""
    def __init__(self, root, receipt, log_identity):
        self.log_identity = log_identity
        self.root = root
        self.receipt = receipt
        self.started = time.monotonic()

    def __call__(self, args, seconds=30, empty=False, channel='stdout'):
        require(channel in ['stdout', 'stderr'], 'Unknown output channel')
        import selectors
        remaining = PREPARE_SECONDS - (time.monotonic() - self.started)
        require(remaining > 0, 'Font preparation deadline exceeded')
        deadline = time.monotonic() + min(seconds, remaining)
        proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=self.root / 'scratch', env={**os.environ, 'LC_ALL': 'C', 'DEBIAN_FRONTEND': 'noninteractive'}, start_new_session=True)
        selector = selectors.DefaultSelector()
        for stream in [proc.stdout, proc.stderr]:
            os.set_blocking(stream.fileno(), False)
            selector.register(stream, selectors.EVENT_READ)
        output, errors = bytearray(), bytearray()
        try:
            while selector.get_map():
                require(time.monotonic() < deadline, 'Font command timed out; privileged child state may be uncertain')
                require(sum(p.lstat().st_size for p in self.root.rglob('*') if p.is_file() and not p.is_symlink()) <= ROOT_LIMIT, 'Font temporary budget exceeded')
                for key, _ in selector.select(.05):
                    chunk = os.read(key.fileobj.fileno(), 65536)
                    if not chunk:
                        selector.unregister(key.fileobj)
                        continue
                    dest = output if key.fileobj is proc.stdout else errors
                    dest.extend(chunk)
                    require(len(output) + len(errors) <= 1024 * 1024, 'Font command output exceeded')
            code = proc.wait(timeout=max(.01, deadline - time.monotonic()))
            text = (output if channel == 'stdout' else errors).decode('utf8', 'strict').strip()
            require(code == 0 and (empty or text), 'Font command failed: ' + Path(args[0]).name + ': ' + errors.decode('utf8', 'replace')[:1000])
            return text
        finally:
            if proc.poll() is None:
                # Signal only this owned wrapper process. sudo/root descendants
                # may remain: callers retain failed/uncertain transaction state.
                try:
                    proc.terminate()
                    proc.wait(timeout=.5)
                except (OSError, subprocess.TimeoutExpired):
                    try:
                        proc.kill()
                        proc.wait(timeout=.5)
                    except (OSError, subprocess.TimeoutExpired):
                        pass
            selector.close()
            for stream in [proc.stdout, proc.stderr]:
                stream.close()
            log = self.root / 'receipts/prepare.log'
            before = log.lstat()
            require((before.st_dev, before.st_ino) == self.log_identity, 'Owned font log replaced')
            old = regular(log, LOG_LIMIT)
            tail = ('COMMAND ' + json.dumps(args) + '\n').encode() + output[:4096] + errors[:4096] + b'\n'
            fd = os.open(log, os.O_WRONLY | os.O_APPEND | os.O_NOFOLLOW | os.O_NONBLOCK)
            try:
                opened = os.fstat(fd)
                require(stat.S_ISREG(opened.st_mode) and (opened.st_dev, opened.st_ino) == self.log_identity and opened.st_size == len(old), 'Font log changed before append')
                view = memoryview(tail[:max(0, LOG_LIMIT - len(old))])
                while view:
                    n = os.write(fd, view)
                    require(n > 0, 'Short font log append')
                    view = view[n:]
                current = log.lstat()
                require((current.st_dev, current.st_ino) == self.log_identity, 'Font log changed during append')
            finally:
                os.close(fd)
            self.receipt['commands'].append({'program': Path(args[0]).name, 'exit': proc.poll(), 'stdoutBytes': len(output), 'stderrBytes': len(errors), 'logTruncated': len(old) + len(tail) > LOG_LIMIT})


def validate_receipt(q, expected_identity):
    require(isinstance(q, dict) and q.get('schema') == 1 and q.get('status') == 'passed' and q.get('identity') == expected_identity and q.get('specSHA256') == SPEC_SHA, 'Font preparation not successful for this event')
    require(q.get('package') == {'name': SPEC['package'], 'version': SPEC['version'], 'url': SPEC['url'], 'bytes': SPEC['bytes'], 'sha256': SPEC['sha256']}, 'Font package provenance missing')
    require(q.get('transactionState') == 'complete' and q.get('beforeAudit') == q.get('afterAudit') == '' and q.get('changes') in [[], [SPEC['package']]], 'Font transaction incomplete')
    expected_files = [{'path': r['path'][1:], 'bytes': r['bytes'], 'sha256': r['sha256']} for r in SPEC['members'] if r['type'] == 'regular' and (r['path'].startswith('./usr/share/fonts/') or '/fontconfig/' in r['path'])]
    require(q.get('installed', {}).get('files') == expected_files, 'Font file identities incomplete')
    link = next(r for r in SPEC['members'] if r['type'] == 'symlink')
    require(q['installed'].get('configLink') == {'path': link['path'][1:], 'target': link['linkTarget']}, 'Config link provenance incomplete')
    require(len(q.get('faces', [])) == len(SPEC['faces']), 'Font face evidence incomplete')
    for face, expected in zip(q['faces'], SPEC['faces']):
        require(all(face.get(k) == v for k, v in expected.items()) and face.get('missingCodepoint') == 0x10ffff and face.get('missingGlyphIndex') == 0, 'SC face identity missing')
        validate_glyphs(face.get('glyphs'), SPEC['requiredCodepoints'])
    require(re.fullmatch(r'\d+\.\d+\.\d+', q.get('freetype', {}).get('version', '')) and re.fullmatch('[a-f0-9]{64}', q.get('freetype', {}).get('sha256', '')), 'FreeType provenance missing')
    require(isinstance(q.get('fontconfig'), dict) and re.fullmatch(r'fontconfig version \d+\.\d+\.\d+', q['fontconfig'].get('version', '')) and len(q['fontconfig'].get('matches', [])) == 2 and len(q['fontconfig'].get('queries', [])) == 2, 'Fontconfig provenance missing')
    for match, face in zip(q['fontconfig']['matches'], SPEC['faces']):
        require(match == dict(zip(['path', 'index', 'family', 'postScriptName'], [face['path'], str(face['index']), face['family'], face['postScriptName']])), 'Fontconfig fallback mismatch')
    require(q.get('footprint', {}).get('normalMaintscriptsAndTriggers') is True and 'cacheBefore' in q['footprint'] and 'cacheAfter' in q['footprint'] and q.get('scratchClean') is True, 'Preparation cleanup/footprint incomplete')
    require(q.get('simulationChanges') == q['changes'], 'Simulation/actual transaction differs')
    require(isinstance(q.get('aptOrigin'), str) and re.search(r'https?://(?:[a-z]+\.)?archive\.ubuntu\.com/ubuntu\s+noble/main', q['aptOrigin']), 'Official apt origin missing')
    require(re.fullmatch(r'/usr/lib/x86_64-linux-gnu/libfreetype\.so\.6\.[0-9.]+', q['freetype'].get('path', '')) and type(q['freetype'].get('bytes')) is int and 0 < q['freetype']['bytes'] <= 32 * 1024 * 1024, 'FreeType file identity incomplete')
    for query, face in zip(q['fontconfig']['queries'], SPEC['faces']):
        require(isinstance(query, dict) and set(query) == {'face', 'fontVersion'} and query['face'] == face['postScriptName'] and isinstance(query['fontVersion'], str) and re.fullmatch('[0-9]{1,10}', query['fontVersion']), 'Font query incomplete')
    fp = q['footprint']
    require(fp.get('maintscriptSHA256') == 'f85775a5ec255da85d32cd6604dc1daea5d57cf30908b2520dd3e0463159754c' and fp.get('legacyConffileMigration') == '/etc/fonts/conf.avail/70-fonts-noto-cjk.conf' and fp.get('normalSystemWrites') == ['/var/lib/dpkg', '/var/log/apt', '/var/log/dpkg.log', '/var/cache/fontconfig'], 'Package footprint identity incomplete')
    for key in ['cacheBefore', 'cacheAfter']:
        rows = fp[key]
        require(isinstance(rows, list) and len(rows) <= 256, 'Invalid cache footprint')
        names = set()
        for r in rows:
            require(isinstance(r, dict) and set(r) == {'name', 'bytes', 'mtimeNs'} and isinstance(r['name'], str) and re.fullmatch('[A-Za-z0-9._-]{1,128}', r['name']) and r['name'] not in names and type(r['bytes']) is int and r['bytes'] >= 0 and type(r['mtimeNs']) is int and r['mtimeNs'] >= 0, 'Invalid cache member')
            names.add(r['name'])
        require(sum(r['bytes'] for r in rows) <= 64 * 1024 * 1024, 'Cache footprint exceeds bound')
    programs = ['python3', 'dpkg', 'dpkg-query', 'apt-cache', 'apt-cache', 'curl', 'apt-get'] + (['sudo'] if q['changes'] else []) + ['dpkg', 'dpkg-query', 'fc-match', 'fc-match', 'fc-query', 'fc-match', 'fc-query']
    contract = q.get('contracts')
    require(isinstance(contract, dict) and set(contract) == {'tests', 'passed', 'outputSHA256'} and contract['tests'] == 18 and contract['passed'] is True and re.fullmatch('[a-f0-9]{64}', contract['outputSHA256']), 'Font synthetic contracts incomplete')
    commands = q.get('commands')
    require(isinstance(commands, list) and [c.get('program') for c in commands] == programs, 'Incomplete font command sequence')
    for c in commands:
        require(set(c) == {'program', 'exit', 'stdoutBytes', 'stderrBytes', 'logTruncated'} and type(c['exit']) is int and c['exit'] == 0 and type(c['logTruncated']) is bool and all(type(c[k]) is int and 0 <= c[k] <= 1024 * 1024 for k in ['stdoutBytes', 'stderrBytes']), 'Failed/unknown font command')
    return q


def prepare(env=os.environ, runner=None):
    root = validate_roots(env)
    root.mkdir(mode=0o700)
    (root / 'receipts').mkdir(mode=0o700)
    (root / 'scratch').mkdir(mode=0o700)
    atomic_json(root / 'OWNER.json', {'schema': 1, 'identity': identity(env)})
    receipt = {'schema': 1, 'status': 'incomplete', 'identity': identity(env), 'specSHA256': SPEC_SHA, 'commands': [], 'transactionState': 'not-started', 'scratchClean': False}
    receipt_path = root / 'receipts/prepare.json'
    atomic_json(receipt_path, receipt)
    log_fd = os.open(root / 'receipts/prepare.log', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    log_stat = os.fstat(log_fd)
    os.close(log_fd)
    run = runner or Commands(root, receipt, (log_stat.st_dev, log_stat.st_ino))
    deb = root / 'scratch' / SPEC['archiveName']
    owned_deb = None
    try:
        validate_font_environment(env)
        contract_text = run(['python3', str(Path(__file__).with_name('fonts.test.py'))], seconds=30, channel='stderr')
        require(re.search(r'Ran 18 tests in [0-9.]+s', contract_text) and contract_text.endswith('OK'), 'Font contracts failed or count changed')
        receipt['contracts'] = {'tests': 18, 'passed': True, 'outputSHA256': hashlib.sha256(contract_text.encode()).hexdigest()}
        receipt['beforeAudit'] = run(['dpkg', '--audit'], empty=True)
        before = package_snapshot(run(['dpkg-query', '-W', '-f=${binary:Package}\t${Version}\t${Status}\n']))
        require(receipt['beforeAudit'] == '', 'Pending dpkg transaction')
        already = SPEC['package'] in before
        require(not already or before[SPEC['package']] == (SPEC['version'], 'install ok installed'), 'Existing package upgrade/downgrade forbidden')
        metadata = run(['apt-cache', 'show', SPEC['package'] + '=' + SPEC['version']])
        require('Version: ' + SPEC['version'] in metadata and 'SHA256: ' + SPEC['sha256'] in metadata and 'Filename: pool/main/f/fonts-noto-cjk/' + SPEC['archiveName'] in metadata, 'Pinned official apt metadata unavailable')
        policy = run(['apt-cache', 'policy', SPEC['package']])
        require(re.search(r'https?://(?:[a-z]+\.)?archive\.ubuntu\.com/ubuntu\s+noble/main', policy), 'Official noble/main apt origin unavailable')
        receipt['aptOrigin'] = policy
        fd = os.open(deb, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        st = os.fstat(fd)
        owned_deb = (st.st_dev, st.st_ino)
        os.close(fd)
        run(['curl', '--fail', '--silent', '--show-error', '--connect-timeout', '10', '--max-time', '90', '--max-filesize', str(SPEC['bytes']), '--proto', '=https', '--output', str(deb), SPEC['url']], seconds=95, empty=True)
        require(hash_regular(deb, SPEC['bytes']) == {'bytes': SPEC['bytes'], 'sha256': SPEC['sha256']}, 'Wrong official font archive')
        receipt['package'] = {'name': SPEC['package'], **{k: SPEC[k] for k in ['version', 'url', 'bytes', 'sha256']}}
        apt_args = ['apt-get', '--no-install-recommends', '--no-remove', '--no-upgrade', 'install', str(deb)]
        receipt['simulationChanges'] = validate_simulation(run([*apt_args[:1], '--simulate', *apt_args[1:]], empty=True), already)
        receipt['footprint'] = {'normalMaintscriptsAndTriggers': True, 'maintscriptSHA256': 'f85775a5ec255da85d32cd6604dc1daea5d57cf30908b2520dd3e0463159754c', 'legacyConffileMigration': '/etc/fonts/conf.avail/70-fonts-noto-cjk.conf', 'normalSystemWrites': ['/var/lib/dpkg', '/var/log/apt', '/var/log/dpkg.log', '/var/cache/fontconfig'], 'cacheBefore': cache_snapshot()}
        if not already:
            receipt['transactionState'] = 'uncertain'
            atomic_json(receipt_path, receipt)
            run(['sudo', '-n', *apt_args[:1], '--yes', *apt_args[1:]], seconds=90, empty=True)
        receipt['afterAudit'] = run(['dpkg', '--audit'], empty=True)
        after = package_snapshot(run(['dpkg-query', '-W', '-f=${binary:Package}\t${Version}\t${Status}\n']))
        receipt['changes'] = validate_transaction(before, after, receipt['beforeAudit'], receipt['afterAudit'])
        receipt['transactionState'] = 'complete'
        receipt['installed'] = installed_files()
        receipt['footprint']['cacheAfter'] = cache_snapshot()
        receipt['fontconfig'] = {'version': run(['fc-match', '--version'], channel='stderr'), 'matches': [], 'queries': []}
        for face in SPEC['faces']:
            fields = '%{file}\t%{index}\t%{family}\t%{postscriptname}'
            match = run(['fc-match', '--format', fields, 'sans-serif:lang=zh-cn:weight=' + ('bold' if face['style'] == 'Bold' else 'regular')])
            receipt['fontconfig']['matches'].append(validate_match(match, face))
            query = run(['fc-query', '--index', str(face['index']), '--format', fields + '\t%{fontversion}', face['path']])
            parts = query.rsplit('\t', 1)
            require(len(parts) == 2 and parts[1].isdigit(), 'Font version unavailable')
            validate_match(parts[0], face)
            receipt['fontconfig']['queries'].append({'face': face['postScriptName'], 'fontVersion': parts[1]})
        receipt.update(probe_glyphs())
        receipt['status'] = 'passed'
    except Exception as error:
        receipt['status'] = 'failed'
        receipt['error'] = str(error)[:2000]
    finally:
        # A timed-out sudo/apt child might still use its input. Do not claim it
        # stopped, delete its archive, launch UI, or automatically retry.
        if receipt['transactionState'] != 'uncertain' and owned_deb is not None:
            try:
                st = deb.lstat()
                if (st.st_dev, st.st_ino) == owned_deb and stat.S_ISREG(st.st_mode):
                    deb.unlink()
            except FileNotFoundError:
                pass
        receipt['scratchClean'] = not any((root / 'scratch').iterdir())
        if receipt['status'] == 'passed':
            try:
                validate_receipt(receipt, identity(env))
            except Exception as error:
                receipt.update(status='failed', error=str(error))
        atomic_json(receipt_path, receipt)
    return receipt


def check(env=os.environ, runner=None):
    root = validate_roots(env)
    owner = json.loads(regular(root / 'OWNER.json'))
    require(owner == {'schema': 1, 'identity': identity(env)}, 'Font owner identity mismatch')
    data = regular(root / 'receipts/prepare.json')
    receipt = validate_receipt(json.loads(data), identity(env))
    validate_font_environment(env)
    require(installed_files() == receipt['installed'], 'Font installation changed after preparation')
    require(hash_regular(receipt['freetype']['path']) == {k: receipt['freetype'][k] for k in ['bytes', 'sha256']}, 'FreeType changed')
    return {'schema': 1, 'status': 'passed', 'identity': identity(env), 'receiptSHA256': hashlib.sha256(data).hexdigest(), 'specSHA256': SPEC_SHA, 'installed': receipt['installed'], 'faces': [{k: f[k] for k in ['path', 'sha256', 'index', 'family', 'style', 'postScriptName']} for f in receipt['faces']]}


def collect(env=os.environ):
    i = identity(env)
    evidence = ancestors(env.get('EVIDENCE_DIR', ''))
    dest = evidence / 'font-environment'
    dest.mkdir(mode=0o700)
    result = {'schema': 1, 'identity': i, 'passed': False, 'copied': [], 'files': []}
    try:
        root = validate_roots(env)
        owner = json.loads(regular(root / 'OWNER.json'))
        require(owner == {'schema': 1, 'identity': i}, 'Font owner identity mismatch')
        result['unavailable'] = []
        for name, limit in [('prepare.json', RECEIPT_LIMIT), ('prepare.log', LOG_LIMIT)]:
            try:
                data = regular(root / 'receipts' / name, limit)
                with (dest / name).open('xb') as stream:
                    stream.write(data)
                result['copied'].append(name)
                result['files'].append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
            except (OSError, ValueError) as error:
                result['unavailable'].append({'path': name, 'reason': str(error)[:500]})
        require(not result['unavailable'], 'Missing or rejected fixed font evidence')
        require(json.loads(regular(root / 'OWNER.json')) == owner, 'Font owner changed during collection')
        validate_receipt(json.loads(regular(dest / 'prepare.json')), i)
        result['passed'] = True
    except Exception as error:
        result['error'] = str(error)[:2000]
    atomic_json(dest / 'collection.json', result)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['prepare', 'check', 'collect'])
    args = parser.parse_args()
    try:
        value = {'prepare': prepare, 'check': check, 'collect': collect}[args.action]()
        print(json.dumps(value if args.action == 'check' else {k: v for k, v in value.items() if k in ['status', 'passed', 'identity', 'error', 'transactionState']}))
        raise SystemExit(0 if value.get('status') == 'passed' or value.get('passed') is True else 1)
    except Exception as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)
