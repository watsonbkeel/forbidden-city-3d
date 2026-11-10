"""R262-only terminal-state recheck; the original parser/ownership/cleanup remain.

One extra stat read for an original rss_unknown row. Only a durably recorded,
matching PID/start terminal state can replace that row's state. No RSS, identity
or ownership field is erased. All inconclusive cases retain the original row.
"""
import json
from pathlib import Path

MAX_RECORDS = 128
MAX_RECORD_BYTES = 1024
MAX_EVIDENCE_BYTES = 128 * 1024

def install_exit_state_recheck(guard, evidence):
    original = guard.process_table
    journal = {'kind': 'r262-same-identity-terminal-recheck', 'rechecks': [],
               'counts': dict.fromkeys(('unknown', 'rejected', 'read_error', 'record_rejected', 'converted'), 0)}
    def process_table():
        table = original()  # Original errors and process disappearance propagate unchanged.
        for pid, row in table.items():
            if not row.get('rss_unknown'):
                continue
            journal['counts']['unknown'] += 1
            try:
                raw = Path(f'/proc/{pid}/stat').read_text()
                opening, closing = raw.find(' ('), raw.rfind(')')
                if opening < 1 or closing < opening + 2 or raw[closing+1:closing+2] != ' ':
                    raise ValueError('malformed stat framing')
                observed_pid = int(raw[:opening])
                fields = raw[closing+2:].split()
                observed_start, state = int(fields[19]), fields[0]
            except (OSError, ValueError, IndexError):
                journal['counts']['read_error'] += 1
                continue
            if observed_pid != pid or observed_pid != row['pid'] or observed_start != row['start'] or state not in ('Z', 'X'):
                journal['counts']['rejected'] += 1
                continue
            event = {'pid': pid, 'start': row['start'], 'old_state': row['state'],
                     'observed_pid': observed_pid, 'observed_start': observed_start,
                     'new_state': state, 'identity_match': True, 'rss_unknown_retained': True}
            proposed = {**journal, 'rechecks': [*journal['rechecks'], event],
                        'counts': {**journal['counts'], 'converted': journal['counts']['converted'] + 1}}
            if (len(journal['rechecks']) >= MAX_RECORDS or
                len(json.dumps(event).encode()) > MAX_RECORD_BYTES or
                len(json.dumps(proposed, indent=2).encode()) + 1 > MAX_EVIDENCE_BYTES):
                journal['counts']['record_rejected'] += 1
                continue
            try:
                guard.atomic_json(evidence, proposed)
            except OSError:
                journal['counts']['record_rejected'] += 1
                continue
            journal['rechecks'].append(event)
            journal['counts']['converted'] += 1
            table[pid] = {**row, 'state': state}
        return table
    guard.process_table = process_table
    return journal
