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


const paginationSx = {
  "& .MuiPaginationItem-root": { color: "#ffffff" },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#00ABE4",
    color: "#ffffff",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  "& .MuiPaginationItem-icon": { color: "#ffffff" },
};

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-4 font-Poppins md:flex-row"
    >
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl md:h-[40rem] md:w-96">
        <header className="shrink-0 border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            {`${selectPartner.name}'s numbers`}
          </h2>
          <p className="text-xs text-zinc-500">Currently assigned</p>
        </header>
        <ul className="min-h-0 flex-1 space-y-1 overflow-auto px-3 py-3">
          {simCardOnPartners.isLoading ? (
            <div className="h-full w-full animate-pulse rounded-xl bg-zinc-800" />
          ) : (
            simCardOnPartners.data?.map((simCardOnPartner) => (
              <li
                key={simCardOnPartner.id}
                className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2.5"
              >
                <span className="font-medium text-zinc-200">
                  {simCardOnPartner.simCard.phoneNumber.replace(
                    /(\d{4})(\d{3})(\d{4})/,
                    "($1) $2-$3",
                  )}
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  OWN
                </span>
              </li>
            ))
          )}
        </ul>
        <footer className="shrink-0 border-t border-white/10 px-5 py-3 text-center text-xs text-zinc-400">
          Total: {simCardOnPartners.data?.length ?? 0}
        </footer>
      </div>
      <Form className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl md:h-[40rem]">
        {phoneNumber.isFetching && (
          <div className="absolute right-14 top-4 z-20 text-xs text-zinc-400">
            Loading…
          </div>
        )}

        <section className="flex h-full min-h-0 w-full flex-col">
          <header className="flex shrink-0 flex-col gap-4 border-b border-white/10 px-5 py-4">
            <div className="flex w-full flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Assign phone number
                </h1>
                <p className="text-xs text-zinc-500">{selectPartner.name}</p>
              </div>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectBulkAssign((prev) => !prev)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              >
                {selectBulkAssign ? "Close bulk" : "Bulk assign"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTriggerAssignNumber(() => false);
                  document.body.style.overflow = "auto";
                }}
                className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
              </div>
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
                    className="h-12 w-full appearance-none rounded-lg border border-white/10 bg-black/40 p-3 pl-10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color"
                  />
                  <IoSearchCircleSharp className="absolute left-2 top-1/2 -translate-y-1/2 text-3xl text-main-color" />
                </SearchField>
                <Dropdown
                  value={selectAvailableSlot}
                  onChange={(e) => {
                    setPage(1);
                    setSelectAvailableSlot(e.value);
                  }}
                  options={availableSlot}
                  placeholder="Select Availability"
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/40 text-sm text-white"
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
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/40 text-sm text-white"
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
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/40 text-sm text-white"
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
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/40 text-sm text-white lg:col-span-2"
                />
              </div>
            )}
          </header>
          <div className="min-h-0 w-full flex-1 space-y-2 overflow-auto px-4 py-3">
            {phoneNumber.isLoading || simCardOnPartners.isLoading
              ? [...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-xl bg-zinc-800/60"
                  />
                ))
              : simCardOnPartnerData?.simCards?.map((sim) => {
                  const device = deviceUser.data?.find(
                    (d) => d.id === sim.deviceUserId,
                  );
                  const country = countries.find(
                    (c) => c.country === device?.country,
                  );
                  return (
                    <div
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                        sim.isChecking
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                      key={sim.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {country?.countryCode}{" "}
                          {sim.phoneNumber.replace(
                            /(\d{4})(\d{3})(\d{4})/,
                            "($1) $2-$3",
                          )}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {country?.country || "—"} ·{" "}
                          {device?.portNumber ?? "No device"} ·{" "}
                          {sim.simcardOnPartner?.partner.name || "No partner"}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {sim.isLoading ? (
                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-700 border-t-main-color" />
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
                            className="group rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
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
                            className="h-4 w-4 accent-main-color"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
          <div className="flex shrink-0 justify-center border-t border-white/10 px-5 py-3">
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
              <Pagination
                page={page}
                onChange={(e, page) => setPage(page)}
                count={totalPages}
                color="primary"
                sx={paginationSx}
              />
            </div>
          </div>
        </section>
      </Form>

      <footer
        onClick={() => {
          setTriggerAssignNumber(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed inset-0 -z-10 bg-black/70"
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
          <label className="text-sm font-normal text-zinc-400">Select Device User</label>
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
            className="h-10 w-40 rounded-lg border border-white/10 bg-black/40 text-sm text-white outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-normal text-zinc-400">Select Type Of Perform</label>
          <Dropdown
            value={selectOption}
            onChange={(e) => {
              setSelectOption(() => e.value as OptionKey);
            }}
            options={[...options]}
            optionLabel="Option"
            placeholder="Select Available Slot"
            className="h-10 w-40 rounded-lg border border-white/10 bg-black/40 text-sm text-white outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-normal text-zinc-400">Select Type Of Perform</label>
          <InputNumber
            className="h-10 w-40 rounded-lg border border-white/10 bg-black/40 text-sm text-white outline-none"
            value={number}
            onValueChange={(e) => setNumber(e.value)}
          />
        </div>
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleBulk()}
        className="h-10 w-40 rounded-full bg-white text-sm font-semibold text-black hover:bg-main-color hover:text-white"
      >
        {loading ? "Loading..." : "Perform"}
      </button>
    </div>
  );
}
