import React, { useEffect, useState } from "react";
import {
  ErrorMessages,
  Partner,
  SimCard,
  SimCardOnPartner,
} from "../../../models";
import { useQuery } from "@tanstack/react-query";
import {
  CreateSimOnPartnerService,
  DeleteSimOnPartnerService,
  GetSimOnPartnersByPartnerIdService,
} from "../../../services/simCard/simOnPartner";
import Swal from "sweetalert2";
import { GetSimCardByPageService } from "../../../services/simCard/simCard";
import { Form, Input, SearchField, TextArea } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import { Pagination } from "@mui/material";

type AssignPhoneNumberProps = {
  selectPartner: Partner;
  setTriggerAssignNumber: (value: React.SetStateAction<boolean>) => void;
};
function AssignPhoneNumber({
  selectPartner,
  setTriggerAssignNumber,
}: AssignPhoneNumberProps) {
  const [searchField, setSearchField] = useState<string>("");
  const [simCardOnPartnerData, setSimCardOmPartnerData] = useState<{
    simCards: (SimCard & {
      simCardOnPartner: SimCardOnPartner | null;
      isLoading: boolean;
      isChecking: boolean;
    })[];
    totalPages: number;
    currentPage: number;
  }>();
  const [page, setPage] = useState<number>(1);

  const simCardOnPartners = useQuery({
    queryKey: ["simCardOnPartners", { partnerId: selectPartner.id }],
    queryFn: () =>
      GetSimOnPartnersByPartnerIdService({
        partnerId: selectPartner.id,
      }),
  });

  const phoneNumber = useQuery({
    queryKey: ["phoneNumber", { page, searchField }],
    queryFn: () =>
      GetSimCardByPageService({
        limit: 20,
        page: page,
        searchField: searchField,
      }),
  });

  useEffect(() => {
    if (phoneNumber.data) {
      setSimCardOmPartnerData(() => {
        return {
          simCards: phoneNumber.data.data.map((simCard) => {
            return {
              ...simCard,
              simCardOnPartner:
                simCardOnPartners.data?.find(
                  (simCardOnPartner) =>
                    simCardOnPartner.simCard.id === simCard.id,
                ) ?? null,
              isLoading: false,
              isChecking:
                simCardOnPartners.data?.some(
                  (simCardOnPartner) =>
                    simCardOnPartner.simCardId === simCard.id,
                ) ?? false,
            };
          }),
          totalPages: phoneNumber.data.meta.total,
          currentPage: phoneNumber.data.meta.currentPage,
        };
      });
    }
  }, [simCardOnPartners.data, phoneNumber.data]);

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
      await simCardOnPartners.refetch();

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
  }: {
    simCardId: string;
    simCardOnPartnerId: string;
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

      await DeleteSimOnPartnerService({
        simOnPartnerId: simCardOnPartnerId,
      });
      await simCardOnPartners.refetch();
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
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen  items-center justify-center gap-5 font-Poppins ">
      <ul className="flex h-[30rem] w-96 flex-col items-center justify-start gap-2 rounded-xl bg-white p-7">
        <label className="flex w-full justify-center bg-gray-200 py-3 font-bold text-black">
          List of {selectPartner.name}&apos;s phone number
        </label>
        <div className=" flex h-full w-full flex-col justify-center overflow-auto  ">
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
      </ul>
      <Form className="flex h-[30rem] w-max flex-col items-center justify-start gap-2 rounded-xl bg-white p-7">
        <section className="flex h-max w-full flex-col items-center justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300  md:w-max md:p-5">
          <header className="flex w-full flex-col items-center justify-center gap-2 ">
            <h1 className="flex w-full justify-center font-bold md:text-xl">
              Assign Phone {selectPartner.name}
            </h1>
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
          </header>

          <div className=" h-60 w-[30rem] justify-center overflow-auto  ">
            <table className=" w-full table-auto ">
              <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
                <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
                  <th>Phone Number</th>
                  <th>Assing Phone number</th>
                </tr>
              </thead>
              <tbody>
                {phoneNumber.isLoading || simCardOnPartners.isLoading
                  ? [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                      </tr>
                    ))
                  : simCardOnPartnerData?.simCards?.map((sim) => {
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
                            {sim.phoneNumber.replace(
                              /(\d{4})(\d{3})(\d{4})/,
                              "($1) $2-$3",
                            )}
                          </td>
                          <td className="truncate border-4 border-transparent  font-semibold text-black">
                            <div className="flex items-center justify-center">
                              {sim.isLoading ? (
                                <div className="h-5 w-5 animate-pulse rounded-lg bg-slate-300"></div>
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
                                          sim.simCardOnPartner?.id || "",
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
            onChange={(e, page) => setPage(page)}
            count={phoneNumber.data?.meta.total || 1}
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
