#!/usr/bin/env python3
"""Inventory every Node unit test without modifying or executing any test.

The partition is conservative: importing a historical helper is sufficient to
place a file in historical-or-mixed, even if some assertions in that file use
raw current modules. BOTH groups must run. Classification grants no exemption.
"""
import hashlib
import json
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[3]
destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
destination.mkdir(parents=True, exist_ok=True)
history_marker = re.compile(
    r"restore(?:Pre|R[0-9]|V[0-9])|historical[A-Za-z0-9]*ModuleURL|"
    r"Historical[A-Z]|readHistoricalSource|validate\w*SourceRegistry"
)
imports = re.compile(r"(?:from\s*|import\s*\(\s*|import\s*|require\s*\(\s*)['\"](\.[^'\"]+)['\"]")
manual_history = {
    'tests/r34-resource-evidence.test.mjs': 'Primarily validates stored R33/R34 resource receipts, not a fresh current resource census.',
    'tests/physical-route-wiring.test.cjs': 'Mixed current route wiring and an exact frozen V4 loop-body byte hash.',
}

dependency_cache = {}

def inspect_module(path):
    if path in dependency_cache:
        return dependency_cache[path]
    text = (root / path).read_text()
    dependencies = []
    for specifier in imports.findall(text):
        absolute = (root / path.parent / specifier).resolve()
        try:
            target = absolute.relative_to(root)
        except ValueError:
            continue
        if str(target).startswith('tests/') and target.suffix in {'.js', '.mjs', '.cjs'} and absolute.is_file():
            dependencies.append(target)
    result = (bool(history_marker.search(text)), dependencies)
    dependency_cache[path] = result
    return result

def historical_dependencies(path):
    pending, seen, found = [path], set(), set()
    while pending:
        current = pending.pop()
        if current in seen:
            continue
        seen.add(current)
        historical, dependencies = inspect_module(current)
        if historical:
            found.add(str(current))
        pending.extend(dependencies)
    return found

files = sorted({path.relative_to(root) for parent in [root / 'tests', root / 'tests/current-state']
                for pattern in ['*.test.mjs', '*.test.cjs'] for path in parent.glob(pattern)})
groups = {'direct-current': [], 'historical-or-mixed': []}
records = []
for path in files:
    name = str(path)
    reasons = sorted(historical_dependencies(path), key=lambda value: (len(value), value))
    category = 'historical-or-mixed' if reasons or name in manual_history else 'direct-current'
    groups[category].append(name)
    records.append({'path': name, 'group': category,
                    'sha256': hashlib.sha256((root / path).read_bytes()).hexdigest(),
                    'historicalDependencies': reasons,
                    **({'note': manual_history[name]} if name in manual_history else {})})

all_names = [str(path) for path in files]
assert sorted(groups['direct-current'] + groups['historical-or-mixed']) == all_names
assert not set(groups['direct-current']) & set(groups['historical-or-mixed'])
for name, members in {**groups, 'all-node-tests': all_names}.items():
    (destination / (name + '.txt')).write_text('\n'.join(members) + '\n')
(destination / 'regression-inventory.json').write_text(json.dumps({
    'schema': 1,
    'scope': 'Every *.test.mjs and *.test.cjs directly under tests/ and tests/current-state/',
    'classificationIsNotAnExemption': True,
    'notes': ['Both groups must run. Historical-or-mixed can contain raw current assertions.',
              'Per-assertion failure triage is required; an entire mixed file cannot be waived by this label.',
              'Dynamic imports constructed at runtime require human review; this is a conservative static inventory, not a semantic proof.',
              'Standalone browser scripts, Python suites, build and zone/anchor diagnostics are separate gates.'],
    'counts': {**{name: len(members) for name, members in groups.items()}, 'total': len(files)},
    'tests': records,
}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({name: len(members) for name, members in groups.items()} | {'total': len(files), 'output': str(destination)}))
