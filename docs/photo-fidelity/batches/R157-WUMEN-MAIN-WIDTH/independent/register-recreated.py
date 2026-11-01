from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
D=Path(__file__).resolve().parent;S=D.parent/'recovered-private-wumen'
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def centers(name,points):
 a=np.array(Image.open(D/name).convert('L')).astype(float);out=[]
 for x,y in points:
  ys,xs=np.mgrid[y-6:y+7,x-6:x+7];w=np.maximum(0,220-a[y-6:y+7,x-6:x+7]);w[(xs-x)**2+(ys-y)**2>36]=0
  out.append([float((xs*w).sum()/w.sum()),float((ys*w).sum()/w.sum())])
 return out
def stats(row):
 a=np.array(row);ds=np.diff(a[:,0]);side=np.delete(ds,4);return {'central':float(ds[4]),'sideMean':float(side.mean()),'ratio':float(ds[4]/side.mean()),'slope':float(np.polyfit(a[:,0],a[:,1],1)[0]),'intervals':ds.tolist()}
a=centers('plan-2005-crop-recreated.png',[(196,90),(274,91),(354,92),(433,93),(512,94),(626,95),(705,96),(784,97),(864,98),(942,99)])
b=centers('plan-2005-crop-recreated.png',[(194,400),(273,401),(352,402),(432,404),(511,404),(624,406),(703,406),(783,408),(862,408),(940,410)])
c=centers('plan-main-right-crop-recreated.png',[(x,70) for x in [44,142,280,377,475,572,667]])
d=centers('plan-main-right-crop-recreated.png',[(x,449) for x in [44,142,280,377,475,572,667]])
e=centers('plan-2021-new-2.png',[(x,1120) for x in [2060,2155,2252]])
f=centers('plan-2021-new-2.png',[(x,1499) for x in [2060,2155,2252]])
joined=[]
for right,left in [(c,e),(d,f)]:
 ds=np.diff(np.array(right)[:,0]);side=np.r_[np.diff(np.array(left)[:,0]),np.delete(ds,1)];joined.append({'central':float(ds[1]),'sideMean':float(side.mean()),'ratio':float(ds[1]/side.mean()),'sideIntervals':side.tolist(),'crossPageIntervalUsed':False})
assert h(S/'T00124_00.pdf')=='4704dfcc47c2829c50ccdc9a3567bfb50bf3fc23daddf356303843b9faf3bf2e'
assert h(S/'exhibition-2021.pdf')=='5049aa0a175c2fe8da56f536a5846d29772f2fd424e6213236e964e2968d8a85'
assert h(D/'plan-2005-crop-recreated.png')=='ab2c6e220c7bd25553c676b8a30a3010ca9afea1affe46ee7cd5f9852e734568'
assert h(D/'plan-main-right-crop-recreated.png')=='967f7897af9091b000f533d465f8b1913a3df89068f2b31922ec2f1d2a9db3e7'
result={'provenance':'RECREATED_AFTER_ENVIRONMENT_REPLACEMENT; not recovered original report/script. Exact PDF SHA and two legacy crop PNG byte hashes independently revalidated. New full renders have newly recorded identities.','method':'Visual seeds, radius6 luminance-darkness centroid. Subpixel arithmetic is not measurement accuracy. Approx +/-1 to2 source pixels plus uncalibrated scan/drawing error.','sourceFiles':{str(p):h(p) for p in [S/'T00124_00.pdf',S/'exhibition-2021.pdf',*sorted(D.glob('*.png'))]},'cropBoxes':[[0,350,1100,900],[0,1050,714,1530]],'points':{'2005TopCrop':a,'2005BottomCrop':b,'2021P152TopCrop':c,'2021P152BottomCrop':d,'2021P153TopOriginal':e,'2021P153BottomOriginal':f},'stats2005':[stats(a),stats(b)],'stats2021WithinPageOnly':joined}
(D/'registration-recreated.json').write_text(json.dumps(result,indent=2)+'\n')
print([x['ratio'] for x in result['stats2005']],[x['ratio'] for x in joined])
