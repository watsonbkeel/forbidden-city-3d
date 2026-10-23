"""Single-authority, lossless research queue storage. Never a runtime input.

QUEUE.json is a typed index. Only its selected immutable gzip generation is
current. Plain JSON is accepted exclusively by explicit hash-guarded migration,
never by a reader. All writes validate before the one atomic index replacement.
"""
from contextlib import contextmanager
import fcntl
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import re
import stat
import uuid
import zlib

from queue_invariants import validate_progress

DEFAULT_QUEUE = Path(__file__).resolve().parents[2] / 'docs/photo-fidelity/QUEUE.json'
FORMAT = 'photo-fidelity-queue/gzip-parts-v1'
PART_SIZE = 120000
MAX_RAW_BYTES = 64 * 1024 * 1024
MAX_GZIP_BYTES = 16 * 1024 * 1024
MAX_INDEX_BYTES = 65536
PARTS_DIR = 'QUEUE.parts'
HEX = re.compile(r'[0-9a-f]{64}\Z')
NOFOLLOW = os.O_NOFOLLOW


def _sha(data):
    return hashlib.sha256(data).hexdigest()


def _pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f'duplicate JSON key: {key}')
        result[key] = value
    return result


def _parse(raw):
    def invalid(value):
        raise ValueError(f'non-finite JSON number: {value}')
    def finite(value):
        number = float(value)
        if not math.isfinite(number):
            invalid(value)
        return number
    try:
        return json.loads(raw.decode('utf-8'), object_pairs_hook=_pairs, parse_constant=invalid, parse_float=finite)
    except (UnicodeError, json.JSONDecodeError, RecursionError) as error:
        raise ValueError('invalid UTF-8 JSON') from error


def _queue(raw):
    value = _parse(raw)
    if not isinstance(value, dict) or not isinstance(value.get('items'), list) or not isinstance(value.get('statusVocabulary'), list):
        raise ValueError('invalid research queue object')
    try:
        validate_progress(value)
    except (KeyError, TypeError, AttributeError, RecursionError) as error:
        raise ValueError('invalid research queue structure') from error
    return value


@contextmanager
def _directory(path):
    """Walk with directory FDs and O_NOFOLLOW, including ancestor components."""
    path = Path(os.path.abspath(path))
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for component in path.parts[1:]:
            child = os.open(component, os.O_RDONLY | os.O_DIRECTORY | NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = child
        yield fd
    finally:
        os.close(fd)


@contextmanager
def _child_directory(parent, name):
    fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | NOFOLLOW, dir_fd=parent)
    try:
        yield fd
    finally:
        os.close(fd)


def _read(parent, name, maximum):
    fd = os.open(name, os.O_RDONLY | NOFOLLOW | os.O_NONBLOCK, dir_fd=parent)
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_size > maximum:
            raise ValueError('queue storage is not a bounded regular file')
        with os.fdopen(fd, 'rb', closefd=False) as source:
            data = source.read(maximum + 1)
        if len(data) > maximum:
            raise ValueError('queue storage size limit exceeded')
        return data
    finally:
        os.close(fd)


def _index(raw):
    value = _parse(raw)
    keys = {'storageFormat', 'partSize', 'rawBytes', 'rawSha256', 'gzipBytes', 'gzipSha256', 'parts'}
    if not isinstance(value, dict) or set(value) != keys or value['storageFormat'] != FORMAT:
        raise ValueError('unknown queue storage format; plain JSON fallback is forbidden')
    if type(value['partSize']) is not int or value['partSize'] != PART_SIZE:
        raise ValueError('invalid queue storage part size')
    for key, limit in [('rawBytes', MAX_RAW_BYTES), ('gzipBytes', MAX_GZIP_BYTES)]:
        if type(value[key]) is not int or not 0 < value[key] <= limit:
            raise ValueError('invalid queue storage size')
    for key in ['rawSha256', 'gzipSha256']:
        if not isinstance(value[key], str) or not HEX.fullmatch(value[key]):
            raise ValueError('invalid queue storage hash')
    parts = value['parts']
    if not isinstance(parts, list) or len(parts) != (value['gzipBytes'] + PART_SIZE - 1) // PART_SIZE:
        raise ValueError('missing or extra queue parts')
    for number, part in enumerate(parts):
        if not isinstance(part, dict) or set(part) != {'name', 'bytes', 'sha256'}:
            raise ValueError('unknown queue part schema')
        if not isinstance(part['sha256'], str) or not HEX.fullmatch(part['sha256']):
            raise ValueError('invalid queue part hash')
        if part['name'] != f'{number:06d}-{part["sha256"]}.gzpart':
            raise ValueError('invalid, reordered or traversing queue part name')
        expected = min(PART_SIZE, value['gzipBytes'] - number * PART_SIZE)
        if type(part['bytes']) is not int or part['bytes'] != expected:
            raise ValueError('wrong queue part size')
    return value


