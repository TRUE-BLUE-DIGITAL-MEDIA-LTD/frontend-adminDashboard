import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useState } from "react";
import { GetUser } from "../../services/admin/user";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteDomainNameService,
  GetAllDomainsByPage,
} from "../../services/admin/domain";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Domain, User } from "../../models";
import { loadingNumber } from "../../data/loadingNumber";
import { Pagination, Skeleton } from "@mui/material";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import SpinLoading from "../../components/loadings/spinLoading";
import { MdDelete } from "react-icons/md";
import DomainCreate from "../../components/forms/domains/domainCreate";
import DomainUpdate from "../../components/forms/domains/domainUpdate";

interface HandleDeleteDomain {
  domainNameId: string;
  name: string;
}
function Index({ user }: { user: User }) {
  const [page, setPage] = useState<number>(1);
  const [triggerCreateDomain, setTriggerCreateDomain] =
    useState<boolean>(false);
  const [triggerUpdateDomain, setTriggerUpdateDomain] =
    useState<boolean>(false);
  const [currentUpdateDomain, setCurrentUpdateDomain] =
    useState<Domain | null>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const domains = useQuery({
    queryKey: ["domains", page],
    queryFn: () => GetAllDomainsByPage({ page: page }),
    placeholderData: keepPreviousData,
  });

  // handle delete domain

  const handleDeleteDomain = async ({
    domainNameId,
    name,
  }: HandleDeleteDomain) => {
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
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
        domains.refetch();
      } catch (err: any) {
        console.log(err);
        Swal.fire(
          "error!",
          err?.props?.response?.data?.message?.toString(),
          "error"
        );
      }
    }
  };

  return (
    <DashboardLayout user={user}>
      {triggerCreateDomain && (
        <DomainCreate
          domains={domains}
          setTriggerCreateDomain={setTriggerCreateDomain}
        />
      )}

      {triggerUpdateDomain && (
        <DomainUpdate
          domain={currentUpdateDomain as Domain}
          setTriggerUpdateDomain={setTriggerUpdateDomain}
          domains={domains}
        />
      )}
      <header className="mt-28 flex flex-col justify-center items-center">
        <h1
          className="font-bold text-transparent text-6xl py-10 text-center font-Poppins
       bg-clip-text  animate-gradient"
        >
          Domains
        </h1>
        {user.role === "admin" && (
          <button
            onClick={() => {
              document.body.style.overflow = "hidden";
              setTriggerCreateDomain(() => true);
            }}
            className="text-white text-xl hover:bg-blue-700 transition 
    duration-150 active:scale-105 font-semibold bg-main-color px-20 py-2 
    rounded-full"
          >
            Create
          </button>
        )}
      </header>
      <main className="w-full mt-10 flex justify-center items-center gap-5 pb-20 flex-col  ">
        <div className="lg:w-10/12 xl:w-8/12 flex flex-col items-center ">
          <div className="w-full">
            <table className="table-auto w-full border-collapse">
              <thead className="border-b-2 h-14 font-bold drop-shadow-md text-blue-700   border-black ">
                <tr className="sticky top-0 z-40 bg-white ">
                  <td className=" px-5">Domain Name</td>

                  <td>Created At</td>
                  <td>Updated At</td>
                  <td>Options</td>
                </tr>
              </thead>
              <tbody className="">
                {domains.isLoading
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
                  : domains?.data?.domains?.map((list, index) => {
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
                      return (
                        <tr className="h-14 hover:bg-blue-50 " key={index}>
                          <td>{list?.name}</td>
                          <td>{formattedDatecreateAt}</td>
                          <td>{formattedDateupdateAt}</td>
                          <td className="flex h-14 justify-center w-20 items-center gap-2">
                            <button
                              onClick={() => {
                                setTriggerUpdateDomain(() => true);
                                setCurrentUpdateDomain(() => list as Domain);
                                document.body.style.overflow = "hidden";
                              }}
                              className="text-3xl text-blue-700 hover:scale-105 active:text-blue-900 transition duration-100"
                            >
                              <BiSolidMessageSquareEdit />
                            </button>
                            {isLoading ? (
                              <SpinLoading />
                            ) : (
                              user.role === "admin" && (
                                <button
                                  onClick={() =>
                                    handleDeleteDomain({
                                      domainNameId: list.id,
                                      name: list.name,
                                    })
                                  }
                                  className="text-3xl text-red-700 hover:scale-105 active:text-red-900 transition duration-100"
                                >
                                  <MdDelete />
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <Pagination
            onChange={(e, page) => setPage(page)}
            count={domains?.data?.totalPages}
            color="primary"
          />
        </div>
      </main>
    </DashboardLayout>
  );
}

export default Index;

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
