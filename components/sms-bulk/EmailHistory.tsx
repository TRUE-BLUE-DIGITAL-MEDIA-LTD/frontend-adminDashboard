import moment from "moment";
import { useState } from "react";
import { useGetHistorySmsBulkEmail } from "../../react-query";
import { openEmailHtml } from "./ActiveEmail";

function EmailHistory() {
  const [page, setPage] = useState(1);
  const history = useGetHistorySmsBulkEmail({ page, limit: 50 });
  const totalPage = history.data?.totalPage ?? 0;

  return (
    <>
      <header className="flex flex-col items-center">
        <h1 className="text-xl font-semibold text-black">Email History</h1>
      </header>
      <div className="mt-1 overflow-auto lg:w-10/12 xl:w-10/12 2xl:w-7/12">
        <table className="w-max min-w-full border">
          <thead>
            <tr className="bg-gray-300">
              <th>Date</th>
              <th>Email</th>
              <th>Site</th>
              <th>OTP</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.data.map((email) => (
              <tr key={email.id} className="h-16 border-b">
                <td>
                  <section className="flex flex-col gap-1 px-2">
                    <span className="font-semibold leading-none">{moment(email.createAt).format("DD MMMM YYYY")}</span>
                    <span className="text-xs text-gray-500">At {moment(email.createAt).format("HH:mm")}</span>
                  </section>
                </td>
                <td>
                  <div className="flex items-center justify-center px-2">{email.emailAddress ?? "-"}</div>
                </td>
                <td>
                  <div className="flex items-center justify-center px-2 text-xs">{email.site}</div>
                </td>
                <td>
                  <div className="flex w-48 items-center justify-center gap-2 text-center">
                    {email.isGetSms ? (
                      <>
                        <div className="rounded-md bg-green-200 px-2 py-1 text-sm text-green-600">
                          ${email.price.toFixed(2)} - {email.otpValue}
                        </div>
                        {email.htmlMessage && (
                          <button
                            onClick={() => openEmailHtml(email.htmlMessage as string)}
                            className="rounded border px-2 text-xs hover:bg-gray-800 hover:text-white"
                          >
                            view
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-20 rounded-md bg-red-200 px-2 text-sm text-red-600">NO OTP</div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPage > 1 && (
        <div className="flex items-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">
            Prev
          </button>
          <span className="text-sm">
            {page} / {totalPage}
          </span>
          <button disabled={page >= totalPage} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default EmailHistory;
