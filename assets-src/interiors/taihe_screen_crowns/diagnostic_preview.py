"""CPU-only orthographic geometry diagnostics, never runtime visual acceptance.

Pass the source-derived diagnostic face map produced by derive_retirement.py.
No spatial filtering, remote images, browser, GPU, textures or scene changes.
"""
import argparse
import json
import math
import os
from pathlib import Path
import struct
import sys
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent))
from append_taihe_caisson import unpack_glb,sha
from taihe_screen_crowns.derive_retirement import BASE_PATH,BASE_SHA256
from taihe_screen_crowns.geometry import build_candidate
from taihe_screen_crowns.retire import retire_screen_headers

def decoded(data):
    gltf,binary=unpack_glb(data);out={}
    for mesh in gltf['meshes']:
        for p in mesh['primitives']:
            name=gltf['materials'][p['material']]['name'];ia=gltf['accessors'][p['indices']];iv=gltf['bufferViews'][ia['bufferView']];pa=gltf['accessors'][p['attributes']['POSITION']];pv=gltf['bufferViews'][pa['bufferView']]
            ids=struct.unpack_from('<'+{5123:'H',5125:'I'}[ia['componentType']]*ia['count'],binary,iv.get('byteOffset',0));positions=struct.unpack_from('<'+'f'*pa['count']*3,binary,pv.get('byteOffset',0));pos=list(zip(*[iter(positions)]*3))
            out[name]=[tuple(pos[j] for j in ids[k:k+3]) for k in range(0,len(ids),3)]
    return out

