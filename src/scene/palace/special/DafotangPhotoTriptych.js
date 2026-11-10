import * as T from 'three';

// EX-001 isolated spike, not a claim of completed restoration.
// The host must supply a CODE-REVIEWED allowlist, never external form/JSON claims.
// Empty by design: no licensed target photographs have been accepted for shipping.
export const DAFOTANG_APPROVED_PHOTOS = Object.freeze({});
const SUBJECTS = Object.freeze({west:'amitabha', center:'shakyamuni', east:'bhaisajyaguru'});
const SLOTS = Object.freeze(['west', 'center', 'east']);
const SOURCE_URLS = Object.freeze([
  'https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf',
  'https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf',
]);
const text = s => typeof s === 'string' && s.trim().length > 0;
const positive = n => Number.isFinite(n) && n > 0;
const isHttps = s => { try { return new URL(s).protocol === 'https:'; } catch { return false; } };
const vector = a => Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);
const sha = s => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
const copy = a => JSON.parse(JSON.stringify(a));

/**
 * Synchronous, no loading/network, no host mutation, no substitute asset.
 * manifest: [{slot, assetId, fit:{status:'MODEL_FIT_NOT_SURVEY',figureBase:[x,y,z]}}]
 * approvedAssets: trusted host registry keyed by assetId (see isolated test fixture).
 * textures: already decoded THREE.Textures keyed by assetId. Host must actually
 * verify original image bytes against registry sourceSha256 before assigning
 * texture.userData.sourceSha256. This function does not cryptographically hash
 * decoded pixels and cannot establish copyright/identity from image content.
 *
 * Local axis contract is the EXISTING mirrored-map Dafotang frame: +X WEST,
 * -X EAST, +Y UP, -Z SOUTH/front. South-facing viewer's left is +X.
 * figureBase is center-X/bottom-Y of the figure AND lotus, excluding square dais.
 * Bounds are normalized source pixels [left,top,right,bottom], no mirroring.
 */
