import Image from "next/image";
import { Inter } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteLandingPageService,
  DuplicateLandingPageService,
  GetAllLandingPageService,
  RemoveDomainNameFromLandingPageService,
} from "../services/admin/landingPage";
import Swal from "sweetalert2";
import DashboardLayout from "../layouts/dashboardLayout";
import { User } from "../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../services/admin/user";
import Link from "next/link";
import { loadingNumber } from "../data/loadingNumber";
import { Pagination, Skeleton } from "@mui/material";
import SpinLoading from "../components/loadings/spinLoading";
import { BiCopyAlt, BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { languages } from "../data/languages";

const inter = Inter({ subsets: ["latin"] });
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
    queryFn: () => GetAllLandingPageService({ page: page }),
    placeholderData: keepPreviousData,
  });

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
          Swal.fire(
            "error!",
            err?.props?.response?.data?.message?.toString(),
            "error"
          );
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
            "success"
          );
          landingPages.refetch();
          setIsLoading(() => false);
        } catch (err: any) {
          setIsLoading(() => false);
          console.log(err);
          Swal.fire(
            "error!",
            err?.props?.response?.data?.message?.toString(),
            "error"
          );
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
        "success"
      );
      setIsLoading(() => false);
      landingPages.refetch();
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire(
        "error!",
        err?.props?.response?.data?.message?.toString(),
        "error"
      );
    }
  };
  return (
    <DashboardLayout user={user}>
      <div className="bg-gradient-to-b font-Poppins pt-20  h-full">
        <header className="w-full flex flex-col items-center text-center  gap-7 justify-center mt-20">
          <h1
            className="font-bold text-transparent text-6xl py-10 text-center font-Poppins
           bg-clip-text  animate-gradient"
          >
            Landing Page
          </h1>
          <Link
            href={"/create-landingpage"}
            className="text-white text-xl hover:bg-blue-700 transition duration-150 active:scale-105 font-semibold bg-main-color px-20 py-2 rounded-full"
          >
            Create
          </Link>
        </header>
        <main className="w-full mt-10 flex justify-center items-center gap-5 pb-20 flex-col  ">
          <div className="lg:w-10/12 xl:w-9/12 ">
            <table className="table-auto w-full border-collapse">
              <thead className="border-b-2 h-14 font-bold drop-shadow-md text-blue-700   border-black ">
                <tr className="sticky top-0 z-40 bg-white ">
                  <td className=" px-5">Name</td>
                  <td>Domain</td>
                  <td>Language</td>
                  <td>Created At</td>
                  <td>Updated At</td>
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
                  : landingPages?.data?.landingPages?.map((list, index) => {
                      const createAt = new Date(list?.createAt);
                      const formattedDatecreateAt = createAt.toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      );
                      const updateAt = new Date(list?.updateAt);
                      const formattedDateupdateAt = updateAt.toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      );
                      const language = languages.find(
                        (language) => language.value === list.language
                      );
                      return (
                        <tr className="h-14 " key={index}>
                          <td>
                            {landingPages.isFetching ? (
                              <Skeleton animation="wave" />
                            ) : (
                              list?.name
                            )}
                          </td>
                          {list?.domain?.name ? (
                            <td
                              onClick={() => {
                                handleRemoveDomainName({
                                  landingPageId: list.id,
                                });
                              }}
                              className="hover:line-through cursor-pointer"
                            >
                              {landingPages.isFetching ? (
                                <Skeleton />
                              ) : (
                                list?.domain?.name
                              )}
                            </td>
                          ) : (
                            <td className="hover:line-through cursor-pointer">
                              -
                            </td>
                          )}
                          <td>{language?.name}</td>
                          <td>{formattedDatecreateAt}</td>
                          <td>{formattedDateupdateAt}</td>
                          {isLoading ? (
                            <td className="flex h-14 justify-center w-20 items-center gap-2">
                              <SpinLoading />
                            </td>
                          ) : (
                            <td className="flex h-14 justify-center w-20 items-center gap-2">
                              <button
                                onClick={() =>
                                  handleDuplicateLandingPage({
                                    landingPageId: list.id,
                                  })
                                }
                                className="text-3xl text-green-700 hover:scale-105 active:text-green-900 transition duration-100"
                              >
                                <BiCopyAlt />
                              </button>
                              <Link
                                href={`/landingpage/${list.id}`}
                                className="text-3xl text-blue-700 hover:scale-105 active:text-blue-900 transition duration-100"
                              >
                                <BiSolidMessageSquareEdit />
                              </Link>

                              <button
                                onClick={() =>
                                  handleDeleteLandingPage({
                                    landingPageId: list.id,
                                  })
                                }
                                className="text-3xl text-red-700 hover:scale-105 active:text-red-900 transition duration-100"
                              >
                                <MdDelete />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
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
  context: GetServerSidePropsContext
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
