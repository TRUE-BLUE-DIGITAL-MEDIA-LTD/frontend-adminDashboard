import Countdown from "react-countdown";
import Swal from "sweetalert2";
import { SmsBulkEmail } from "../../models";

type Props = {
  email: SmsBulkEmail;
  onCancel: (id: string) => void;
  onDone: (id: string) => void;
  onReorder: (id: string) => void;
};

export function openEmailHtml(html: string) {
  const escaped = html.replace(/"/g, "&quot;");
  Swal.fire({
    title: "Email",
    width: 800,
    html: `<iframe sandbox="" srcdoc="${escaped}" style="width:100%;height:60vh;border:1px solid #ddd"></iframe>`,
    showConfirmButton: false,
    showCloseButton: true,
  });
}

function ActiveEmail({ email, onCancel, onDone, onReorder }: Props) {
  const copy = () => {
    if (!email.emailAddress) return;
    navigator.clipboard.writeText(email.emailAddress);
    Swal.fire({ title: "Copied", toast: true, position: "top", timer: 1200, showConfirmButton: false });
  };

  return (
    <div className="w-full overflow-hidden rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-400 pb-2">
        <button
          onClick={copy}
          title="Copy address"
          className="min-w-0 truncate text-left text-lg font-semibold hover:underline"
        >
          {email.emailAddress ?? "provisioning address..."}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <h3 className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
            <Countdown
              date={new Date(email.expireAt)}
              renderer={({ minutes, seconds }) => (
                <span>
                  {minutes}:{String(seconds).padStart(2, "0")}
                </span>
              )}
            />
          </h3>
          {email.isGetSms ? (
            <>
              <button
                onClick={() => onReorder(email.id)}
                title="Re-open this address for another OTP (charged again)"
                className="flex h-8 w-20 items-center justify-center rounded-sm bg-blue-100 p-1 px-2 text-xs font-semibold text-blue-700 hover:bg-blue-200"
              >
                Reorder
              </button>
              <button
                onClick={() => onDone(email.id)}
                className="flex h-8 w-20 items-center justify-center rounded-sm bg-green-600 p-1 px-2 text-xs font-semibold text-white hover:bg-green-700"
              >
                Done
              </button>
            </>
          ) : (
            <button
              onClick={() => onCancel(email.id)}
              title="Cancel and refund"
              className="flex h-8 w-20 items-center justify-center rounded-sm bg-red-300 p-1 px-2 text-xs text-red-700"
            >
              refund
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 text-sm">
        {email.site} / {email.domain} : (${email.price.toFixed(2)})
      </div>
      <div className="py-2">
        {email.otpValue ? (
          <div className="flex items-center justify-between gap-2 rounded-sm bg-gray-50 p-2">
            <span className="text-2xl font-bold tracking-widest">{email.otpValue}</span>
            {email.htmlMessage && (
              <button
                onClick={() => openEmailHtml(email.htmlMessage as string)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-800 hover:text-white"
              >
                View email
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm">The OTP will appear here after the site sends an email to this address.</p>
        )}
      </div>
    </div>
  );
}

export default ActiveEmail;
