import React, { memo, useEffect, useState } from "react";
import {
  FavoriteOnSimCard,
  MessageOnSimcard,
  SimCard,
  SimCardOnPartner,
  StatusPort,
  TagOnSimcard,
} from "../../models";
import { MdDevices, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import moment from "moment";
import { Sms } from "@mui/icons-material";
import { FcPhoneAndroid, FcSimCard } from "react-icons/fc";
import { BsFlag } from "react-icons/bs";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetDeviceUsersService } from "../../services/simCard/deviceUser";
import { FaDharmachakra } from "react-icons/fa6";
import { GrStatusInfo } from "react-icons/gr";
import SpinLoading from "../loadings/spinLoading";
import { BiCheckCircle } from "react-icons/bi";
import { getRandomSlateShade, getSlateColorStyle } from "../../utils/random";
import { IoIosPricetags, IoIosRemoveCircle, IoIosTimer } from "react-icons/io";
import { Editor } from "@tinymce/tinymce-react";
import { IoSave } from "react-icons/io5";
import Countdown from "react-countdown";
import Image from "next/image";
import { blurDataURL } from "../../data/blurDataURL";

type Props = {
  slotInUsed: boolean;
  activeSimcards:
    | (SimCard & {
        messages?: MessageOnSimcard[];
      })[]
    | undefined;
  sim: SimCard & {
    partner?: SimCardOnPartner;
    tag?: TagOnSimcard[];
    isLoading?: boolean;
  };
  isloading?: boolean;
  onUpdateNoted: (note: { content: string; simcardId: string }) => void;
  favorite: FavoriteOnSimCard | undefined;
  onDeleteFavorite: (id: string) => void;
  onCreateFavorite: () => void;
  onShowMessage: () => void;
  onActiveSimcard: (simCardId: string) => void;
  onDeactiveSimcard: (simCardId: string) => void;
  onDeleteTag: (tagId: string) => void;
  onAddTag: () => void;
  page: number;
  index: number;
  country:
    | {
        flag: string;
        country: string;
        code: string;
        countryCode: string;
      }
    | undefined;
  deviceUser: UseQueryResult<ResponseGetDeviceUsersService, Error>;
  portStatus: StatusPort | "-";
};
function SimcardItem({
  slotInUsed,
  activeSimcards,
  sim,
  isloading,
  favorite,
  onAddTag,
  onDeleteTag,
  onUpdateNoted,
  onDeleteFavorite,
  onCreateFavorite,
  onShowMessage,
  onActiveSimcard,
  onDeactiveSimcard,
  page,
  index,
  country,
  deviceUser,
  portStatus,
}: Props) {
  const [noteLoading, setNoteLoading] = useState<boolean>(true);
  const randomShade = getRandomSlateShade();
  const [note, setNote] = useState<string>(sim.simCardNote);
  useEffect(() => {
    setNote(sim.simCardNote);
  }, [sim.simCardNote]);
  return (
    <li
      className={`relative flex h-max w-full
        flex-col gap-2 rounded-md ${
          slotInUsed
            ? activeSimcards?.find((active) => active.id === sim.id)
              ? "bg-green-200"
              : "bg-slate-400"
            : "bg-slate-200"
        }  p-2   `}
      key={sim.id}
    >
      <button
        disabled={isloading}
        onClick={() => {
          if (favorite) {
            onDeleteFavorite(favorite.id);
          } else {
            onCreateFavorite();
          }
        }}
        className={`absolute right-1 top-1 m-auto flex h-5 w-5 items-center justify-center 
    text-xl text-red-700 transition hover:scale-105 active:scale-110`}
      >
        {favorite ? <MdFavorite /> : <MdFavoriteBorder />}
      </button>
      <div className="flex w-full flex-wrap gap-2 border-b  border-gray-400 py-1 ">
        <div className="w-max rounded-sm px-2 text-xs text-black  ring-1 ring-black">
          <span className="font-bold">
            Number {page === 1 ? index + 1 : index + 1 + 20 * (page - 1)}{" "}
          </span>{" "}
          / Serial number: {sim.number}
        </div>
        {sim.status === "active" ? (
          <div className="w-max rounded-sm bg-green-600 px-2  text-xs text-green-100">
            available
          </div>
        ) : (
          <div className="w-max rounded-sm bg-red-600 px-2  text-xs text-red-100">
            unavailable
          </div>
        )}

        {slotInUsed && (
          <div className="w-max rounded-sm bg-gray-600 px-2  text-xs text-green-100">
            slot in used
          </div>
        )}
        {activeSimcards?.find((active) => active.id === sim.id) && (
          <div className="w-max rounded-sm bg-green-600 px-2  text-xs text-green-100">
            active
          </div>
        )}
      </div>
      {sim.lastUsedAt ? (
        <div className="w-max rounded-sm bg-blue-600 px-2  text-xs text-green-100">
          Last Used {moment(sim.lastUsedAt).format("DD/MM/YYYY")}
        </div>
      ) : (
        <div className="w-max rounded-sm bg-blue-600 px-2  text-xs text-green-100">
          Last Used: NONE
        </div>
      )}

      <div className="grid h-full w-full grid-cols-2 place-content-start place-items-center gap-3 gap-y-2">
        <button
          onClick={() => {
            onShowMessage();
          }}
          className="col-span-2 flex w-full items-center justify-center gap-1 rounded-md
   bg-blue-300 px-5 py-2 text-sm text-blue-600 
        transition duration-100 hover:bg-blue-400"
        >
          View Message <Sms />
        </button>
        <button
          onClick={() => {
            onActiveSimcard(sim.id);
          }}
          className="col-span-1 flex w-full items-center justify-center gap-1 rounded-md
   bg-green-300 px-5 py-2 text-sm text-green-600 
        transition duration-100 hover:bg-green-400"
        >
          Activate
        </button>
        <button
          onClick={() => {
            onDeactiveSimcard(sim.id);
          }}
          className="col-span-1 flex w-full items-center justify-center gap-1 rounded-md
   bg-red-300 px-5 py-2 text-sm text-red-600 
        transition duration-100 hover:bg-red-400"
        >
          Release
        </button>

        <span className="flex w-full items-center justify-start gap-1">
          <FcPhoneAndroid />
          Phone Number:{" "}
        </span>
        <span
          className="w-full bg-slate-200 
  text-start font-semibold text-black"
        >
          {country?.countryCode}{" "}
          {sim.phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "($1) $2-$3")}
        </span>
        <span className="flex  w-full items-center justify-start gap-1">
          <BsFlag />
          Sim Country:{" "}
        </span>
        <span
          className="w-full bg-slate-200 
  text-start font-semibold text-black"
        >
          {country?.country}
        </span>
        <span className="flex  w-full items-center justify-start gap-1">
          <MdDevices />
          Device User:{" "}
        </span>
        <span
          className="w-full bg-slate-200 
  text-start font-semibold text-black"
        >
          {deviceUser.data?.find((d) => d.id === sim.deviceUserId)?.portNumber}
        </span>

        <span className="flex  w-full items-center justify-start gap-1">
          <FaDharmachakra />
          Port Number:{" "}
        </span>
        <span
          className="w-full bg-slate-200 
  text-start font-semibold text-black"
        >
          {sim.portNumber}
        </span>
        <span className="flex  w-full items-center justify-start gap-1">
          <FcSimCard />
          Provider:{" "}
        </span>
        <span
          className="w-full bg-slate-200 
  text-start font-semibold text-black"
        >
          {sim.provider}
        </span>

        <span className="col-span-2 flex w-full  items-center justify-center gap-1">
          <GrStatusInfo />
          Port Status
        </span>
        {portStatus === "SIM card inserted" ? (
          <span
            className="col-span-2 flex w-full
  animate-pulse items-center justify-center gap-1
   bg-slate-200 text-start font-semibold text-slate-800"
          >
            {portStatus} <SpinLoading />
          </span>
        ) : portStatus === "SIM card in registration" ? (
          <span
            className="col-span-2 
flex w-full animate-pulse items-center justify-center gap-1
bg-yellow-200 text-start font-semibold text-yellow-800"
          >
            {portStatus}
            <SpinLoading />
          </span>
        ) : portStatus === "preparing" ? (
          <span
            className="col-span-2 
flex w-full animate-pulse items-center justify-center gap-1
bg-gray-200 text-start font-semibold text-gray-800"
          >
            {portStatus}
            <SpinLoading />
          </span>
        ) : portStatus === "SIM card register successful" ? (
          <span
            className="col-span-2 flex
w-full  items-center justify-center gap-1
bg-green-200 text-start font-semibold text-green-800"
          >
            Ready To Recieve A Message <BiCheckCircle />
          </span>
        ) : (
          <span
            className="col-span-2 w-full bg-slate-200  text-center
   font-semibold text-black"
          >
            {portStatus}
          </span>
        )}

        <div className="col-span-2 h-40 w-full">
          {noteLoading && (
            <div
              style={getSlateColorStyle(randomShade)}
              className="h-full w-full animate-pulse rounded-md "
            ></div>
          )}
          <div className={`${noteLoading ? "h-0" : "h-40"} w-full`}>
            <Editor
              onInit={() => {
                setNoteLoading(false);
              }}
              value={note}
              onEditorChange={(note) => {
                setNote(note);
              }}
              tinymceScriptSrc={"/assets/libs/tinymce/tinymce.min.js"}
              textareaName="description"
              init={{
                paste_block_drop: true,
                link_context_toolbar: true,
                height: "100%",
                width: "100%",
                menubar: false,
                image_title: true,
                automatic_uploads: true,
                file_picker_types: "image",
                plugins: [
                  "contextmenu",
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "help",
                  "wordcount",
                ],
                contextmenu:
                  "paste | link  inserttable | cell row column deletetable",
                toolbar:
                  "undo redo | formatselect | blocks | " +
                  "bold italic backcolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | help | link | ",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
            />
          </div>
        </div>

        {sim.isLoading ? (
          <div
            className="col-span-2 mt-2 w-full animate-pulse rounded-md px-5 py-2 text-center
       text-gray-600"
          >
            Saving Note...
          </div>
        ) : (
          <button
            onClick={() => {
              onUpdateNoted({ content: note, simcardId: sim.id });
            }}
            className={`col-span-2 mt-2  flex w-full items-center justify-center gap-1
     rounded-md bg-blue-300 px-5 py-2 text-blue-600 transition duration-150 hover:bg-blue-400`}
          >
            Save Note <IoSave />
          </button>
        )}
        {sim.expireAt && (
          <span className="flex  items-center justify-start gap-1">
            <IoIosTimer />
            Time Remaining:{" "}
          </span>
        )}
        {sim.expireAt && (
          <Countdown
            date={sim.expireAt}
            intervalDelay={0}
            precision={3}
            renderer={(props) => (
              <div className="w-full rounded-sm bg-slate-200 px-5 font-bold text-black">
                {props.minutes} : {props.seconds} : {props.milliseconds}
              </div>
            )}
          />
        )}
      </div>
      <div className="grid w-full grid-cols-5 gap-2 border-t border-gray-400 py-2">
        <button
          onClick={() => {
            onAddTag();
          }}
          className="group z-20 col-span-1 flex w-10 items-center justify-center gap-1 
     rounded-md bg-green-200 px-3 text-green-600 transition-width hover:w-32 hover:drop-shadow-md  active:scale-105"
        >
          <IoIosPricetags className="h-10" />
          <span className="hidden text-xs group-hover:block">add tag</span>
        </button>
        <div className="col-span-4 flex h-10 flex-wrap   gap-3 overflow-auto p-1">
          {sim.tag?.map((tag) => {
            return (
              <div
                key={tag.id}
                className="group flex items-center  justify-between    gap-1 rounded-sm 
        bg-white p-1 text-xs transition-width"
              >
                <div className="relative h-5 w-5 overflow-hidden rounded-md">
                  <Image
                    fill
                    src={tag.icon}
                    className="object-contain"
                    alt={tag.tag}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                  />
                </div>
                {tag.tag}
                <IoIosRemoveCircle
                  onClick={() => onDeleteTag(tag.id)}
                  className="ml-3 mr-1 text-red-600 transition hover:text-red-700 "
                />
              </div>
            );
          })}
        </div>
      </div>
    </li>
  );
}

export default memo(SimcardItem);
