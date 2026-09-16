import React from "react";
import { MdSpeed, MdUpdate } from "react-icons/md";
import { RegionLatest } from "../../models";
import SpinLoading from "../loadings/spinLoading";
import { formatSeconds, loadColorClass, probeAge, regionGroup, RegionGroup } from "./speedFormat";

type Props = {
  latest: RegionLatest[];
  isLoading: boolean;
  isProbing: boolean;
  onProbeNow: () => void;
};

const GROUPS: RegionGroup[] = ["United States", "Europe", "Other"];

function Cell({ ms }: { ms: number | null }) {
  return (
    <td className="px-2 py-1">
      <span className={`inline-block min-w-16 rounded border px-2 py-0.5 text-center text-sm font-semibold ${loadColorClass(ms)}`}>
        {formatSeconds(ms)}
      </span>
    </td>
  );
}

function Row({ item }: { item: RegionLatest }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-2 py-1 font-mono text-xs text-gray-700">{item.region}</td>
      {item.status === "FAILED" ? (
        <td colSpan={3} className="px-2 py-1 text-sm text-red-600">
          Failed: {item.error ?? "unknown error"}
        </td>
      ) : (
        <>
          <Cell ms={item.ttfbMs} />
          <Cell ms={item.loadMs} />
          <Cell ms={item.lcpMs} />
        </>
      )}
      <td className="px-2 py-1 text-xs text-gray-500">{probeAge(item.probedAt)}</td>
    </tr>
  );
}

function SpeedByRegionSection({ latest, isLoading, isProbing, onProbeNow }: Props) {
  const grouped = GROUPS.map((group) => ({
    group,
    rows: latest.filter((l) => regionGroup(l.region) === group),
  })).filter((g) => g.rows.length > 0);

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b pb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <MdSpeed className="text-blue-600" /> Load Speed by Region
        </h2>
        <button
          onClick={onProbeNow}
          disabled={isProbing}
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 active:scale-95 disabled:opacity-50"
        >
          {isProbing ? <SpinLoading /> : <><MdUpdate /> Probe now</>}
        </button>
      </div>
      {isLoading ? (
        <SpinLoading />
      ) : latest.length === 0 ? (
        <p className="text-sm text-gray-500">No regions configured.</p>
      ) : (
        <table className="w-full text-left">
          <thead className="text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-2 py-1">Region</th>
              <th className="px-2 py-1">TTFB</th>
              <th className="px-2 py-1">Load</th>
              <th className="px-2 py-1">LCP</th>
              <th className="px-2 py-1">Age</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ group, rows }) => (
              <React.Fragment key={group}>
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-2 py-1 text-sm font-semibold text-gray-700">{group}</td>
                </tr>
                {rows.map((item) => <Row key={item.region} item={item} />)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default SpeedByRegionSection;
