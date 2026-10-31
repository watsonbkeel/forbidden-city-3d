/** Reposition a registered face and its own backing atomically. Never select
 * decoration by a shared gold/wood material. Values are reversible model fits. */
export function fitRegisteredNameboard(kit, frame, text, fit) {
 const candidates=kit.plaques.filter(p=>p.text===text&&p.mesh.parent===frame);
 if(candidates.length!==1)throw Error('Nameboard mount requires one exact face: '+text);
 const p=candidates[0];
 if(!p.frame||p.frame.parent!==frame)throw Error('Nameboard backing identity is missing: '+text);
 const old=p.mesh.geometry.parameters;
 const x=fit.x??p.mesh.position.x,y=fit.y??p.mesh.position.y,z=fit.z??p.mesh.position.z;
 const width=fit.width??old.width*p.mesh.scale.x,height=fit.height??old.height*p.mesh.scale.y;
 if(![x,y,z,width,height].every(Number.isFinite)||width<=0||height<=0)throw Error('Invalid fitted nameboard mount');
 p.mesh.position.set(x,y,z);p.frame.position.set(x,y,z+.06);
 p.mesh.scale.set(width/old.width,height/old.height,1);
 p.frame.scale.set((width+.12)/(old.width+.12),(height+.12)/(old.height+.12),1);
 const record={status:'MODEL_NAMEBOARD_CLEARANCE_FIT_NOT_SURVEYED',...fit,position:[x,y,z],width,height};
 p.mesh.userData.nameboardMount=record;p.frame.userData.nameboardMount=record;
 return record;
}
