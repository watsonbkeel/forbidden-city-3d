/** Source-visible high posts/crosspieces around the third-level seat. Not an
 * identification of a movable four-poster bed or a surveyed room partition. */
export function buildWenyuanUpperFrame(c,{axis,upperY,source}){
 const {f,kit,item,p}=c;
 if(p.key!=='wenyuan'||item.x!==-186.5||item.z!==-132.8||item.w!==40.5||item.d!==17.9||upperY!==5.5||axis!==-3.375||f.position.x!==item.x||f.position.z!==item.z||f.position.y!==0||f.rotation.toArray().slice(0,3).some(Boolean)||f.scale.toArray().some(x=>x!==1)||f.userData.r143WenyuanFrame)throw Error('R143 Wenyuan source frame binding mismatch');
 const md={originalObjectId:'FC-FD3D76E74D',source,level:3,photographyDate:null,scope:'SOURCE_VISIBLE_FRONT_HIGH_FRAME_ONLY_REAR_AND_ROOM_EXTENT_UNMODELED',interpretation:'ROOM_SCREEN_OR_SEAT_ENCLOSURE_CONSTRUCTION_NOT_INDEPENDENTLY_IDENTIFIED',dimensions:'RETAINED_SEAT_ENVELOPE_WITH_PHOTO_FITTED_HEIGHT_NOT_SURVEYED',wholeObjectAccepted:false,residual:['Carving and textiles','Full room screen extent','Historical construction and joinery','Upper automatic access remains withheld']};
 const box=(role,w,h,d,x,y,z)=>{const m=c.box('r143-wenyuan-'+role,'timber',w,h,d,x,y,z,true);m.userData.r143WenyuanFrame=md;kit.colliders.at(-1).r143WenyuanFrame=true;return m;};
 for(const dx of [-1.07,1.07])for(const dz of[-.72])box('upright',.12,2.7,.12,axis+dx,upperY+1.35,2.5+dz);
 for(const dz of[-.72]){
  for(const h of[2.18,2.66])box('upper-horizontal',2.26,.09,.12,axis,upperY+h,2.5+dz);
  for(const dx of[-1.07,1.07])box('upper-side-join',.12,.48,.12,axis+dx,upperY+2.42,2.5+dz);
  for(let i=0;i<5;i++){
   const x=axis+(i-2)*.40;
   for(const yy of[2.28,2.56])box('open-rectangular-frieze',.32,.035,.055,x,upperY+yy,2.5+dz);
   for(const sign of[-1,1])box('open-rectangular-frieze',.035,.28,.055,x+sign*.1425,upperY+2.42,2.5+dz);
  }
 }

 f.userData.r143WenyuanFrame=md;return md;
}
