import React from "react";
import Swal from "sweetalert2";
import { ErrorMessages, Partner, SmsGetatextAccount, User } from "../../models";
import {
  useGetSmsGetatextAccounts,
  useSetActiveSmsGetatextAccount,
} from "../../react-query/sms-getatext";

type Props = {
  account: SmsGetatextAccount;
  user: User & { partner: Partner | null };
};

function SmsGetatextAccountCard({ account, user }: Props) {
  const setActiveAccount = useSetActiveSmsGetatextAccount();
  const accounts = useGetSmsGetatextAccounts();

  const handleActiveAccount = async () => {
    try {
      Swal.fire({
        title: "Loading",
        html: "Please wait.",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await setActiveAccount.mutateAsync({
        id: account.id,
      });
      await accounts.refetch();
      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString(),
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <li
      className={`flex items-center justify-between gap-5 rounded-md p-2 ring-1 ring-gray-300 drop-shadow-md ${
        account.isActive ? "bg-green-100" : "bg-white"
      }`}
    >
      <div className="flex flex-col">
        <h2 className="font-semibold text-gray-800">{account.username}</h2>
      </div>
      <button
        onClick={handleActiveAccount}
        disabled={account.isActive}
        className="rounded-md bg-blue-500 px-3 py-1 font-semibold text-white drop-shadow-md transition hover:bg-blue-600 disabled:bg-gray-400"
      >
        {account.isActive ? "Active" : "Set Active"}
      </button>
    </li>
  );
}

export default SmsGetatextAccountCard;
