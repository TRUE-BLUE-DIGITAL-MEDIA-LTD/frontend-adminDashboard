import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteLandingPageService,
  DuplicateLandingPageService,
  GetAllLandingPageService,
  RemoveDomainNameFromLandingPageService,
} from "../../services/admin/landingPage";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import { User } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";
import Link from "next/link";
import { loadingNumber } from "../../data/loadingNumber";
import { Pagination, Skeleton } from "@mui/material";
import SpinLoading from "../../components/loadings/spinLoading";
import { BiCopyAlt, BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { languages } from "../../data/languages";

interface handleRemoveDomainNameParams {
  landingPageId: string;
}
interface handleDuplicateLandingPageParam {
  landingPageId: string;
}
interface handleDeleteLandingPageParams {
  landingPageId: string;
}
export default function Home({ user }: { user: User }) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const landingPages = useQuery({
    queryKey: ["landingPages", page],
    queryFn: () =>
      GetAllLandingPageService({ page: page, query: router.query }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (router.isReady) {
      landingPages.refetch();
    }
  }, [router.isReady]);
  // handle delete landingpage
  const handleDeleteLandingPage = async ({
    landingPageId,
  }: handleDeleteLandingPageParams) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(() => true);
          const deleteLandingPage = await DeleteLandingPageService({
            landingPageId: landingPageId,
          });
          Swal.fire("Deleted!", deleteLandingPage.message, "success");
          landingPages.refetch();
          setIsLoading(() => false);
        } catch (err: any) {
          setIsLoading(() => false);
          console.log(err);
          Swal.fire("error!", err.message?.toString(), "error");
        }
      }
    });
  };

  //handle remove domain name from landing page
  const handleRemoveDomainName = ({
    landingPageId,
  }: handleRemoveDomainNameParams) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(() => true);
          await RemoveDomainNameFromLandingPageService({
            landingPageId: landingPageId,
          });
          Swal.fire(
            "Deleted!",
            "Domain has been unlinked to this landing page",
            "success",
          );
          landingPages.refetch();
          setIsLoading(() => false);
        } catch (err: any) {
          setIsLoading(() => false);
          console.log(err);
          Swal.fire("error!", err.message?.toString(), "error");
        }
      }
    });
  };

  const handleDuplicateLandingPage = async ({
    landingPageId,
  }: handleDuplicateLandingPageParam) => {
    try {
      setIsLoading(() => true);
      await DuplicateLandingPageService({
        landingPageId: landingPageId,
      });
      Swal.fire(
        "Duplicated!!",
        "Landing Page Successfully Duplicated",
        "success",
      );
      setIsLoading(() => false);
      landingPages.refetch();
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
    }
  };
  return (
    <DashboardLayout user={user}>
      <div className="h-full w-full  bg-gradient-to-b pt-10 font-Poppins">
        <header className="mt-20 flex w-full flex-col items-center  justify-center gap-7 text-center">
          <h1 className="font-Poppins text-5xl font-semibold">
            <span className="text-icon-color">L</span>
            <span>anding Pages</span>
          </h1>
          <Link
            href={"/create-landingpage"}
            className="rounded-full bg-main-color px-20 py-2 text-xl font-semibold text-white transition duration-150 hover:bg-blue-700 active:scale-105"
          >
            Create
          </Link>
        </header>
        <main className=" flex w-full flex-col items-center justify-center gap-5 pb-20  ">
          <div className=" w-[45rem] justify-center  overflow-auto p-5 2xl:w-[60rem] ">
            <table className="min-w-full max-w-max border-collapse ">
              <thead className="h-14 border-b-2 border-black font-bold text-blue-700   drop-shadow-md ">
                <tr className="sticky top-0 z-40 bg-white ">
                  <td className="">Name</td>
                  <td>Domain</td>
                  <td>Language</td>
                  <td>Category</td>

                  <td>Options</td>
                </tr>
              </thead>
              <tbody className="">
                {landingPages.isLoading
                  ? loadingNumber.map((list, index) => {
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
                  : landingPages?.data?.landingPages?.map(
                      (landingPage, index) => {
                        const createAt = new Date(landingPage?.createAt);
                        const formattedDatecreateAt =
                          createAt.toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });

                        const language = languages.find(
                          (language) => language.value === landingPage.language,
                        );
                        return (
                          <tr className="h-14 " key={index}>
                            <td className="px-2">
                              {landingPages.isFetching ? (
                                <Skeleton animation="wave" />
                              ) : (
                                landingPage?.name
                              )}
                            </td>
                            {landingPage?.domain?.name ? (
                              <td
                                onClick={() => {
                                  handleRemoveDomainName({
                                    landingPageId: landingPage.id,
                                  });
                                }}
                                className="cursor-pointer hover:line-through"
                              >
                                {landingPages.isFetching ? (
                                  <Skeleton />
                                ) : (
                                  landingPage?.domain?.name
                                )}
                              </td>
                            ) : (
                              <td className="cursor-pointer hover:line-through">
                                -
                              </td>
                            )}
                            <td className="px-2">{language?.name}</td>
                            <td className="px-2">
                              {landingPage?.category?.title}
                            </td>

                            {isLoading ? (
                              <td className="flex  items-center justify-center gap-2">
                                <SpinLoading />
                              </td>
                            ) : (
                              <td className="">
                                <div className="flex  items-center justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleDuplicateLandingPage({
                                        landingPageId: landingPage.id,
                                      })
                                    }
                                    className="text-3xl text-green-700 transition duration-100 hover:scale-105 active:text-green-900"
                                  >
                                    <BiCopyAlt />
                                  </button>
                                  <Link
                                    href={`/landingpage/${landingPage.id}`}
                                    className="text-3xl text-blue-700 transition duration-100 hover:scale-105 active:text-blue-900"
                                  >
                                    <BiSolidMessageSquareEdit />
                                  </Link>

                                  <button
                                    onClick={() =>
                                      handleDeleteLandingPage({
                                        landingPageId: landingPage.id,
                                      })
                                    }
                                    className="text-3xl text-red-700 transition duration-100 hover:scale-105 active:text-red-900"
                                  >
                                    <MdDelete />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      },
                    )}
              </tbody>
            </table>
          </div>
          <Pagination
            onChange={(e, page) => setPage(page)}
            count={landingPages?.data?.totalPages}
            color="primary"
          />
        </main>
      </div>
    </DashboardLayout>
  );
}

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
