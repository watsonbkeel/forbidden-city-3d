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
  if(refineNextWuyingForm(kit,group,form,key,height,record))return;
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

// R52: four independent, reversible visual fits from the existing official
// photoFront records. Radii/heights are fractions of each unchanged fitted object height.
// This is not collection identification, measured geometry or a painted replica.
const nextForms={
  d111:{
    profile:[[0,0],[.155,0],[.174,.018],[.185,.06],[.204,.15],[.235,.25],[.273,.37],[.294,.46],[.289,.53],[.262,.59],[.213,.63],[.207,.65],[.159,.665],[.128,.70],[.119,.79],[.125,.88],[.141,.95],[.146,.978],[.136,.991],[.119,.985],[.113,.95],[.101,.79],[.105,.68],[.148,.60],[.221,.45],[.148,.09],[0,.09]],
    supported:['tapered lower jar','rounded broad shoulder','raised irregular crown silhouette','open upper ring'],
    fitted:['relative radii and heights','neutral continuous crown support','simplified front relief masses'],
    crown:[[-.135,.740,-.110,.034,.070,.033,-.20],[-.065,.704,-.153,.030,.047,.035,.35],[.035,.725,-.159,.032,.058,.033,-.22],[.132,.763,-.107,.034,.069,.028,.25],[-.102,.860,-.123,.029,.074,.030,-.38],[-.018,.836,-.147,.026,.048,.028,.22],[.079,.867,-.124,.033,.070,.031,-.10],[-.111,.955,-.086,.023,.045,.024,.18],[.012,.948,-.141,.025,.035,.023,-.23],[.113,.943,-.083,.026,.042,.021,.32]],
  },
  d112:{
    profile:[[0,0],[.142,0],[.171,.017],[.177,.035],[.165,.055],[.142,.085],[.123,.12],[.125,.158],[.134,.176],[.136,.205],[.168,.234],[.205,.282],[.232,.337],[.250,.395],[.257,.437],[.271,.451],[.262,.465],[.241,.493],[.224,.54],[.197,.592],[.159,.635],[.123,.67],[.089,.705],[.074,.763],[.075,.805],[.080,.835],[.085,.884],[.101,.932],[.122,.978],[.132,.993],[.130,1],[.118,.996],[.108,.974],[.090,.93],[.076,.883],[.068,.81],[.061,.75],[.077,.68],[.130,.58],[.174,.40],[.102,.18],[0,.18]],
    supported:['tall flared cup-like mouth','narrow neck','tiered front shoulder relief','broad scalloped shoulder edge','narrow pedestal and flared foot'],
    fitted:['profile proportions','front relief spacing and depth','neutral rear shoulder surface'],
    layers:[{low:.445,high:.643,bottom:.269,top:.149,count:9,width:.165,depth:.021},{low:.603,high:.688,bottom:.184,top:.104,count:7,width:.192,depth:.018}],
  },
  '59':{
    profile:[[0,.30],[.144,.30],[.213,.319],[.277,.361],[.321,.418],[.349,.489],[.354,.559],[.341,.624],[.313,.682],[.276,.722],[.259,.742],[.258,.766],[.288,.775],[.290,.858],[.283,.873],[.259,.873],[.255,.858],[.257,.79],[.233,.773],[.238,.73],[.277,.666],[.307,.59],[.309,.50],[.275,.418],[.205,.365],[0,.359]],
    supported:['rounded belly','short wide cylindrical rim','two outward-rising high handles','three visibly shaped feet'],
    fitted:['handle section and side depth','tripod radial placement','foot curvature and rear surfaces'],
    handle:[[.270,.712],[.329,.727],[.369,.760],[.386,.816],[.393,.900],[.427,.967],[.479,1.014]],
    feet:[{x:0,z:-.244,r:1},{x:-.232,z:.122,r:.92},{x:.232,z:.122,r:.94}],
  },
  '61':{
    profile:[[0,0],[.197,0],[.222,.012],[.242,.038],[.265,.085],[.291,.158],[.318,.255],[.337,.363],[.343,.472],[.335,.566],[.316,.652],[.285,.711],[.247,.753],[.205,.779],[.192,.791],[.190,.816],[.174,.82],[.173,.795],[.229,.752],[.284,.64],[.298,.46],[.274,.23],[.188,.07],[0,.07]],
    supported:['broad high-shouldered jar','low separate domed lid','overhanging lid rim','rounded bulb finial'],
    fitted:['lid/body junction','lid underside','finial proportions and foot ring'],
    lid:[[0,.799],[.195,.799],[.205,.806],[.204,.819],[.197,.85],[.187,.881],[.170,.900],[.128,.909],[.050,.912],[0,.912]],
    finial:[[0,.906],[.027,.906],[.032,.916],[.032,.929],[.042,.940],[.047,.958],[.042,.977],[.028,.991],[.010,1],[0,1.003]],
  },
};

