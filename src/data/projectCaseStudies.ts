// Years and services supplied by Nolan; context and credits from reviewed descriptions.
// Missing facts stay absent rather than being inferred from mockups.
export type CaseStudy = {
  context: 'commission' | 'education' | 'concept' | 'collective';
  role: string;
  outputs: string[];
  collaborators?: string[];
  year?: string;
  heroImage?: string;
  services: string[];
};

export const projectCaseStudies: Record<string, CaseStudy> = {
  'n-wah': { heroImage: 'n-wah', context: 'commission', role: 'identity', outputs: ['identity'], year: '2026', services: ['branding'] },
  'brussel-noord-basket': { heroImage: 'brussel-noord-basket', context: 'commission', role: 'identity', outputs: ['logo', 'identity'], year: '2026', services: ['branding', 'socialMedia', 'merchandise'] },
  'shift-festival-2026': { heroImage: 'shift-festival-2026', context: 'education', role: 'graphicTeam', outputs: ['identity', 'guidelines', 'stickers'], collaborators: ['Amber Denblinden', 'Razvan Tanase'], year: '2026', services: ['branding', 'promo', 'merchandise'] },
  'city-to-ocean': { heroImage: 'city-to-ocean', context: 'education', role: 'appCampaign', outputs: ['app', 'campaign'], collaborators: ['Cas Wuyts', 'Noah Goossens', 'Elouan Van Cappellen', 'Raiko Moons'], year: '2026', services: ['webdesign', 'promo', 'merchandise'] },
  'videjo': { heroImage: 'videjo', context: 'commission', role: 'identity', outputs: ['rebrand', 'identity'], year: '2026', services: ['branding', 'merchandise'] },
  'ferraaawri': { heroImage: 'ferraaawri', context: 'concept', role: 'brandConcept', outputs: ['brandConcept', 'guidelines'], year: '2025', services: ['branding', 'promo', 'webdesign'] },
  'erasmus-hogeschool': { heroImage: 'erasmus-hogeschool', context: 'commission', role: 'graphic', outputs: ['poster'], year: '2026', services: ['promo'] },
  'fc-eisbar': { heroImage: 'fc-eisbar', context: 'commission', role: 'identity', outputs: ['crest', 'identity'], year: '2026', services: ['branding'] },
  'la-maison-des-trois-garcons': { heroImage: 'la-maison-des-trois-garcons', context: 'commission', role: 'designDevelopment', outputs: ['logo', 'identity', 'website', 'development'], year: '2026', services: ['branding', 'webdesign'] },
  'studio-by-cas': { heroImage: 'studio-by-cas', context: 'commission', role: 'brandWeb', outputs: ['identity', 'website'], year: '2026', services: ['branding'] },
  'kaai': { heroImage: 'kaai', context: 'collective', role: 'identity', outputs: ['logo', 'identity'], year: '2026', services: ['branding', 'webdesign'] },
  'mentalite-sportswear': { heroImage: 'mentalite-sportswear', context: 'commission', role: 'identity', outputs: ['wordmark', 'icon'], year: '2026', services: ['branding'] },
  'ring-tv': { heroImage: 'ring-tv', context: 'commission', role: 'graphic', outputs: ['lowerThirds', 'graphics'], collaborators: ['Studio By Cas'], year: '2026', services: ['graphics'] },
  'boit-bobby': { heroImage: 'boit-bobby', context: 'commission', role: 'graphic', outputs: ['logo', 'poster'], year: '2026', services: ['promo'] },
  'basisschool-nieuwland': { heroImage: 'basisschool-nieuwland', context: 'education', role: 'webTeam', outputs: ['website'], collaborators: ['Cas Wuyts', 'Noah Goossens', 'Nolan Mortier'], year: '2025', services: ['webdesign'] },
  'happy-dancers': { heroImage: 'happy-dancers', context: 'commission', role: 'graphic', outputs: ['logo', 'poster'], year: '2025', services: ['promo'] },
  'poutrel': { heroImage: 'poutrel', context: 'education', role: 'webTeam', outputs: ['website', 'development'], collaborators: ['Elouan van Cappellen', 'Dozi Mangika', 'Aïmane Karroua'], year: '2024', services: ['webdesign'] },
  'find-your-light': { heroImage: 'find-your-light', context: 'concept', role: 'appConcept', outputs: ['app', 'campaign'], year: '2026', services: ['branding', 'promo'] },
};

export function getProjectCaseStudy(slug: string) {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases: Record<string, string> = {
    nwah: 'n-wah', cto: 'city-to-ocean', ehb: 'erasmus-hogeschool',
    mentalite: 'mentalite-sportswear', nieuwland: 'basisschool-nieuwland',
    lamaisondes3garcons: 'la-maison-des-trois-garcons',
  };
  const alias = Object.keys(aliases).find((key) => normalized.startsWith(key));
  if (alias) return projectCaseStudies[aliases[alias]];
  return projectCaseStudies[slug] ?? Object.entries(projectCaseStudies).find(([key]) => slug.startsWith(`${key}-`))?.[1];
}
