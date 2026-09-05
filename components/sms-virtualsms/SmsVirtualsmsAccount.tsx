import moment from "moment";
import { useState } from "react";
import Swal from "sweetalert2";
import {
  ErrorMessages,
  SmsVirtualsmsAccount as TypeSmsVirtualsmsAccount,
} from "../../models";
import {
  useGetSmsVirtualsmsAccounts,
  useUpdateSmsVirtualsmsAccount,
} from "../../react-query";

type Props = { account: TypeSmsVirtualsmsAccount };

function maskKey(key: string) {
  return key.length > 10 ? `${key.slice(0, 8)}...${key.slice(-4)}` : key;
}

function SmsVirtualsmsAccount({ account }: Props) {
  const update = useUpdateSmsVirtualsmsAccount();
  const accounts = useGetSmsVirtualsmsAccounts();
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  const run = async (body: {
    apiKey?: string;
    webhookSecret?: string;
    isActive?: boolean;
  }) => {
    try {
      Swal.fire({
        title: "Loading",
        html: "Please wait.",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await update.mutateAsync({ query: { id: account.id }, body });
      await accounts.refetch();
      setApiKey("");
      setWebhookSecret("");
      Swal.fire({ title: "Success", icon: "success" });
    } catch (error) {
      console.log(error);
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString(),
        icon: "error",
      });
    }
  };

  return (
    <li className="relative flex h-max w-80 flex-col gap-2 rounded-lg border p-3 font-Poppins">
      <h1 className="w-max border-b pr-20 text-lg font-bold">
        <span className="text-base text-gray-400">Username: </span>
        {account.username}
      </h1>
      {account.isActive ? (
        <div className="absolute right-2 top-2 bg-green-100 px-3 text-green-600">
          Active
        </div>
      ) : (
        <div className="absolute right-2 top-2 bg-gray-100 px-3 text-gray-600">
          Disable
        </div>
      )}
      <span className="text-sm text-gray-500">
        Key: {maskKey(account.apiKey)}
      </span>
      <span className="text-sm text-gray-500">
        Webhook secret: {account.webhookSecret ? "set" : "not set"}
      </span>
      <span className="text-xs text-gray-400">
        Last Active At:{" "}
        {moment(account.lastActiveAt).format("DD/MM/YYYY HH:mm:ss")}
      </span>
      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="New API key (vsms_...)"
        className="h-8 rounded border px-2 text-sm"
      />
      <input
        value={webhookSecret}
        onChange={(e) => setWebhookSecret(e.target.value)}
        placeholder="New webhook secret"
        className="h-8 rounded border px-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          disabled={update.isPending || (!apiKey && !webhookSecret)}
          onClick={() =>
            run({
              ...(apiKey ? { apiKey } : {}),
              ...(webhookSecret ? { webhookSecret } : {}),
            })
          }
          className="h-9 flex-1 rounded-lg border text-sm disabled:opacity-40"
        >
          Save keys
        </button>
        <button
          disabled={update.isPending || account.isActive}
          onClick={() => run({ isActive: true })}
          className="h-9 flex-1 rounded-lg bg-gray-800 text-sm text-white disabled:opacity-40"
        >
          {update.isPending ? "Loading.." : "Activate"}
        </button>
      </div>
    </li>
  );
}

export default SmsVirtualsmsAccount;
