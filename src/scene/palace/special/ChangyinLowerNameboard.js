import * as T from 'three';
const ID='place-ningshou-82e7771bd4-lower-plaque',SOURCE='https://www.dpm.org.cn/explore/building/236437.html';
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:!(k in o)&&Object.isExtensible(o)};
function host(kit,zone){
 const root=kit?.root,found=[];let duplicate=false;root?.traverse(f=>{if(f.userData.structure?.id==='place-ningshou-82e7771bd4')found.push(f);if(f.userData.structure?.id===ID)duplicate=true});
 const item=zone.items?.filter(i=>i.kind==='hall'&&i.name==='畅音阁'&&i.x===-336.6&&i.z===365.5&&i.w===15.5&&i.d===14.7&&i.ph===1.2),f=found[0],p=f?.userData.structure;
 if(!root||root.name!=='ningshou'||!root.matrixAutoUpdate||!root.matrixWorldAutoUpdate||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||found.length!==1||item?.length!==1||duplicate||f.parent!==root||!mutable(f.children)||!mutable(kit.owned)||!(kit.ownedTextures===undefined?writable(kit,'ownedTextures'):mutable(kit.ownedTextures))||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!f.position.equals(new T.Vector3(-336.6,0,365.5))||!f.quaternion.equals(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI))||!f.scale.equals(new T.Vector3(1,1,1))||p.key!=='changyin'||p.localW!==15.5||p.localD!==14.7||p.storeys!==3||p.roofBaseY!==16.2)throw Error('Exact writable Changyin lower-eave source required once only');
 if(f.children.filter(q=>q.userData.structure?.id==='place-ningshou-82e7771bd4-middle-plaque'&&q.userData.structure?.text==='導和怡泰').length!==1)throw Error('Delivered middle title must remain bound');
 const beams=f.children.filter(m=>m.isMesh&&m.userData.role==='waist-roof-bearing-beam'&&Math.abs(m.position.x)<1e-8&&Math.abs(m.position.y-5.7)<1e-8&&Math.abs(m.position.z+7.65)<1e-8);
 if(beams.length!==1)throw Error('Changyin lower bearing missing');const b=beams[0];b.updateMatrix();const q=new T.Box3().setFromBufferAttribute(b.geometry.attributes.position).applyMatrix4(b.matrix);
 if(q.min.distanceTo(new T.Vector3(-8.05,5.575,-7.78))>1e-5||q.max.distanceTo(new T.Vector3(8.05,5.825,-7.52))>1e-5)throw Error('Changyin lower bearing changed');return f;
}
/** Official lower-eave title; private texture leaves every shared atlas slot
 * unchanged. Plain rim/font, exact size and mounting coordinates are fits. */
export function buildChangyinLowerNameboard(kit,zone){
 if(zone?.id!=='ningshou')return false;const f=host(kit,zone),geometries=[],materials=[];let texture;
 const frame=new T.Group();frame.name='changyin-lower-source-title';
 try{
  const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=512;canvas.height=128}const c=canvas?.getContext('2d');if(!c)throw Error('Changyin lower title requires a2D canvas');
  c.fillStyle='#151b1b';c.fillRect(0,0,512,128);c.fillStyle='#d6b05c';c.textAlign='center';c.textBaseline='middle';c.font='bold 76px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun","Noto Serif CJK SC","Noto Serif CJK TC",serif';for(const[i,ch]of[...'壺天宣豫'].entries())c.fillText(ch,448-i*128,64);
  texture=new T.CanvasTexture(canvas);texture.name='r164-changyin-lower-title-normalized-glyphs';texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const faceMaterial=new T.MeshStandardMaterial();materials.push(faceMaterial);faceMaterial.map=texture;faceMaterial.roughness=.55;faceMaterial.name='r164_changyin_lower_title_fit';
  const rimMaterial=new T.MeshStandardMaterial();materials.push(rimMaterial);rimMaterial.color.set(0xb48e30);rimMaterial.roughness=.65;rimMaterial.metalness=.15;rimMaterial.name='r164_changyin_lower_plain_rim_fit';
  const backing=new T.BoxGeometry(3.32,.97,.12);geometries.push(backing);const rim=new T.Mesh(backing,rimMaterial);rim.name=frame.name+'/plain-rim';rim.position.set(0,5.3,-7.77);
  const g=new T.PlaneGeometry(3.2,.85);geometries.push(g);g.rotateY(Math.PI);const face=new T.Mesh(g,faceMaterial);face.name=frame.name+'/face';face.position.set(0,5.3,-7.84);
  for(const m of[rim,face]){m.castShadow=false;m.receiveShadow=true;m.userData={changyinLowerPlaque:true,role:m===face?'official-lower-title-face':'plain-fitted-title-rim',source:SOURCE};frame.add(m)}
 }catch(error){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();texture?.dispose();throw error}
 const meta={id:ID,originalObjectId:'FC-82E7771BD4',name:'畅音阁下檐匾额',text:'壺天宣豫',sourceText:'壶天宣豫',readingOrder:'right-to-left',source:SOURCE,image:'https://www.dpm.org.cn/Uploads/File/2019/09/03/u5d6e382d9ba17.pdf',pdfPage:5,printedPage:38,figure:4,scope:'LOWER_EAVE_TITLE_ONLY',wholeObjectAccepted:false,originalCalligraphy:false,dimensions:'MODEL_FIT_NOT_SURVEYED',unknown:['Original calligraphy, carved rim and exact hanging hardware','Measured dimensions and position, photograph date and current display','Carved ghost-mask brackets, side couplets and original title calligraphy remain unbuilt; no new upper access','GPU/browser/mobile/full World'],newContacts:0,newWalkables:0,sharedAtlasChanged:false,priorMiddleScopeNoteSuperseded:'The delivered middle-title record described the lower title as unbuilt at its own version; this separate lower-title record supersedes that historical gap only'};frame.userData.structure=meta;
 // Validation/allocation precede commit; arbitrary throwing add/dispose event
 // listeners are outside the synchronous construction source contract.
 f.add(frame);kit.owned.push(...materials);(kit.ownedTextures??=[]).push(texture);return{frame,meta,texture};
}
