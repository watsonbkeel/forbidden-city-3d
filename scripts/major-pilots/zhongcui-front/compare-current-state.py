"""Compare full executions; timings are not failure identities."""
import json
import pathlib
import re

root = pathlib.Path('reports/major-pilots/zhongcui-front')
parent = pathlib.Path('reports/major-pilots/jingyang-front/current-state.log')

def parse(path):
    text = path.read_text()
    summary = {key: int(re.search(r'^ℹ ' + key + r' (\d+)$', text, re.M)[1])
               for key in ['tests', 'pass', 'fail', 'cancelled', 'skipped']}
    failures = text.split('✖ failing tests:', 1)[1]
    names = [re.sub(r' \([\d.]+ms\)$', '', line[2:])
             for line in failures.splitlines() if line.startswith('✖ ')]
    locations = [line[8:] for line in failures.splitlines() if line.startswith('test at ')]
    assert len(names) == len(locations) == summary['fail']
    return {'summary': summary, 'failedNames': names, 'failedLocations': locations}

p, c = parse(parent), parse(root / 'current-state.log')
result = {'parentCommit': '9f2d0c08c399a33e115a11acdb84782b5409e86f',
          'parentReceipt': str(parent), 'parent': p, 'candidate': c,
          'sameSummary': p['summary'] == c['summary'],
          'sameFailedNames': p['failedNames'] == c['failedNames'],
          'sameFailedLocations': p['failedLocations'] == c['failedLocations']}
(root / 'aggregate-parent-comparison.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['parent', 'candidate']}, ensure_ascii=False))
print('parent', p['summary'], 'candidate', c['summary'])
assert result['sameSummary'] and result['sameFailedNames'] and result['sameFailedLocations']
