import { Skeleton } from "@mui/material";
import { useEffect } from "react";
import { useInboxEmail, useMarkEmailRead } from "../../react-query";
import { formatBytes, formatSender } from "./format";

export default function EmailDetailPanel({ emailId }: { emailId: string }) {
  const detail = useInboxEmail(emailId);
  const markRead = useMarkEmailRead();

  useEffect(() => {
    if (detail.data && !detail.data.isRead) {
      markRead.mutate(emailId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data?.id]);

  if (detail.isLoading) {
    return <Skeleton variant="rectangular" height={300} className="mt-6" />;
  }
  if (!detail.data) return null;
  const d = detail.data;

  return (
    <div className="mt-2">
      <h2 className="mb-1 text-xl font-bold">{d.subject || "(no subject)"}</h2>
      <div className="mb-4 text-sm text-gray-500">
        From{" "}
        <span className="font-medium text-gray-700">
          {formatSender(d.fromName, d.fromAddress)}
        </span>{" "}
        &lt;{d.fromAddress}&gt; · to {d.toAddress} ·{" "}
        {new Date(d.createAt).toLocaleString()}
      </div>

      {d.htmlBody ? (
        <iframe
          sandbox=""
          srcDoc={d.htmlBody}
          title="Email body"
          className="h-[50vh] w-full rounded-lg border bg-white"
        />
      ) : (
        <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg border bg-white p-4 text-sm">
          {d.textBody || "(empty message)"}
        </pre>
      )}

      {d.attachments.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Attachments
          </h3>
          <ul className="flex flex-wrap gap-2">
            {d.attachments.map((attachment) => (
              <li key={attachment.id}>
                <a
                  href={attachment.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm text-blue-700 hover:bg-gray-100"
                >
                  {attachment.filename}
                  <span className="text-xs text-gray-400">
                    {formatBytes(attachment.sizeBytes)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
