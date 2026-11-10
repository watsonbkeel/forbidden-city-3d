// Certificate copies never freeze or modify live Three objects. Source meshes
// use complete snapshots; merged buckets use only certified triangle payloads.
const equalArray=(a,b)=>a?.length===b.length&&b.every((v,i)=>Object.is(a[i],v));
const reference=o=>o?new WeakRef(o):null;
function materialValues(m){
  if(!m||Array.isArray(m))return null;
  const values=[];
  for(const key of Object.keys(m).sort()){
    const v=m[key];
    if(v===null||['string','number','boolean','undefined'].includes(typeof v))values.push([key,v]);
    else if(v?.isColor)values.push([key,v.r,v.g,v.b]);
    else if(v?.isVector2||v?.isVector3||v?.isVector4||v?.isMatrix3||v?.isMatrix4)values.push([key,...v.toArray()]);
    else if(v?.isTexture)values.push([key,v.uuid,v.version,v.offset?.x,v.offset?.y,v.repeat?.x,v.repeat?.y,v.rotation,v.wrapS,v.wrapT]);
    else if(key==='userData'||key==='defines'||Array.isArray(v))values.push([key,JSON.stringify(v)]);
  }
  return JSON.stringify(values);
}
export function snapshotNode(node){
  node.updateWorldMatrix(true,false);
  return {node:reference(node),parent:reference(node.parent),position:node.position.toArray(),quaternion:node.quaternion.toArray(),scale:node.scale.toArray(),matrix:node.matrix.toArray(),world:node.matrixWorld.toArray(),visible:node.visible,layers:node.layers.mask,auto:node.matrixAutoUpdate,worldAuto:node.matrixWorldAutoUpdate};
}
export function verifyNode(s,{ignoreParent=false}={}){
  const n=s.node.deref();if(!n)return false;n.updateWorldMatrix(true,false);
  return (ignoreParent||n.parent===(s.parent?.deref()??null))&&n.visible===true&&n.visible===s.visible&&n.layers.mask===s.layers&&n.matrixAutoUpdate===s.auto&&n.matrixWorldAutoUpdate===s.worldAuto&&equalArray(n.position.toArray(),s.position)&&equalArray(n.quaternion.toArray(),s.quaternion)&&equalArray(n.scale.toArray(),s.scale)&&equalArray(n.matrix.elements,s.matrix)&&equalArray(n.matrixWorld.elements,s.world);
}
const selectedValues=(attribute,vertices)=>vertices?vertices.flatMap(i=>Array.from(attribute.array.subarray(i*attribute.itemSize,(i+1)*attribute.itemSize))):Array.from(attribute.array);
export function snapshotMesh(mesh,triangleOffsets=null){
  const g=mesh.geometry,offsets=triangleOffsets?[...new Set(triangleOffsets)].sort((a,b)=>a-b):null;
  const vertices=offsets?[...new Set(offsets.flatMap(i=>[0,1,2].map(k=>g.index?g.index.getX(i+k):i+k)))].sort((a,b)=>a-b):null;
  return {node:snapshotNode(mesh),geometry:reference(g),offsets,vertices,attributes:Object.entries(g.attributes).map(([name,a])=>({name,attribute:reference(a),array:reference(a.array),data:selectedValues(a,vertices),size:a.itemSize,normalized:a.normalized,count:a.count,length:a.array.length})),index:g.index?{attribute:reference(g.index),array:reference(g.index.array),data:offsets?offsets.flatMap(i=>[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)]):Array.from(g.index.array),count:g.index.count}:null,groups:JSON.stringify(g.groups),drawRange:{...g.drawRange},material:reference(mesh.material),materialValues:materialValues(mesh.material)};
}
export function verifyMesh(s){
  const m=s.node.node.deref(),g=s.geometry.deref();
  if(!m||!g||m.geometry!==g||!verifyNode(s.node)||m.material!==s.material?.deref()||materialValues(m.material)!==s.materialValues||m.material.visible===false||m.material.opacity===0||Object.keys(g.attributes).length!==s.attributes.length)return false;
  if(s.offsets){
    const {start,count}=g.drawRange;
    if(!Number.isInteger(start)||start<0||start%3||!(count===Infinity||Number.isInteger(count)&&count>=0&&count%3===0)||s.offsets.some(i=>i<start||i+3>start+count))return false;
  }else if(JSON.stringify(g.groups)!==s.groups||g.drawRange.start!==s.drawRange.start||g.drawRange.count!==s.drawRange.count)return false;
  for(const a of s.attributes){
    const q=g.attributes[a.name];
    if(!q||q!==a.attribute.deref()||q.array!==a.array.deref()||q.itemSize!==a.size||q.normalized!==a.normalized||q.count!==a.count||q.array.length!==a.length)return false;
    if(s.vertices){let k=0;for(const vertex of s.vertices)for(let j=0;j<a.size;j++)if(!Object.is(q.array[vertex*a.size+j],a.data[k++]))return false;}
    else if(!equalArray(q.array,a.data))return false;
  }
  const i=s.index;
  if(!i)return g.index===null;
  if(g.index!==i.attribute.deref()||g.index?.array!==i.array.deref()||g.index.count!==i.count)return false;
  return s.offsets?equalArray(s.offsets.flatMap(j=>[g.index.getX(j),g.index.getX(j+1),g.index.getX(j+2)]),i.data):equalArray(g.index.array,i.data);
}
export function snapshotAncestors(node){const result=[];for(let p=node;p;p=p.parent)result.push(snapshotNode(p));return result;}
export const verifyAncestors=s=>s.every(p=>verifyNode(p));
export function snapshotDescriptor(row){return {row:reference(row),keys:Object.keys(row).sort(),values:Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v&&typeof v==='object'?{ref:reference(v),box:v.isBox3?v.clone():null}:v]))};}
export function verifyDescriptor(s){
  const row=s.row.deref();if(!row||!equalArray(Object.keys(row).sort(),s.keys))return false;
  return s.keys.every(k=>{const value=s.values[k];return value?.ref?row[k]===value.ref.deref()&&(!value.box||row[k].equals(value.box)):Object.is(row[k],value)});
}
