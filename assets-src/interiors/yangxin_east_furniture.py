"""R88 bounded east anteroom. All dimensions PHOTO_FIT, not survey.
No lettering, texture photographs, new NPC, or historical inventory claim.
"""
from _common import *

PROFILE={'chairX':-14.6,'chairZ':-2.1,'curtainX':-16.0,'northBoundaryZ':.45,'ceilingY':4.25,'status':'PHOTO_FIT_NOT_SURVEYED'}

def build_east():
    wood=mat('r88_yx_dark_wood',(.105,.058,.035),roughness=.65)
    silk=mat('r88_yx_yellow_silk',(.83,.58,.12),roughness=.9)
    paper=mat('r88_yx_pale_ceiling',(.76,.73,.65),roughness=.98)
    def part(name,w,h,d,x,y,z,m,solid=True):
        ob=box('R88_YX_'+name,w,h,d,x,y,z,m)
        ob['component']='yangxin-east-anteroom';ob['fit']='PHOTO_FIT_NOT_SURVEYED';ob['part']=name
        if solid:
            proxy=box('COL_R88_YX_'+name,w,h,d,x,y,z,None)
            proxy['visibleOwner']=ob.name;proxy['component']='yangxin-east-anteroom';proxy['fit']='PHOTO_FIT_NOT_SURVEYED'
        return ob
    x,z=PROFILE['chairX'],PROFILE['chairZ']
    part('CHAIR',1.36,.12,1.72,x,.57,z,wood)
    part('CHAIR_CUSHION',1.26,.10,1.58,x,.68,z,silk)
    part('CHAIR_BACK',.11,1.10,1.80,x-.67,1.08,z,wood)
    part('CHAIR_BACK_PAD',.055,.77,1.48,x-.595,1.13,z,silk)
    for side in(-1,1):
        part('CHAIR_ARM_'+str(side),1.31,.09,.10,x,.92,z+side*.82,wood)
        for front in(-1,1):
            part('CHAIR_LEG_%s_%s'%(side,front),.10,.51,.10,x+front*.57,.255,z+side*.72,wood)
    part('FOOTSTOOL',.55,.16,1.12,x+1.0,.08,z,wood)
    part('FOOTSTOOL_PAD',.49,.035,1.02,x+1.0,.1775,z,silk)
    # Curtain behind the west-facing chair, not across the retained entry.
    part('CURTAIN_HEADER',.09,.42,3.95,PROFILE['curtainX'],3.18,-2.1,wood)
    part('CURTAIN',.055,1.58,3.80,PROFILE['curtainX']+.05,2.18,-2.1,silk)
    # South window kang: independent base, cushions, three bolsters; not occupied beds.
    part('SOUTH_KANG',8.2,.56,1.27,-11.75,.28,-4.93,wood)
    for i in range(3):
        xx=-14.48+i*2.73
        part('KANG_CUSHION_'+str(i),2.62,.09,1.16,xx,.605,-4.93,silk)
        part('KANG_BACK_'+str(i),2.62,.36,.12,xx,.82,-5.49,silk)
    # North front-room boundary retains a real 1.8m fitted opening near entry.
    n=PROFILE['northBoundaryZ'];lo,hi=-9.7,-7.9
    for name,a,b in[('NORTH_WEST',-17.45,lo),('NORTH_EAST',hi,-6.30)]:
        part(name,b-a,2.75,.12,(a+b)/2,1.375,n,wood)
        part(name+'_TRANSOM',b-a,.47,.12,(a+b)/2,3.075,n,wood)
    part('NORTH_DOOR_HEADER',hi-lo,.47,.12,(hi+lo)/2,3.075,n,wood)
    # Visible low pale ceiling, never exported as WALK_ or an occupied storey.
    part('PALE_CEILING',11.15,.08,5.93,-11.875,PROFILE['ceilingY'],-2.465,paper)
