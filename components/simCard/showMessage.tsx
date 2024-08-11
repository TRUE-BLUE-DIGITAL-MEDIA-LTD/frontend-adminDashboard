import React, { useEffect, useRef, useState } from "react";
import { ErrorMessages, SimCard } from "../../models";
import { useQuery } from "@tanstack/react-query";
import {
  GetSimCardByIdService,
  GetSimCardMessageService,
  ResponseGetSimCardByIdService,
  ResponseGetSimCardMessageService,
  UpdateSimCardService,
} from "../../services/simCard/simCard";
import { FcSimCard } from "react-icons/fc";
import moment from "moment";
import {
  FaCalendarCheck,
  FaDharmachakra,
  FaPhone,
  FaSimCard,
} from "react-icons/fa6";
import { MdDevices, MdOutlineSdCard } from "react-icons/md";
import { Message, Note, NoteAdd } from "@mui/icons-material";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import Countdown from "react-countdown";
import { IoIosTimer } from "react-icons/io";
import { Calendar } from "primereact/calendar";
import { InView, useInView } from "react-intersection-observer";
import { UpdateMessageOnSimcardService } from "../../services/simCard/message";

type ShowMessageProps = {
  setTriggerShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
  selectSimCard: SimCard;
};
function ShowMessage({
  setTriggerShowMessage,
  selectSimCard,
}: ShowMessageProps) {
  const [selectMenu, setSelectMenu] = useState<"message" | "note">("message");
  const [loading, setLoading] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(false);
  const [note, setNote] = useState<string>();
  const focusNote = useRef<HTMLDivElement | null>(null);
  const [messageTracking, setMessageTracking] = useState<{ id: string }[]>([]);
  const [lastUsed, setLastUsed] = useState<string | null>();
  const simCard = useQuery<
    ResponseGetSimCardByIdService,
    { message: string; simCard: SimCard }
  >({
    queryKey: ["simCard", { simCardId: selectSimCard.id }],
    queryFn: () =>
      GetSimCardByIdService({ simCardId: selectSimCard.id }).then((res) => {
        setLastUsed(res.simCard.lastUsedAt);
        if (firstLoad === false) {
          setNote(res.simCard.simCardNote);
          setFirstLoad(true);
        }
        return res;
      }),
  });

  const message = useQuery<
    ResponseGetSimCardMessageService,
    { message: string; simCard: SimCard }
  >({
    queryKey: ["simCard-message", { simCardId: selectSimCard.id }],
    queryFn: () => GetSimCardMessageService({ simCardId: selectSimCard.id }),
    refetchInterval: 1000 * 10,
    staleTime: 1000 * 10,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const debouncedNoteRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debouncedNoteRef.current !== null) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        handleUpdateNoted(debouncedNoteRef.current!);
        debounceTimeoutRef.current = null;
      }, 2000);
    }
  }, [note]);

  useEffect(() => {
    simCard.refetch();
    message.refetch();
  }, []);

  const handleUpdateNoted = async (content: string) => {
    try {
      await UpdateSimCardService({
        simCardId: selectSimCard.id,
        simCardNote: content,
      });
      setSaving(false);
    } catch (error) {
      setSaving(false);
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

  const handleUpdateLastUsed = async (date: string | null) => {
    try {
      setSaving(true);
      console.log(date);
      await UpdateSimCardService({
        simCardId: selectSimCard.id,
        lastUsedAt: date,
      });
      setSaving(false);
    } catch (error) {
      setSaving(false);
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

  const handleEditorChange = (content: string) => {
    setSaving(true);
    setNote(content);
    debouncedNoteRef.current = content;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center font-Poppins">
      <main
        className="relative grid h-96 grid-cols-2 gap-5 overflow-y-auto rounded-lg border
         border-gray-100  bg-gradient-to-r from-gray-50 to-gray-200  p-5 
        drop-shadow-xl lg:w-11/12 xl:w-10/12  2xl:w-9/12"
      >
        {message.isFetching ? (
          <div
            className="absolute left-2 top-2 m-auto animate-pulse rounded-md
          bg-gray-200 px-2 text-gray-800"
          >
            Syncing data ...
          </div>
        ) : (
          <div
            className="absolute left-2 top-2 m-auto rounded-md
           bg-green-200 px-2 text-green-800"
          >
            Synced
          </div>
        )}

        <section className="flex flex-col justify-center gap-5">
          <h1
            className="flex items-center justify-center gap-2 border-b
         border-gray-400 text-xl font-semibold text-main-color"
          >
            Sim card Information <FcSimCard />
          </h1>
          <div className="flex w-full gap-3 ">
            {simCard.isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-gray-400"></div>
            ) : simCard.data?.simCard.status === "active" ? (
              <div className="w-max rounded-sm bg-green-600 px-2   text-green-100">
                active
              </div>
            ) : (
              <div className="w-max rounded-sm bg-red-600 px-2   text-red-100">
                inactive
              </div>
            )}
            {simCard.isLoading ? (
              <div className="h-8 w-full animate-pulse rounded-md bg-gray-300"></div>
            ) : (
              <div className="rounded-sm border border-blue-400 bg-blue-500 px-2  text-white">
                last update at{" "}
                {moment(simCard.data?.simCard.updateAt).format(
                  "DD/MM/YYYY HH:mm:ss",
                )}
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <FaPhone />
                Phone Number:{" "}
              </span>
              {simCard.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-600"></div>
              ) : (
                <span className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                  {simCard.data?.simCard.phoneNumber.replace(
                    /(\d{4})(\d{3})(\d{4})/,
                    "($1) $2-$3",
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <FaCalendarCheck />
                Last Used:{" "}
              </span>
              {simCard.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-600"></div>
              ) : (
                <Calendar
                  value={lastUsed ? new Date(lastUsed) : null}
                  onChange={async (e) => {
                    setLastUsed(e.value ? e.value?.toISOString() : null);
                    await handleUpdateLastUsed(
                      e.value ? e.value?.toISOString() : null,
                    );
                  }}
                  className="h-10"
                  showButtonBar
                />
              )}
            </div>
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <FaDharmachakra />
                Port Number:{" "}
              </span>
              {simCard.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-600"></div>
              ) : (
                <span className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                  {simCard.data?.simCard.portNumber}
                </span>
              )}
            </div>
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <MdOutlineSdCard />
                ICCID:{" "}
              </span>

              {simCard.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-400"></div>
              ) : (
                <span className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                  {simCard.data?.simCard.iccid}
                </span>
              )}
            </div>
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <FaSimCard />
                IMSI:{" "}
              </span>

              {simCard.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-300"></div>
              ) : (
                <span className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                  {simCard.data?.simCard.imsi}
                </span>
              )}
            </div>
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <MdDevices />
                Device User:{" "}
              </span>

              {simCard.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-600"></div>
              ) : (
                <span className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                  {simCard.data?.simCard.deviceUser.portNumber}
                </span>
              )}
            </div>
            <div className="flex items-center justify-start gap-2 text-lg">
              <span className="flex w-60 items-center justify-start gap-1">
                <IoIosTimer />
                Time Reminding:{" "}
              </span>

              {message.isLoading ? (
                <div className="h-8 w-60 animate-pulse rounded-md bg-gray-600"></div>
              ) : message.data?.simCard.expireAt ? (
                <Countdown
                  date={message.data?.simCard.expireAt}
                  intervalDelay={0}
                  precision={3}
                  renderer={(props) => (
                    <div className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                      {props.minutes} : {props.seconds} : {props.milliseconds}
                    </div>
                  )}
                />
              ) : (
                <div className="rounded-sm bg-blue-100 px-5 font-bold text-black">
                  Slot is not available
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="relative flex flex-col gap-2">
          {saving ? (
            <span className="absolute right-2 top-2 m-auto text-xs">
              saving...
            </span>
          ) : (
            <span className="absolute right-2 top-2 m-auto text-xs text-green-800">
              saved
            </span>
          )}
          <header className="flex justify-center gap-3">
            <button
              onClick={(e) => setSelectMenu(() => "message")}
              className="flex items-center justify-center
               gap-2 text-xl font-semibold text-main-color  transition hover:text-blue-600 active:scale-105"
            >
              Message <Message />
            </button>
            <div className="h-full  w-[1px] bg-black"></div>
            <button
              onClick={(e) => setSelectMenu(() => "note")}
              className="flex items-center justify-center gap-2  text-xl font-semibold 
              text-green-700 hover:text-green-800 active:scale-105"
            >
              Note <Note />
            </button>
          </header>

          {selectMenu === "note" ? (
            <div ref={focusNote} className="h-full rounded-md ">
              {loading && (
                <div className="h-full w-full animate-pulse bg-gray-500"></div>
              )}

              <Editor
                onInit={() => {
                  setLoading(false);
                }}
                value={note}
                onEditorChange={handleEditorChange}
                tinymceScriptSrc={"/assets/libs/tinymce/tinymce.min.js"}
                textareaName="description"
                init={{
                  paste_block_drop: true,
                  link_context_toolbar: true,
                  height: "100%",
                  width: "100%",
                  menubar: true,
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
          ) : message.isLoading ? (
            <div className="h-60 w-full animate-pulse rounded-md bg-gray-200"></div>
          ) : message.error ? (
            <section className="flex flex-col items-center justify-center gap-5">
              <span className="text-2xl font-semibold text-red-700">
                {message.error.message}
              </span>
              <div>
                Number:{" "}
                {message.error.simCard.phoneNumber.replace(
                  /(\d{4})(\d{3})(\d{4})/,
                  "($1) $2-$3",
                )}{" "}
                is currently using the slot
              </div>
              <div className="flex flex-col items-center gap-2 font-semibold text-green-700">
                Please come back in{" "}
                <Countdown
                  date={message.error.simCard.expireAt ?? new Date()}
                  intervalDelay={0}
                  precision={3}
                  renderer={(props) => (
                    <div className="w-full text-center">
                      {props.minutes} : {props.seconds} : {props.milliseconds}
                    </div>
                  )}
                />
              </div>
            </section>
          ) : (
            <div className="py-2">
              {message.data && message.data?.messages?.length > 0 ? (
                <div className="flex max-h-60 flex-col gap-3 overflow-auto p-3">
                  {message.data?.messages
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((msg, index) => {
                      return (
                        <InView
                          as="div"
                          onChange={(inView, entry) => {
                            if (inView && msg.isRead === false) {
                              setMessageTracking((prev) => {
                                if (!prev) return [];
                                if (prev.find((item) => item.id === msg.id))
                                  return prev;
                                return [...prev, { id: msg.id }];
                              });
                            }
                          }}
                          className="flex w-full flex-col gap-1 rounded-md
                         border border-gray-500 bg-white p-2
                         py-2  "
                          key={index}
                        >
                          <span>
                            <span className="font-semibold">Message: </span>
                            {msg.message}
                          </span>
                          <div className="flex w-full items-center gap-3">
                            <span className="w-max rounded-sm bg-gray-600 px-2 text-xs text-white">
                              {moment(
                                new Date(msg.timestamp * 1000).toISOString(),
                              ).format("DD MMMM YYYY HH:mm:ss")}{" "}
                            </span>
                            <span
                              className={`w-max rounded-sm ${msg.isRead ? "bg-green-600" : "bg-gray-600"}  px-2 text-xs text-white`}
                            >
                              {msg.isRead ? "Read" : "Unread"}
                            </span>
                          </div>
                        </InView>
                      );
                    })}
                </div>
              ) : (
                <p>
                  An SMS with a code will appear here after you use the number
                  to receive SMS
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <footer
        onClick={() => {
          if (saving === false) {
            setTriggerShowMessage(false);
            if (messageTracking?.length > 0) {
              Promise.allSettled(
                messageTracking.map((msg) =>
                  UpdateMessageOnSimcardService({
                    query: {
                      messageOnSimcardId: msg.id,
                    },
                    body: { isRead: true },
                  }),
                ),
              );
              message.refetch();
            }
            if (focusNote.current) {
              focusNote.current.classList.remove("ring-2");
            }
            document.body.style.overflow = "auto";
          } else {
            if (focusNote.current) {
              focusNote.current.classList.add("ring-2");
            }
          }
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen
        bg-black/30  "
      ></footer>
    </div>
  );
}

export default ShowMessage;
