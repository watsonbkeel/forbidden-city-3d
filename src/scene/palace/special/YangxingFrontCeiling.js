import * as T from 'three';
const ID='place-ningshou-65cdb57c48-front-ceiling';
const ITEM={kind:'gate',name:'养性门',x:-293.3,z:354.8,w:23.1,gateKind:'five-bay',structureStatus:'provisional-preserved-baseline'};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:!(k in o)&&Object.isExtensible(o)};
/** A source-backed flat painted ceiling in the retained central front bay.
 * Grid count, simple circular motifs, palette and mounting size are fits.
 * Never infer a caisson or a complete surveyed gate from this addition. */
export function buildYangxingFrontCeiling(kit,f,{zoneId,itemIndex,item}){
 if(zoneId!=='ningshou'||item?.name!=='养性门')return false;
 const root=kit?.root,structure=f?.userData.structure;
 if(itemIndex!==8||JSON.stringify(item)!==JSON.stringify(ITEM)||!root||root.name!=='ningshou'||root.parent||f?.parent!==root||!mutable(f.children)||!mutable(kit.owned)||!(kit.ownedTextures===undefined?writable(kit,'ownedTextures'):mutable(kit.ownedTextures))||[root,f].some(q=>!q.matrixAutoUpdate||!q.matrixWorldAutoUpdate)||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!f.position.equals(new T.Vector3(-293.3,0,354.8))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||structure?.gateKind!=='five-bay'||structure.storeys!==1||structure.portalCount!==3||f.children.some(q=>q.userData.structure?.id===ID))throw Error('Exact writable Yangxing five-bay source required once only');
 const beams=f.children.filter(q=>q.isMesh&&q.material===kit.lib.material('caihua_beam')&&Math.abs(q.position.x)<1e-8&&Math.abs(q.position.z+3.465)<1e-8);
 if(beams.length!==1)throw Error('Yangxing front beam missing');const b=beams[0];b.updateMatrix();const bounds=new T.Box3().setFromBufferAttribute(b.geometry.attributes.position).applyMatrix4(b.matrix);
 if(bounds.min.distanceTo(new T.Vector3(-11.8,6.45,-3.665))>1e-5||bounds.max.distanceTo(new T.Vector3(11.8,7.05,-3.265))>1e-5)throw Error('Yangxing front beam changed');
 const geometries=[],materials=[],frame=new T.Group();let texture;frame.name='yangxing-central-front-flat-ceiling';
 try{
  const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=768;canvas.height=600}const c=canvas?.getContext('2d');if(!c)throw Error('Yangxing ceiling requires a 2D canvas');
  c.fillStyle='#173d60';c.fillRect(0,0,768,600);
  for(let row=0;row<5;row++)for(let col=0;col<6;col++){const x=col*128,y=row*120;c.fillStyle='#28695f';c.fillRect(x+10,y+10,108,100);c.strokeStyle='#b4a568';c.lineWidth=3;c.strokeRect(x+13,y+13,102,94);c.fillStyle='#194c59';c.fillRect(x+25,y+24,78,72);c.strokeStyle='#bfa35f';c.lineWidth=3;c.beginPath();c.arc(x+64,y+60,22,0,Math.PI*2);c.stroke();c.lineWidth=2;c.beginPath();c.arc(x+64,y+60,15,0,Math.PI*2);c.stroke();}
  texture=new T.CanvasTexture(canvas);texture.name='r164_yangxing_flat_grid_ceiling_fit';texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const edgeMaterial=new T.MeshStandardMaterial();materials.push(edgeMaterial);edgeMaterial.name='r164_yangxing_ceiling_edge_fit';edgeMaterial.color.set(0x173d60);edgeMaterial.roughness=.85;
  const paintedMaterial=new T.MeshStandardMaterial();materials.push(paintedMaterial);paintedMaterial.name='r164_yangxing_ceiling_paint_fit';paintedMaterial.map=texture;paintedMaterial.roughness=.85;
  const backing=new T.BoxGeometry(3.62,.06,2.815);geometries.push(backing);const edge=new T.Mesh(backing,edgeMaterial);edge.name=frame.name+'/thin-backing';edge.position.set(0,6.48,-2.0575);
  const plane=new T.PlaneGeometry(3.62,2.815);geometries.push(plane);plane.rotateX(Math.PI/2);const face=new T.Mesh(plane,paintedMaterial);face.name=frame.name+'/painted-underside';face.position.set(0,6.449,-2.0575);
  for(const m of[edge,face]){m.castShadow=false;m.receiveShadow=true;m.userData.yangxingFrontCeiling=true;frame.add(m)}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();texture?.dispose();throw e}
 const meta={id:ID,originalObjectId:'FC-65CDB57C48',sourceObjectId:'FC-65CDB57C48',name:'养性门中央前廊天花',scope:'CENTRAL_FRONT_FLAT_CEILING_ONLY',wholeObjectAccepted:false,surveyed:false,source:'https://www.dpm.org.cn/Uploads/File/2019/12/15/u5df60cf540978.pdf',sourceTitle:'乾隆太上皇宫宁寿宫营建考',pdfPage:6,printedPage:127,figure:3,photoDateVerified:false,sourceFacts:['Figure 3 explicitly identifies Yangxing gate','Flat blue-green square-grid ceiling with gold circular decorations above the central doorway'],fitted:['6 by 5 grid, plain concentric circular motifs, colors and private canvas paint','Central front patch only: x ±1.81m, z -3.465 to -0.65m, underside 6.449m above model origin','Existing generic gate dimensions retained, not a surveyed reconstruction'],remaining:['Original painted subject and precise panel count, fittings and current conservation appearance','Rest of five-bay ceiling, original door/post layout and complete gate fidelity','GPU/browser/mobile/full World'],newMeshes:2,newTriangles:14,newMaterials:2,newContacts:0,newWalkables:0,originalPlaqueChanged:false};frame.userData.structure=meta;
 // Every ordinary source owner is validated before submission. User-installed
 // throwing event listeners/disposal overrides are outside this source contract.
 f.add(frame);kit.owned.push(...materials);(kit.ownedTextures??=[]).push(texture);return{frame,meta,texture};
}
