import { Pagination } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";
import { useState } from "react";
import { FaMoneyBillTrendUp, FaPeopleGroup, FaUser } from "react-icons/fa6";
import {
  FiEdit,
  FiKey,
  FiLogIn,
  FiPlusCircle,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import AnnoucementTable from "../../components/Annoucement/AnnoucementTable";
import AssignPartner from "../../components/forms/accounts/assignPartner";
import CreateAccount from "../../components/forms/accounts/createAccount";
import EditAccount from "../../components/forms/accounts/editAccount";
import ResetPassword from "../../components/forms/accounts/reset-password";
import UpdateBonusRate from "../../components/forms/accounts/updateBonusRate";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Partner, User } from "../../models";
import {
  DeleteAccountService,
  GetAllAccountByPageService,
  RestoreAccountService,
} from "../../services/admin/account";
import { GetUser, SignInAsAnoterUserService } from "../../services/admin/user";
import PartnerTable from "../../components/forms/partners/PartnerTable";

const paginationSx = {
  "& .MuiPaginationItem-root": { color: "rgb(var(--fg))" },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#00ABE4",
    color: "#ffffff",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "var(--hover)",
  },
  "& .MuiPaginationItem-icon": { color: "rgb(var(--fg))" },
};

function Index({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"active" | "suspended">("active");
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
    queryKey: ["accounts", page, view],
    queryFn: () =>
      GetAllAccountByPageService({
        page: page,
        limit: 30,
        isDeleted: view === "suspended",
      }),
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
      "</strong> <div>to confirm suspending</div>";
    const { value } = await Swal.fire({
      title: "Suspend Account",
      input: "text",
      footer:
        "Please keep it mind if you suspend this account, it can not be reverted!",
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
          title: "Trying To Suspend",
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
        Swal.fire("Suspended!", "Successfully Suspended Account", "success");
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

  const handleRestoreAccount = async ({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }) => {
    const { isConfirmed } = await Swal.fire({
      title: "Restore Account",
      text: `Restore ${email}? The account will be able to sign in again.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore",
    });
    if (!isConfirmed) return;
    try {
      Swal.fire({
        title: "Trying To Restore",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await RestoreAccountService({ userId });
      await accounts.refetch();
      Swal.fire("Restored!", "Successfully Restored Account", "success");
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

      <main className="flex min-h-screen w-full flex-col items-center bg-surface p-5 font-Poppins text-fg">
        {user.role === "admin" && (
          <section className="w-full max-w-7xl overflow-hidden rounded-2xl border border-line bg-panel text-fg">
            {/* Toolbar */}
            <header className="flex flex-col gap-4 border-b border-line px-5 py-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-main-color">
                  Control Center
                </p>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-fg">
                  <FaPeopleGroup className="text-[#62C7D8]" />
                  Account Management
                </h1>
                <p className="text-sm text-fg-subtle">
                  Manage team users, partners, and access in one place.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-full border border-line bg-surface/40 p-1">
                  <button
                    onClick={() => {
                      setView("active");
                      setPage(1);
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      view === "active"
                        ? "bg-main-color/20 text-main-color"
                        : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => {
                      setView("suspended");
                      setPage(1);
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      view === "suspended"
                        ? "bg-rose-500/20 text-rose-300"
                        : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    Suspended
                  </button>
                </div>
                <button
                  onClick={() => {
                    document.body.style.overflow = "hidden";
                    setTriggerCreateAccount(() => true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-fg bg-fg px-4 py-2 text-sm font-semibold text-surface transition hover:border-main-color hover:bg-main-color hover:text-white active:scale-95"
                >
                  <FiPlusCircle />
                  Create User
                </button>
              </div>
            </header>

            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                <thead className="sticky top-0 z-20 border-b border-line bg-panel/95 backdrop-blur">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="hidden px-3 py-3 font-semibold md:table-cell">
                      Created
                    </th>
                    <th className="px-3 py-3 font-semibold">Partner</th>
                    <th className="w-44 px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.isLoading
                    ? [...Array(5)].map((_, index) => (
                        <tr
                          key={index}
                          className="animate-pulse border-b border-line"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-panel-raised" />
                              <div className="space-y-2">
                                <div className="h-3 w-28 rounded bg-panel-raised" />
                                <div className="h-2.5 w-40 rounded bg-panel-raised" />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="h-5 w-16 rounded-full bg-panel-raised" />
                          </td>
                          <td className="hidden px-3 py-4 md:table-cell">
                            <div className="h-3 w-24 rounded bg-panel-raised" />
                          </td>
                          <td className="px-3 py-4">
                            <div className="h-5 w-24 rounded-full bg-panel-raised" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="ml-auto flex justify-end gap-2">
                              <div className="h-8 w-8 rounded-lg bg-panel-raised" />
                              <div className="h-8 w-8 rounded-lg bg-panel-raised" />
                              <div className="h-8 w-8 rounded-lg bg-panel-raised" />
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
                            className="border-b border-line transition hover:bg-hover"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
                                  <Image
                                    src={account.image}
                                    fill
                                    alt="user account profile"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-fg">
                                    {account.name || "—"}
                                  </p>
                                  <p className="truncate text-xs text-fg-subtle">
                                    {account.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="inline-flex rounded-full border border-line bg-panel-raised px-2.5 py-0.5 text-[11px] font-medium capitalize text-fg-muted">
                                {account.role}
                              </span>
                            </td>
                            <td className="hidden px-3 py-3.5 text-xs text-fg-subtle md:table-cell">
                              {formattedDatecreateAt}
                            </td>
                            <td className="px-3 py-3.5">
                              <button
                                onClick={() => {
                                  setTriggerAssignPartner(() => true);
                                  setSelectAccount(() => account);
                                  document.body.style.overflow = "hidden";
                                }}
                                className={`inline-flex max-w-[10rem] items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                  account.partner
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                    : "border-line bg-panel-raised text-fg-muted hover:bg-hover"
                                }`}
                                title={
                                  account.partner
                                    ? account.partner.name
                                    : "Assign partner"
                                }
                              >
                                <FaUser className="shrink-0 text-[10px]" />
                                <span className="truncate">
                                  {account.partner
                                    ? account.partner.name
                                    : "Unassigned"}
                                </span>
                              </button>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  title="Bonus setting"
                                  onClick={() => {
                                    setTriggerUpdateBonusRate(() => true);
                                    setSelectAccount(() => account);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className="rounded-lg p-2 text-[#62C7D8] transition hover:bg-main-color/10 hover:text-main-color"
                                >
                                  <FaMoneyBillTrendUp className="text-base" />
                                </button>
                                <button
                                  title="Sign in as user"
                                  onClick={() =>
                                    handleSignInAsAnotherUser({
                                      email: account.email,
                                    })
                                  }
                                  className="rounded-lg p-2 text-indigo-300 transition hover:bg-indigo-500/10"
                                >
                                  <FiLogIn className="text-base" />
                                </button>
                                <button
                                  title="Reset password"
                                  onClick={() => {
                                    setSelectAccount(() => account);
                                    setTriggerResetPassword(() => true);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className="rounded-lg p-2 text-amber-300 transition hover:bg-amber-500/10"
                                >
                                  <FiKey className="text-base" />
                                </button>
                                <button
                                  title="Edit account"
                                  onClick={() => {
                                    setSelectAccount(() => account);
                                    setTriggerEditAccount(() => true);
                                    document.body.style.overflow = "hidden";
                                  }}
                                  className="rounded-lg p-2 text-main-color transition hover:bg-main-color/10 hover:text-fg"
                                >
                                  <FiEdit className="text-base" />
                                </button>
                                {view === "active" ? (
                                  <button
                                    title="Suspend account"
                                    onClick={() =>
                                      handleDeletAccount({
                                        userId: account.id,
                                        email: account.email,
                                      })
                                    }
                                    className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                                  >
                                    <FiTrash2 className="text-base" />
                                  </button>
                                ) : (
                                  <button
                                    title="Restore account"
                                    onClick={() =>
                                      handleRestoreAccount({
                                        userId: account.id,
                                        email: account.email,
                                      })
                                    }
                                    className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10"
                                  >
                                    <FiRotateCcw className="text-base" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center border-t border-line px-5 py-4">
              <div className="rounded-full border border-line-strong bg-panel-raised px-3 py-2">
                <Pagination
                  onChange={(e, page) => setPage(page)}
                  count={accounts?.data?.totalPages}
                  color="primary"
                  sx={paginationSx}
                />
              </div>
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
