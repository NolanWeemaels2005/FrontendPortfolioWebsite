import { assetPath } from "../utils/asset";
import assets from "./projectCaseAssets.json";

export type ProjectStoryImage = { src: string; srcSet: string; width: number; height: number; alt: string };
export type ProjectSpread = { layout: "full" | "pair" | "asymmetric" | "inset"; images: number[] };
export type ProjectStory = { recommendationImage: ProjectStoryImage; images: ProjectStoryImage[]; spreads: ProjectSpread[]; video?: string; poster: string };
type Asset = { width: number; height: number; variants: { src: string; width: number }[] };
const inventory = assets as unknown as Record<string, Record<string, Asset>>;

// Numbers refer to the supplied archive, never the shared project thumbnails.
// The first image is the hero. Spreads index into the resulting curated image list.
function story(slug: string, selection: [number, string][], spreads: ProjectSpread[], video?: string): ProjectStory {
  const images = selection.map(([number, alt]) => {
    const asset = inventory[slug][number];
    return { src: assetPath(asset.variants.at(-1)!.src),
      srcSet: asset.variants.map(v => `${assetPath(v.src)} ${v.width}w`).join(", "),
      width: asset.width, height: asset.height, alt };
  });
  // Keep the lightbox sequence in the same reading order as the page.
  const order = [0, ...spreads.flatMap(spread => spread.images)];
  return { recommendationImage: images[selection.findIndex(([number]) => number === 1)],
    images: order.map(index => images[index]),
    spreads: spreads.map(spread => ({ ...spread, images: spread.images.map(index => order.indexOf(index)) })),
    video: video ? assetPath(video) : undefined, poster: images[0].src };
}
const full = (...images: number[]): ProjectSpread => ({ layout: "full", images });
const pair = (...images: number[]): ProjectSpread => ({ layout: "pair", images });
const asymmetric = (...images: number[]): ProjectSpread => ({ layout: "asymmetric", images });
const inset = (...images: number[]): ProjectSpread => ({ layout: "inset", images });

