import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useState } from "react";
import { GetUser } from "../../services/admin/user";
import { User } from "../../models";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteAccountService,
  GetAllAccountByPageService,
} from "../../services/admin/account";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import CreateAccount from "../../components/forms/accounts/createAccount";
import EditAccount from "../../components/forms/accounts/editAccount";
import ResetPassword from "../../components/forms/accounts/reset-password";
import { FaUserPlus } from "react-icons/fa6";
import Image from "next/image";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { Pagination } from "@mui/material";

function Index({ user }: { user: User }) {
  const [page, setPage] = useState(1);
  const [triggerCreateAccount, setTriggerCreateAccount] = useState(false);
  const [triggerResetPassword, setTriggerResetPassword] = useState(false);
  const [triggerEditAccount, setTriggerEditAccount] = useState(false);
  const [selectAccount, setSelectAccount] = useState<User | null>();
  const accounts = useQuery({
    queryKey: ["accounts", page],
    queryFn: () => GetAllAccountByPageService({ page: page }),
    placeholderData: keepPreviousData,
  });

  // handle delete domain
  const handleDeletAccount = async ({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }) => {
    const replacedText = email.replace(/ /g, "_");
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Account",
      input: "text",
      footer:
        "Please keep it mind if you delete this account, it can not be reverted!",
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

        await DeleteAccountService({
          userId: userId,
        });
        await accounts.refetch();
        Swal.fire("Deleted!", "Successfully Deleted Account", "success");
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
      {triggerCreateAccount && (
        <CreateAccount
          setTriggerCreateAccount={setTriggerCreateAccount}
          accounts={accounts}
        />
      )}
      {triggerEditAccount && (
        <EditAccount
          setTriggerEditAccount={setTriggerEditAccount}
          selectAccount={selectAccount as User}
          accounts={accounts}
        />
      )}
      {triggerResetPassword && (
        <ResetPassword
          setTriggerResetPassword={setTriggerResetPassword}
          selectAccount={selectAccount as User}
        />
      )}
      <main className="w-full flex font-Poppins mt-40 mb-20 flex-col justify-start items-center">
        <section className="w-10/12 gap-5 h-max p-7 rounded-lg ring-2 ring-slate-300 flex flex-col justify-start items-center">
          <header className="flex justify-between items-center w-full">
            <h1 className="text-3xl font-bold">Account Management</h1>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  document.body.style.overflow = "hidden";
                  setTriggerCreateAccount(() => true);
                }}
                className="flex items-center justify-center gap-2 bg-green-400 p-3 rounded-xl hover:bg-green-500
           transition duration-150 ease-in active:scale-105 active:ring-2 ring-black active:drop-shadow-sm  "
              >
                <FaUserPlus />
                create user
              </button>
            </div>
          </header>
          <div className="h-96 relative overflow-auto">
            <table className=" mt-5">
              <thead className="sticky top-0   bg-white z-20">
                <tr className="flex  font-normal text-slate-600 justify-start w-full h-20 border-y-2 gap-10 items-center">
                  <td className="w-10">Photo</td>
                  <td className="w-60">Email</td>
                  <td className="w-10">Role</td>
                  <td className="w-48">Created At</td>
                  <td className="w-32">Reset Password</td>
                  <td className="w-20">Options</td>
                </tr>
              </thead>
              <tbody>
                {accounts?.data?.accounts?.map((account) => {
                  const createAt = new Date(account?.createAt);
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
                  return (
                    <tr
                      className="flex justify-start items-center gap-10"
                      key={account.id}
                    >
                      <td className="w-10 h-10 my-2 relative">
                        <Image
                          src={account.image}
                          fill
                          alt="user account profile"
                          className="object-contain"
                        />
                      </td>
                      <td className="w-60 truncate font-semibold text-black">
                        {account.email}
                      </td>
                      <td className="w-10">{account.role}</td>
                      <td
                        className="w-48
                "
                      >
                        {formattedDatecreateAt}
                      </td>
                      <td className="w-32">
                        <button
                          onClick={() => {
                            setSelectAccount(() => account);
                            setTriggerResetPassword(() => true);
                            document.body.style.overflow = "hidden";
                          }}
                          className="w-full h- hover:bg-red-700 transition duration-150 ease-linear
                   active:ring-2 ring-black active:drop-shadow-sm active:scale-105 bg-red-600 text-white rounded-xl p-2"
                        >
                          RESET
                        </button>
                      </td>
                      <td className="flex justify-center w-20 items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectAccount(() => account);
                            setTriggerEditAccount(() => true);
                            document.body.style.overflow = "hidden";
                          }}
                          className="text-3xl text-blue-700 hover:scale-105 active:text-blue-900 transition duration-100"
                        >
                          <BiSolidMessageSquareEdit />
                        </button>

                        <button
                          onClick={() =>
                            handleDeletAccount({
                              userId: account.id,
                              email: account.email,
                            })
                          }
                          className="text-3xl text-red-700 hover:scale-105 active:text-red-900 transition duration-100"
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
            count={accounts?.data?.totalPages}
            color="primary"
          />
        </section>
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
    if (user.role !== "admin") {
      return {
        redirect: {
          permanent: false,
          destination: "/",
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
        destination: "/auth/sign-in",
      },
    };
  }
};