// R52 performance successor: keep every reviewed profile knot and real surface.
// At these 0.54–0.74 m object sizes, 20 angular segments give <=3 mm
// circumferential chord error; only sampling density changes, never the fit.
function nextLathe(points,height,segments=20){
  return new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r*height,y*height)),segments);
}

// A shallow, individually fitted front lobe. Its rear sector does not exist.
function shoulderLobe(layer,angle,height,index){
  const positions=[],uv=[],indices=[],rows=6,cols=4;
  const skew=(index%3-1)*.014;
  for(let row=0;row<=rows;row++){
    const v=row/rows,y=THREE.MathUtils.lerp(layer.low,layer.high,v);
    const radius=THREE.MathUtils.lerp(layer.bottom,layer.top,v)+.006*Math.sin(v*Math.PI);
    const halfWidth=layer.width*(.28+.72*Math.sin((v*.88+.07)*Math.PI));
    for(let col=0;col<=cols;col++){
      const u=col/cols*2-1,a=angle+u*halfWidth+skew*Math.sin(v*Math.PI);
      const r=radius+layer.depth*Math.sin(v*Math.PI)*Math.cos(u*Math.PI/2);
      positions.push(Math.sin(a)*r*height,y*height,-Math.cos(a)*r*height);uv.push(col/cols,v);
      if(row<rows&&col<cols){const p=row*(cols+1)+col;indices.push(p,p+cols+1,p+1,p+1,p+cols+1,p+cols+2);}
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

function risingHandle(points,height,side){
  const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(side*x*height,y*height,0)));
  const left=[],right=[],steps=12;
  for(let i=0;i<=steps;i++){
    const t=i/steps,p=curve.getPoint(t),d=curve.getTangent(t),width=height*(.023+.006*t);
    left.push(new THREE.Vector2(p.x-d.y*width,p.y+d.x*width));right.push(new THREE.Vector2(p.x+d.y*width,p.y-d.x*width));
  }
  const shape=new THREE.Shape([...left,...right.reverse()]);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.038*height,bevelEnabled:true,bevelSize:.003*height,bevelThickness:.003*height,bevelSegments:1,steps:1,curveSegments:1});
  geometry.translate(0,0,-.019*height);return geometry;
}

