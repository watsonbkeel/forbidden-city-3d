"""Fixed E45 read-only input preparation. No CLI or production launch route.

The explicit approved pin file must be frozen with the final candidate. This
module cannot manufacture an approval from whatever bytes happen to be present.
All returned data is persisted only through the supervisor's one shared ledger.
"""
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import stat
import subprocess
import sys
import r181_e45_bound as engine
import r181_e45_result as result_audit

PIN_FILE='.github/e45-approved-inputs.json'
SOURCE_MANIFEST='tests/r169-current-source/delta.json'
LOCK_SHA='e89d1c2e5f46fcd8571433e059f23b26463d9c0f317d78c09636190ab2d21b5c'
PACKAGES={'node_modules/three':'0.162.0','node_modules/@napi-rs/canvas':'0.1.100',
          'node_modules/@napi-rs/canvas-linux-x64-gnu':'0.1.100'}
FONT_ROOT='/usr/share/fonts/opentype/noto/'
FONTS=[('NotoSansCJK-Regular.ttc','b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a','Noto Sans CJK SC','NotoSansCJKsc-Regular'),
       ('NotoSansCJK-Bold.ttc','faa5f3656a78b2e2d450d27fe8382c778bc2b6bb5ea29c986664a6a435056ceb','Noto Sans CJK SC','NotoSansCJKsc-Bold'),
       ('NotoSerifCJK-Bold.ttc','a5d4b046c127da3d7c72f98b46c41489cd29bf52abfdf18aba920903e920d4ac','Noto Serif CJK SC','NotoSerifCJKsc-Bold'),
       ('NotoSerifCJK-Regular.ttc','a04178ec485dffdff7cc0c0c20e1fce9202d7e2160d805e8e44a4c8841c58481','Noto Serif CJK SC','NotoSerifCJKsc-Regular')]
FONT_FORMAT='%{family}\\n%{style}\\n%{index}\\n%{postscriptname}\\n%{charset}\\n'
CONTROL_ENV={'LANG':'C.UTF-8','LC_ALL':'C.UTF-8','TZ':'UTC','PATH':'/usr/bin:/bin',
             'GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null','PYTHONDONTWRITEBYTECODE':'1'}

def fail(message): raise engine.BindingError(message)
def file_pin(path):
    p=Path(path);real=p.resolve(strict=True)
    def identity():
        st=real.stat()
        if not stat.S_ISREG(st.st_mode):fail('NONREGULAR_INPUT')
        return (st.st_dev,st.st_ino,st.st_mode,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_nlink)
    before=identity()
    with real.open('rb') as stream:
        if identity()!=before:fail('INPUT_CHANGED')
        digest=hashlib.file_digest(stream,'sha256').hexdigest()
    if identity()!=before:fail('INPUT_CHANGED')
    return {'path':str(real),'bytes':before[3],'sha256':digest}

def verify_pinset(root,pins,allowed):
    if not isinstance(pins,dict) or not pins:fail('EMPTY_APPROVED_PINS')
    rows=[]
    for name,expected in sorted(pins.items()):
        if not isinstance(name,str) or not allowed(name) or '..' in Path(name).parts or Path(name).is_absolute():fail('UNAPPROVED_INPUT_PATH')
        p=root/name
        if p.resolve(strict=True)!=p:fail('INPUT_SYMLINK')
        row=file_pin(p)
        if row['sha256']!=expected:fail('INPUT_HASH_MISMATCH: '+name)
        rows.append({**row,'path':name})
    return rows

def file_set(root,scopes):
    result=set()
    for scope in scopes:
        start=root/scope
        if Path(scope).is_absolute() or '..' in Path(scope).parts:fail('SCOPE_PATH')
        paths=[start] if start.is_file() else start.rglob('*')
        for path in paths:
            if path.is_symlink() or path.resolve(strict=True)!=path:fail('INPUT_SYMLINK')
            if path.is_file():result.add(path.relative_to(root).as_posix())
            elif not path.is_dir():fail('INPUT_SPECIAL_FILE')
    return result

def invoke(argv,cwd):
    """Only fixed in-module tool commands. Their output stays in memory."""
    result=subprocess.run(argv,cwd=cwd,env=CONTROL_ENV,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE,timeout=10,check=False)
    if result.returncode or result.stderr or len(result.stdout)>1024**2:fail('READONLY_TOOL_FAILED: '+argv[0])
    return result.stdout

def parse_libraries(raw):
    paths=set()
    for line in raw.decode('utf-8').splitlines():
        if 'not found' in line:fail('NATIVE_LIBRARY_NOT_FOUND')
        match=re.search(r'(?:=>\s*)?(/[^\s]+)\s+\(0x[0-9a-f]+\)',line)
        if match:paths.add(match[1])
        elif line.strip() and not line.strip().startswith('linux-vdso.so.'):fail('UNPARSED_NATIVE_LIBRARY')
    if not paths:fail('NO_NATIVE_LIBRARY_IDENTITIES')
    return sorted(paths)

