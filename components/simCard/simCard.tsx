import {
  Facebook,
  PhoneAndroid,
  SimCardAlert,
  SimCardOutlined,
  Sms,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { FaDharmachakra, FaServer } from "react-icons/fa6";
import {
  DeleteDeviceUserService,
  GetDeviceUsersService,
} from "../../services/simCard/deviceUser";
import { MdDelete, MdDevices } from "react-icons/md";
import { Input, SearchField, TextArea } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import parse from "html-react-parser";

import {
  ActiveSimCardService,
  DeactiveSimCardService,
  GetSimCardActiveService,
  GetSimCardByPageService,
} from "../../services/simCard/simCard";
import { Pagination } from "@mui/material";
import {
  DeviceUser,
  ErrorMessages,
  MessageOnSimcard,
  Partner,
  ResponsibilityOnPartner,
  SimCard,
  SimCardOnPartner,
  User,
} from "../../models";
import ShowMessage from "./showMessage";
import moment from "moment";
import CreateDeviceUser from "../forms/createDeviceUser";
import Swal from "sweetalert2";
import { GetPartnerByMangegerService } from "../../services/admin/partner";
import {
  IoIosPricetags,
  IoIosRemoveCircle,
  IoIosTimer,
  IoMdPerson,
} from "react-icons/io";
import { Dropdown } from "primereact/dropdown";
import CreateTagsOnSimcard from "../forms/createTagsOnSimcard";
import Image from "next/image";
import { blurDataURL } from "../../data/blurDataURL";
import { DeleteTagOnSimcardService } from "../../services/simCard/tag";
import Countdown from "react-countdown";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { GrStatusInfo, GrStatusPlaceholder } from "react-icons/gr";
import { BiCheckCircle } from "react-icons/bi";
import SpinLoading from "../loadings/spinLoading";

const availableSlot = ["available", "unavailable"];

function SimCards({ user }: { user: User }) {
  const toast = useRef<any>(null);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [searchField, setSearchField] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [triggerShowMessage, setTriggerShowMessage] = useState<boolean>(false);
  const [selectSimCard, setSelectSimCard] = useState<SimCard>();
  const [triggerCreateTag, setTriggerCreateTag] = useState<boolean>(false);
  const [selectDeviceUser, setSelectDeviceUser] = useState<DeviceUser>();
  const [selectAvailableSlot, setSelectAvailableSlot] = useState<
    "available" | "unavailable"
  >("available");
  const [triigerCreateDeviceUser, setTriggerCreateDeviceUser] =
    useState<boolean>(false);
  const [selectPartner, setSelectPartner] = useState<Partner>();
  const deviceUser = useQuery({
    queryKey: ["deviceUser"],
    queryFn: () => GetDeviceUsersService(),
  });
  const [trackingUnreadMessage, setTrackingUnreadMessage] = useState<
    { id: string }[]
  >([]);
  const [unavailableSlot, setUnavailableSlot] = useState<
    { slot: string; deviceUserId: string }[]
  >([]);
  const partners = useQuery({
    queryKey: ["partners-by-manager"],
    queryFn: () =>
      GetPartnerByMangegerService().then((response) => {
        setSelectPartner(() => response[0]);
        return response;
      }),
  });

  const simCards = useQuery({
    queryKey: [
      "simCards",
      {
        page,
        searchField,
        selectPartner: selectPartner?.id,
        availability: selectAvailableSlot,
        deviceId: selectDeviceUser?.id,
      },
    ],
    queryFn: () =>
      GetSimCardByPageService({
        limit: 20,
        page: page,
        searchField,
        availability: selectAvailableSlot,
        deviceId: selectDeviceUser?.id,
        partnerId: selectPartner?.id,
      }).then((data) => {
        setTotalPage(() => data.meta.total);
        return data;
      }),
    refetchInterval: 1000 * 5,
    staleTime: 1000 * 5,
    // run when selectPartner is selected
    enabled: !!selectPartner || user.role === "admin",
  });

  const activeSimcard = useQuery({
    queryKey: ["activeSimcard"],
    queryFn: () =>
      GetSimCardActiveService().then((data) => {
        setUnavailableSlot(() =>
          data?.map((sim) => {
            return {
              slot: sim.portNumber.split(".")[0],
              deviceUserId: sim.deviceUserId,
            };
          }),
        );
        data.forEach((sim) => {
          sim.messages.forEach((message) => {
            if (!message.isRead) {
              setTrackingUnreadMessage((prev) => {
                if (prev.find((track) => track.id === message.id)) return prev;
                showInfo({ message: message, sim: sim });
                return [...prev, { id: message.id }];
              });
            }
          });
        });
        return data;
      }),
    refetchInterval: 1000 * 3,
    staleTime: 1000 * 3,
  });

  useEffect(() => {
    if (simCards.data) {
      setTotalPage(() => simCards.data?.meta.total);
    }
  }, [simCards.data]);

  const getRandomSlateShade = (): number => {
    const shades = [50, 100, 200, 300, 400, 500, 600];
    const randomIndex = Math.floor(Math.random() * shades.length);
    return shades[randomIndex];
  };

  useEffect(() => {
    if (trackingUnreadMessage.length > 0) {
      document.title = `There are ${trackingUnreadMessage.length} unread message`;

      // Reset title after some time (optional)
      const resetTitle = setTimeout(() => {
        document.title = "Oxy Sms"; // Replace with your original title
      }, 5000); // Adjust timing as needed

      // Cleanup the timeout to prevent memory leaks
      return () => clearTimeout(resetTitle);
    }
  }, [trackingUnreadMessage]);

  const getSlateColorStyle = (shade: number): React.CSSProperties => {
    const slateColors: { [key: number]: string } = {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
    };
    return { backgroundColor: slateColors[shade] };
  };

  const handleDeleteDeviceUser = async ({
    deviceUserId,
  }: {
    deviceUserId: string;
  }) => {
    const replacedText = "DELETE";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Device User",
      input: "text",
      footer:
        "Please type this DELETE to confirm deleting. This action is irreversible.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
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

        await DeleteDeviceUserService({
          deviceId: deviceUserId,
        });
        await deviceUser.refetch();
        Swal.fire("Deleted!", "Your device user has been deleted.", "success");
      } catch (error) {
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

  const handleDeleteTag = async ({
    tagOnSimCardId,
  }: {
    tagOnSimCardId: string;
  }) => {
    try {
      Swal.fire({
        title: "Deleting Tag",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await DeleteTagOnSimcardService({
        tagOnSimCardId,
      });
      await simCards.refetch();
      Swal.fire("Deleted!", "Your tag has been deleted.", "success");
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

  const handleActiveSimcard = async ({ simCardId }: { simCardId: string }) => {
    try {
      Swal.fire({
        title: "Activating Simcard",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await ActiveSimCardService({
        simCardId,
      });
      await activeSimcard.refetch();
      await simCards.refetch();
      Swal.fire({
        title: "Activated!",
        text: "Your simcard has been activated.",
        icon: "success",
      });
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

  const handleDeactiveSimcard = async ({
    simCardId,
  }: {
    simCardId: string;
  }) => {
    try {
      Swal.fire({
        title: "Deactivating Simcard",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await DeactiveSimCardService({
        simCardId,
      });
      await activeSimcard.refetch();
      await simCards.refetch();
      Swal.fire({
        title: "Deactivated!",
        text: "Your simcard has been deactivated.",
        icon: "success",
      });
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

  const showInfo = ({
    message,
    sim,
  }: {
    message: MessageOnSimcard;
    sim: SimCard;
  }) => {
    toast.current?.show({
      id: message.id,
      severity: "info",
      life: 50000,
      content: (props: any) =>
        (
          <div className="w-80">
            <h1 className="text-start text-lg font-bold">New Message</h1>
            <div className="flex w-full items-center justify-start gap-2">
              <span className="">Sender</span>
              <span className="text-start text-sm font-semibold">
                {message.sender}
              </span>
              <span className="">Phone</span>
              <span className="text-start text-sm font-semibold">
                {sim.phoneNumber}
              </span>
            </div>
            <div className="flex w-full items-center justify-start gap-2 border-t border-gray-300 py-3">
              <span className="text-start text-sm font-semibold">
                {message.message}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectSimCard(sim);
                setTriggerShowMessage(true);
                toast.current?.remove(props);
                document.body.style.overflow = "hidden";
              }}
              className="flex w-full items-center justify-center gap-1 rounded-md
                   bg-green-300 px-5 py-2 text-sm text-green-600 
                    transition duration-100 hover:bg-green-400"
            >
              View Message
            </button>
          </div>
        ) as ReactNode,
    });
  };

  return (
    <div className="= min-h-screen pt-20 font-Poppins">
      <Toast ref={toast} />
      {triggerShowMessage && selectSimCard && (
        <ShowMessage
          setTriggerShowMessage={setTriggerShowMessage}
          selectSimCard={selectSimCard}
        />
      )}

      {triigerCreateDeviceUser && (
        <CreateDeviceUser
          simCards={simCards}
          deviceUser={deviceUser}
          setTrigger={setTriggerCreateDeviceUser}
        />
      )}

      {triggerCreateTag && selectSimCard && (
        <CreateTagsOnSimcard
          simCards={simCards}
          simcard={selectSimCard}
          setTrigger={setTriggerCreateTag}
        />
      )}

      <header className="mt-20 flex w-full flex-col items-center justify-center gap-5">
        <h1 className="flex items-center justify-center gap-1 text-center text-3xl font-bold ">
          Oxy-ETMS <SimCardOutlined />
        </h1>
        {user.role === "admin" && (
          <section
            className="bg-gra w-10/12 rounded-md bg-gradient-to-tr from-neutral-50
         to-neutral-200 p-5 ring-1 ring-gray-400 drop-shadow-lg"
          >
            <section className="flex w-full justify-between gap-5">
              <h3 className="flex w-max items-center justify-start gap-2 border-b-2 border-black pr-5">
                Device User <FaServer />
              </h3>
              <button
                onClick={() => setTriggerCreateDeviceUser(true)}
                className="rounded-md bg-green-300 px-5 py-2 text-green-600 drop-shadow-lg 
            transition duration-100 hover:bg-green-400"
              >
                Add Device User
              </button>
            </section>

            <ul className="mt-10 flex w-full flex-wrap gap-5">
              {deviceUser.data?.map((device) => {
                return (
                  <li
                    key={device.id}
                    className=" flex items-center justify-center gap-5  
                  rounded-sm bg-white p-3 ring-1  ring-gray-700"
                  >
                    Port Number: {device.portNumber}
                    <button
                      onClick={() =>
                        handleDeleteDeviceUser({ deviceUserId: device.id })
                      }
                      className="rounded-md bg-red-300 px-5 py-2 text-sm text-red-600 drop-shadow-lg 
            transition duration-100 hover:bg-red-400"
                    >
                      <MdDelete />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </header>

      <main className="mt-5 flex w-full  flex-col items-center p-5">
        <div className="flex w-full flex-wrap items-end justify-center gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-normal">Seach</label>
            <SearchField
              value={searchField}
              onChange={(e) => {
                setSearchField(() => e);
                setPage(1);
              }}
              className="relative  flex w-96 flex-col"
            >
              <Input
                placeholder="Search For Number"
                className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
              />
              <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
            </SearchField>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-normal">Select Availability</label>
            <Dropdown
              value={selectAvailableSlot}
              onChange={(e) => {
                setSelectAvailableSlot(() => e.value);
              }}
              options={availableSlot}
              placeholder="Select Available Slot"
              className="h-10 w-40  rounded-lg outline-0 ring-2 ring-icon-color "
            />
          </div>
          {user.role === "admin" && (
            <div className="flex flex-col">
              <label className="text-sm font-normal">Select Device User</label>
              <Dropdown
                value={selectDeviceUser}
                onChange={(e) => {
                  setSelectDeviceUser(() => e.value);
                }}
                showClear
                options={deviceUser.data}
                loading={deviceUser.isLoading}
                optionLabel="portNumber"
                placeholder="Select Available Slot"
                className="h-10 w-40  rounded-lg outline-0 ring-2 ring-icon-color "
              />
            </div>
          )}
          {(user.role === "manager" || user.role === "partner") && (
            <div className="flex flex-col">
              <label className="text-sm font-normal">Select Partner</label>
              <Dropdown
                value={selectPartner}
                onChange={(e) => {
                  setSelectPartner(() => e.value);
                }}
                itemTemplate={(
                  partner: Partner & {
                    responsibilityOnPartner: ResponsibilityOnPartner[];
                    simCardOnPartner: SimCardOnPartner[];
                  },
                ) => {
                  return (
                    <div className="n flex w-full items-center gap-2">
                      <IoMdPerson />
                      <span>{partner.name}</span>
                      <span className="rounded-md bg-gray-700 px-2 py-1 text-xs text-white">
                        Total {partner.simCardOnPartner.length}
                      </span>
                    </div>
                  );
                }}
                optionLabel="name"
                loading={partners.isLoading}
                options={partners.data}
                placeholder="Select Partner"
                className="h-10 w-96  rounded-lg outline-0 ring-2 ring-icon-color "
              />
            </div>
          )}
        </div>

        <ul className="mt-10 grid w-full gap-5 md:grid-cols-3 2xl:grid-cols-4">
          {simCards.isLoading
            ? [...Array(10)].map((list, index) => {
                const randomShade = getRandomSlateShade();
                return (
                  <li
                    className={`grid h-12 w-full animate-pulse grid-cols-2  place-items-center rounded-md  p-2  drop-shadow-lg`}
                    key={index}
                    style={getSlateColorStyle(randomShade)}
                  ></li>
                );
              })
            : simCards.data?.data?.map((sim, index) => {
                let slotInUsed = false;
                unavailableSlot.forEach((unavailable) => {
                  if (
                    unavailable.slot === sim.portNumber.split(".")[0] &&
                    unavailable.deviceUserId === sim.deviceUserId
                  ) {
                    slotInUsed = true;
                  }
                });

                if (
                  activeSimcard.data?.find((active) => active.id === sim.id)
                ) {
                  slotInUsed = false;
                }

                const portStatus =
                  activeSimcard.data?.find((active) => active.id === sim.id)
                    ?.statusPort ?? "-";

                return (
                  <li
                    className={`relative flex h-max w-full
                        flex-col gap-2 rounded-md ${
                          slotInUsed
                            ? activeSimcard.data?.find(
                                (active) => active.id === sim.id,
                              )
                              ? "bg-green-200"
                              : "bg-slate-400"
                            : "bg-slate-200"
                        }  p-2 ring-1
                     ring-gray-400  `}
                    key={sim.id}
                  >
                    <div className="flex w-full flex-wrap gap-2 border-b  border-gray-400 py-1 ">
                      <div className="w-max rounded-sm px-2 text-xs text-black  ring-1 ring-black">
                        Number{" "}
                        {page === 1 ? index + 1 : index + 1 + 20 * (page - 1)}
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
                      {activeSimcard.data?.find(
                        (active) => active.id === sim.id,
                      ) && (
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
                          setSelectSimCard(sim);
                          setTriggerShowMessage(true);
                          document.body.style.overflow = "hidden";
                        }}
                        className="col-span-2 flex w-full items-center justify-center gap-1 rounded-md
                   bg-blue-300 px-5 py-2 text-sm text-blue-600 
                        transition duration-100 hover:bg-blue-400"
                      >
                        View Message <Sms />
                      </button>
                      <button
                        onClick={() => {
                          handleActiveSimcard({ simCardId: sim.id });
                        }}
                        className="col-span-1 flex w-full items-center justify-center gap-1 rounded-md
                   bg-green-300 px-5 py-2 text-sm text-green-600 
                        transition duration-100 hover:bg-green-400"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => {
                          handleDeactiveSimcard({ simCardId: sim.id });
                        }}
                        className="col-span-1 flex w-full items-center justify-center gap-1 rounded-md
                   bg-red-300 px-5 py-2 text-sm text-red-600 
                        transition duration-100 hover:bg-red-400"
                      >
                        Release
                      </button>

                      <span className="flex w-full items-center justify-start gap-1">
                        <PhoneAndroid />
                        Phone Number:{" "}
                      </span>
                      <span
                        className="w-full bg-slate-200 
                  text-start font-semibold text-black"
                      >
                        {sim.phoneNumber.replace(
                          /(\d{4})(\d{3})(\d{4})/,
                          "($1) $2-$3",
                        )}
                      </span>

                      <span className="flex  w-full items-center justify-start gap-1">
                        <MdDevices />
                        Device User:{" "}
                      </span>
                      <span
                        className="w-full bg-slate-200 
                  text-start font-semibold text-black"
                      >
                        {
                          deviceUser.data?.find(
                            (d) => d.id === sim.deviceUserId,
                          )?.portNumber
                        }
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

                      <div className="col-span-2 max-h-14 w-full overflow-auto border-l-4 border-yellow-500 bg-yellow-100 p-4 ">
                        {sim.simCardNote && parse(sim.simCardNote)}
                      </div>

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
                              {props.minutes} : {props.seconds} :{" "}
                              {props.milliseconds}
                            </div>
                          )}
                        />
                      )}
                    </div>
                    <div className="grid w-full grid-cols-5 gap-2 border-t border-gray-400 py-2">
                      <button
                        onClick={() => {
                          setSelectSimCard(sim);
                          setTriggerCreateTag(true);
                        }}
                        className="group col-span-1 flex w-10 items-center justify-center gap-1 
                     rounded-md bg-green-200 px-3 text-green-600 transition-width hover:w-32 hover:drop-shadow-md  active:scale-105"
                      >
                        <IoIosPricetags className="h-10" />
                        <span className="hidden text-xs group-hover:block">
                          add tag
                        </span>
                      </button>
                      <div className="col-span-4 flex h-10 flex-wrap   gap-3 overflow-auto p-1">
                        {sim.tag.map((tag) => {
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
                                  alt={tag.tag}
                                  placeholder="blur"
                                  blurDataURL={blurDataURL}
                                />
                              </div>
                              {tag.tag}
                              <IoIosRemoveCircle
                                onClick={() =>
                                  handleDeleteTag({ tagOnSimCardId: tag.id })
                                }
                                className="ml-3 mr-1 text-red-600 transition hover:text-red-700 "
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div></div>
                  </li>
                );
              })}
        </ul>
        <Pagination
          className="mt-5"
          page={page}
          onChange={(e, page) => setPage(page)}
          count={totalPage}
          color="primary"
        />
      </main>
    </div>
  );
}

export default SimCards;
