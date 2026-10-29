import assets from "./projectCaseAssets.json";
import { assetPath } from "../utils/asset";

// Only used by the portfolio overview's All Projects cards.
export const portfolioHoverImages = Object.fromEntries(
  Object.entries(assets).map(([slug, project]) => {
    const image = project["2"];
    return [slug, {
      src: assetPath(image.variants[0].src),
      srcSet: image.variants.filter(variant => variant.width <= 1600).map(variant => `${assetPath(variant.src)} ${variant.width}w`).join(", "),
      width: image.width,
      height: image.height,
    }];
  }),
);
