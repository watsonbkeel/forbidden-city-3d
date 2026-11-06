import * as T from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';

// Exact public8386 non-indexed box payload. UV is checked against the actual
// library band width below; no geometry is allocated during target selection.
const POSITION=new Float32Array([8.699999809265137, 0.3264000117778778, 0.22499999403953552, 8.699999809265137, -0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, -0.22499999403953552, 8.699999809265137, -0.3264000117778778, 0.22499999403953552, 8.699999809265137, -0.3264000117778778, -0.22499999403953552, 8.699999809265137, 0.3264000117778778, -0.22499999403953552, -8.699999809265137, 0.3264000117778778, -0.22499999403953552, -8.699999809265137, -0.3264000117778778, -0.22499999403953552, -8.699999809265137, 0.3264000117778778, 0.22499999403953552, -8.699999809265137, -0.3264000117778778, -0.22499999403953552, -8.699999809265137, -0.3264000117778778, 0.22499999403953552, -8.699999809265137, 0.3264000117778778, 0.22499999403953552, -8.699999809265137, 0.3264000117778778, -0.22499999403953552, -8.699999809265137, 0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, -0.22499999403953552, -8.699999809265137, 0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, -0.22499999403953552, -8.699999809265137, -0.3264000117778778, 0.22499999403953552, -8.699999809265137, -0.3264000117778778, -0.22499999403953552, 8.699999809265137, -0.3264000117778778, 0.22499999403953552, -8.699999809265137, -0.3264000117778778, -0.22499999403953552, 8.699999809265137, -0.3264000117778778, -0.22499999403953552, 8.699999809265137, -0.3264000117778778, 0.22499999403953552, -8.699999809265137, 0.3264000117778778, 0.22499999403953552, -8.699999809265137, -0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, 0.22499999403953552, -8.699999809265137, -0.3264000117778778, 0.22499999403953552, 8.699999809265137, -0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, 0.22499999403953552, 8.699999809265137, 0.3264000117778778, -0.22499999403953552, 8.699999809265137, -0.3264000117778778, -0.22499999403953552, -8.699999809265137, 0.3264000117778778, -0.22499999403953552, 8.699999809265137, -0.3264000117778778, -0.22499999403953552, -8.699999809265137, -0.3264000117778778, -0.22499999403953552, -8.699999809265137, 0.3264000117778778, -0.22499999403953552]);
const NORMAL=new Float32Array([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
const HOST={kind:'hall',x:87.6,z:290.9,w:16.9,d:8.7,pad:.5,ph:.45,colH:5.44,roof:'gable',brackets:false,map:'hall'},done=new WeakMap(),ID='west-six/items/3/south-eave-beam';
const fail=message=>{throw Error('Exact Tishun south beam: '+message)};
const need=(v,message)=>{if(!v)fail(message)};
const identity=o=>o?.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const meshes=root=>{const out=[];root.traverse(m=>{if(m.isMesh)out.push(m)});return out};
const plain=value=>value!==null&&typeof value==='object'&&Object.getPrototypeOf(value)===Object.prototype;
const emptyUserData=value=>plain(value)&&Reflect.ownKeys(value).length===0;
const appliedUserData=(value,feature)=>plain(value)&&Reflect.ownKeys(value).length===1&&Reflect.ownKeys(value)[0]==='structure'&&Object.getOwnPropertyDescriptor(value,'structure')?.value===feature;
const renderState=g=>Object.is(g.drawRange?.start,0)&&g.drawRange?.count===Infinity&&plain(g.morphAttributes)&&Reflect.ownKeys(g.morphAttributes).length===0&&g.morphTargetsRelative===false;
const signature=g=>JSON.stringify({type:g.type,groups:g.groups,index:g.index===null?null:Array.from(g.index.array),attributes:Object.fromEntries(Object.keys(g.attributes).sort().map(k=>{const a=g.attributes[k];return[k,[a.itemSize,a.count,a.normalized,a.array.constructor.name,...new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength)]]}))});
function original(g,width){
 if(g?.constructor!==T.BufferGeometry||g.type!=='BufferGeometry'||g.index!==null||g.parameters!==undefined||Object.keys(g.attributes).sort().join(',')!=='normal,position,uv'||!renderState(g))return false;
 for(const[k,size]of[['position',3],['normal',3],['uv',2]]){const a=g.attributes[k];if(!a?.isBufferAttribute||a.isInterleavedBufferAttribute||a.array.constructor!==Float32Array||a.itemSize!==size||a.count!==36||a.normalized!==false||a.array.byteOffset!==0||a.array.length!==36*size)return false}
 const p=g.attributes.position.array,n=g.attributes.normal.array,uv=g.attributes.uv.array;
 if(!p.every((v,i)=>Object.is(v,POSITION[i]))||!n.every((v,i)=>Object.is(v,NORMAL[i])))return false;
 const min=-.3264000117778778,height=.6528000235557556;
 for(let i=0;i<36;i++){const x=p[i*3],y=p[i*3+1],z=p[i*3+2],ax=Math.abs(n[i*3]),ay=Math.abs(n[i*3+1]),az=Math.abs(n[i*3+2]),u=Math.fround((ax>az&&!(ay>ax&&ay>az)?z:x)/width),v=Math.fround(ay>ax&&ay>az?.5:(y-min)/height);if(!Object.is(uv[i*2],u)||!Object.is(uv[i*2+1],v))return false}
 return JSON.stringify(g.groups)===JSON.stringify(Array.from({length:6},(_,i)=>({start:i*6,count:6,materialIndex:i})));
}
function base(kit,zone){
 const root=kit?.root;need(root?.isGroup&&root.name==='west-six'&&!root.parent&&identity(root)&&root.position.lengthSq()===0&&root.matrix.equals(new T.Matrix4())&&root.matrixWorld.equals(new T.Matrix4()),'root identity');
 const rows=zone.items?.filter(q=>Object.keys(q).length===Object.keys(HOST).length&&Object.entries(HOST).every(([k,v])=>Object.is(q[k],v)));need(rows?.length===1&&zone.items[3]===rows[0],'exact public item tuple/index');
 const fs=root.children.filter(f=>f.userData.structure?.id==='west-six/items/3');need(fs.length===1,'unique R63 frame');const f=fs[0];need(identity(f)&&f.parent===root&&f.position.equals(new T.Vector3(87.6,0,290.9))&&f.matrix.equals(new T.Matrix4().makeTranslation(87.6,0,290.9))&&f.matrixWorld.equals(f.matrix),'frame transform');
 const s=f.userData.structure;need(s.inventoryStatus==='UNKNOWN'&&s.presetUseStatus==='UNVERIFIED'&&s.roomBoundsStatus==='NOT_VALIDATED'&&s.inventoryIdentityStatus==='ORIGINAL_UNNAMED_DECLARATION_NOT_CONFIRMED_HISTORICAL_ROOM','R63 restrictions');
 return f;
}
function target(kit,f){
 const width=kit.lib.tileSize('caihua_beam');need(Number.isFinite(width)&&width>0,'valid live library band width');const material=kit.lib.material('caihua_beam'),matrix=new T.Matrix4().makeTranslation(0,.45+5.44-(5.44*.12)/2,-8.7/2),rows=meshes(f).filter(m=>m.parent===f&&m.name===''&&m.children.length===0&&identity(m)&&m.position.equals(new T.Vector3(0,.45+5.44-(5.44*.12)/2,-8.7/2))&&m.matrix.equals(matrix)&&m.matrixWorld.equals(new T.Matrix4().multiplyMatrices(f.matrixWorld,matrix))&&m.material===material&&m.castShadow===true&&m.receiveShadow===true&&original(m.geometry,width));
 need(rows.length===1,'unique complete original payload');const m=rows[0];need(f.children.indexOf(m)===14&&emptyUserData(m.userData)&&Object.isExtensible(m),'target slot/userData must not overwrite a structure record');
 for(const key of['geometry','userData']){const d=Object.getOwnPropertyDescriptor(m,key);need(d&&'value'in d&&d.writable,'mutable own target '+key)}
 const buffers=new Set(Object.values(m.geometry.attributes).map(a=>a.array.buffer));need(buffers.size===3,'three independent old buffers');
 for(const other of meshes(kit.root))if(other!==m){need(other.geometry!==m.geometry,'old geometry must be private owner');for(const a of[...Object.values(other.geometry.attributes),other.geometry.index].filter(Boolean))need(!buffers.has(a.array.buffer),'old buffer must have private owner')}
 return m;
}
function stage(g,old,width){
 const b=new T.Box3().setFromBufferAttribute(old.attributes.position),c=b.min,d=b.max,yi=Math.fround(c.y+.16),yj=Math.fround(d.y-.18),zi=Math.fround(-.14),zj=Math.fround(.14),s=[[c.z,c.y],[d.z,c.y],[d.z,yi],[zj,yi],[zj,yj],[d.z,yj],[d.z,d.y],[c.z,d.y],[c.z,yj],[zi,yj],[zi,yi],[c.z,yi]],v=[];
 const point=(x,i)=>[x,s[i][1],s[i][0]],tri=(a,b,c,n)=>{const cross=new T.Vector3(...b).sub(new T.Vector3(...a)).cross(new T.Vector3(...c).sub(new T.Vector3(...a)));v.push(...a,...(cross.dot(new T.Vector3(...n))>0?[...b,...c]:[...c,...b]))};
 for(const face of T.ShapeUtils.triangulateShape(s.map(q=>new T.Vector2(...q)),[])){tri(...face.map(i=>point(c.x,i)),[-1,0,0]);tri(...face.map(i=>point(d.x,i)),[1,0,0])}
 for(let i=0;i<s.length;i++){const j=(i+1)%s.length,n=[0,-(s[j][0]-s[i][0]),s[j][1]-s[i][1]];tri(point(c.x,i),point(d.x,i),point(d.x,j),n);tri(point(c.x,i),point(d.x,j),point(c.x,j),n)}
 g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBandUV(g,width);return g;
}
/** The original generator maps this exact carrier to F49. Only beam categories
 * are source-supported; section sizes/profile remain fits. Roof, columns,
 * openings, all physical/navigation records and R63 interior limits stay intact. */
export function buildTishunSouthBeam(kit,zone){
 if(zone?.id!=='west-six')return false;
 const frame=base(kit,zone),committed=done.get(kit);
 if(committed){const prior=committed.get(frame.children[14]);need(prior,'idempotent applied target drift');const m=prior.mesh,matrix=new T.Matrix4().makeTranslation(0,.45+5.44-(5.44*.12)/2,-8.7/2);need(m.parent===frame&&frame.children[14]===m&&m.name===''&&m.children.length===0&&identity(m)&&m.position.equals(new T.Vector3(0,.45+5.44-(5.44*.12)/2,-8.7/2))&&m.matrix.equals(matrix)&&m.matrixWorld.equals(new T.Matrix4().multiplyMatrices(frame.matrixWorld,matrix))&&m.castShadow===true&&m.receiveShadow===true&&m.material===prior.material&&m.material===kit.lib.material('caihua_beam')&&m.geometry===prior.geometry&&m.userData===prior.userData&&appliedUserData(m.userData,prior.feature)&&renderState(prior.geometry)&&signature(prior.geometry)===prior.signature,'idempotent applied target drift');const buffers=new Set(Object.values(m.geometry.attributes).map(a=>a.array.buffer));for(const other of meshes(kit.root))if(other!==m){need(other.geometry!==m.geometry,'idempotent applied geometry ownership drift');for(const a of[...Object.values(other.geometry.attributes),other.geometry.index].filter(Boolean))need(!buffers.has(a.array.buffer),'idempotent applied buffer ownership drift')}return prior}
 const mesh=target(kit,frame),old=mesh.geometry,userData=mesh.userData,g=new T.BufferGeometry();
 const feature=Object.freeze({id:ID,sourceObjectId:'FC-784C20C066',scope:'FITTED_SOUTH_EAVE_BEAM_ONLY',modelCarrierCorrespondence:'ORIGINAL_GENERATOR_SOURCE_CHAIN_CONFIRMED_NOT_PHYSICAL_SURVEY',source:'https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae1f8852a4b.pdf',sourcePages:'450–451; beam categories, not measured section',modelMappingCommits:'a4d8939334a38133b04444eb4e9a1e399bb568f2 / eb3d458283a56aef69225df60bdfc419f06fd71e',dimensions:'MODEL_FIT_NOT_SURVEY',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,roofUnchanged:true,interiorLimitsUnchanged:true});
 let record;
 try{stage(g,old,kit.lib.tileSize('caihua_beam'));const publishedUserData={...userData,structure:feature};record=Object.freeze({mesh,geometry:g,feature,material:mesh.material,userData:publishedUserData,signature:signature(g)});mesh.geometry=g;mesh.userData=publishedUserData}catch(error){const failures=[];try{mesh.geometry=old}catch(e){failures.push(e)}try{mesh.userData=userData}catch(e){failures.push(e)}try{g.dispose()}catch(e){failures.push(e)}if(failures.length)throw new AggregateError([error,...failures],'Tishun publication/rollback failure');throw error}
 // Commit is complete before disposal. An external dispose listener throwing
 // cannot make a disposed old resource rollback-safe; retain the committed
 // record so a caller cannot repeat disposal. No shared material is disposed.
 // A live kit remembers the commit, but only the original mesh keeps its record
 // alive. After construction release, the record must not root the old frame.
 done.set(kit,new WeakMap([[mesh,record]]));old.dispose();return record;
}
