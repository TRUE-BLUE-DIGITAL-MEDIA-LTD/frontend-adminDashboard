import { useState } from "react";
import { Partner, User } from "../../models";
import { useGetSmsBulk, useGetSmsBulkAccounts } from "../../react-query";
import EmailTab from "./EmailTab";
import SmsBulkAccount from "./SmsBulkAccount";
import SmsBulkAccountForm from "./SmsBulkAccountForm";
import SmsTab from "./SmsTab";

export type SmsBulkProps = { user: User & { partner: Partner | null } };
type Tab = "sms" | "email";

function SmsBulk({ user }: SmsBulkProps) {
  const [tab, setTab] = useState<Tab>("sms");
  const canManageAccounts =
    user.role === "manager" ||
    user.role === "admin" ||
    user.partner?.isAllowManageSmsBulkAccount === true;
  const showBalance = user.role === "admin" || user.role === "manager";
  const accounts = useGetSmsBulkAccounts({ enabled: canManageAccounts });
  const active = useGetSmsBulk({ userId: user.id });

  const tabClass = (t: Tab) =>
    `h-10 w-40 rounded-t-lg border-b-2 text-sm font-semibold ${
      tab === t ? "border-gray-800 text-gray-900" : "border-transparent text-gray-400"
    }`;

  return (
    <>
      <header className="mt-10 flex w-full flex-col items-center justify-center border-b pb-5">
        {canManageAccounts && (
          <div className="flex w-full flex-col items-center gap-3">
            <ul className="flex w-full flex-wrap items-center justify-center gap-3">
              {accounts.data?.map((a) => (
                <SmsBulkAccount account={a} key={a.id} />
              ))}
            </ul>
            <SmsBulkAccountForm />
          </div>
        )}
        <h1 className="text-4xl font-semibold text-gray-800">Oxy Bulk</h1>
        <span className="text-sm text-gray-500">
          Temporary phone numbers and email addresses for receiving verification codes.
        </span>
        {showBalance && (
          <h1 className="mt-5 flex items-center justify-center gap-2 text-3xl">
            Balance :{" "}
            <div className="rounded-sm bg-gradient-to-r from-gray-600 to-gray-800 px-2 text-white">
              {active.data?.balance.toLocaleString()}$
            </div>
          </h1>
        )}
        <nav className="mt-5 flex gap-2">
          <button className={tabClass("sms")} onClick={() => setTab("sms")}>
            SMS
          </button>
          <button className={tabClass("email")} onClick={() => setTab("email")}>
            Email
          </button>
        </nav>
      </header>
      <main className="mt-5 flex w-full flex-col items-center gap-5 pb-20">
        {tab === "sms" ? <SmsTab user={user} /> : <EmailTab user={user} />}
      </main>
    </>
  );
}

export default SmsBulk;
