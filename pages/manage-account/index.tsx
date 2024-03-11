import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";
import React, { useState } from "react";
import { GetUser, SignInAsAnoterUserService } from "../../services/admin/user";
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
import { FaUser, FaUserPlus } from "react-icons/fa6";
import Image from "next/image";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { Pagination } from "@mui/material";
import { useRouter } from "next/router";

function Index({ user }: { user: User }) {
  const router = useRouter();
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
        Swal.fire("error!", err.message?.toString(), "error");
      }
    }
  };

  const handleSignInAsAnotherUser = async ({ email }: { email: string }) => {
    try {
      Swal.fire({
        title: "Trying To Sign In",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const user = await SignInAsAnoterUserService({ email });
      setCookie(null, "access_token", user.access_token, {
        maxAge: 30 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
        path: "/", // Cookie path (can be adjusted based on your needs)
      });
      window.location.reload();
      Swal.fire({
        title: "Success",
        html: `Successfully Signed In As ${user.user.name}`,
        icon: "success",
      });
    } catch (err: any) {
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
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
      <main className="mb-20 mt-40 flex w-full flex-col items-center justify-start font-Poppins">
        <section className="flex h-max w-max flex-col items-center justify-start gap-5 rounded-lg p-7 ring-2 ring-slate-300">
          <header className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-bold">Account Management</h1>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  document.body.style.overflow = "hidden";
                  setTriggerCreateAccount(() => true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-400 p-3 ring-black
           transition duration-150 ease-in hover:bg-green-500 active:scale-105 active:ring-2 active:drop-shadow-sm  "
              >
                <FaUserPlus />
                create user
              </button>
            </div>
          </header>
          <div className=" h-96 w-[45rem] justify-center  overflow-auto 2xl:w-[60rem] ">
            <table className="w-max table-auto border-collapse ">
              <thead className="sticky top-0   z-20 bg-gray-200">
                <tr className=" h-14  border-slate-400 font-normal  text-slate-600">
                  <th className="w-20">Photo</th>
                  <th className="">Email</th>
                  <th className="">Role</th>
                  <th className="">Created At</th>
                  <th className="">Login As</th>
                  <th className="">Reset Password</th>
                  <th className="">Options</th>
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
                    },
                  );
                  return (
                    <tr className="" key={account.id}>
                      <td className="relative  h-20 w-10 border-4 border-transparent ">
                        <Image
                          src={account.image}
                          fill
                          alt="user account profile"
                          className="object-contain"
                        />
                      </td>
                      <td className="  truncate border-4 border-transparent font-semibold text-black">
                        {account.email}
                      </td>
                      <td className=" border-4 border-transparent">
                        {account.role}
                      </td>
                      <td className=" border-4 border-transparent ">
                        {formattedDatecreateAt}
                      </td>
                      <td className=" border-4 border-transparent">
                        <button
                          onClick={() =>
                            handleSignInAsAnotherUser({ email: account.email })
                          }
                          className=" flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 p-2 text-white
                   ring-black transition duration-150 ease-linear hover:scale-105 hover:bg-green-700 active:ring-2 active:drop-shadow-sm"
                        >
                          <FaUser />
                          sign in
                        </button>
                      </td>
                      <td className=" border-4 border-transparent">
                        <button
                          onClick={() => {
                            setSelectAccount(() => account);
                            setTriggerResetPassword(() => true);
                            document.body.style.overflow = "hidden";
                          }}
                          className=" w-full rounded-xl bg-red-600 p-2 text-white
                   ring-black transition duration-150 ease-linear hover:scale-105 hover:bg-red-700 active:ring-2 active:drop-shadow-sm"
                        >
                          RESET
                        </button>
                      </td>
                      <td className="  gap-2 border-4 border-transparent">
                        <button
                          onClick={() => {
                            setSelectAccount(() => account);
                            setTriggerEditAccount(() => true);
                            document.body.style.overflow = "hidden";
                          }}
                          className="text-3xl  text-blue-700 transition duration-100 hover:scale-105 active:text-blue-900"
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
  context: GetServerSidePropsContext,
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
