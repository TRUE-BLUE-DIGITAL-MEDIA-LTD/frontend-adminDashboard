import React from "react";
import {
  Domain,
  LandingPage,
  Partner,
  ResponsibilityOnPartner,
  SiteBuild,
  User,
} from "../../models";
import {
  DeleteDomainNameService,
  ResponseGetAllDomainsByPage,
} from "../../services/admin/domain";
import { UseQueryResult } from "@tanstack/react-query";
import moment from "moment";
import { FaCheckCircle } from "react-icons/fa";
import VerifyDomain from "./verifyDomain";
import { MdDelete, MdViewTimeline } from "react-icons/md";
import Link from "next/link";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import Swal from "sweetalert2";
import { useUpdateSitemap, useVerifyDomain } from "../../react-query";

type Props = {
  list: Domain & {
    siteBuild?: SiteBuild | null;
    partner: Partner | null;
    partnerOnDomain: ResponsibilityOnPartner | null;
    landingPages: LandingPage[];
  };
  domains: UseQueryResult<ResponseGetAllDomainsByPage, Error>;
  user: User;
  setTriggerUpdateDomain: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUpdateDomain: React.Dispatch<
    React.SetStateAction<Domain | undefined>
  >;
};
function ListDomain({
  list,
  domains,
  user,
  setTriggerUpdateDomain,
  setCurrentUpdateDomain,
}: Props) {
  const verifyGoogle = useVerifyDomain();
  const summitSitemap = useUpdateSitemap();
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

  // handle delete domain

  const handleDeleteDomain = async ({
    domainNameId,
    name,
  }: {
    domainNameId: string;
    name: string;
  }) => {
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

  return (
    <tr className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200">
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
        {list.google_domain_id ? (
          <div className=" flex w-full items-center justify-center rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase  text-green-800">
            <FaCheckCircle />
            Verify
          </div>
        ) : (
          <button
            disabled={verifyGoogle.isPending}
            onClick={async () => {
              try {
                await verifyGoogle.mutateAsync({
                  domainId: list.id,
                });
              } catch (error: any) {
                console.log(error);
                Swal.fire("error!", error.message?.toString(), "error");
              }
            }}
            className="w-full rounded-lg bg-gray-300 px-1 text-center
                             font-extrabold uppercase text-gray-800  active:scale-105"
          >
            {verifyGoogle.isPending ? "Verifying..." : "Not Verify"}
          </button>
        )}
      </td>
      <td className="px-2">
        {list.sitemap_status === "COMPLETED" ? (
          <div className=" w-max rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase  text-green-800">
            COMPLETED
          </div>
        ) : list.sitemap_status === "PEDDING" ? (
          <button
            disabled={summitSitemap.isPending}
            onClick={async () => {
              try {
                await summitSitemap.mutateAsync({
                  domainId: list.id,
                });
              } catch (error: any) {
                console.log(error);
                Swal.fire("error!", error.message?.toString(), "error");
              }
            }}
            className=" w-max animate-pulse rounded-lg bg-yellow-300 px-1 text-center font-extrabold uppercase text-yellow-800  active:scale-105"
          >
            {summitSitemap.isPending ? "PEDDING" : "PRESS TO SUMMIT"}
          </button>
        ) : (
          list.sitemap_status === "NOT_FOUND" && (
            <button className=" w-max rounded-lg bg-red-300 px-1 text-center font-extrabold uppercase text-red-800  active:scale-105">
              NOT FOUND
            </button>
          )
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
            <div className="rounded-md  px-2 py-1 text-xs text-gray-500">
              <div className="w-40 truncate">NAME: {list.partner.name}</div>
              <div className="w-40 truncate">
                PARTNER ID: {list.partner.affiliateId}
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-red-200 px-2 py-1 text-red-500">
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
            <div className="rounded-md bg-red-200 px-2 py-1 text-red-500">
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

        {user.role === "admin" && (
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
        )}
      </td>
    </tr>
  );
}

export default ListDomain;
