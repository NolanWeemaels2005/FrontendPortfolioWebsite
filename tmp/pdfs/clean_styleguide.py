from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from fontTools.ttLib import TTFont as Font
from fontTools.pens.reportLabPen import ReportLabPen
from PIL import Image
from io import BytesIO
import fitz

ROOT=Path.cwd(); OUT=ROOT/'output/pdf/Nolan-Website-Stijlgids.pdf'
fonts=Path('/Users/nolanweemaels/Library/Fonts')
for name,file in [('Body',fonts/'BricolageGrotesque-Regular.ttf'),('Bold',fonts/'BricolageGrotesque-ExtraBold.ttf')]: pdfmetrics.registerFont(TTFont(name,str(file)))
f=Font('/private/tmp/nolan-ciclo.woff2'); glyphs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm
W,H=595.276,841.89; M=40; CW=W-2*M
BLACK='#000000'; WHITE='#ffffff'; ORANGE='#ee9d59'; MUTED='#bcbcbc'; PANEL='#1b1b1b'
c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('Nolan | Website stijlgids');c.setAuthor('Nolan');c.setSubject('Kleur, typografie, kadrering, licht en toon - een korte stijlgids')
def box(x,y,w,h,color,stroke=None):
 c.setFillColor(HexColor(color));c.setStrokeColor(HexColor(stroke or color));c.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def text(s,x,y,size=10,color=WHITE,font='Body'):
 c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y-size,s)
def para(s,x,y,w,size=10.5,color=MUTED,leading=None,font='Body'):
 st=ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.42,textColor=HexColor(color))
 p=Paragraph(s,st);_,h=p.wrap(w,H);p.drawOn(c,x,H-y-h);return h
def display(s,x,y,size,color=WHITE):
 c.saveState();c.setFillColor(HexColor(color));c.translate(x,H-y-size*.8);c.scale(size/upm,size/upm)
 for ch in s:
  g=cmap.get(ord(ch),'space');path=c.beginPath();path.closePath=path.close;pen=ReportLabPen(glyphs,path);glyphs[g].draw(pen);c.drawPath(path,fill=1,stroke=0);c.translate(glyphs[g].width,0)
 c.restoreState()
def line(y): box(M,y,CW,.6,'#393939')
def label(n,s,y):
 text(n,M,y,10,ORANGE,'Bold');text(s,M+29,y,13,WHITE,'Bold')
def corner(x,y,w,h,fill,r=20):
 c.setFillColor(HexColor(fill));p=c.beginPath();bottom=H-y-h;top=H-y
 p.moveTo(x+r,top);p.lineTo(x+w,top);p.lineTo(x+w,bottom+r);p.curveTo(x+w,bottom+5,x+w-5,bottom,x+w-r,bottom);p.lineTo(x,bottom);p.lineTo(x,top-r);p.curveTo(x,top-5,x+5,top,x+r,top);p.close();c.drawPath(p,fill=1,stroke=0)
def img(path,x,y,w,h):
 im=Image.open(ROOT/path); im.thumbnail((1200,1200)); iw,ih=im.size;scale=max(w/iw,h/ih);dw,dh=iw*scale,ih*scale
 c.saveState();p=c.beginPath();p.rect(x,H-y-h,w,h);c.clipPath(p,stroke=0);encoded=BytesIO();im.convert("RGB").save(encoded,format="JPEG",quality=88);encoded.seek(0);c.drawImage(ImageReader(encoded),x-(dw-w)/2,H-y-h-(dh-h)/2,dw,dh,mask='auto');c.restoreState()
def clipped_img(path,x,y,w,h,r=17):
 c.saveState();p=c.beginPath();b=H-y-h;t=H-y
 p.moveTo(x+r,t);p.lineTo(x+w,t);p.lineTo(x+w,b+r);p.curveTo(x+w,b,x+w,b,x+w-r,b);p.lineTo(x,b);p.lineTo(x,t-r);p.curveTo(x,t,x,t,x+r,t);p.close();c.clipPath(p,stroke=0);img(path,x,y,w,h);c.restoreState()
def header(page):
 box(0,0,W,H,BLACK)
 corner(M,29,32,32,WHITE,10)
 c.setStrokeColor(HexColor(BLACK));c.setLineWidth(1.7)
 for yy in [41,49]: c.line(M+9,H-yy,M+23,H-yy)
 text('STIJLGIDS',M+46,40,8.5,MUTED,'Bold')
 im=Image.open(ROOT/'public/assets/logos/main-logo-white.webp');im.thumbnail((600,600));lw=87;lh=lw*im.height/im.width;c.drawImage(ImageReader(im),W-M-lw,H-33-lh,lw,lh,mask='auto')
 line(802);text('NOLANDESIGN.BE',M,815,7.5,MUTED);text(f'{page:02d} / 02',W-M-32,815,8,MUTED)
header(1)
text('DESIGN DAT',M,102,37,WHITE,'Bold')
text('BLIJFT',M,143,37,WHITE,'Bold');display('HANGEN',M+138,151,38,ORANGE)
para('Dezelfde signatuur op elke pagina: krachtige letters, veel beeld<br/>en een vast ritme van zwart, antraciet en warm oranje.',M,201,CW,10.5)
# Full-width orange information section, as on the live service/about pages.
box(0,255,W,172,ORANGE)
text('01 / KLEUR',M,274,10,BLACK,'Bold')
colors=[(BLACK,'#000000','Basis'),(PANEL,'#1B1B1B','Panelen'),(WHITE,'#FFFFFF','Tekst'),(ORANGE,'#EE9D59','Accent & secties')]
sw=(CW-3*13)/4
for i,(color,hx,role) in enumerate(colors):
 x=M+i*(sw+13);box(x,301,sw,39,color,BLACK if color==ORANGE else None);text(hx,x,349,10,BLACK,'Bold');text(role,x,365,9,BLACK)
