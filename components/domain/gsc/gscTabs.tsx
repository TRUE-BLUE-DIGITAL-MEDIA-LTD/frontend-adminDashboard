import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa6";
import { User } from "../../../models";
import GscPerformanceTab from "./gscPerformanceTab";
import GscSitemapsTab from "./gscSitemapsTab";
import GscUrlInspectionTab from "./gscUrlInspectionTab";

export type GscTabsProps = {
  domainId: string;
  domainName: string;
  user: User;
};

const TABS = ["Performance", "URL Inspection", "Sitemaps"] as const;
type TabName = (typeof TABS)[number];

function GscTabs({ domainId, domainName, user }: GscTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Performance");

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
