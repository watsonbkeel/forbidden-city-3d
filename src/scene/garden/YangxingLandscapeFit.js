// Authorized actual platform/main-shell footprint, step and narrow access.
// Source beds/paths and full34 random draws remain unchanged.
export const YANGXING_TOP_CUTS=Object.freeze([[53.9,62.9,435.6,450.4],[60.2,63.9,435.9,450.1],[53.5,53.9,441.8,444.2],[49.8,53.5,441.8,444.2]].map(Object.freeze));
export const YANGXING_BORDER_CUT=Object.freeze([50.6,50.9,441.8,444.2]);
function subtract(rect,cut){const[a,b,c,d]=rect,[A,B,C,D]=cut,l=Math.max(a,A),h=Math.min(b,B),s=Math.max(c,C),n=Math.min(d,D);if(l>=h||s>=n)return[rect];return[[a,l,c,d],[h,b,c,d],[l,h,c,s],[l,h,n,d]].filter(([a,b,c,d])=>b-a>1e-9&&d-c>1e-9);}
const check=r=>{if(!Array.isArray(r)||r.length!==4||!r.every(Number.isFinite)||r[0]>=r[1]||r[2]>=r[3])throw Error('Finite positive garden rectangle required');};
export function clipYangxingBedTop(r){check(r);return YANGXING_TOP_CUTS.reduce((rs,c)=>rs.flatMap(r=>subtract(r,c)),[r]);}
export function clipYangxingBedBorder(r){check(r);return subtract(r,YANGXING_BORDER_CUT);}
const certs=[{"kind": "cypress", "seed": 37, "matrix": [-1.1081199645996094, 0, -0.17397789657115936, 0, 0, 1.0776914358139038, 0, 0, 0.16725897789001465, 0, -1.0653250217437744, 0, 58.71370315551758, 0.30000001192092896, 448.8962707519531, 1], "parts": {"trunk": {"count": 2916, "p": "cdb0f177", "n": "fd5158ce", "ix": null}, "crown": {"count": 6480, "p": "e99badb1", "n": "24530eda", "ix": null}}}, {"kind": "tallCypress", "seed": 53, "matrix": [0.14802680909633636, 0, -0.9601109623908997, 0, 0, 0.9313511252403259, 0, 0, 0.9270195364952087, 0, 0.14292488992214203, 0, 61.23890686035156, 0.30000001192092896, 437.11083984375, 1], "parts": {"trunk": {"count": 3210, "p": "db063a8c", "n": "1ddf73a6", "ix": null}, "crown": {"count": 7020, "p": "2581ab3e", "n": "3a4c5914", "ix": null}}}];
const hash=a=>{let h=2166136261;for(const b of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^b,16777619)>>>0;return h.toString(16)};
export function isYangxingWithheldTree(variant,matrix){const a=new Float32Array(matrix.elements),c=certs.find(c=>a[12]===c.matrix[12]&&a[14]===c.matrix[14]);if(!c)return false;
 if(variant.kind!==c.kind||a.some((v,i)=>v!==c.matrix[i]))throw Error('Yangxing exact procedural tree matrix changed');
 for(const k of['trunk','crown']){const g=variant[k],p=c.parts[k];if(g.index!==null||g.drawRange.start!==0||g.drawRange.count!==Infinity||g.groups.length||g.attributes.position?.count!==p.count||hash(g.attributes.position.array)!==p.p||hash(g.attributes.normal.array)!==p.n)throw Error('Yangxing exact procedural tree geometry changed');}return true;}
export function validateYangxingTreeCount(n){if(n!==2)throw Error('Exactly two certified inside procedural trees must yield');}