para('Wit en oranje op zwart. Zwarte tekst op oranje secties en knoppen.<br/>Projectkleuren blijven in de beelden. De interface houdt zijn vaste zwart-wit-oranje palet.',M,390,CW,9.2,BLACK,leading=12)
label('02','Typografie',450)
text('BRICOLAGE GROTESQUE',M,483,9,ORANGE,'Bold')
para('Basistekst, navigatie en de<br/>strakke delen van grote titels.',M,503,185,9.5)
text('Waar kan ik mee helpen?',252,480,17,WHITE,'Bold')
text('Graphic designer / Van A tot Z gemaakt',252,513,10,WHITE)
line(548)
text('CICLO DISPLAY',M,570,9,ORANGE,'Bold')
para('Expressieve titels en accenten.<br/>Zwaar gewicht; vaak in kapitalen.',M,590,190,9.5)
display('MIJN PROJECTEN',252,572,24,ORANGE)
text('Mijn verhaal / Achter het ontwerp',252,609,10,MUTED)
box(0,651,W,132,PANEL)
label('03','Vorm & ritme',670)
corner(M,707,113,35,ORANGE,10);text('Let’s talk',M+15,717,11,BLACK,'Bold')
corner(M+128,707,113,35,ORANGE,10);corner(M+129,708,111,33,PANEL,9);text('Portfolio',M+148,717,11,WHITE,'Bold')
para('Grote oranje tekstbanden wisselen af met zwarte vlakken. Projectkaarten en knoppen hebben twee afgeronde hoeken. Lijnpijlen sturen naar meer werk.',310,704,245,9.5)
text('Home   /   Portfolio   /   Over mij   /   Contact   /   Blog',M,758,9,MUTED)
c.showPage()
header(2)
# Photo and copy from the site's about section.
im=Image.open(ROOT/'public/assets/about-hero/header-about-1200.jpg').convert('RGB')
im=im.crop((0,0,im.width,round(im.width*220/W)))
pixels=im.load()
for yy in range(im.height):
 shade=1-.75*(yy/(im.height-1))**1.6
 for xx in range(im.width): pixels[xx,yy]=tuple(round(channel*shade) for channel in pixels[xx,yy])
encoded=BytesIO();im.save(encoded,format='JPEG',quality=90);encoded.seek(0)
c.drawImage(ImageReader(encoded),0,H-302,W,220)
text('OVER MIJ',M,219,24,WHITE,'Bold');display('MIJN VERHAAL',M,253,29,ORANGE)
label('04','Kadrering & beeldkeuze',323)
items=[('public/assets/project-heroes/brussel-noord-basket-900.jpg','BNB'),('public/assets/project-heroes/la-maison-des-trois-garcons-900.jpg','LA MAISON'),('public/assets/project-heroes/n-wah-900.jpg','N/WAH'),('public/assets/home-overview/portrait-studio-800.jpg','WIE BEN IK?')]
gap=12;cw=(CW-3*gap)/4
for i,(path,name) in enumerate(items):
 x=M+i*(cw+gap)
 if i==3:
  # Preserve the portrait's original 9:16 framing within the same row.
  pw=157*9/16;clipped_img(path,x+(cw-pw)/2,356,pw,157,12)
 else: clipped_img(path,x,356,cw,157,12)
 text(name,x,526,8.5,WHITE,'Bold')
para('Wissel grote openingsbeelden af met beeldparen en details. Houd de vorm van het ontwerp intact: logo’s en schermen blijven volledig zichtbaar. Ruimte rond het onderwerp geeft rust.',M,550,246,9.5)
text('05 / LICHT & SFEER',310,550,9.5,ORANGE,'Bold')
para('Zwart-witportretten tonen de maker en het proces. Zijlicht en diepe schaduwen geven karakter. De projecten blijven in hun eigen kleuren. Een donkere laag maakt tekst op beeld leesbaar.',310,574,245,9.5)
box(0,660,W,123,ORANGE)
text('06 / TOON',M,678,10,BLACK,'Bold')
text('Projectje starten?',M,704,22,BLACK,'Bold')
para('“Wil je aan een gelijkaardig project beginnen of heb je zelf iets zots in gedachten?”',M,741,260,9.5,BLACK)
para('Persoonlijk, toegankelijk en direct. “Ik” en “je” maken het menselijk; “iets zots” geeft het een speelse, Vlaamse toon. Korte koppen nodigen uit om verder te kijken.',337,704,218,9.5,BLACK)
c.showPage();c.save()
doc=fitz.open(OUT);assert len(doc)==2
for i,page in enumerate(doc):
 page.get_pixmap(matrix=fitz.Matrix(1.35,1.35)).save(str(ROOT/f'tmp/pdfs/clean-{i+1}.png'))
 content=page.get_text().lower()
 assert all(word not in content for word in ['northwell','magenta','live versie','live beeldvoorbeeld','27.10.2026'])
print(OUT);print('Pages:',len(doc),'Bytes:',OUT.stat().st_size)