export function buildDafotangPhotoTriptych({manifest, textures={}, approvedAssets=DAFOTANG_APPROVED_PHOTOS}={}) {
  const reasons=[];
  const fail=(code, slot=null)=>reasons.push({code,slot});
  if (!Array.isArray(manifest) || manifest.length !== 3 ||
      SLOTS.some(slot => manifest.filter(m => m?.slot === slot).length !== 1)) {
    fail('THREE_AUTHORIZED_PHOTOS_REQUIRED');
  }
  const records=[];
  if (!reasons.length) for (const slot of SLOTS) {
    const m=manifest.find(m=>m.slot===slot);
    const a=Object.hasOwn(approvedAssets ?? {}, m.assetId) ? approvedAssets[m.assetId] : null;
    if (!a) { fail('HOST_APPROVED_ASSET_REQUIRED',slot); continue; }
    if (a.subjectId !== SUBJECTS[slot]) fail('IDENTITY_MISMATCH',slot);
    if (a.assetId !== m.assetId || !text(a.rightsHolder) || !text(a.license) || !text(a.permissionEvidence) ||
        !isHttps(a.sourceUrl) || !sha(a.sourceSha256) || a.publicRedistribution !== true ||
        a.subjectConfirmed !== true || a.unmirrored !== true || a.transparentBackground !== true) fail('PHOTO_NOT_APPROVED',slot);
    const b=a.figureAndLotusBounds, dims=a.pixelDimensions;
    if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isFinite) ||
        b.some(n=>n<0||n>1) || b[0]>=b[2] || b[1]>=b[3] ||
        !Array.isArray(dims) || dims.length!==2 || !dims.every(n=>Number.isInteger(n)&&n>0)) fail('CROP_INVALID',slot);
    if (m.fit?.status !== 'MODEL_FIT_NOT_SURVEY' || !vector(m.fit.figureBase)) fail('MODEL_FIT_REQUIRED',slot);
    const source=Object.hasOwn(textures, m.assetId) ? textures[m.assetId] : null;
    const image=source?.image;
    const w=image?.naturalWidth || image?.videoWidth || image?.width;
    const h=image?.naturalHeight || image?.videoHeight || image?.height;
    if (!source?.isTexture || !positive(w) || !positive(h) || image?.complete === false) fail('DECODED_TEXTURE_REQUIRED',slot);
    else {
      if (source.userData?.sourceSha256 !== a.sourceSha256) fail('TEXTURE_SOURCE_MISMATCH',slot);
      if (w!==dims?.[0] || h!==dims?.[1]) fail('TEXTURE_DIMENSION_MISMATCH',slot);
      // Avoid silent vertical inversions and externally supplied UV mirroring.
      if (source.flipY !== true || source.repeat.x!==1 || source.repeat.y!==1 || source.offset.x || source.offset.y || source.rotation) fail('TEXTURE_ORIENTATION_INVALID',slot);
    }
    records.push({slot,m,a,source});
  }
  if (!reasons.length) {
    const [west,center,east]=records.map(r=>r.m.fit.figureBase[0]);
    if (!(west>center && center>east)) fail('WEST_EAST_ORDER_INVALID');
    if (new Set(records.map(r=>r.m.assetId)).size!==3) fail('THREE_DISTINCT_ASSETS_REQUIRED');
  }
  const incomplete={historicalInventoryAccepted:false, wholeHallInventory:'UNKNOWN', visualValidated:false,
    representation:'THREE_FIXED_FRONT_ONLY_PHOTO_CUTOUT_PLANES', newColliders:0, newWalkables:0,
    coordinateContract:'LOCAL_POSITIVE_X_WEST__NEGATIVE_X_EAST__NEGATIVE_Z_SOUTH',
    sourceUrls:[...SOURCE_URLS], figureAndLotusHeight:2.25, figureAndLotusHeightUnit:'m', squareDaisIncluded:false,
    dimensionStatus:'FIGURE_AND_LOTUS_HEIGHT_SOURCED__PLACEMENT_AND_CROP_MODEL_FIT',
    missing:['approved distributable target photographs','actual GPU and near-view visual QA','side and rear representation','host collision and lifecycle integration']};
  if (reasons.length) return {status:'BLOCKED', reasons, group:null, meshes:[], ownedMaterials:[], ownedTextures:[], metadata:incomplete};

  const group=new T.Group(), meshes=[], ownedMaterials=[], ownedTextures=[];
  group.name='dafotang-historical-three-photo-prototype';
  const metadata={...incomplete, missing:incomplete.missing.filter(s=>s!=='approved distributable target photographs'),
    scope:'HISTORICAL_PHOTO_PRESENTATION_NOT_CURRENT_INVENTORY_ACCEPTANCE',
    lighting:'BAKED_PHOTO_LIGHTING_WITH_REALTIME_MODULATION_PENDING_VISUAL_QA',
    permissionStatus:'HOST_REVIEWED_ALLOWLIST_ASSERTIONS_NOT_AUTOMATIC_LEGAL_VERIFICATION',
    photos:records.map(r=>copy(r.a))};
  group.userData.dafotangPhotoTriptych=metadata;
  let disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;for(const m of meshes)m.geometry.dispose();for(const m of ownedMaterials)m.dispose();for(const t of ownedTextures)t.dispose();};
  try {
    for (const {slot,m,a,source} of records) {
      const [u0,v0,u1,v1]=a.figureAndLotusBounds;
      const height=2.25/(v1-v0), width=height*a.pixelDimensions[0]/a.pixelDimensions[1];
      const map=source.clone(); ownedTextures.push(map);
      map.colorSpace=T.SRGBColorSpace; map.anisotropy=8; map.needsUpdate=true;
      const material=new T.MeshStandardMaterial({name:`dafotang-photo-${slot}`,map,
        roughness:1,metalness:0,transparent:false,alphaTest:.5,depthTest:true,depthWrite:true,side:T.FrontSide});
      ownedMaterials.push(material);
      const geometry=new T.PlaneGeometry(width,height);
      const mesh=new T.Mesh(geometry,material); meshes.push(mesh);
      mesh.name=`dafotang-photo-${slot}-${a.subjectId}`;
      mesh.rotation.y=Math.PI; // visitor-left source pixels become local +X.
      const [x,y,z]=m.fit.figureBase;
      mesh.position.set(x+(u0+u1-1)*width/2,y+(v1-.5)*height,z);
      mesh.castShadow=false; mesh.receiveShadow=true;
      mesh.userData={slot,subjectId:a.subjectId,assetId:m.assetId,
        figureAndLotusHeight:2.25,positionStatus:'MODEL_FIT_NOT_SURVEY',sourceSha256:a.sourceSha256};
      group.add(mesh);
    }
    return {status:'READY_FOR_HOST_QA', reasons:[], group, meshes, ownedMaterials, ownedTextures, metadata, dispose};
  } catch (error) { dispose(); throw error; }
}
