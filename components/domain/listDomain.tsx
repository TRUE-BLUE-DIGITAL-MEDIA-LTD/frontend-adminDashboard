import React from "react";
import {
  Domain,
  LandingPage,
  Partner,
  ResponsibilityOnPartner,
  SiteBuild,
  User,
} from "../../models";
import { ResponseGetAllDomainsByPage } from "../../services/admin/domain";
import { UseQueryResult } from "@tanstack/react-query";
import moment from "moment";
import { FaCheckCircle } from "react-icons/fa";
import VerifyDomain from "./verifyDomain";
import Link from "next/link";
import {
  MdContentCopy,
  MdDns,
  MdDomainVerification,
  MdLanguage,
  MdNightsStay,
  MdPeople,
  MdPublic,
  MdSettings,
  MdShare,
} from "react-icons/md";
import { SiGooglemaps } from "react-icons/si";
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
};
function ListDomain({ list, domains, user }: Props) {
  const verifyGoogle = useVerifyDomain();
  const summitSitemap = useUpdateSitemap();
  const averageSEOMobile: number =
    (((list.accessibilityScoreMobile ?? 0) +
      (list.seoScoreMobile ?? 0) +
      (list.bestPracticesScoreMobile ?? 0) +
      (list.performanceScoreMobile ?? 0)) /
      4) *
    100;
  const averageSEODesktop: number =
    (((list.accessibilityScoreDesktop ?? 0) +
      (list.seoScoreDesktop ?? 0) +
      (list.bestPracticesScoreDesktop ?? 0) +
      (list.performanceScoreDesktop ?? 0)) /
      4) *
    100;
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
    <tr className="h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200">
      <td className="px-2">
        <Link
          href={`/domain/${list.id}`}
          className="flex items-center gap-2 font-medium text-blue-600 hover:underline"
        >
          <MdLanguage />
          {list?.name}
        </Link>
      </td>
      <td className="px-2">
        {moment(list.updateAt).format("DD/MM/YY hh:mm A")}
      </td>
      <td className="px-2">
        {list.siteBuild?.deploy_state === "ready" ? (
          <div className="flex w-max items-center gap-2 rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase text-green-800">
            <MdPublic />
            READY
          </div>
        ) : list.siteBuild?.deploy_state === "building" ? (
          <div className="flex w-max animate-pulse items-center gap-2 rounded-lg bg-yellow-300 px-1 text-center font-extrabold uppercase text-yellow-800">
            <MdSettings />
            Building
          </div>
        ) : list.siteBuild?.deploy_state === "error" &&
          list.siteBuild?.error === "Canceled build" ? (
          <div className="flex w-max items-center gap-2 rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase text-green-800">
            <MdPublic />
            READY
          </div>
        ) : list.siteBuild?.deploy_state === "error" ? (
          <div className="flex w-max  items-center gap-2 truncate rounded-lg bg-red-300 px-1 text-center font-extrabold uppercase text-red-800">
            <MdPublic />
            <span className="max-w-32 truncate">
              {list.siteBuild?.error ?? "Error"}
            </span>
          </div>
        ) : list.siteBuild?.deploy_state === "enqueued" ? (
          <div className="flex w-max animate-pulse items-center gap-2 rounded-lg bg-orange-300 px-1 text-center font-extrabold uppercase text-orange-800">
            <MdNightsStay />
            Enqueued
          </div>
        ) : list.siteBuild?.deploy_state === "new" ? (
          <div className="flex w-max animate-pulse items-center gap-2 rounded-lg bg-orange-300 px-1 text-center font-extrabold uppercase text-orange-800">
            <MdNightsStay />
            In Queue
          </div>
        ) : (
          <div className="flex w-max items-center gap-2 rounded-lg bg-gray-300 px-1 text-center font-extrabold uppercase text-gray-800">
            <MdPublic />
            Unknow Status
          </div>
        )}
      </td>
      <td className="px-2">
        {list.google_domain_id ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase text-green-800">
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-300 px-1 text-center font-extrabold uppercase text-gray-800 active:scale-105"
          >
            <MdDomainVerification />
            {verifyGoogle.isPending ? "Verifying..." : "Not Verify"}
          </button>
        )}
      </td>
      <td className="px-2">
        {list.sitemap_status === "COMPLETED" ? (
          <div className="flex w-max items-center gap-2 rounded-lg bg-green-300 px-1 text-center font-extrabold uppercase text-green-800">
            <SiGooglemaps />
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
            className="flex w-max animate-pulse items-center gap-2 rounded-lg bg-yellow-300 px-1 text-center font-extrabold uppercase text-yellow-800 active:scale-105"
          >
            <SiGooglemaps />
            {summitSitemap.isPending ? "PEDDING" : "PRESS TO SUMMIT"}
          </button>
        ) : (
          list.sitemap_status === "NOT_FOUND" && (
            <button className="flex w-max items-center gap-2 rounded-lg bg-red-300 px-1 text-center font-extrabold uppercase text-red-800 active:scale-105">
              <SiGooglemaps />
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
          className="flex w-max items-center justify-center gap-2 rounded-lg bg-green-300 px-2 py-1 text-center font-extrabold text-green-800 transition duration-100 hover:scale-105"
        >
          <MdDns />
          View
        </button>
      </td>
      <td className="px-2">
        <div className="flex max-w-40 flex-wrap">
          {list.partner ? (
            <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-500">
              <MdPeople />
              <div>
                <div className="w-40 truncate">NAME: {list.partner.name}</div>
                <div className="w-40 truncate">
                  PARTNER ID: {list.partner.affiliateId}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-red-200 px-2 py-1 text-red-500">
              <MdPeople />
              <span>No Partner</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-2">
        <div className="flex flex-col gap-2">
          {list.landingPages.length > 0 ? (
            list.landingPages.map((landingPage, index) => {
              return (
                <Link
                  target="_blank"
                  href={`/landingpage/${landingPage.id}`}
                  key={landingPage.id}
                  className="flex max-w-36 items-start truncate rounded-md px-2 py-1 text-start text-xs text-gray-500 underline"
                >
                  <div className="flex w-40 items-center gap-2 truncate">
                    <MdContentCopy />
                    Title: {landingPage.title}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-red-200 px-2 py-1 text-red-500">
              <MdContentCopy />
              <span>No Landing Page</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-2">
        <div className="flex  items-center gap-5">
          <div className="text-xs uppercase text-gray-500">Desktop</div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded text-sm font-bold shadow-sm ${
              averageSEODesktop >= 90
                ? "border-green-500 bg-green-50 text-green-500"
                : averageSEODesktop >= 50
                  ? "border-orange-500 bg-orange-50 text-orange-500"
                  : "border-red-500 bg-red-50 text-red-500"
            }`}
          >
            {averageSEODesktop.toFixed(1)}
          </div>
          <div className="mt-1 text-xs uppercase text-gray-500">Mobile</div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded text-sm font-bold shadow-sm ${
              averageSEOMobile >= 90
                ? "border-green-500 bg-green-50 text-green-500"
                : averageSEOMobile >= 50
                  ? "border-orange-500 bg-orange-50 text-orange-500"
                  : "border-red-500 bg-red-50 text-red-500"
            }`}
          >
            {averageSEOMobile}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default ListDomain;
