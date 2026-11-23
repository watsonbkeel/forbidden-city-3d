"""Verify case identity, class partition and counts against the previous checkpoint."""
from collections import Counter
import csv
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
previous = folder.parent / 'followup' / 'triage'

def rows(path):
    with path.open(encoding='utf-8', newline='') as stream:
        return list(csv.DictReader(stream))

old = {int(row['id']): row for path in previous.glob('*.csv') for row in rows(path)
       if row['followup'] == 'still-fails'}
cases = [row for name in ('product', 'unknown', 'test_or_reference')
         for row in rows(folder / (name + '.csv'))]
assert len(old) == len(cases) == len({int(row['id']) for row in cases}) == 301
for row in cases:
    original = old[int(row['id'])]
    assert (row['file'], row['name']) == (original['location'], original['name'])
    assert row['evidence'] and row['finalSuite'] in ('passes', 'still-fails')
report = json.loads((folder / 'suite.json').read_text())
assert Counter(row['classification'] for row in cases) == report['primaryClasses']
assert Counter(row['classification'] for row in cases if row['finalSuite'] == 'still-fails') == report['finalStillFailedByClass']
assert sum(row['finalSuite'] == 'passes' for row in cases) == sum(case['count'] for case in report['resolved'])
assert sum(row['finalSuite'] == 'still-fails' for row in cases) + sum(case['count'] for case in report['newFailures']) == report['finalSuite']['fail']
print('PASS: all 301 inherited IDs, original names, class partitions, final outcomes and newly failing name counts reconcile.')
