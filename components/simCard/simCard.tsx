import { SimCardAlert, SimCardOutlined, Sms } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaServer } from "react-icons/fa6";
import {
  DeleteDeviceUserService,
  GetDeviceUsersService,
} from "../../services/simCard/deviceUser";
import { MdDelete } from "react-icons/md";
import { Input, SearchField, TextArea } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import {
  GetSimCardActiveService,
  GetSimCardByPageService,
} from "../../services/simCard/simCard";
import { Pagination } from "@mui/material";
import {
  ErrorMessages,
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
import { IoMdPerson } from "react-icons/io";
import { Dropdown } from "primereact/dropdown";

function SimCards({ user }: { user: User }) {
  const [searchField, setSearchField] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [triggerShowMessage, setTriggerShowMessage] = useState<boolean>(false);
  const [selectSimCard, setSelectSimCard] = useState<SimCard>();
  const [triigerCreateDeviceUser, setTriggerCreateDeviceUser] =
    useState<boolean>(false);
  const [selectPartner, setSelectPartner] = useState<Partner>();
  const deviceUser = useQuery({
    queryKey: ["deviceUser"],
    queryFn: () => GetDeviceUsersService(),
  });
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
      { page, searchField, selectPartner: selectPartner?.id },
    ],
    queryFn: () =>
      GetSimCardByPageService({
        limit: 20,
        page: page,
        searchField,
        partnerId: selectPartner?.id,
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
        return data;
      }),
    refetchInterval: 1000 * 5,
    staleTime: 1000 * 5,
  });

  const getRandomSlateShade = (): number => {
    const shades = [50, 100, 200, 300, 400, 500, 600];
    const randomIndex = Math.floor(Math.random() * shades.length);
    return shades[randomIndex];
  };

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
  return (
    <div className="= min-h-screen pt-20 font-Poppins">
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

      <header className="mt-20 flex w-full flex-col items-center justify-center gap-5">
        <h1 className="flex items-center justify-center gap-1 text-center text-3xl font-bold ">
          SMS-ETMS <SimCardOutlined />
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
        <div className="flex w-full items-end justify-center gap-5">
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
          {user.role === "manager" && (
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
            : simCards.data?.data?.map((sim) => {
                const createAt = new Date(sim?.createAt);
                let slotInUsed = false;
                unavailableSlot.forEach((unavailable) => {
                  if (
                    unavailable.slot === sim.portNumber.split(".")[0] &&
                    unavailable.deviceUserId === sim.deviceUserId
                  ) {
                    slotInUsed = true;
                  }
                });

                return (
                  <li
                    className="flex w-full  flex-col gap-2 rounded-md bg-slate-200 p-2 ring-1
                     ring-gray-400 "
                    key={sim.id}
                  >
                    <div className="flex w-full flex-wrap gap-2  border-b border-gray-400 py-1">
                      {sim.status === "active" ? (
                        <div className="w-max rounded-sm bg-green-600 px-2  text-xs text-green-100">
                          active
                        </div>
                      ) : (
                        <div className="w-max rounded-sm bg-red-600 px-2  text-xs text-red-100">
                          inactive
                        </div>
                      )}
                      <div className="rounded-sm border border-blue-400 bg-blue-500 px-2 text-xs text-white">
                        last updated{" "}
                        {moment(sim.updateAt).format("DD/MM/YYYY HH:mm:ss")}
                      </div>
                      {slotInUsed && (
                        <div className="w-full rounded-sm bg-gray-600 px-2  text-xs text-green-100">
                          slot in used
                        </div>
                      )}
                    </div>

                    <div className="grid w-full grid-cols-2 place-items-center">
                      <span
                        className="w-max 
                 font-semibold text-black"
                      >
                        {sim.phoneNumber.replace(
                          /(\d{4})(\d{3})(\d{4})/,
                          "($1) $2-$3",
                        )}
                      </span>

                      <button
                        onClick={() => {
                          setSelectSimCard(sim);
                          setTriggerShowMessage(true);
                        }}
                        className="flex items-center justify-center gap-1 rounded-md
                   bg-green-300 px-5 py-2 text-sm text-green-600 
                        transition duration-100 hover:bg-green-400"
                      >
                        View Message <Sms />
                      </button>
                    </div>
                  </li>
                );
              })}
        </ul>
        <Pagination
          className="mt-5"
          onChange={(e, page) => setPage(page)}
          count={simCards.data?.meta.total || 1}
          color="primary"
        />
      </main>
    </div>
  );
}

export default SimCards;
