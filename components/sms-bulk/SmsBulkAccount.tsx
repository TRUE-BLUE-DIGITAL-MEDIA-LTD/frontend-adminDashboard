import moment from "moment";
import { useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages, SmsBulkAccount as TypeSmsBulkAccount } from "../../models";
import { useGetSmsBulkAccounts, useUpdateSmsBulkAccount } from "../../react-query";

type Props = { account: TypeSmsBulkAccount };

function maskKey(key: string) {
  return key.length > 10 ? `${key.slice(0, 6)}...${key.slice(-4)}` : key;
}

function SmsBulkAccount({ account }: Props) {
  const update = useUpdateSmsBulkAccount();
  const accounts = useGetSmsBulkAccounts();
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
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString(),
        icon: "error",
      });
    }
  };

  return (
    <li className="flex h-max w-80 flex-col gap-2 overflow-hidden rounded-lg border p-3 font-Poppins">
      <div className="flex items-center justify-between gap-2 border-b pb-1">
        <h1 title={account.username} className="min-w-0 flex-1 truncate text-lg font-bold">
          <span className="text-base text-gray-400">Username: </span>
          {account.username}
        </h1>
        {account.isActive ? (
          <div className="shrink-0 rounded-sm bg-green-100 px-3 text-sm text-green-600">Active</div>
        ) : (
          <div className="shrink-0 rounded-sm bg-gray-100 px-3 text-sm text-gray-600">Disable</div>
        )}
      </div>
      <span className="break-all text-sm text-gray-500">Key: {maskKey(account.apiKey)}</span>
      <span className="break-all text-sm text-gray-500">
        Webhook secret: {account.webhookSecret ? "set" : "not set"}
      </span>
      <span className="text-xs text-gray-400">
        Last Active At: {moment(account.lastActiveAt).format("DD/MM/YYYY HH:mm:ss")}
      </span>
      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="New API key"
        className="h-8 min-w-0 rounded border px-2 text-sm"
      />
      <input
        value={webhookSecret}
        onChange={(e) => setWebhookSecret(e.target.value)}
        placeholder="New webhook secret"
        className="h-8 min-w-0 rounded border px-2 text-sm"
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

export default SmsBulkAccount;
