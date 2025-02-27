import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";
import React, { useState } from "react";
import { GetUser, SignInAsAnoterUserService } from "../../services/admin/user";
import { Partner, User } from "../../models";
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
import {
  FaMoneyBillTrendUp,
  FaPeopleGroup,
  FaUser,
  FaUserPlus,
} from "react-icons/fa6";
import Image from "next/image";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { Pagination } from "@mui/material";
import { useRouter } from "next/router";
import PartnerTable from "../../components/tables/partner";
import AssignPartner from "../../components/forms/accounts/assignPartner";
import UpdateBonusRate from "../../components/forms/accounts/updateBonusRate";
import AnnoucementTable from "../../components/Annoucement/AnnoucementTable";

function Index({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [triggerCreateAccount, setTriggerCreateAccount] = useState(false);
  const [triggerResetPassword, setTriggerResetPassword] = useState(false);
  const [triggerEditAccount, setTriggerEditAccount] = useState(false);
  const [triggerAssignPartner, setTriggerAssignPartner] = useState(false);
  const [selectAccount, setSelectAccount] = useState<
    User & {
      partner: Partner | null;
    }
  >();
  const [triggerUpdateBonusRate, setTriggerUpdateBonusRate] = useState(false);
  const accounts = useQuery({
    queryKey: ["accounts", page],
    queryFn: () => GetAllAccountByPageService({ page: page, limit: 30 }),
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
      const cookies = parseCookies();
      const currentAccessToken = cookies.access_token;
      setCookie(null, "impersonate_access_token", currentAccessToken, {
        maxAge: 30 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
        path: "/", // Cookie path (can be adjusted based on your needs)
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
      {triggerAssignPartner && selectAccount && (
        <AssignPartner
          accounts={accounts}
          selectAccount={selectAccount}
          setTriggerAssignPartner={setTriggerAssignPartner}
        />
      )}

      {triggerUpdateBonusRate && selectAccount && (
        <UpdateBonusRate
          accounts={accounts}
          user={selectAccount}
          setTrigger={setTriggerUpdateBonusRate}
        />
      )}

      <main className="mb-20 mt-40 flex w-full flex-col items-center justify-start gap-10 font-Poppins">
        {user.role === "admin" && (
          <section className="flex h-max w-11/12 flex-col items-center justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300  md:p-5">
            <header className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
              <h1 className="rext-xl font-bold md:text-3xl">
                Account Management
              </h1>
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
            <div className=" h-96  w-full  overflow-auto ">
              <table className="w-max table-auto ">
                <thead className="sticky top-0 z-20 bg-gray-200">
                  <tr className=" h-14  border-slate-400 font-normal  text-slate-600">
                    <th className="px-5">Photo</th>
                    <th className="px-5">Email</th>
                    <th className="px-5">Role</th>
                    <th className="px-5">Created At</th>
                    <th className="px-5">Partner</th>
                    <th className="px-5">Bonus Setting</th>
                    <th className="px-5">Login As</th>
                    <th className="px-5">Reset Password</th>
                    <th className="px-5">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.isLoading
                    ? [...Array(5)].map((_, index) => (
                        <tr key={index}>
                          <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                          <td className="h-10 w-60 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                          <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                          <td className="h-10 w-40 animate-pulse border-4 border-transparent bg-gray-50 "></td>
                          <td className="h-12 w-96 animate-pulse border-4 border-transparent bg-gray-300 "></td>
                          <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-600 "></td>
                          <td className="h-10 w-40 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                        </tr>
                      ))
                    : accounts?.data?.accounts?.map((account) => {
                        const createAt = new Date(account?.createAt);
                        const formattedDatecreateAt =
                          createAt.toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });
                        return (
                          <tr key={account.id}>
                            <td className="">
                              <div className="relative h-10  w-full overflow-hidden border-4 border-transparent ">
                                <Image
                                  src={account.image}
                                  fill
                                  alt="user account profile"
                                  className="object-contain"
                                />
                              </div>
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
                              {account.partner ? (
                                <button
                                  onClick={() => {
                                    setTriggerAssignPartner(() => true);
                                    setSelectAccount(() => account);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className=" flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 p-2 text-white
                   ring-black transition duration-150 ease-linear hover:scale-105 hover:bg-green-700 active:ring-2 active:drop-shadow-sm"
                                >
                                  <FaUser />
                                  {account.partner?.name}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTriggerAssignPartner(() => true);
                                    setSelectAccount(() => account);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className=" flex w-full items-center justify-center gap-2 rounded-xl bg-gray-600 p-2 text-white
                   ring-black transition duration-150 ease-linear hover:scale-105 hover:bg-gray-700 active:ring-2 active:drop-shadow-sm"
                                >
                                  <FaUser />
                                  No Partner Connected
                                </button>
                              )}
                            </td>
                            <td className=" border-4 border-transparent">
                              <button
                                onClick={() => {
                                  setTriggerUpdateBonusRate(() => true);
                                  setSelectAccount(() => account);
                                  document.body.style.overflow = "hidden";
                                }}
                                className=" flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 p-2 text-white
                   ring-black transition duration-150 ease-linear hover:scale-105 hover:bg-green-700 active:ring-2 active:drop-shadow-sm"
                              >
                                <FaMoneyBillTrendUp />
                                Bonus Setting
                              </button>
                            </td>
                            <td className=" border-4 border-transparent">
                              <button
                                onClick={() =>
                                  handleSignInAsAnotherUser({
                                    email: account.email,
                                  })
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

                            <td className=" border-4 border-transparent">
                              <div className="flex w-full gap-3">
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
                              </div>
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
        )}
        <PartnerTable accounts={accounts} user={user} />

        <AnnoucementTable />
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
    if (user.TOTPenable === false) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/setup-totp",
        },
      };
    }
    if (user.role === "partner" || user.role === "user") {
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
        destination: "https://home.oxyclick.com",
      },
    };
  }
};