def build_input(root,node):
    """Concrete candidate receipt. Not execution approval. Never writes a file."""
    root=engine.exact_path(root);node=engine.exact_path(node)
    if platform.system()!='Linux' or platform.machine()!='x86_64':fail('FIXED_LINUX_X64_RUNNER_REQUIRED')
    if os.environ.get('GITHUB_REPOSITORY')!='watsonbkeel/forbidden-city-3d' or os.environ.get('GITHUB_REF')!='refs/heads/dev/r186-e45-platforms-baoyun-validation':fail('FIXED_BRANCH_CONTEXT_REQUIRED')
    commit=invoke(['/usr/bin/git','rev-parse','HEAD'],root).decode().strip()
    tree=invoke(['/usr/bin/git','rev-parse','HEAD^{tree}'],root).decode().strip()
    if commit!=os.environ.get('GITHUB_SHA') or not re.fullmatch('[0-9a-f]{40}',tree):fail('NATIVE_CHECKOUT_IDENTITY')
    if invoke(['/usr/bin/git','status','--porcelain=v1','--untracked-files=all'],root):fail('CHECKOUT_DIRTY')
    if invoke([str(node),'--version'],root)!=b'v24.22.1\n':fail('NODE_VERSION')
    if file_pin(root/'package-lock.json')['sha256']!=LOCK_SHA:fail('LOCK_IDENTITY')
    approved=engine.strict_json((root/PIN_FILE).read_bytes())
    if set(approved)!={'schema','sourcePins','dependencyPins'} or approved['schema']!='e45-approved-inputs/v1':fail('APPROVED_PIN_SCHEMA')
    sources=verify_pinset(root,approved['sourcePins'],lambda p:p.startswith(('.github/','tests/')) and p!=PIN_FILE)
    required={SOURCE_MANIFEST,engine.ENTRY,'.github/scripts/r181_e45_bound.py','.github/scripts/r181_e45_inputs.py','.github/scripts/r181_e45_result.py','.github/scripts/r177_build_bound.py'}
    if not required<=set(approved['sourcePins']):fail('MISSING_FIXED_SOURCE_PIN')
    boundary=engine.strict_json((root/SOURCE_MANIFEST).read_bytes())
    if len(boundary['files'])!=1012:fail('RUNTIME_BOUNDARY_SIZE')
    if file_set(root,boundary['scope'])!={r['path'] for r in boundary['files']}:fail('COMPLETE_RUNTIME_PATH_SET')
    runtime=[]
    for row in boundary['files']:
        p=root/row['path']
        if p.resolve(strict=True)!=p:fail('RUNTIME_SYMLINK')
        actual=file_pin(p)
        if actual['sha256']!=row['after'] or ('100755' if p.stat().st_mode&0o111 else '100644')!=row['mode']:fail('RUNTIME_BOUNDARY_MISMATCH')
        runtime.append({**actual,'path':row['path'],'mode':row['mode']})
    # Complete actual package path sets must match approved package bytes.
    actual_package_files=set()
    for folder,version in PACKAGES.items():
        package=engine.strict_json((root/folder/'package.json').read_bytes())
        if package['version']!=version:fail('DEPENDENCY_VERSION')
        for p in (root/folder).rglob('*'):
            if p.is_symlink():fail('DEPENDENCY_SYMLINK')
            if p.is_file():actual_package_files.add(p.relative_to(root).as_posix())
    if actual_package_files!=set(approved['dependencyPins']):fail('COMPLETE_DEPENDENCY_PATH_SET')
    dependencies=verify_pinset(root,approved['dependencyPins'],lambda p:any(p.startswith(x+'/') for x in PACKAGES))
    native=[root/r['path'] for r in dependencies if r['path'].endswith('.node')]
    if len(native)!=1:fail('EXACT_ONE_NATIVE_BINARY_REQUIRED')
    packages=invoke(['/usr/bin/dpkg-query','-W','-f=${Package}\t${Version}\n','fonts-noto-cjk','fontconfig'],root).decode()
    if dict(line.split('\t') for line in packages.splitlines())!={'fontconfig':'2.13.1-4.2ubuntu5','fonts-noto-cjk':'1:20220127+repack1-1'}:fail('OFFICIAL_FONT_PACKAGES')
    fonts=[];query_pin=file_pin('/usr/bin/fc-query')
    for name,expected,family,postscript in FONTS:
        path=FONT_ROOT+name;pin=file_pin(path)
        if pin['sha256']!=expected:fail('OFFICIAL_FULL_TTC_BYTES')
        argv=['/usr/bin/fc-query','--index=2','--format='+FONT_FORMAT,path]
        raw=invoke(argv,root);ranges=engine.parse_font_query(raw,family,2,postscript)
        fonts.append({'path':path,'sha256':expected,'family':family,'coverageRanges':ranges,
                      'coverageEvidence':{'tool':query_pin,'argv':argv,'fileSha256':expected,'faceIndex':2,
                                          'family':family,'postscriptName':postscript,'rawStdout':raw.decode(),
                                          'rawStdoutSha256':engine.digest(raw)}})
    assets=engine.strict_json((root/'tests/r181-qianxing-gate/eight-zone/asset-pins.json').read_bytes())
    for row in assets:
        actual=file_pin(root/row['path'])
        if {**actual,'path':row['path']}!=row:fail('CONSUMED_TEXTURE_PIN')
    # ldd is a fixed read-only ELF dependency inspection, not an entry runner.
    libraries=set();linkage=[]
    for binary in (node,*native,Path(sys.executable).resolve(),Path('/usr/bin/fc-query'),Path('/usr/bin/git'),Path('/usr/bin/dpkg-query'),Path('/bin/bash')):
        raw=invoke(['/usr/bin/ldd',str(binary)],root)
        paths=parse_libraries(raw);libraries.update(Path(p).resolve(strict=True) for p in paths)
        linkage.append({'binary':file_pin(binary),'ldd':raw.decode(),'sha256':engine.digest(raw)})
    python_files=set()
    for module in tuple(sys.modules.values()):
        for attr in ('__file__','__cached__'):
            name=getattr(module,attr,None)
            if name and Path(name).is_file():python_files.add(Path(name).resolve(strict=True))
    tools=[file_pin(p) for p in sorted(libraries|python_files|{node,Path(sys.executable).resolve(),
              Path('/usr/bin/git'),Path('/usr/bin/ldd'),Path('/usr/bin/dpkg-query'),Path('/usr/bin/fc-query'),Path('/bin/bash')},key=str)]
    result={'schema':'e45-input/v1','repository':'watsonbkeel/forbidden-city-3d','candidateCommit':commit,'candidateTree':tree,
            'sourceInventorySha256':file_pin(root/SOURCE_MANIFEST)['sha256'],'approvedPinsSha256':file_pin(root/PIN_FILE)['sha256'],
            'runtimeScope':boundary['scope'],'runtime':runtime,'sources':sources,'dependencies':dependencies,'tools':tools,'linkage':linkage,
            'fontPackages':packages,'fonts':fonts,'assets':assets}
    if len(engine.canonical(result))>2*1024**2:fail('INPUT_RECEIPT_SIZE')
    return result

