import React from "react";
import {
  ErrorMessages,
  SmsPoolAccount as TypeSmsPoolAccount,
  User,
} from "../../models";
import moment from "moment";
import Swal from "sweetalert2";
import { useSwitchSmsPoolAccount } from "../../react-query/sms-pool";

type Props = {
  account: TypeSmsPoolAccount;
  user: User;
};
function SmsPoolAccount({ account, user }: Props) {
  const swichAccount = useSwitchSmsPoolAccount({ userId: user.id });

  const handleCancelSMS = async () => {
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
      await swichAccount.mutateAsync({
        smsPoolAccountId: account.id,
      });
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
        text: result.message.toString(),
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <li className="relative flex h-max w-96 flex-col gap-3 rounded-lg border p-3 font-Poppins">
      <h1 className="border-b text-lg font-bold ">
        <span className="text-base text-gray-400">Username: </span>
        {account.username}
      </h1>
      {account.isActive ? (
        <div className=" absolute right-2 top-2 bg-green-100 px-3 text-green-600">
          Active
        </div>
      ) : (
        <div className=" absolute right-2 top-2 bg-gray-100 px-3 text-gray-600">
          Disable
        </div>
      )}
      <h1 className="mt-2  text-base ">
        <span className="text-sm text-gray-400">Last Active At: </span>
        {moment(account.lastActiveAt).format("DD/MM/YYYY HH:mm:ss")}
      </h1>
      <button
        onClick={handleCancelSMS}
        disabled={swichAccount.isPaused}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-800 text-white "
      >
        {swichAccount.isPending ? "Loading.." : "Activate"}
      </button>
    </li>
  );
}

export default SmsPoolAccount;
