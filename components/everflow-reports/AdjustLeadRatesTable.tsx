import React, { useState, useMemo, useEffect } from "react";
import {
  useFindAllAdjustLeadRate,
  useDeleteAdjustLeadRate,
  useUpdateAdjustLeadRate,
} from "../../react-query/adjust-lead-rate";
import { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { countries } from "../../data/country";
import {
  FaEdit,
  FaTrash,
  FaGlobe,
  FaMoneyBillWave,
  FaBullhorn,
  FaLayerGroup,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { useGetCampaigns } from "../../react-query";

type GroupByOption = "country" | "campaignId" | "convertedCurrency";

const groupByOptions = [
  { label: "Country", value: "country" },
  { label: "Campaign ID", value: "campaignId" },
  { label: "Converted Currency", value: "convertedCurrency" },
];

const AdjustLeadRatesTable = () => {
  const { data: rates, isLoading, refetch } = useFindAllAdjustLeadRate();
  const deleteMutation = useDeleteAdjustLeadRate();
  const updateMutation = useUpdateAdjustLeadRate();
  const smartLinks = useGetCampaigns({ campaign_name: "TH" });

  const [groupBy, setGroupBy] = useState<GroupByOption>("country");
  const [editingRate, setEditingRate] = useState<AdjustLeadRate | null>(null);
  const [newRateValue, setNewRateValue] = useState<number | null>(null);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync({ id });
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete.", "error");
      }
    }
  };

  const openEditModal = (rate: AdjustLeadRate) => {
    setEditingRate(rate);
    setNewRateValue(rate.rate);
  };

  useEffect(() => {
    refetch();
  }, []);

  const handleUpdate = async () => {
    if (editingRate && newRateValue !== null) {
      try {
        await updateMutation.mutateAsync({
          id: editingRate.id,
          rate: newRateValue,
        });
        setEditingRate(null);
        Swal.fire("Updated!", "Rate has been updated.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to update.", "error");
      }
    }
  };

  const groupedData = useMemo(() => {
    if (!rates) return {};

    return rates.reduce(
      (acc, rate) => {
        let key = "";
        if (groupBy === "country") key = rate.country;
        else if (groupBy === "campaignId") key = rate.campaignId;
        else if (groupBy === "convertedCurrency") key = rate.convertedCurrency;

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(rate);
        return acc;
      },
      {} as Record<string, AdjustLeadRate[]>,
    );
  }, [rates, groupBy]);

  const getCountryFlag = (countryName: string) => {
    const country = countries.find(
      (c) => c.country.toLowerCase() === countryName.toLowerCase(),
    );
    return country?.flag;
  };

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex w-9/12 flex-col gap-6 rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <FaMoneyBillWave className="text-green-500" />
          Adjust Lead Rates
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <FaLayerGroup className="text-blue-500" /> Group By:
          </label>
          <Dropdown
            value={groupBy}
            options={groupByOptions}
            onChange={(e) => setGroupBy(e.value)}
            className="w-48"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(groupedData).map(([groupKey, groupRates]) => (
          <div
            key={groupKey}
            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-3 text-white">
              {groupBy === "country" && (
                <>
                  {getCountryFlag(groupKey) ? (
                    <img
                      src={getCountryFlag(groupKey)}
                      alt={groupKey}
                      className="h-6 w-8 rounded object-cover shadow-sm"
                    />
                  ) : (
                    <FaGlobe className="text-xl" />
                  )}
                  <span className="text-lg font-bold">{groupKey}</span>
                </>
              )}
              {groupBy === "campaignId" && (
                <>
                  <FaBullhorn className="text-xl" />
                  <span className="text-lg font-bold">
                    Campaign: {groupKey}
                  </span>
                </>
              )}
              {groupBy === "convertedCurrency" && (
                <>
                  <FaMoneyBillWave className="text-xl" />
                  <span className="text-lg font-bold">
                    Currency: {groupKey}
                  </span>
                </>
              )}
              <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-600">
                {groupRates.length} Items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Type</th>

                    {groupBy !== "country" && (
                      <th className="px-6 py-3">Country</th>
                    )}
                    {groupBy !== "campaignId" && (
                      <th className="px-6 py-3">Campaign ID</th>
                    )}
                    <th className="px-6 py-3">Target Currency</th>
                    <th className="px-6 py-3">Converted Currency</th>
                    <th className="px-6 py-3">Rate</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {groupRates.map((rate) => {
                    const campaign = smartLinks.data?.find(
                      (c) => c.network_campaign_id === Number(rate.campaignId),
                    );
                    return (
                      <tr
                        key={rate.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {rate.type}
                          </span>
                        </td>
                        {groupBy !== "country" && (
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {getCountryFlag(rate.country) && (
                                <img
                                  src={getCountryFlag(rate.country)}
                                  alt={rate.country}
                                  className="h-4 w-6 rounded object-cover"
                                />
                              )}
                              {rate.country}
                            </div>
                          </td>
                        )}
                        {groupBy !== "campaignId" && (
                          <td className="px-6 py-4">
                            {campaign?.campaign_name ?? rate.campaignId}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {rate.targetCurrency}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {rate.convertedCurrency}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {rate.rate.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(rate)}
                              className="rounded-full bg-yellow-100 p-2 text-yellow-600 transition-colors hover:bg-yellow-200 hover:text-yellow-700"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(rate.id)}
                              className="rounded-full bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 hover:text-red-700"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {Object.keys(groupedData).length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <FaLayerGroup className="mb-3 text-4xl text-gray-300" />
            <p>No adjust lead rates found.</p>
          </div>
        )}
      </div>

      <Dialog
        header="Update Rate"
        visible={!!editingRate}
        style={{ width: "30vw", minWidth: "300px" }}
        onHide={() => setEditingRate(null)}
        footer={
          <div className="flex  justify-end gap-3">
            <Button
              label="Cancel"
              onClick={() => setEditingRate(null)}
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
            <label htmlFor="rate" className="font-semibold text-gray-700">
              New Rate
            </label>
            <InputNumber
              id="rate"
              value={newRateValue}
              onValueChange={(e) => setNewRateValue(e.value ?? null)}
              mode="decimal"
              minFractionDigits={1}
              maxFractionDigits={10}
              className="w-full"
              inputClassName="w-full p-2 border rounded"
            />
          </div>
          {editingRate && (
            <div className="text-sm text-gray-500">
              <p>Country: {editingRate.country}</p>
              <p>Campaign: {editingRate.campaignId}</p>
              <p>
                {editingRate.targetCurrency} ➔ {editingRate.convertedCurrency}
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default AdjustLeadRatesTable;
