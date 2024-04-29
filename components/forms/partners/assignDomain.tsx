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
      responsibilityPartners: ResponsibilityOnPartner;
      isLoading: boolean;
      isChecking: boolean;
    })[];
    totalPages: number;
    currentPage: number;
  }>();
  const [page, setPage] = useState<number>(1);

  const fetch = useQuery({
    queryKey: ["responsibilityOnPartner", selectPartner.id],
    queryFn: () =>
      GetResponsibilityOnPartnerService({
        partnerId: selectPartner.id,
        searchField: searchField,
        page: page,
      }),
  });

  useEffect(() => {
    if (fetch.data) {
      setResponsibilityOnPartner(() => {
        return {
          domains: fetch.data?.domains.map((domain) => {
            return {
              ...domain,
              responsibilityPartners: domain.responsibilityPartners,
              isLoading: false,
              isChecking: domain.responsibilityPartners ? true : false,
            };
          }),
          totalPages: fetch.data?.totalPages,
          currentPage: fetch.data?.currentPage,
        };
      });
    }
  }, [fetch.data]);

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
      await fetch.refetch();

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
  }: {
    domainId: string;
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
      await fetch.refetch();
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
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen  w-screen items-center justify-center font-Poppins ">
      <Form className="flex h-max w-max flex-col items-center justify-start gap-2 rounded-xl bg-white p-7">
        <section className="flex h-max w-full flex-col items-center justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300  md:w-max md:p-5">
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
                className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
              />
              <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
            </SearchField>
          </header>
          <div className=" h-60 w-80 justify-center overflow-auto  md:w-[45rem] 2xl:w-[60rem] ">
            <table className=" w-full table-auto ">
              <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
                <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
                  <th>Domain Name</th>
                  <th>Create At</th>
                  <th>Assing Domain</th>
                </tr>
              </thead>
              <tbody>
                {fetch.isLoading
                  ? [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                        <td className="h-10 w-60 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                        <td className="h-10 w-40 animate-pulse border-4 border-transparent bg-gray-50 "></td>
                        <td className="h-12 w-96 animate-pulse border-4 border-transparent bg-gray-300 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-600 "></td>
                        <td className="h-10 w-40 animate-pulse border-4 border-transparent bg-gray-200 "></td>
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
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
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
                          <td className="truncate border-4 border-transparent  font-semibold text-black">
                            <div className="flex items-center justify-center">
                              {domain.isLoading ? (
                                <div className="h-5 w-5 animate-pulse rounded-lg bg-slate-300"></div>
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
                                        responsibilityPartnerId:
                                          domain.responsibilityPartners.id,
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
