// Bounded engineering silhouette, not a measured or historically certified robe.
export function createRobeProfileField(input){
 if(!Array.isArray(input)||input.length<3||input.length>16||input.some(r=>!Array.isArray(r)||r.length!==4||!r.every(Number.isFinite)||r[0]<.7||r[0]>2||r[1]<.03||r[1]>.7||r[2]> .6||r[3]<-.6||r[2]-r[3]<.04)||input.some((r,i)=>i&&r[0]-input[i-1][0]<.025))throw Error('Bounded ordered robe profile required');
 const p=input.map(r=>r.slice()),count=p.length,m=Array.from({length:count},()=>[0,0,0]);
 for(let c=1;c<4;c++)for(let i=1;i<count-1;i++){const h0=p[i][0]-p[i-1][0],h1=p[i+1][0]-p[i][0],d0=(p[i][c]-p[i-1][c])/h0,d1=(p[i+1][c]-p[i][c])/h1;if(d0*d1>0){const w1=2*h1+h0,w2=h1+2*h0;m[i][c-1]=(w1+w2)/(w1/d0+w2/d1);}}
 // Analytic interval minimum of front-back; no runtime clamping or C1 break.
 for(let i=0;i<count-1;i++){
  const h=p[i+1][0]-p[i][0],d0=p[i][2]-p[i][3],d1=p[i+1][2]-p[i+1][3],s0=h*(m[i][1]-m[i][2]),s1=h*(m[i+1][1]-m[i+1][2]);
  const a=2*d0-2*d1+s0+s1,b=-3*d0+3*d1-2*s0-s1,c=s0,roots=[0,1];
  if(Math.abs(a)<1e-14){if(Math.abs(b)>1e-14)roots.push(-c/(2*b));}else{const disc=4*b*b-12*a*c;if(disc>=0){const q=Math.sqrt(disc);roots.push((-2*b+q)/(6*a),(-2*b-q)/(6*a));}}
  if(roots.filter(t=>t>=0&&t<=1).some(t=>((a*t+b)*t+c)*t+d0<.04-1e-12))throw Error('Robe interpolated depth below bound');
 }
 const section=y=>{if(!Number.isFinite(y))throw Error('Finite robe height required');if(y<=p[0][0])return p[0].slice(1);if(y>=p.at(-1)[0])return p.at(-1).slice(1);let i=0;while(y>p[i+1][0])i++;const h=p[i+1][0]-p[i][0],t=(y-p[i][0])/h,t2=t*t,t3=t2*t;return[1,2,3].map(c=>(2*t3-3*t2+1)*p[i][c]+(t3-2*t2+t)*h*m[i][c-1]+(-2*t3+3*t2)*p[i+1][c]+(t3-t2)*h*m[i+1][c-1]);};
 const cap=.04;
 const distance=(x,y,z)=>{if(![x,y,z].every(Number.isFinite))throw Error('Finite robe point required');const[rx,front,back]=section(y),rz=(front-back)/2,cz=(front+back)/2,dy=y<p[0][0]?y-p[0][0]:y>p.at(-1)[0]?y-p.at(-1)[0]:0;return(Math.hypot(x/rx,(z-cz)/rz,dy/cap)-1)*Math.min(rx,rz);};
 return{section,distance,profile:p.map(r=>r.slice()),bounds:{min:[-Math.max(...p.map(r=>r[1])),p[0][0]-cap,Math.min(...p.map(r=>r[3]))],max:[Math.max(...p.map(r=>r[1])),p.at(-1)[0]+cap,Math.max(...p.map(r=>r[2]))]},kind:'SHAPE_PRESERVING_ROBE_SECTIONS_ENGINEERING_FIT'};
}
