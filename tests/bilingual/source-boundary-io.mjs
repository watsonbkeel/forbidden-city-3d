import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
export const BUILD_INPUTS=['index.html','main.js','style.css','src','data','public','package.json','package-lock.json','vite.config.js','release.json','scripts/build-identity.mjs'];
const relativePath=value=>{assert.equal(typeof value,'string');assert.match(value,/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/);assert.ok(!value.split('/').some(s=>s==='.'||s==='..'));assert.equal(path.posix.normalize(value),value);return value;};
/** Lstat every ancestor and every leaf. Gitignore never affects build inputs. */
export function createRuntimeReader(root){
 root=path.resolve(root);assert.equal(fs.realpathSync(root),root,'Runtime root cannot be a symlink/path alias');
 function checked(relative){relativePath(relative);let full=root;const parts=relative.split('/');for(let i=0;i<parts.length;i++){full=path.join(full,parts[i]);const st=fs.lstatSync(full);assert.ok(!st.isSymbolicLink(),relative+' cannot traverse a symbolic link');if(i<parts.length-1)assert.ok(st.isDirectory(),relative+' ancestor must be a directory');}return full;}
 function listCurrent(){
  const rows=[];function visit(relative){const full=checked(relative),st=fs.lstatSync(full);if(st.isDirectory()){for(const name of fs.readdirSync(full).sort())visit(relative+'/'+name);}else{assert.ok(st.isFile(),relative+' must be a regular input file');rows.push(relative);}}
  BUILD_INPUTS.forEach(visit);return rows;
 }
 function readCurrent(relative){const full=checked(relative),st=fs.lstatSync(full);return{bytes:fs.readFileSync(full),regular:st.isFile(),mode:st.mode&0o111?'100755':'100644'};}
 return {readCurrent,listCurrent};
}
export function createBoundaryIO(root,manifest){
 root=path.resolve(root);assert.deepEqual(manifest.scope,BUILD_INPUTS,'Exact production build input scope');
 const reader=createRuntimeReader(root);
 const git=(...args)=>execFileSync('git',['-C',root,...args],{env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:64*1024*1024});
 assert.equal(git('rev-parse',manifest.baseCommit+'^{tree}').toString().trim(),manifest.baseTree,'Exact public e128 tree');
 const baseline=new Map();function readBaseline(relative){relativePath(relative);if(!baseline.has(relative))baseline.set(relative,git('show',manifest.baseCommit+':'+relative));return baseline.get(relative);}
 return {...reader,readBaseline};
}
