import { useState } from "react";
import { generateBlurHash } from "../../../utils/blurHash";
import {
  GetSignURLService,
  UploadSignURLService,
} from "../../../services/cloud-storage";
import { CreateImageLibraryService } from "../../../services/image-library";

export interface UploadFormProps {
  /** Called with the uploaded image's public URL once it is saved. */
  onUploaded(url: string): void;
}

/**
 * Admin upload-with-metadata (the curated path): when a title/category/tags are
 * supplied we create the library row directly (no AI). Leaving metadata blank
 * is also fine — uploadAndIndexImage would AI-tag, but here the admin is
 * deliberately curating, so we always pass explicit metadata.
 */
export function UploadForm({ onUploaded }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError("Pick a file and enter a title.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blurHash = await generateBlurHash(file);
      const sign = await GetSignURLService({
        fileName: file.name,
        fileType: file.type,
        category: "image-library",
      });
      await UploadSignURLService({
        file,
        signURL: sign.signURL,
        contentType: file.type,
      });
      await CreateImageLibraryService({
        title: title.trim(),
        category: category.trim() || undefined,
        tag: tag.trim() || undefined,
        url: sign.originalURL,
        type: file.type,
        size: file.size,
        blurHash,
        autoTag: !category.trim(),
      });
      setFile(null);
      setTitle("");
      setCategory("");
      setTag("");
      onUploaded(sign.originalURL);
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-main-color";

  return (
    <form
      className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 p-3"
      onSubmit={submit}
    >
      <input
        type="file"
        accept="image/*"
        className="text-xs"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <input
        className={field}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        className={field}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (optional — AI fills if blank)"
      />
      <input
        className={field}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Tags, comma separated (optional)"
      />
      {error && (
        <div className="w-full text-sm text-red-600">{error}</div>
      )}
      <button
        type="submit"
        className="rounded-md bg-main-color px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1b5669] disabled:opacity-50"
        disabled={busy}
      >
        {busy ? "Uploading…" : "Upload to library"}
      </button>
    </form>
  );
}
