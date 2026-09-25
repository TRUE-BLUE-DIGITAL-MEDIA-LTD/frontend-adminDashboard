import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import moment from "moment-timezone";
import Swal from "sweetalert2";
import { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { useUpdateAdjustLeadRate } from "../../react-query/adjust-lead-rate";
import { countries } from "../../data/country";
import { ResponseCampaign } from "../../services/everflow/partner";
import { ErrorMessages } from "../../models";
import PopupLayout from "../../layouts/PopupLayout";

// PrimeReact Calendar only works with browser-local Dates, so schedule times
// travel as "wall-clock" Dates: the displayed h/m/s equal the time in the
// selected timezone, regardless of the browser's zone.
export const utcToWallDate = (iso: string, tz: string): Date => {
  const m = moment.tz(iso, tz);
  return new Date(
    m.year(),
    m.month(),
    m.date(),
    m.hour(),
    m.minute(),
    m.second(),
  );
};

export const wallDateToUtcIso = (d: Date, tz: string): string =>
  moment
    .tz(
      {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
      },
      tz,
    )
    .toISOString();

// The wall-clock shell Date cannot represent every instant: a time inside the
// browser's spring-forward gap gets normalised forward an hour, and an
// ambiguous fall-back hour in the selected zone always resolves to the earlier
// offset. So the stored ISO is kept alongside the shell Date and a field is
// only ever re-derived from the Calendar once the admin actually edits it.
export type DateFieldState = {
  value: Date | null;
  originalIso: string | null;
  dirty: boolean;
};

export const initDateField = (
  iso: string | null | undefined,
  tz: string,
): DateFieldState => ({
  value: iso ? utcToWallDate(iso, tz) : null,
  originalIso: iso ?? null,
  dirty: false,
});

export const markDateField = (
  field: DateFieldState,
  value: Date | null,
): DateFieldState => ({ ...field, value, dirty: true });

// An untouched field sends its stored instant back verbatim, so opening the
// dialog to change only the rate can never shift a schedule by an hour.
export const outgoingIso = (
  field: DateFieldState,
  tz: string,
): string | null =>
  field.dirty
    ? field.value
      ? wallDateToUtcIso(field.value, tz)
      : null
    : field.originalIso;

// Switching timezone is display-only: an untouched field re-derives from the
// stored instant (exact), an edited one round-trips through the previous zone.
export const retimeDateField = (
  field: DateFieldState,
  fromTz: string,
  toTz: string,
): DateFieldState => ({
  ...field,
  value: field.dirty
    ? field.value
      ? utcToWallDate(wallDateToUtcIso(field.value, fromTz), toTz)
      : null
    : field.originalIso
      ? utcToWallDate(field.originalIso, toTz)
      : null,
});

type Props = {
  rate: AdjustLeadRate | null;
  smartLinks: ResponseCampaign[] | undefined;
  smartLinksLoading: boolean;
  onClose: () => void;
};

const currencyOptions = ["THB", "USD", "EUR", "GBP"].map((c) => ({
  label: c,
  value: c,
}));

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
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition ${
        selected
          ? "border-main-color/60 bg-main-color/10 ring-1 ring-main-color/40"
          : "border-line bg-surface/40 hover:border-line-strong hover:bg-hover"
      }`}
    >
      <span className="text-sm font-semibold text-fg">{title}</span>
      <span className="text-xs text-fg-subtle">{description}</span>
    </button>
  );
}

function EditAdjustLeadRateDialog({
  rate,
  smartLinks,
  smartLinksLoading,
  onClose,
}: Props) {
  const updateMutation = useUpdateAdjustLeadRate();

  const [type, setType] = useState<"fixed" | "exchange">("exchange");
  const [rateValue, setRateValue] = useState<number | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<string>("");
  const [convertedCurrency, setConvertedCurrency] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [timezone, setTimezone] = useState<string>(moment.tz.guess());
  const [startDate, setStartDate] = useState<DateFieldState>(
    initDateField(null, timezone),
  );
  const [endDate, setEndDate] = useState<DateFieldState>(
    initDateField(null, timezone),
  );

  const timezoneOptions = moment.tz
    .names()
    .map((tz) => ({ label: tz, value: tz }));
  const campaignOptions = (smartLinks ?? []).map((c) => ({
    label: c.campaign_name,
    value: String(c.network_campaign_id),
  }));
  const countryOptions = countries.map((c) => ({
    label: c.country,
    value: c.country,
  }));

  useEffect(() => {
    if (!rate) return;
    const tz = moment.tz.guess();
    setType(rate.type);
    setRateValue(rate.rate);
    setTargetCurrency(rate.targetCurrency);
    setConvertedCurrency(rate.convertedCurrency);
    setCampaignId(rate.campaignId);
    setCountry(rate.country);
    setTimezone(tz);
    setStartDate(initDateField(rate.startDate, tz));
    setEndDate(initDateField(rate.endDate, tz));
  }, [rate]);

  // Re-display the same instants as wall-clock in the new zone.
  const handleTimezoneChange = (newTz: string) => {
    setStartDate((f) => retimeDateField(f, timezone, newTz));
    setEndDate((f) => retimeDateField(f, timezone, newTz));
    setTimezone(newTz);
  };

  const handleUpdate = async () => {
    if (!rate) return;
    if (rateValue === null || isNaN(rateValue)) {
      Swal.fire("Error!", "Please enter a valid rate.", "error");
      return;
    }
    if (!campaignId || !country || !targetCurrency || !convertedCurrency) {
      Swal.fire("Error!", "All fields except dates are required.", "error");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        type,
        rate: rateValue,
        targetCurrency,
        convertedCurrency,
        campaignId,
        country,
        startDate: outgoingIso(startDate, timezone),
        endDate: outgoingIso(endDate, timezone),
      });
      onClose();
      Swal.fire("Updated!", "Rate has been updated.", "success");
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ?? "Error!",
        text: result.message?.toString() ?? "Failed to update.",
        icon: "error",
      });
    }
  };

  if (!rate) return null;

  return (
    <PopupLayout
      onClose={onClose}
      title="Edit lead rate"
      subtitle="Update rate values and schedule without shifting untouched times"
      maxWidthClassName="max-w-2xl"
      zIndexClassName="z-[60]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-fg transition hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={updateMutation.isPending}
            onClick={handleUpdate}
            className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Rate type</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChoiceCard
              selected={type === "exchange"}
              onClick={() => setType("exchange")}
              title="Custom"
              description="Multiply payout by exchange rate"
            />
            <ChoiceCard
              selected={type === "fixed"}
              onClick={() => setType("fixed")}
              title="Fixed"
              description="Pay a fixed amount per conversion"
            />
          </div>
          {type === "fixed" && (
            <p className="text-xs text-fg-subtle">
              Example: Italy โฌ4 = pay partner 70 THB. Enter 70.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Value & currency</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="editRate" className={labelClass}>
                {type === "fixed" ? "Fixed amount" : "Exchange rate"}
              </label>
              <InputNumber
                id="editRate"
                value={rateValue}
                onValueChange={(e) => setRateValue(e.value ?? null)}
                mode="decimal"
                minFractionDigits={1}
                maxFractionDigits={10}
                className="w-full max-w-xs"
                inputClassName="w-full rounded-lg border border-line bg-surface/40 px-3 py-2.5 text-sm text-fg"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Target currency</label>
              <Dropdown
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.value)}
                options={currencyOptions}
                className={fieldClass}
                panelClassName={panelClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Convert to</label>
              <Dropdown
                value={convertedCurrency}
                onChange={(e) => setConvertedCurrency(e.value)}
                options={currencyOptions}
                className={fieldClass}
                panelClassName={panelClass}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Targeting</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Campaign</label>
              <Dropdown
                value={campaignId}
                onChange={(e) => setCampaignId(e.value)}
                options={campaignOptions}
                filter
                loading={smartLinksLoading}
                placeholder={campaignId}
                className={fieldClass}
                panelClassName={panelClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Country</label>
              <Dropdown
                value={country}
                onChange={(e) => setCountry(e.value)}
                options={countryOptions}
                filter
                className={fieldClass}
                panelClassName={panelClass}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className={sectionLabelClass}>Schedule</h3>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Timezone</label>
            <Dropdown
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.value)}
              options={timezoneOptions}
              filter
              className={fieldClass}
              panelClassName={panelClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Start date</label>
              <div className="flex items-center gap-2">
                <Calendar
                  value={startDate.value}
                  onChange={(e) =>
                    setStartDate((f) =>
                      markDateField(f, (e.value as Date) ?? null),
                    )
                  }
                  showTime
                  hourFormat="24"
                  className={`flex-1 ${fieldClass}`}
                  inputClassName="w-full rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm text-fg"
                  panelClassName={panelClass}
                  placeholder="No start date"
                />
                {startDate.value ? (
                  <button
                    type="button"
                    onClick={() => setStartDate((f) => markDateField(f, null))}
                    className="rounded-lg px-2 py-2 text-xs text-fg-muted hover:bg-hover hover:text-fg"
                    title="Clear (rule starts immediately)"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>End date</label>
              <div className="flex items-center gap-2">
                <Calendar
                  value={endDate.value}
                  onChange={(e) =>
                    setEndDate((f) =>
                      markDateField(f, (e.value as Date) ?? null),
                    )
                  }
                  showTime
                  hourFormat="24"
                  className={`flex-1 ${fieldClass}`}
                  inputClassName="w-full rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm text-fg"
                  panelClassName={panelClass}
                  placeholder="No end date"
                />
                {endDate.value ? (
                  <button
                    type="button"
                    onClick={() => setEndDate((f) => markDateField(f, null))}
                    className="rounded-lg px-2 py-2 text-xs text-fg-muted hover:bg-hover hover:text-fg"
                    title="Clear (rule never expires)"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          {!startDate.value && !endDate.value ? (
            <div className="rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-xs text-fg-muted">
              No dates = rule is always active.
            </div>
          ) : null}
        </section>
      </div>
    </PopupLayout>
  );
}

export default EditAdjustLeadRateDialog;
