import {BUILD_INFO} from './ReleaseIdentityPanel.js';

const stages = new Set(['viewport','controls','flight','location','environment','lighting','palace','enclosure','garden','interiors','zones','characters','audio','map','shadows','render','performance','graphics','idle']);
const zones = new Set(['outer-east','outer-west','axis-courts','west-six','east-six','garden','ningshou']);
const types = new Set(['Error','TypeError','RangeError','ReferenceError','SyntaxError','URIError','EvalError','AggregateError']);
const read = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
const text = value => typeof value === 'string' ? value.slice(0, 2048) : '';
function codeFor(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `F-${(hash >>> 0).toString(16).padStart(8,'0')}`;
}

/** Local, once-per-failure summary. Never include arbitrary error text, stack or URLs. */
export function captureFailureDiagnostic(error, {stage,zone,info = BUILD_INFO} = {}) {
  const name = text(read(() => error?.name, ''));
  const message = text(read(() => error?.message, ''));
  const zoneId = read(() => typeof zone === 'function' ? zone() : zone, null);
  const buildId = text(read(() => info?.buildId, ''));
  const commit = text(read(() => info?.sourceCommit, ''));
  let cause = '未分类异常（原文未展示）';
  // Fixed labels deliberately discard the suffix, which can contain arbitrary data.
  if (/^Unsupported furniture-domain shape\b/.test(message)) cause = '家具碰撞形状不受支持';
  else if (/^Duplicate triangle owner\b/.test(message)) cause = '三角碰撞身份重复';
  else if (/^[A-Za-z -]{1,80}source copy changed\b/.test(message)) cause = '建筑接触来源发生变化';
  else if (/^WebGL rendering context (?:is )?lost$/.test(message)) cause = '图形上下文丢失';
  return Object.freeze({schema:1,stage:stages.has(stage)?stage:'unknown',zone:zones.has(zoneId)?zoneId:'unknown',
    buildId:/^R\d+[A-Za-z0-9.-]*-[a-f0-9]{12}$/.test(buildId)&&buildId.length<=80?buildId:'DEV-unbuilt',
    sourceCommit:/^[a-f0-9]{40}$/.test(commit)?commit:null,
    errorType:types.has(name)?name:'UnknownError',cause,code:codeFor(`${types.has(name)?name:'UnknownError'}:${stages.has(stage)?stage:'unknown'}:${cause}`)});
}
