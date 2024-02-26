import { UseQueryResult, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  GetDomainService,
  InputUpdateDomainService,
  ResponseGetAllDomainsByPage,
  ResponseGetDomainService,
  UpdateDomainService,
} from "../../../services/admin/domain";
import { Domain, LandingPage } from "../../../models";
import Swal from "sweetalert2";
import { Skeleton, TextField } from "@mui/material";
import Link from "next/link";
import SpinLoading from "../../loadings/spinLoading";

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
    domainNameId: "",
    googleAnalyticsId: "",
  });
  const [isVaildDomain, setIsVildDomain] = useState(true);
  const domainPattern = /^(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [isLoading, setIsLoading] = useState(false);
  const domainUpdate = useQuery({
    queryKey: ["domain-update"],
    queryFn: () => GetDomainService({ domainId: domain.id }),
  });

  useEffect(() => {
    setDomainData(() => {
      return {
        name: domainUpdate.data?.domain.name as string,
        domainNameId: domainUpdate.data?.domain.id as string,
        googleAnalyticsId: domainUpdate.data?.domain
          .googleAnalyticsId as string,
        landingPages: domainUpdate.data?.landingPages as {
          name: string;
          id: string;
          percent: number;
        }[],
      };
    });
  }, [domainUpdate.data]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event?.target?.value;
    setDomainData((prev) => {
      return {
        ...prev,
        name: inputValue,
      };
    });

    if (domainPattern.test(inputValue)) {
      setIsVildDomain(() => true);
      // Input is a valid domain with "www"
    } else {
      setIsVildDomain(() => false);
      // Input is not a valid domain with "www"
    }
  };

  const handleCreateDomain = async () => {
    try {
      setIsLoading(() => true);
      await UpdateDomainService({
        name: domainData.name,
        domainNameId: domain.id,
        landingPages: domainData.landingPages,
        googleAnalyticsId: domainData?.googleAnalyticsId,
      });

      await domains.refetch();
      Swal.fire("success", "create domain successfully", "success");
      setIsLoading(() => false);
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
    }
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center font-Poppins">
      <main className="max-h-5/6 flex h-max w-max  max-w-2xl flex-col items-center  justify-start gap-5 rounded-lg bg-white p-10">
        {domainUpdate.isFetching ? (
          <Skeleton width={400} height={60} />
        ) : (
          <section className="grid grid-cols-2 gap-5">
            <TextField
              onChange={handleChange}
              name="domain"
              className="w-60"
              value={domainData?.name}
              color={isVaildDomain ? "success" : "warning"}
              helperText={isVaildDomain ? "" : "Invalid domain"}
              placeholder="www.example.com"
              label="domain name"
              id="fullWidth"
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
              id="fullWidth"
            />
          </section>
        )}
        {domainUpdate.isFetching ? (
          <Skeleton width={400} height={60} />
        ) : (
          domainData?.landingPages?.length > 0 && (
            <section className="flex w-full flex-col gap-5">
              <h3 className="text-xl font-bold text-main-color">
                Probability - setting
              </h3>
              <ul className="flex h-72 flex-col gap-4 overflow-auto p-5 ">
                {domainData?.landingPages?.map((landingPage) => {
                  return (
                    <li
                      className="flex items-center justify-between gap-5 border-b-2 border-slate-400  px-5 py-3"
                      key={landingPage.id}
                    >
                      <Link
                        target="_blank"
                        href={`/landingpage/${landingPage.id}`}
                        className="w-96 truncate font-bold text-blue-600 underline"
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
            onClick={handleCreateDomain}
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
