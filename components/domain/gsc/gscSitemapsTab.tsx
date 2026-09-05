import React from "react";
import { BiSitemap } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import {
  useDeleteGscSitemap,
  useGetGscSitemaps,
  useUpdateSitemap,
} from "../../../react-query/domain";
import SpinLoading from "../../loadings/spinLoading";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function GscSitemapsTab({
  domainId,
  isAdmin,
}: {
  domainId: string;
  isAdmin: boolean;
}) {
  const sitemaps = useGetGscSitemaps({ domainId });
  const resubmit = useUpdateSitemap();
  const deleteSitemap = useDeleteGscSitemap();

  const handleResubmit = async () => {
    try {
      await resubmit.mutateAsync({ domainId });
      await sitemaps.refetch();
      Swal.fire("Success", "Sitemap submitted to Google", "success");
    } catch (err: any) {
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  const handleDelete = async (feedpath: string) => {
    const confirm = await Swal.fire({
      title: "Remove sitemap from Search Console?",
      text: feedpath,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteSitemap.mutateAsync({ domainId, feedpath });
      Swal.fire("Removed", "Sitemap removed from Search Console", "success");
    } catch (err: any) {
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  if (sitemaps.isLoading) return <SpinLoading />;
  if (sitemaps.isError)
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
        {(sitemaps.error as any)?.message?.toString() ??
          "Could not load sitemaps from Search Console."}
      </div>
    );

  const list = sitemaps.data?.sitemaps ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-gray-700">
          <BiSitemap className="text-orange-500" /> Sitemaps in Search Console
        </h3>
        <button
          disabled={resubmit.isPending}
          onClick={handleResubmit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
        >
          {resubmit.isPending ? "Submitting..." : "Resubmit Sitemap"}
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Sitemap</th>
              <th className="px-4 py-3 text-center font-semibold">Submitted</th>
              <th className="px-4 py-3 text-center font-semibold">Last Read</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Errors</th>
              <th className="px-4 py-3 text-center font-semibold">Warnings</th>
              <th className="px-4 py-3 text-center font-semibold">
                Discovered
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-center font-semibold"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {list.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={isAdmin ? 8 : 7}>
                  No sitemaps submitted to Search Console yet
                </td>
              </tr>
            )}
            {list.map((sitemap) => {
              const errors = Number(sitemap.errors ?? 0);
              const warnings = Number(sitemap.warnings ?? 0);
              const ok = !sitemap.isPending && errors === 0 && warnings === 0;
              return (
                <tr key={sitemap.path} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={sitemap.path ?? "#"}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {sitemap.path}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {formatDate(sitemap.lastSubmitted)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {formatDate(sitemap.lastDownloaded)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        sitemap.isPending
                          ? "bg-yellow-100 text-yellow-800"
                          : ok
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sitemap.isPending ? "PENDING" : ok ? "SUCCESS" : "ISSUES"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{errors}</td>
                  <td className="px-4 py-3 text-center">{warnings}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    {sitemap.contents?.[0]?.submitted ?? "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-center">
                      <button
                        disabled={deleteSitemap.isPending}
                        onClick={() => handleDelete(sitemap.path ?? "")}
                        className="text-xl text-red-600 transition hover:scale-110 disabled:opacity-50"
                        title="Remove from Search Console"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GscSitemapsTab;
