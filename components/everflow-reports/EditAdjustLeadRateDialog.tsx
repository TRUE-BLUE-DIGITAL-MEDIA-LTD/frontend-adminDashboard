import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import moment from "moment-timezone";
import Swal from "sweetalert2";
import { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { useUpdateAdjustLeadRate } from "../../react-query/adjust-lead-rate";
import { countries } from "../../data/country";
import { ResponseCampaign } from "../../services/everflow/partner";
import { ErrorMessages } from "../../models";

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

  return (
    <Dialog
      header="Edit Lead Rate"
      visible={!!rate}
      style={{ width: "40vw", minWidth: "340px" }}
      onHide={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            label="Cancel"
            onClick={onClose}
            className="p-button-text h-9 w-32 rounded-md border text-gray-600"
          />
          <Button
            disabled={updateMutation.isPending}
            label={updateMutation.isPending ? "Updating..." : "Update"}
            onClick={handleUpdate}
            autoFocus
            className="p-button-text h-9 w-32 rounded-md border bg-blue-500 text-white"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Rate Type</label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <RadioButton
                inputId="editRateCustom"
                name="editRateType"
                value="exchange"
                onChange={(e) => setType(e.value)}
                checked={type === "exchange"}
              />
              <label htmlFor="editRateCustom" className="ml-2 cursor-pointer">
                Custom Rate
              </label>
            </div>
            <div className="flex items-center">
              <RadioButton
                inputId="editRateFixed"
                name="editRateType"
                value="fixed"
                onChange={(e) => setType(e.value)}
                checked={type === "fixed"}
              />
              <label htmlFor="editRateFixed" className="ml-2 cursor-pointer">
                Fixed Amount
              </label>
            </div>
          </div>
          {type === "fixed" && (
            <small className="text-gray-500">
              Example: Italy €4 = pay partner 70 THB. Enter 70.
            </small>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="editRate" className="font-semibold text-gray-700">
            {type === "fixed" ? "Fixed Amount" : "Exchange Rate"}
          </label>
          <InputNumber
            id="editRate"
            value={rateValue}
            onValueChange={(e) => setRateValue(e.value ?? null)}
            mode="decimal"
            minFractionDigits={1}
            maxFractionDigits={10}
            className="w-full"
            inputClassName="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">
              Target Currency
            </label>
            <Dropdown
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.value)}
              options={currencyOptions}
              className="w-full border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Convert To</label>
            <Dropdown
              value={convertedCurrency}
              onChange={(e) => setConvertedCurrency(e.value)}
              options={currencyOptions}
              className="w-full border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Campaign</label>
            <Dropdown
              value={campaignId}
              onChange={(e) => setCampaignId(e.value)}
              options={campaignOptions}
              filter
              loading={smartLinksLoading}
              placeholder={campaignId}
              className="w-full border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Country</label>
            <Dropdown
              value={country}
              onChange={(e) => setCountry(e.value)}
              options={countryOptions}
              filter
              className="w-full border"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Time Zone</label>
          <Dropdown
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.value)}
            options={timezoneOptions}
            filter
            className="w-full border"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Start Date</label>
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
                className="w-full border"
                placeholder="No start date"
              />
              {startDate.value && (
                <Button
                  icon="pi pi-times"
                  onClick={() => setStartDate((f) => markDateField(f, null))}
                  className="p-button-text p-button-rounded text-gray-500"
                  tooltip="Clear (rule starts immediately)"
                  type="button"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">End Date</label>
            <div className="flex items-center gap-2">
              <Calendar
                value={endDate.value}
                onChange={(e) =>
                  setEndDate((f) => markDateField(f, (e.value as Date) ?? null))
                }
                showTime
                hourFormat="24"
                className="w-full border"
                placeholder="No end date"
              />
              {endDate.value && (
                <Button
                  icon="pi pi-times"
                  onClick={() => setEndDate((f) => markDateField(f, null))}
                  className="p-button-text p-button-rounded text-gray-500"
                  tooltip="Clear (rule never expires)"
                  type="button"
                />
              )}
            </div>
          </div>
        </div>
        {!startDate.value && !endDate.value && (
          <small className="italic text-gray-500">
            No dates = rule is always active.
          </small>
        )}
      </div>
    </Dialog>
  );
}

export default EditAdjustLeadRateDialog;
