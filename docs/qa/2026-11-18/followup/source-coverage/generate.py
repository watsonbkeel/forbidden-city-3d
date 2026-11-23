"""Offline ledger source inventory. Run: python3 path/to/generate.py"""
from pathlib import Path
from collections import defaultdict, Counter
from urllib.parse import urlsplit, urlunsplit
import csv, json, re
out = Path(__file__).resolve().parent
root = next(p for p in out.parents if (p/'data/architecture/ledger-397/items').is_dir())
D = sorted((json.loads(p.read_text()) for p in (root/'data/architecture/ledger-397/items').glob('FC-*.json')),
           key=lambda r:(r['section'], int(re.search(r'\d+',r['number'])[0])))
assert len(D)==len({r['stableId'] for r in D})==397
def key(u):
    p=urlsplit(u)
    # Same numbered museum building entry; preserve panorama viewpoint and query.
    path=re.sub(r'^(/explore/building/\d+)(?:\.html)?/?$',r'\1',p.path)
    return urlunsplit((p.scheme.lower(),p.netloc.lower(),path,p.query,p.fragment))
def typ(u):
    p=urlsplit(u)
    if p.hostname in ('pano.dpm.org.cn','ggzlquanjing.dpm.org.cn'):return '全景'
    if re.search(r'\.(jpg|jpeg|png|webp)$',p.path,re.I):return '图像直链'
    if p.path.lower().endswith('.pdf'):return 'PDF'
    if '/explore/building/' in p.path:return '建筑条目'
    return '其他页面'
def fieldscope(n):
    if '历史位置' in n:return '历史项：先定年代/存废，现状内外不可直接对比'
    if '待核' in n:return '先查身份，再判断内外是否适用'
    if '室外构件' in n:return '室内可能不适用，需按实体签认'
    if '室内分区' in n:return '外观需判断能否归属独立实体或母建筑'
    if '院落' in n:return '先拆分院落和单体，判断各自内外适用性'
    return '按实体判断是否有独立内景；无链接不等于不适用'
refs,originals=defaultdict(set),defaultdict(set)
for r in D:
    for us in r['sourceLinks'].values():
        for u in us:refs[key(u)].add(r['stableId']);originals[key(u)].add(u)
def dump(fn,rows):
    with (out/fn).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
M=[]; regions=defaultdict(Counter); queue=[]
for r in D:
    l=r['sourceLinks']; us=set(u for a in l.values() for u in a); types={typ(u) for u in us}; c=regions[r['section']]
    row=dict(编号=r['number'],FC=r['stableId'],名称=r['name'],区=r['section'],性质=r['nature'],适用性待判=fieldscope(r['nature']))
    for k,z in [('identity','身份'),('exterior','外观'),('interior','室内')]:
        a=l[k];row[z+'链接数']=len(a);row[z+'类型']='、'.join(sorted({typ(u) for u in a})) or '无'
        row[z+'线索及跨项引用数']=' | '.join(f'{u} [{len(refs[key(u)])}项]' for u in a)
        c[z+'缺链']+=not a
    for t in ['图像直链','全景','建筑条目','PDF','其他页面']:row[t]=int(t in types);c[t]+=int(t in types)
    row['最大同源项数']=max((len(refs[key(u)]) for u in us),default=0);M.append(row);c['项数']+=1
    if not l['identity'] or '待核' in r['nature']:p,task=0,'先在馆方名录/带题注平面图确认名称与母建筑，不用同院照片代替'
    elif not l['exterior']:p,task=1,'寻找自有外观照片/立面图；历史项改查分期图，室内构件先定适用'
    elif not any(typ(u) in ['图像直链','全景'] for u in l['exterior']):p,task=2,'打开外观条目或论文，定位图号、物件、朝向与拍摄年代'
    elif not l['interior']:p,task=3,'先判是否有独立室内；如适用定位原状、历史或展陈并区分年代'
    else:p,task=4,'对齐同机位模型；区分独立实物和同院共用线索，记录遮挡/缺项'
    queue.append(dict(顺序级=p,编号=r['number'],FC=r['stableId'],名称=r['name'],区=r['section'],下一步=task,适用性=row['适用性待判'],最高跨项数=row['最大同源项数']))
dump('items.csv',M)
S=[dict(区=k,**v) for k,v in sorted(regions.items())];dump('sections.csv',S)
dump('sources.csv',[dict(来源归并键=k,类型=typ(k),不同对象数=len(v),FC列表=' '.join(sorted(v)),原链接=' | '.join(sorted(originals[k]))) for k,v in sorted(refs.items(),key=lambda kv:(-len(kv[1]),kv[0]))])
queue.sort(key=lambda r:(r['顺序级'],-r['最高跨项数'],r['FC']));dump('queue.csv',queue)
a=sum(regions.values(),Counter()); ranks=Counter(r['顺序级'] for r in queue)
(out/'README.md').write_text(f"""# 397项来源覆盖矩阵（离线登记，非验收）
数据为独立项的 sourceLinks 三栏。区域字母沿用原册分区，不按网址重分组。共 **{len(D)}** 项；身份缺链 {a['身份缺链']}、外观缺链 {a['外观缺链']}、室内缺链 {a['室内缺链']}。任一栏出现图像直链 {a['图像直链']} 项、全景 {a['全景']} 项、建筑条目 {a['建筑条目']} 项（集合可重叠）。{len(refs)} 个归并来源，其中 {sum(len(v)>1 for v in refs.values())} 个被多个不同FC对象引用。

- [逐项矩阵](items.csv)：每栏列类型、原始链接和引用该链接的不同物件数。同一对象重复引用只计一次。图像直链仅按扩展名识别，未判定是照片、制图还是题匾；条目和PDF内或仍有图片。“缺链”仅表示该栏空，不等于不存在实物或参考资料。
- [按区汇总](sections.csv)；[跨项引用排行](sources.csv)：数字只计不同FC号，不说明图一定错配；仅合并同一馆方建筑数字ID的有无.html写法，保留全景视角、查询与片段。
- [可执行队列](queue.csv)：每项只取当前首要任务，按级别再按共用来源风险排序；P0 身份缺链或来源册注明身份待核 {ranks[0]}，P1 外观缺链 {ranks[1]}，P2 外观仅有非直图/非全景链接 {ranks[2]}，P3 室内缺链 {ranks[3]}，P4 有线索须实看 {ranks[4]}。每项先核自然类别；广场、历史遗址、院落不能自动判室内通过或不适用。
- [已有8组跨区目检及直接来源](../../PALACE-PHOTOS.md)：太和殿、中和/保和殿、堆秀山/御景亭、宁寿宫前路/九龙壁、景仁宫影壁、储秀宫、角楼/护城河、大佛堂。这是有明确边界的视觉观察；本表不把任何链接存在视为看过图或通过。
- 重建：在任意目录运行 `python3 路径/generate.py`，仅写此目录四张CSV与本说明；无网络请求。后续核验应新增对象、图号/视角、年代、模型同视角、遮挡及结论记录，不修改本次清点为“全量核验”。
""",encoding='utf-8')