def _generation(parent, index):
    with _child_directory(parent, PARTS_DIR) as parts_fd:
        with _child_directory(parts_fd, index['gzipSha256']) as generation_fd:
            expected = {part['name'] for part in index['parts']}
            if set(os.listdir(generation_fd)) != expected:
                raise ValueError('missing or extra files in active queue generation')
            chunks = []
            for part in index['parts']:
                data = _read(generation_fd, part['name'], PART_SIZE)
                if len(data) != part['bytes'] or _sha(data) != part['sha256']:
                    raise ValueError('corrupted queue part size or SHA-256')
                chunks.append(data)
    compressed = b''.join(chunks)
    if len(compressed) != index['gzipBytes'] or _sha(compressed) != index['gzipSha256']:
        raise ValueError('corrupted gzip stream size or SHA-256')
    try:
        decoder = zlib.decompressobj(16 + zlib.MAX_WBITS)
        raw = decoder.decompress(compressed, index['rawBytes'] + 1)
        if not decoder.eof or decoder.unused_data or decoder.unconsumed_tail:
            raise ValueError('truncated, concatenated or oversized gzip stream')
    except zlib.error as error:
        raise ValueError('invalid gzip stream') from error
    if len(raw) != index['rawBytes'] or _sha(raw) != index['rawSha256']:
        raise ValueError('corrupted decoded queue size or SHA-256')
    _queue(raw)
    return raw


def load_queue_bytes(path=DEFAULT_QUEUE):
    """Return exact verified decoded bytes; reject unknown/broken storage."""
    path = Path(path)
    try:
        with _directory(path.parent) as parent:
            index = _index(_read(parent, path.name, MAX_INDEX_BYTES))
            return _generation(parent, index)
    except OSError as error:
        raise ValueError('queue storage missing, inaccessible or unsafe (symlinks forbidden)') from error


def load_queue(path=DEFAULT_QUEUE):
    return _queue(load_queue_bytes(path))


def _write_file(parent, name, data):
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | NOFOLLOW, 0o644, dir_fd=parent)
    try:
        with os.fdopen(fd, 'wb', closefd=False) as target:
            target.write(data)
            target.flush()
            os.fsync(fd)
    finally:
        os.close(fd)


