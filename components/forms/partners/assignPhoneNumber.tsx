import { Pagination } from "@mui/material";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import { Form, Input, SearchField } from "react-aria-components";
import { FcApproval } from "react-icons/fc";
import { IoSearchCircleSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { countries } from "../../../data/country";
import useClickOutside from "../../../hooks/useClickOutside";
import {
  DeviceUser,
  ErrorMessages,
  Partner,
  SimCard,
  SimCardOnPartner,
  User,
} from "../../../models";
import {
  simcardKeys,
  useBlukSimcardOnPartner,
  useDeleteSimcardOnPartner,
  useGetPartners,
  useGetSimcardOnPartner,
  useGetSimcards,
} from "../../../react-query";
import { GetDeviceUsersService } from "../../../services/simCard/deviceUser";
import {
  CreateSimOnPartnerService,
  ResponseGetSimOnPartnersByPartnerIdService,
} from "../../../services/simCard/simOnPartner";
import { InputNumber } from "primereact/inputnumber";
import { Nullable } from "primereact/ts-helpers";
import { ResponseGetSimCardByPageService } from "../../../services/simCard/simCard";
const availableSlot = ["available", "unavailable"];

type AssignPhoneNumberProps = {
  selectPartner: Partner;
  setTriggerAssignNumber: (value: React.SetStateAction<boolean>) => void;
  user: User;
};
function AssignPhoneNumber({
  user,
  selectPartner,
  setTriggerAssignNumber,
}: AssignPhoneNumberProps) {
  const [searchField, setSearchField] = useState<string>("");
  const [selectDeviceUser, setSelectDeviceUser] = useState<DeviceUser>();
  const [totalPages, setTotalPages] = useState<number>(0);
  const [getNoPartner, setGetNoPartner] = useState<
    "default" | "no-partner" | "partner"
  >("default");
  const deviceUser = useQuery({
    queryKey: ["deviceUser"],
    queryFn: () => GetDeviceUsersService(),
  });
  const [selectAvailableSlot, setSelectAvailableSlot] = useState<
    "available" | "unavailable"
  >("available");
  const [simCardOnPartnerData, setSimCardOmPartnerData] = useState<{
    simCards: (SimCard & {
      isLoading: boolean;
      isChecking: boolean;
      simcardOnPartner: SimCardOnPartner & { partner: Partner };
    })[];
    totalPages: number;
    currentPage: number;
  }>();
  const [page, setPage] = useState<number>(1);
  const [selectBulkAssign, setSelectBulkAssign] = useState(false);
  const [selectPartnerSearch, setSelectPartner] = useState<Partner | null>();
  const searhBoxRef = React.useRef<HTMLDivElement>(null);
  const [triggerShowBox, setTriggerShowBox] = useState<boolean>(false);
  const [searchPartner, setSearchPartner] = useState<string>("");
  const removeSimcardOnPartner = useDeleteSimcardOnPartner();
  const simCardOnPartners = useGetSimcardOnPartner({
    partnerId: selectPartner.id,
  });
  const partners = useGetPartners({
    page: 1,
    searchField: searchPartner,
    limit: 3,
  });
  const phoneNumber = useGetSimcards(
    {
      limit: 20,
      page: page,
      ...(selectPartnerSearch?.id && { partnerId: selectPartnerSearch.id }),
      searchField: searchField,
      availability: selectAvailableSlot,
      deviceId: selectDeviceUser?.id,
      partner: getNoPartner,
    },
    simcardKeys.all,
  );

  useEffect(() => {
    phoneNumber.refetch();
    partners.refetch();
    simCardOnPartners.refetch();
  }, []);

  useEffect(() => {
    phoneNumber.refetch();
  }, [
    page,
    searchField,
    selectAvailableSlot,
    getNoPartner,
    selectDeviceUser,
    selectPartnerSearch,
  ]);

  useEffect(() => {
    if (phoneNumber.data) {
      setTotalPages(() => phoneNumber.data.meta.total);
      setSimCardOmPartnerData(() => {
        return {
          simCards: phoneNumber.data.data.map((simCard) => {
            return {
              ...simCard,
              isLoading: false,
              isChecking: !!simCard.simcardOnPartner,
            };
          }),
          totalPages: phoneNumber.data.meta.total,
          currentPage: phoneNumber.data.meta.currentPage,
        };
      });
    }
  }, [phoneNumber.data]);

  useClickOutside(searhBoxRef, () => {
    setTriggerShowBox(() => false);
  });
  const handleAssignSimCard = async ({
    partnerId,
    simCardId,
  }: {
    partnerId: string;
    simCardId: string;
  }) => {
    try {
      setSimCardOmPartnerData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          simCards: prev.simCards.map((simCard) => {
            if (simCard.id === simCardId) {
              return {
                ...simCard,
                isLoading: true,
              };
            }
            return simCard;
          }),
        };
      });
      await CreateSimOnPartnerService({
        simId: simCardId,
        partnerId: partnerId,
      });
      await phoneNumber.refetch();

      setSimCardOmPartnerData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          simCards: prev.simCards.map((simCard) => {
            if (simCard.id === simCardId) {
              return {
                ...simCard,
                isLoading: false,
              };
            }
            return simCard;
          }),
        };
      });
    } catch (error) {
      setSimCardOmPartnerData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          simCards: prev.simCards.map((simCard) => {
            if (simCard.id === simCardId) {
              return {
                ...simCard,
                isLoading: false,
              };
            }
            return simCard;
          }),
        };
      });
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

  const handleDeleteSimCardOnPartner = async ({
    simCardId,
    simCardOnPartnerId,
    partnerId,
  }: {
    simCardId: string;
    simCardOnPartnerId: string;
    partnerId: string;
  }) => {
    try {
      setSimCardOmPartnerData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          simCards: prev.simCards.map((simCard) => {
            if (simCard.id === simCardId) {
              return {
                ...simCard,
                isLoading: true,
              };
            }
            return simCard;
          }),
        };
      });

      await removeSimcardOnPartner.mutateAsync({
        simOnPartnerId: simCardOnPartnerId,
        partnerId: partnerId,
      });
      await phoneNumber.refetch();
      setSimCardOmPartnerData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          simCards: prev.simCards.map((simCard) => {
            if (simCard.id === simCardId) {
              return {
                ...simCard,
                isLoading: false,
              };
            }
            return simCard;
          }),
        };
      });
    } catch (error) {
      setSimCardOmPartnerData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          simCards: prev.simCards.map((simCard) => {
            if (simCard.id === simCardId) {
              return {
                ...simCard,
                isLoading: false,
              };
            }
            return simCard;
          }),
        };
      });
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen  
    items-center justify-center gap-5 font-Poppins "
    >
      <ul className="flex h-[30rem] w-96 flex-col items-center justify-between gap-2 rounded-xl bg-white p-7">
        <label className="flex w-full justify-center bg-gray-200 py-3 font-bold text-black">
          List of {selectPartner.name}&apos;s phone number
        </label>
        <div className=" flex max-h-full min-h-72 w-full flex-col justify-start overflow-auto   ">
          {simCardOnPartners.isLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-200"></div>
          ) : (
            simCardOnPartners.data?.map((simCardOnPartner) => {
              return (
                <div
                  key={simCardOnPartner.id}
                  className="flex h-12 w-full items-center justify-between  py-3 hover:bg-gray-200"
                >
                  <div className="h-10 w-full truncate border-4 border-transparent font-semibold text-black">
                    {simCardOnPartner.simCard.phoneNumber.replace(
                      /(\d{4})(\d{3})(\d{4})/,
                      "($1) $2-$3",
                    )}
                  </div>
                  <div className="h-max w-max bg-green-300 px-2 py-1 text-green-700">
                    OWN
                  </div>
                </div>
              );
            })
          )}
        </div>
        <footer className="flex w-full justify-center bg-gray-200 py-3 font-bold text-black">
          Total Phone Number : {simCardOnPartners.data?.length}
        </footer>
      </ul>
      <Form
        className="relative flex h-full w-max flex-col items-center justify-start
       gap-2 overflow-auto rounded-xl bg-white p-7"
      >
        {phoneNumber.isFetching && (
          <div className=" absolute right-2 top-2">Loading....</div>
        )}

        <section
          className="flex h-full w-full flex-col items-center justify-start 
        gap-5 overflow-auto rounded-lg  p-2 ring-2 ring-slate-300  md:w-max md:p-5"
        >
          <header className="flex w-full flex-col items-center justify-center gap-2 ">
            <h1 className="flex w-full justify-center font-bold md:text-xl">
              Assign Phone {selectPartner.name}
            </h1>
            <button
              type="button"
              onClick={() => setSelectBulkAssign((prev) => !prev)}
              className="h-10 w-60 rounded-md border bg-gray-100 hover:bg-green-300"
            >
              {selectBulkAssign ? "Close" : "Bulk Assign"}
            </button>
            {selectBulkAssign ? (
              <BulkAssign
                partnerId={selectPartner.id}
                phoneNumber={phoneNumber}
                simCardOnPartners={simCardOnPartners}
              />
            ) : (
              <>
                <SearchField
                  value={searchField}
                  onChange={(e) => {
                    setSearchField(() => e);
                  }}
                  className="relative flex w-80 flex-col"
                >
                  <Input
                    placeholder="Search Phone Number Or Note"
                    className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
                  />
                  <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
                </SearchField>
                <section className="flex w-full justify-center gap-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-normal">
                      Select Availability
                    </label>
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
                  {user.role === "admin" && (
                    <div className="flex flex-col">
                      <label className="text-sm font-normal">
                        Select Device User
                      </label>
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
                  <div className="flex flex-col">
                    <label className="text-sm font-normal">
                      Select No Partner
                    </label>
                    <Dropdown
                      value={getNoPartner}
                      onChange={(e) => {
                        setPage(1);
                        setGetNoPartner(() => e.value);
                      }}
                      showClear
                      options={["no-partner", "partner", "default"]}
                      placeholder="Filter Partner"
                      className="h-10 w-40  rounded-lg outline-0 ring-2 ring-icon-color "
                    />
                  </div>
                </section>
                <div className="relative flex flex-col">
                  <label className="text-sm font-normal">Select Partner</label>
                  <div className="relative h-10 w-60">
                    <input
                      type="text"
                      value={searchPartner}
                      onChange={(e) => {
                        setTriggerShowBox(() => true);
                        if (e.target.value === "") {
                          setSelectPartner(null);
                        }
                        setSearchPartner(e.target.value);
                      }}
                      placeholder="Search Partner"
                      className="h-full rounded-lg  px-2 outline-0 ring-2 ring-icon-color "
                    />
                    {searchPartner === selectPartnerSearch?.name && (
                      <div className="absolute bottom-0 right-8 top-0 m-auto flex items-center justify-center">
                        <FcApproval />
                      </div>
                    )}
                  </div>
                  {triggerShowBox && searchPartner !== "" && (
                    <ul className="absolute top-16 z-50 grid h-max max-h-36 w-full rounded-md border bg-white drop-shadow-md">
                      {partners.data?.data.map((partner) => {
                        return (
                          <li key={partner.id}>
                            <button
                              type="button"
                              className="w-full p-2 hover:bg-gray-200"
                              onClick={() => {
                                setSearchPartner(partner.name);
                                setSelectPartner(partner);
                                setTriggerShowBox(() => false);
                              }}
                            >
                              {partner.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </header>
          <div className=" w-max min-w-[30rem] max-w-3xl grow justify-center overflow-auto  ">
            <table className=" w-full table-auto ">
              <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
                <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
                  <th>Phone Number</th>
                  <th>Country</th>
                  <th>Device User</th>
                  <th>Own By</th>
                  <th>Assing Phone number</th>
                </tr>
              </thead>
              <tbody>
                {phoneNumber.isLoading || simCardOnPartners.isLoading
                  ? [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-600 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                      </tr>
                    ))
                  : simCardOnPartnerData?.simCards?.map((sim) => {
                      const device = deviceUser.data?.find(
                        (d) => d.id === sim.deviceUserId,
                      );
                      const country = countries.find(
                        (c) => c.country === device?.country,
                      );
                      const createAt = new Date(sim?.createAt);
                      const formattedDatecreateAt = createAt.toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      );
                      return (
                        <tr
                          className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                          key={sim.id}
                        >
                          <td className="h-10 truncate border-4 border-transparent font-semibold text-black">
                            {country?.countryCode}{" "}
                            {sim.phoneNumber.replace(
                              /(\d{4})(\d{3})(\d{4})/,
                              "($1) $2-$3",
                            )}
                          </td>
                          <td className="h-10 truncate border-4 border-transparent font-semibold text-black">
                            {country?.country}
                          </td>
                          <td className="h-10 truncate border-4 border-transparent text-center font-semibold text-black">
                            {device?.portNumber ?? "No Device User"}
                          </td>
                          <td className="h-10 truncate border-4 border-transparent text-center font-semibold text-black">
                            {sim.simcardOnPartner?.partner.name || "No Partner"}
                          </td>
                          <td className="truncate border-4 border-transparent  font-semibold text-black">
                            <div className="flex items-center justify-center">
                              {sim.isLoading ? (
                                <div className="h-5 w-5 animate-pulse rounded-lg bg-slate-300"></div>
                              ) : sim.simcardOnPartner &&
                                sim.simcardOnPartner.partnerId !==
                                  selectPartner.id ? (
                                <button
                                  onClick={() =>
                                    handleDeleteSimCardOnPartner({
                                      simCardId: sim.id,
                                      simCardOnPartnerId:
                                        sim.simcardOnPartner?.id || "",
                                      partnerId: sim.simcardOnPartner.partnerId,
                                    })
                                  }
                                  type="button"
                                  className="group  h-10 w-full bg-red-300 px-2 py-1
                                   text-xs text-red-700 transition hover:bg-red-400"
                                >
                                  <span className="block group-hover:hidden">
                                    already assigned
                                  </span>
                                  <span className="hidden group-hover:block">
                                    unassign
                                  </span>
                                </button>
                              ) : (
                                <input
                                  onChange={(e) => {
                                    if (e.target.checked === true) {
                                      handleAssignSimCard({
                                        partnerId: selectPartner.id,
                                        simCardId: sim.id,
                                      });
                                    } else if (e.target.checked === false) {
                                      handleDeleteSimCardOnPartner({
                                        simCardId: sim.id,
                                        simCardOnPartnerId:
                                          sim.simcardOnPartner?.id || "",
                                        partnerId:
                                          sim.simcardOnPartner.partnerId,
                                      });
                                    }
                                  }}
                                  checked={sim.isChecking}
                                  type="checkbox"
                                  className="h-5 w-5"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            onChange={(e, page) => setPage(page)}
            count={totalPages}
            color="primary"
          />
        </section>
      </Form>

      <footer
        onClick={() => {
          setTriggerAssignNumber(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default AssignPhoneNumber;

const options = ["assign", "unassign"] as const;
type OptionKey = (typeof options)[number];
type PropsBulkAssign = {
  partnerId: string;
  simCardOnPartners: UseQueryResult<
    ResponseGetSimOnPartnersByPartnerIdService,
    Error
  >;
  phoneNumber: UseQueryResult<ResponseGetSimCardByPageService, Error>;
};
function BulkAssign({
  partnerId,
  phoneNumber,
  simCardOnPartners,
}: PropsBulkAssign) {
  const bulk = useBlukSimcardOnPartner();
  const [selectDeviceUser, setSelectDeviceUser] = useState<DeviceUser | null>(
    null,
  );
  const [selectOption, setSelectOption] = useState<OptionKey>("assign");
  const [number, setNumber] = useState<Nullable<number | null>>(20);
  const deviceUser = useQuery({
    queryKey: ["deviceUser"],
    queryFn: () => GetDeviceUsersService(),
  });

  const handleBulk = async () => {
    try {
      if (!selectDeviceUser) {
        throw new Error("Please Select Device User");
      }
      const result = await bulk.mutateAsync({
        deviceUserId: selectDeviceUser.id,
        partnerId,
        number: Number(number),
        action: selectOption,
      });
      console.log(result);

      await Promise.all([phoneNumber.refetch(), simCardOnPartners.refetch()]);
      await Swal.fire({
        title: "Success",
        icon: "success",
        text: `${result.length} of ${number} has performed successfully`,
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
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex flex-wrap gap-3">
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
        <div className="flex flex-col">
          <label className="text-sm font-normal">Select Type Of Perform</label>
          <Dropdown
            value={selectOption}
            onChange={(e) => {
              setSelectOption(() => e.value as OptionKey);
            }}
            options={[...options]}
            optionLabel="Option"
            placeholder="Select Available Slot"
            className="h-10 w-40  rounded-lg outline-0 ring-2 ring-icon-color "
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-normal">Select Type Of Perform</label>
          <InputNumber
            className="h-10 w-40  rounded-lg outline-0 ring-2 ring-icon-color "
            value={number}
            onValueChange={(e) => setNumber(e.value)}
          />
        </div>
      </div>
      <button
        type="button"
        disabled={bulk.isPending}
        onClick={() => handleBulk()}
        className="main-button h-10 w-40 rounded-md"
      >
        {bulk.isPending ? "Loading..." : "Perform"}
      </button>
    </div>
  );
}
