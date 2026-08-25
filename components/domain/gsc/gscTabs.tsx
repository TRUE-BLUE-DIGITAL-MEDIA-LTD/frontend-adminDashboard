import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa6";
import { MdDomainVerification } from "react-icons/md";
import Swal from "sweetalert2";
import { User } from "../../../models";
import { useVerifyDomain } from "../../../react-query";
import GscPerformanceTab from "./gscPerformanceTab";
import GscSitemapsTab from "./gscSitemapsTab";
import GscUrlInspectionTab from "./gscUrlInspectionTab";

export type GscTabsProps = {
  domainId: string;
  domainName: string;
  user: User;
  googleDomainId: string | null | undefined;
};

const TABS = ["Performance", "URL Inspection", "Sitemaps"] as const;
type TabName = (typeof TABS)[number];

function GscTabs({ domainId, domainName, user, googleDomainId }: GscTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Performance");
  const queryClient = useQueryClient();
  const verifyGoogle = useVerifyDomain();

  const handleVerify = async () => {
    try {
      await verifyGoogle.mutateAsync({ domainId });
      // Reload the domain so google_domain_id is populated and the tabs render.
      await queryClient.refetchQueries({ queryKey: ["domain", domainId] });
      Swal.fire("Success", "Domain verified on Google Search Console", "success");
    } catch (error: any) {
      console.log(error);
      Swal.fire("Error!", error.message?.toString(), "error");
    }
  };

  if (!googleDomainId) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-gray-800">
          <FaGoogle className="text-blue-500" /> Google Search Console
        </h2>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            <span className="font-semibold">{domainName}</span> is not verified
            on Google Search Console yet. Verify it first to see search
            performance, URL inspection, and sitemaps.
          </p>
          <button
            disabled={verifyGoogle.isPending}
            onClick={handleVerify}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
          >
            <MdDomainVerification className="text-xl" />
            {verifyGoogle.isPending
              ? "Verifying... (DNS checks can take a minute)"
              : "Verify on Google Search Console"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-gray-800">
        <FaGoogle className="text-blue-500" /> Google Search Console
      </h2>
      <div className="mb-6 flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "Performance" && (
        <GscPerformanceTab domainId={domainId} />
      )}
      {activeTab === "URL Inspection" && (
        <GscUrlInspectionTab domainId={domainId} domainName={domainName} />
      )}
      {activeTab === "Sitemaps" && (
        <GscSitemapsTab domainId={domainId} isAdmin={user.role === "admin"} />
      )}
    </section>
  );
}

export default GscTabs;
