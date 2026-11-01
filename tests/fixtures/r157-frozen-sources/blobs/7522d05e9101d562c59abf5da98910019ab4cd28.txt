import * as THREE from 'three';
import {WUMEN_VERTICAL_PROFILE} from './WumenVerticalProfile.js';

// Gate-local present-day approximations. No downloaded images, fonts, traced
// calligraphy or invented Manchu. Other palace plaques deliberately stay as-is.
const FONT = '"STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
const SOURCE = Object.freeze({
  wumen: 'https://www.dpm.org.cn/explore/building/236454.html',
  shenwu: 'https://www.dpm.org.cn/explore/building/236456.html',
});
const STYLES = Object.freeze({
  'gate-name': { body: '#9b302e', ink: '#e6bd59', panel: '#174577' },
  institution: { body: '#9c9588', ink: '#34302b', panel: '#d5d0bd' },
});
// Original simple ribbon silhouette in normalized coordinates. It is not a
// tracing of the official photograph or a reconstruction of carved detail.
const RIBBON = Object.freeze([
  [-.50,.39],[-.43,.47],[-.31,.42],[-.24,.46],[-.12,.45],[0,.50],
  [.12,.45],[.24,.46],[.31,.42],[.43,.47],[.50,.39],[.43,.34],
  [.34,.34],[.37,.22],[.34,.08],[.37,-.08],[.34,-.22],[.38,-.42],
  [.32,-.50],[.24,-.38],[.12,-.40],[0,-.46],[-.12,-.40],[-.24,-.38],
  [-.32,-.50],[-.38,-.42],[-.34,-.22],[-.37,-.08],[-.34,.08],[-.37,.22],[-.34,.34],[-.43,.34],
]);

function outline(style) {
  return style === 'gate-name' ? RIBBON : [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
}

function paintFace(canvas, spec) {
  const { width:w, height:h, text, layout, style } = spec;
  const c=canvas.getContext('2d'), cw=canvas.width, ch=canvas.height, colors=STYLES[style];
  c.fillStyle=colors.body; c.fillRect(0,0,cw,ch);
  if(style==='gate-name') {
    c.strokeStyle=colors.ink; c.lineWidth=cw*.018;
    c.beginPath();
    outline(style).forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](cw*(.5+x*.94),ch*(.5-y*.94)));
    c.closePath(); c.stroke();
  } else {
    for(const [inset,color] of [[.035,'#bbb4a1'],[.065,'#79766b'],[.085,colors.panel]]) {
      c.fillStyle=color; c.fillRect(cw*inset,ch*inset,cw*(1-2*inset),ch*(1-2*inset));
    }
  }
  const innerH=style==='gate-name'?h*.66:h*.74;
  const innerW=style==='gate-name'?innerH*.75:w*.88;
  const pw=cw*innerW/w, ph=ch*innerH/h, left=(cw-pw)/2, top=(ch-ph)/2;
  c.fillStyle=colors.ink; c.fillRect(left-cw*.008,top-ch*.008,pw+cw*.016,ph+ch*.016);
  c.fillStyle=colors.panel; c.fillRect(left,top,pw,ph);
  c.fillStyle=colors.ink; c.textAlign='center'; c.textBaseline='middle';
  const chars=[...text];
  const step=(layout==='vertical'?ph:pw)/chars.length;
  c.font=`${Math.floor(Math.min(step*.83,layout==='vertical'?pw*.72:ph*.78))}px ${FONT}`;
  chars.forEach((char,i)=>c.fillText(char,
    layout==='vertical'?cw/2:left+step*(i+.5),
    layout==='vertical'?top+step*(i+.5):ch/2));
}

/** Front is local +Z. Only its triangles receive the Canvas lettering. */
export function createGatePlaque(builder, spec) {
  const { id,text,width,height,depth=.12,layout,style,script='Han',side }=spec;
  if(!STYLES[style] || !['horizontal','vertical'].includes(layout) || script!=='Han') throw new Error('Unsupported gate plaque style/layout/script');
  if(![width,height,depth].every(n=>Number.isFinite(n)&&n>0)) throw new Error('Gate plaque dimensions must be positive finite model estimates');
  const key=`gate-plaque:${JSON.stringify({text,width,height,depth,layout,style,script,font:FONT})}`;
  if(!builder._own.has(key)) {
    const canvas=document.createElement('canvas');
    canvas.width=layout==='vertical'?512:1024; canvas.height=Math.round(canvas.width*height/width);
    paintFace(canvas,{...spec,script});
    const map=new THREE.CanvasTexture(canvas); map.colorSpace=THREE.SRGBColorSpace; map.anisotropy=4;
    const mat=builder.ownMat(key,{name:`gate_plaque_face_${style}`,map,roughness:.75,metalness:0,side:THREE.FrontSide});
    mat.addEventListener('dispose',()=>map.dispose());
  }
  const blank=builder.ownMat(`gate-plaque-blank:${style}`,{name:`gate_plaque_unlettered_${style}`,color:STYLES[style].body,roughness:.8,side:THREE.FrontSide});
  const shape=new THREE.Shape(outline(style).map(([x,y])=>new THREE.Vector2(x*width,y*height)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:1});
  const {position,normal,uv}=geometry.attributes;
  geometry.clearGroups();
  const plain=[],lettered=[];
  for(let i=0;i<position.count;i++) {
    const front=normal.getZ(i)>.99;
    (front?lettered:plain).push(i);
    if(front) uv.setXY(i,position.getX(i)/width+.5,position.getY(i)/height+.5);
  }
  geometry.setIndex([...plain,...lettered]);
  geometry.addGroup(0,plain.length,0);
  geometry.addGroup(plain.length,lettered.length,1);
  const mesh=new THREE.Mesh(geometry,[blank,builder._own.get(key)]);
  mesh.name=id; mesh.userData.noMerge=true;
  mesh.userData.gatePlaque={id,text,layout,script,side,style,
    textStatus:'SYSTEM_FONT_SEMANTIC_APPROXIMATION_NOT_ORIGINAL_CALLIGRAPHY',
    decorationStatus:'SELF_AUTHORED_SIMPLIFIED_FRAME',
    dimensions:{status:'MODEL_ESTIMATE_NOT_SURVEY',units:'model-metres',width,height,depth,
      innerWidth:style==='gate-name'?height*.66*.75:width*.88,innerHeight:style==='gate-name'?height*.66:height*.74},
  };
  mesh.castShadow=true; mesh.receiveShadow=true;
  if(side==='south') mesh.rotation.y=Math.PI;
  return mesh;
}

