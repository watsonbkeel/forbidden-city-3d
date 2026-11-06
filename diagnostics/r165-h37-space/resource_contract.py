"""Fixed remote-only resource contract; no adaptive budget or retry."""
import os,re,stat
from pathlib import Path,PurePosixPath
MIB=1024*1024

def effective_memory(total,available,layers):
    if type(total)is not int or type(available)is not int or not 0<=available<=total or total<=0 or not layers:raise ValueError('Physical memory unknown')
    limits=[total];remaining=[available]
    for row in layers:
        limit=row['limit'];current=row['current']
        if row.get('rootNonAccounting')is True and limit is None and current is None:continue
        if type(current)is not int or current<0:raise ValueError('Unknown/negative cgroup current')
        if limit is not None:
            if type(limit)is not int or limit<=0 or current>limit:raise ValueError('Unknown/negative cgroup remainder')
            limits.append(limit);remaining.append(limit-current)
    return {'capacityBytes':min(limits),'availableBytes':min(remaining)}
def evaluate(snapshot,*,start):
    limits={'capacityBytes':(4096*MIB,None),'availableBytes':((2048 if start else 1024)*MIB,None),'nodeRSSBytes':(0,768*MIB),'nonNodeRSSBytes':(0,256*MIB),'wrapperHighWaterBytes':(0,256*MIB),'diskAvailableBytes':((2048 if start else 1024)*MIB,None),'evidenceBytes':(0,512*MIB)}
    errors=[]
    for key,(lo,hi)in limits.items():
        value=snapshot.get(key)
        if type(value)is not int or value<lo or hi is not None and value>hi:errors.append(key)
    return {'ok':not errors,'violations':errors,'start':start}
def descendants(table,root):
    found={root};changed=True
    while changed:
        changed=False
        for pid,q in table.items():
            if type(pid)is int and q.get('kind')=='present' and q.get('ppid')in found and pid not in found:found.add(pid);changed=True
    return found

def parse_memory(meminfo,cgroup,mountinfo,read_text):
    memory={}
    for key in ('MemTotal','MemAvailable'):
        match=re.search('^'+key+r':\s+(\d+) kB$',meminfo,re.M)
        if not match:raise ValueError('Missing '+key)
        memory[key]=int(match[1])*1024
    groups=[]
    for line in cgroup.splitlines():
        ident,controllers,path=line.split(':',2)
        if ident=='0' and controllers=='':groups.append(('cgroup2',path))
        elif 'memory'in controllers.split(','):groups.append(('cgroup',path))
    matches=[]
    for line in mountinfo.splitlines():
        left,right=line.split(' - ',1);a=left.split();b=right.split()
        for version,group in groups:
            if b[0]!=version or version=='cgroup' and 'memory'not in b[2].split(','):continue
            def unescape(s):return re.sub(r'\\([0-7]{3})',lambda m:chr(int(m[1],8)),s)
            root=PurePosixPath(unescape(a[3]));mount=PurePosixPath(unescape(a[4]));g=PurePosixPath(group)
            if '..'in g.parts or '..'in root.parts:raise ValueError('Unsafe cgroup path')
            try:relative=g.relative_to(root)
            except ValueError:continue
            if root!=PurePosixPath('/'):raise ValueError('Hidden cgroup ancestors above subtree mount')
            matches.append((version,mount,mount/relative))
    if len(matches)!=1:raise ValueError('Memory cgroup mount identity unknown/ambiguous')
    version,mount,current=matches[0];layers=[]
    while True:
        if version=='cgroup2' and current==mount:
            values={}
            for name in ['memory.max','memory.current']:
                try:values[name]=str(read_text(str(current/name))).strip()
                except FileNotFoundError:values[name]=None
            controllers=str(read_text(str(current/'cgroup.controllers'))).split()
            if any(v is not None for v in values.values())or'memory'not in controllers:raise ValueError('True unaccounted v2 hierarchy root not established')
            layers.append({'path':str(current),'limit':None,'current':None,'rootNonAccounting':True,'proof':'cgroup2 mount root=/; both non-root-only memory interfaces ENOENT; memory controller present','controllers':controllers});break
        max_name='memory.max'if version=='cgroup2'else'memory.limit_in_bytes';use_name='memory.current'if version=='cgroup2'else'memory.usage_in_bytes'
        raw=str(read_text(str(current/max_name))).strip();used=str(read_text(str(current/use_name))).strip()
        if not re.fullmatch(r'\d+',used):raise ValueError('Unknown cgroup current')
        if version=='cgroup2' and raw=='max':limit=None
        elif re.fullmatch(r'\d+',raw):
            limit=int(raw)
            if version=='cgroup' and limit>=2**60:limit=None
        else:raise ValueError('Unknown cgroup hard limit')
        layers.append({'path':str(current),'rawLimit':raw,'rawCurrent':used,'limit':limit,'current':int(used)})
        if current==mount:break
        current=current.parent
    result=effective_memory(memory['MemTotal'],memory['MemAvailable'],layers)
    return {**result,'physical':memory,'cgroupVersion':version,'layers':layers}

