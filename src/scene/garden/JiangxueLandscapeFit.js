// Two explicitly authorized procedural-bed cuts; sampling paths/beds stay original.
export const JIANGXUE_CUTS=Object.freeze([Object.freeze([-63.5,-53.9,437.7,452.7]),Object.freeze([-53.9,-49.8,443.7,446.7])]);
function subtract(rect,cut){const[a,b,c,d]=rect,[A,B,C,D]=cut,l=Math.max(a,A),h=Math.min(b,B),s=Math.max(c,C),n=Math.min(d,D);if(l>=h||s>=n)return[rect];return[[a,l,c,d],[h,b,c,d],[l,h,c,s],[l,h,n,d]].filter(([a,b,c,d])=>b-a>1e-9&&d-c>1e-9);}
export function clipJiangxueBedRectangle(rect){if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]>=rect[1]||rect[2]>=rect[3])throw Error('Finite positive garden rectangle required');return JIANGXUE_CUTS.reduce((rs,c)=>rs.flatMap(r=>subtract(r,c)),[rect]);}
const expected=[-0.9137044548988342,0,-0.13937237858772278,0,0,0.9138936400413513,0,0,0.14249734580516815,0,-0.9341913461685181,0,-56.595645904541016,0.30000001192092896,443.8860168457031,1];
const hash=a=>{let h=2166136261;for(const b of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^b,16777619)>>>0;return h.toString(16)};
export function isJiangxueWithheldPine(variant,matrix){const a=new Float32Array(matrix.elements);if(a[12]!==expected[12]||a[14]!==expected[14])return false;
 if(variant.kind!=='pine'||a.some((v,i)=>v!==expected[i]))throw Error('Jiangxue precise pine matrix changed');
 for(const[k,count,p,n]of[['trunk',2622,'b1141765','f534f32c'],['crown',5400,'1b94d74d','66262df']]){const g=variant[k];if(g.index!==null||g.drawRange.start!==0||g.drawRange.count!==Infinity||g.groups.length||g.attributes.position?.count!==count||hash(g.attributes.position.array)!==p||hash(g.attributes.normal.array)!==n)throw Error('Jiangxue precise pine geometry changed');}return true;}
export function validateJiangxuePineCount(n){if(n!==1)throw Error('Exactly one certified procedural pine must yield');}
