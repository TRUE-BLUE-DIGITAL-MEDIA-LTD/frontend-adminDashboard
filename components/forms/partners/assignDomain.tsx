import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { GetAllDomainsByPage } from "../../../services/admin/domain";
import { Button, Form, Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import { Pagination } from "@mui/material";
import {
  Domain,
  ErrorMessages,
  Partner,
  ResponsibilityOnPartner,
  SiteBuild,
} from "../../../models";
import {
  CreateResponsibilityOnPartnerService,
  DeleteResponsibilityOnPartnerService,
  GetResponsibilityOnPartnerService,
} from "../../../services/admin/partner";
import Swal from "sweetalert2";

type AssignDomainProps = {
  setTriggerAssignDomain: React.Dispatch<React.SetStateAction<boolean>>;
  selectPartner: Partner;
};
function AssignDomain({
  setTriggerAssignDomain,
  selectPartner,
}: AssignDomainProps) {
  const [searchField, setSearchField] = useState<string>("");
  const [responsibilityOnPartner, setResponsibilityOnPartner] = useState<{
    domains: (Domain & {
      responsibilityPartners: ResponsibilityOnPartner | null;
      isLoading: boolean;
      isChecking: boolean;
      partner: Partner | null;
    })[];
    totalPages: number;
    currentPage: number;
  }>();
  const [page, setPage] = useState<number>(1);

  const partnerOnDomain = useQuery({
    queryKey: ["partnerOnDomain", { partnerId: selectPartner.id }],
    queryFn: () =>
      GetResponsibilityOnPartnerService({
        partnerId: selectPartner.id,
      }),
  });

  const domains = useQuery({
    queryKey: ["domains", { page: page, searchField: searchField }],
    queryFn: () =>
      GetAllDomainsByPage({
        page: page,
        searchField: searchField,
      }),
  });

  useEffect(() => {
    domains.refetch();
    partnerOnDomain.refetch();
  }, []);

  useEffect(() => {
    if (domains.data) {
      setResponsibilityOnPartner(() => {
        return {
          domains: domains.data.domains.map((domain) => {
            return {
              ...domain,
              responsibilityPartners:
                partnerOnDomain.data?.find(
                  (partner) => partner.domainId === domain.id,
                ) ?? domain.partnerOnDomain,
              isLoading: false,
              isChecking:
                partnerOnDomain.data?.some(
                  (partner) => partner.domainId === domain.id,
                ) ?? false,
            };
          }),
          totalPages: domains.data.totalPages,
          currentPage: domains.data.currentPage,
        };
      });
    }
  }, [partnerOnDomain.data, domains.data]);

  const handleAssignDomain = async ({
    partnerId,
    domainId,
  }: {
    partnerId: string;
    domainId: string;
  }) => {
    try {
      setResponsibilityOnPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          domains: prev.domains.map((domain) => {
            if (domain.id === domainId) {
              return {
                ...domain,
                isLoading: true,
              };
            }
            return domain;
          }),
        };
      });
      await CreateResponsibilityOnPartnerService({
        domainId: domainId,
        partnerId: partnerId,
      });
      await partnerOnDomain.refetch();
      await domains.refetch();

      setResponsibilityOnPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          domains: prev.domains.map((domain) => {
            if (domain.id === domainId) {
              return {
                ...domain,
                isLoading: false,
              };
            }
            return domain;
          }),
        };
      });
    } catch (error) {
      setResponsibilityOnPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          domains: prev.domains.map((domain) => {
            if (domain.id === domainId) {
              return {
                ...domain,
                isLoading: false,
              };
            }
            return domain;
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
  const handleDeleteResponsibility = async ({
    domainId,
    responsibilityPartnerId,
    partner: Partner,
  }: {
    domainId: string;
    partner: Partner;
    responsibilityPartnerId: string;
  }) => {
    try {
      setResponsibilityOnPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          domains: prev.domains.map((domain) => {
            if (domain.id === domainId) {
              return {
                ...domain,
                isLoading: true,
              };
            }
            return domain;
          }),
        };
      });

      await DeleteResponsibilityOnPartnerService({
        responsibilityPartnerId: responsibilityPartnerId,
      });
      await partnerOnDomain.refetch();
      await domains.refetch();
      setResponsibilityOnPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          domains: prev.domains.map((domain) => {
            if (domain.id === domainId) {
              return {
                ...domain,
                isLoading: false,
              };
            }
            return domain;
          }),
        };
      });
    } catch (error) {
      setResponsibilityOnPartner((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          domains: prev.domains.map((domain) => {
            if (domain.id === domainId) {
              return {
                ...domain,
                isLoading: false,
              };
            }
            return domain;
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
      <ul className="flex h-[30rem] w-96 flex-col items-center justify-between gap-2 rounded-xl bg-white p-7">
        <label className="flex w-full justify-center bg-gray-200 py-3 font-bold text-black">
          List of {selectPartner.name}&apos;s domains
        </label>
        <div className=" flex max-h-full min-h-72 w-full flex-col justify-start overflow-auto   ">
          {partnerOnDomain.isLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-200"></div>
          ) : (
            partnerOnDomain.data?.map((partner) => {
              return (
                <div
                  key={partner.id}
                  className="flex h-12 w-full items-center justify-between  py-3 hover:bg-gray-200"
                >
                  <div className="h-10 w-full truncate border-4 border-transparent font-semibold text-black">
                    {partner.domain.name}
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
          Total Domain : {partnerOnDomain.data?.length}
        </footer>
      </ul>
      <Form className="flex h-[30rem] w-6/12 flex-col items-center justify-start gap-2 rounded-xl bg-white p-7">
        <section
          className="flex h-max w-full flex-col items-center 
        justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300 "
        >
          <header className="flex w-full flex-col items-end justify-between gap-2 md:flex-row">
            <h1 className="rext-xl font-bold md:text-xl">
              Assign Domain<div> {selectPartner.name}</div>
            </h1>
            <SearchField
              value={searchField}
              onChange={(e) => {
                setSearchField(() => e);
              }}
              className="relative mt-10 flex w-80 flex-col"
            >
              <Input
                placeholder="Search Name Or Partner Manager"
                className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10 
                 outline-0 ring-2 ring-icon-color lg:w-full"
              />
              <IoSearchCircleSharp
                className="text-super-main-color
               absolute bottom-0 left-2 top-0 m-auto text-3xl"
              />
            </SearchField>
          </header>
          <div className=" h-60 w-full justify-center overflow-auto  ">
            <table className=" w-full table-auto ">
              <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
                <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
                  <th>Domain Name</th>
                  <th>Create At</th>
                  <th>Own By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {domains.isLoading
                  ? [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                        <td className="h-10 w-60 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                      </tr>
                    ))
                  : responsibilityOnPartner?.domains.map((domain) => {
                      const createAt = new Date(domain?.createAt);
                      const formattedDatecreateAt = createAt.toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      );
                      return (
                        <tr
                          className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                          key={domain.id}
                        >
                          <td className="h-10 truncate border-4 border-transparent font-semibold text-black">
                            {domain.name}
                          </td>
                          <td className="truncate border-4 border-transparent font-semibold text-black">
                            {formattedDatecreateAt}
                          </td>
                          <td className="h-10 truncate border-4 border-transparent font-semibold text-black">
                            {domain.partner?.name ?? "No Partner"}
                          </td>
                          <td className="truncate border-4 border-transparent  font-semibold text-black">
                            <div className="flex items-center justify-center">
                              {domain.isLoading ? (
                                <div className="h-5 w-5 animate-pulse rounded-lg bg-slate-300"></div>
                              ) : domain.partner &&
                                domain.partner.id !== selectPartner.id ? (
                                <button
                                  onClick={() =>
                                    handleDeleteResponsibility({
                                      domainId: domain.id,
                                      partner: domain.partner ?? selectPartner,
                                      responsibilityPartnerId:
                                        domain.responsibilityPartners?.id || "",
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
                                      handleAssignDomain({
                                        partnerId: selectPartner.id,
                                        domainId: domain.id,
                                      });
                                    } else if (e.target.checked === false) {
                                      handleDeleteResponsibility({
                                        domainId: domain.id,
                                        partner:
                                          domain.partner ?? selectPartner,
                                        responsibilityPartnerId:
                                          domain.responsibilityPartners?.id ||
                                          "",
                                      });
                                    }
                                  }}
                                  checked={domain.isChecking}
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
            count={responsibilityOnPartner?.totalPages || 1}
            color="primary"
          />
        </section>
      </Form>

      <footer
        onClick={() => {
          setTriggerAssignDomain(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default AssignDomain;
