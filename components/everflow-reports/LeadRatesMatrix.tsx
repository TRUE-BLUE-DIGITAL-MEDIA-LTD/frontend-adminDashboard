import React from "react";
import { FaGlobe } from "react-icons/fa";
import { countries as countryData } from "../../data/country";
import { RateMatrix } from "./buildRateMatrix";
import { formatRate } from "./formatRate";

const getCountryFlag = (countryName: string) =>
  countryData.find(
    (c) => c.country.toLowerCase() === countryName.toLowerCase(),
  )?.flag;

const LeadRatesMatrix = ({
  matrix,
  campaignName,
}: {
  matrix: RateMatrix;
  campaignName: (campaignId: string) => string;
}) => {
  const columns = [...matrix.campaignIds].sort((a, b) =>
    campaignName(a).localeCompare(campaignName(b)),
  );

  if (matrix.countries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
        <FaGlobe className="mb-3 text-4xl text-zinc-600" />
        <p>No rates found.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/10">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 bg-zinc-800/90 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Country
            </th>
            {columns.map((id) => (
              <th
                key={id}
                className="sticky top-0 z-10 whitespace-nowrap border-l border-white/5 bg-zinc-800/90 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-300"
              >
                {campaignName(id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.countries.map((country) => (
            <tr
              key={country}
              className="border-b border-white/5 transition hover:bg-white/5"
            >
              <th className="sticky left-0 z-10 whitespace-nowrap bg-zinc-900 px-4 py-2 text-left font-semibold text-white">
                <div className="flex items-center gap-2">
                  {getCountryFlag(country) && (
                    <img
                      src={getCountryFlag(country)}
                      alt={country}
                      className="h-4 w-6 rounded object-cover"
                    />
                  )}
                  {country}
                </div>
              </th>
              {columns.map((id) => {
                const rate = matrix.cell(country, id);
                return (
                  <td
                    key={id}
                    className="whitespace-nowrap border-l border-white/5 px-4 py-2 font-medium text-zinc-200"
                  >
                    {rate ? (
                      formatRate(rate)
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadRatesMatrix;