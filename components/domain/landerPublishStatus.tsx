import { useEffect } from "react";
import Swal from "sweetalert2";
import { useLanderPublish, useRequestLanderPublish } from "../../react-query";
import { LanderPublishStatus as Status } from "../../models";

const TERMINAL: (Status | null)[] = ["live", "published_unverified", "failed"];
const WATCH_LIMIT_MS = 180_000;
const POLL_MS = 3_000;

function label(status: Status | null, publishedAt: string | null, error: string | null) {
  switch (status) {
    case "queued":
      return { text: "Queued", cls: "bg-gray-100 text-gray-700" };
    case "publishing":
      return { text: "Publishing…", cls: "bg-blue-100 text-blue-700" };
    case "live":
      return {
        text: `Live since ${publishedAt ? new Date(publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}`,
        cls: "bg-green-100 text-green-700",
      };
    case "published_unverified":
      return { text: "Published, not reachable yet", cls: "bg-yellow-100 text-yellow-800" };
    case "failed":
      return { text: `Failed: ${error ?? "unknown error"}`, cls: "bg-red-100 text-red-700" };
    default:
      return null;
  }
}

/**
 * Shows whether the domain's live site serves the latest save.
 * `watchSince` = Date.now() at the moment of a save; the chip polls until the
 * status is terminal for a request newer than that, or 3 minutes pass.
 */
export default function LanderPublishStatus({
  domainId,
  watchSince,
  onSettled,
}: {
  domainId: string;
  watchSince: number | null;
  onSettled: () => void;
}) {
  const publish = useLanderPublish(domainId, watchSince ? POLL_MS : undefined);
  const request = useRequestLanderPublish();
  const data = publish.data;

  const requestedAt = data?.requestedAt ? new Date(data.requestedAt).getTime() : 0;
  const publishedAt = data?.publishedAt ? new Date(data.publishedAt).getTime() : 0;
  // A successful status from an older run is still "in progress" for a newer request.
  // Failures never write publishedAt, so they are always shown as-is.
  const staleSuccess =
    (data?.status === "live" || data?.status === "published_unverified") && requestedAt > publishedAt;
  const inProgress = !!data && (!TERMINAL.includes(data.status) || staleSuccess);

  // Failures never write publishedAt, so a `failed` row only counts once it was
  // fetched after the save (a stale, cached failure must not end the watch).
  const fetchedAt = publish.dataUpdatedAt;
  useEffect(() => {
    if (!watchSince) return;
    const settled =
      !!data &&
      TERMINAL.includes(data.status) &&
      (data.status === "failed" ? fetchedAt >= watchSince : publishedAt >= watchSince);
    if (settled || Date.now() - watchSince > WATCH_LIMIT_MS) onSettled();
  }, [data, publishedAt, fetchedAt, watchSince, onSettled]);

  if (!data || !data.status) return null;
  const shown = inProgress && data.status !== "queued" && data.status !== "publishing"
    ? label("queued", null, null)
    : label(data.status, data.publishedAt, data.error);
  if (!shown) return null;

  const handleRetry = async () => {
    try {
      await request.mutateAsync({ domainId });
      await publish.refetch();
    } catch (err: any) {
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-500">Live site:</span>
      <span className={`rounded-full px-3 py-1 font-medium ${shown.cls}`}>{shown.text}</span>
      {data.status === "published_unverified" && (
        <span className="text-xs text-gray-500">Check that the domain&apos;s DNS points at Netlify.</span>
      )}
      {data.status === "failed" && (
        <button
          type="button"
          disabled={request.isPending}
          onClick={handleRetry}
          className="rounded-full border border-red-600 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Retry
        </button>
      )}
    </div>
  );
}
