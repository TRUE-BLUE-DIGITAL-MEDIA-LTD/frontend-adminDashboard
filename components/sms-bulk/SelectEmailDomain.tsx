import { UseQueryResult } from "@tanstack/react-query";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";
import Swal from "sweetalert2";
import { SmsBulkEmailDomainItem } from "../../models";
import { useCreateSmsBulkEmail, useGetSmsBulkEmailDomains } from "../../react-query";
import { ResponseGetSmsBulkEmailService } from "../../services/sms-bulk-email";
import { showSmsBulkError } from "./SmsTab";

type Props = { activeEmails: UseQueryResult<ResponseGetSmsBulkEmailService, Error> };

function normaliseSite(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function SelectEmailDomain({ activeEmails }: Props) {
  const [siteInput, setSiteInput] = useState("");
  const [site, setSite] = useState("");
  const [domain, setDomain] = useState<SmsBulkEmailDomainItem | null>(null);
  const [loading, setLoading] = useState(false);
  const buy = useCreateSmsBulkEmail();
  const domains = useGetSmsBulkEmailDomains({ site });

  const domainTemplate = (option: SmsBulkEmailDomainItem) => (
    <div className="flex w-96 items-center justify-between gap-2">
      <span>
        {option.name} <span className="text-xs text-gray-400">{option.count} in stock</span>
      </span>
      <span className="font-semibold">${option.price.toFixed(2)}</span>
    </div>
  );

  const handleBuy = async () => {
    if (!site || !domain) return;
    try {
      setLoading(true);
      await buy.mutateAsync({ site, domain: domain.name });
      await activeEmails.refetch();
      Swal.fire({ title: "Success", text: "Email address has been reserved.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-gray-100 p-5 font-Poppins">
      <div className="flex w-96 gap-2">
        <input
          value={siteInput}
          onChange={(e) => setSiteInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSite(normaliseSite(siteInput));
              setDomain(null);
            }
          }}
          placeholder="Target site (e.g. telegram.com)"
          className="h-10 min-w-0 flex-1 rounded border px-2 text-sm"
        />
        <button
          onClick={() => {
            setSite(normaliseSite(siteInput));
            setDomain(null);
          }}
          className="h-10 rounded border bg-white px-3 text-sm hover:bg-gray-800 hover:text-white"
        >
          Find domains
        </button>
      </div>
      <Dropdown
        value={domain}
        onChange={(e: DropdownChangeEvent) => setDomain(e.value)}
        filter
        disabled={!site}
        options={(domains.data ?? []).filter((d) => d.count > 0)}
        loading={domains.isLoading}
        optionLabel="name"
        dataKey="name"
        placeholder={site ? "Select an email domain" : "Enter a site first"}
        className="w-96 border"
        itemTemplate={domainTemplate}
      />
      <div className="flex h-6 w-96 items-center justify-end text-sm text-gray-600">
        {domain ? `Price: $${domain.price.toFixed(2)}` : ""}
      </div>
      <button
        onClick={handleBuy}
        disabled={!site || !domain || loading}
        className="h-10 w-96 rounded-md bg-gradient-to-r from-neutral-300 to-stone-400 text-white transition hover:from-neutral-400 hover:to-stone-600 active:scale-105 disabled:opacity-50"
      >
        {loading ? "Loading.." : "BUY"}
      </button>
    </div>
  );
}

export default SelectEmailDomain;
