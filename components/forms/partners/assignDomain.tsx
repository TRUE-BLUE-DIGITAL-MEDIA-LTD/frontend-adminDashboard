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
import { Dropdown } from "primereact/dropdown";


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

type AssignDomainProps = {
  setTriggerAssignDomain: React.Dispatch<React.SetStateAction<boolean>>;
  selectPartner: Partner;
};
function AssignDomain({
  setTriggerAssignDomain,
  selectPartner,
}: AssignDomainProps) {
  const [searchField, setSearchField] = useState<string>("");
  const [filterDomain, setFilterDomain] = useState<"all" | "no-partner">("all");
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
    queryKey: [
      "domains",
      { page: page, searchField: searchField, filter: filterDomain },
    ],
    queryFn: () =>
      GetAllDomainsByPage({
        page: page,
        searchField: searchField,
        filter: filterDomain,
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 font-Poppins lg:flex-row">
      <ul className="relative z-10 flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl lg:h-[32rem]">
        <header className="shrink-0 border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">
            {selectPartner.name}&apos;s domains
          </h3>
          <p className="text-xs text-zinc-500">Currently assigned</p>
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-auto px-3 py-3">
          {partnerOnDomain.isLoading ? (
            <div className="h-full w-full animate-pulse rounded-xl bg-zinc-800" />
          ) : (
            partnerOnDomain.data?.map((partner) => {
              return (
                <div
                  key={partner.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/30 px-3 py-2.5"
                >
                  <span className="truncate text-sm font-medium text-zinc-200">
                    {partner.domain.name}
                  </span>
                  <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    OWN
                  </span>
                </div>
              );
            })
          )}
        </div>
        <footer className="shrink-0 border-t border-white/10 px-5 py-3 text-center text-xs text-zinc-400">
          Total: {partnerOnDomain.data?.length ?? 0}
        </footer>
      </ul>

      <Form className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl lg:h-[32rem]">
        <header className="flex shrink-0 flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Assign domain</h2>
            <p className="text-xs text-zinc-500">{selectPartner.name}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400">Filter</label>
              <Dropdown
                value={filterDomain}
                onChange={(e) => {
                  setPage(1);
                  setFilterDomain(() => e.value);
                }}
                options={["all", "no-partner"]}
                placeholder="Filter Partner"
                className="h-10 w-36 rounded-lg border border-white/10 bg-black/40 text-left text-sm text-white outline-none"
              />
            </div>
            <SearchField
              value={searchField}
              onChange={(e) => {
                setSearchField(() => e);
                setPage(1);
              }}
              className="relative flex w-48 flex-col"
            >
              <Input
                placeholder="Search domains"
                className="h-10 appearance-none rounded-full border border-white/10 bg-black/40 py-2 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color"
              />
              <IoSearchCircleSharp className="absolute bottom-0 left-2 top-0 m-auto text-2xl text-main-color" />
            </SearchField>
            <button
              type="button"
              onClick={() => {
                setTriggerAssignDomain(() => false);
                document.body.style.overflow = "auto";
              }}
              className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-auto px-4 py-4">
          {domains.isLoading
            ? [...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-zinc-800/60"
                />
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
                  <div
                    key={domain.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                      domain.isChecking
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-white/10 bg-black/30 hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {domain.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {formattedDatecreateAt} ·{" "}
                        {domain.partner?.name ?? "No partner"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {domain.isLoading ? (
                        <div className="h-5 w-5 animate-pulse rounded bg-zinc-700" />
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
                          className="group rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-xs text-rose-300 transition hover:bg-rose-500/30"
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
                              handleAssignDomain({
                                partnerId: selectPartner.id,
                                domainId: domain.id,
                              });
                            } else if (e.target.checked === false) {
                              handleDeleteResponsibility({
                                domainId: domain.id,
                                partner: domain.partner ?? selectPartner,
                                responsibilityPartnerId:
                                  domain.responsibilityPartners?.id || "",
                              });
                            }
                          }}
                          checked={domain.isChecking}
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
              count={responsibilityOnPartner?.totalPages || 1}
              color="primary"
              sx={paginationSx}
            />
          </div>
        </div>
      </Form>

      <footer
        onClick={() => {
          setTriggerAssignDomain(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}


export default AssignDomain;
