import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import moment from "moment";
import { countries, Countries } from "../../data/country";
import { useUpdateBulkExchangeRate } from "../../react-query/partner";
import { CiCalendarDate } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConversionRawData } from "../../services/everflow/partner";

type Props = {
  onClose: () => void;
};

type Country = Countries[number];

function BulkUpdateExchangeRate({ onClose }: Props) {
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(() => {
    const today = moment().format("YYYY-MM-DD");
    return [moment(today).toDate(), moment(today).toDate()];
  });

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [rate, setRate] = useState<string>("");
  const [results, setResults] = useState<ConversionRawData[] | null>(null);

  const { mutateAsync } = useUpdateBulkExchangeRate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      alert("Please select a date range");
      return;
    }

    if (!selectedCountry) {
      alert("Please select a country");
      return;
    }

    if (!rate || isNaN(Number(rate))) {
      alert("Please enter a valid rate");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await mutateAsync({
        startDate: moment(dates[0]).format("YYYY-MM-DD"),
        endDate: moment(dates[1]).format("YYYY-MM-DD"),
        country: selectedCountry.country,
        target_currency: Number(rate),
      });
      setResults(data);
    } catch (error) {
      console.error("Error updating rates:", error);
      alert("Failed to update rate. Please try again.");
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
      <div className="relative flex w-11/12 max-w-5xl flex-col gap-5 rounded-lg bg-white p-5 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
        >
          <IoMdClose />
        </button>

        <h2 className="text-xl font-bold">Update Results</h2>

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
    <div className="relative flex w-11/12 max-w-lg flex-col gap-5 rounded-lg bg-white p-5 shadow-lg md:w-3/4">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-700"
      >
        <IoMdClose />
      </button>

      <h2 className="text-xl font-bold">Update Exchange Rate</h2>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 font-semibold">
          Select Date Range <CiCalendarDate />
        </label>
        <Calendar
          value={dates}
          onChange={(e) => setDates(e.value)}
          selectionMode="range"
          className="w-full"
          showIcon
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold">Select Country</label>
        <Dropdown
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.value)}
          options={countries}
          optionLabel="country"
          placeholder="Select a Country"
          filter
          valueTemplate={selectedCountryTemplate}
          itemTemplate={countryOptionTemplate}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold">Exchange Rate</label>
        <input
          type="number"
          step="0.0001"
          placeholder="Enter rate"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
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
