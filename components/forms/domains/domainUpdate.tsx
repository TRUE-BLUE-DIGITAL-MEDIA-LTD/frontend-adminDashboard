import { Skeleton, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdList,
  MdOutlineArtTrack,
  MdRemoveCircle,
  MdSave,
  MdSettings,
} from "react-icons/md";
import Swal from "sweetalert2";
import { Domain } from "../../../models";
import {
  GetDomainService,
  InputUpdateDomainService,
  UpdateDomainService,
} from "../../../services/admin/domain";
import { RemoveDomainNameFromLandingPageService } from "../../../services/admin/landingPage";
import VerifyDomain from "../../domain/verifyDomain";
import SpinLoading from "../../loadings/spinLoading";
import { useEnterKey, useEscKey } from "../../../hooks";
import { FaGoogle } from "react-icons/fa6";
import { BiSitemap } from "react-icons/bi";

interface DomainUpdate {
  domain: Domain;
  setTriggerUpdateDomain: React.Dispatch<React.SetStateAction<boolean>>;
}

function DomainUpdate({ domain, setTriggerUpdateDomain }: DomainUpdate) {
  const [domainData, setDomainData] = useState<InputUpdateDomainService>({
    landingPages: [
      {
        name: "",
        id: "",
        percent: 0,
      },
    ],
    name: "",
    note: "",
    domainNameId: "",
    googleAnalyticsId: "",
    oxyeyeAnalyticsId: "",
  });
  const [days, setDays] = useState(25);
  const [isVaildDomain, setIsVildDomain] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const getDomain = useQuery({
    queryKey: ["domain", domain.id, { days: days }],
    queryFn: () => GetDomainService({ domainId: domain.id, days: days }),
  });

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
        name: domainData.name,
        domainNameId: domain.id,
        note: domainData.note,
        landingPages: domainData.landingPages,
        oxyeyeAnalyticsId: domainData.oxyeyeAnalyticsId,
        googleAnalyticsId: domainData?.googleAnalyticsId,
      });
      await getDomain.refetch();
      Swal.fire("success", "create domain successfully", "success");
      setIsLoading(() => false);
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
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
            "The landing page has been unlinked to this domain",
            "success",
          );
        } catch (err: any) {
          console.log(err);
          Swal.fire("error!", err.message?.toString(), "error");
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen
     items-center justify-center font-Poppins"
    >
      <div
        className="max-h-5/6 flex h-max w-11/12 flex-col  items-center justify-start gap-5 
       overflow-hidden rounded-lg bg-white  md:h-5/6 md:w-10/12 "
      >
        <header className="flex h-40 w-full items-center justify-between bg-slate-800 px-5 text-white">
          <section>
            <h1 className="text-2xl font-bold">Edit Domian Infomation</h1>
            <div className="mt-3 flex items-center justify-start gap-1">
              <span>{domain.name}</span>
              <VerifyDomain domainName={domain.name} />
            </div>
          </section>
          <button
            onClick={() => {
              document.body.style.overflow = "auto";

              setTriggerUpdateDomain(() => false);
            }}
            className="h-max  w-max rounded-md p-2 text-2xl transition hover:bg-gray-200 hover:text-black active:scale-105"
          >
            <MdClose />
          </button>
        </header>
        <main className="w-full grow overflow-auto px-10">
          {getDomain.isFetching ? (
            <Skeleton width={400} height={60} />
          ) : (
            <section className="w-full ">
              <ul className="grid w-full grid-cols-2 gap-5 ">
                <div className="col-span-2 flex items-center justify-start gap-2 text-xl text-black">
                  <MdSettings /> Domain Settings
                </div>
                <TextField
                  onChange={(e) =>
                    setDomainData((prev) => {
                      return {
                        ...prev,
                        googleAnalyticsId: e.target.value,
                      };
                    })
                  }
                  value={domainData?.googleAnalyticsId || ""}
                  className="w-full"
                  name="googleAnalyticsId"
                  label="google analytics id"
                />
                <TextField
                  disabled
                  value={domain.sitemap_status || ""}
                  className="w-full"
                  label="Google Site Status"
                />
                <TextField
                  disabled
                  value={domain.google_domain_id || ""}
                  className="w-full"
                  label="Google ID Verify"
                />
                <TextField
                  disabled
                  value={domain.netlify_dns_zoneId || ""}
                  className="w-full"
                  label="Netlify DNSZone ID"
                />
                <TextField
                  disabled
                  value={domain.netlify_siteId || ""}
                  className="w-full"
                  label="Netlify Site ID"
                />
                <TextField
                  disabled
                  value={domain.dns_servers.join(" - ") || ""}
                  className="w-full"
                  label="Netlify DNS Server"
                />
              </ul>
              <div className="mt-5">
                <label>Note</label>
                <textarea
                  onChange={(e) =>
                    setDomainData((prev) => {
                      return {
                        ...prev,
                        note: e.target.value,
                      };
                    })
                  }
                  value={domainData?.note || ""}
                  className=" h-40 w-full resize-none rounded-md border border-gray-300 p-2 focus:outline-slate-300"
                  name="note"
                />
              </div>
            </section>
          )}
          {getDomain.isFetching ? (
            <Skeleton width={400} height={60} />
          ) : (
            domainData?.landingPages?.length > 0 && (
              <section className="mt-5 flex w-full flex-col gap-5 ">
                <div className="col-span-2 flex items-center justify-start gap-2 text-xl text-black">
                  <MdList /> Landing Pages{" "}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-icon-color/40 p-2 text-base font-bold text-slate-800">
                    {domainData?.landingPages?.length}
                  </div>
                </div>
                <ul className="flex h-max flex-col gap-4 overflow-auto bg-icon-color/20 p-2 ">
                  {domainData?.landingPages?.map((landingPage) => {
                    return (
                      <li
                        className="grid grid-cols-1 items-center justify-between  gap-5 overflow-hidden rounded-md bg-white px-5  py-3
                         md:flex"
                        key={landingPage.id}
                      >
                        <Link
                          target="_blank"
                          href={`/landingpage/${landingPage.id}`}
                          className="flex w-80 items-center justify-center gap-2  truncate font-bold text-blue-600 underline md:w-96"
                        >
                          <MdOutlineArtTrack />
                          {landingPage.name}
                        </Link>
                        <TextField
                          type="number"
                          value={landingPage?.percent}
                          className="w-40"
                          onChange={(e) =>
                            setDomainData((prev) => {
                              const landingPages = [...prev?.landingPages]; // Create a new array to avoid mutating the original state

                              const index = landingPages.findIndex(
                                (list) => list.id === landingPage.id,
                              );

                              if (index !== -1) {
                                const convertNumber = Number(e.target.value);
                                // If landingPage is found in the array
                                landingPages[index] = {
                                  ...landingPages[index],
                                  percent: convertNumber,
                                };
                              }

                              return {
                                ...prev,
                                landingPages,
                              };
                            })
                          }
                          placeholder="10"
                          label="Probability"
                          id="fullWidth"
                        />
                        <button
                          onClick={() =>
                            handleRemoveDomainName({
                              landingPageId: landingPage.id,
                            })
                          }
                          className="flex h-10 items-center 
                      justify-center gap-2 rounded-md bg-red-300  px-5 py-1 text-sm
                       text-red-500 drop-shadow-md transition duration-150 hover:bg-red-500 hover:text-white active:scale-105"
                        >
                          Remove LandingPage
                          <MdRemoveCircle />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )
          )}
          {getDomain.data?.sitemap && (
            <div className="mt-10 w-full  ">
              <div className="col-span-2 flex items-center justify-start gap-2 text-xl text-black">
                <FaGoogle /> Google Search Console{" "}
              </div>
              <div className="mt-5 h-60 w-full rounded-md p-5 ">
                <div className="col-span-2 flex items-center justify-start gap-2 text-base text-black">
                  <BiSitemap /> Sitemap Infomation{" "}
                </div>
                <div className="mt-5 w-full overflow-auto">
                  <table className="min-max w-full">
                    <thead>
                      <tr className="h-10 border-b">
                        <th>Sitemap</th>
                        <th>Type</th>
                        <th>Summitted</th>
                        <th>Last Read</th>
                        <th>Status</th>
                        <th>Discovered Pages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDomain.data.sitemap.contents?.map(
                        (sitemap, index) => {
                          const errorNumber = Number(
                            getDomain.data.sitemap.errors,
                          );
                          const warningNumber = Number(
                            getDomain.data.sitemap.warnings,
                          );
                          return (
                            <tr className="h-14" key={index}>
                              <td className="text-center">
                                <a
                                  target="_blank"
                                  className=" text-blue-700 underline"
                                  href={getDomain.data.sitemap.path ?? "#"}
                                >
                                  {getDomain.data.sitemap.path}
                                </a>
                              </td>
                              <td className="text-center">{sitemap.type}</td>
                              <td className="text-center">
                                {new Date(
                                  getDomain.data.sitemap.lastSubmitted ??
                                    new Date(),
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="text-center">
                                {" "}
                                {new Date(
                                  getDomain.data.sitemap.lastDownloaded ??
                                    new Date(),
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="text-center">
                                {warningNumber === 0 && errorNumber === 0
                                  ? "SUCCESS"
                                  : "ERROR"}
                              </td>
                              <td className="text-center">
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
            </div>
          )}
        </main>
        <footer className="flex h-32 w-full items-center justify-end gap-2 border-t border-gray-200 px-10">
          <button
            onClick={() => {
              document.body.style.overflow = "auto";

              setTriggerUpdateDomain(false);
            }}
            className="flex w-40 items-center justify-center gap-2 rounded-md  border border-gray-200 bg-white px-5 py-1
     text-lg font-normal text-black transition duration-150 hover:bg-gray-200 active:scale-110"
          >
            Close
          </button>
          <button
            disabled={isLoading}
            onClick={handleUpdateDomain}
            className="flex w-40 items-center justify-center  gap-2 rounded-md bg-slate-600 px-5 py-1
     text-lg font-normal text-white transition duration-150 hover:bg-slate-800 active:scale-110"
          >
            {isLoading ? (
              <SpinLoading />
            ) : (
              <>
                <MdSave /> Update
              </>
            )}
          </button>
        </footer>
      </div>
      <footer
        onClick={() => {
          setTriggerUpdateDomain(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/50 backdrop-blur-sm "
      ></footer>
    </div>
  );
}

export default DomainUpdate;
