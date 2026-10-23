#!/usr/bin/env python3
"""Read-only queries over the single canonical research queue, never runtime data."""
import argparse,collections,json,pathlib
from queue_invariants import validate_progress
from queue_storage import load_queue, write_queue, export_queue
ROOT=pathlib.Path(__file__).resolve().parents[2]
DEFAULT_QUEUE=ROOT/'docs/photo-fidelity/QUEUE.json'

def summarize(q):
 items=q['items'];original=[x for x in items if x['id'].startswith('FC-')]
 counts={s:{'originalObjects':sum(x['section']==s for x in original),
            'supplementaryAudits':sum(x['section']==s and x['id'].startswith('AUX') for x in items),
            'bothFacetsAccepted':sum(x['section']==s and all(f['status']=='ACCEPTED' for f in x['facets'].values()) for x in original)} for s in 'ABCDEFGHIJKLM'}
 return {'originalObjects':len(original),'supplementaryAudits':sum(x['id'].startswith('AUX') for x in items),
         'existingInstanceReviews':sum(bool(x.get('runtimeInstanceKey')) for x in items),
         'totalResearchTasks':len(items),'expansionTasks':len(q['expansionTasks']),
         'physicalBuildingCount':None,'sections':counts,
         'facetStatuses':{k:dict(collections.Counter(x['facets'][k]['status'] for x in items)) for k in ['exterior','interior']},
         'objectsWithActualChanges':sum(bool(x.get('actualChanges')) for x in items),
         'bothFacetsAccepted':sum(all(f['status']=='ACCEPTED' for f in x['facets'].values()) for x in items),
         'note':'Research tasks and parent groups are not a count of physical palaces. CPU geometry is not browser visual acceptance.'}


def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('command',choices=['stats','next','show','validate-progress','read','export'])
 p.add_argument('--output',type=pathlib.Path);p.add_argument('--queue',type=pathlib.Path,default=DEFAULT_QUEUE);p.add_argument('--section',choices=list('ABCDEFGHIJKLM'));p.add_argument('--limit',type=int,default=5);p.add_argument('--id');p.add_argument('--include-owned',action='store_true');a=p.parse_args()
 q=load_queue(a.queue);validate_progress(q)
 if a.command=='export':
  if a.output is None:p.error('export requires --output outside the canonical directory')
  export_queue(a.queue,a.output);return
 if a.command=='read':
  print(json.dumps(q,ensure_ascii=False));return
 if a.command=='stats':out=summarize(q)
 elif a.command=='validate-progress':out={'status':'PASS','scope':'queue progress invariants, not model acceptance'}
 elif a.command=='show':
  out=[x for x in q['items'] if x['id']==a.id]
  if not out:raise SystemExit(1)
 else:
  todo=[x for x in q['items'] if (not a.section or x['section']==a.section) and not x['optional'] and any(f['status'] not in ['ACCEPTED','NOT_APPLICABLE'] for f in x['facets'].values()) and (a.include_owned or x.get('activeWork',{}).get('state')!='IN_PROGRESS')]
  out=[{'id':x['id'],'name':x['name'],'release':x['release'],'exterior':x['facets']['exterior']['status'],'interior':x['facets']['interior']['status'],'action':x['nextAction']} for x in sorted(todo,key=lambda x:x['priority'])[:a.limit]]
 print(json.dumps(out,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
