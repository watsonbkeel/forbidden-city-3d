// Fixed single lower-robe surface, fitted to generated front artwork only.
// Side/back depth and the shallow crossed-leg flow are engineering hypotheses.
const finite=(...a)=>{if(!a.every(Number.isFinite))throw Error('Finite lower-field coordinates required');};
const smax=(a,b,k)=>{const h=Math.max(0,1-Math.abs(a-b)/k);return Math.max(a,b)+k*h*h/4;};
export function createCrossLegRobeField(options={}){
 if(!options||Array.isArray(options)||typeof options!=='object'||Object.keys(options).length)throw Error('Fixed lower-field controls only');
 const top=(x,z)=>{finite(x,z);const peak=c=>Math.exp(-(((x-c)/.23)**2)-(((z-.10)/.27)**2));const diagonal=Math.exp(-(((x-(.06-.3*(z-.08)))/.11)**2)-(((z-.12)/.25)**2));return 1.025+.055*(peak(-.31)+peak(.31))-.012*diagonal;};
 const distance=(x,y,z)=>{finite(x,y,z);const side=.32*(Math.hypot(x/.58,(z-.08)/.32)-1);return smax(smax(side,.795-y,.012),y-top(x,z),.012);};
 return{top,distance,bounds:{min:[-.58,.795,-.24],max:[.58,1.135,.40]},controls:{kind:'SINGLE_CLOSED_LOWER_ROBE_HEIGHT_FIELD',independentKnees:false,width:.58,depth:.32,centerZ:.08,bottom:.795,rounding:.012,upperClip:1.02,engineeringFit:true}};
}
