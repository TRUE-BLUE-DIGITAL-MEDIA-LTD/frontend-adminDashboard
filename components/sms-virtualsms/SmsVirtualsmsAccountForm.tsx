import { useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../models";
import {
  useCreateSmsVirtualsmsAccount,
  useGetSmsVirtualsmsAccounts,
} from "../../react-query";

function SmsVirtualsmsAccountForm() {
  const create = useCreateSmsVirtualsmsAccount();
  const accounts = useGetSmsVirtualsmsAccounts();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  const handleCreate = async () => {
    try {
      await create.mutateAsync({
        username,
        apiKey,
        ...(webhookSecret ? { webhookSecret } : {}),
      });
      await accounts.refetch();
      setUsername("");
      setApiKey("");
      setWebhookSecret("");
      setOpen(false);
      Swal.fire({ title: "Account added", icon: "success" });
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-800 hover:text-white"
      >
        + Add VirtualSMS account
      </button>
    );
  }

  return (
    <div className="flex w-80 flex-col gap-2 rounded-lg border p-3 font-Poppins">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Label (e.g. main)"
        className="h-8 rounded border px-2 text-sm"
      />
      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API key (vsms_...)"
        className="h-8 rounded border px-2 text-sm"
      />
      <input
        value={webhookSecret}
        onChange={(e) => setWebhookSecret(e.target.value)}
        placeholder="Webhook secret (optional)"
        className="h-8 rounded border px-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="h-9 flex-1 rounded-lg border text-sm"
        >
          Cancel
        </button>
        <button
          disabled={create.isPending || !username || !apiKey}
          onClick={handleCreate}
          className="h-9 flex-1 rounded-lg bg-gray-800 text-sm text-white disabled:opacity-40"
        >
          {create.isPending ? "Loading.." : "Save"}
        </button>
      </div>
    </div>
  );
}

export default SmsVirtualsmsAccountForm;
