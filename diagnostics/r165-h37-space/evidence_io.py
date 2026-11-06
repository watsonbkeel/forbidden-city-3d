"""Fail-closed evidence writes. Existing partial output is never deleted on error."""
import json,os
from pathlib import Path
from resource_contract import evidence_size
MIB=1024*1024
def disk_available(root):
    stat=os.statvfs(root);return stat.f_bavail*stat.f_frsize
def guard_write(root,extra=0,*,quota=512*MIB,reserve=1024*MIB):
    if type(extra)is not int or extra<0 or evidence_size(root)+extra>quota or disk_available(root)-extra<reserve:raise ValueError('Evidence quota/disk reserve write rejected')
def write_bytes(root,name,raw):
    root=Path(root);guard_write(root,len(raw));dest=root/name;tmp=root/(name+'.tmp')
    if Path(name).name!=name or dest.is_symlink():raise ValueError('Evidence destination invalid')
    with tmp.open('xb')as f:f.write(raw);f.flush();os.fsync(f.fileno())
    os.replace(tmp,dest);guard_write(root)
def write_json(root,name,value):write_bytes(root,name,(json.dumps(value,indent=2)+'\n').encode())
