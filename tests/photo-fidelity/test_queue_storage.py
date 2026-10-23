"""Lossless storage and fail-closed publication tests; scratch data stays in /tmp."""
import copy
import gzip
import hashlib
import importlib.util
import json
import pathlib
import random
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/photo-fidelity'))
SPEC = importlib.util.find_spec('queue_storage')
store = importlib.util.module_from_spec(SPEC) if SPEC else None
if SPEC:
    SPEC.loader.exec_module(store)

FORMAT = 'photo-fidelity-queue/gzip-parts-v1'
PART_SIZE = 120000


def sha(data):
    return hashlib.sha256(data).hexdigest()


def fixture(path, raw):
    """Independent format encoder: loader tests do not trust the writer."""
    compressed = gzip.compress(raw, compresslevel=9, mtime=0)
    generation = path.parent / 'QUEUE.parts' / sha(compressed)
    generation.mkdir(parents=True, exist_ok=True)
    parts = []
    for number, start in enumerate(range(0, len(compressed), PART_SIZE)):
        data = compressed[start:start + PART_SIZE]
        name = f'{number:06d}-{sha(data)}.gzpart'
        (generation / name).write_bytes(data)
        parts.append({'name': name, 'bytes': len(data), 'sha256': sha(data)})
    index = {'storageFormat': FORMAT, 'partSize': PART_SIZE,
             'rawBytes': len(raw), 'rawSha256': sha(raw),
             'gzipBytes': len(compressed), 'gzipSha256': sha(compressed),
             'parts': parts}
    path.write_text(json.dumps(index), encoding='utf-8')
    return index, generation


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(store, 'common queue_storage loader/writer is not implemented')
        self.tmp = tempfile.TemporaryDirectory(prefix='r58-queue-storage-')
        self.addCleanup(self.tmp.cleanup)
        self.path = pathlib.Path(self.tmp.name) / 'canonical' / 'QUEUE.json'
        self.path.parent.mkdir()
        self.data = {'items': [], 'statusVocabulary': ['UNREVIEWED', 'ACCEPTED'], 'note': '紫禁城 🏯 café'}
        self.raw = (json.dumps(self.data, ensure_ascii=False, indent=3) + '\n').encode()
        self.index, self.generation = fixture(self.path, self.raw)

    def write_index(self, index):
        self.path.write_text(json.dumps(index), encoding='utf-8')

    def assert_bad(self):
        with self.assertRaises(ValueError):
            store.load_queue(self.path)

    def test_exact_original_bytes_and_unicode_object(self):
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)
        self.assertEqual(store.load_queue(self.path), self.data)

    def test_raw_json_is_never_a_fallback(self):
        self.path.write_bytes(self.raw)
        self.assert_bad()

    def test_unknown_format_and_extra_index_fields_fail(self):
        for key, value in [('storageFormat', 'future-v2'), ('unexpected', True)]:
            with self.subTest(key=key):
                index = copy.deepcopy(self.index); index[key] = value
                self.write_index(index); self.assert_bad()

    def test_missing_extra_and_reordered_parts_fail(self):
        rng = random.Random(58)
        data = dict(self.data, noise=''.join(chr(rng.randrange(0x400, 0x1000)) for _ in range(180000)))
        raw = json.dumps(data, ensure_ascii=False).encode()
        index, generation = fixture(self.path, raw)
        self.assertGreater(len(index['parts']), 1)
        self.assertEqual(store.load_queue_bytes(self.path), raw)
        for parts in [index['parts'][:-1], index['parts'] + [index['parts'][0]], list(reversed(index['parts']))]:
            with self.subTest(parts=len(parts)):
                broken = dict(index, parts=parts); self.write_index(broken); self.assert_bad()
        self.write_index(index)
        extra = generation / 'unlisted.gzpart'; extra.write_bytes(b'extra')
        self.assert_bad(); extra.unlink()
        part = generation / index['parts'][0]['name']; part.unlink()
        self.assert_bad()

    def test_corruption_wrong_sizes_and_hashes_fail(self):
        for key, value in [('rawBytes', len(self.raw) + 1), ('rawSha256', '0' * 64),
                           ('gzipBytes', self.index['gzipBytes'] + 1), ('gzipSha256', '0' * 64),
                           ('partSize', PART_SIZE + 1)]:
            with self.subTest(key=key):
                broken = dict(self.index); broken[key] = value
                self.write_index(broken); self.assert_bad()
        for key, value in [('bytes', 1), ('sha256', '0' * 64)]:
            broken = copy.deepcopy(self.index); broken['parts'][0][key] = value
            self.write_index(broken); self.assert_bad()
        self.write_index(self.index)
        part = self.generation / self.index['parts'][0]['name']
        data = bytearray(part.read_bytes()); data[-1] ^= 1; part.write_bytes(data)
        self.assert_bad()

    def test_invalid_json_duplicate_keys_and_nan_fail(self):
        for raw in [b'not json', b'\xff', b'{"items":[],"items":[],"statusVocabulary":[]}',
                    b'{"items":[],"statusVocabulary":[],"x":NaN}']:
            with self.subTest(raw=raw):
                fixture(self.path, raw); self.assert_bad()
        self.path.write_text('{"storageFormat":"x","storageFormat":"y"}')
        self.assert_bad()

    def test_exponent_overflow_is_rejected_instead_of_emitting_infinity(self):
        for number in [b'1e999', b'-1e999']:
            with self.subTest(number=number):
                raw = b'{"items":[],"statusVocabulary":[],"x":' + number + b'}'
                fixture(self.path, raw)
                self.assert_bad()

    def test_traversal_absolute_names_and_symlinks_fail(self):
        for name in ['../outside', '/tmp/outside', 'x/../../outside']:
            broken = copy.deepcopy(self.index); broken['parts'][0]['name'] = name
            self.write_index(broken); self.assert_bad()
        self.write_index(self.index)
        part = self.generation / self.index['parts'][0]['name']
        outside = pathlib.Path(self.tmp.name) / 'outside'; outside.write_bytes(part.read_bytes())
        part.unlink(); part.symlink_to(outside); self.assert_bad()
        part.unlink(); part.write_bytes(outside.read_bytes())
        renamed = self.generation.with_name('saved'); self.generation.rename(renamed)
        self.generation.symlink_to(renamed, target_is_directory=True); self.assert_bad()
        self.generation.unlink(); renamed.rename(self.generation)
        index_outside = pathlib.Path(self.tmp.name) / 'index'; self.path.rename(index_outside)
        self.path.symlink_to(index_outside); self.assert_bad()

    def test_invalid_progress_never_publishes(self):
        original = self.path.read_bytes()
        bad = copy.deepcopy(self.data)
        row = {'id': 'FC-A-001', 'facets': {'exterior': {'status': 'ACCEPTED'}}}
        bad['items'] = [row]
        with self.assertRaisesRegex(ValueError, 'browser'):
            store.write_queue(bad, self.path)
        self.assertEqual(self.path.read_bytes(), original)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)

    def test_write_roundtrip_retains_old_parts_and_supports_exact_bytes(self):
        old_index = self.path.read_bytes()
        changed = dict(self.data, note='新文字 🐉\nΔ')
        store.write_queue(changed, self.path)
        self.assertEqual(store.load_queue(self.path), changed)
        self.assertTrue(self.generation.is_dir())
        store.write_queue_bytes(self.raw, self.path)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)
        # Restoring a saved index selects old immutable bytes without regeneration.
        self.path.write_bytes(old_index)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)

    def test_index_replace_failure_keeps_previous_authority(self):
        old_index = self.path.read_bytes()
        with mock.patch.object(store.os, 'replace', side_effect=OSError('injected replace failure')):
            with self.assertRaisesRegex(OSError, 'injected'):
                store.write_queue(dict(self.data, note='new'), self.path)
        self.assertEqual(self.path.read_bytes(), old_index)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)
        self.assertFalse(list(self.path.parent.glob('.queue-index-*')))
        self.assertFalse(list((self.path.parent / 'QUEUE.parts').glob('.stage-*')))

    def test_stage_failure_keeps_previous_authority(self):
        old_index = self.path.read_bytes()
        with mock.patch.object(store.os, 'fsync', side_effect=OSError('injected fsync failure')):
            with self.assertRaisesRegex(OSError, 'injected'):
                store.write_queue(dict(self.data, note='new'), self.path)
        self.assertEqual(self.path.read_bytes(), old_index)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)
        self.assertFalse(list((self.path.parent / 'QUEUE.parts').glob('.stage-*')))

    def test_export_is_exact_explicit_and_never_canonical(self):
        output = pathlib.Path(self.tmp.name) / 'export.json'
        store.export_queue(self.path, output)
        self.assertEqual(output.read_bytes(), self.raw)
        with self.assertRaises((ValueError, FileExistsError)):
            store.export_queue(self.path, output)
        for target in [self.path, self.path.parent / 'mirror.json', self.generation / 'raw.json']:
            with self.subTest(target=target), self.assertRaises(ValueError):
                store.export_queue(self.path, target)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)

    def test_successful_publication_has_no_fallible_post_replace_filesystem_work(self):
        actual_replace, actual_listdir = store.os.replace, store.os.listdir
        committed = False
        def replace(*args, **kwargs):
            nonlocal committed
            result = actual_replace(*args, **kwargs); committed = True
            return result
        def listdir(*args, **kwargs):
            if committed:
                raise OSError('post-publication filesystem access')
            return actual_listdir(*args, **kwargs)
        with mock.patch.object(store.os, 'replace', side_effect=replace), \
                mock.patch.object(store.os, 'listdir', side_effect=listdir):
            store.write_queue(dict(self.data, note='new'), self.path)
        self.assertEqual(store.load_queue(self.path)['note'], 'new')

    def test_stale_write_is_rejected_without_replacing_the_index(self):
        old_index = self.path.read_bytes()
        with self.assertRaisesRegex(ValueError, 'stale'):
            store.write_queue(dict(self.data, note='new'), self.path, expected_raw_sha256='0' * 64)
        self.assertEqual(self.path.read_bytes(), old_index)
        store.write_queue(dict(self.data, note='new'), self.path, expected_raw_sha256=sha(self.raw))
        self.assertEqual(store.load_queue(self.path)['note'], 'new')

    def test_valid_schema_staged_index_corruption_keeps_previous_authority(self):
        old_index = self.path.read_bytes()
        actual_write = store._write_file
        def corrupt(parent, name, data):
            if name.startswith('.queue-index-'):
                altered = json.loads(data); altered['gzipSha256'] = '0' * 64
                data = json.dumps(altered).encode()
            actual_write(parent, name, data)
        with mock.patch.object(store, '_write_file', side_effect=corrupt):
            with self.assertRaisesRegex(ValueError, 'staged index'):
                store.write_queue(dict(self.data, note='new'), self.path)
        self.assertEqual(self.path.read_bytes(), old_index)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)

    def test_staged_corruption_never_replaces_the_index(self):
        old_index = self.path.read_bytes()
        actual_write = store._write_file
        def corrupt(parent, name, data):
            actual_write(parent, name, b'broken' if name.endswith('.gzpart') else data)
        with mock.patch.object(store, '_write_file', side_effect=corrupt):
            with self.assertRaisesRegex(ValueError, 'corrupted'):
                store.write_queue(dict(self.data, note='new'), self.path)
        self.assertEqual(self.path.read_bytes(), old_index)
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)

    def test_gzip_trailer_concatenation_invalid_crc_and_bomb_are_rejected(self):
        valid = gzip.compress(self.raw, compresslevel=9, mtime=0)
        for compressed, raw_size in [(valid + b'trailer', len(self.raw)),
                                     (valid + valid, len(self.raw) * 2),
                                     (valid[:-1] + bytes([valid[-1] ^ 1]), len(self.raw)),
                                     (gzip.compress(b'A' * 100000), 10)]:
            with self.subTest(size=len(compressed)):
                generation = self.path.parent / 'QUEUE.parts' / sha(compressed)
                generation.mkdir(exist_ok=True)
                name = '000000-' + sha(compressed) + '.gzpart'
                (generation / name).write_bytes(compressed)
                index = dict(self.index, gzipBytes=len(compressed), gzipSha256=sha(compressed), rawBytes=raw_size,
                             parts=[{'name': name, 'bytes': len(compressed), 'sha256': sha(compressed)}])
                self.write_index(index); self.assert_bad()

    def test_storage_root_and_ancestor_symlinks_fail(self):
        parts = self.path.parent / 'QUEUE.parts'
        renamed = self.path.parent / 'saved-parts'; parts.rename(renamed)
        parts.symlink_to(renamed, target_is_directory=True); self.assert_bad()
        parts.unlink(); renamed.rename(parts)
        alias = pathlib.Path(self.tmp.name) / 'alias'
        alias.symlink_to(self.path.parent, target_is_directory=True)
        with self.assertRaises(ValueError):
            store.load_queue(alias / self.path.name)

    def test_initial_migration_is_explicit_and_hash_guarded(self):
        self.path.write_bytes(self.raw)
        git_blob = hashlib.sha1(b'blob ' + str(len(self.raw)).encode() + b'\0' + self.raw).hexdigest()
        with self.assertRaises(ValueError):
            store.migrate_legacy_queue(self.path, expected_git_blob_sha='0' * 40,
                                       expected_raw_sha256=sha(self.raw))
        self.assertEqual(self.path.read_bytes(), self.raw)
        store.migrate_legacy_queue(self.path, expected_git_blob_sha=git_blob,
                                   expected_raw_sha256=sha(self.raw))
        self.assertEqual(store.load_queue_bytes(self.path), self.raw)
        with self.assertRaises(ValueError):
            store.migrate_legacy_queue(self.path, expected_git_blob_sha=git_blob,
                                       expected_raw_sha256=sha(self.raw))

    def test_cli_read_and_export_share_the_loader(self):
        command = [sys.executable, '-B', str(ROOT / 'scripts/photo-fidelity/queue.py')]
        out = subprocess.run(command + ['read', '--queue', str(self.path)], capture_output=True)
        self.assertEqual(out.returncode, 0, out.stderr.decode())
        self.assertEqual(json.loads(out.stdout), self.data)
        output = pathlib.Path(self.tmp.name) / 'cli-export.json'
        out = subprocess.run(command + ['export', '--queue', str(self.path), '--output', str(output)], capture_output=True)
        self.assertEqual(out.returncode, 0, out.stderr.decode())
        self.assertEqual(output.read_bytes(), self.raw)
        self.path.write_bytes(self.raw)
        out = subprocess.run(command + ['read', '--queue', str(self.path)], capture_output=True)
        self.assertNotEqual(out.returncode, 0)


if __name__ == '__main__':
    unittest.main()
