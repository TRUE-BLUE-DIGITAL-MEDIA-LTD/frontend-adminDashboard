import { useMemo, useState } from "react";
import Image from "next/image";
import type { ImageLibrary } from "../../../models";
import { decodeBlurhashToCanvas } from "../../../utils/blurHash";

export interface ImageCardProps {
  item: ImageLibrary;
  isAdmin: boolean;
  onSelect(url: string): void;
  onSaveMeta(id: string, body: { category: string; tag: string }): void;
  onDelete(id: string): void;
}

export function ImageCard({
  item,
  isAdmin,
  onSelect,
  onSaveMeta,
  onDelete,
}: ImageCardProps) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(item.category ?? "");
  const [tag, setTag] = useState(item.tag ?? "");
  // Decode is memoized per-hash (avoids re-running the canvas decode on every
  // parent re-render, e.g. each search keystroke) and guarded so one malformed
  // stored hash can't throw inside the grid map and crash the whole modal.
  const blur = useMemo(() => {
    if (!item.blurHash) return undefined;
    try {
      return decodeBlurhashToCanvas(item.blurHash, 32, 32);
    } catch {
      return undefined;
    }
  }, [item.blurHash]);

  return (
    <div className="flex flex-col  rounded-md border border-gray-200 bg-white">
      <button
        type="button"
        className="group relative flex h-40 w-full items-center justify-center overflow-hidden bg-gray-100"
        onClick={() => onSelect(item.url)}
        title="Use this image"
      >
        <Image
          src={item.url}
          alt={item.title}
          fill
          quality={50}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover"
          {...(blur
            ? { placeholder: "blur" as const, blurDataURL: blur }
            : {})}
        />
        <span className="absolute inset-0 z-10 hidden items-center justify-center bg-black/40 text-xs font-semibold text-white group-hover:flex">
          Use image
        </span>
      </button>
      <div className="truncate px-2 pt-2 text-xs font-medium text-gray-800">
        {item.title}
      </div>
      {editing ? (
        <div className="flex flex-col gap-1 p-2">
          <input
            className="rounded border border-gray-300 px-2 py-1 text-xs outline-none focus:border-main-color"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="category"
          />
          <input
            className="rounded border border-gray-300 px-2 py-1 text-xs outline-none focus:border-main-color"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="tags (comma separated)"
          />
          <button
            type="button"
            className="rounded bg-main-color px-2 py-1 text-xs font-medium text-white transition hover:bg-[#1b5669]"
            onClick={() => {
              onSaveMeta(item.id, { category, tag });
              setEditing(false);
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 px-2 pb-1 text-[11px] text-gray-500">
          <span className="font-medium text-gray-600">
            {item.category || "uncategorized"}
          </span>
          {item.tag && <span className="truncate">{item.tag}</span>}
        </div>
      )}
      {isAdmin && !editing && (
        <div className="flex gap-2 px-2 pb-2">
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-100"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
