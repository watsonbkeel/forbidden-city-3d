// Original simplified gilt scroll/rosette fields. Museum photographs inform the
// red framing / gold decorated-field hierarchy only: no pixels, tracing, measured
// relief, authentic dragon anatomy, exact motif count or calibrated colors.
// Uses previously unused pixels of the EXISTING 1024² lettering atlas. All
// commands are finite, deterministic and padded away from plaque/couplet regions.
export const TAIHE_FURNISHING_TILES = Object.freeze({
  atlasSize: 1024,
  screen: Object.freeze({ x: 176, y: 400, width: 256, height: 608 }),
  dais: Object.freeze({ x: 448, y: 400, width: 560, height: 160 }),
});

export function taiheFurnishingCommands() {
  const commands=[];
  const rect=(x,y,w,h,color)=>commands.push({kind:'rect',x,y,w,h,color});
  const line=(points,width,color)=>commands.push({kind:'line',points,width,color});
  const scroll=(cx,cy,sx,sy,mirror=1)=>{
    // Curl is an original geometric rhythm, deliberately not historical carving.
    const path=[[-.85,.22],[-.57,-.04],[-.20,-.03],[.06,-.46],[.53,-.60],[.85,-.30],[.75,.08],[.35,.20],[.17,-.03],[.37,-.21],[.55,-.09]];
    const points=path.map(([x,y])=>[cx+x*sx*mirror,cy+y*sy]);
    line(points,4.5,'#62442d');line(points.map(([x,y])=>[x-.8,y-1.1]),1.8,'#e1c58a');
    line([[cx-.70*sx*mirror,cy+.43*sy],[cx-.32*sx*mirror,cy+.21*sy],[cx+.12*sx*mirror,cy+.42*sy]],1.8,'#c9a465');
  };
  const s=TAIHE_FURNISHING_TILES.screen;
  // Six-pixel bleed surrounds each sample rectangle, preventing neighboring
  // lettering/blank pixels from entering ordinary mip levels at oblique views.
  rect(s.x-6,s.y-6,s.width+12,s.height+12,'#984b31');
  rect(s.x,s.y,s.width,s.height,'#a25033');
  rect(s.x+8,s.y+8,s.width-16,s.height-16,'#dbb973');
  rect(s.x+13,s.y+13,s.width-26,s.height-26,'#68462d');
  rect(s.x+17,s.y+17,s.width-34,s.height-34,'#b28b4e');
  // Staggered small curls give the existing raised simplified figures a gilt
  // decorated field beneath them; no new geometric silhouettes or registers.
  for(let row=0;row<14;row++)for(let col=0;col<4;col++){
    const x=s.x+43+col*56+(row%2?3:-3),y=s.y+40+row*40;
    scroll(x,y,23,25,(row+col)%2?1:-1);
    rect(x-1,y+17,2,3,'#dec38a');
  }
  // Narrow inner line retains a legible wood/gilded hierarchy at distance.
  line([[s.x+21,s.y+21],[s.x+s.width-21,s.y+21],[s.x+s.width-21,s.y+s.height-21],[s.x+21,s.y+s.height-21],[s.x+21,s.y+21]],1.5,'#e0c080');
  const d=TAIHE_FURNISHING_TILES.dais;
  rect(d.x-6,d.y-6,d.width+12,d.height+12,'#683128');
  rect(d.x,d.y,d.width,d.height,'#783b2c');
  rect(d.x+1,d.y+8,d.width-2,5,'#d2b16d');
  rect(d.x+1,d.y+d.height-13,d.width-2,5,'#c9a663');
  rect(d.x+1,d.y+18,d.width-2,3,'#3e3028');
  rect(d.x+1,d.y+d.height-21,d.width-2,3,'#3e3028');
  for(let i=0;i<8;i++){
    const x=d.x+35+i*70,y=d.y+80;
    // Alternating small rosettes and linked scrolls, illustrative only.
    const diamond=[[x,y-31],[x+24,y],[x,y+31],[x-24,y],[x,y-31]];
    line(diamond,4,'#ad8449');line(diamond.map(([a,b])=>[a,b-1.5]),1.5,'#ddbd7d');
    scroll(x,y+4,17,25,i%2?1:-1);
    line([[x+27,y-5],[x+33,y-13],[x+39,y-5],[x+33,y+3],[x+27,y-5]],2,'#bc9556');
  }
  return commands;
}

export function paintTaiheFurnishingTiles(context) {
  for(const command of taiheFurnishingCommands()) {
    if(command.kind==='rect'){
      context.fillStyle=command.color;context.fillRect(command.x,command.y,command.w,command.h);
    } else {
      context.beginPath();context.strokeStyle=command.color;context.lineWidth=command.width;
      context.lineJoin='round';context.lineCap='round';
      command.points.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));context.stroke();
    }
  }
}
