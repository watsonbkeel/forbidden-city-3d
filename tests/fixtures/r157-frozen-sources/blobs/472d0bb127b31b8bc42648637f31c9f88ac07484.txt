import * as THREE from 'three';
import { COLUMN_INTENSITY_BASE64, COLUMN_INTENSITY_WIDTH, COLUMN_INTENSITY_HEIGHT } from './TaiheColumnIntensityData.js';
import { TAIHE_CORE as P } from './TaiheCoreProfile.js';

// AI-generated decorative interpretation of raised painted/gilded dragon/cloud decoration.
// No museum photograph pixels, traced artifacts, measured decorative depths or fonts.
// Dimensions below are authoring estimates. Bump is shading only, not displacement.
export const TAIHE_COLUMN_ATLAS = Object.freeze({width:256,height:512,u0:1/16,u1:15/16,v0:1/32,v1:31/32,neutralUV:Object.freeze([0,0]),bumpScale:.0015});
const A=TAIHE_COLUMN_ATLAS,TAU=2*Math.PI;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function authoredHeight() {
  // Baked AI-generated artwork, not captured physical height. Decode once on
  // first material construction; the atlas cache below owns the final pixels.
  const bytes=atob(COLUMN_INTENSITY_BASE64),field=new Float32Array(bytes.length);
  for(let i=0;i<bytes.length;i++)field[i]=bytes.charCodeAt(i)/255;
  return {field,w:COLUMN_INTENSITY_WIDTH,h:COLUMN_INTENSITY_HEIGHT};
}
export function createTaiheColumnAtlas() {
  const {field,w:fw,h:fh}=authoredHeight(),colorMips=[],reliefMips=[];
  const neutralColor=[255,255,255,255],neutralRelief=[0,255,0,255];
  const coverage=field.filter(v=>v>.15).length/field.length;
  let gpuBytes=0;
  for(let w=A.width,h=A.height; ; w=Math.max(1,w>>1),h=Math.max(1,h>>1)) {
    const color=new Uint8Array(w*h*4),relief=new Uint8Array(w*h*4);gpuBytes+=color.byteLength+relief.byteLength;
    const period=w*7/8,x0=w/16,y0=h/32,span=h*15/16,pad=w/32;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
      const i=(y*w+x)*4;let c=neutralColor,r=neutralRelief;
      if(w>=32&&x>=x0-pad&&x<x0+period+pad&&y>=y0&&y<h-y0){
        // Box-filter independently in periodic shaft space, then restore gutters.
        // Never downsample neighboring neutral pixels into the ornament tile.
        const sx=((x-x0)%period+period)%period,scale=fw/period;
        let height=0,count=0;
        for(let yy=0;yy<scale;yy++)for(let xx=0;xx<scale;xx++){
          const px=Math.floor((sx+.5)*scale+xx-scale/2+fw)%fw,py=clamp(Math.floor((y-y0+.5)*fh/span+yy-scale/2),0,fh-1);
          height+=field[py*fw+px];count++;
        }
        height/=count;
        const fade=Math.min(1,(y-y0+.5)/(h/64),(h-y0-y-.5)/(h/64));height*=clamp(fade);
        // Original gold factor is unchanged. Colored recesses only darken it;
        // raised ridges approach white modulation, never invented brightness.
        const gold=clamp(.86+height*.14),blue=clamp(.80+height*.20);
        c=[Math.round(255*gold),Math.round(255*(gold-.015*(1-height))),Math.round(255*blue),255];
        r=[Math.round(height*255),Math.round(255*(.54+.28*(1-height))),0,255];
      }
      color.set(c,i);relief.set(r,i);
    }
    colorMips.push({data:color,width:w,height:h});reliefMips.push({data:relief,width:w,height:h});
    if(w===1&&h===1)break;
  }
  return {width:A.width,height:A.height,color:colorMips[0].data,relief:reliefMips[0].data,colorMips,reliefMips,heightCoverage:coverage,gpuBytes};
}
let cachedPixels;
export function attachTaiheColumnTextures(material,shared=null) {
  const textures=shared??(()=>{
    cachedPixels??=createTaiheColumnAtlas();
    const make=(mips,colorSpace)=>{
      const t=new THREE.DataTexture(mips[0].data,A.width,A.height,THREE.RGBAFormat,THREE.UnsignedByteType);
      t.mipmaps=mips;t.colorSpace=colorSpace;t.generateMipmaps=false;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.flipY=false;t.needsUpdate=true;return t;
    };
    return {color:make(cachedPixels.colorMips,THREE.SRGBColorSpace),relief:make(cachedPixels.reliefMips,THREE.NoColorSpace)};
  })();
  material.map=textures.color;material.bumpMap=textures.relief;material.roughnessMap=textures.relief;material.bumpScale=A.bumpScale;material.needsUpdate=true;
  if(!shared){let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;textures.color.dispose();textures.relief.dispose();}});}
  return textures;
}
export function columnSurfaceUVs(points) {
  const centre=P.columns.x.flatMap(x=>P.columns.goldZ.map(z=>[x,z])).find(c=>points.every(p=>p[1]>=.19999&&p[1]<=P.columns.height+.00001&&Math.hypot(p[0]-c[0],p[2]-c[1])<=.52001));
  const caps=points.every(p=>Math.abs(p[1]-.2)<1e-5)||points.every(p=>Math.abs(p[1]-P.columns.height)<1e-5);
  if(!centre||caps)return points.map(()=>[...A.neutralUV]);
  const angles=points.map(p=>{const a=Math.atan2(p[2]-centre[1],p[0]-centre[0])/TAU+.5;return Math.min(a,1-a)<1e-5?0:a;});
  if(Math.max(...angles)-Math.min(...angles)>.5)for(let i=0;i<angles.length;i++)if(angles[i]<.5)angles[i]+=1;
  return points.map((p,i)=>[A.u0+angles[i]*(A.u1-A.u0),A.v0+(p[1]-.2)/(P.columns.height-.2)*(A.v1-A.v0)]);
}
export function mapTaiheGoldSurfaces(group) {
  group.traverse(o=>{
    if(!o.isMesh||o.material.name!=='taihe_gold')return;
    const g=o.geometry,p=g.attributes.position; if(g.index)throw new Error('Taihe gold UV assignment requires final unindexed batch');
    const uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i+=3){const points=[0,1,2].map(k=>[p.getX(i+k),p.getY(i+k),p.getZ(i+k)]);columnSurfaceUVs(points).forEach((v,k)=>uv.set(v,(i+k)*2));}
    g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  });
}
