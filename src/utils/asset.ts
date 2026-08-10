const basePath = import.meta.env.BASE_URL;

export function assetPath(path: string) {
  return `${basePath}${path.replace(/^\/+/, "")}`;
}

export function webpImageUrl(url: string | null | undefined, maxWidth = 1600) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url || "";
  const transformation = `f_webp,q_auto,w_${maxWidth},c_limit`;
  return url.replace(
    /\/image\/upload\/(?:f_webp,q_auto(?:,w_\d+,c_limit)?\/)?/,
    `/image/upload/${transformation}/`,
  );
}

export function previewImageUrl(url: string | null | undefined, maxWidth = 320) {
  if (!url) return "";
  if (url.includes("res.cloudinary.com")) return webpImageUrl(url, maxWidth);

  if (url.includes("/assets/project-covers/") && /\/cover[^/]+\.webp$/.test(url)) {
    return url.replace(/\.webp$/, maxWidth <= 320 ? "-320.webp" : "-640.webp");
  }

  if (maxWidth <= 256 && url.includes("/assets/project-logos/") && /\.webp$/.test(url)) {
    return url.replace(/\.webp$/, "-256.webp");
  }

  return url;
}

export function responsiveImageSrcSet(url: string, smallWidth: number, largeWidth: number) {
  const mediumWidth = Math.round((smallWidth + largeWidth) / 2);
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return `${webpImageUrl(url, smallWidth)} ${smallWidth}w, ${webpImageUrl(url, mediumWidth)} ${mediumWidth}w, ${webpImageUrl(url, largeWidth)} ${largeWidth}w`;
  }
  if (!url.endsWith(".webp")) return undefined;
  const hasLocalVariant = url.includes("/assets/project-covers/");
  if (!hasLocalVariant) return undefined;
  const variantUrl = (width: number) => width === 1280 ? url : url.replace(/\.webp$/, `-${width}.webp`);
  return `${variantUrl(smallWidth)} ${smallWidth}w, ${variantUrl(mediumWidth)} ${mediumWidth}w, ${variantUrl(largeWidth)} ${largeWidth}w`;
}
