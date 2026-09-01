import { Skeleton, TextField } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { MdSettings } from "react-icons/md";
import {
  InputUpdateDomainService,
  ResponseGetDomainService,
} from "../../services/admin/domain";

type DomainSettingsSectionProps = {
  domainData: InputUpdateDomainService;
  setDomainData: React.Dispatch<React.SetStateAction<InputUpdateDomainService>>;
  getDomain: UseQueryResult<ResponseGetDomainService, Error>;
  onEnableMail: () => void;
  canEnableMail: boolean;
};

function DomainSettingsSection({
  domainData,
  setDomainData,
  getDomain,
  onEnableMail,
  canEnableMail,
}: DomainSettingsSectionProps) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-gray-800">
        <MdSettings className="text-blue-600" /> Domain Settings
      </h2>
      {getDomain.isFetching && !getDomain.data ? (
        <Skeleton variant="rectangular" height={200} className="rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextField
            onChange={(e) =>
              setDomainData((prev) => ({
                ...prev,
                googleAnalyticsId: e.target.value,
              }))
            }
            value={domainData?.googleAnalyticsId || ""}
            className="w-full"
            name="googleAnalyticsId"
            label="Google Analytics ID"
            variant="outlined"
          />
          <TextField
            disabled
            value={getDomain.data?.domain.sitemap_status || ""}
            className="w-full bg-gray-50"
            label="Google Site Status"
            variant="outlined"
          />
          <TextField
            disabled
            value={getDomain.data?.domain.google_domain_id || ""}
            className="w-full bg-gray-50"
            label="Google ID Verify"
            variant="outlined"
          />
          <TextField
            disabled
            value={getDomain.data?.domain.netlify_dns_zoneId || ""}
            className="w-full bg-gray-50"
            label="Netlify DNSZone ID"
            variant="outlined"
          />
          <TextField
            disabled
            value={getDomain.data?.domain.netlify_siteId || ""}
            className="w-full bg-gray-50"
            label="Netlify Site ID"
            variant="outlined"
          />
          <TextField
            disabled
            value={getDomain.data?.domain.dns_servers?.join(" - ") || ""}
            className="w-full bg-gray-50"
            label="Netlify DNS Server"
            variant="outlined"
          />
          <div className="col-span-1 md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Note
            </label>
            <textarea
              onChange={(e) =>
                setDomainData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              value={domainData?.note || ""}
              className="h-32 w-full resize-none rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              name="note"
              placeholder="Add notes about this domain..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4 md:col-span-2">
            <div>
              <p className="font-medium text-gray-800">Inbound Mail</p>
              <p className="text-sm text-gray-500">
                {getDomain.data?.domain.mailEnabled
                  ? "Enabled — mail to any address on this domain appears in the Inbox."
                  : "Disabled — this domain cannot receive mail."}
              </p>
            </div>
            {getDomain.data?.domain.mailEnabled ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Enabled
              </span>
            ) : canEnableMail ? (
              <button
                onClick={onEnableMail}
                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 active:scale-95"
              >
                Enable mail
              </button>
            ) : (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600">
                Disabled
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default DomainSettingsSection;
