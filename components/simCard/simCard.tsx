import { SimCardOutlined } from "@mui/icons-material";
import { Pagination } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { FaFileExcel } from "react-icons/fa";
import { FaServer } from "react-icons/fa6";
import { IoMdPerson } from "react-icons/io";
import { IoSearchCircleSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { countries } from "../../data/country";
import PopupLayout from "../../layouts/PopupLayout";
import {
  DeviceUser,
  ErrorMessages,
  MessageOnSimcard,
  Partner,
  ReportOnSimCard,
  ResponsibilityOnPartner,
  SimCard,
  SimCardOnPartner,
  TagOnSimcard,
  User,
} from "../../models";
import {
  useAutoReadNew,
  useAutoReadOld,
  useGetPartnerByManager,
} from "../../react-query";
import {
  DeleteDeviceUserService,
  GetDeviceUsersService,
} from "../../services/simCard/deviceUser";
import {
  CreateFavoriteOnSimcardService,
  DeleteFavoriteOnSimcardService,
  GetFavoriteOnSimcardService,
  InputCreateFavoriteOnSimcardService,
  InputDeleteFavoriteOnSimcardService,
  ResponseGetFavoriteOnSimcardService,
} from "../../services/simCard/favorite";
import {
  ActiveSimCardService,
  DeactiveSimCardService,
  GetSimCardByPageService,
  SyncSimCardService,
  UpdateSimCardService,
  GenerateImeiExcelService,
} from "../../services/simCard/simCard";
import { GetSimOnPartnersByPartnerIdService } from "../../services/simCard/simOnPartner";
import { DeleteTagOnSimcardService } from "../../services/simCard/tag";
import { getRandomSlateShade, getSlateColorStyle } from "../../utils/random";
import CreateDeviceUser from "../forms/createDeviceUser";
import CreateTagsOnSimcard from "../forms/createTagsOnSimcard";
import AddSimCardFromExcel from "./AddSimCardFromExcel";
import ShowMessage from "./showMessage";
import SimcardItem from "./SimcardItem";
import ReportBox from "./ReportBox";

const availableSlot = ["available", "unavailable"];

function SimCards({ user }: { user: User }) {
  const autoReadNew = useAutoReadNew();
  const autoReadOld = useAutoReadOld();
  const queryClient = useQueryClient();
  const cookies = parseCookies();
  const webSocket = useRef<WebSocket | null>(null);
  const access_token = cookies.access_token;
  const router = useRouter();
  const toast = useRef<any>(null);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [searchField, setSearchField] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>(searchField);
  const [selectReport, setSelectReport] = useState<SimCard | null>(null);

  const [page, setPage] = useState<number>(1);
  const [triggerShowMessage, setTriggerShowMessage] = useState<boolean>(false);
  const [simcardData, setSimcardData] = useState<
    (SimCard & {
      partner?: SimCardOnPartner;
      tag?: TagOnSimcard[];
      reports?: (ReportOnSimCard & { user: User })[];
      isLoading?: boolean;
    })[]
  >([]);
  const [selectActiveSimcard, setSelectActiveSimcard] = useState<
    "active" | "default"
  >("default");
  const [selectSimCard, setSelectSimCard] = useState<SimCard>();
  const [triggerCreateTag, setTriggerCreateTag] = useState<boolean>(false);
  const [selectDeviceUser, setSelectDeviceUser] = useState<DeviceUser>();
  const [triggerCreateNumber, setTriggerCreateNumber] =
    useState<boolean>(false);
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
  const [activeSimcards, setActiveSimcards] = useState<
    (SimCard & {
      messages?: MessageOnSimcard[];
    })[]
  >();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchField);
    }, 2000); // 2-second delay

    return () => {
      clearTimeout(handler); // Clear timeout if query changes before 2 seconds
    };
  }, [searchField]);
  useEffect(() => {
    if (router.isReady) {
      setPage(parseInt(router.query.page as string) || 1);
    }
  }, [router.isReady]);

  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: () => GetFavoriteOnSimcardService(),
  });

  const createFavorite = useMutation({
    mutationKey: ["create-favorite"],
    mutationFn: (input: InputCreateFavoriteOnSimcardService) => {
      return CreateFavoriteOnSimcardService(input);
    },
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["favorites"],
        (prev: ResponseGetFavoriteOnSimcardService) => {
          return [...prev, data];
        },
      );
    },
  });

  const deleteFavorite = useMutation({
    mutationKey: ["delete-favorite"],
    mutationFn: (input: InputDeleteFavoriteOnSimcardService) => {
      return DeleteFavoriteOnSimcardService(input);
    },
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["favorites"],
        (prev: ResponseGetFavoriteOnSimcardService) => {
          return prev.filter((fav) => fav.id !== data.id);
        },
      );
    },
  });

  const partners = useGetPartnerByManager(user.id);

  useEffect(() => {
    if (partners.data) {
      setSelectPartner(() => {
        if (user.role !== "admin") {
          return (
            partners.data.find((partner) => partner.id === user.partnerId) ??
            partners.data[0]
          );
        }
        return undefined;
      });
    }
  }, [partners.data]);

  const simCards = useQuery({
    queryKey: [
      "simCards",
      {
        page,
        searchField: debouncedQuery,
        ...(selectPartner && { selectPartner: selectPartner.id }),
        availability: selectAvailableSlot,
        deviceId: selectDeviceUser?.id,
      },
    ],
    queryFn: () =>
      GetSimCardByPageService({
        limit: 20,
        page: page,
        searchField: debouncedQuery,
        availability: selectAvailableSlot,
        deviceId: selectDeviceUser?.id,
        ...(selectPartner && { partnerId: selectPartner.id }),
      }),
    refetchInterval: 1000 * 5,
    staleTime: 1000 * 5,
    // run when selectPartner is selected
    enabled: !!selectPartner || user.role === "admin",
  });

  const simcardOnPartner = useQuery({
    queryKey: ["simCardOnPartners", { partnerId: selectPartner?.id }],
    queryFn: () =>
      GetSimOnPartnersByPartnerIdService({
        partnerId: selectPartner?.id as string,
      }),
    enabled: !!selectPartner,
  });

  // call websocket for active simcard

  useEffect(() => {
    webSocket.current = new WebSocket(
      `${process.env.NEXT_PUBLIC_SERVER_OXY_ETMS}/v1/sim-card/stream/active-sim-cards?access_token=${access_token}`,
    );

    webSocket.current.onopen = function (event) {
      console.log("Connected");
    };

    webSocket.current.onerror = (error) => {
      console.log("WebSocket error: ", error);
    };

    webSocket.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      webSocket.current?.close();
    };
  }, []);

  useEffect(() => {
    if (webSocket.current) {
      webSocket.current.onmessage = (event: any) => {
        if (event.data) {
          const dataFromServer = JSON.parse(event.data);
          let response: (SimCard & {
            messages?: MessageOnSimcard[] | undefined;
          })[] = dataFromServer;
          console.log(response);
          const partnerOnSimcards = simcardOnPartner.data;

          if (user.role === "partner" || user.role === "manager") {
            if (!partnerOnSimcards) return [];

            const simcards = response
              .filter(
                (sim) =>
                  !partnerOnSimcards.some(
                    (simOnPartner) => simOnPartner.simCardId === sim.id,
                  ),
              )
              .map(({ messages, ...sim }) => {
                return {
                  ...sim,
                };
              });

            response = [
              ...simcards,
              ...response.filter((sim) =>
                partnerOnSimcards.some(
                  (simOnPartner) => simOnPartner.simCardId === sim.id,
                ),
              ),
            ];
          }
          console.log(response);

          setActiveSimcards(response);
          setUnavailableSlot(() =>
            response?.map((sim) => {
              return {
                slot: sim.portNumber.split(".")[0],
                deviceUserId: sim.deviceUserId,
              };
            }),
          );
          response.forEach((sim) => {
            sim.messages?.forEach((message) => {
              if (!message.isRead) {
                setTrackingUnreadMessage((prev) => {
                  if (prev.find((track) => track.id === message.id))
                    return prev;
                  showInfo({ message: message, sim: sim });
                  return [...prev, { id: message.id }];
                });
              }
            });
          });
        }
      };
    }
  }, [simcardOnPartner.data, webSocket.current]);

  useEffect(() => {
    if (simCards.data && selectActiveSimcard === "default") {
      setTotalPage(() => simCards.data?.meta.total);
      setSimcardData(() =>
        simCards.data.data.map((sim) => ({
          ...sim,
          isLoading: false,
        })),
      );
    }
  }, [simCards.data]);

  useEffect(() => {
    if (simCards.data && selectActiveSimcard === "active") {
      setTotalPage(() => simCards.data?.meta.total);

      setSimcardData(() => activeSimcards?.filter((sim) => sim.messages) ?? []);
      setPage(1);
      setTotalPage(1);
    } else if (simCards.data && selectActiveSimcard === "default") {
      setTotalPage(() => simCards.data?.meta.total);

      setSimcardData(
        () =>
          simCards.data?.data.map((sim) => ({
            ...sim,
          })) ?? [],
      );
    }
  }, [selectActiveSimcard]);

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

  const handleUpdateNoted = async ({
    content,
    simcardId,
  }: {
    content: string;
    simcardId: string;
  }) => {
    try {
      setSimcardData((prev) =>
        prev.map((simcard) => {
          if (simcard.id === simcardId) {
            return { ...simcard, simCardNote: content, isLoading: true };
          }
          return simcard;
        }),
      );
      await UpdateSimCardService({
        simCardId: simcardId,
        simCardNote: content,
      });
      setSimcardData((prev) =>
        prev.map((simcard) => {
          if (simcard.id === simcardId) {
            return { ...simcard, isLoading: false };
          }
          return simcard;
        }),
      );
    } catch (error) {
      setSimcardData((prev) =>
        prev.map((simcard) => {
          if (simcard.id === simcardId) {
            return { ...simcard, isLoading: false };
          }
          return simcard;
        }),
      );

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
    message: MessageOnSimcard | undefined;
    sim: SimCard;
  }) => {
    if (!message) return;
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

  const handleReadNew = async (portServer: string) => {
    try {
      Swal.fire({
        title: "Auto Read New Sims",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await autoReadNew.mutateAsync({ portServer });

      Swal.fire({
        title: "Success",
        text: "Auto Read New Sim",
        footer:
          "We will notify you when it's done on email, usually 5 - 10 minutes",
        icon: "success",
      });
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

  const handleReadOld = async (portServer: string) => {
    try {
      Swal.fire({
        title: "Auto Read Old Sims",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await autoReadOld.mutateAsync({ portServer });

      Swal.fire({
        title: "Success",
        text: "Auto Read Old Sims has been done.",
        footer:
          "We will notify you when it's done on email, usually 5 - 10 minutes",
        icon: "success",
      });
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

  const handleSycnSimcard = async () => {
    try {
      Swal.fire({
        title: "Syncing Simcard",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      await SyncSimCardService();
      Swal.fire({
        title: "Success",
        text: "We will notify you when it's done on email",
        icon: "success",
      });
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

  const handleGenerateIMEI = async () => {
    try {
      Swal.fire({
        title: "Generating IMEI",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await GenerateImeiExcelService();

      Swal.fire({
        title: "Success",
        text: "File downloaded successfully",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: "Error",
        text: "Failed to generate IMEI Excel",
        icon: "error",
      });
    }
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

      {triggerCreateNumber && (
        <PopupLayout onClose={() => setTriggerCreateNumber(false)}>
          <AddSimCardFromExcel onClose={() => setTriggerCreateNumber(false)} />
        </PopupLayout>
      )}

      {selectReport && (
        <PopupLayout onClose={() => setSelectReport(null)}>
          <ReportBox
            simCards={simCards}
            sim={selectReport}
            onClose={() => {
              document.body.style.overflow = "auto";
              setSelectReport(null);
            }}
          />
        </PopupLayout>
      )}

      <header className="mt-20 flex w-full flex-col items-center justify-center gap-5">
        <h1 className="flex items-center justify-center gap-1 text-center text-3xl font-bold ">
          Oxy-ETMS <SimCardOutlined />
        </h1>
        {user.role === "admin" && (
          <section
            className="bg-gra w-10/12 rounded-md bg-gradient-to-tr from-neutral-50
         to-neutral-200 p-5 ring-1 ring-gray-400 "
          >
            <section className="flex w-full justify-between gap-5">
              <h3 className="flex w-max items-center justify-start gap-2 border-b-2 border-black pr-5">
                Device User <FaServer />
              </h3>
              <div className="flex w-max gap-2">
                <button
                  onClick={() => setTriggerCreateNumber(true)}
                  className="flex items-center justify-center gap-1 rounded-md
                   bg-green-300 px-5 py-2 text-green-600 drop-shadow-lg 
            transition duration-100 hover:bg-green-400"
                >
                  <FaFileExcel /> Add Number
                </button>
                <button
                  onClick={handleGenerateIMEI}
                  className="rounded-md bg-green-300 px-5 py-2 text-green-600 drop-shadow-lg 
            transition duration-100 hover:bg-green-400"
                >
                  Generate IMEI
                </button>
                <button
                  onClick={handleSycnSimcard}
                  className="rounded-md bg-green-300 px-5 py-2 text-green-600 drop-shadow-lg 
            transition duration-100 hover:bg-green-400"
                >
                  Sync Simcard
                </button>
                <button
                  onClick={() => setTriggerCreateDeviceUser(true)}
                  className="rounded-md bg-green-300 px-5 py-2 text-green-600 drop-shadow-lg 
            transition duration-100 hover:bg-green-400"
                >
                  Add Device User
                </button>
              </div>
            </section>

            <ul className="mt-10 flex w-full flex-wrap gap-5">
              {deviceUser.data?.map((device) => {
                return (
                  <li
                    key={device.id}
                    className=" relative flex w-96 flex-col items-center  justify-center gap-1  
                  rounded-sm bg-white p-2 ring-1  ring-gray-700"
                  >
                    <div className="absolute right-2 top-2 flex w-40 items-center justify-end gap-3">
                      <div
                        className="  m-auto h-7 w-10
                      overflow-hidden rounded-md "
                      >
                        <Image
                          fill
                          src={
                            countries.find(
                              (country) => country.country === device.country,
                            )?.flag ?? "/favicon.ico"
                          }
                          alt="flag"
                          className="object-contain"
                        />
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteDeviceUser({ deviceUserId: device.id })
                        }
                        className="  flex h-7 w-10 items-center justify-center rounded-md bg-red-300 text-sm text-red-600 drop-shadow-lg 
            transition duration-100 hover:bg-red-400"
                      >
                        <MdDelete />
                      </button>
                    </div>

                    <span className="grid w-full grid-cols-2">
                      <span>Port Number: </span>
                      <span className="font-semibold">{device.portNumber}</span>
                    </span>
                    <span className="grid w-full grid-cols-2">
                      <span>Port URL: </span>
                      <span className="break-words font-semibold">
                        {device.url}
                      </span>
                    </span>
                    <span className="grid w-full grid-cols-2">
                      <span>Port Username: </span>
                      <span className="font-semibold">{device.username}</span>
                    </span>
                    <span className="grid w-full grid-cols-2">
                      <span>Port Password: </span>
                      <span className="font-semibold">{device.password}</span>
                    </span>

                    <div className="flex w-full flex-wrap items-center justify-start gap-1">
                      <button
                        onClick={() => {
                          if (
                            confirm("Are you sure to trigger read old sim?")
                          ) {
                            handleReadOld(device.portNumber);
                          }
                        }}
                        className="h-8 w-max rounded-md bg-white px-2 text-sm text-blue-600 ring-1 drop-shadow-lg 
            transition duration-100 hover:bg-blue-400"
                      >
                        Read old sims
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm("Are you sure to trigger read new sim?")
                          ) {
                            handleReadNew(device.portNumber);
                          }
                        }}
                        className="h-8 w-max rounded-md bg-blue-300 px-2 text-sm text-blue-600 drop-shadow-lg 
            transition duration-100 hover:bg-blue-400"
                      >
                        Read New Sim
                      </button>
                    </div>
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
                setPage(1);
                setSelectAvailableSlot(() => e.value);
              }}
              options={availableSlot}
              placeholder="Select Available Slot"
              className="h-10 w-40  rounded-lg outline-0 ring-2 ring-icon-color "
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-normal">
              Select Active Sim Card
            </label>
            <Dropdown
              value={selectActiveSimcard}
              onChange={(e) => {
                setPage(1);
                setSelectActiveSimcard(() => e.value);
              }}
              options={["active", "default"]}
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
                  setPage(1);
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
                  setPage(1);
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

        <ul className="mt-10 grid w-full gap-5 md:grid-cols-3 2xl:grid-cols-3">
          {simCards.isLoading
            ? [...Array(10)].map((list, index) => {
                const randomShade = getRandomSlateShade();
                return (
                  <li
                    className={`grid h-[43rem]
                       w-full animate-pulse grid-cols-2  place-items-center rounded-md  p-2  drop-shadow-lg`}
                    key={index}
                    style={getSlateColorStyle(randomShade)}
                  ></li>
                );
              })
            : simcardData.map((sim, index) => {
                let slotInUsed = false;
                unavailableSlot.forEach((unavailable) => {
                  if (
                    unavailable.slot === sim.portNumber.split(".")[0] &&
                    unavailable.deviceUserId === sim.deviceUserId
                  ) {
                    slotInUsed = true;
                  }
                });
                const country = countries.find(
                  (country) =>
                    country?.country ===
                    deviceUser.data?.find((d) => d?.id === sim?.deviceUserId)
                      ?.country,
                );
                if (activeSimcards?.find((active) => active.id === sim.id)) {
                  slotInUsed = false;
                }

                const portStatus =
                  activeSimcards?.find((active) => active.id === sim.id)
                    ?.portStatus ?? "-";

                const favorite = favorites.data?.find(
                  (f) => f.simCardId === sim.id,
                );

                return (
                  <SimcardItem
                    slotInUsed={slotInUsed}
                    key={index}
                    index={index}
                    page={page}
                    activeSimcards={activeSimcards}
                    sim={sim}
                    favorite={favorite}
                    country={country}
                    deviceUser={deviceUser}
                    portStatus={portStatus}
                    onReport={(sim) => setSelectReport(sim)}
                    onDeleteTag={(tagId) => {
                      handleDeleteTag({ tagOnSimCardId: tagId });
                    }}
                    onAddTag={() => {
                      setSelectSimCard(sim);
                      setTriggerCreateTag(true);
                    }}
                    onUpdateNoted={(content) => {
                      handleUpdateNoted({
                        content: content.content,
                        simcardId: sim.id,
                      });
                    }}
                    onActiveSimcard={(id) => {
                      handleActiveSimcard({ simCardId: sim.id });
                    }}
                    onDeactiveSimcard={(id) => {
                      handleDeactiveSimcard({ simCardId: sim.id });
                    }}
                    onShowMessage={() => {
                      setSelectSimCard(sim);
                      setTriggerShowMessage(true);
                      document.body.style.overflow = "hidden";
                    }}
                    onDeleteFavorite={(id) => {
                      deleteFavorite.mutate({
                        favoriteId: id,
                      });
                    }}
                    onCreateFavorite={() => {
                      createFavorite.mutate({
                        simcardId: sim.id,
                        userId: user.id,
                      });
                    }}
                    isloading={
                      createFavorite.isPending || deleteFavorite.isPending
                    }
                  />
                );
              })}
        </ul>
        <Pagination
          className="mt-5"
          page={page}
          onChange={(e, page) => {
            router.replace(
              {
                query: { ...router.query, page: page },
              },
              undefined,
              { shallow: true },
            );
            setPage(page);
          }}
          count={totalPage}
          color="primary"
        />
      </main>
    </div>
  );
}

export default SimCards;
