#!/usr/bin/env python3
"""CPU triangle reference of the current four-by-four fragment discard.
The existing actual Taihe cache is verified/exported separately. No browser,
GPU, character shadow, alpha composite, world reconstruction or loading UI.
"""
import hashlib
import json
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('reports/r50-followup/readiness-visual-v1')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def font(size):
    return ImageFont.truetype(FONT, size)

def screen_door_threshold(x, y, viewport_height):
    # Input image coordinates are top-left. GLSL gl_FragCoord is bottom-left,
    # pixel centers; floor(h - (y + .5)) = h - y - 1.
    cp_x = x % 4
    cp_y = (viewport_height - y - 1) % 4
    return ((cp_x % 2) * 8 + (cp_y % 2) * 4 + (cp_x // 2) * 2 + cp_y // 2 + .5) / 16

def raster(model, visibility, w=520, h=680, yaw=-30, pitch=.10, scale=263, center=(0,1.06,.13)):
    bg=np.array([.78,.79,.775],np.float32)
    image=np.empty((h,w,3),np.float32);image[:]=bg
    image*=.90+.10*np.arange(h)[:,None,None]/h
    depth_buffer=np.full((h,w),-1e9,np.float32)
    actor_pixels=np.zeros((h,w),bool)
    yaw=math.radians(yaw)
    right=np.array([math.cos(yaw),0,-math.sin(yaw)])
    up=np.array([-math.sin(pitch)*math.sin(yaw),math.cos(pitch),-math.sin(pitch)*math.cos(yaw)])
    view=np.array([math.cos(pitch)*math.sin(yaw),math.sin(pitch),math.cos(pitch)*math.cos(yaw)])
    rotation=np.stack([right,up,view]);center=np.array(center)
    light=np.array([-.55,.82,.48]);light/=np.linalg.norm(light)
    fill=np.array([.80,.30,-.40]);fill/=np.linalg.norm(fill)
    def project(vertices):
        q=(vertices-center)@rotation.T
        return np.column_stack([w/2+q[:,0]*scale,h/2-q[:,1]*scale,q[:,2]])
    # Furniture is opaque and unchanged in every frame. Character triangles
    # individually discard fragments BEFORE either color or depth is written.
    for mesh,is_character in [(m,False) for m in model['fixtures']]+[(model['mesh'],True)]:
        if is_character and visibility<=0:
            continue
        p=np.array(mesh['positions']).reshape(-1,3)
        n=np.array(mesh['normals']).reshape(-1,3)
        c=np.array(mesh['colors']).reshape(-1,3)
        indices=np.array(mesh['indices']).reshape(-1,3)
        projected=project(p)
        for triangle in indices:
            v=projected[triangle]
            minx=max(0,int(math.floor(v[:,0].min())));maxx=min(w-1,int(math.ceil(v[:,0].max())))
            miny=max(0,int(math.floor(v[:,1].min())));maxy=min(h-1,int(math.ceil(v[:,1].max())))
            if minx>maxx or miny>maxy:continue
            normal=np.cross(p[triangle[1]]-p[triangle[0]],p[triangle[2]]-p[triangle[0]])
            if normal@view<=0:continue
            x1,y1=v[0,:2];x2,y2=v[1,:2];x3,y3=v[2,:2]
            denominator=(y2-y3)*(x1-x3)+(x3-x2)*(y1-y3)
            if abs(denominator)<1e-9:continue
            yi,xi=np.mgrid[miny:maxy+1,minx:maxx+1]
            x=xi+.5;y=yi+.5
            a=((y2-y3)*(x-x3)+(x3-x2)*(y-y3))/denominator
            b=((y3-y1)*(x-x3)+(x1-x3)*(y-y3))/denominator
            cc=1-a-b
            inside=(a>=-.001)&(b>=-.001)&(cc>=-.001)
            z=a*v[0,2]+b*v[1,2]+cc*v[2,2]
            depth=depth_buffer[miny:maxy+1,minx:maxx+1]
            mask=inside&(z>depth)
            if is_character:
                mask &= visibility > screen_door_threshold(xi,yi,h)
            if not np.any(mask):continue
            normals=a[...,None]*n[triangle[0]]+b[...,None]*n[triangle[1]]+cc[...,None]*n[triangle[2]]
            normals/=np.maximum(np.linalg.norm(normals,axis=-1)[...,None],1e-7)
            colors=a[...,None]*c[triangle[0]]+b[...,None]*c[triangle[1]]+cc[...,None]*c[triangle[2]]
            lighting=.44+.49*np.maximum(0,normals@light)[...,None]+.12*np.maximum(0,normals@fill)[...,None]
            colors=np.clip(colors*lighting,0,1)
            tile=image[miny:maxy+1,minx:maxx+1]
            tile[mask]=colors[mask];depth[mask]=z[mask]
            actor_pixels[miny:maxy+1,minx:maxx+1][mask]=is_character
    image=np.where(image<=.0031308,image*12.92,1.055*np.maximum(image,0)**(1/2.4)-.055)
    return Image.fromarray(np.uint8(np.clip(image,0,1)*255)),actor_pixels

def validate_threshold():
    y,x=np.mgrid[0:4,0:4]
    thresholds=screen_door_threshold(x,y,4)
    assert np.array_equal(np.sort(thresholds.ravel()),(np.arange(16)+.5)/16)
    assert not np.any(0>thresholds)
    assert np.all(1>thresholds)
    return thresholds.tolist()

def main():
    data=json.loads((ROOT/'readiness-source.json').read_text())
    thresholds=validate_threshold()
    assert data['source']['currentExpandedTrianglesEqualFrozenCache']
    assert data['screenDoor']['alphaBlending'] is False
    assert data['screenDoor']['shadowGenerated'] is False
    assert len(data['readinessProgress'])==4
    w,h=520,680
    banner_h=70;footer_h=108
    sheet=Image.new('RGB',(w*4,h+banner_h+footer_h),(26,32,39))
    draw=ImageDraw.Draw(sheet)
    draw.text((18,12),'READY -> VISIBLE  |  0.35-second character fade',font=font(26),fill=(235,239,244))
    draw.text((18,44),'Actual current emperor mesh + unchanged cached Taihe throne; original seat binding retained.',font=font(18),fill=(188,201,214))
    frames=[];raw_frames=[];masks=[];report=[]
    for i,entry in enumerate(data['readinessProgress']):
        frame,mask=raster(data['model'],entry['characterVisibility'],w=w,h=h)
        raw_frames.append(np.asarray(frame).copy());masks.append(mask)
        overlay=ImageDraw.Draw(frame)
        label='READY / HIDDEN' if i==0 else 'FULLY VISIBLE' if i==3 else 'APPEARING'
        overlay.text((18,18),label,font=font(23),fill=(27,33,39))
        overlay.text((18,50),f"+{entry['seconds']:.3f} s after ready",font=font(17),fill=(46,53,60))
        overlay.text((18,h-35),'Same furniture / no character shadow',font=font(15),fill=(40,48,55))
        sheet.paste(frame,(i*w,banner_h))
        if i:draw.line((i*w,banner_h,i*w,banner_h+h),fill=(80,89,98),width=2)
        frame.save(ROOT/f"readiness-frame-{i+1:02d}.png")
        frames.append(frame)
        report.append({**entry,'characterVisiblePixels':int(mask.sum()),'renderedPixelSha256':hashlib.sha256(raw_frames[-1].tobytes()).hexdigest()})
        print(f"Rendered frame {i+1}/4 ({int(mask.sum())} actor pixels)",flush=True)
    # Each partial image contains exactly the unblended final character pixel
    # wherever admitted, and the unchanged empty-throne image elsewhere.
    base,full=raw_frames[0],raw_frames[-1]
    y,x=np.mgrid[0:h,0:w]
    for i,entry in enumerate(data['readinessProgress']):
        expected_mask=masks[-1] & (entry['characterVisibility']>screen_door_threshold(x,y,h))
        assert np.array_equal(masks[i],expected_mask),'coverage does not match the fragment discard rule'
        expected=base.copy();expected[expected_mask]=full[expected_mask]
        assert np.array_equal(raw_frames[i],expected),'found alpha blending or changed background pixels'
    footer_y=banner_h+h
    for row,line in enumerate([
        'CPU SOFTWARE REFERENCE ONLY. Not a browser/GPU screenshot or a complete scene-loading recording.',
        '4 x 4 fragment discard, not alpha blending. Same camera, geometry and base colors; idle motion held still.',
        'Local cached palace triangles; textures omitted. Character cast shadows OFF. Global NPC progress is separate timed evidence.',
        'Female appearance approval is still pending. Production CHARACTER_ROLLOUT_APPROVED remains false.',
    ]):
        draw.text((18,footer_y+10+row*23),line,font=font(17),fill=(223,231,239) if row==0 else (182,196,210))
    target=ROOT/'readiness-four-frames.png';sheet.save(target)
    # The 21 simulation ticks span 0.35 s. A labelled four-stop inspection GIF
    # deliberately holds each stop for 600 ms; it is not a real-time recording.
    gif=[]
    for frame,entry in zip(frames,data['readinessProgress']):
        canvas=Image.new('RGB',(w,h+88),(26,32,39));canvas.paste(frame,(0,0));d=ImageDraw.Draw(canvas)
        d.text((14,h+9),'CPU reference / slowed inspection playback',font=font(17),fill=(231,237,244))
        d.text((14,h+33),'Not GPU footage or a full loading recording.',font=font(16),fill=(187,201,214))
        d.text((14,h+57),'Original 0.35 s fade shown as four held stops.',font=font(16),fill=(187,201,214))
        gif.append(canvas)
    gif[0].save(ROOT/'readiness-inspection-slowed.gif',save_all=True,append_images=gif[1:],duration=600,loop=0,disposal=2)
    audit={'evidence':'CPU raster mathematical and pixel-integrity checks, not GPU validation','thresholdsTopLeft4x4':thresholds,'origin':'GLSL bottom-left coordinate conversion applied','alphaBlending':False,'shadowsGenerated':False,'fixturePixelsOutsideFinalCharacterUnchanged':True,'partialPixelsExactlyEqualOpaqueCharacterOrUnchangedFurniture':True,'frameCount':4,'frames':report,'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(ROOT.glob('*.png'))},'gifPlayback':'Four held 600 ms stops for inspection, not real-time footage; original readiness duration 0.35 s.'}
    audit['files']['readiness-inspection-slowed.gif']=hashlib.sha256((ROOT/'readiness-inspection-slowed.gif').read_bytes()).hexdigest()
    (ROOT/'raster-validation.json').write_text(json.dumps(audit,indent=2)+'\n')
    print(json.dumps({'image':str(target),'sha256':audit['files'][target.name],'pixelChecksPassed':True},indent=2))

if __name__=='__main__':main()
