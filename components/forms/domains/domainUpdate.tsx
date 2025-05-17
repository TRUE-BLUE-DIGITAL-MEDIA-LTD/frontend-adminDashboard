import { UseQueryResult, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  GetDomainService,
  InputUpdateDomainService,
  ResponseGetAllDomainsByPage,
  UpdateDomainService,
} from "../../../services/admin/domain";
import { Domain, LandingPage } from "../../../models";
import Swal from "sweetalert2";
import { Skeleton, TextField } from "@mui/material";
import Link from "next/link";
import SpinLoading from "../../loadings/spinLoading";
import { MdRemoveCircle } from "react-icons/md";
import { RemoveDomainNameFromLandingPageService } from "../../../services/admin/landingPage";

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
    name: "",
    note: "",
    domainNameId: "",
    googleAnalyticsId: "",
    oxyeyeAnalyticsId: "",
  });
  const [isVaildDomain, setIsVildDomain] = useState(true);
  const domainPattern = /^(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [isLoading, setIsLoading] = useState(false);
  const domainUpdate = useQuery({
    queryKey: ["domain", domain.id],
    queryFn: () => GetDomainService({ domainId: domain.id }),
  });

  useEffect(() => {
    setDomainData(() => {
      return {
        name: domainUpdate.data?.domain.name as string,
        domainNameId: domainUpdate.data?.domain.id as string,
        googleAnalyticsId: domainUpdate.data?.domain
          .googleAnalyticsId as string,
        oxyeyeAnalyticsId: domainUpdate.data?.domain.oxyeyeAnalyticsId,
        note: domainUpdate.data?.domain.note as string,
        landingPages: domainUpdate.data?.landingPages as {
          name: string;
          id: string;
          percent: number;
        }[],
      };
    });
  }, [domainUpdate.data]);

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
      await domainUpdate.refetch();
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
          await domainUpdate.refetch();
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
  return (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen
     items-center justify-center font-Poppins"
    >
      <main
        className="max-h-5/6 md:max-w-8/12 flex h-max w-11/12  flex-col items-center 
       justify-start gap-5 rounded-lg bg-white p-10 md:w-max"
      >
        {domainUpdate.isFetching ? (
          <Skeleton width={400} height={60} />
        ) : (
          <section className="grid grid-cols-2 gap-5">
            <TextField
              onChange={(e) =>
                setDomainData((prev) => {
                  return {
                    ...prev,
                    oxyeyeAnalyticsId: e.target.value,
                  };
                })
              }
              value={domainData?.oxyeyeAnalyticsId || ""}
              className="col-span-2 w-full"
              name="Oxy AnalyticsId"
              label="Oxy Analytics Id"
            />
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
              className="w-60"
              name="googleAnalyticsId"
              label="google analytics id"
            />
            <TextField
              onChange={(e) =>
                setDomainData((prev) => {
                  return {
                    ...prev,
                    note: e.target.value,
                  };
                })
              }
              value={domainData?.note || ""}
              className="w-60"
              name="note"
              label="note"
            />
          </section>
        )}
        {domainUpdate.isFetching ? (
          <Skeleton width={400} height={60} />
        ) : (
          domainData?.landingPages?.length > 0 && (
            <section className="flex w-full flex-col gap-5">
              <h3 className="text-xl font-bold text-gray-800">
                Probability - setting
              </h3>
              <ul className="flex h-60 flex-col gap-4 overflow-auto p-2 ">
                {domainData?.landingPages?.map((landingPage) => {
                  return (
                    <li
                      className="grid grid-cols-1 items-center justify-between gap-5 px-5 py-3  hover:bg-gray-100 md:flex"
                      key={landingPage.id}
                    >
                      <Link
                        target="_blank"
                        href={`/landingpage/${landingPage.id}`}
                        className="w-80  truncate font-bold text-blue-600 underline md:w-96"
                      >
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
                        className="flex items-center justify-center 
                      gap-2 rounded-lg bg-red-300  px-5 py-1 text-sm
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

        {isLoading ? (
          <SpinLoading />
        ) : isVaildDomain ? (
          <button
            onClick={handleUpdateDomain}
            className="rounded-full bg-blue-500 px-5 py-1 text-lg font-normal text-white transition
     duration-150 hover:bg-blue-700 active:scale-110"
          >
            Update
          </button>
        ) : (
          <button className="rounded-full bg-slate-500 px-5 py-1 text-lg font-normal text-white">
            Update
          </button>
        )}
      </main>
      <footer
        onClick={() => {
          setTriggerUpdateDomain(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/30 "
      ></footer>
    </div>
  );
}

export default DomainUpdate;
