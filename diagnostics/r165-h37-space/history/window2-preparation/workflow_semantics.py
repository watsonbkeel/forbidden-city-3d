"""Offline checks for every expression location and embedded script in this fixed workflow.
Uses the existing local PyYAML tool; not a runtime dependency or a claim of full actionlint coverage.
Source: https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability
"""
import ast,json,re,subprocess,sys
from pathlib import Path
import yaml
JOB_ENV={'github','needs','strategy','matrix','vars','secrets','inputs'}
JOB_IF={'github','needs','vars','inputs'}
STEP={'github','needs','strategy','matrix','job','runner','env','steps','inputs','secrets','vars'}
STATUS={'always','cancelled','success','failure'}
def context_for(path):
 if len(path)==4 and path[:1]==('jobs',)and path[2]=='env':return JOB_ENV,set()
 if len(path)==3 and path[:1]==('jobs',)and path[2]=='if':return JOB_IF,STATUS
 if len(path)>=5 and path[:1]==('jobs',)and path[2]=='steps'and type(path[3])is int:
  key=path[4]
  if key in ['env','run','with','name']:return STEP,set()
  if key=='if':return STEP,STATUS
 if len(path)==2 and path[0]=='concurrency':return {'github','inputs','vars'},set()
 return set(),set()
def expression(expr,path):
 allowed,functions=context_for(path);clean=re.sub(r"'(?:[^']|'')*'",'',expr)
 for token in re.findall(r'(?<![\w.])([A-Za-z_]\w*)(?:\.[A-Za-z_]\w*)*',clean):
  if token not in allowed|functions|{'true','false','null'}:raise ValueError('Unavailable expression name '+token+' at '+'.'.join(map(str,path)))
def validate_expressions(value,path=()):
 if isinstance(value,dict):
  for key,item in value.items():validate_expressions(item,path+(key,))
 elif isinstance(value,list):
  for index,item in enumerate(value):validate_expressions(item,path+(index,))
 elif isinstance(value,str):
  matches=list(re.finditer(r'\$\{\{(.*?)\}\}',value,re.S))
  if value.count('${{')!=len(matches):raise ValueError('Malformed workflow expression')
  for match in matches:expression(match[1],path)
  if path and path[-1]=='if'and not matches:expression(value,path)
 return True
def validate_scripts(workflow):
 counts={'shellScripts':0,'pythonHeredocs':0,'javascriptHeredocs':0}
 for job in workflow['jobs'].values():
  for step in job.get('steps',[]):
   if 'run'not in step:continue
   script=step['run'];subprocess.run(['bash','-n'],input=script,text=True,capture_output=True,check=True,timeout=10);counts['shellScripts']+=1
   lines=script.splitlines();index=0
   while index<len(lines):
    line=lines[index];match=re.search(r"<<'([A-Z]+)'",line);index+=1
    if not match:continue
    delimiter=match[1];body=[]
    while index<len(lines)and lines[index]!=delimiter:body.append(lines[index]);index+=1
    if index>=len(lines):raise ValueError('Unclosed script heredoc')
    source='\n'.join(body)+'\n';index+=1
    if 'python3'in line:ast.parse(source);counts['pythonHeredocs']+=1
    elif 'node'in line:subprocess.run(['node','--input-type=module','--check','-'],input=source,text=True,capture_output=True,check=True,timeout=10);counts['javascriptHeredocs']+=1
    else:raise ValueError('Unreviewed heredoc interpreter')
 return counts
def check(path):
 workflow=yaml.safe_load(Path(path).read_text());validate_expressions(workflow)
 if set(workflow)!={'name','on','permissions','concurrency','jobs'}:raise ValueError('Unexpected workflow top-level keys')
 if workflow['permissions']!={'contents':'read'}or set(workflow['jobs'])!={'diagnose'}:raise ValueError('Workflow scope changed')
 job=workflow['jobs']['diagnose']
 if set(job)!={'if','runs-on','timeout-minutes','permissions','defaults','env','steps'}or job['permissions']!={'contents':'read'}:raise ValueError('Unexpected job shape/permission')
 for step in job['steps']:
  if set(step)-{'name','id','uses','with','run','timeout-minutes','env','if'}:raise ValueError('Unexpected step keys')
  if 'uses'in step and not re.fullmatch(r'actions/[a-z-]+@[0-9a-f]{40}',step['uses']):raise ValueError('Action is not frozen official source')
 return {'expressions':'passed for all used locations','scripts':validate_scripts(workflow),'workflow':str(path),'actualFixtures':0,'scope':'Targeted GitHub context plus complete embedded script syntax checks; not full actionlint'}
if __name__=='__main__':print(json.dumps(check(sys.argv[1]),indent=2))
