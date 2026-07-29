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

export function responsiveImageSrcSet(url: string, smallWidth: number, largeWidth: number) {
  const mediumWidth = Math.round((smallWidth + largeWidth) / 2);
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return `${webpImageUrl(url, smallWidth)} ${smallWidth}w, ${webpImageUrl(url, mediumWidth)} ${mediumWidth}w, ${webpImageUrl(url, largeWidth)} ${largeWidth}w`;
  }
  if (!url.endsWith(".webp")) return undefined;
  const hasLocalVariant = smallWidth === 640 && largeWidth === 1280 && url.includes("/assets/project-covers/");
  if (!hasLocalVariant) return undefined;
  const smallUrl = url.replace(/\.webp$/, `-${smallWidth}.webp`);
  const mediumUrl = url.replace(/\.webp$/, `-${mediumWidth}.webp`);
  return `${smallUrl} ${smallWidth}w, ${mediumUrl} ${mediumWidth}w, ${url} ${largeWidth}w`;
}