export const projectStories: Record<string, ProjectStory> = {
  "n-wah": story("n-wah", [[5,"N/WAH — translucent identity card"],[1,"N/WAH — identity on green"],[2,"N/WAH — website design system"],[3,"N/WAH — mobile app icon"],[4,"N/WAH — browser identity"]], [asymmetric(1,3),full(2),inset(4)]),
  "brussel-noord-basket": story("brussel-noord-basket", [[2,"Brussel Noord Basket — club uniform on court"],[1,"Brussel Noord Basket — club mark"],[6,"Brussel Noord Basket — embroidered crest"],[3,"Brussel Noord Basket — T-shirt on court"],[4,"Brussel Noord Basket — social profile"],[5,"Brussel Noord Basket — digital and merchandise applications"]], [pair(1,2),full(3),asymmetric(5,4)], "assets/hall-of-fame/bnb-logo.webm"),
  "fc-eisbar": story("fc-eisbar", [[2,"FC Eisbär — football kit"],[1,"FC Eisbär — club identity"],[5,"FC Eisbär — crest detail"],[3,"FC Eisbär — drawstring bag"],[4,"FC Eisbär — embroidered cap"]], [asymmetric(1,2),pair(3,4)], "assets/hall-of-fame/fc-eisbar-logo.webm"),
  "la-maison-des-trois-garcons": story("la-maison-des-trois-garcons", [[3,"La Maison des Trois Garçons — desktop website"],[1,"La Maison des Trois Garçons — wordmark"],[2,"La Maison des Trois Garçons — mobile website"],[4,"La Maison des Trois Garçons — house signage"],[5,"La Maison des Trois Garçons — textile detail"]], [asymmetric(2,1),full(3),inset(4)]),
  "shift-festival-2026": story("shift-festival-2026", [[2,"Shift Festival — street banner"],[1,"Shift Festival — identity"],[5,"Shift Festival — poster"],[4,"Shift Festival — pavement application"],[7,"Shift Festival — tote bag"],[6,"Shift Festival — symbol"],[3,"Shift Festival — team photograph"]], [asymmetric(1,2),full(3),pair(4,5),full(6)]),
  "city-to-ocean": story("city-to-ocean", [[2,"City To Ocean — flag on the beach"],[1,"City To Ocean — identity"],[8,"City To Ocean — mobile application"],[7,"City To Ocean — station poster"],[5,"City To Ocean — tram campaign"],[3,"City To Ocean — tote bag"],[4,"City To Ocean — T-shirt"],[9,"City To Ocean — bottle label"]], [pair(1,2),asymmetric(4,3),pair(5,6),inset(7)]),
  "ferraaawri": story("ferraaawri", [[2,"Ferraaawri — brand campaign"],[1,"Ferraaawri — identity"],[4,"Ferraaawri — packaging"],[5,"Ferraaawri — product display"],[3,"Ferraaawri — street poster"],[6,"Ferraaawri — tennis campaign"],[7,"Ferraaawri — mobile website"],[8,"Ferraaawri — desktop website"]], [asymmetric(2,1),pair(3,4),full(5),pair(6,7)]),
  "find-your-light": story("find-your-light", [[2,"Find Your Light — app interfaces"],[1,"Find Your Light — identity"],[3,"Find Your Light — laptop sticker"],[5,"Find Your Light — street sticker"],[4,"Find Your Light — tram poster"]], [pair(1,2),asymmetric(4,3)]),
  "kaai": story("kaai", [[3,"Kaai — desktop website"],[1,"Kaai — collective identity"],[5,"Kaai — mobile icon"],[4,"Kaai — website layouts"],[2,"Kaai — street campaign"]], [pair(1,2),full(3),full(4)]),
  "studio-by-cas": story("studio-by-cas", [[4,"Studio By Cas — illuminated icon"],[1,"Studio By Cas — wordmark"],[5,"Studio By Cas — symbol"],[2,"Studio By Cas — browser identity"],[3,"Studio By Cas — hoodie"]], [pair(1,2),asymmetric(4,3)]),
  "mentalite-sportswear": story("mentalite-sportswear", [[2,"Mentalité — hoodie"],[1,"Mentalité — wordmark"],[3,"Mentalité — symbol"],[4,"Mentalité — T-shirt"]], [pair(1,2),full(3)]),
  "videjo": story("videjo", [[2,"Videjo — merchandise"],[1,"Videjo — wordmark"],[3,"Videjo — mobile application"]], [pair(1,2)], "assets/project-details/videjo/motion.webm"),
  "ring-tv": story("ring-tv", [[2,"Ring TV — broadcast graphics"],[1,"Ring TV — Het Internaat title"],[3,"Ring TV — television title graphics"]], [pair(1,2)], "assets/project-details/ring-tv/motion.webm"),
  "basisschool-nieuwland": story("basisschool-nieuwland", [[2,"Basisschool Nieuwland — desktop website"],[1,"Basisschool Nieuwland — homepage"],[3,"Basisschool Nieuwland — mobile website"]], [asymmetric(2,1)]),
  "poutrel": story("poutrel", [[3,"Poutrel — desktop website"],[1,"Poutrel — visual identity"],[2,"Poutrel — mobile website"]], [asymmetric(2,1)]),
  "boit-bobby": story("boit-bobby", [[2,"Boit Bobby — event poster on a door"],[1,"Boit Bobby — event identity"],[3,"Boit Bobby — poster in the street"]], [asymmetric(2,1)]),
  "happy-dancers": story("happy-dancers", [[2,"Happy Dancers — poster application"],[1,"Happy Dancers — visual identity"],[3,"Happy Dancers — poster detail"]], [pair(1,2)]),
  "erasmus-hogeschool": story("erasmus-hogeschool", [[2,"Erasmushogeschool Brussel — poster campaign"],[1,"Erasmushogeschool Brussel — poster design"]], [inset(1)]),
};
