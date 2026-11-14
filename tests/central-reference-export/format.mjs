export const raw=a=>Buffer.from(new Uint8Array(a.buffer,a.byteOffset,a.byteLength));
export function validate(g,ranges,budget={vertices:300000,triangles:250000}){
 const p=g.attributes.position;if(!p||!g.attributes.normal||!g.attributes.uv)throw Error('required attributes');if(p.itemSize!==3||g.attributes.normal.itemSize!==3||g.attributes.uv.itemSize!==2)throw Error('core itemSize');if(!['position','normal','uv'].every(k=>g.attributes[k].array instanceof Float32Array)||!(g.index?.array instanceof Uint16Array||g.index?.array instanceof Uint32Array))throw Error('core typed array');const n=p.array.length/3,idx=g.index?.array;
 if(!Number.isInteger(n)||n<3||n>budget.vertices||!idx||idx.length%3||idx.length/3>budget.triangles)throw Error('geometry budget');
 for(const [name,a]of Object.entries(g.attributes)){if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)||!ArrayBuffer.isView(a.array)||a.isInterleavedBufferAttribute||a.array.length!==n*a.itemSize)throw Error('attribute format');for(const x of a.array)if(!Number.isFinite(x))throw Error('nonfinite');}
 let end=0;const names=new Set;for(const r of ranges){if(!/^[a-z0-9-]+$/.test(r.name)||names.has(r.name)||r.start!==end||!Number.isInteger(r.count)||r.count<=0)throw Error('range');names.add(r.name);end+=r.count;}if(end!==n)throw Error('range coverage');
 const owner=new Int16Array(n);ranges.forEach((r,j)=>owner.fill(j,r.start,r.start+r.count));
 for(let i=0;i<idx.length;i++){if(!Number.isInteger(idx[i])||idx[i]<0||idx[i]>=n)throw Error('index');if(i%3&&owner[idx[i]]!==owner[idx[i-i%3]])throw Error('cross segment triangle');}
 end=0;for(const q of g.groups){if(q.start!==end||q.start%3||q.count%3||q.count<=0||!Number.isInteger(q.materialIndex)||q.materialIndex<0||q.materialIndex>6)throw Error('group');end+=q.count;}if(end!==idx.length)throw Error('group coverage');return {vertices:n,triangles:idx.length/3};
}
export function obj(g,r){
 const p=g.attributes.position.array,n=g.attributes.normal.array,u=g.attributes.uv.array;
 const out=['# CLAY REFERENCE ONLY; Three(x,y,z) -> Blender(x,-z,y); no recenter/weld/scale',`o ${r.name}`];
 for(let i=r.start;i<r.start+r.count;i++)out.push(`v ${p[3*i]} ${-p[3*i+2]} ${p[3*i+1]}`);
 for(let i=r.start;i<r.start+r.count;i++)out.push(`vt ${u[2*i]} ${u[2*i+1]}`);
 for(let i=r.start;i<r.start+r.count;i++)out.push(`vn ${n[3*i]} ${-n[3*i+2]} ${n[3*i+1]}`);
 const ids=g.index.array;for(let i=0;i<ids.length;i+=3)if(ids[i]>=r.start&&ids[i]<r.start+r.count){const v=[ids[i],ids[i+1],ids[i+2]].map(x=>x-r.start+1);out.push(`f ${v.map(x=>`${x}/${x}/${x}`).join(' ')}`);}return out.join('\n')+'\n';
}
export function verifySegment(g,other,range){for(const name of ['position','normal','uv','color']){const b=other.attributes[name];if(!b&&name==='color')continue;if(!b||b.array.length!==range.count*b.itemSize)throw Error('segment count '+name);const a=g.attributes[name];for(let i=0;i<b.array.length;i++)if(!Object.is(a.array[range.start*a.itemSize+i],b.array[i]))throw Error('segment mismatch '+range.name+'/'+name);}}
export function verifySegmentFaces(g,other,r){
 const canonical=a=>{const j=a.indexOf(Math.min(...a));return [a[j],a[(j+1)%3],a[(j+2)%3]].join(',');};
 const expected=[];for(let i=0;i<other.index.array.length;i+=3)expected.push(canonical(Array.from(other.index.array.slice(i,i+3))));
 const actual=[];for(let i=0;i<g.index.array.length;i+=3)if(g.index.array[i]>=r.start&&g.index.array[i]<r.start+r.count)actual.push(canonical(Array.from(g.index.array.slice(i,i+3),v=>v-r.start)));
 expected.sort();actual.sort();if(expected.length!==actual.length||expected.some((x,i)=>x!==actual[i]))throw Error('segment topology mismatch '+r.name);
}
export function verifyObj(text,g,r){
 const v=[],vn=[],vt=[],faces=[];for(const line of text.trimEnd().split('\n')){const [tag,...s]=line.split(' ');if(tag==='#'||tag==='o')continue;const target=tag==='v'?v:tag==='vn'?vn:tag==='vt'?vt:null;if(target){const a=s.map(Number);if(a.length!==(tag==='vt'?2:3)||a.some(x=>!Number.isFinite(x)))throw Error('OBJ numeric');target.push(a);}else if(tag==='f'){if(s.length!==3)throw Error('OBJ face');faces.push(s.map(t=>{const a=t.split('/').map(Number);if(a.length!==3||a.some(x=>!Number.isInteger(x)||x<1||x>r.count)||a[0]!==a[1]||a[1]!==a[2])throw Error('OBJ face mapping');return a[0]-1+r.start;}));}else throw Error('OBJ unexpected record');}
 if(v.length!==r.count||vn.length!==r.count||vt.length!==r.count)throw Error('OBJ vertex counts');
 const report={vertices:r.count,triangles:faces.length,maxPositionError:0,maxNormalError:0,maxUVError:0,sourceBounds:{min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},blenderBounds:{min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]}};
 for(let i=0;i<r.count;i++){const j=r.start+i,inv=[v[i][0],v[i][2],-v[i][1]],normal=[vn[i][0],vn[i][2],-vn[i][1]];for(let k=0;k<3;k++){report.maxPositionError=Math.max(report.maxPositionError,Math.abs(inv[k]-g.attributes.position.array[j*3+k]));report.maxNormalError=Math.max(report.maxNormalError,Math.abs(normal[k]-g.attributes.normal.array[j*3+k]));for(const [b,a]of [[report.sourceBounds,inv],[report.blenderBounds,v[i]]]){b.min[k]=Math.min(b.min[k],a[k]);b.max[k]=Math.max(b.max[k],a[k]);}}for(let k=0;k<2;k++)report.maxUVError=Math.max(report.maxUVError,Math.abs(vt[i][k]-g.attributes.uv.array[j*2+k]));}
 if(report.maxPositionError!==0||report.maxNormalError!==0)throw Error('OBJ inverse geometry mismatch');if(report.maxUVError!==0)throw Error('OBJ UV mismatch');
 let f=0;const ids=g.index.array;for(let i=0;i<ids.length;i+=3)if(ids[i]>=r.start&&ids[i]<r.start+r.count){if(!faces[f]||faces[f].some((x,k)=>x!==ids[i+k]))throw Error('OBJ face source mismatch');f++;}if(f!==faces.length)throw Error('OBJ face count');return report;
}
