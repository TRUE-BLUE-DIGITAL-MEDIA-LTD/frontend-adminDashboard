import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../services/cloud-storage", () => ({
  GetSignURLService: vi.fn(async () => ({
    signURL: "https://sign",
    originalURL: "https://cdn/x.png",
    contentType: "image/png",
    fileName: "x.png",
  })),
  UploadSignURLService: vi.fn(async () => ({ message: "success" })),
}));
vi.mock("../../services/image-library", () => ({
  CreateImageLibraryService: vi.fn(async () => ({})),
}));
vi.mock("../../utils/blurHash", () => ({
  generateBlurHash: vi.fn(async () => "blurhash"),
}));

import { uploadAndIndexImage } from "./upload-image";
import { CreateImageLibraryService } from "../../services/image-library";

const file = { name: "x.png", type: "image/png", size: 10 } as unknown as File;

describe("uploadAndIndexImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admin upload indexes into the library with autoTag", async () => {
    const url = await uploadAndIndexImage(file, { isAdmin: true });
    expect(url).toBe("https://cdn/x.png");
    expect(CreateImageLibraryService).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://cdn/x.png", title: "x.png", autoTag: true }),
    );
  });

  it("non-admin upload does NOT index", async () => {
    const url = await uploadAndIndexImage(file, { isAdmin: false });
    expect(url).toBe("https://cdn/x.png");
    expect(CreateImageLibraryService).not.toHaveBeenCalled();
  });

  it("returns the url even if indexing throws", async () => {
    (CreateImageLibraryService as any).mockRejectedValueOnce(new Error("403"));
    const url = await uploadAndIndexImage(file, { isAdmin: true });
    expect(url).toBe("https://cdn/x.png");
  });
});
