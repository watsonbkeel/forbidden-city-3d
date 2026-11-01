import * as THREE from 'three';
import {YANGXIN_WEST_ROOM_PLAN as PLAN} from './YangxinWestWarmRooms.js';

// Normalized transcriptions, not facsimiles of the photographed calligraphy.
// Atlas pixels are drawn here; no museum photograph is distributed as a texture.
const SPECS = [
  ['r53-qinzheng-blank-plaque', null, '勤政親賢', 5, [0,0,512,124], true, 'qinzheng'],
  ['r53-qinzheng-blank-side-hanging', 'east', '惟以一人治天下', 5, [512,0,80,488], false, 'qinzheng'],
  ['r53-qinzheng-blank-side-hanging', 'west', '豈為天下奉一人', 5, [592,0,80,488], false, 'qinzheng'],
  ['r53-sanxi-blank-east-wall-board', null, '三希堂', 0, [0,128,256,184], true, 'sanxi'],
  ['r53-sanxi-blank-side-hanging', 'south', '懷抱觀古今', 0, [672,0,64,464], false, 'sanxi'],
  ['r53-sanxi-blank-side-hanging', 'north', '深心託豪素', 0, [736,0,64,464], false, 'sanxi'],
];

export function applyYangxinReviewedLettering(kit, item, f) {
  if (item.name !== '养心殿' || item.x !== 108.6 || item.z !== 277.5 || item.w !== 36 || item.d !== 12 || item.ph !== .6 || f?.parent !== kit.root || f.rotation.y !== 0 || f.rotation.x !== 0 || f.rotation.z !== 0 || f.position.x !== item.x || f.position.z !== item.z || f.scale.x !== 1 || f.scale.y !== 1 || f.scale.z !== 1 || !f.userData.yangxinWestWarmRooms || f.userData.yangxinReviewedLettering) throw Error('R138 Yangxin lettering identity/state mismatch');
  const all=[]; f.traverse(m=>{if(m.isMesh)all.push(m);});
  const panels=SPECS.map(([role,part,text,face,cell,horizontal,room])=>{
    const matches=all.filter(m=>m.name===role && (!part || (part==='east'?m.position.x<11:part==='west'?m.position.x>11:part==='south'?m.position.z<-4.7:m.position.z>-4.7)));
    if(matches.length!==1)throw Error(`R138 expected one ${role}/${part}`);
    const mesh=matches[0], geometry=mesh.geometry, group=geometry.groups.find(g=>g.materialIndex===face);
    const expected=room==='qinzheng'?(horizontal?[2.7,.65,.035]:[.3,1.83,.035]):(horizontal?[.035,.5,.7]:[.035,1.45,.2]);
    const actual=[geometry.parameters?.width,geometry.parameters?.height,geometry.parameters?.depth];
    if(actual.some((v,i)=>!Number.isFinite(v)||Math.abs(v-expected[i])>1e-6)||mesh.rotation.x!==0||mesh.rotation.y!==0||mesh.rotation.z!==0||mesh.scale.x!==1||mesh.scale.y!==1||mesh.scale.z!==1)throw Error('R138 reviewed board envelope drift');
    if(geometry.type!=='BoxGeometry'||geometry.attributes.position.count!==24||!group||Array.isArray(mesh.material)||!geometry.attributes.uv)throw Error('R138 reviewed board shape changed');
    return {mesh,text,face,cell,horizontal,room,group};
  });
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('R138 text canvas unavailable');
  for(const p of panels){
    const [x,y,w,h]=p.cell;ctx.fillStyle=p.room==='qinzheng'?'#b99c68':'#d9d0b7';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#211b16';ctx.textAlign='center';ctx.textBaseline='middle';
    const chars=[...p.text];if(p.horizontal)chars.reverse();
    const span=(p.horizontal?w:h)*.80, pad=(p.horizontal?w:h)*.10;
    const step=span/chars.length;
    const fontSize=Math.floor(Math.min(step*.85,(p.horizontal?h:w)*.64));
    ctx.font=`${fontSize}px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif`;
    chars.forEach((ch,i)=>ctx.fillText(ch,p.horizontal?x+pad+step*(i+.5):x+w/2,p.horizontal?y+h/2:y+pad+step*(i+.5)));
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.name='r138-yangxin-original-lettering-atlas';
  const material=new THREE.MeshStandardMaterial({name:'r138-yangxin-normalized-text',map:texture,roughness:.9});
  kit.owned.push(material);(kit.ownedTextures??=[]).push(texture);
  for(const p of panels){
    const {mesh,face,cell,group}=p,[x,y,w,h]=cell,uv=mesh.geometry.attributes.uv,index=mesh.geometry.index;
    const vertices=new Set();for(let i=group.start;i<group.start+group.count;i++)vertices.add(index.getX(i));
    for(const i of vertices)uv.setXY(i,(x+2+uv.getX(i)*(w-4))/1024,1-(y+h-2)/512+uv.getY(i)*(h-4)/512);
    uv.needsUpdate=true;
    // MergeUtils intentionally excludes multi-material meshes. Split the existing
    // front triangles (no new surface/depth), so both parts enter normal batches.
    const frontGeometry=mesh.geometry.clone();
    frontGeometry.setIndex([...index.array.slice(group.start,group.start+group.count)]);
    frontGeometry.clearGroups();
    const bodyIndices=[...index.array.slice(0,group.start),...index.array.slice(group.start+group.count)];
    mesh.geometry.setIndex(bodyIndices);mesh.geometry.clearGroups();
    const front=new THREE.Mesh(frontGeometry,material);front.name=mesh.name+'-r138-text-face';
    front.position.copy(mesh.position);front.quaternion.copy(mesh.quaternion);front.scale.copy(mesh.scale);
    front.castShadow=mesh.castShadow;front.receiveShadow=mesh.receiveShadow;mesh.parent.add(front);
    front.userData.r138YangxinText={text:p.text,source:PLAN.sources.photos[p.room],frontFace:face,normal:face===5?'local -Z south':'local +X west',atlasCell:cell,horizontalRightToLeft:p.horizontal,transcription:'NORMALIZED_TRADITIONAL_TEXT_SYSTEM_FONT_NOT_ORIGINAL_BRUSHWORK',calligraphyReplica:false,officialPixelsEmbedded:false,paperColor:'PHOTO_FITTED_BASE_COLOR_NOT_COLORIMETRIC',originalObjectId:p.room==='qinzheng'?'FC-3122B6472E':'FC-DC9C591F0F'};
  }
  return f.userData.yangxinReviewedLettering={panelCount:6,wholeInteriorAccepted:false,centralPoem:'UNTRANSCRIBED_NOT_INVENTED',surfaceGeometryChanged:false,frontTrianglesPartitionedForMaterialBatching:true,physicalChanged:false,source:PLAN.sources.paper.url,currentQinzhengPlaque:PLAN.sources.plaque.currentObject};
}
