import React, { useEffect, useState } from "react";
import { User } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteCustomerEmailService,
  GetEmailsByPageService,
} from "../../services/admin/email";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Pagination, Skeleton } from "@mui/material";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import { loadingNumber } from "../../data/loadingNumber";
import { MdDelete } from "react-icons/md";

function Index({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<"createAt" | "email">("createAt");
  const [isAsc, setIsAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const emails = useQuery({
    queryKey: ["emails", page],
    queryFn: () => GetEmailsByPageService({ page: page, orderBy, isAsc }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    emails.refetch();
  }, [orderBy, isAsc]);
  const handleDeleteCustomerEmail = async ({
    emailId,
  }: {
    emailId: string;
  }) => {
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
          Swal.fire({
            title: "Trying To Delete...",
            html: "Please Wait For A Moment",
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          setIsLoading(() => true);
          await DeleteCustomerEmailService({
            emailId,
          });
          Swal.fire("Deleted!", "Email Has Been Deleted", "success");
          await emails.refetch();
          setIsLoading(() => false);
        } catch (err: any) {
          setIsLoading(() => false);
          console.log(err);
          Swal.fire("error!", err.message?.toString(), "error");
        }
      }
    });
  };
  return (
    <DashboardLayout user={user}>
      <header className="mt-28 flex flex-col items-center justify-center">
        <h1
          className="animate-gradient bg-clip-text py-10 text-center font-Poppins text-6xl
       font-bold  text-transparent"
        >
          Customer&apos;s Email
        </h1>
      </header>
      <main className="mt-10 flex w-full flex-col items-center justify-center gap-5 pb-20  ">
        <div className="flex flex-col items-center lg:w-10/12 xl:w-8/12 ">
          <div className="w-full">
            <table className="w-full table-auto border-collapse">
              <thead className="h-14 border-b-2 border-black font-bold text-blue-700   drop-shadow-md ">
                <tr className="sticky top-0 z-40 bg-white  ">
                  <td className="group flex h-14 items-center  gap-2">
                    <span>Email</span>
                    <div
                      className={`flex items-center ${
                        orderBy !== "email"
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-100"
                      }`}
                    >
                      {isAsc ? (
                        <button
                          onClick={() => {
                            setOrderBy(() => "email");
                            setIsAsc(() => false);
                          }}
                          className="flex items-center justify-center transition duration-100 hover:scale-105 "
                        >
                          <BsFillCaretDownFill />
                        </button>
                      ) : (
                        !isAsc && (
                          <button
                            onClick={() => {
                              setOrderBy(() => "email");
                              setIsAsc(() => true);
                            }}
                            className="flex items-center justify-center transition duration-100 hover:scale-105 "
                          >
                            <BsFillCaretUpFill />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                  <td>Name</td>
                  <td>Landing Page</td>
                  <td className="group flex gap-2">
                    <span>Create At</span>
                    <div
                      className={`flex items-center ${
                        orderBy !== "createAt"
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-100"
                      }`}
                    >
                      {isAsc ? (
                        <button
                          onClick={() => {
                            setOrderBy(() => "createAt");
                            setIsAsc(() => false);
                          }}
                          className="flex items-center justify-center transition duration-100 hover:scale-105 "
                        >
                          <BsFillCaretDownFill />
                        </button>
                      ) : (
                        !isAsc && (
                          <button
                            onClick={() => {
                              setOrderBy(() => "createAt");
                              setIsAsc(() => true);
                            }}
                            className="flex items-center justify-center transition duration-100 hover:scale-105 "
                          >
                            <BsFillCaretUpFill />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                  <td>Options</td>
                </tr>
              </thead>
              <tbody className="">
                {emails.isLoading
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
                  : emails?.data?.emails?.map((list, index) => {
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
                        },
                      );
                      return (
                        <tr className="h-14 hover:bg-blue-50 " key={index}>
                          {emails.isFetching ? (
                            <td>
                              <Skeleton animation="wave" />
                            </td>
                          ) : (
                            <td>{list?.email}</td>
                          )}
                          {emails.isFetching ? (
                            <td>
                              <Skeleton />
                            </td>
                          ) : (
                            <td>{list?.name}</td>
                          )}
                          {emails.isFetching ? (
                            <td>
                              <Skeleton />
                            </td>
                          ) : (
                            <td>{list?.landingPages.name}</td>
                          )}

                          <td>{formattedDatecreateAt}</td>

                          <td className="flex h-14 w-20 items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleDeleteCustomerEmail({
                                  emailId: list.id,
                                })
                              }
                              className="text-3xl text-red-700 transition duration-100 hover:scale-105 active:text-red-900"
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <Pagination
            onChange={(e, page) => setPage(page)}
            count={emails?.data?.totalPages}
            color="primary"
          />
        </div>
      </main>
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
