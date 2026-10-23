import * as THREE from 'three';

/** Visible modern annex, not a reconstruction of its removed predecessor.
 * Pane count and offsets are PHOTO_FIT; original measured bay limits and the
 * five existing collision envelopes remain exact. No side-portal change.
 */
export function buildQinanFrontJoinery(kit, frame, geometry) {
  const {datum:{floorY:floor},mainBody:{columnFootGrid:b},southAnnex:n}=geometry;
  const height=n.columnTopY-floor, depth=n.skin.wallThickness;
  const border=new THREE.MeshStandardMaterial({name:'r64_qinan_joinery_border',color:0x92713b,roughness:.78});
  const recess=new THREE.MeshStandardMaterial({name:'r64_qinan_recess_plain',color:0x342b24,roughness:.94});
  kit.owned.push(border,recess);
  const box=(role,w,h,d,x,y,z,bay,material='wood_column')=>{
    const m=kit.box(frame,material,w,h,d,x,y,z,material==='lattice_doors'?'band':'box');
    m.name=role;Object.assign(m.userData,{role,bay,status:'PHOTO_FIT_NOT_JOINERY_SURVEY'});return m;
  };
  for(let i=0;i<5;i++){
    const left=b.xs[i]+n.skin.columnRadius,right=b.xs[i+1]-n.skin.columnRadius;
    const width=right-left,cx=(left+right)/2,bay=i+1;
    // Exactly the old full panel COL, independent of shallow inset render parts.
    const cy=floor+height/2;
    kit.col(frame,cx-width/2,cy-height/2,n.frontZ-depth/2,cx+width/2,cy+height/2,n.frontZ+depth/2);
    box('qinan-annex-front-panel',width,height,depth*.18,cx,floor+height/2,n.frontZ+depth*.41,bay);
    const lower=Math.min(.74,height*.28),edge=.055,rail=.075;
    box('r64-qinan-front-lower-panel',width,lower,depth*.82,cx,floor+lower/2,n.frontZ-depth*.09,bay);
    const top=floor+height-edge,bottom=floor+lower+rail;
    for(const y of [bottom-rail/2,top-edge/2])box('r64-qinan-front-rail',width,rail,depth*.82,cx,y,n.frontZ-depth*.09,bay);
    const fieldW=(width-edge*5)/4,fieldH=top-bottom-edge;
    for(let j=0;j<4;j++){
      const x=left+edge+(j+.5)*fieldW+j*edge;
      const field=box('r64-qinan-front-lattice-field',fieldW,fieldH,depth*.16,x,bottom+fieldH/2,n.frontZ-depth*.16,bay);
      field.material=recess;
      const columns=5,rows=Math.max(2,Math.round(fieldH/(fieldW/columns)));
      Object.assign(field.userData,{fieldIndex:j+1,cellGrid:{columns,rows,status:'PHOTO_FIT_COUNT_NOT_SURVEY'}});
      // Square wooden lattice is visible in the source. Cell counts and stock
      // size are fitted; do not import the generic door texture's gold skirt.
      for(let k=1;k<columns;k++){
        const bar=box('r64-qinan-front-lattice-bar',.014,fieldH,.025,x-fieldW/2+k*fieldW/columns,bottom+fieldH/2,n.frontZ-depth*.29,bay);bar.material=border;Object.assign(bar.userData,{fieldIndex:j+1,axis:'vertical'});
      }
      for(let k=1;k<rows;k++){
        const bar=box('r64-qinan-front-lattice-bar',fieldW,.014,.025,x,bottom+k*fieldH/rows,n.frontZ-depth*.29,bay);bar.material=border;Object.assign(bar.userData,{fieldIndex:j+1,axis:'horizontal'});
      }
      for(const sx of [-1,1]){
        const m=box('r64-qinan-front-border',.025,fieldH,depth*.25,x+sx*(fieldW/2-.0125),bottom+fieldH/2,n.frontZ-depth*.31,bay);m.material=border;
      }
      for(const y of [bottom+.0125,bottom+fieldH-.0125]){
        const m=box('r64-qinan-front-border',fieldW,.025,depth*.25,x,y,n.frontZ-depth*.31,bay);m.material=border;
      }
    }
    for(let j=0;j<=4;j++)box('r64-qinan-front-mullion',edge,top-bottom,depth*.82,left+edge/2+j*(fieldW+edge),(top+bottom)/2,n.frontZ-depth*.09,bay);
  }
  frame.userData.qinanFrontPhotoFit={source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efef832a1c90.jpg',photoDate:null,accepted:false,scope:'Modern visible south-annex red lower fields / inset lattice / narrow borders',dimensions:'PHOTO_FIT_WITHIN_RETAINED_FIVE_BAY_ENVELOPES',collision:'EXACT_RETAINED_FIVE_PANELS',carving:'UNRECONSTRUCTED',annex:'RETAINED_CURRENT_PHOTO_NOT_HISTORIC_REMOVED_VOLUME'};
}
