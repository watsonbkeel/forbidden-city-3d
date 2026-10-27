import subprocess,json,pathlib,statistics
root=pathlib.Path('.').resolve();dest=root/'reports/r112-interiors/cost';dest.mkdir(parents=True,exist_ok=True)
for pair in range(5):
 for version in (['baseline','candidate'] if pair%2==0 else ['candidate','baseline']):
  source=root.parent/'r110-performance-movement-major' if version=='baseline' else root
  subprocess.run(['node','scripts/r112-interiors/cost-process.mjs',str(source),str(dest/f'pair-{pair+1}-{version}.json')],check=True)
  print(pair+1,version,flush=True)
rows={v:[json.loads((dest/f'pair-{i}-{v}.json').read_text()) for i in range(1,6)] for v in ['baseline','candidate']}
def p(a,q):return sorted(a)[max(0,__import__('math').ceil(len(a)*q)-1)]
out={'protocol':'10 fresh processes alternating order; actual rear-palace fragment, 600 controlled FP frames per path; all raw retained','summary':{}}
for v,rs in rows.items():
 out['summary'][v]={'buildMs':[r['buildMs'] for r in rs],'registerMs':[r['registerMs'] for r in rs],'disposeMs':[r['disposeMs'] for r in rs],'resource':rs[0]['resource'],'paths':{}}
 for j,probe in enumerate(rs[0]['probes']):
  samples=[n for r in rs for n in r['probes'][j]['samples'][120:]]
  out['summary'][v]['paths'][probe['name']]={'p50':p(samples,.5),'p95':p(samples,.95),'p99':p(samples,.99),'max':max(samples),'firstFrameMs':[r['probes'][j]['samples'][0] for r in rs],'allPeak':max(n for r in rs for n in r['probes'][j]['samples'])}
(dest/'summary.json').write_text(json.dumps(out,indent=2)+'\n')
