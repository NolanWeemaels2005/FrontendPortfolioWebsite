"""Usage: python prepare-assets.py /path/to/images\ for\ projects.zip
Requires Pillow. Only writes dedicated detail-page media and its manifest.
"""
from pathlib import Path
from PIL import Image, ImageOps
import zipfile, sys, io, json, hashlib, re
ROOT = Path(__file__).resolve().parents[2]
GROUPS = {'BNB':'brussel-noord-basket','Boit Bobby':'boit-bobby','City To Ocean':'city-to-ocean','ErasmusHogeschool Brussel':'erasmus-hogeschool','FC EIS':'fc-eisbar','Feraaawri':'ferraaawri','Find Your Light':'find-your-light','Happy Dancers':'happy-dancers','Kaai':'kaai','La Maison':'la-maison-des-trois-garcons','Mentalite':'mentalite-sportswear','N:WAH':'n-wah','Nieuwland':'basisschool-nieuwland','Poutrel':'poutrel','RingTV':'ring-tv','Shift Festival':'shift-festival-2026','Studio By Cas':'studio-by-cas','videjo':'videjo'}
manifest = {}
with zipfile.ZipFile(sys.argv[1]) as archive:
 for entry in archive.infolist():
  parts=Path(entry.filename).parts
  if len(parts)!=3 or parts[0]!='images for projects' or parts[-1].startswith('.'): continue
  slug=next((slug for group,slug in GROUPS.items() if parts[1].startswith(group)),None)
  if not slug: raise ValueError('Unmapped asset: '+entry.filename)
  # The curated gallery uses image8 instead of this near-duplicate app view.
  if slug == 'city-to-ocean' and parts[-1] == 'image6.png': continue
  payload=archive.read(entry)
  out=ROOT/'public/assets/project-details'/slug
  out.mkdir(parents=True,exist_ok=True)
  record={'source':entry.filename,'sha256':hashlib.sha256(payload).hexdigest()}
  if parts[-1].endswith('.webm'):
   (out/'motion.webm').write_bytes(payload)
   record['src']=f'assets/project-details/{slug}/motion.webm'
   manifest.setdefault(slug,{})['motion']=record
   continue
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(payload))).convert('RGB')
  record.update(width=im.width,height=im.height,variants=[])
  number=re.search(r'image(\d+)',parts[-1]).group(1)
  for width in sorted(set(min(im.width,w) for w in [800,1600,2400])):
   name=f'image{number}-{width}.webp'
   resized=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
   resized.save(out/name,'WEBP',quality=88,method=6)
   record['variants'].append({'src':f'assets/project-details/{slug}/{name}','width':width})
  manifest.setdefault(slug,{})[number]=record
(ROOT/'src/data/projectCaseAssets.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Prepared {len(manifest)} projects in public/assets/project-details')
