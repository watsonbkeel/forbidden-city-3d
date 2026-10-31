import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {R157_COMMITTED_VERSIONS} from './r157-committed-versions.mjs';

export function runR157Historical(fileUrl,version) {
  const commit=R157_COMMITTED_VERSIONS[version];
  if(!commit)throw Error(`Unknown historical R157 candidate: ${version}`);
  const env={...process.env,R157_FROZEN_SOURCE_COMMIT:commit};
  delete env.NODE_TEST_CONTEXT; // node:test child must execute, not silently return empty output.
  const result=spawnSync(process.execPath,['--import',fileURLToPath(new URL('./r157-committed-source-loader.mjs',import.meta.url)),'--test','--test-reporter=tap','--test-concurrency=1',fileURLToPath(fileUrl)],{
    cwd:process.cwd(),env,encoding:'utf8',timeout:120_000,maxBuffer:4*1024*1024,
  });
  if(result.error||result.status!==0)throw Error(`Historical ${version}@${commit} failed (status=${result.status}, signal=${result.signal}):\n${String(result.error??'')}\n${result.stdout?.slice(-8000)??''}\n${result.stderr?.slice(-2000)??''}`);
  const tests=Number(result.stdout.match(/^# tests (\d+)\r?$/m)?.[1]);
  const pass=Number(result.stdout.match(/^# pass (\d+)\r?$/m)?.[1]);
  const fail=Number(result.stdout.match(/^# fail (\d+)\r?$/m)?.[1]);
  if(!/^TAP version 13/m.test(result.stdout)||!/^ok [1-9]\d* - /m.test(result.stdout)||!(tests>0)||pass!==tests||fail!==0)throw Error(`Historical ${version} did not positively execute all tests: tests=${tests},pass=${pass},fail=${fail}\n${result.stdout.slice(-8000)}`);
  return result.stdout;
}
