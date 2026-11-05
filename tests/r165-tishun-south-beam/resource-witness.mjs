/** Extra run-local object identities only. Existing canonical hashes unchanged. */
export function createResourceWitness(){
 const refs=new Map(),id=o=>{if(o===null||o===undefined)return null;if(typeof o!=='object'&&typeof o!=='function')return{primitive:o};if(!refs.has(o))refs.set(o,refs.size+1);return refs.get(o)};
 const image=x=>x==null?null:{ref:id(x),...(Array.isArray(x)?{elements:x.map(id)}:{}),...(ArrayBuffer.isView(x)?{buffer:id(x.buffer)}:{}),...(x?.data&&typeof x.data==='object'?{pixelData:id(x.data),pixelBuffer:ArrayBuffer.isView(x.data)?id(x.data.buffer):null}:{})};
 function material(m){if(m==null)return null;const textures={};for(const[k,q]of Object.entries(m))if(q?.isTexture)textures[k]={texture:id(q),source:id(q.source),image:image(q.image)};return{material:id(m),textures}}
 return{capture:containers=>containers.map(c=>({container:id(c),materials:(Array.isArray(c)?Array.from(c):[c]).map(material)}))};
}
/** Additive run-local witness. Never modifies the original oracle or its hashes. */
export function withResourceWitness(state,containers){const witness=createResourceWitness();return(...args)=>({...state(...args),resourceRefs:witness.capture(containers())})}
