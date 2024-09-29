import { Pagination } from "@mui/material";
import Image from "next/image";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { FaImages, FaLink } from "react-icons/fa6";
import { IoSearchCircleSharp } from "react-icons/io5";
import { MdDelete, MdEditNote } from "react-icons/md";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../models";
import { encode } from "blurhash";

import {
  GetSignURLService,
  UploadSignURLService,
} from "../../services/cloud-storage";
import {
  CreateImageLibraryService,
  DeleteImageLibraryService,
  GetImageLibraryService,
} from "../../services/image-library";
import { useQuery } from "@tanstack/react-query";
import { decodeBlurhashToCanvas, generateBlurHash } from "../../utils/blurHash";

function ImageLibrary() {
  const [trigger, setTrigger] = useState(false);
  const [triggerCreateImage, setTriggerCreateImage] = useState(false);
  const [image, setImage] = useState<{
    url: string;
    file: File;
    blurHash?: string;
  }>();
  const [page, setPage] = useState(1);
  const [searchField, setSearchField] = useState("");
  const [data, setData] = useState<{
    title?: string;
    category?: string;
  }>();
  const toast = useRef<Toast>(null);

  const images = useQuery({
    queryKey: [
      "image-library",
      { page: page, limit: 10, searchField: searchField },
    ],
    queryFn: () =>
      GetImageLibraryService({
        page: page,
        limit: 10,
        searchField: searchField,
      }),
  });

  const show = () => {
    toast.current?.show({
      severity: "info",
      summary: "Info",
      detail: "Link Copied",
    });
  };

  const handleCreateImage = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!image) {
        throw new Error("Please select an image");
      }
      if (!data?.title) {
        throw new Error("Please provide a title");
      }
      if (!image.blurHash) {
        throw new Error("Please select an image with blurHash");
      }
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const signURL = await GetSignURLService({
        fileName: image?.file.name,
        fileType: image?.file.type,
        category: "image-library",
      });

      const upload = await UploadSignURLService({
        contentType: image?.file.type,
        file: image?.file,
        signURL: signURL.signURL,
      });

      const createFile = await CreateImageLibraryService({
        category: data?.category,
        title: data?.title,
        size: image.file.size,
        type: image.file.type,
        url: signURL.originalURL,
        blurHash: image.blurHash,
      });
      await images.refetch();
      Swal.fire({
        title: "Success",
        text: "Image has been uploaded",
        icon: "success",
      });

      setImage(() => undefined);
      setData(() => undefined);
      setTriggerCreateImage(() => false);
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  const handleDeleteImage = async (id: string) => {
    const name = "DELETE";
    const replacedText = name.replace(/ /g, "_");
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Image",
      input: "text",
      footer:
        "Are you sure you want to delete this image? You won't be able to revert this!",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Text does not match";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Trying To Delete",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await DeleteImageLibraryService({
          id: id,
        });
        await images.refetch();
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error,
          text: result.message.toString(),
          footer: "Error Code :" + result.statusCode?.toString(),
          icon: "error",
        });
      }
    }
  };
  return (
    <>
      <Toast ref={toast} />
      {trigger && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen 
         items-center justify-center gap-5 font-Poppins "
        >
          {triggerCreateImage ? (
            <main className="flex h-5/6 w-10/12 rounded bg-white p-5 ">
              <div
                className={`relative h-full w-9/12 
                  ${image ? "bg-white" : "bg-gradient-to-bl from-rose-400 via-fuchsia-500 to-indigo-500"} transition `}
              >
                {image && (
                  <Image
                    src={image?.url}
                    fill
                    className="object-contain"
                    alt="picture"
                  />
                )}
                <label
                  className="absolute  bottom-0 left-0 right-0 top-0 z-10 m-auto flex h-max w-max items-center
                 justify-center gap-1 rounded bg-main-color px-4 py-1 text-white  ring-1
                  ring-white transition hover:bg-[#1b5669] active:scale-105"
                >
                  Upload Picture <FaImages />
                  <input
                    accept="image/png, image/jpeg"
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files) {
                        const file = e.target.files[0];
                        const imageUrl = URL.createObjectURL(file);
                        const blurHash = await generateBlurHash(file);
                        setImage({
                          file,
                          url: imageUrl,
                          blurHash: blurHash,
                        });
                      }
                    }}
                  />
                </label>
              </div>
              <form
                onSubmit={handleCreateImage}
                className="flex h-full w-96 flex-col gap-5 bg-gray-100 p-3"
              >
                <label className="text-xs font-normal">
                  Title
                  <input
                    required
                    name="title"
                    maxLength={50}
                    value={data?.title}
                    onChange={(e) => {
                      setData((prev) => {
                        return {
                          ...prev,
                          title: e.target.value,
                        };
                      });
                    }}
                    type="text"
                    placeholder="type title.."
                    className="h-10 w-full appearance-none rounded p-5 outline-0 ring-1 ring-gray-800"
                  />
                </label>

                <label className="text-xs  font-normal">
                  Category (optional)
                  <input
                    type="text"
                    name="category"
                    value={data?.category}
                    onChange={(e) => {
                      setData((prev) => {
                        return {
                          ...prev,
                          category: e.target.value,
                        };
                      });
                    }}
                    placeholder="type category.."
                    className="h-10 w-full appearance-none rounded p-5 outline-0 ring-1 ring-gray-800"
                  />
                </label>

                <div className="flex w-full justify-between">
                  <span className="text-sm font-normal text-gray-500">
                    size:{" "}
                    {image
                      ? `${(image.file.size / (1024 * 1024)).toFixed(2)} MB`
                      : "None"}
                  </span>
                  <span className="text-sm font-normal text-gray-500">
                    type: {image ? image.file.type : "None"}
                  </span>
                </div>

                <button className="flex items-center justify-center gap-1 rounded bg-main-color px-4 py-1 text-white transition hover:bg-[#1b5669] active:scale-105">
                  Save <FaImages />
                </button>
              </form>
            </main>
          ) : (
            <main className="h-5/6 w-10/12  rounded bg-gray-100 ">
              <header className="flex justify-between gap-2 bg-white p-5 pb-8">
                <div className="flex flex-col items-start gap-1">
                  <label className="text-sm font-normal">
                    Search For Picture
                  </label>
                  <SearchField className="relative  flex w-96 flex-col">
                    <Input
                      value={searchField}
                      onChange={(e) => {
                        setSearchField(e.target.value);
                      }}
                      placeholder="Search For Picture"
                      className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
                    />
                    <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
                  </SearchField>
                </div>
                <button
                  onClick={() => {
                    setTriggerCreateImage(() => true);
                  }}
                  className="flex items-center justify-center gap-1 rounded bg-main-color px-4  py-1 text-white transition hover:bg-[#1b5669] active:scale-105"
                >
                  Upload Picture <FaImages />
                </button>
              </header>
              <div className="mt-5 grid max-h-96 w-full grid-cols-4 gap-5 overflow-auto bg-gray-100 p-5">
                {images.data?.data.map((data, index) => {
                  const blurHash = decodeBlurhashToCanvas(
                    data.blurHash,
                    32,
                    32,
                  );
                  return (
                    <div
                      className="h-60 w-full rounded-md bg-white"
                      key={index}
                    >
                      <div className="group relative h-40 w-full">
                        <div className="absolute left-0 top-0 z-10 rounded-bl-md rounded-tr-md bg-black/70 p-1 text-white">
                          {data.title}
                        </div>
                        <div
                          className="absolute left-0 top-0 z-10  hidden h-full
                       w-full items-center justify-center bg-black/40 backdrop-blur-sm transition group-hover:flex"
                        >
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(data.url);
                              show();
                              const audio = new Audio(
                                "/sounds/notification.mp3",
                              );
                              audio.play();
                            }}
                            className=" flex items-center justify-center 
                          gap-1 rounded bg-main-color px-2
                        py-1 text-xs text-white transition hover:bg-[#1b5669] active:scale-105"
                          >
                            Copy Link <FaLink />
                          </button>
                        </div>
                        <Image
                          src={data.url}
                          fill
                          placeholder="blur"
                          blurDataURL={blurHash}
                          className="object-cover"
                          alt={data.title}
                        />
                      </div>
                      <div className="flex flex-col gap-1 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm text-gray-500">
                            <span className="text-xs">Category: </span>
                            <span className="font-semibold">
                              {data.category}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {(data.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteImage(data.id)}
                            className="flex items-center justify-center gap-1 rounded
                         bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 active:scale-105"
                          >
                            Delete <MdDelete />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <footer className="mt-2 flex w-full justify-center">
                <Pagination page={page} count={images.data?.meta.total} />
              </footer>
            </main>
          )}
          <footer
            onClick={() => {
              setTrigger(() => false);
              setImage(() => undefined);
              setData(() => undefined);
              setTriggerCreateImage(() => false);
              document.body.style.overflow = "auto";
            }}
            className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/70 "
          ></footer>
        </div>
      )}
      <button
        onClick={() => {
          setTrigger(() => true);
          document.body.style.overflow = "hidden";
        }}
        className="flex items-center justify-center gap-1 rounded bg-gray-800 px-4
       py-1 text-white transition hover:bg-gray-900 hover:drop-shadow active:scale-105"
      >
        Image Library <FaImages />
      </button>
    </>
  );
}

export default ImageLibrary;
