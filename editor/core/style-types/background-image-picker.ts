import type { Editor as GrapesEditor } from "grapesjs";
import {
  GetSignURLService,
  UploadSignURLService,
} from "@/services/cloud-storage";

/**
 * Custom Style Manager property type for `background-image`. Renders a URL
 * input + Upload button + thumbnail preview. The Upload button opens a file
 * picker; on selection, the file is sent through the dashboard's signed-URL
 * upload flow (cloud-storage service) and the resulting public URL is
 * written into the CSS as `url('<originalURL>')`.
 *
 * Registered via `StyleManager.addType` so the Decorations sector can
 * reference it as `{ property: 'background-image', type: 'background-image-picker' }`.
 */

type ChangePayload = { value: string; partial?: boolean };

function cssUrlToPlain(value: string): string {
  if (!value) return "";
  const match = value.match(/^url\((?:['"]?)(.+?)(?:['"]?)\)$/);
  return match ? match[1] : value;
}

function plainToCssUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  // Escape single quotes in the URL — vanishingly rare but cheap to do.
  return `url('${trimmed.replace(/'/g, "\\'")}')`;
}

export function registerBackgroundImagePickerType(editor: GrapesEditor): void {
  const sm = editor.StyleManager;

  sm.addType("background-image-picker", {
    create({
      change,
    }: {
      change: (payload: ChangePayload) => void;
    }) {
      const root = document.createElement("div");
      root.className = "oxy-bg-image-field";
      root.innerHTML = `
        <label class="oxy-bg-image-drop" aria-label="Click to upload image">
          <input type="file" class="oxy-bg-image-file" accept="image/*" hidden />
          <div class="oxy-bg-image-preview" aria-hidden="true"></div>
          <span class="oxy-bg-image-hint">
            <span class="oxy-bg-image-hint__title">Click to upload</span>
            <span class="oxy-bg-image-hint__sub">or paste a URL below</span>
          </span>
        </label>
        <input
          type="text"
          class="oxy-bg-image-url"
          placeholder="https://example.com/image.jpg"
          spellcheck="false"
          autocomplete="off"
        />
        <div class="oxy-bg-image-actions">
          <span class="oxy-bg-image-status" role="status" hidden></span>
          <button type="button" class="oxy-bg-image-clear">Remove image</button>
        </div>
      `;

      const dropLabel = root.querySelector(
        ".oxy-bg-image-drop",
      ) as HTMLLabelElement;
      const urlInput = root.querySelector(
        ".oxy-bg-image-url",
      ) as HTMLInputElement;
      const fileInput = root.querySelector(
        ".oxy-bg-image-file",
      ) as HTMLInputElement;
      const preview = root.querySelector(
        ".oxy-bg-image-preview",
      ) as HTMLDivElement;
      const clearBtn = root.querySelector(
        ".oxy-bg-image-clear",
      ) as HTMLButtonElement;
      const statusEl = root.querySelector(
        ".oxy-bg-image-status",
      ) as HTMLSpanElement;

      const setPreview = (url: string) => {
        if (url) {
          preview.style.backgroundImage = `url('${url.replace(/'/g, "\\'")}')`;
          dropLabel.classList.add("has-image");
          clearBtn.disabled = false;
        } else {
          preview.style.backgroundImage = "none";
          dropLabel.classList.remove("has-image");
          clearBtn.disabled = true;
        }
      };

      const commit = (url: string) => {
        change({ value: plainToCssUrl(url) });
      };

      urlInput.addEventListener("change", () => {
        commit(urlInput.value.trim());
      });
      urlInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit(urlInput.value.trim());
        }
      });
      urlInput.addEventListener("blur", () => {
        commit(urlInput.value.trim());
      });

      clearBtn.addEventListener("click", () => {
        urlInput.value = "";
        setPreview("");
        commit("");
      });

      const setUploading = (uploading: boolean) => {
        dropLabel.classList.toggle("is-uploading", uploading);
        fileInput.disabled = uploading;
      };

      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        statusEl.hidden = false;
        statusEl.textContent = "";
        statusEl.classList.remove("is-error");
        setUploading(true);

        try {
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

          urlInput.value = sign.originalURL;
          setPreview(sign.originalURL);
          commit(sign.originalURL);

          statusEl.textContent = "Uploaded";
          window.setTimeout(() => {
            statusEl.hidden = true;
          }, 1500);
        } catch (err) {
          statusEl.classList.add("is-error");
          statusEl.textContent =
            (err as { message?: string })?.message ?? "Upload failed";
        } finally {
          setUploading(false);
          // Clear the input so re-uploading the same file fires `change` again.
          fileInput.value = "";
        }
      });

      // Expose setter so update() can sync the input + thumbnail when the
      // selected component or its inline style changes externally.
      (
        root as HTMLElement & {
          __oxySetValue?: (value: string) => void;
        }
      ).__oxySetValue = (value: string) => {
        const url = cssUrlToPlain(value ?? "");
        if (document.activeElement !== urlInput) urlInput.value = url;
        setPreview(url);
      };

      return root;
    },
    emit(
      {
        updateStyle,
      }: {
        updateStyle: (value: string, opts?: { partial?: boolean }) => void;
      },
      { value, partial }: ChangePayload,
    ) {
      updateStyle(value, { partial });
    },
    update({ value, el }: { value: string; el: HTMLElement }) {
      const setter = (el as HTMLElement & {
        __oxySetValue?: (value: string) => void;
      }).__oxySetValue;
      if (setter) setter(value ?? "");
    },
  });
}
