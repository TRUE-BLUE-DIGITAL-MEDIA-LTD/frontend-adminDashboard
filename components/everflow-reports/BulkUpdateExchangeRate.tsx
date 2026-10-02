import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import moment from "moment-timezone";
import { countries, Countries } from "../../data/country";
import {
  useGetCampaigns,
  useGetPartners,
  useUpdateBulkExchangeRate,
} from "../../react-query/partner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  ConversionRawData,
  ResponseCampaign,
} from "../../services/everflow/partner";
import { useCreateAdjustLeadRate } from "../../react-query";
import Swal from "sweetalert2";
import { ErrorMessages, Partner } from "../../models";
import { MultiSelect } from "primereact/multiselect";
import PopupLayout from "../../layouts/PopupLayout";

type Props = {
  onClose: () => void;
};

type Country = Countries[number];

const fieldClass =
  "w-full rounded-lg border border-line bg-surface/40 text-sm text-fg";
const labelClass = "text-xs font-medium text-fg-muted";
const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-fg-subtle";
const panelClass = "oxy-overlay-panel border border-line bg-panel text-fg";

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
        disabled
          ? "cursor-not-allowed border-line bg-surface/20 opacity-40"
          : selected
            ? "border-main-color/60 bg-main-color/10 ring-1 ring-main-color/40"
            : "border-line bg-surface/40 hover:border-line-strong hover:bg-hover"
      }`}
    >
      <span className="text-sm font-semibold text-fg">{title}</span>
      <span className="text-xs text-fg-subtle">{description}</span>
    </button>
  );
}

function BulkUpdateExchangeRate({ onClose }: Props) {
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(() => {
    const today = moment().format("YYYY-MM-DD");
    return [moment(today).toDate(), moment(today).toDate()];
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState<string>(moment.tz.guess());

  const timezones = moment.tz.names().map((tz) => ({ label: tz, value: tz }));

  const partners = useGetPartners({
    limit: 100,
    page: 1,
  });
  const [selectRateType, setSelectRateType] = useState<"Custom" | "Fixed">(
    "Custom",
  );
  const smartLinks = useGetCampaigns({ campaign_name: "TH" });
  const createAdjustLeadRateMutation = useCreateAdjustLeadRate();
  // Multi-select in "once" mode; "live" mode uses only the first item.
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [selectPartner, setSelectPartner] = useState<Partner[]>([]);
  const [selectedSmartLinks, setSelectedSmartLinks] = useState<
    ResponseCampaign[]
  >([]);
  const [rate, setRate] = useState<string>("");
  const [results, setResults] = useState<ConversionRawData[] | null>(null);
  const [currencyTargets, setCurrencyTargets] = useState<string[]>([]);
  const [currentcyConverted, setCurrencyConverted] = useState<string>("");
  const [updateType, setUpdateType] = useState<"once" | "live">("once");
  const currencies = [
    { label: "THB", value: "THB" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
  ];

  const { mutateAsync } = useUpdateBulkExchangeRate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchToLive = () => {
    setUpdateType("live");
    setSelectRateType("Custom");
    setSelectedCountries((prev) => prev.slice(0, 1));
    setSelectedSmartLinks((prev) => prev.slice(0, 1));
    setCurrencyTargets((prev) => prev.slice(0, 1));
  };

  const handleSubmit = async () => {
    if (updateType === "once") {
      if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
        alert("Please select a date range");
        return;
      }

      if (!startTime || !endTime) {
        alert("Please select a start and end time");
        return;
      }

      if (!timezone) {
        alert("Please select a timezone");
        return;
      }

      if (selectPartner.length === 0) {
        alert("Please select at least one partner");
        return;
      }
    }

    if (selectedCountries.length === 0) {
      alert("Please select at least one country");
      return;
    }

    if (!rate || isNaN(Number(rate))) {
      alert("Please enter a valid rate");
      return;
    }

    if (currencyTargets.length === 0) {
      alert("Please select at least one target currency");
      return;
    }

    if (!currentcyConverted) {
      alert("Please select a converted currency");
      return;
    }

    setIsSubmitting(true);
    try {
      if (updateType === "live") {
        const selectedSmartLink = selectedSmartLinks[0];
        if (!selectedSmartLink) {
          alert("Please select a smart link");
          return;
        }

        let liveStartDate: Date | undefined = undefined;
        let liveEndDate: Date | undefined = undefined;

        if (dates && dates[0]) {
          const sd = moment.tz(moment(dates[0]).format("YYYY-MM-DD"), timezone);
          if (startTime) {
            sd.hour(startTime.getHours())
              .minute(startTime.getMinutes())
              .second(startTime.getSeconds());
          }
          liveStartDate = sd.toDate();
        }

        if (dates && dates[1]) {
          const ed = moment.tz(moment(dates[1]).format("YYYY-MM-DD"), timezone);
          if (endTime) {
            ed.hour(endTime.getHours())
              .minute(endTime.getMinutes())
              .second(endTime.getSeconds());
          } else {
            // If end date but no end time, assume end of day? Or just 00:00:00
          }
          liveEndDate = ed.toDate();
        }

        await createAdjustLeadRateMutation.mutateAsync({
          country: selectedCountries[0].country,
          rate: Number(rate),
          type: selectRateType === "Fixed" ? "fixed" : "exchange",
          targetCurrency: currencyTargets[0],
          convertedCurrency: currentcyConverted,
          campaignId: String(selectedSmartLink.network_campaign_id),
          ...(liveStartDate && { startDate: liveStartDate.toISOString() }),
          ...(liveEndDate && { endDate: liveEndDate.toISOString() }),
        });
      } else {
        if (!dates || !dates[0] || !dates[1] || !startTime || !endTime) return;
        const data = await mutateAsync({
          startDate: moment(dates[0]).format("YYYY-MM-DD"),
          endDate: moment(dates[1]).format("YYYY-MM-DD"),
          startTime: moment(startTime).format("HH:mm:ss"),
          endTime: moment(endTime).format("HH:mm:ss"),
          timezone: timezone,
          countries: selectedCountries.map((c) => c.country),
          rate: Number(rate),
          isFixRate: selectRateType === "Fixed" ? true : false,
          currency_ids: currencyTargets,
          currency_converted_id: currentcyConverted,
          everflow_partner_ids: selectPartner.map((a) => a.affiliateId),
          // Empty means any smart link.
          campaign_ids: selectedSmartLinks.map((s) =>
            s.network_campaign_id.toString(),
          ),
        });
        setResults(data);
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Exchange rate updated successfully",
      });
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryTemplate = (option: Country, props: any) => {
    if (option) {
      return (
        <div className="flex items-center">
          <img
            alt={option.country}
            src={option.flag}
            className="mr-2 h-5 w-7 object-cover"
          />
          <div>{option.country}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const countryOptionTemplate = (option: Country) => {
    return (
      <div className="flex items-center">
        <img
          alt={option.country}
          src={option.flag}
          className="mr-2 h-5 w-7 object-cover"
        />
        <div>{option.country}</div>
      </div>
    );
  };

  if (results) {
    return (
      <PopupLayout
        onClose={onClose}
        title="Update results"
        subtitle="Review conversions affected by this rate update"
        maxWidthClassName="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResults(null)}
              className="rounded-full border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-fg transition hover:bg-hover"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white"
            >
              Close
            </button>
          </>
        }
      >
        <DataTable value={results} paginator rows={5} className="w-full">
          <Column field="conversion_id" header="Conversion ID" sortable />
          <Column field="currency_id" header="Currency ID" sortable />
          <Column
            body={(rowData: ConversionRawData) => {
              const payout = parseFloat(rowData.payout || "0");
              return payout.toFixed(2);
            }}
            header="Payout"
            sortable
          />
          <Column
            header="Calculated Payout"
            body={(rowData: ConversionRawData) => {
              if (selectRateType === "Fixed") {
                return parseFloat(rowData.fixed_rate || rate || "0").toFixed(2);
              }
              const payout = parseFloat(rowData.payout || "0");
              const exchangeRate = parseFloat(
                rowData.exchange_rate || rate || "0",
              );
              return (payout * exchangeRate).toFixed(2);
            }}
            sortable
          />
        </DataTable>
      </PopupLayout>
    );
  }

  return (
    <PopupLayout
      onClose={onClose}
      title="Update exchange rate"
      subtitle="Create a one-time or live lead rate adjustment"
      maxWidthClassName="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-fg transition hover:bg-hover"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update rate"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Update mode</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChoiceCard
              selected={updateType === "once"}
              onClick={() => setUpdateType("once")}
              title="Once"
              description="Apply to conversions in a date range"
            />
            <ChoiceCard
              selected={updateType === "live"}
              onClick={switchToLive}
              title="Live"
              description="Create an ongoing adjust-lead-rate rule"
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>
            Schedule
            {updateType === "live" ? (
              <span className="ml-2 font-normal normal-case tracking-normal text-fg-subtle">
                optional for live
              </span>
            ) : null}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Date range</label>
              <Calendar
                value={dates}
                onChange={(e) => setDates(e.value as Nullable<(Date | null)[]>)}
                selectionMode="range"
                className={fieldClass}
                inputClassName="w-full rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm text-fg"
                panelClassName={panelClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Time range</label>
              <div className="flex items-center gap-2">
                <Calendar
                  value={startTime}
                  onChange={(e) => setStartTime(e.value as Date | null)}
                  timeOnly
                  className={`flex-1 ${fieldClass}`}
                  inputClassName="w-full rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm text-fg"
                  panelClassName={panelClass}
                  placeholder={
                    updateType === "live" ? "Start (optional)" : "Start"
                  }
                />
                <span className="text-fg-subtle">€“</span>
                <Calendar
                  value={endTime}
                  onChange={(e) => setEndTime(e.value as Date | null)}
                  timeOnly
                  className={`flex-1 ${fieldClass}`}
                  inputClassName="w-full rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm text-fg"
                  panelClassName={panelClass}
                  placeholder={
                    updateType === "live" ? "End (optional)" : "End"
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className={labelClass}>Timezone</label>
              <Dropdown
                value={timezone}
                onChange={(e) => setTimezone(e.value)}
                options={timezones}
                optionLabel="label"
                placeholder="Select a timezone"
                filter
                className={fieldClass}
                panelClassName={panelClass}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Targeting</h3>
          {updateType === "once" && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200/90">
              Leave Smart Link empty to match any smart link.
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Country</label>
              {updateType === "once" ? (
                <MultiSelect
                  value={selectedCountries}
                  onChange={(e) => setSelectedCountries(e.value)}
                  options={countries}
                  optionLabel="country"
                  placeholder="Select country(s)"
                  filter
                  showClear
                  display="chip"
                  itemTemplate={countryOptionTemplate}
                  className={fieldClass}
                  panelClassName={panelClass}
                />
              ) : (
                <Dropdown
                  value={selectedCountries[0] ?? null}
                  onChange={(e) =>
                    setSelectedCountries(e.value ? [e.value] : [])
                  }
                  options={countries}
                  optionLabel="country"
                  placeholder="Select a country"
                  filter
                  valueTemplate={selectedCountryTemplate}
                  itemTemplate={countryOptionTemplate}
                  className={fieldClass}
                  panelClassName={panelClass}
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Smart Link</label>
              {updateType === "once" ? (
                <MultiSelect
                  value={selectedSmartLinks}
                  onChange={(e) => setSelectedSmartLinks(e.value)}
                  options={smartLinks.data}
                  optionLabel="campaign_name"
                  placeholder="Any smart link"
                  filter
                  showClear
                  display="chip"
                  className={fieldClass}
                  panelClassName={panelClass}
                  loading={smartLinks.isLoading}
                />
              ) : (
                <Dropdown
                  value={selectedSmartLinks[0] ?? null}
                  onChange={(e) =>
                    setSelectedSmartLinks(e.value ? [e.value] : [])
                  }
                  options={smartLinks.data}
                  optionLabel="campaign_name"
                  placeholder="Select a smart link"
                  filter
                  showClear
                  className={fieldClass}
                  panelClassName={panelClass}
                  loading={smartLinks.isLoading}
                />
              )}
            </div>
            {updateType === "once" && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className={labelClass}>Partner</label>
                <MultiSelect
                  value={selectPartner}
                  onChange={(e) => {
                    setSelectPartner(e.value);
                  }}
                  options={partners.data?.data}
                  optionLabel="name"
                  showClear
                  placeholder="Select partner(s)"
                  filter
                  className={fieldClass}
                  panelClassName={panelClass}
                  loading={partners.isLoading}
                />
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Rate</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChoiceCard
              selected={selectRateType === "Custom"}
              onClick={() => setSelectRateType("Custom")}
              title="Custom"
              description="Multiply payout by exchange rate"
            />
            <ChoiceCard
              selected={selectRateType === "Fixed"}
              onClick={() => setSelectRateType("Fixed")}
              title="Fixed"
              description="Pay a fixed amount per conversion"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Target currency</label>
              {updateType === "once" ? (
                <MultiSelect
                  value={currencyTargets}
                  onChange={(e) => setCurrencyTargets(e.value)}
                  options={currencies}
                  optionLabel="label"
                  placeholder="Select target currency(s)"
                  showClear
                  display="chip"
                  className={fieldClass}
                  panelClassName={panelClass}
                />
              ) : (
                <Dropdown
                  value={currencyTargets[0] ?? null}
                  onChange={(e) => setCurrencyTargets(e.value ? [e.value] : [])}
                  options={currencies}
                  optionLabel="label"
                  placeholder="Select target currency"
                  className={fieldClass}
                  panelClassName={panelClass}
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Convert to</label>
              <Dropdown
                value={currentcyConverted}
                onChange={(e) => setCurrencyConverted(e.value)}
                options={currencies}
                optionLabel="label"
                placeholder="Select convert-to currency"
                className={fieldClass}
                panelClassName={panelClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className={labelClass}>
                {selectRateType === "Fixed" ? "Fixed amount" : "Exchange rate"}
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder={
                  selectRateType === "Fixed"
                    ? "Enter fixed amount"
                    : "Enter rate"
                }
                className="h-11 w-full max-w-xs rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-main-color focus:ring-1 focus:ring-main-color/40"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              {selectRateType === "Fixed" && (
                <p className="text-xs text-fg-subtle">
                  Example: pay partner 70 THB. Enter 70.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </PopupLayout>
  );
}

export default BulkUpdateExchangeRate;
