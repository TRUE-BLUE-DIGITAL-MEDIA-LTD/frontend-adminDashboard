import { Sms } from "@mui/icons-material";
import { UseQueryResult } from "@tanstack/react-query";
import moment from "moment";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import Countdown from "react-countdown";
import { BiCheckCircle } from "react-icons/bi";
import { BsFlag } from "react-icons/bs";
import { FaDharmachakra } from "react-icons/fa6";
import { FcPhoneAndroid, FcSimCard } from "react-icons/fc";
import { GrStatusInfo } from "react-icons/gr";
import { IoIosPricetags, IoIosRemoveCircle, IoIosTimer } from "react-icons/io";
import { IoSave } from "react-icons/io5";
import {
  MdDevices,
  MdFavorite,
  MdFavoriteBorder,
  MdFlag,
  MdNote,
  MdReport,
} from "react-icons/md";
import { blurDataURL } from "../../data/blurDataURL";
import {
  FavoriteOnSimCard,
  MessageOnSimcard,
  ReportOnSimCard,
  SimCard,
  SimCardOnPartner,
  StatusPort,
  TagOnSimcard,
  User,
} from "../../models";
import { ResponseGetDeviceUsersService } from "../../services/simCard/deviceUser";
import { timeAgo } from "../../utils";
import TextEditor from "../common/TextEditor";
import SpinLoading from "../loadings/spinLoading";
const priorityStyles = {
  Critical: {
    wrapper: "border-red-700 bg-red-500/20 text-red-700 dark:text-red-400",
    badge: "bg-red-300 text-red-700 dark:text-red-400",
  },
  High: {
    wrapper: "border-orange-700 bg-orange-500/20 text-orange-700 dark:text-orange-400",
    badge: "bg-orange-300 text-orange-700 dark:text-orange-400",
  },
  Medium: {
    wrapper: "border-yellow-700 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    badge: "bg-yellow-300 text-yellow-700 dark:text-yellow-400",
  },
  Low: {
    wrapper: "border-blue-700 bg-blue-500/20 text-blue-700 dark:text-blue-400",
    badge: "bg-blue-300 text-blue-700 dark:text-blue-400",
  },
};
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
    reports?: (ReportOnSimCard & { user: User })[];
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
  onReport: (simcard: SimCard) => void;
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

const menus = [
  { title: "Note", icon: <MdNote /> },
  { title: "Reports", icon: <MdReport /> },
] as const;

