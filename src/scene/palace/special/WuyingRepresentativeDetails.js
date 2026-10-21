import * as THREE from 'three';

const PERIOD='2021_OPENING_PANORAMA_NOT_2026_INVENTORY';
const FIDELITY='COARSE_PHOTOGRAPHED_COLOR_BANDS_NOT_PAINTED_MOTIFS';
const profiles={
  d102:[[0,0],[.40,0],[.43,.035],[.44,.09],[.51,.79],[.54,.87],[.68,.94],[.70,.98],[.69,1],[.63,1],[.62,.96],[.52,.90],[.47,.80],[.405,.13],[.38,.10],[0,.10]],
  '60':[[0,0],[.19,0],[.22,.035],[.22,.075],[.18,.115],[.17,.15],[.23,.20],[.27,.29],[.275,.48],[.25,.56],[.20,.61],[.16,.65],[.145,.70],[.14,.84],[.17,.91],[.235,.97],[.25,.99],[.25,1],[.215,.985],[.15,.915],[.13,.85],[.12,.72],[.20,.50],[.20,.22],[.14,.10],[0,.10]],
};

function mappedUV(geometry,height,offset=0,neutral=false,innerStart=null,profileLength=null){
  const a=geometry.attributes.position,values=[];
  for(let i=0;i<a.count;i++){
    let u=((Math.atan2(a.getX(i),a.getZ(i))/(2*Math.PI))+1)%1;
    if(neutral||(innerStart!==null&&i%profileLength>=innerStart))u=0;
    values.push(u,THREE.MathUtils.clamp((a.getY(i)+offset)/height,0,1));
  }
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(values,2));
}
function zoneTexture(kit,key,neutral){
  const width=64,height=128,data=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const q=(y+.5)/height,front=Math.cos((x+.5)/width*2*Math.PI)<0;let color=neutral;
    if(front){
      if(key==='d102')color=q>.94||q<.08?0x45658c:neutral;
      else if(q>.96)color=0x647b81;
      else if(q>.87)color=0x708b87;
      else if(q>.64&&q<.70)color=0x73a29c;
      else if(q>.58&&q<.64)color=0x7c3149;
      else if(q>.12&&q<.17)color=0x799983;
    }
    const i=(y*width+x)*4;data[i]=color>>16;data[i+1]=(color>>8)&255;data[i+2]=color&255;data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,width,height,THREE.RGBAFormat);
  texture.name=`wuying_photo_color_zones_${key}`;texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
  (kit.ownedTextures??=[]).push(texture);return texture;
}

/** Only two source-mapped existing cases. These are silhouette and coarse
 * visible-front color cues, never reproductions of painted landscapes/dragons.
 * Unseen rear sectors remain neutral. No case positions or colliders change.
 */
export function refineWuyingRepresentative(kit,group,form,key,height,record){
  if(!profiles[key])return;
  const neutral=key==='d102'?0xd8dfda:0xd6ccaa;
  const geometry=new THREE.LatheGeometry(profiles[key].map(([r,y])=>new THREE.Vector2(r*height,y*height)),48);
  mappedUV(geometry,height,0,false,key==='d102'?9:19,profiles[key].length);
  form.geometry.dispose();form.geometry=geometry;form.material.color.setHex(0xffffff);
  form.material.map=zoneTexture(kit,key,neutral);form.material.vertexColors=false;form.material.needsUpdate=true;
  Object.assign(form.userData,{
    refinement:key==='d102'?'R37_PHOTO_SUPPORTED_OPEN_FLARED_CYLINDER':'R37_PHOTO_SUPPORTED_BROAD_VASE_AND_COLLARS',
    representation:'PHOTO_SILHOUETTE_AND_COARSE_VISIBLE_FRONT_BANDS_NOT_PAINTED_MOTIFS',
    actualPeriod:PERIOD,photographyDate:null,unseenSurfacePolicy:'NEUTRAL_NO_INVENTED_REVERSE_DECORATION',
    dimensionStatus:'VISUAL_FIT_NOT_MEASURED',source:record.photoFront,
    viewingOrientation:'LOCAL_NEGATIVE_Z_FITTED_VIEWING_CONVENTION_NOT_VERIFIED_COMPASS_AZIMUTH',
    colorTechnique:'PRIVATE_PROCEDURAL_COLOR_ZONE_MAP_NOT_PHOTOGRAPH_TEXTURE',
  });
  const put=(geo,mat,x,y,z,role,extra={})=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;mesh.name=role;mesh.userData={role,source:record.photoFront,photographyDate:null,actualPeriod:PERIOD,dimensionStatus:'VISUAL_FIT_NOT_MEASURED',...extra};group.add(mesh);return mesh;};
  if(key==='60'){
    // Circular collar placement is a silhouette fit. Painted surfaces on the
    // unseen rear half are deliberately neutral, including the collars.
    for(const [q,r]of[[.16,.185],[.60,.205],[.67,.153],[.88,.16]]){
      const geo=new THREE.TorusGeometry(r*height,.012*height,6,48);geo.rotateX(Math.PI/2);mappedUV(geo,height,q*height);
      put(geo,form.material,0,1.025+q*height,0,'observed-vessel-collar',{fidelity:FIDELITY});
    }
    for(const ear of group.children.filter(o=>o.userData.role==='observed-vessel-ear')){ear.removeFromParent();ear.geometry.dispose();}
    for(const side of[-1,1]){
      const geo=new THREE.TorusGeometry(.072*height,.016*height,8,28);geo.scale(.72,1.25,1);mappedUV(geo,height,0,true);
      put(geo,form.material,side*.205*height,1.025+.78*height,0,'observed-vessel-ear',{representation:'PAIRED_PIERCED_SILHOUETTE_NOT_EXACT_MOTIF'});
    }
  }
  // Photographed cards are visible in these two views. No fabricated caption,
  // accession number, date, QR code or current-inventory statement is printed.
  const labelMaterial=new THREE.MeshStandardMaterial({name:`wuying_observed_label_${key}`,color:0xe4e1d6,roughness:.86});kit.owned.push(labelMaterial);
  const label=put(new THREE.BoxGeometry(.12,.006,.065),labelMaterial,0,.972,-(key==='60'?.47:.39),'observed-case-label',{textPolicy:'NO_UNVERIFIED_LABEL_TRANSCRIPTION'});
  label.rotation.x=.18;
}
