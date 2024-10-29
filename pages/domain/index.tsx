import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import { GetUser } from "../../services/admin/user";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteDomainNameService,
  GetAllDomainsByPage,
} from "../../services/admin/domain";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import {
  Domain,
  Partner,
  ResponsibilityOnPartner,
  SimCardOnPartner,
  SiteBuild,
  User,
} from "../../models";
import { loadingNumber } from "../../data/loadingNumber";
import { Pagination, Skeleton } from "@mui/material";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import SpinLoading from "../../components/loadings/spinLoading";
import { MdDelete, MdViewTimeline } from "react-icons/md";
import DomainCreate from "../../components/forms/domains/domainCreate";
import DomainUpdate from "../../components/forms/domains/domainUpdate";
import VerifyDomain from "../../components/domain/verifyDomain";
import moment from "moment";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import { GetPartnerByMangegerService } from "../../services/admin/partner";
import { Dropdown } from "primereact/dropdown";
import { IoMdPerson } from "react-icons/io";
import Link from "next/link";

interface HandleDeleteDomain {
  domainNameId: string;
  name: string;
}
function Index({ user }: { user: User }) {
  const [searchField, setSearchField] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectPartner, setSelectPartner] = useState<Partner>();

  const [triggerCreateDomain, setTriggerCreateDomain] =
    useState<boolean>(false);
  const [triggerUpdateDomain, setTriggerUpdateDomain] =
    useState<boolean>(false);
  const [currentUpdateDomain, setCurrentUpdateDomain] =
    useState<Domain | null>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const domains = useQuery({
    queryKey: [
      "domains-byPage",
      {
        page,
        searchField,
        partnerId: selectPartner?.id,
        filter:
          selectPartner?.id === "no-partner"
            ? "no-partner"
            : selectPartner?.id === "all"
              ? "all"
              : undefined,
      },
    ],
    queryFn: () =>
      GetAllDomainsByPage({
        page: page,
        searchField: searchField,
        partnerId: selectPartner?.id,
        filter:
          selectPartner?.id === "no-partner"
            ? "no-partner"
            : selectPartner?.id === "all"
              ? "all"
              : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  const partners = useQuery({
    queryKey: ["partners-by-manager"],
    queryFn: () =>
      GetPartnerByMangegerService().then((response) => {
        let addSeeAll = [...response];
        if (user.role === "partner") {
          setSelectPartner(() => response[0]);
          return response;
        }
        addSeeAll.unshift({
          createAt: new Date(),
          updateAt: new Date(),
          affiliateId: "all",
          userId: "all",
          name: "See All",
          id: "all",
          responsibilityOnPartner: new Array(domains.data?.totalDomain),
          simCardOnPartner: [],
        });
        addSeeAll.push({
          createAt: new Date(),
          updateAt: new Date(),
          affiliateId: "none",
          userId: "none",
          name: "No Partner",
          id: "no-partner",
          responsibilityOnPartner: new Array(
            domains.data?.totalNoPartnerDomain,
          ),
          simCardOnPartner: [],
        });

        setSelectPartner(() => addSeeAll[0] as Partner);
        return addSeeAll;
      }),
    enabled: domains.isSuccess,
  });

  // handle delete domain

  const handleDeleteDomain = async ({
    domainNameId,
    name,
  }: HandleDeleteDomain) => {
    const replacedText = name.replace(/ /g, "_");
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Domain",
      input: "text",
      footer:
        "Please keep it mind if you delete domain, the landing pages that is connected to this domain also be deleted",
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

        await DeleteDomainNameService({
          domainNameId: domainNameId,
        });
        await domains.refetch();
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (err: any) {
        console.log(err);
        Swal.fire("error!", err.message?.toString(), "error");
      }
    }
  };

  const handleViewNameServer = ({
    nameServer,
    domain,
  }: {
    nameServer: string[];
    domain: string;
  }) => {
    if (nameServer.length === 0) {
      Swal.fire({
        title: `Nameserver of ${domain}`,
        html: `No Nameserver Found`,
      });
    } else {
      Swal.fire({
        title: `Nameserver of ${domain}`,
        html: `${nameServer
          .map((list, index) => {
            return `<div>${list}</div>`;
          })
          .join("")}`,
      });
    }
  };

  return (
    <DashboardLayout user={user}>
      {triggerCreateDomain && (
        <DomainCreate
          domains={domains}
          setTriggerCreateDomain={setTriggerCreateDomain}
        />
      )}

      {triggerUpdateDomain && (
        <DomainUpdate
          domain={currentUpdateDomain as Domain}
          setTriggerUpdateDomain={setTriggerUpdateDomain}
          domains={domains}
        />
      )}
      <div className="w-full">
        <header className="mt-20 flex w-full flex-col items-center  justify-center gap-7 text-center">
          <h1 className="font-Poppins text-4xl font-semibold md:text-5xl">
            <span className="text-icon-color">D</span>
            <span>omains</span>
          </h1>
          {user.role === "admin" && (
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateDomain(() => true);
              }}
              className="rounded-full bg-main-color px-20 py-2 
    text-xl font-semibold text-white transition duration-150 hover:bg-blue-700 
    active:scale-105"
            >
              Create
            </button>
          )}
          <div className="flex w-full flex-wrap justify-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <label className="text-sm font-normal">Search Domain</label>
              <SearchField
                value={searchField}
                onChange={(e) => {
                  setSearchField(() => e);
                  setPage(1);
                }}
                className="relative  flex w-96 flex-col"
              >
                <Input
                  placeholder="Search Domain Name Or Note"
                  className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
                />
                <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
              </SearchField>
            </div>
            <div className="flex flex-col items-start gap-1">
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
                ) => (
                  <div className="n flex w-full items-center gap-2">
                    <IoMdPerson />
                    <span>{partner.name}</span>
                    <span className="rounded-md bg-gray-700 px-2 py-1 text-xs text-white">
                      Total {partner.responsibilityOnPartner.length}
                    </span>
                  </div>
                )}
                optionLabel="name"
                loading={partners.isLoading}
                options={partners.data}
                placeholder="Select Partner"
                className="h-10 w-96  rounded-lg text-left outline-0 ring-2 ring-icon-color "
              />
            </div>
          </div>
        </header>

        <main className="mt-10 flex w-full flex-col items-center justify-center gap-5 pb-20  ">
          <div
            className=" h-96 w-80 justify-center overflow-auto   md:w-[30rem] 
          lg:w-[45rem] xl:w-[60rem] 2xl:w-[70rem] "
          >
            <table className="w-max min-w-full border-collapse ">
              <thead className="h-14 border-b-2 border-black font-bold text-blue-700   drop-shadow-md ">
                <tr className="sticky top-0 z-40 bg-white ">
                  <td className=" px-5">Domain Name</td>
                  <td className="">Updated At</td>
                  <td>Site Status</td>
                  <td>DNS Status</td>
                  <td>Nameserver</td>
                  <td>Partners</td>
                  <td>Landing Pages</td>
                  <td>Options</td>
                </tr>
              </thead>
              <tbody className="">
                {domains.isLoading ? (
                  loadingNumber.map((list, index) => {
                    return (
                      <tr
                        className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                        key={index}
                      >
                        <td>
                          <Skeleton />
                        </td>
                        <td>
                          <Skeleton animation="wave" />
                        </td>
                        <td>
                          <Skeleton />
                        </td>
                        <td>
                          <Skeleton animation="wave" />
                        </td>
                        <td>
                          <Skeleton />
                        </td>
                      </tr>
                    );
                  })
                ) : domains.isError ? (
                  <tr>NO domain Found</tr>
                ) : (
                  domains.data?.domains.map((list, index) => {
                    return (
                      <tr
                        className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                        key={index}
                      >
                        <td className="px-2">
                          {domains.isFetching ? (
                            <div className="relative z-10 h-5 w-full animate-pulse bg-gray-400"></div>
                          ) : (
                            list?.name
                          )}
                        </td>
                        <td className=" px-2">
                          {moment(list.updateAt).format("DD/MM/YY hh:mm A")}
                        </td>
                        <td className="px-2">
                          {list.siteBuild?.deploy_state === "ready" ? (
                            <div className=" w-max rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase  text-green-800">
                              READY
                            </div>
                          ) : list.siteBuild?.deploy_state === "building" ? (
                            <div className=" w-max animate-pulse rounded-lg bg-yellow-300 px-1 text-center font-extrabold uppercase  text-yellow-800">
                              Building
                            </div>
                          ) : list.siteBuild?.deploy_state === "error" ? (
                            <div className=" w-max rounded-lg bg-red-300 px-1 text-center font-extrabold uppercase  text-red-800">
                              Error
                            </div>
                          ) : list.siteBuild?.deploy_state === "enqueued" ? (
                            <div className=" w-max animate-pulse rounded-lg bg-orange-300 px-1 text-center font-extrabold uppercase  text-orange-800">
                              Enqueued
                            </div>
                          ) : list.siteBuild?.deploy_state === "new" ? (
                            <div className=" w-max animate-pulse rounded-lg bg-orange-300 px-1 text-center font-extrabold uppercase  text-orange-800">
                              In Queue
                            </div>
                          ) : (
                            <div className=" w-max rounded-lg bg-gray-300 px-1 text-center font-extrabold uppercase  text-gray-800">
                              Unknow Status
                            </div>
                          )}
                        </td>
                        <td className="px-2">
                          <VerifyDomain domainName={list.name} />
                        </td>
                        <td className="px-2">
                          <button
                            onClick={() =>
                              handleViewNameServer({
                                nameServer: list.dns_servers,
                                domain: list.name,
                              })
                            }
                            className=" flex w-max items-center justify-center rounded-lg
                            bg-green-300 px-2 py-1 text-center font-extrabold text-green-800 transition duration-100 
                              hover:scale-105"
                          >
                            {" "}
                            <MdViewTimeline />
                            View
                          </button>
                        </td>
                        <td className="px-2 ">
                          <div className="flex max-w-40 flex-wrap">
                            {list.partner ? (
                              <div
                                key={index}
                                className="rounded-md  px-2 py-1 text-xs text-gray-500"
                              >
                                <div className="w-40 truncate">
                                  NAME: {list.partner.name}
                                </div>
                                <div className="w-40 truncate">
                                  PARTNER ID: {list.partner.affiliateId}
                                </div>
                              </div>
                            ) : (
                              <div
                                key={index}
                                className="rounded-md bg-red-200 px-2 py-1 text-red-500"
                              >
                                <span>No Partner</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 ">
                          <div className="flex flex-col gap-2">
                            {list.landingPages.length > 0 ? (
                              list.landingPages.map((landingPage, index) => {
                                return (
                                  <Link
                                    target="_blank"
                                    href={`/landingpage/${landingPage.id}`}
                                    key={landingPage.id}
                                    className="flex max-w-36 items-start  truncate rounded-md
                                     px-2 py-1 text-start text-xs text-gray-500 underline"
                                  >
                                    <div className="w-40 truncate">
                                      Title: {landingPage.title}
                                    </div>
                                  </Link>
                                );
                              })
                            ) : (
                              <div
                                key={index}
                                className="rounded-md bg-red-200 px-2 py-1 text-red-500"
                              >
                                <span>No Landing Page</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="flex h-14 w-20 gap-2">
                          <button
                            onClick={() => {
                              setTriggerUpdateDomain(() => true);
                              setCurrentUpdateDomain(() => list as Domain);
                              document.body.style.overflow = "hidden";
                            }}
                            className="text-3xl text-blue-700 transition duration-100 hover:scale-105 active:text-blue-900"
                          >
                            <BiSolidMessageSquareEdit />
                          </button>
                          {isLoading ? (
                            <SpinLoading />
                          ) : (
                            user.role === "admin" && (
                              <button
                                onClick={() =>
                                  handleDeleteDomain({
                                    domainNameId: list.id,
                                    name: list.name,
                                  })
                                }
                                className="text-3xl text-red-700 transition duration-100 hover:scale-105 active:text-red-900"
                              >
                                <MdDelete />
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex w-full justify-center">
            <Pagination
              onChange={(e, page) => setPage(page)}
              page={page}
              count={domains?.data?.totalPages}
              color="primary"
            />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    if (user.TOTPenable === false) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/setup-totp",
        },
      };
    }
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "https://home.oxyclick.com",
      },
    };
  }
};
