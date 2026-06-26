import {
  GetSignURLService,
  UploadSignURLService,
  type CategoryFile,
} from "../../services/cloud-storage";
import { CreateImageLibraryService } from "../../services/image-library";
import { generateBlurHash } from "../../utils/blurHash";

function categoryFor(type: string): CategoryFile {
  if (type.startsWith("image/")) return "image-library";
  if (type.startsWith("video/")) return "video-library";
  if (type.startsWith("audio/")) return "audio-library";
  return "other-library";
}

/**
 * Upload a file through the signed-URL flow and return its public URL.
 * For admins, image uploads are additionally indexed into the shared image
 * library (best-effort — failures are logged and never block the upload).
 */
export async function uploadAndIndexImage(
  file: File,
  opts: { isAdmin: boolean },
): Promise<string> {
  const sign = await GetSignURLService({
    fileName: file.name,
    fileType: file.type,
    category: categoryFor(file.type),
  });
  await UploadSignURLService({
    file,
    signURL: sign.signURL,
    contentType: file.type,
  });

  if (opts.isAdmin && file.type.startsWith("image/")) {
    try {
      const blurHash = await generateBlurHash(file);
      await CreateImageLibraryService({
        title: file.name,
        url: sign.originalURL,
        type: file.type,
        size: file.size,
        blurHash,
        autoTag: true,
      });
    } catch (err) {
      console.error("[oxy-editor] library index failed", err);
    }
  }

  return sign.originalURL;
}
