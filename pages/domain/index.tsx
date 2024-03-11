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
import { Domain, SiteBuild, User } from "../../models";
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

interface HandleDeleteDomain {
  domainNameId: string;
  name: string;
}
function Index({ user }: { user: User }) {
  const [domainName, setDoaminName] = useState<string>();
  const [page, setPage] = useState<number>(1);
  const [triggerCreateDomain, setTriggerCreateDomain] =
    useState<boolean>(false);
  const [triggerUpdateDomain, setTriggerUpdateDomain] =
    useState<boolean>(false);
  const [currentUpdateDomain, setCurrentUpdateDomain] =
    useState<Domain | null>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const domains = useQuery({
    queryKey: ["domains-byPage", page, domainName],
    queryFn: () => GetAllDomainsByPage({ page: page, domainName }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
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
          <h1 className="font-Poppins text-5xl font-semibold">
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
          <SearchField
            value={domainName}
            onChange={(e) => {
              setDoaminName(() => e);
            }}
            className="relative mt-10 flex w-96 flex-col"
          >
            <Input
              placeholder="Search Domain Name"
              className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
            />
            <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
          </SearchField>
        </header>

        <main className="mt-10 flex w-full flex-col items-center justify-center gap-5 pb-20  ">
          <div className="flex flex-col items-center lg:w-11/12 xl:w-11/12 ">
            <div className="  w-[45rem]  overflow-auto p-5 2xl:w-[60rem] ">
              <table className="min-w-full max-w-max border-collapse ">
                <thead className="h-14 border-b-2 border-black font-bold text-blue-700   drop-shadow-md ">
                  <tr className="sticky top-0 z-40 bg-white ">
                    <td className=" px-5">Domain Name</td>
                    <td className="">Updated At</td>
                    <td>Site Status</td>
                    <td>DNS Status</td>
                    <td>Nameserver</td>
                    <td>Options</td>
                  </tr>
                </thead>
                <tbody className="">
                  {domains.isLoading ? (
                    loadingNumber.map((list, index) => {
                      return (
                        <tr key={index}>
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
                        <tr className="h-14 hover:bg-blue-50 " key={index}>
                          <td className="px-2">
                            {domains.isFetching ? (
                              <div className="h-5 w-full animate-pulse bg-gray-400"></div>
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
                                enqueued
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
                            bg-green-300 px-2 py-1 text-center font-extrabold text-green-800 drop-shadow-md transition duration-100 
                              hover:scale-105"
                            >
                              {" "}
                              <MdViewTimeline />
                              View
                            </button>
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
            <Pagination
              onChange={(e, page) => setPage(page)}
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
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