def verify_input_bytes(root,receipt):
    """Final byte recheck after child cleanup; no copies and no tool execution."""
    if file_set(root,receipt['runtimeScope'])!={r['path'] for r in receipt['runtime']}:fail('RUNTIME_PATH_SET_CHANGED')
    if file_set(root,list(PACKAGES))!={r['path'] for r in receipt['dependencies']}:fail('DEPENDENCY_PATH_SET_CHANGED')
    for group in ('runtime','sources','dependencies','tools'):
        for row in receipt[group]:
            p=Path(row['path']);p=p if p.is_absolute() else root/p;actual=file_pin(p)
            if actual['bytes']!=row['bytes'] or actual['sha256']!=row['sha256']:fail('CONSUMED_INPUT_CHANGED')
            if group=='runtime' and ('100755' if p.stat().st_mode&0o111 else '100644')!=row.get('mode'):fail('RUNTIME_MODE_CHANGED')
    for font in receipt['fonts']:
        if file_pin(font['path'])['sha256']!=font['sha256']:fail('FONT_CHANGED')
    if file_pin(root/PIN_FILE)['sha256']!=receipt['approvedPinsSha256']:fail('APPROVED_PINS_CHANGED')

def candidate_context(root,node,evidence):
    """Prepare the one fixed E45 context, never start the production child.

    A future separately reviewed CLI activation must use this exact context and
    the returned supervisor exit outcome. No caller argv/role/budget is read.
    """
    root=engine.exact_path(root);evidence=engine.exact_path(evidence)
    budget=engine.EvidenceBudget(evidence)
    try:receipt=build_input(root,node)
    except Exception as exc:
        budget.terminal({'schema':'e45-input-precheck-terminal/v1','status':'PRECHECK_REJECTED',
                         'completed':False,'child_pid':None,'cleanup_complete':True,'exit_code':1,
                         'reason':type(exc).__name__,'detail':str(exc)[:512]})
        raise engine.BindingError('E45_INPUT_PRECHECK_REJECTED') from exc
    seal=budget.seal_input(engine.canonical(receipt))
    binding={'candidate_commit':receipt['candidateCommit'],'candidate_tree':receipt['candidateTree'],
             'input_manifest_sha256':seal.sha256}
    frozen=engine.load_frozen(root/'.github/scripts/r177_build_bound.py')
    return {'plan':engine.command_plan(node,root,evidence,seal.sha256),'root':evidence,
            'frozen':frozen,'sampler':frozen.resource_sample,
            'binding':binding,'seal':seal,'evidence_budget':budget,
            'full_validator':lambda r,b:result_audit.validate_payload(r,b,input_doc=receipt),
            'input_audit':lambda:verify_input_bytes(root,receipt)}