def generate(output,face_map,crown_style='outline'):
    os.environ.setdefault('MPLCONFIGDIR','/tmp/taihe-crown-mpl');os.environ.setdefault('XDG_CACHE_HOME','/tmp/taihe-crown-cache')
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.collections import PolyCollection
    from matplotlib.patches import Circle
    base=BASE_PATH.read_bytes();selection=json.loads(face_map.read_bytes())
    if sha(base)!=BASE_SHA256 or selection['baselineSHA256']!=BASE_SHA256:raise ValueError('Unknown preview baseline')
    profile=json.loads((HERE.parents[2]/'data/architecture/taihe-core.json').read_bytes());m=build_candidate(profile,crown_style=crown_style)
    mask=json.loads((HERE/'retired_screen_header_faces.json').read_bytes());retired={(r['material'],r['triangleOrdinal']) for r in mask['triangles']};tris=decoded(base)
    baseline=[(tris[r['material']][r['triangleOrdinal']],r['material'],r['part']) for r in selection['triangles']]
    candidate=[(tris[r['material']][r['triangleOrdinal']],r['material'],r['part']) for r in selection['triangles'] if (r['material'],r['triangleOrdinal']) not in retired]
    ownership={j:name for name,faces in m['parts'].items() for j in faces}
    candidate += [(tuple(m['vertices'][j] for j in f),{'red':'taihe_lacquer','gold':'taihe_gold','darkGold':'taihe_dark_gold'}[m['materials'][i]],ownership[i]) for i,f in enumerate(m['triangles'])]
    palette={'taihe_gold':(0.65,.49,.24),'taihe_dark_gold':(.35,.24,.10),'taihe_lacquer':(.26,.07,.05)}
    def draw(ax,rows,angle=0,xlim=(-2.18,2.18),ylim=(1.98,5.98),apertures=False):
        theta=math.radians(angle);co=math.cos(theta);si=math.sin(theta)
        def projected(p): return (co*p[0]-si*(p[2]-13.5),p[1],si*p[0]+co*(p[2]-13.5))
        sorted_rows=sorted(rows,key=lambda row:sum(projected(p)[2] for p in row[0])/3,reverse=True)
        polygons=[];colors=[]
        for tri,material,part in sorted_rows:
            projected_points=[projected(p) for p in tri];polygons.append([(p[0],p[1]) for p in projected_points]);a,b,c=tri
            u=tuple(b[k]-a[k] for k in range(3));v=tuple(c[k]-a[k] for k in range(3));n=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]);length=math.sqrt(sum(x*x for x in n));shade=.66+.34*abs((-.3*n[0]+.5*n[1]-.8*n[2])/length)
            colors.append(tuple(min(1,c*shade) for c in palette[material]))
        ax.add_collection(PolyCollection(polygons,facecolors=colors,edgecolors='none',antialiased=False))
        ax.set(xlim=xlim,ylim=ylim,aspect='equal');ax.set_facecolor('#e1e0d7');ax.set_xlabel('Estimated hall-local metres');ax.set_ylabel('Hall-local Y')
        if apertures:
            for l in m['metadata']['leaves']:
                for p in l['apertures']:ax.add_patch(Circle((p['x'],p['y']),p['radius'],fill=False,color='#00a3c2',linewidth=1))
    output.mkdir(parents=True,exist_ok=True)
    for angle,name in ((0,'front'),(28,'oblique')):
        fig,axes=plt.subplots(1,2,figsize=(14,8));draw(axes[0],baseline,angle);draw(axes[1],candidate,angle)
        axes[0].set_title('Frozen baseline: solid small apexes');axes[1].set_title('Candidate: broader central open crown + paired flanks')
        fig.suptitle(f'CPU orthographic {name} geometry diagnostic. Not a browser render or visual acceptance.',fontsize=13);fig.tight_layout();fig.savefig(output/f'{name}-before-after.png',dpi=150);plt.close(fig)
    fig,axes=plt.subplots(2,1,figsize=(15,8))
    draw(axes[0],baseline,0,ylim=(4.32,5.98));draw(axes[1],candidate,0,ylim=(4.32,5.98),apertures=True)
    axes[0].set_title('Baseline upper silhouettes');axes[1].set_title('Candidate upper silhouettes; cyan disks are verified open rays')
    fig.suptitle('CPU crown diagnostic: all widths, paths and header dimensions remain authoring estimates.',fontsize=13);fig.tight_layout();fig.savefig(output/'crown-silhouette-before-after.png',dpi=160);plt.close(fig)
    fig,axes=plt.subplots(1,2,figsize=(17,5))
    retained_rows=[(tris[r['material']][r['triangleOrdinal']],r['material'],r['part']) for r in selection['triangles'] if (r['material'],r['triangleOrdinal']) not in retired]
    for ax,style in zip(axes,('outline','sculptural')):
        alternative=build_candidate(profile,crown_style=style)
        rows=retained_rows+[(tuple(alternative['vertices'][j] for j in f),{'red':'taihe_lacquer','gold':'taihe_gold','darkGold':'taihe_dark_gold'}[alternative['materials'][i]],'alternative') for i,f in enumerate(alternative['triangles'])]
        draw(ax,rows,0,ylim=(4.32,5.98))
        ax.set_title('Original thin-section draft' if style=='outline' else 'Alternative: main sections 1.65x, supports 1.4x')
    fig.suptitle('CPU silhouette comparison only. Identical triangle count, materials, top heights and registration.',fontsize=13);fig.tight_layout();fig.savefig(output/'crown-section-alternatives.png',dpi=180);plt.close(fig)
    (output/'candidate-geometry.json').write_text(json.dumps(m,separators=(',',':'))+'\n')
    retired_bytes,receipt=retire_screen_headers(base);(output/'retired-index-only.glb').write_bytes(retired_bytes)
    files=[p for p in HERE.iterdir() if p.is_file() and p.suffix in ('.py','.json','.md')]
    receipt.update({'crownStyle':crown_style,'newTriangles':len(m['triangles']),'candidateTriangles':17266-1736+len(m['triangles']),'netIncrease':len(m['triangles'])-1736,'candidateBudget':17866,'originalCoreBudget':18000,'materialBatches':8,'sources':{str(p.relative_to(HERE.parents[2])):sha(p.read_bytes()) for p in files},'note':'Index-only intermediate deliberately retains baseline contract; final integration must update inventory and identity. Diagnostics do not prove runtime appearance/performance.'})
    (output/'CPU-RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
    return receipt

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);parser.add_argument('--face-map',type=Path,required=True);parser.add_argument('--crown-style',choices=('outline','sculptural'),default='outline');args=parser.parse_args();r=generate(args.output,args.face_map,args.crown_style);print(json.dumps({k:r[k] for k in ('baselineSHA256','maskSHA256','removedTriangles','newTriangles','candidateTriangles','netIncrease')},indent=2))
