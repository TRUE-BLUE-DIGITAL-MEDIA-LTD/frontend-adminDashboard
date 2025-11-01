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
  ResponsibilityOnPartner,
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
import { IoMdPerson } from "react-icons/io";
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
  const [selectPartnerSearch, setSelectPartnerSearch] =
    useState<Partner | null>();
  const removeSimcardOnPartner = useDeleteSimcardOnPartner();
  const simCardOnPartners = useGetSimcardOnPartner({
    partnerId: selectPartner.id,
  });
  const partners = useGetPartners({
    page: 1,
    searchField: "",
    limit: 40,
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
      className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen flex-col items-center 
    justify-center gap-5 bg-black/60 p-5 font-Poppins md:flex-row"
    >
      <div className="flex h-full w-full max-w-md flex-col items-center justify-between gap-2 rounded-xl bg-white p-7 md:h-[40rem] md:w-96">
        <h2 className="w-full rounded-lg bg-gray-100 py-3 text-center font-bold text-black">
          {selectPartner.name}`&apos;s Phone Numbers
        </h2>
        <ul className="flex h-40 w-full flex-col justify-start overflow-auto md:h-full">
          {simCardOnPartners.isLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-200"></div>
          ) : (
            simCardOnPartners.data?.map((simCardOnPartner) => (
              <li
                key={simCardOnPartner.id}
                className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-100"
              >
                <span className="font-semibold text-gray-800">
                  {simCardOnPartner.simCard.phoneNumber.replace(
                    /(\d{4})(\d{3})(\d{4})/,
                    "($1) $2-$3",
                  )}
                </span>
                <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-bold text-green-800">
                  OWN
                </span>
              </li>
            ))
          )}
        </ul>
        <footer className="w-full rounded-lg bg-gray-100 py-3 text-center font-bold text-black">
          Total: {simCardOnPartners.data?.length}
        </footer>
      </div>
      <Form
        className="relative flex h-full w-full max-w-4xl flex-col items-center justify-start
       gap-5 overflow-auto rounded-xl bg-white p-7 md:h-[40rem]"
      >
        {phoneNumber.isFetching && (
          <div className="absolute right-4 top-4 text-sm text-gray-500">
            Loading...
          </div>
        )}

        <section
          className="flex h-full w-full flex-col items-center justify-start 
        gap-5"
        >
          <header className="flex w-full flex-col items-center justify-center gap-4">
            <div className="flex w-full flex-col items-center justify-between gap-3 md:flex-row">
              <h1 className="text-2xl font-bold text-gray-800">
                Assign Phone to {selectPartner.name}
              </h1>
              <button
                type="button"
                onClick={() => setSelectBulkAssign((prev) => !prev)}
                className="w-full rounded-2xl bg-gray-200 py-2 font-semibold text-gray-800 shadow-md transition hover:bg-gray-300 md:w-auto md:px-4"
              >
                {selectBulkAssign ? "Close" : "Bulk Assign"}
              </button>
            </div>
            {selectBulkAssign ? (
              <BulkAssign
                partnerId={selectPartner.id}
                phoneNumber={phoneNumber}
                simCardOnPartners={simCardOnPartners}
              />
            ) : (
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SearchField
                  value={searchField}
                  onChange={(e) => setSearchField(e)}
                  className="relative flex w-full flex-col"
                >
                  <Input
                    placeholder="Search Phone Number Or Note"
                    className="h-12 w-full appearance-none rounded-lg bg-gray-100 p-3 pl-10 outline-none ring-2 ring-transparent focus:ring-blue-500"
                  />
                  <IoSearchCircleSharp className="absolute left-2 top-1/2 -translate-y-1/2 text-3xl text-gray-400" />
                </SearchField>
                <Dropdown
                  value={selectAvailableSlot}
                  onChange={(e) => {
                    setPage(1);
                    setSelectAvailableSlot(e.value);
                  }}
                  options={availableSlot}
                  placeholder="Select Availability"
                  className="h-12 w-full rounded-lg border-2 border-black"
                />
                <Dropdown
                  value={selectDeviceUser}
                  onChange={(e) => {
                    setPage(1);
                    setSelectDeviceUser(e.value);
                  }}
                  showClear
                  options={deviceUser.data}
                  loading={deviceUser.isLoading}
                  optionLabel="portNumber"
                  placeholder="Select Device User"
                  className="h-12 w-full rounded-lg border-2 border-black"
                />
                <Dropdown
                  value={getNoPartner}
                  onChange={(e) => {
                    setPage(1);
                    setGetNoPartner(e.value);
                  }}
                  showClear
                  options={["no-partner", "partner", "default"]}
                  placeholder="Filter Partner"
                  className="h-12 w-full rounded-lg border-2 border-black"
                />
                <Dropdown
                  value={selectPartnerSearch}
                  onChange={(e) => {
                    setPage(1);
                    setSelectPartnerSearch(e.value);
                  }}
                  itemTemplate={(partner: Partner) => (
                    <div className="flex items-center gap-2">
                      <IoMdPerson />
                      <span>{partner.name}</span>
                    </div>
                  )}
                  optionLabel="name"
                  showClear
                  loading={partners.isLoading}
                  options={partners.data?.data}
                  placeholder="Select Partner"
                  className="h-12 w-full rounded-lg border-2 border-black lg:col-span-2"
                />
              </div>
            )}
          </header>
          <div className=" w-full overflow-auto md:grow">
            <table className="w-full table-auto text-center">
              <thead className="sticky top-0 z-20 bg-gray-100">
                <tr className="text-sm font-bold text-gray-700">
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Device User</th>
                  <th className="p-4">Own By</th>
                  <th className="p-4">Assign</th>
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
                          className="border-b border-gray-200 hover:bg-gray-50"
                          key={sim.id}
                        >
                          <td className="p-4 font-semibold text-gray-800">
                            {country?.countryCode}{" "}
                            {sim.phoneNumber.replace(
                              /(\d{4})(\d{3})(\d{4})/,
                              "($1) $2-$3",
                            )}
                          </td>
                          <td className="p-4 text-gray-600">
                            {country?.country}
                          </td>
                          <td className="p-4 text-gray-600">
                            {device?.portNumber ?? "No Device User"}
                          </td>
                          <td className="p-4 text-gray-600">
                            {sim.simcardOnPartner?.partner.name || "No Partner"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              {sim.isLoading ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
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
                                  className="group rounded-2xl bg-red-200 px-4 py-2 text-xs font-bold text-red-800
                                   transition hover:bg-red-300"
                                >
                                  <span className="block group-hover:hidden">
                                    Assigned
                                  </span>
                                  <span className="hidden group-hover:block">
                                    Unassign
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
                                  className="h-6 w-6 rounded-md"
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
          <div className="mt-5 flex justify-center">
            <Pagination
              page={page}
              onChange={(e, page) => setPage(page)}
              count={totalPages}
              color="primary"
            />
          </div>
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
  const [loading, setLoading] = useState(false);
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
      setLoading(() => true);
      const result = await bulk.mutateAsync({
        deviceUserId: selectDeviceUser.id,
        partnerId,
        number: Number(number),
        action: selectOption,
      });
      await Promise.all([phoneNumber.refetch(), simCardOnPartners.refetch()]);
      setLoading(() => false);
      await Swal.fire({
        title: "Success",
        icon: "success",
        text: `${result.length} of ${number} has performed successfully`,
      });
    } catch (error) {
      setLoading(() => false);
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
        disabled={loading}
        onClick={() => handleBulk()}
        className="main-button h-10 w-40 rounded-md"
      >
        {loading ? "Loading..." : "Perform"}
      </button>
    </div>
  );
}
