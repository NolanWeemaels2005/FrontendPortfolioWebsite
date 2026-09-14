export const maxUploadBytes = 10 * 1024 * 1024;

export async function prepareProjectImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`“${file.name}” wordt niet herkend als afbeelding. Kies een JPG, PNG of WebP.`);
  }
  if (file.size <= maxUploadBytes) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    throw new Error(`“${file.name}” is groter dan 10 MB. Kies een kleiner bestand.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`“${file.name}” kan niet automatisch worden verkleind. Exporteer de foto als JPG of WebP van maximaal 10 MB.`);
  }

  try {
    const scale = Math.min(1, 4096 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Afbeelding verkleinen mislukt. Kies een bestand van maximaal 10 MB.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.9, 0.8, 0.7]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxUploadBytes) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
      }
    }
    throw new Error(`“${file.name}” blijft te groot. Kies een bestand van maximaal 10 MB.`);
  } finally {
    bitmap.close();
  }
}
