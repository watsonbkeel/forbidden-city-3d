"""Compare complete TAP runs without relabelling pre-existing failures green."""
import gzip, hashlib, json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent

def read_run(name):
    path = root / name
    raw = path.read_bytes() if path.exists() else gzip.decompress((root / (name + ".gz")).read_bytes())
    text = raw.decode("utf-8")
    counts = {}
    for field in ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo', 'duration_ms']:
        matches = re.findall(r'^# ' + field + r' ([0-9.]+)$', text, re.M)
        if not matches:
            raise RuntimeError(f'{name}: no complete terminal footer for {field}')
        counts[field] = float(matches[-1]) if field == 'duration_ms' else int(matches[-1])
    failures = {}
    for match in re.finditer(r'^not ok \d+ - ([^\n]+)\n  ---\n(.*?)\n  \.\.\.$', text, re.M | re.S):
        title, body = match.group(1), match.group(2)
        location = re.search(r'^  location: [\'\"](.+?)[\'\"]$', body, re.M)
        location = location.group(1).split('/tests/', 1)[-1] if location else 'unknown'
        key = title + ' @ tests/' + location
        if key in failures:
            raise RuntimeError('Duplicate failure identity: ' + key)
        body = re.sub(r'^  duration_ms:.*\n', '', body, flags=re.M)
        body = re.sub(r'^  stack:.*', '', body, flags=re.M | re.S)
        body = re.sub(r'/tmp/fc-r50-[^/\s\'\"]+', '<snapshot>', body)
        failures[key] = {'title': title, 'location': 'tests/' + location, 'diagnostic': body.strip()}
    if len(failures) != counts['fail']:
        raise RuntimeError(f'{name}: parsed failures {len(failures)} != terminal {counts["fail"]}')
    return {'file': name, 'sha256': hashlib.sha256(raw).hexdigest(), 'counts': counts}, failures

base, old = read_run('baseline-full-sequential.tap')
current, new = read_run('candidate-full.tap')
common = sorted(old.keys() & new.keys())
changed = [key for key in common if old[key]['diagnostic'] != new[key]['diagnostic']]
result = {'baseline': base, 'candidate': current, 'addedFailureIdentities': sorted(new.keys() - old.keys()),
          'removedFailureIdentities': sorted(old.keys() - new.keys()), 'repeatedFailureIdentities': len(common),
          'changedDiagnosticIdentities': changed, 'changedDiagnostics': {key: {'baseline': old[key], 'candidate': new[key]} for key in changed},
          'statement': 'A matching failing identity is not a pass. Diagnostic changes are retained for review; no old test was rewritten.'}
(root / 'candidate-regression-comparison.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key != 'changedDiagnostics'}, ensure_ascii=False, indent=2))
