import { Skeleton, TextField } from "@mui/material";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdList,
  MdOutlineArtTrack,
  MdRemoveCircle,
  MdSave,
  MdSettings,
  MdUpdate,
} from "react-icons/md";
import Swal from "sweetalert2";
import { Domain } from "../../../models";
import {
  GetDomainService,
  InputUpdateDomainService,
  ResponseGetAllDomainsByPage,
  UpdateDomainService,
} from "../../../services/admin/domain";
import { RemoveDomainNameFromLandingPageService } from "../../../services/admin/landingPage";
import VerifyDomain from "../../domain/verifyDomain";
import SpinLoading from "../../loadings/spinLoading";
import { useEnterKey, useEscKey } from "../../../hooks";
import { FaGoogle, FaChartLine } from "react-icons/fa6";
import { BiSitemap } from "react-icons/bi";
import { useUpdateSeoScore } from "../../../react-query/domain";

interface DomainUpdate {
  domain: Domain;
  setTriggerUpdateDomain: React.Dispatch<React.SetStateAction<boolean>>;
  domains: UseQueryResult<ResponseGetAllDomainsByPage, Error>;
}

function DomainUpdate({
  domain,
  setTriggerUpdateDomain,
  domains,
}: DomainUpdate) {
  const [domainData, setDomainData] = useState<InputUpdateDomainService>({
    landingPages: [
      {
        name: "",
        id: "",
        percent: 0,
      },
    ],
    note: "",
    domainNameId: "",
    googleAnalyticsId: "",
    oxyeyeAnalyticsId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const getDomain = useQuery({
    queryKey: ["domain", domain.id],
    queryFn: () => GetDomainService({ domainId: domain.id }),
  });

  const updateSeoScore = useUpdateSeoScore();

  useEffect(() => {
    setDomainData(() => {
      return {
        name: getDomain.data?.domain.name as string,
        domainNameId: getDomain.data?.domain.id as string,
        googleAnalyticsId: getDomain.data?.domain.googleAnalyticsId as string,
        oxyeyeAnalyticsId: getDomain.data?.domain.oxyeyeAnalyticsId,
        note: getDomain.data?.domain.note as string,
        landingPages: getDomain.data?.landingPages as {
          name: string;
          id: string;
          percent: number;
        }[],
      };
    });
  }, [getDomain.data]);

  const handleUpdateDomain = async () => {
    try {
      setIsLoading(() => true);
      await UpdateDomainService({
        domainNameId: domain.id,
        note: domainData.note,
        landingPages: domainData.landingPages,
        oxyeyeAnalyticsId: domainData.oxyeyeAnalyticsId,
        googleAnalyticsId: domainData?.googleAnalyticsId,
      });
      await getDomain.refetch();
      Swal.fire("Success", "Domain updated successfully", "success");
      setIsLoading(() => false);
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  const handleUpdateSeoScore = async () => {
    try {
      setIsLoading(() => true);

      await updateSeoScore.mutateAsync({ domainId: domain.id });
      await Promise.all([getDomain.refetch(), domains.refetch()]);

      Swal.fire("Success", "SEO score updated successfully", "success");
    } catch (err: any) {
      console.log(err);
      Swal.fire("Error!", err.message?.toString(), "error");
    } finally {
      setIsLoading(() => false);
    }
  };

  //handle remove domain name from landing page
  const handleRemoveDomainName = ({
    landingPageId,
  }: {
    landingPageId: string;
  }) => {
    Swal.fire({
      title: "Are you sure?",
      text: "To Remove This Landing Page From The Domain",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.isLoading();
          await RemoveDomainNameFromLandingPageService({
            landingPageId: landingPageId,
          });
          await getDomain.refetch();
          Swal.fire(
            "Deleted!",
            "The landing page has been unlinked from this domain",
            "success",
          );
        } catch (err: any) {
          console.log(err);
          Swal.fire("Error!", err.message?.toString(), "error");
        }
      }
    });
  };

  useEnterKey(() => {
    handleUpdateDomain();
  });

  useEscKey(() => {
    document.body.style.overflow = "auto";
    setTriggerUpdateDomain(false);
  });

  const getScoreColor = (score: number | undefined | null) => {
    if (score === undefined || score === null)
      return "text-gray-400 border-gray-200";
    if (score >= 90) return "text-green-500 border-green-500";
    if (score >= 50) return "text-orange-500 border-orange-500";
    return "text-red-500 border-red-500";
  };

  const getScoreBgColor = (score: number | undefined | null) => {
    if (score === undefined || score === null) return "bg-gray-50";
    if (score >= 90) return "bg-green-50";
    if (score >= 50) return "bg-orange-50";
    return "bg-red-50";
  };

  const CircularScore = ({
    score,
    label,
  }: {
    score: number | undefined | null;
    label: string;
  }) => {
    const percent = (score ?? 0) * 100;
    const colorClass = getScoreColor(percent);
    const bgColorClass = getScoreBgColor(percent);

    return (
      <div className="flex flex-col items-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${colorClass} ${bgColorClass} shadow-sm`}
        >
          <span className="text-xl font-bold">
            {score !== undefined && score !== null ? percent : "N/A"}
          </span>
        </div>
        <span className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-gray-50 font-Poppins text-gray-800">
      {/* Header */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b bg-white px-8 shadow-sm">
        <section className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800">
            Edit Domain Information
          </h1>
          <div className="mt-1 flex items-center justify-start gap-3 text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{domain.name}</span>
            <VerifyDomain domainName={domain.name} />
          </div>
        </section>
        <button
          onClick={() => {
            document.body.style.overflow = "auto";
            setTriggerUpdateDomain(() => false);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600 transition hover:bg-red-100 hover:text-red-600 active:scale-95"
        >
          <MdClose />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Domain Settings Section */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-gray-800">
              <MdSettings className="text-blue-600" /> Domain Settings
            </h2>
            {getDomain.isFetching && !getDomain.data ? (
              <Skeleton
                variant="rectangular"
                height={200}
                className="rounded-lg"
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  onChange={(e) =>
                    setDomainData((prev) => ({
                      ...prev,
                      googleAnalyticsId: e.target.value,
                    }))
                  }
                  value={domainData?.googleAnalyticsId || ""}
                  className="w-full"
                  name="googleAnalyticsId"
                  label="Google Analytics ID"
                  variant="outlined"
                />
                <TextField
                  disabled
                  value={getDomain.data?.domain.sitemap_status || ""}
                  className="w-full bg-gray-50"
                  label="Google Site Status"
                  variant="outlined"
                />
                <TextField
                  disabled
                  value={getDomain.data?.domain.google_domain_id || ""}
                  className="w-full bg-gray-50"
                  label="Google ID Verify"
                  variant="outlined"
                />
                <TextField
                  disabled
                  value={getDomain.data?.domain.netlify_dns_zoneId || ""}
                  className="w-full bg-gray-50"
                  label="Netlify DNSZone ID"
                  variant="outlined"
                />
                <TextField
                  disabled
                  value={getDomain.data?.domain.netlify_siteId || ""}
                  className="w-full bg-gray-50"
                  label="Netlify Site ID"
                  variant="outlined"
                />
                <TextField
                  disabled
                  value={getDomain.data?.domain.dns_servers?.join(" - ") || ""}
                  className="w-full bg-gray-50"
                  label="Netlify DNS Server"
                  variant="outlined"
                />
                <div className="col-span-1 md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Note
                  </label>
                  <textarea
                    onChange={(e) =>
                      setDomainData((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    value={domainData?.note || ""}
                    className="h-32 w-full resize-none rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    name="note"
                    placeholder="Add notes about this domain..."
                  />
                </div>
              </div>
            )}
          </section>

          {/* SEO Performance Section */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b pb-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <FaChartLine className="text-green-600" /> SEO Performance
              </h2>
              <button
                onClick={handleUpdateSeoScore}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <SpinLoading />
                ) : (
                  <>
                    <MdUpdate /> Update SEO Score
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
                <span className="mb-4 text-center text-sm font-semibold text-gray-700">
                  Performance
                </span>
                <div className="flex justify-around px-2">
                  <CircularScore
                    score={getDomain.data?.domain.performanceScoreDesktop}
                    label="Desktop"
                  />
                  <div className="mx-2 h-16 w-px bg-gray-200"></div>
                  <CircularScore
                    score={getDomain.data?.domain.performanceScoreMobile}
                    label="Mobile"
                  />
                </div>
              </div>
              <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
                <span className="mb-4 text-center text-sm font-semibold text-gray-700">
                  Accessibility
                </span>
                <div className="flex justify-around px-2">
                  <CircularScore
                    score={getDomain.data?.domain.accessibilityScoreDesktop}
                    label="Desktop"
                  />
                  <div className="mx-2 h-16 w-px bg-gray-200"></div>
                  <CircularScore
                    score={getDomain.data?.domain.accessibilityScoreMobile}
                    label="Mobile"
                  />
                </div>
              </div>
              <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
                <span className="mb-4 text-center text-sm font-semibold text-gray-700">
                  Best Practices
                </span>
                <div className="flex justify-around px-2">
                  <CircularScore
                    score={getDomain.data?.domain.bestPracticesScoreDesktop}
                    label="Desktop"
                  />
                  <div className="mx-2 h-16 w-px bg-gray-200"></div>
                  <CircularScore
                    score={getDomain.data?.domain.bestPracticesScoreMobile}
                    label="Mobile"
                  />
                </div>
              </div>
              <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
                <span className="mb-4 text-center text-sm font-semibold text-gray-700">
                  SEO
                </span>
                <div className="flex justify-around px-2">
                  <CircularScore
                    score={getDomain.data?.domain.seoScoreDesktop}
                    label="Desktop"
                  />
                  <div className="mx-2 h-16 w-px bg-gray-200"></div>
                  <CircularScore
                    score={getDomain.data?.domain.seoScoreMobile}
                    label="Mobile"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Landing Pages Section */}
          {getDomain.isFetching && !getDomain.data ? (
            <Skeleton
              variant="rectangular"
              height={150}
              className="rounded-lg"
            />
          ) : (
            domainData?.landingPages?.length > 0 && (
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-6 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-gray-800">
                  <MdList className="text-purple-600" /> Linked Landing Pages
                  <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                    {domainData.landingPages.length}
                  </span>
                </h2>
                <ul className="flex flex-col gap-4">
                  {domainData.landingPages.map((landingPage) => (
                    <li
                      className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4 transition hover:bg-gray-100 sm:flex-row"
                      key={landingPage.id}
                    >
                      <Link
                        target="_blank"
                        href={`/landingpage/${landingPage.id}`}
                        className="flex flex-1 items-center gap-3 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <MdOutlineArtTrack className="text-xl" />
                        <span className="truncate">{landingPage.name}</span>
                      </Link>
                      <div className="flex w-full items-center gap-4 sm:w-auto">
                        <TextField
                          type="number"
                          value={landingPage?.percent}
                          size="small"
                          className="w-32 bg-white"
                          onChange={(e) =>
                            setDomainData((prev) => {
                              const landingPages = [...prev.landingPages];
                              const index = landingPages.findIndex(
                                (list) => list.id === landingPage.id,
                              );
                              if (index !== -1) {
                                landingPages[index] = {
                                  ...landingPages[index],
                                  percent: Number(e.target.value),
                                };
                              }
                              return { ...prev, landingPages };
                            })
                          }
                          label="Probability (%)"
                          variant="outlined"
                        />
                        <button
                          onClick={() =>
                            handleRemoveDomainName({
                              landingPageId: landingPage.id,
                            })
                          }
                          className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white active:scale-95"
                        >
                          <MdRemoveCircle /> Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          )}

          {/* Google Search Console / Sitemap Section */}
          {getDomain.data?.sitemap && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-gray-800">
                <FaGoogle className="text-blue-500" /> Google Search Console
              </h2>
              <div className="rounded-lg border bg-gray-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-700">
                  <BiSitemap className="text-orange-500" /> Sitemap Information
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="border-b bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Sitemap</th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Type
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Submitted
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Last Read
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Discovered Pages
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {getDomain.data.sitemap.contents?.map(
                        (sitemap, index) => {
                          const errorNumber = Number(
                            getDomain.data.sitemap.errors || 0,
                          );
                          const warningNumber = Number(
                            getDomain.data.sitemap.warnings || 0,
                          );
                          const isSuccess =
                            warningNumber === 0 && errorNumber === 0;

                          return (
                            <tr className="hover:bg-gray-50" key={index}>
                              <td className="px-4 py-3">
                                <a
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-blue-600 hover:underline"
                                  href={getDomain.data.sitemap.path ?? "#"}
                                >
                                  {getDomain.data.sitemap.path}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {sitemap.type}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {new Date(
                                  getDomain.data.sitemap.lastSubmitted ??
                                    new Date(),
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {new Date(
                                  getDomain.data.sitemap.lastDownloaded ??
                                    new Date(),
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {isSuccess ? "SUCCESS" : "ERROR"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-medium">
                                {sitemap.submitted}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer / Actions */}
      <footer className="flex h-20 shrink-0 items-center justify-end gap-4 border-t bg-white px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => {
            document.body.style.overflow = "auto";
            setTriggerUpdateDomain(false);
          }}
          className="flex h-11 min-w-[120px] items-center justify-center rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95"
        >
          Cancel
        </button>
        <button
          disabled={isLoading}
          onClick={handleUpdateDomain}
          className="flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
        >
          {isLoading ? (
            <SpinLoading />
          ) : (
            <>
              <MdSave className="text-lg" /> Save Changes
            </>
          )}
        </button>
      </footer>
    </div>
  );
}

export default DomainUpdate;
