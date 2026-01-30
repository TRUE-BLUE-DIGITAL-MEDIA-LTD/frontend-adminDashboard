import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import moment from "moment";
import { countries, Countries } from "../../data/country";
import {
  useGetCampaigns,
  useGetPartners,
  useUpdateBulkExchangeRate,
} from "../../react-query/partner";
import { CiCalendarDate } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RadioButton } from "primereact/radiobutton";
import {
  FaMoneyBillWave,
  FaExchangeAlt,
  FaGlobe,
  FaLink,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import {
  ConversionRawData,
  ResponseCampaign,
} from "../../services/everflow/partner";
import { useCreateAdjustLeadRate } from "../../react-query";
import Swal from "sweetalert2";
import { ErrorMessages, Partner } from "../../models";
import { FaPeopleGroup } from "react-icons/fa6";

type Props = {
  onClose: () => void;
};

type Country = Countries[number];

function BulkUpdateExchangeRate({ onClose }: Props) {
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(() => {
    const today = moment().format("YYYY-MM-DD");
    return [moment(today).toDate(), moment(today).toDate()];
  });
  const partners = useGetPartners({
    limit: 100,
    page: 1,
  });
  const smartLinks = useGetCampaigns({ campaign_name: "TH" });
  const createAdjustLeadRateMutation = useCreateAdjustLeadRate();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectPartner, setSelectPartner] = useState<Partner | null>(null);
  const [selectedSmartLink, setSelectedSmartLink] =
    useState<ResponseCampaign | null>(null);
  const [rate, setRate] = useState<string>("");
  const [results, setResults] = useState<ConversionRawData[] | null>(null);
  const [currencyTarget, setCurrencyTarget] = useState<string>("");
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

  const handleSubmit = async () => {
    if (updateType === "once") {
      if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
        alert("Please select a date range");
        return;
      }
    }

    if (!selectedCountry) {
      alert("Please select a country");
      return;
    }

    if (!rate || isNaN(Number(rate))) {
      alert("Please enter a valid rate");
      return;
    }

    if (!currencyTarget) {
      alert("Please select a target currency");
      return;
    }

    if (!currentcyConverted) {
      alert("Please select a converted currency");
      return;
    }

    if (currencyTarget === currentcyConverted) {
      alert("Target currency and converted currency cannot be the same");
      return;
    }

    setIsSubmitting(true);
    try {
      if (updateType === "live") {
        if (!selectedSmartLink) {
          alert("Please select a smart link");
          return;
        }
        await createAdjustLeadRateMutation.mutateAsync({
          country: selectedCountry.country,
          rate: Number(rate),
          targetCurrency: currencyTarget,
          convertedCurrency: currentcyConverted,
          campaignId: String(selectedSmartLink.network_campaign_id),
        });
      } else {
        if (!dates || !dates[0] || !dates[1]) return;
        const data = await mutateAsync({
          startDate: moment(dates[0]).format("YYYY-MM-DD"),
          endDate: moment(dates[1]).format("YYYY-MM-DD"),
          country: selectedCountry.country,
          target_currency: Number(rate),
          currency_id: currencyTarget,
          currency_converted_id: currentcyConverted,
          ...(selectPartner && {
            everflow_partner_id: selectPartner.affiliateId,
          }),
          ...(selectedSmartLink && {
            campaign_id: selectedSmartLink.network_campaign_id.toString(),
          }),
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
      <div className="relative flex w-11/12 max-w-5xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
        >
          <IoMdClose />
        </button>

        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <FaCheckCircle className="text-green-500" />
          Update Results
        </h2>

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
              const payout = parseFloat(rowData.payout || "0");
              const exchangeRate = parseFloat(
                rowData.exchange_rate || rate || "0",
              );
              return (payout * exchangeRate).toFixed(2);
            }}
            sortable
          />
        </DataTable>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setResults(null)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-5/6 w-11/12 flex-col gap-6 overflow-auto rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg md:w-7/12">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
      >
        <IoMdClose />
      </button>

      <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <FaMoneyBillWave className="text-green-500" />
        Update Exchange Rate
      </h2>

      <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <label className="flex items-center gap-2 font-semibold text-gray-700">
          <FaExchangeAlt className="text-blue-500" /> Update Type
        </label>
        <div className="flex gap-4">
          <div className="flex items-center">
            <RadioButton
              inputId="updateOnce"
              name="updateType"
              value="once"
              onChange={(e) => setUpdateType(e.value)}
              checked={updateType === "once"}
            />
            <label htmlFor="updateOnce" className="ml-2 cursor-pointer">
              Update once time
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="updateLive"
              name="updateType"
              value="live"
              onChange={(e) => setUpdateType(e.value)}
              checked={updateType === "live"}
            />
            <label htmlFor="updateLive" className="ml-2 cursor-pointer">
              Update live
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {updateType === "once" && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700">
              <FaCalendarAlt className="text-orange-500" /> Select Date Range
            </label>
            <Calendar
              value={dates}
              onChange={(e) => setDates(e.value)}
              selectionMode="range"
              className="border"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <FaGlobe className="text-blue-500" /> Select Country
          </label>

          <Dropdown
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.value)}
            options={countries}
            optionLabel="country"
            placeholder="Select a Country"
            filter
            valueTemplate={selectedCountryTemplate}
            itemTemplate={countryOptionTemplate}
            className="w-full border"
          />
        </div>

        {updateType === "once" && (
          <div className="col-span-1 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-700 md:col-span-2">
            <span className="font-bold">Note:</span> You can only select either
            selectedSmartLink or selectPartner.
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <FaLink className="text-purple-500" /> Select Smart Link
          </label>
          <Dropdown
            value={selectedSmartLink}
            onChange={(e) => {
              setSelectedSmartLink(e.value);
              if (e.value) setSelectPartner(null);
            }}
            options={smartLinks.data}
            optionLabel="campaign_name"
            placeholder="Select a Smart Link"
            filter
            showClear
            className="w-full border"
            loading={smartLinks.isLoading}
          />
        </div>
        {updateType === "once" && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700">
              <FaPeopleGroup className="text-green-600" /> Select Partner
            </label>
            <Dropdown
              value={selectPartner}
              onChange={(e) => {
                setSelectPartner(e.value);
                if (e.value) setSelectedSmartLink(null);
              }}
              options={partners.data?.data}
              optionLabel="name"
              showClear
              placeholder="Select a Partner"
              filter
              className="w-full border"
              loading={partners.isLoading}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <FaMoneyBillWave className="text-green-500" /> Target Currency
          </label>
          <Dropdown
            value={currencyTarget}
            onChange={(e) => setCurrencyTarget(e.value)}
            options={currencies}
            optionLabel="label"
            placeholder="Select Target Currency"
            className="w-full border"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <FaExchangeAlt className="text-indigo-500" /> Convert To
          </label>
          <Dropdown
            value={currentcyConverted}
            onChange={(e) => setCurrencyConverted(e.value)}
            options={currencies.filter((c) => c.value !== currencyTarget)}
            optionLabel="label"
            placeholder="Select Convert To Currency"
            className="w-full border"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <FaMoneyBillWave className="text-yellow-500" /> Exchange Rate
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="Enter rate"
            className="h-12 w-60 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Rate"}
        </button>
      </div>
    </div>
  );
}

export default BulkUpdateExchangeRate;
