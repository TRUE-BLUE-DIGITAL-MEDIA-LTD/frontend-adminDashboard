import React, { FormEvent, useEffect, useState } from "react";
import { User } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Box, Button, Pagination, Skeleton, TextField } from "@mui/material";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import { loadingNumber } from "../../data/loadingNumber";
import { MdDelete } from "react-icons/md";
import {
  DeleteCustomerService,
  GetCustomerByPageService,
} from "../../services/customer";
import Link from "next/link";

function Index({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isAsc, setIsAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const customers = useQuery({
    queryKey: ["customer", page],
    queryFn: () => GetCustomerByPageService({ page: page, limit: 20 }),
    placeholderData: keepPreviousData,
  });

  const [jumpToPageInput, setJumpToPageInput] = useState("");
  const totalPage = customers.data?.meta.lastPage ?? 1;
  // ✅ 2. Create the handler function for form submission
  const handleJumpToPage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    const targetPage = parseInt(jumpToPageInput, 10);

    // Validate the input
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPage) {
      setPage(targetPage); // Set the new page
      setJumpToPageInput(""); // Clear the input field
    }
  };

  const handleDeleteCustomerEmail = async ({
    customerId,
  }: {
    customerId: string;
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
          await DeleteCustomerService({
            customerId: customerId,
          });
          Swal.fire("Deleted!", "Email Has Been Deleted", "success");
          await customers.refetch();
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
      <div className="w-full">
        <header className="mt-28 flex flex-col items-center justify-center">
          <h1 className="font-Poppins text-4xl font-semibold md:text-7xl">
            <span className="text-icon-color">C</span>
            <span>ustomer</span>
          </h1>
        </header>
        <main className="mt-10 flex w-full flex-col items-center justify-center gap-5 pb-20  ">
          <div
            className=" h-96 w-80 justify-center overflow-auto  
            md:w-11/12 "
          >
            <table className="w-max min-w-full table-auto  ">
              <thead className="h-14 border-b-2 border-black font-bold text-blue-700 ">
                <tr className="sticky top-0 z-20 bg-white  ">
                  <th className="group flex h-14 items-center  gap-2">
                    <span>Email</span>
                    <div className={`flex items-center `}></div>
                  </th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Birthday</th>
                  <th>Company</th>
                  <th>Website</th>
                  <th>Zip Code</th>
                  <th>Landing Page</th>
                  <th className="group flex gap-2">
                    <span>Create At</span>
                    <div className={`flex items-center `}></div>
                  </th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody className="">
                {customers.isLoading
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
                            <Skeleton animation="wave" />
                          </td>
                          <td>
                            <Skeleton animation="wave" />
                          </td>
                          <td>
                            <Skeleton animation="wave" />
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
                          <td>
                            <Skeleton />
                          </td>
                        </tr>
                      );
                    })
                  : customers?.data?.data?.map((list, index) => {
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
                        <tr
                          className="h-14 border-4 border-transparent hover:bg-blue-50 "
                          key={index}
                        >
                          {customers.isFetching ? (
                            <td>
                              <Skeleton animation="wave" />
                            </td>
                          ) : (
                            <td>{list?.email}</td>
                          )}
                          {customers.isFetching ? (
                            <td>
                              <Skeleton />
                            </td>
                          ) : (
                            <td>
                              <div className="min-w-28 text-center">
                                {list?.name}
                              </div>
                            </td>
                          )}

                          <td>
                            <div className="min-w-28 text-center">
                              {list?.phone_number ? list?.phone_number : "-"}
                            </div>
                          </td>
                          <td>
                            <div className="min-w-28 text-center">
                              {list?.birthday ? list?.birthday : "-"}
                            </div>
                          </td>
                          <td>
                            <div className="min-w-28 text-center">
                              {list?.company ? list?.company : "-"}
                            </div>
                          </td>
                          <td>
                            <div className="min-w-28 text-center">
                              {list?.website ? list?.website : "-"}
                            </div>
                          </td>
                          <td>
                            <div className="min-w-28 text-center">
                              {list?.zip_code ? list?.zip_code : "-"}
                            </div>
                          </td>

                          {customers.isFetching ? (
                            <td>
                              <Skeleton />
                            </td>
                          ) : (
                            <td>
                              <Link
                                href={`/landingpage/${list?.landingPageId}`}
                              >
                                <span className="text-blue-700 underline">
                                  {list?.landingPage?.name}
                                </span>
                              </Link>
                            </td>
                          )}

                          <td>
                            <div className="min-w-28 px-2 text-center">
                              {formattedDatecreateAt}
                            </div>
                          </td>

                          <td className="flex h-14 w-20 items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleDeleteCustomerEmail({
                                  customerId: list.id,
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
          <div className="mt-5 flex w-full justify-center">
            <Box className="mt-5 flex w-full flex-col items-center justify-center gap-4 md:flex-row">
              <Pagination
                onChange={(e, newPage) => setPage(newPage)}
                page={page}
                count={totalPage}
                color="primary"
                showFirstButton
                showLastButton
              />
              <Box
                component="form"
                onSubmit={handleJumpToPage}
                className="flex items-center gap-2"
              >
                <TextField
                  label="Page"
                  type="number"
                  size="small"
                  variant="outlined"
                  value={jumpToPageInput}
                  onChange={(e) => setJumpToPageInput(e.target.value)}
                  sx={{ width: "100px" }}
                />
                <Button type="submit" variant="contained">
                  Go
                </Button>
              </Box>
            </Box>
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
    if (user.TOTPenable === false) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/setup-totp",
        },
      };
    }
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "https://home.oxyclick.com",
      },
    };
  }
};
