import React, { useEffect, useState } from "react";
import { Button, Form, Input } from "react-aria-components";
import { ErrorMessages, SimCard } from "../../models";
import { Dropdown } from "primereact/dropdown";
import { Service, services } from "../../data/services";
import Image from "next/image";
import { blurDataURL } from "../../data/blurDataURL";
import Swal from "sweetalert2";
import { CreateTagOnSimcardService } from "../../services/simCard/tag";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetSimCardByPageService } from "../../services/simCard/simCard";
import { MdDashboardCustomize } from "react-icons/md";
import { FaList } from "react-icons/fa6";

type CreateTagsOnSimcardProps = {
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  simcard: SimCard;
  simCards: UseQueryResult<ResponseGetSimCardByPageService, Error>;
};
function CreateTagsOnSimcard({
  setTrigger,
  simcard,
  simCards,
}: CreateTagsOnSimcardProps) {
  const [tag, setTag] = useState<Service | null>(null);
  const [triggerCustom, setTriggerCustom] = useState<boolean>(false);
  const inputRefCustom = React.useRef<HTMLInputElement>(null);
  const [customTag, setCustomTag] = useState<string>("");
  const handleAddTag = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!tag && triggerCustom === false) {
        throw new Error("Tag is required");
      }
      Swal.fire({
        title: "Adding Tag",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await CreateTagOnSimcardService({
        simCardId: simcard.id,
        tag: triggerCustom ? customTag : (tag?.title as string),
        icon: triggerCustom
          ? "https://storage.googleapis.com/storage-oxyclick/public/favicon.png"
          : (tag?.icon as string),
      });

      await simCards.refetch();

      Swal.fire({
        title: "Tag Added",
        text: "Tag has been added successfully",
        icon: "success",
      });
      setTrigger(() => false);
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (triggerCustom && inputRefCustom.current) {
      inputRefCustom.current.focus();
    }
  }, [triggerCustom]);
  return (
    <div className=" fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen items-center justify-center">
      <Form
        onSubmit={handleAddTag}
        className="relative flex h-max w-96 flex-col  items-center justify-start 
        gap-5 rounded-lg border  border-gray-100 bg-gradient-to-r from-gray-50  to-gray-200 
        p-5 drop-shadow-xl"
      >
        <header className="border-b border-gray-400 ">
          <h4 className="w-full text-center text-sm font-semibold text-gray-500">
            {simcard.phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "($1) $2-$3")}
          </h4>
          <h1 className="w-full text-xl font-bold text-black">
            Create Tags On Simcard
          </h1>
        </header>
        <div className="flex w-full flex-col items-end gap-1 ">
          {triggerCustom ? (
            <button
              type="button"
              onClick={() => setTriggerCustom(() => false)}
              className="flex w-28 items-center justify-center gap-1 rounded-md bg-green-300
           px-2 py-1 text-sm text-green-600 hover:bg-green-400"
            >
              select <FaList />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTriggerCustom(() => true);
              }}
              className="flex w-28 items-center justify-center gap-1 rounded-md bg-green-300
           px-2 py-1 text-sm text-green-600 hover:bg-green-400"
            >
              custom <MdDashboardCustomize />
            </button>
          )}
          <Input
            ref={inputRefCustom}
            onChange={(e) => setCustomTag(e.target.value)}
            value={customTag}
            type="text"
            className="h-10 w-full rounded-md p-2"
            name="tag"
            placeholder="Enter a custom tag"
            hidden={!triggerCustom}
          />
          <Dropdown
            hidden={triggerCustom}
            value={tag}
            onChange={(e) => setTag(e.value)}
            className="w-full"
            options={services}
            optionLabel="title"
            placeholder="select a tag"
            itemTemplate={(item: Service) => (
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5 overflow-hidden rounded-md">
                  <Image
                    fill
                    className="object-contain"
                    src={item.icon}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    alt={item.slug}
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                  />
                </div>

                <span>{item.title}</span>
              </div>
            )}
          />
        </div>
        <Button type="submit" className="main-button rounded-md py-1">
          add
        </Button>
      </Form>
      <footer
        onClick={() => setTrigger(() => false)}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen
        bg-black/30  "
      ></footer>
    </div>
  );
}

export default CreateTagsOnSimcard;
