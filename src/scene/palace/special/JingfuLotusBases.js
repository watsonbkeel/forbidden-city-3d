import * as T from 'three';
const ID='place-ningshou-7616c3b4b6',done=new WeakSet();
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:Object.isExtensible(o)&&!(k in o)};
const sameArray=(a,b)=>a?.length===b?.length&&a.every((x,i)=>x===b[i]);
function targets(c){
 const{p,f,kit,mats}=c??{},radius=(19.7/5*.052)*1.30;
 if(p?.id!==ID||p.key!=='jingfu'||p.localW!==19.7||p.localD!==19.7||p.ph!==.8||p.gallery!==1.65||f?.parent!==kit?.root||f.position.x!==-338.5||f.position.y!==0||f.position.z!==492.2||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.matrixAutoUpdate||done.has(f))throw Error('Exact unmodified Jingfu south bases required, once only');
 const a=f.children.filter(m=>m.userData.role==='jingfu-south-base-shoulder');
 if(a.length!==6)throw Error('Six original Jingfu south shoulders required');
 const reference=new T.CylinderGeometry(radius,radius*1.03,.10,20);
 try{for(const[i,m]of a.entries()){
  const g=m.geometry,par=g?.parameters,x=-p.localW/2+i*p.localW/5;
  if(!m.isMesh||m.parent!==f||m.userData.identity!==ID||m.userData.relief!=='PLAIN_VOLUME_NOT_CARVED_LOTUS'||m.material!==mats.stone||!writable(m,'geometry')||!writable(m.userData,'relief')||m.position.x!==x||m.position.y!==p.ph+.21||m.position.z!==-p.localD/2||!m.quaternion.equals(new T.Quaternion())||!m.scale.equals(new T.Vector3(1,1,1))||!m.matrixAutoUpdate||par?.radiusTop!==radius||par.radiusBottom!==radius*1.03||par.height!==.10||par.radialSegments!==20||par.heightSegments!==1||par.openEnded!==false||par.thetaStart!==0||par.thetaLength!==Math.PI*2||Object.keys(g.attributes).sort().join()!==Object.keys(reference.attributes).sort().join()||!sameArray(g.index?.array,reference.index.array)||Object.keys(reference.attributes).some(k=>!sameArray(g.attributes[k]?.array,reference.attributes[k].array)))throw Error('Jingfu base source geometry, placement or ownership changed');
  let uses=0;kit.root.traverse(q=>{if(q.isMesh&&q.geometry===g)uses++});if(uses!==1)throw Error('Jingfu base source geometry is shared');
 }}finally{reference.dispose()}
 return a;
}
function carve(g,r,rb,h){
 // Twelve downward-tapered lobes are a bounded visual fit, not a counted
 // historic petal inventory. The original bottom rim retains the exact AABB.
 const n=96,rows=[0,.06,.20,.48,.72,.92,1],profile=[1,1,.82,.96,.99,.88,.79],depth=[0,0,.02,.10,.06,.01,0],pos=[],uv=[],ix=[];
 for(let k=0;k<rows.length;k++)for(let j=0;j<=n;j++){
  const t=rows[k],theta=j/n*Math.PI*2,fold=(1-Math.cos(theta*12))/2,rad=(rb+(r-rb)*t)*(profile[k]-depth[k]*fold);
  pos.push(rad*Math.sin(theta),h*(t-.5),rad*Math.cos(theta));uv.push(j/n,t);
 }
 for(let k=0;k<rows.length-1;k++)for(let j=0;j<n;j++){const a=k*(n+1)+j,b=(k+1)*(n+1)+j;ix.push(a,a+1,b+1,a,b+1,b)}
 for(const[top,rad]of[[false,rb],[true,r*profile.at(-1)]]){const center=pos.length/3,y=top?h/2:-h/2;pos.push(0,y,0);uv.push(.5,.5);for(let j=0;j<=n;j++){const q=j/n*Math.PI*2;pos.push(rad*Math.sin(q),y,rad*Math.cos(q));uv.push(.5+Math.sin(q)/2,.5+Math.cos(q)/2)}for(let j=0;j<n;j++)top?ix.push(center,center+j+1,center+j+2):ix.push(center,center+j+2,center+j+1)}
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
 // Join the duplicated UV seam without smoothing the separate flat caps.
 const normal=g.attributes.normal,v=new T.Vector3(),w=new T.Vector3();for(let k=0;k<rows.length;k++){const a=k*(n+1),b=a+n;v.fromBufferAttribute(normal,a);w.fromBufferAttribute(normal,b);v.add(w).normalize();normal.setXYZ(a,v.x,v.y,v.z);normal.setXYZ(b,v.x,v.y,v.z)}
 g.computeBoundingBox();g.computeBoundingSphere();return g;
}
/** Six existing stone collars only. No extra solids, textures or materials. */
export function fitJingfuLotusBases(c){
 const a=targets(c),staged=[];
 try{for(const m of a){const g=new T.BufferGeometry();staged.push(g);const p=m.geometry.parameters;carve(g,p.radiusTop,p.radiusBottom,p.height);if(!g.boundingBox.equals(m.geometry.boundingBox))throw Error('Jingfu lotus fit exceeded retained envelope')}}catch(e){for(const g of staged)g.dispose();throw e}
 const old=a.map(m=>m.geometry);for(const[i,m]of a.entries()){m.geometry=staged[i];m.userData.relief='FITTED_INVERTED_LOTUS_NOT_SURVEYED'}done.add(c.f);for(const g of old)g.dispose();
 return{object:'FC-7616C3B4B6',count:6,scope:'SOUTH_SIX_EXISTING_STONE_COLLARS_ONLY',officialFact:'EAVE_COLUMN_BASES_HAVE_INVERTED_LOTUS_CARVING',source:'https://www.dpm.org.cn/explore/building/236571.html',image:'https://img.dpm.org.cn/Uploads/Picture/dc/7411.jpg',fit:'TWELVE_PETALS_AND_SHALLOW_PROFILE_NOT_COUNTED_OR_SURVEYED',wholeObjectAccepted:false,newMeshes:0,newMaterials:0,newColliders:0,newWalkables:0,unknown:['Exact petals, carving and current material appearance','Other column bases and complete Jingfu Palace','GPU/browser/mobile appearance']};
}
