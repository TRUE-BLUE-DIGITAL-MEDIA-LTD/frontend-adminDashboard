import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useFindAllAdjustLeadRate,
  useDeleteAdjustLeadRate,
} from "../../react-query/adjust-lead-rate";
import { AdjustLeadRate } from "../../services/adjust-lead-rate";
import { computeDisplayRates } from "./computeDisplayRates";
import { buildRateMatrix } from "./buildRateMatrix";
import LeadRatesMatrix from "./LeadRatesMatrix";
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
import EditAdjustLeadRateDialog from "./EditAdjustLeadRateDialog";
import { useGetCampaigns } from "../../react-query";
import { User } from "@/models";
import PopupLayout from "../../layouts/PopupLayout";

type GroupByOption = "country" | "campaignId" | "convertedCurrency";

const groupByOptions = [
  { label: "Country", value: "country" },
  { label: "Campaign ID", value: "campaignId" },
  { label: "Converted Currency", value: "convertedCurrency" },
];

const AdjustLeadRatesTable = ({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) => {
  const { data: rates, isLoading, refetch } = useFindAllAdjustLeadRate();
  const deleteMutation = useDeleteAdjustLeadRate();
  const smartLinks = useGetCampaigns({ campaign_name: "TH" });

  const [groupBy, setGroupBy] = useState<GroupByOption>("country");
  const [editingRate, setEditingRate] = useState<AdjustLeadRate | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "history">("active");

  // Role capabilities: admins/managers see all rates + history; partners/users
  // only ever see "Always Active" rates. Edit/delete remains admin-only.
  const canSeeHistory = user.role === "admin" || user.role === "manager";
  const canManage = user.role === "admin";

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
  };

  useEffect(() => {
    refetch();
  }, []);

  const displayRates = useMemo(
    () =>
      computeDisplayRates({
        rates,
        canSeeHistory,
        viewMode,
        now: new Date(),
      }),
    [rates, canSeeHistory, viewMode],
  );

  const [primaryView, setPrimaryView] = useState<"detailed" | "matrix">(
    "detailed",
  );
  const showMatrix = !canSeeHistory || primaryView === "matrix";

  // The matrix always uses the partner effective view (live temp replaces
  // its always-active twin), independent of the admin Active/History toggle.
  const matrix = useMemo(() => {
    const effective = computeDisplayRates({
      rates,
      canSeeHistory: false,
      viewMode: "active",
      now: new Date(),
    });
    const qualifying = effective.filter(
      (r) => r.convertedCurrency === "USD" || r.convertedCurrency === "THB",
    );
    return buildRateMatrix(qualifying);
  }, [rates]);

  const campaignName = useCallback(
    (campaignId: string) =>
      smartLinks.data?.find((c) => c.network_campaign_id === Number(campaignId))
        ?.campaign_name ?? campaignId,
    [smartLinks.data],
  );

  const groupedData = useMemo(() => {
    return displayRates.reduce(
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
  }, [displayRates, groupBy]);

  const getCountryFlag = (countryName: string) => {
    const country = countries.find(
      (c) => c.country.toLowerCase() === countryName.toLowerCase(),
    );
    return country?.flag;
  };

  const segmentBtn = (active: boolean) =>
    `border-0 px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-white/10 text-white"
        : "bg-transparent text-zinc-400 hover:text-white"
    }`;

  return (
    <PopupLayout
      onClose={onClose}
      title="Lead rates"
      subtitle="Browse active and historical adjust-lead-rate rules"
      maxWidthClassName="max-w-5xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
        >
          Close
        </button>
      }
    >
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-main-color"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {canSeeHistory && (
                <div
                  className="flex overflow-hidden rounded-full border border-white/10"
                  role="group"
                >
                  <button
                    type="button"
                    onClick={() => setPrimaryView("detailed")}
                    className={segmentBtn(primaryView === "detailed")}
                  >
                    Detailed
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimaryView("matrix")}
                    className={segmentBtn(primaryView === "matrix")}
                  >
                    Matrix
                  </button>
                </div>
              )}
              {canSeeHistory && !showMatrix && (
                <div
                  className="flex overflow-hidden rounded-full border border-white/10"
                  role="group"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("active")}
                    className={segmentBtn(viewMode === "active")}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("history")}
                    className={segmentBtn(viewMode === "history")}
                  >
                    History
                  </button>
                </div>
              )}
            </div>
            {!showMatrix && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-zinc-400">
                  Group by
                </label>
                <Dropdown
                  value={groupBy}
                  options={groupByOptions}
                  onChange={(e) => setGroupBy(e.value)}
                  className="w-48 rounded-lg border border-white/10 bg-black/40 text-sm text-zinc-200"
                  panelClassName="oxy-overlay-panel border border-white/10 bg-zinc-900 text-zinc-100"
                />
              </div>
            )}
          </div>

          {showMatrix ? (
            <LeadRatesMatrix matrix={matrix} campaignName={campaignName} />
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedData).map(([groupKey, groupRates]) => (
                <div
                  key={groupKey}
                  className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 bg-zinc-800/60 px-5 py-2.5 text-white">
                    {groupBy === "country" && (
                      <>
                        {getCountryFlag(groupKey) ? (
                          <img
                            src={getCountryFlag(groupKey)}
                            alt={groupKey}
                            className="h-5 w-7 rounded object-cover"
                          />
                        ) : (
                          <FaGlobe className="text-base text-zinc-400" />
                        )}
                        <span className="text-sm font-semibold">{groupKey}</span>
                      </>
                    )}
                    {groupBy === "campaignId" && (
                      <>
                        <FaBullhorn className="text-base text-zinc-400" />
                        <span className="text-sm font-semibold">
                          Campaign: {groupKey} (
                          {
                            smartLinks.data?.find(
                              (i) =>
                                i.network_campaign_id === Number(groupKey),
                            )?.campaign_name
                          }
                          )
                        </span>
                      </>
                    )}
                    {groupBy === "convertedCurrency" && (
                      <>
                        <FaMoneyBillWave className="text-base text-zinc-400" />
                        <span className="text-sm font-semibold">
                          Currency: {groupKey}
                        </span>
                      </>
                    )}
                    <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                      {groupRates.length} items
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                      <thead className="bg-zinc-900/50 text-[11px] uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-5 py-2.5">Type</th>
                          {groupBy !== "country" ? (
                            <th className="px-5 py-2.5">Country</th>
                          ) : null}
                          {groupBy !== "campaignId" ? (
                            <th className="px-5 py-2.5">Campaign ID</th>
                          ) : null}
                          <th className="px-5 py-2.5">Target Currency</th>
                          <th className="px-5 py-2.5">Converted Currency</th>
                          <th className="px-5 py-2.5">Rate</th>
                          <th className="px-5 py-2.5">Schedule</th>
                          {canManage ? (
                            <th className="px-5 py-2.5 text-right">Actions</th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-transparent">
                        {groupRates.map((rate) => {
                          const campaign = smartLinks.data?.find(
                            (c) =>
                              c.network_campaign_id ===
                              Number(rate.campaignId),
                          );
                          return (
                            <tr
                              key={rate.id}
                              className="transition-colors hover:bg-white/5"
                            >
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                                  {rate.type}
                                </span>
                              </td>
                              {groupBy !== "country" ? (
                                <td className="px-5 py-3 font-medium text-white">
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
                              ) : null}
                              {groupBy !== "campaignId" ? (
                                <td className="px-5 py-3">
                                  {campaign?.campaign_name ?? rate.campaignId}
                                </td>
                              ) : null}
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-300">
                                  {rate.targetCurrency}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                                  {rate.convertedCurrency}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-semibold text-white">
                                {rate.rate.toFixed(4)}
                              </td>
                              <td className="px-5 py-3 text-xs text-zinc-500">
                                {rate.startDate && (
                                  <div className="whitespace-nowrap">
                                    <span className="font-semibold">
                                      Start:
                                    </span>{" "}
                                    {new Date(rate.startDate).toLocaleString()}
                                  </div>
                                )}
                                {rate.endDate && (
                                  <div className="whitespace-nowrap">
                                    <span className="font-semibold">End:</span>{" "}
                                    {new Date(rate.endDate).toLocaleString()}
                                  </div>
                                )}
                                {!rate.startDate && !rate.endDate && (
                                  <span className="italic text-zinc-500">
                                    Always active
                                  </span>
                                )}
                              </td>
                              {canManage ? (
                                <td className="px-5 py-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(rate)}
                                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                                      title="Edit"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(rate.id)}
                                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-rose-400"
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              ) : null}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {Object.keys(groupedData).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                  <FaLayerGroup className="mb-3 text-4xl text-zinc-600" />
                  <p>
                    {canSeeHistory
                      ? `No ${viewMode === "active" ? "active" : "history"} adjust lead rates found.`
                      : "No adjust lead rates found."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <EditAdjustLeadRateDialog
        rate={editingRate}
        smartLinks={smartLinks.data}
        smartLinksLoading={smartLinks.isLoading}
        onClose={() => setEditingRate(null)}
      />
    </PopupLayout>
  );
};

export default AdjustLeadRatesTable;