def _publish(raw, parent, basename):
    """Caller holds parent-directory flock; no fallible writes follow replace."""
    _queue(raw)
    if not 0 < len(raw) <= MAX_RAW_BYTES:
        raise ValueError('queue raw size limit exceeded')
    compressed = gzip.compress(raw, compresslevel=9, mtime=0)
    if len(compressed) > MAX_GZIP_BYTES:
        raise ValueError('queue gzip size limit exceeded')
    index = {'storageFormat': FORMAT, 'partSize': PART_SIZE,
             'rawBytes': len(raw), 'rawSha256': _sha(raw),
             'gzipBytes': len(compressed), 'gzipSha256': _sha(compressed), 'parts': []}
    chunks = []
    for number, offset in enumerate(range(0, len(compressed), PART_SIZE)):
        data = compressed[offset:offset + PART_SIZE]
        name = f'{number:06d}-{_sha(data)}.gzpart'
        index['parts'].append({'name': name, 'bytes': len(data), 'sha256': _sha(data)})
        chunks.append(data)
    index_bytes = (json.dumps(index, indent=2) + '\n').encode('utf-8')
    _index(index_bytes)
    try:
        os.mkdir(PARTS_DIR, dir_fd=parent)
    except FileExistsError:
        pass
    with _child_directory(parent, PARTS_DIR) as parts_fd:
        generation = index['gzipSha256']
        if generation not in os.listdir(parts_fd):
            stage = '.stage-' + uuid.uuid4().hex
            os.mkdir(stage, dir_fd=parts_fd)
            try:
                with _child_directory(parts_fd, stage) as stage_fd:
                    for part, data in zip(index['parts'], chunks):
                        _write_file(stage_fd, part['name'], data)
                    os.fsync(stage_fd)
                os.rename(stage, generation, src_dir_fd=parts_fd, dst_dir_fd=parts_fd)
            finally:
                if stage in os.listdir(parts_fd):
                    with _child_directory(parts_fd, stage) as stage_fd:
                        for name in os.listdir(stage_fd):
                            os.unlink(name, dir_fd=stage_fd)
                    os.rmdir(stage, dir_fd=parts_fd)
        os.fsync(parts_fd)
    # Re-read all staged disk bytes, stream/hash/JSON/semantic checks before publish.
    if _generation(parent, index) != raw:
        raise ValueError('staged queue differs from proposed bytes')
    temporary = '.queue-index-' + uuid.uuid4().hex
    committed = False
    try:
        _write_file(parent, temporary, index_bytes)
        staged_index = _read(parent, temporary, MAX_INDEX_BYTES)
        if staged_index != index_bytes:
            raise ValueError('staged index differs from proposed bytes')
        _index(staged_index)
        os.fsync(parent)
        os.replace(temporary, basename, src_dir_fd=parent, dst_dir_fd=parent)
        committed = True
    finally:
        if not committed and temporary in os.listdir(parent):
            os.unlink(temporary, dir_fd=parent)
    return index


def write_queue_bytes(raw, path=DEFAULT_QUEUE, *, expected_raw_sha256=None):
    """Atomic update of existing indexed storage; old immutable generations stay.

    expected_raw_sha256 optionally rejects a stale read/modify/write. No reader
    or writer silently adopts a plain JSON queue. Use explicit migration once.
    """
    if not isinstance(raw, bytes):
        raise ValueError('write_queue_bytes requires UTF-8 bytes')
    path = Path(path)
    with _directory(path.parent) as parent:
        fcntl.flock(parent, fcntl.LOCK_EX)
        old = _index(_read(parent, path.name, MAX_INDEX_BYTES))
        _generation(parent, old)
        if expected_raw_sha256 is not None and old['rawSha256'] != expected_raw_sha256:
            raise ValueError('stale queue update: expected raw SHA-256 changed')
        return _publish(raw, parent, path.name)


def write_queue(value, path=DEFAULT_QUEUE, *, expected_raw_sha256=None):
    raw = (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n').encode('utf-8')
    return write_queue_bytes(raw, path, expected_raw_sha256=expected_raw_sha256)


def migrate_legacy_queue(path, *, expected_git_blob_sha, expected_raw_sha256):
    """One-time explicit conversion; exact legacy bytes must match frozen hashes."""
    path = Path(path)
    with _directory(path.parent) as parent:
        fcntl.flock(parent, fcntl.LOCK_EX)
        raw = _read(parent, path.name, MAX_RAW_BYTES)
        blob_sha = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
        if blob_sha != expected_git_blob_sha or _sha(raw) != expected_raw_sha256:
            raise ValueError('legacy queue does not match frozen Git blob and byte SHA-256')
        _queue(raw)
        return _publish(raw, parent, path.name)


def export_queue(path, output):
    """Export exact decoded bytes explicitly outside the canonical directory."""
    path, output = Path(path), Path(output)
    canonical = path.parent.resolve()
    destination = output.resolve()
    if destination == canonical or canonical in destination.parents:
        raise ValueError('export must be outside canonical queue directory')
    raw = load_queue_bytes(path)
    with _directory(output.parent) as parent:
        # Exclusive create also forbids overwriting an unrelated file or symlink.
        _write_file(parent, output.name, raw)
