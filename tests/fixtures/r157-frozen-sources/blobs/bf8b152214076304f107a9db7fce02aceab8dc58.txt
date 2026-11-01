/**
 * Original, simplified Taihe coffer artwork. Museum photography informed the
 * dark field / dragon medallion / corner-scroll hierarchy only; no image is
 * embedded or traced. This is illustrative ornament, not a measured replica.
 * Draw once into a cached 512-square CanvasTexture; physical cadence belongs
 * to the ceiling geometry, not this painter. No lighting is baked into it.
 */
export function drawTaiheCeilingTile(ctx, size = 512) {
  const dark = '#142f2c';
  const field = '#193d35';
  const green = '#285446';
  const gold = '#b9a064';
  const goldEdge = '#8e7b4b';
  const lineGold = '#c7b37b';
  const red = '#893d2c';

  // A small explicit path vocabulary keeps the motif deterministic and usable
  // on a normal Canvas2D context without Path2D, assets or browser globals.
  const path = (commands, fill = null, stroke = null, width = 3) => {
    ctx.beginPath();
    for (const [op, ...p] of commands) {
      if (op === 'M') ctx.moveTo(...p);
      else if (op === 'L') ctx.lineTo(...p);
      else if (op === 'C') ctx.bezierCurveTo(...p);
      else if (op === 'Q') ctx.quadraticCurveTo(...p);
      else if (op === 'Z') ctx.closePath();
    }
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  };
  const ring = (radius, width, color) => {
    ctx.beginPath();
    ctx.arc(256, 256, radius, 0, Math.PI * 2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  ctx.save();
  ctx.scale(size / 512, size / 512);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Each edge is the same: adjacent tiles meet without a directional seam.
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = green;
  ctx.fillRect(13, 13, 486, 486);
  ctx.strokeStyle = goldEdge;
  ctx.lineWidth = 4;
  ctx.strokeRect(9, 9, 494, 494);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(21, 21, 470, 470);
  ctx.fillStyle = dark;
  ctx.fillRect(39, 39, 434, 434);
  ctx.fillStyle = field;
  ctx.fillRect(47, 47, 418, 418);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(43, 43, 426, 426);
  ctx.strokeStyle = goldEdge;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(51, 51, 410, 410);

  // Four small scroll clusters. Red stays confined to inset leaf accents.
  for (let corner = 0; corner < 4; corner++) {
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(corner * Math.PI / 2);
    ctx.translate(-256, -256);
    path([
      ['M', 66, 145], ['C', 59, 124, 66, 101, 85, 96],
      ['C', 69, 91, 73, 70, 90, 70], ['C', 101, 70, 108, 80, 102, 89],
      ['C', 99, 95, 88, 94, 87, 87],
      ['M', 85, 96], ['C', 103, 95, 113, 107, 108, 120],
      ['C', 103, 131, 87, 130, 86, 120], ['C', 85, 113, 93, 108, 98, 113],
      ['M', 98, 73], ['C', 113, 61, 132, 62, 145, 66],
      ['M', 107, 99], ['C', 118, 88, 128, 79, 145, 77],
      ['M', 77, 141], ['C', 79, 132, 78, 119, 74, 115],
    ], null, gold, 3.5);
    path([
      ['M', 112, 79], ['C', 118, 70, 129, 70, 134, 73],
      ['C', 127, 80, 119, 84, 112, 79], ['Z'],
      ['M', 69, 103], ['C', 61, 111, 61, 123, 66, 128],
      ['C', 73, 120, 76, 110, 69, 103], ['Z'],
    ], red, goldEdge, 2.5);
    path([
      ['M', 111, 126], ['C', 117, 111, 128, 103, 140, 100],
      ['C', 136, 111, 127, 121, 111, 126], ['Z'],
    ], green, goldEdge, 2.5);
    ctx.restore();
  }

  // A dark medallion field and two quiet rings, never a filled blue disk.
  ctx.beginPath();
  ctx.arc(256, 256, 174, 0, Math.PI * 2);
  ctx.fillStyle = dark;
  ctx.fill();
  ring(174, 4, gold);
  ring(164, 2.5, goldEdge);

  // Cloud curls are intentionally asymmetrical and leave open dark pockets.
  path([
    ['M', 214, 168], ['C', 222, 150, 244, 150, 249, 164],
    ['C', 254, 151, 272, 153, 273, 166], ['C', 290, 159, 299, 171, 290, 181],
    ['C', 280, 190, 263, 181, 253, 184], ['C', 237, 191, 225, 181, 229, 174],
    ['C', 232, 168, 241, 169, 242, 175],
    ['M', 253, 174], ['C', 261, 170, 268, 174, 267, 179],
    ['M', 222, 182], ['C', 215, 182, 209, 179, 207, 175],
  ], null, gold, 3.5);
  path([
    ['M', 241, 296], ['C', 229, 289, 227, 276, 237, 271],
    ['C', 244, 267, 253, 272, 251, 280],
    ['C', 261, 270, 277, 277, 272, 288],
    ['C', 289, 285, 298, 299, 286, 306],
    ['C', 277, 311, 268, 302, 258, 307], ['C', 244, 315, 232, 307, 235, 300],
    ['M', 249, 294], ['C', 257, 289, 265, 293, 262, 299],
  ], null, gold, 3.5);

  // One continuous curved body: tapering upper-right tail, broad outer coil,
  // then an inward neck. It is not a radial collection of dots or circles.
  path([
    ['M', 345, 147], ['C', 305, 119, 256, 119, 217, 139],
    ['C', 176, 161, 151, 195, 151, 241],
    ['C', 150, 289, 179, 332, 225, 348],
    ['C', 268, 363, 317, 343, 334, 303],
    ['C', 347, 272, 339, 243, 316, 232],
    ['C', 296, 222, 280, 228, 267, 241], ['L', 248, 221],
    ['C', 266, 195, 301, 196, 328, 212],
    ['C', 368, 235, 376, 278, 357, 321],
    ['C', 333, 374, 278, 394, 219, 375],
    ['C', 158, 355, 122, 306, 125, 242],
    ['C', 128, 182, 162, 139, 210, 121],
    ['C', 259, 103, 314, 114, 345, 147], ['Z'],
  ], gold, goldEdge, 2.5);

  // Small flowing dorsal fins break the snake-like outline without a dense
  // sawtooth fringe. Their exact anatomy is an original illustrative choice.
  path([
    ['M', 171, 158], ['C', 168, 148, 173, 136, 182, 131],
    ['C', 178, 140, 183, 144, 184, 148], ['Z'],
    ['M', 134, 210], ['C', 121, 202, 121, 189, 126, 181],
    ['C', 126, 194, 137, 195, 141, 197], ['Z'],
    ['M', 145, 310], ['C', 133, 314, 128, 307, 124, 298],
    ['C', 135, 304, 139, 297, 141, 294], ['Z'],
    ['M', 231, 377], ['C', 231, 388, 219, 394, 208, 391],
    ['C', 220, 388, 218, 378, 217, 373], ['Z'],
  ], gold);

  // Belly contour and a sparse row of broad scale arcs survive minification
  // as texture rather than trying to reproduce unresolved museum details.
  path([
    ['M', 319, 137], ['C', 267, 113, 197, 137, 164, 185],
    ['C', 124, 245, 155, 328, 219, 357],
    ['C', 281, 385, 346, 343, 351, 289],
    ['C', 354, 246, 319, 212, 287, 218],
    ['M', 150, 211], ['Q', 136, 212, 135, 222],
    ['M', 150, 237], ['Q', 136, 239, 136, 249],
    ['M', 153, 263], ['Q', 140, 269, 143, 279],
    ['M', 163, 291], ['Q', 150, 300, 157, 310],
    ['M', 183, 318], ['Q', 176, 331, 187, 335],
    ['M', 209, 339], ['Q', 203, 353, 215, 357],
    ['M', 240, 352], ['Q', 238, 366, 251, 367],
    ['M', 272, 351], ['Q', 278, 365, 290, 358],
    ['M', 302, 336], ['Q', 313, 347, 321, 337],
    ['M', 326, 312], ['Q', 340, 318, 344, 306],
  ], null, goldEdge, 2.5);

  // Three bent limbs and open claws. The motif does not assert a historical
  // claw count; the reference is not detailed enough to support one.
  path([
    ['M', 170, 193], ['C', 183, 192, 187, 206, 196, 207],
    ['C', 206, 207, 210, 195, 214, 190],
    ['M', 191, 322], ['C', 203, 316, 199, 301, 210, 297],
    ['C', 219, 293, 220, 285, 217, 277],
    ['M', 339, 290], ['C', 325, 290, 320, 276, 310, 276],
    ['C', 304, 276, 302, 266, 304, 259],
  ], null, gold, 8);
  path([
    ['M', 214, 190], ['Q', 211, 182, 205, 181],
    ['M', 214, 190], ['Q', 217, 180, 223, 180],
    ['M', 214, 190], ['Q', 224, 188, 228, 192],
    ['M', 217, 277], ['Q', 209, 272, 205, 275],
    ['M', 217, 277], ['Q', 214, 267, 218, 264],
    ['M', 217, 277], ['Q', 223, 269, 229, 273],
    ['M', 304, 259], ['Q', 297, 253, 293, 256],
    ['M', 304, 259], ['Q', 302, 250, 307, 246],
    ['M', 304, 259], ['Q', 313, 252, 317, 257],
  ], null, gold, 3.5);

  // A compact, lowered head, two swept horns, flame-like mane and whiskers.
  path([
    ['M', 268, 222], ['C', 273, 211, 271, 201, 263, 195],
    ['C', 264, 207, 256, 210, 251, 213],
    ['M', 256, 243], ['C', 267, 254, 281, 250, 284, 239],
    ['C', 275, 245, 273, 232, 268, 231],
  ], null, gold, 5);
  path([
    ['M', 270, 225], ['C', 262, 217, 258, 207, 250, 209],
    ['L', 243, 216], ['L', 233, 210], ['L', 230, 220],
    ['C', 220, 218, 211, 224, 209, 232], ['L', 197, 237],
    ['L', 202, 245], ['L', 197, 251],
    ['C', 209, 259, 223, 257, 233, 250],
    ['C', 248, 258, 264, 249, 269, 239], ['Z'],
  ], gold, goldEdge, 2.5);
  path([
    ['M', 247, 213], ['C', 254, 199, 244, 184, 252, 174],
    ['M', 250, 194], ['Q', 259, 192, 265, 183],
    ['M', 232, 216], ['C', 227, 201, 216, 198, 219, 185],
    ['M', 225, 203], ['Q', 215, 204, 211, 196],
  ], null, lineGold, 4);
  path([
    ['M', 218, 232], ['Q', 230, 222, 239, 228],
    ['M', 205, 246], ['Q', 216, 251, 228, 242],
    ['M', 244, 239], ['Q', 250, 232, 257, 230],
  ], null, dark, 3.5);
  path([
    ['M', 227, 230], ['L', 232, 230],
    ['M', 205, 240], ['L', 208, 239],
  ], null, dark, 4);
  path([
    ['M', 208, 237], ['C', 188, 227, 177, 234, 181, 246],
    ['C', 183, 252, 191, 253, 194, 248],
    ['M', 213, 253], ['C', 199, 269, 179, 267, 173, 255],
    ['M', 230, 253], ['C', 232, 267, 221, 274, 215, 270],
  ], null, gold, 3.5);

  ctx.restore();
}
