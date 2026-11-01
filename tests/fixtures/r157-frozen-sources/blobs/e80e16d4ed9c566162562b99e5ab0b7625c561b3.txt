// Four explicit screen caps; no gate-roof or ground-domain dispatcher.
export const QIANQING_SCREEN_IDS=Object.freeze([-1,1].flatMap(side=>[0,1].map(part=>`qianqing-screen:${side}:${part}`)));
export function qianqingScreenRegion(side){if(![-1,1].includes(side))throw TypeError('Known Qianqing screen side required');return{minX:side<0?-29.4:19,maxX:side<0?-19:29.4,minZ:201.8,maxZ:207.5};}
export function validateQianqingScreenScope(input,box,region){
 const side=input.id==='qianqing-screen-east'?-1:input.id==='qianqing-screen-west'?1:0;if(!side||input.groundY!==undefined||input.floor!==undefined)throw TypeError('Qianqing screen cap-only identity required');
 const r=qianqingScreenRegion(side),p1=side*22.75,dx=side*6.6*Math.cos(Math.PI/6),dz=-6.6*Math.sin(Math.PI/6),ax=p1+dx*16/17,bx=p1+dx,az=-9+dz*16/17,bz=-9+dz;
 const lo=[Math.min(ax,bx)-.4,0,Math.min(az,bz)-.4+215.3],hi=[Math.max(ax,bx)+.4,7.5,Math.max(az,bz)+.4+215.3];
 if(Object.keys(r).some(k=>Math.abs(region[k]-r[k])>1e-10)||box.min.toArray().some((v,i)=>Math.abs(v-lo[i])>1e-10)||box.max.toArray().some((v,i)=>Math.abs(v-hi[i])>1e-10))throw TypeError('Exact retained Qianqing outer-wall owner and bounded cap region required');
}
