# Canonical research queue storage

`QUEUE.json` remains the sole authoritative entry point, but is now an explicitly
versioned **storage index**, not the decoded queue object. Its selected gzip
stream is split into ordered, immutable, content-addressed binary parts under
`QUEUE.parts/<gzipSha256>/`. Every part is at most 120,000 bytes. No raw JSON
mirror or automatic raw fallback exists. Runtime actors, world inputs, source
photos/PDFs, and release snapshots are not compressed or changed by this migration.

## Read and export

All readers use `scripts/photo-fidelity/queue_storage.py`; the CLI, structural
validator, Python safeguards and Node queue-binding test use that same loader.
The original commands remain valid:

```sh
python -B scripts/photo-fidelity/queue.py stats
python -B scripts/photo-fidelity/queue.py next --section A --limit 5
python -B scripts/photo-fidelity/queue.py show --id FC-9252CFFDAB
python -B scripts/photo-fidelity/queue.py validate-progress
python -B scripts/photo-fidelity/validate.py
python -B -m unittest discover -s tests/photo-fidelity -v
node --test tests/current-state/r58-queue-bindings.test.mjs
```

`queue.py read` prints the decoded logical object to stdout for programmatic
consumers. It does not materialize or rewrite canonical files. For byte-exact
export, provide a new destination outside the canonical directory:

```sh
python -B scripts/photo-fidelity/queue.py export --output /tmp/r58-queue-export.json
```

Export refuses an existing destination, symlink ancestry, or anything within
`docs/photo-fidelity/`. Exported files are noncanonical scratch data: do not commit
them or feed them back as `--queue`. Remove scratch exports after use. To consume
a different queue, `--queue` must name another valid storage index, not raw JSON.

## Owner update API

Use Python 3 on the existing POSIX environment; only the standard library is
required. Do not edit index hashes or parts manually. The public API is:

- `load_queue(path=DEFAULT_QUEUE) -> dict`
- `load_queue_bytes(path=DEFAULT_QUEUE) -> bytes` (exact verified UTF-8 bytes)
- `write_queue(value, path=DEFAULT_QUEUE, expected_raw_sha256=None) -> index`
- `write_queue_bytes(raw, path=DEFAULT_QUEUE, expected_raw_sha256=None) -> index`
- `export_queue(path, output)` (exclusive, explicit noncanonical output)

Example for the integration owner, after deciding the authorized field changes:

```python
import hashlib, json, sys
sys.path.insert(0, 'scripts/photo-fidelity')
from queue_storage import load_queue_bytes, write_queue

raw = load_queue_bytes()
queue = json.loads(raw)
# Apply only authorized queue field/status updates to queue here.
write_queue(queue, expected_raw_sha256=hashlib.sha256(raw).hexdigest())
```

The stale-write guard rejects an intervening update without replacing its index.
Normal object writes use UTF-8, `ensure_ascii=False`, indent 2 and a trailing
newline. `write_queue_bytes` preserves the caller's exact valid serialized bytes.
Both apply the unchanged progress invariants before publishing. The owner must
continue synchronizing derived release snapshots after an actual content update;
this storage-only commit does not alter those snapshots or acceptance statuses.

## Format and atomicity

Format: `photo-fidelity-queue/gzip-parts-v1`.

The index declares the exact raw/gzip byte counts and SHA-256 values, the fixed
120,000-byte part size, and an ordered list of part names, sizes and SHA-256
values. Part names are exactly `<six-digit-order>-<sha256>.gzpart`; the enclosing
generation is the gzip SHA-256. There is one gzip member, compressed at level 9
with `mtime=0`. The loader rejects unknown fields/formats, reordered or duplicate
entries, missing/extra active-generation files, unsafe paths, symlinks at any
ancestor, nonregular files, size/hash mismatches, malformed/trailing/concatenated
gzip, invalid UTF-8/JSON, duplicate JSON keys and non-finite numbers. It bounds
raw bytes to 64 MiB, compressed bytes to 16 MiB and index bytes to 64 KiB.

Writers lock the containing directory, validate existing authority, create new
immutable parts in a staging directory, flush them, atomically rename the new
generation, and reread every stored byte through all integrity and semantic
checks. A validated, flushed temporary index is atomically replaced **last**.
Before replacement, any failure leaves the previous index and its immutable parts
readable. No cleanup or other fallible filesystem work follows a successful
replacement. There is no post-replacement directory fsync: publication guarantees
atomic visibility, not that the newest pointer survives a sudden power loss;
a recovery may retain the previous valid pointer. Previous generations are not
rewritten or garbage-collected and remain available for explicit rollback.
Orphan parts from interrupted work are not authorities and are never read as
fallback. Corrupt immutable generations fail closed rather than being overwritten.

## Initial migration proof

`QUEUE-STORAGE-MIGRATION.json` is a small **historical proof**, not a second
current index and never a loader input. It records the frozen source commit and
Git blob, raw bytes SHA-256, gzip SHA-256, every part SHA-256 and initial format.
The migration compared canonical bytes to `git cat-file blob` before conversion,
then proved exact byte equality and deep object equality for every field after
loading. Preserved scope: 398 original stable IDs, 618 original A feature entries
and 564 total research tasks. The wider A section has additional instance-review
features; the 618 count applies to the 37 original A objects.

The one-time `migrate_legacy_queue(path, expected_git_blob_sha=...,
expected_raw_sha256=...)` API requires both frozen hashes and is deliberately
separate from ordinary reads/writes. It is not an automatic fallback or a command
to rerun over a progressed indexed queue.

## Rollback

1. For a later content update, restore `QUEUE.json` from the desired indexed Git
   revision together with its referenced `QUEUE.parts/<gzipSha256>/` files. Leave
   unrelated production files alone. Readers select only that restored index.
   Then run `queue.py validate-progress` and the queue tests. Historical storage
   generations are retained so a saved prior index still resolves.
2. To undo this initial storage-only migration before any later queue edits,
   revert its dedicated commit. That restores the exact original raw `QUEUE.json`
   and all original readers together. Do not restore raw JSON while keeping the
   new loader. After later queue edits, first export the current queue outside
   canonical storage and coordinate a content-preserving migration reversal;
   blindly reverting old content would lose subsequent progress.
3. Never use `QUEUE-STORAGE-MIGRATION.json`, the out-of-tree planning export or a
   release snapshot as an alternative progress authority. The planner remains
   read-only. Never delete old generations until rollback retention is explicitly
   resolved.

Storage checks do not establish geometry/build/browser acceptance. The original
29 structural/provenance checks and 8 semantic safeguards are unchanged. Private
source-image hash checks in `validate.py` still require the existing local cache;
portable `queue.py validate-progress` does not require that cache.