def evidence_size(path):
    class AtomicIndexRenamed(Exception):pass
    def scan(root):
        total=0
        for p in root.iterdir():
            try:s=p.lstat()
            except FileNotFoundError:
                if re.fullmatch(r'FRAME-INDEX-(P1|P2C)\.json\.tmp',p.name):raise AtomicIndexRenamed()
                raise
            if stat.S_ISLNK(s.st_mode):raise ValueError('Evidence symlink forbidden')
            if stat.S_ISREG(s.st_mode):total+=s.st_size
            elif stat.S_ISDIR(s.st_mode):total+=scan(p)
            else:raise ValueError('Evidence special file forbidden')
        return total
    try:return scan(Path(path))
    except AtomicIndexRenamed:
        try:return scan(Path(path))
        except AtomicIndexRenamed as error:raise ValueError('Evidence atomic-index state remained uncertain after one complete rescan')from error

def snapshot_resources(table,node_pids,evidence_dir,*,wrapper_pid=None,known_non_node=None):
    wrapper_pid=os.getpid()if wrapper_pid is None else wrapper_pid
    if table.get('scanError'):raise ValueError('Process enumeration unknown')
    memory=parse_memory(Path('/proc/meminfo').read_text(),Path('/proc/self/cgroup').read_text(),Path('/proc/self/mountinfo').read_text(),lambda p:Path(p).read_text())
    own=descendants(table,wrapper_pid);non_node=own-set(node_pids);node_rss=0;non_rss=0;identities=[]
    known_non_node={}if known_non_node is None else known_non_node
    for pid in non_node:
        q=table.get(pid,{})
        if q.get('kind')=='present'and q.get('state')not in ['Z','X','x']:known_non_node[(pid,q['starttime'])]={'pid':pid,'starttime':q['starttime']}
    seen=[]
    for(pid,start),identity in known_non_node.items():
        q=table.get(pid,{'kind':'gone'})
        if q.get('kind')=='unknown':raise ValueError('Previously observed non-Node process identity/RSS unknown')
        status='gone'if q.get('kind')=='gone'else'reused'if q.get('starttime')!=start else'present'
        if status=='present':
            if q.get('state')in ['Z','X','x']:raise ValueError('Observed non-Node zombie remains')
            own.add(pid);non_node.add(pid)
        seen.append({**identity,'observed':status})
    for pid in own|set(node_pids):
        q=table.get(pid)
        if q is not None and q.get('kind')=='present' and q.get('state')in ['Z','X','x']:continue  # Original Node monitor still requires zero zombies at terminal.
        if q is None or q.get('kind')!='present' or q.get('state')in ['Z','X','x'] or type(q.get('rssKiB'))is not int:raise ValueError('Owned process RSS/identity unknown')
        identities.append({k:q.get(k)for k in ['pid','starttime','ppid','state','rssKiB']})
        if pid in node_pids:node_rss+=q['rssKiB']*1024
        elif pid in non_node:non_rss+=q['rssKiB']*1024
    hwm=table.get(wrapper_pid,{}).get('hwmKiB')
    if type(hwm)is not int:raise ValueError('Wrapper high-water mark unknown')
    stat=os.statvfs(evidence_dir)
    return {**memory,'nodeRSSBytes':node_rss,'nonNodeRSSBytes':non_rss,'wrapperHighWaterBytes':hwm*1024,'diskAvailableBytes':stat.f_bavail*stat.f_frsize,'evidenceBytes':evidence_size(evidence_dir),'ownedProcesses':identities,'knownNonNode':seen}