function refineNextWuyingForm(kit,group,form,key,height,record){
  const spec=nextForms[key];if(!spec)return false;
  const source=record.photoFront;
  const metadata={refinement:'R52_FRONT_PHOTO_FORM',source,actualPeriod:PERIOD,photographyDate:null,dimensionStatus:'VISUAL_FIT_NOT_MEASURED',
    representation:'INDIVIDUAL_FRONT_SILHOUETTE_AND_SIMPLIFIED_VISIBLE_RELIEF_NOT_PAINTED_MOTIFS',unseenSurfacePolicy:'NEUTRAL_NO_INVENTED_REVERSE_DECORATION',
    viewingOrientation:'LOCAL_NEGATIVE_Z_FITTED_VIEWING_CONVENTION_NOT_VERIFIED_COMPASS_AZIMUTH'};
  form.geometry.dispose();form.geometry=nextLathe(spec.profile,height);
  Object.assign(form.userData,metadata,{supportedFeatures:spec.supported,fittedFeatures:spec.fitted,unknownFeatures:['rear ornament','exact dimensions','collection identity','exact sculptural and painted motifs'],formParameters:JSON.parse(JSON.stringify(spec))});
  // Material is already private to this case and owned by kit. Do not mutate a
  // shared museum material or invent a photo texture/painted reverse decoration.
  const put=(geometry,role,x=0,y=0,z=0,extra={})=>{
    const mesh=new THREE.Mesh(geometry,form.material);mesh.position.set(x*height,form.position.y+y*height,z*height);mesh.castShadow=mesh.receiveShadow=true;mesh.name=role;mesh.userData={...metadata,role,...extra};group.add(mesh);return mesh;
  };
  if(key==='d111'){
    // In the photo the applied upper forms are irregular and interrupted. These
    // unique coarse masses preserve their silhouette, not faces/species/stories.
    for(const[x,y,z,rx,ry,rz,tilt]of spec.crown){
      const geo=new THREE.SphereGeometry(1,8,6);geo.scale(rx*height,ry*height,rz*height);geo.rotateZ(tilt);
      const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)*(1+.13*Math.sin(p.getY(i)/height*57+y*17)));geo.computeVertexNormals();
      put(geo,'observed-crown-relief',x,y,z,{surfaceEvidence:'VISIBLE_FRONT_RELIEF_SIMPLIFIED_NOT_EXACT_SCULPTURE'});
    }
    // Unequal low shoulder protrusions, not a repeated generic ring of motifs.
    for(const [x,y,z,sx,sy,sz,rz]of[[-.198,.548,-.196,.033,.055,.018,.60],[-.085,.582,-.248,.045,.021,.020,-.2],[.077,.555,-.263,.050,.024,.019,.45],[.202,.581,-.187,.032,.051,.022,-.65]]){
      const g=new THREE.SphereGeometry(1,8,4);g.scale(sx*height,sy*height,sz*height);g.rotateZ(rz);put(g,'observed-shoulder-relief',x,y,z,{surfaceEvidence:'VISIBLE_FRONT_RELIEF_SIMPLIFIED_NOT_EXACT_SCULPTURE'});
    }
  }else if(key==='d112'){
    for(const layer of spec.layers)for(let i=0;i<layer.count;i++)put(shoulderLobe(layer,-1.25+2.5*i/(layer.count-1),height,i),'observed-layered-shoulder',0,0,0,{surfaceEvidence:'VISIBLE_FRONT_LAYERED_RELIEF_SIMPLIFIED_NOT_EXACT_MOTIF'});
    // The two narrow neck divisions are continuous silhouette fits; no repeated
    // medallions, hidden petal rows or unsupported reverse handles are painted.
    for(const[y,r]of[[.813,.078],[.895,.089]]){
      const g=new THREE.TorusGeometry(r*height,.006*height,4,20);g.rotateX(Math.PI/2);put(g,'observed-neck-collar',0,y,0);
    }
  }else if(key==='59'){
    for(const old of group.children.filter(n=>['observed-vessel-ear','observed-tripod-leg'].includes(n.userData.role))){old.removeFromParent();old.geometry.dispose();}
    for(const side of[-1,1])put(risingHandle(spec.handle,height,side),'observed-vessel-ear');
    for(const foot of spec.feet){
      const points=[[0,0],[.069,0],[.076,.012],[.077,.040],[.070,.085],[.061,.115],[.065,.146],[.086,.180],[.105,.226],[.108,.264],[.092,.300],[.079,.345],[.061,.375],[0,.395]].map(([r,y])=>[r*foot.r,y]);
      put(nextLathe(points,height,12),'observed-tripod-leg',foot.x,0,foot.z);
    }
  }else if(key==='61'){
    put(nextLathe(spec.lid,height),'observed-vessel-lid');put(nextLathe(spec.finial,height,16),'observed-lid-finial');
  }
  return true;
}
