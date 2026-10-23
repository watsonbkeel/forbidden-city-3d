"""Schematic section from actual authoring dimensions, not a photo edit."""
import sys,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
base=Path(sys.argv[1]);data=json.loads((base/'geometry-and-navigation.json').read_text());im=Image.new('RGB',(1440,900),'#f6f3eb');d=ImageDraw.Draw(im)
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def txt(p,s,n=23,c='#26343c'):d.text(p,s,font=ImageFont.truetype(font,n),fill=c)
Y=lambda h:710-h*90
for offset,title in [(90,'R53 屏底 + 新低台：悬空差值'),(790,'R54：只延展原红屏 / 竖框下沿')]:
 txt((offset,80),title,26);d.line([(offset-25,Y(.03)),(offset+550,Y(.03))],fill='#6a6963',width=3)
 d.rectangle((offset+55,Y(.23),offset+365,Y(.03)),fill='#d6d3c9',outline='#69665b',width=2)
 d.rectangle((offset+395,Y(5.73),offset+430,Y(1.25)),fill='#9e3429',outline='#671e19',width=2)
 d.rectangle((offset+405,Y(5.87),offset+435,Y(5.69)),fill='#80291f')
 d.rectangle((offset+386,Y(4.52),offset+395,Y(3.88)),fill='#c2a05a')
 txt((offset+180,Y(.23)+24),'低台顶 +0.23 m',20)
 txt((offset+270,Y(5.73)-32),'屏顶 +5.73 m（不变）',21)
 txt((offset+30,760),'示意沿 Z 向的剖面；水平间距不按比例。',20)
 if offset<200:
  d.line([(offset+458,Y(.23)),(offset+458,Y(1.25))],fill='#bb613b',width=4)
  txt((offset+470,Y(.9)),'1.02 m',20);txt((offset+385,Y(1.25)-30),'旧屏底 +1.25',20)
 else:
  d.rectangle((offset+395,Y(1.25),offset+430,Y(.03)),fill='#b95b47',outline='#671e19',width=2)
  txt((offset+255,Y(.9)),'下延 1.22 m',20);txt((offset+272,Y(.03)+26),'底沿拟合后侧地面 +0.03',19)
txt((45,22),'交泰殿屏体修正：保留上部位置，不用假木箱填补旧高台依赖',32)
txt((45,814),'官图支持连续红背屏延至低台后方的下沿；精确高度仍为可逆拟合，不是实测。',22)
txt((45,852),'仅 1 个红屏 + 2 根竖框的下顶点改变；几何截面、UV、材质、上顶点、匾 / 上部纹样保持。',22)
im.save(base/'screen-datum-section.png')