export function buildWumenSouthPlaque(builder, roof) {
  const band=roof.userData.doubleEaveMountingBand, profile=WUMEN_VERTICAL_PROFILE;
  if(!band || roof.userData.wumenVerticalProfile?.id!==profile.id) throw new Error('Wumen plaque requires the reviewed local vertical profile');
  const p=profile.plaque, depth=p.depth, margin=.1, upperY=profile.roof.upperFasciaBottomY;
  roof.updateMatrixWorld(true);
  const ridgeRay=new THREE.Raycaster(new THREE.Vector3(0,band.lowerY-.01,-band.upperSoffit.halfDepth-.08),new THREE.Vector3(0,0,1),0,band.upperSoffit.halfDepth);
  const ridgeHit=ridgeRay.intersectObject(roof,true)[0];
  if(ridgeHit?.object.material.name!=='roof_ridge_glaze') throw new Error('Wumen lower ridge surface is unavailable');
  // Fixed source-proportioned silhouette and bounded provisional mount. Mesh
  // clearance is a rejection check, never an instruction to shrink or shift it.
  const lowerSamples=[];
  for(const x of [-p.outerWidth/2,0,p.outerWidth/2]) for(const z of [p.backZ,p.frontZ]) {
    const hit=new THREE.Raycaster(new THREE.Vector3(x,upperY-.01,z),new THREE.Vector3(0,-1,0)).intersectObject(roof,true)[0];
    if(hit?.object.material!==builder.library.material('roof_tile')) throw new Error('Wumen lower roof surface is unavailable');
    lowerSamples.push(hit.point.y);
  }
  const lowerY=Math.max(...lowerSamples);
  if(p.frameBottomY<lowerY+margin || p.frameTopY>upperY-margin+1e-10) throw new Error('Frozen Wumen plaque mount fails mesh clearance; do not resize or increase stand-off');
  const mesh=createGatePlaque(builder,{id:'wumen-south-gate-name-plaque',text:'午門',width:p.outerWidth,height:p.outerHeight,depth,layout:'vertical',style:'gate-name',side:'south'});
  mesh.position.set(0,p.centerY,p.backZ);
  mesh.userData.gatePlaque.source=SOURCE.wumen;
  mesh.userData.gatePlaque.dimensions.status='SOURCE_PHOTO_PROPORTION_MODEL_CHOICE_NOT_SURVEY';
  mesh.userData.gatePlaque.mount={kind:'source-proportioned-fixed-reviewed-mount',lowerY,upperY,margin,
    upperFasciaBottomY:upperY,lowerRidgeFrontZ:ridgeHit.point.z,lowerRidgeTopY:band.lowerY,
    surfaceGap:ridgeHit.point.z-p.backZ,wallStandOff:p.wallStandOff,surfaceProbeCount:7,
    dimensionBasis:'OFFICIAL_PHOTO_APPARENT_BLUE_TO_UPPER_WALL_RATIO_NOT_SURVEY',
    blueToNominalUpperWallWidth:p.blueToUpperWallWidth,profileId:profile.id,provisionalStandOff:true,
    sourceStatus:profile.status,cardSha256:profile.provenance.cardSha256};
  return mesh;
}

export function buildShenwuInstitutionPlaque(builder,{platformDepth,platformHeight,tunnelHeight}) {
  const width=9,height=2.5,centerY=platformHeight-1.6,offset=.08;
  if(centerY-height/2<=tunnelHeight || centerY+height/2>=platformHeight) throw new Error('Institution plaque must clear the opening and top strip');
  const mesh=createGatePlaque(builder,{id:'shenwu-north-institution-plaque',text:'故宫博物院',width,height,layout:'horizontal',style:'institution',side:'north'});
  mesh.position.set(0,centerY,platformDepth/2+offset);
  mesh.userData.gatePlaque.source=SOURCE.shenwu;
  mesh.userData.gatePlaque.mount={kind:'north-city-platform-wall',openingTopY:tunnelHeight,topStripBottomY:platformHeight,
    canopyStatus:'ABSENT_IN_RETAINED_MODEL',surfaceGap:offset,dimensionBasis:'PHOTO_PROPORTION_MODEL_FIT_NOT_SURVEY'};
  return mesh;
}

export const SHENWU_GATE_NAME_OMISSION=Object.freeze({
  id:'shenwu-north-dual-script-gate-name-plaque',side:'north',mount:'between-double-eave-roofs',
  status:'DEFERRED_UNVERIFIED_MANCHU_SCRIPT',source:SOURCE.shenwu,
  knownHanText:'神武門',reason:'Verified Manchu transcription, shaping and licensed/system glyph coverage are unavailable; no substitute is rendered.',
});
