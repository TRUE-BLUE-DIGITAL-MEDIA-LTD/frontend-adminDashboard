import React, { useState } from "react";
import { searchconsole_v1 } from "googleapis";
import { MdSearch } from "react-icons/md";
import Swal from "sweetalert2";
import { useInspectUrl } from "../../../react-query/domain";
import SpinLoading from "../../loadings/spinLoading";

function ResultRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">
        {value ?? "—"}
      </span>
    </div>
  );
}

function GscUrlInspectionTab({
  domainId,
  domainName,
}: {
  domainId: string;
  domainName: string;
}) {
  const [url, setUrl] = useState(`https://${domainName}/`);
  const inspect = useInspectUrl();
  const result: searchconsole_v1.Schema$UrlInspectionResult | undefined =
    inspect.data;
  const indexResult = result?.indexStatusResult;

  const handleInspect = async () => {
    try {
      await inspect.mutateAsync({ domainId, url });
    } catch (err: any) {
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  const verdictStyle =
    indexResult?.verdict === "PASS"
      ? "bg-green-100 text-green-800"
      : indexResult?.verdict === "FAIL"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Checks how Google sees a page on{" "}
        <span className="font-medium">{domainName}</span>. Limited to ~2,000
        inspections per day.
      </p>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`https://${domainName}/page`}
          className="h-11 flex-1 rounded-lg border border-gray-300 px-4 focus:border-blue-500 focus:outline-none"
        />
        <button
          disabled={inspect.isPending}
          onClick={handleInspect}
          className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
        >
          {inspect.isPending ? <SpinLoading /> : <MdSearch />} Inspect
        </button>
      </div>

      {indexResult && (
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${verdictStyle}`}
            >
              {indexResult.verdict ?? "UNKNOWN"}
            </span>
            <span className="font-medium text-gray-800">
              {indexResult.coverageState}
            </span>
          </div>
          <ResultRow
            label="Last crawl"
            value={
              indexResult.lastCrawlTime
                ? new Date(indexResult.lastCrawlTime).toLocaleString()
                : null
            }
          />
          <ResultRow label="Indexing state" value={indexResult.indexingState} />
          <ResultRow
            label="robots.txt"
            value={indexResult.robotsTxtState}
          />
          <ResultRow
            label="Google canonical"
            value={indexResult.googleCanonical}
          />
          <ResultRow
            label="Referring sitemap"
            value={indexResult.sitemap?.join(", ")}
          />
        </div>
      )}
    </div>
  );
}

export default GscUrlInspectionTab;
