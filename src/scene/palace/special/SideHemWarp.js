// One bounded engineering candidate. No historical cloth/depth claim.
export function createSideHemWarp(options={}){
 if(!options||Array.isArray(options)||typeof options!=='object'||Object.keys(options).some(k=>!['centre','side'].includes(k)))throw Error('Fixed hem controls only');
 const centre=options.centre??.025,side=options.side??.015;
 if(!Number.isFinite(centre)||!Number.isFinite(side)||centre<0||centre>.025||side<0||side>.015)throw Error('Bounded positive hem amplitudes required');
 const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t),kernel=t=>Math.abs(t)>=1?0:(1-t*t)**3;
 // The two negative side kernels have disjoint supports. F' <= 1.5/.14.
 const minJacobian=1-side*1.5/.14;if(minJacobian<=.5)throw Error('Hem map folds');
 const displacement=(x,y)=>{if(![x,y].every(Number.isFinite))throw Error('Finite hem position required');if(y<=.84||y>=1.16)return 0;return(centre*kernel(x/.16)-side*(kernel((x-.23)/.13)+kernel((x+.23)/.13)))*smooth((y-.84)/.06)*(1-smooth((y-1.08)/.08));};
 const mapZ=(x,y,z)=>{if(!Number.isFinite(z))throw Error('Finite hem depth required');const d=displacement(x,y);return d===0||z<=-.02?z:z+d*smooth((z+.02)/.14);};
 return{mapZ,displacement,minJacobian,frontExpansion:side,controls:{centre,side,xSide:.23,xCentreRadius:.16,xSideRadius:.13,y:[.84,.90,1.08,1.16],z:[-.02,.12]},kind:'BOUNDED_FRONT_HEM_COORDINATE_WARP_ENGINEERING_FIT'};
}
