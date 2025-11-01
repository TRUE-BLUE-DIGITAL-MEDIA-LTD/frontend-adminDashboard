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
import PartnerTable from "../../components/tables/PartnerTable";
import AssignPartner from "../../components/forms/accounts/assignPartner";
import UpdateBonusRate from "../../components/forms/accounts/updateBonusRate";
import AnnoucementTable from "../../components/Annoucement/AnnoucementTable";
import { FiPlusCircle, FiLogIn, FiEdit, FiTrash2 } from "react-icons/fi";

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

      <main className=" flex min-h-screen w-full flex-col items-center bg-gray-100 p-5 font-Poppins">
        {user.role === "admin" && (
          <section className="w-full max-w-7xl rounded-lg bg-white p-5 shadow-lg">
            <header className="mb-5 flex flex-col items-center justify-between gap-4 md:flex-row">
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800 md:text-3xl">
                <FaPeopleGroup />
                Account Management
              </h1>
              <button
                onClick={() => {
                  document.body.style.overflow = "hidden";
                  setTriggerCreateAccount(() => true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-2 text-white shadow-md
           transition duration-150 ease-in-out hover:bg-blue-600 active:scale-95"
              >
                <FiPlusCircle />
                Create User
              </button>
            </header>
            <div className="h-96 overflow-x-auto">
              <table className=" w-max min-w-full table-auto text-center">
                <thead className="bg-gray-100">
                  <tr className="text-sm font-bold text-gray-700">
                    <th className="p-4">Photo</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4">Partner</th>
                    <th className="p-4">Bonus Setting</th>
                    <th className="p-4">Login As</th>
                    <th className="p-4">Reset Password</th>
                    <th className="p-4">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.isLoading
                    ? [...Array(5)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="p-4">
                            <div className="mx-auto h-10 w-10 rounded-full bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-4 w-40 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-4 w-20 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-4 w-32 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-8 w-32 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-8 w-32 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-8 w-24 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto h-8 w-24 rounded bg-gray-300"></div>
                          </td>
                          <td className="p-4">
                            <div className="mx-auto flex justify-center gap-2">
                              <div className="h-6 w-6 rounded bg-gray-300"></div>
                              <div className="h-6 w-6 rounded bg-gray-300"></div>
                            </div>
                          </td>
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
                          <tr
                            key={account.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-4">
                              <div className="relative mx-auto h-10 w-10 overflow-hidden rounded-full">
                                <Image
                                  src={account.image}
                                  fill
                                  alt="user account profile"
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-gray-700">
                              {account.email}
                            </td>
                            <td className="p-4 text-gray-600">
                              {account.role}
                            </td>
                            <td className="p-4 text-gray-600">
                              {formattedDatecreateAt}
                            </td>
                            <td className="p-4">
                              {account.partner ? (
                                <button
                                  onClick={() => {
                                    setTriggerAssignPartner(() => true);
                                    setSelectAccount(() => account);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-2 text-white shadow-md
                   transition duration-150 ease-in-out hover:bg-green-600"
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
                                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-600 px-4 py-2 text-white shadow-md
                   transition duration-150 ease-in-out hover:bg-gray-700"
                                >
                                  <FaUser />
                                  No Partner Connected
                                </button>
                              )}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setTriggerUpdateBonusRate(() => true);
                                  setSelectAccount(() => account);
                                  document.body.style.overflow = "hidden";
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 py-2 text-white shadow-md
                   transition duration-150 ease-in-out hover:bg-teal-600"
                              >
                                <FaMoneyBillTrendUp />
                                Bonus Setting
                              </button>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() =>
                                  handleSignInAsAnotherUser({
                                    email: account.email,
                                  })
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2 text-white shadow-md
                   transition duration-150 ease-in-out hover:bg-indigo-600"
                              >
                                <FiLogIn />
                                Sign In
                              </button>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setSelectAccount(() => account);
                                  setTriggerResetPassword(() => true);
                                  document.body.style.overflow = "hidden";
                                }}
                                className="w-full rounded-2xl bg-orange-500 px-4 py-2 text-white shadow-md
                   transition duration-150 ease-in-out hover:bg-orange-600"
                              >
                                RESET
                              </button>
                            </td>

                            <td className="p-4">
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => {
                                    setSelectAccount(() => account);
                                    setTriggerEditAccount(() => true);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className="text-2xl text-blue-600 transition duration-100 hover:text-blue-800"
                                >
                                  <FiEdit />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeletAccount({
                                      userId: account.id,
                                      email: account.email,
                                    })
                                  }
                                  className="text-2xl text-red-600 transition duration-100 hover:text-red-800"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-center">
              <Pagination
                onChange={(e, page) => setPage(page)}
                count={accounts?.data?.totalPages}
                color="primary"
              />
            </div>
          </section>
        )}
        <div className="mt-10 w-full max-w-7xl">
          <PartnerTable accounts={accounts} user={user} />
        </div>
        <div className="mt-10 w-full max-w-7xl">
          <AnnoucementTable />
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
