import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  GetImageLibraryService,
  UpdateImageLibraryService,
  DeleteImageLibraryService,
} from "../../services/image-library";
import { ImageCard } from "./image-library/ImageCard";
import { UploadForm } from "./image-library/UploadForm";

export interface ImageLibraryModalProps {
  isAdmin: boolean;
  onSelect(url: string): void;
  onClose(): void;
}

export default function ImageLibraryModal({
  isAdmin,
  onSelect,
  onClose,
}: ImageLibraryModalProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const images = useQuery({
    queryKey: ["image-library", { page, limit: 12, search, category }],
    queryFn: () =>
      GetImageLibraryService({
        page,
        limit: 12,
        searchField: search,
        category,
      }),
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    images.data?.data.forEach((i) => i.category && set.add(i.category));
    return Array.from(set).sort();
  }, [images.data]);

  async function saveMeta(id: string, body: { category: string; tag: string }) {
    setActionError(null);
    try {
      await UpdateImageLibraryService({
        query: { imageLibraryId: id },
        body,
      });
      images.refetch();
    } catch (err) {
      setActionError(
        (err as { message?: string })?.message ?? "Failed to update image",
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image from the library?")) return;
    setActionError(null);
    try {
      await DeleteImageLibraryService({ id });
      images.refetch();
    } catch (err) {
      setActionError(
        (err as { message?: string })?.message ?? "Failed to delete image",
      );
    }
  }

  const chip = (active: boolean) =>
    "rounded-full border px-3 py-1 text-xs font-medium transition " +
    (active
      ? "border-main-color bg-main-color text-white"
      : "border-gray-300 text-gray-600 hover:bg-gray-100");

  // The editor layout creates stacking/containing contexts (transformed
  // ancestors trap `position: fixed`), so render through a portal to
  // <body> to guarantee the modal sits above the GrapesJS canvas.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-Poppins"
      role="dialog"
      aria-label="Image library"
      onClick={onClose}
    >
      <div
        className="flex h-5/6 w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-gray-200 p-4">
          <input
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-main-color"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search images…"
          />
          {isAdmin && (
            <button
              type="button"
              className="rounded-md bg-main-color px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1b5669]"
              onClick={() => setShowUpload((v) => !v)}
            >
              {showUpload ? "Close upload" : "Upload"}
            </button>
          )}
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xl leading-none text-gray-400 transition hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {actionError && (
          <div
            className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700"
            role="alert"
          >
            {actionError}
          </div>
        )}

        {isAdmin && showUpload && (
          <UploadForm
            onUploaded={(url) => {
              // Immediately apply the just-uploaded image so the user doesn't
              // have to hunt for it in the grid and click again.
              setShowUpload(false);
              onSelect(url);
              onClose();
            }}
          />
        )}

        <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3">
          <button
            type="button"
            className={chip(category === "")}
            onClick={() => {
              setPage(1);
              setCategory("");
            }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={chip(category === c)}
              onClick={() => {
                setPage(1);
                setCategory(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {images.isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading…</div>
        ) : (images.data?.data.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No images found.
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-2 gap-4 overflow-auto p-4 sm:grid-cols-3 md:grid-cols-4">
            {images.data?.data.map((item) => (
              <ImageCard
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onSelect={(url) => {
                  onSelect(url);
                  onClose();
                }}
                onSaveMeta={saveMeta}
                onDelete={remove}
              />
            ))}
          </div>
        )}

        <footer className="flex items-center justify-center gap-4 border-t border-gray-200 p-3 text-sm">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-3 py-1 transition hover:bg-gray-100 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-gray-600">Page {page}</span>
          <button
            type="button"
            className="rounded-md border border-gray-300 px-3 py-1 transition hover:bg-gray-100 disabled:opacity-40"
            disabled={!images.data?.meta.next}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