type Menu = (typeof menus)[number]["title"];
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
  onReport,
}: Props) {
  const [note, setNote] = useState<string>(sim.simCardNote);
  const [menu, setMenu] = useState<Menu>("Note");
  useEffect(() => {
    setNote(sim.simCardNote);
  }, [sim.simCardNote]);
  return (
    <li
      className={`relative flex h-max w-full
        flex-col gap-2 rounded-md ${
          slotInUsed
            ? activeSimcards?.find((active) => active.id === sim.id)
              ? "bg-green-500/20"
              : "bg-panel-raised"
            : "bg-panel-raised"
        }  p-2   `}
      key={sim.id}
    >
      <button
        onClick={() => onReport(sim)}
        className={`absolute right-8 top-1 m-auto flex h-5 w-5 items-center justify-center 
    text-xl text-red-700 dark:text-red-400 transition hover:scale-105 active:scale-110`}
      >
        <MdFlag />
      </button>
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
    text-xl text-red-700 dark:text-red-400 transition hover:scale-105 active:scale-110`}
      >
        {favorite ? <MdFavorite /> : <MdFavoriteBorder />}
      </button>
      <div className="flex w-full flex-wrap gap-2 border-b  border-line-strong py-1 ">
        <div className="w-max rounded-sm px-2 text-xs text-fg  ring-1 ring-line-strong">
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
          <div className="w-max rounded-sm bg-panel-raised px-2  text-xs text-green-100">
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
          className="w-full bg-panel-raised 
  text-start font-semibold text-fg"
        >
          {country?.countryCode}{" "}
          {sim.phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "($1) $2-$3")}
        </span>
        <span className="flex  w-full items-center justify-start gap-1">
          <BsFlag />
          Sim Country:{" "}
        </span>
        <span
          className="w-full bg-panel-raised 
  text-start font-semibold text-fg"
        >
          {country?.country}
        </span>
        <span className="flex  w-full items-center justify-start gap-1">
          <MdDevices />
          Device User:{" "}
        </span>
        <span
          className="w-full bg-panel-raised 
  text-start font-semibold text-fg"
        >
          {deviceUser.data?.find((d) => d.id === sim.deviceUserId)?.portNumber}
        </span>

        <span className="flex  w-full items-center justify-start gap-1">
          <FaDharmachakra />
          Port Number:{" "}
        </span>
        <span
          className="w-full bg-panel-raised 
  text-start font-semibold text-fg"
        >
          {sim.portNumber}
        </span>
        <span className="flex  w-full items-center justify-start gap-1">
          <FcSimCard />
          Provider:{" "}
        </span>
        <span
          className="w-full bg-panel-raised 
  text-start font-semibold text-fg"
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
   bg-panel-raised text-start font-semibold text-fg"
          >
            {portStatus} <SpinLoading />
          </span>
        ) : portStatus === "SIM card in registration" ? (
          <span
            className="col-span-2 
flex w-full animate-pulse items-center justify-center gap-1
bg-yellow-500/20 text-start font-semibold text-yellow-800 dark:text-yellow-400"
          >
            {portStatus}
            <SpinLoading />
          </span>
        ) : portStatus === "preparing" ? (
          <span
            className="col-span-2 
flex w-full animate-pulse items-center justify-center gap-1
bg-panel-raised text-start font-semibold text-fg"
          >
            {portStatus}
            <SpinLoading />
          </span>
        ) : portStatus === "SIM card register successful" ? (
          <span
            className="col-span-2 flex
w-full  items-center justify-center gap-1
bg-green-500/20 text-start font-semibold text-green-800 dark:text-green-400"
          >
            Ready To Recieve A Message <BiCheckCircle />
          </span>
        ) : (
          <span
            className="col-span-2 w-full bg-panel-raised  text-center
   font-semibold text-fg"
          >
            {portStatus}
          </span>
        )}

        <div className="col-span-2 h-52 w-full">
          <ul className="flex w-full items-center justify-center gap-2">
            {menus.map((m, index) => {
              return (
                <li
                  onClick={() => setMenu(m.title)}
                  key={index}
                  className={`flex cursor-pointer items-center justify-center gap-1 ${m.title === menu ? "text-fg" : "text-fg-subtle"}`}
                >
                  {m.icon}
                  {m.title === "Reports"
                    ? `${m.title} (${sim?.reports?.length ?? 0})`
                    : m.title}
                </li>
              );
            })}
          </ul>

          <div className={`h-48 w-full`}>
            {menu === "Note" && (
              <TextEditor
                value={note}
                onChange={(note) => {
                  setNote(note);
                }}
                allowMenu={false}
              />
            )}
            {menu === "Reports" && (
              <ul className="flex h-40 w-full flex-col gap-2 overflow-y-auto p-3">
                {sim?.reports?.map((report) => {
                  const styles =
                    priorityStyles[report.priority] || priorityStyles.High;

                  return (
                    <li
                      key={report.id}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-sm ${styles.wrapper}`}
                    >
                      <section className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image src={report.user.image} fill alt="profile" />
                        </div>
                        <section className="flex flex-col ">
                          <span className="font-semibold underline underline-offset-2">
                            {report.type}
                          </span>
                          <span className="text-xs">
                            Reported: {timeAgo({ pastTime: report.createAt })}{" "}
                          </span>
                          <span className="text-xs">
                            by {report.user.name} ({report.user.email})
                          </span>
                        </section>
                      </section>
                      <div className={`rounded-lg px-3 py-1 ${styles.badge}`}>
                        {report.priority}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {sim.isLoading ? (
          <div
            className="col-span-2 mt-2 w-full animate-pulse rounded-md px-5 py-2 text-center
       text-fg-muted"
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
              <div className="w-full rounded-sm bg-panel-raised px-5 font-bold text-fg">
                {props.minutes} : {props.seconds} : {props.milliseconds}
              </div>
            )}
          />
        )}
      </div>
      <div className="grid w-full grid-cols-5 gap-2 border-t border-line-strong py-2">
        <button
          onClick={() => {
            onAddTag();
          }}
          className="group z-20 col-span-1 flex w-10 items-center justify-center gap-1 
     rounded-md bg-green-500/20 px-3 text-green-600 transition-width hover:w-32 hover:drop-shadow-md  active:scale-105"
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
        bg-panel p-1 text-xs transition-width"
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
