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
for name,file in [('Body',fonts/'BricolageGrotesque-Regular.ttf'),('Bold',fonts/'BricolageGrotesque-Bold.ttf'),('Script',ROOT/'public/assets/fonts/Northwell.ttf')]: pdfmetrics.registerFont(TTFont(name,str(file)))
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
def header(page,topic):
 box(0,0,W,H,BLACK)
 logo=Image.open(ROOT/'public/assets/logos/main-logo-white.webp');logo.thumbnail((600,600));lw=89;lh=lw*logo.height/logo.width;c.drawImage(ImageReader(logo),M,H-35-lh,lw,lh,mask='auto')
 text('WEBSITE / STIJLGIDS',W-180,43,9,ORANGE,'Bold');line(82)
 line(799);text('NOLANDESIGN.BE  /  OKTOBER 2026',M,813,8,MUTED);text(f'{topic}    {page:02d} / 02',W-192,813,8,MUTED)
header(1,'VISUELE IDENTITEIT')
display('Een eigen',M,107,39);display('signatuur.',M,151,39,ORANGE)
para('Expressief, persoonlijk en helder. Het werk krijgt de hoofdrol;<br/>zwart, wit en warm oranje verbinden alle pagina’s.',M,205,CW,11.5)
label('01','Kleur',260)
colors=[(BLACK,'Zwart','#000000','Basis'),(WHITE,'Wit','#FFFFFF','Tekst'),(ORANGE,'Warm oranje','#EE9D59','Accent'),(PANEL,'Antraciet','#1B1B1B','Panelen'),('#a30070','Magenta','#A30070','Sfeeraccent')]
gap=10;sw=(CW-4*gap)/5
for i,(color,name,hexv,role) in enumerate(colors):
 x=M+i*(sw+gap);box(x,290,sw,47,color,'#393939' if i==0 else None);text(name,x,346,9.5,WHITE,'Bold');text(hexv,x,362,8.5,MUTED);text(role,x,377,8.5,MUTED)
para('Oranje stuurt de aandacht: knoppen, links en tekstbanden. Magenta blijft een secundair sfeeraccent. Projectkleuren horen bij de beelden; de interface blijft herkenbaar.',M,404,CW,10)
line(458);label('02','Typografie',477)
text('CICLO DISPLAY',M,512,9,ORANGE,'Bold');text('Grote titels / expressief',M,529,9,MUTED);display('Sterk werk.',228,508,31)
text('BRICOLAGE GROTESQUE',M,568,9,ORANGE,'Bold');text('Lopende tekst / navigatie',M,585,9,MUTED);text('Ideeën die blijven hangen.',228,565,16,WHITE,'Bold');text('Duidelijk, compact en goed leesbaar.',228,590,10,MUTED)
text('NORTHWELL',M,625,9,ORANGE,'Bold');text('Kort handgeschreven accent',M,642,9,MUTED);text('Met karakter',228,613,34,ORANGE,'Script')
line(676);label('03','Vorm & interface',693)
corner(M,725,155,43,ORANGE,14);text('Bekijk mijn werk',M+15,738,11,BLACK,'Bold')
c.setStrokeColor(HexColor(BLACK));c.setLineWidth(1.6);x=M+130;y=H-747;c.line(x,y,x+9,y+9);c.line(x+2,y+9,x+9,y+9);c.line(x+9,y+2,x+9,y+9)
para('Afgerond linksboven en rechtsonder. Ruime marges, eenvoudige lijniconen en rustige beweging houden het geheel samen.',215,726,340,10)
c.showPage()
header(2,'BEELDTAAL & TOON')
display('Laat het werk',M,107,34);display('het verhaal vertellen.',M,148,30,ORANGE)
para('Grote beelden, duidelijke focus en afwisseling in schaal.<br/>Mockups laten zien hoe een ontwerp in de praktijk werkt.',M,196,CW,11)
label('04','Kadrering',245)
col=(CW-16)/2
img('public/assets/project-stories/bnb-2-2000.jpg',M,277,col,180)
img('public/assets/project-stories/maison-2-2000.jpg',M+col+16,277,col,180)
text('BNB / focus op de toepassing',M,468,10,WHITE,'Bold');text('LA MAISON / context en ademruimte',M+col+16,468,10,WHITE,'Bold')
para('Plaats het ontwerp centraal. Houd het logo en de belangrijkste details in beeld.',M,488,col,9.5)
para('Toon het ontwerp in een geloofwaardige omgeving. Wissel overzicht en detail af.',M+col+16,488,col,9.5)
line(536)
img('public/assets/project-stories/n-wah-4-2000.jpg',M,558,col,176)
text('N/WAH / gericht licht en contrast',M,745,9,WHITE,'Bold')
text('05',M+col+16,557,10,ORANGE,'Bold');text('Licht & sfeer',M+col+45,555,13,WHITE,'Bold')
para('Zacht daglicht en warme materialen geven mockups diepte. Gerichter licht kan een merkbeeld krachtiger maken, zoals bij N/WAH. Houd details leesbaar en vermijd harde, uitgebeten highlights.',M+col+16,583,col,10)
text('06',M+col+16,665,10,ORANGE,'Bold');text('Toon',M+col+45,663,13,WHITE,'Bold')
para('Persoonlijk, direct en zelfverzekerd. Spreek vanuit “ik”, gebruik “je” en vertel concreet wat je maakt. Korte zinnen; weinig vakjargon.',M+col+16,690,col,10)
text('“Iets in gedachten? Laten we eraan beginnen.”',M,771,11,ORANGE,'Bold')
c.showPage();c.save()
doc=fitz.open(OUT);assert len(doc)==2
for i,page in enumerate(doc): page.get_pixmap(matrix=fitz.Matrix(1.6,1.6)).save(str(ROOT/f'tmp/pdfs/styleguide-{i+1}.png'))
print(OUT)
print('Pages:',len(doc),'Bytes:',OUT.stat().st_size)
