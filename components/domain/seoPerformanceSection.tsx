import React from "react";
import { FaChartLine } from "react-icons/fa6";
import { MdUpdate } from "react-icons/md";
import { Domain } from "../../models";
import SpinLoading from "../loadings/spinLoading";

type SeoPerformanceSectionProps = {
  domain: Domain | undefined;
  isLoading: boolean;
  onUpdateSeoScore: () => void;
};

const getScoreColor = (score: number | undefined | null) => {
  if (score === undefined || score === null)
    return "text-gray-400 border-gray-200";
  if (score >= 90) return "text-green-500 border-green-500";
  if (score >= 50) return "text-orange-500 border-orange-500";
  return "text-red-500 border-red-500";
};

const getScoreBgColor = (score: number | undefined | null) => {
  if (score === undefined || score === null) return "bg-gray-50";
  if (score >= 90) return "bg-green-50";
  if (score >= 50) return "bg-orange-50";
  return "bg-red-50";
};

const CircularScore = ({
  score,
  label,
}: {
  score: number | undefined | null;
  label: string;
}) => {
  const percent = (score ?? 0) * 100;
  const colorClass = getScoreColor(percent);
  const bgColorClass = getScoreBgColor(percent);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${colorClass} ${bgColorClass} shadow-sm`}
      >
        <span className="text-xl font-bold">
          {score !== undefined && score !== null ? percent.toFixed(0) : "N/A"}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </span>
    </div>
  );
};

function SeoPerformanceSection({
  domain,
  isLoading,
  onUpdateSeoScore,
}: SeoPerformanceSectionProps) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b pb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <FaChartLine className="text-green-600" /> SEO Performance
        </h2>
        <button
          onClick={onUpdateSeoScore}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <SpinLoading />
          ) : (
            <>
              <MdUpdate /> Update SEO Score
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-4 text-center text-sm font-semibold text-gray-700">
            Performance
          </span>
          <div className="flex justify-around px-2">
            <CircularScore
              score={domain?.performanceScoreDesktop}
              label="Desktop"
            />
            <div className="mx-2 h-16 w-px bg-gray-200"></div>
            <CircularScore
              score={domain?.performanceScoreMobile}
              label="Mobile"
            />
          </div>
        </div>
        <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-4 text-center text-sm font-semibold text-gray-700">
            Accessibility
          </span>
          <div className="flex justify-around px-2">
            <CircularScore
              score={domain?.accessibilityScoreDesktop}
              label="Desktop"
            />
            <div className="mx-2 h-16 w-px bg-gray-200"></div>
            <CircularScore
              score={domain?.accessibilityScoreMobile}
              label="Mobile"
            />
          </div>
        </div>
        <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-4 text-center text-sm font-semibold text-gray-700">
            Best Practices
          </span>
          <div className="flex justify-around px-2">
            <CircularScore
              score={domain?.bestPracticesScoreDesktop}
              label="Desktop"
            />
            <div className="mx-2 h-16 w-px bg-gray-200"></div>
            <CircularScore
              score={domain?.bestPracticesScoreMobile}
              label="Mobile"
            />
          </div>
        </div>
        <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-4 text-center text-sm font-semibold text-gray-700">
            SEO
          </span>
          <div className="flex justify-around px-2">
            <CircularScore score={domain?.seoScoreDesktop} label="Desktop" />
            <div className="mx-2 h-16 w-px bg-gray-200"></div>
            <CircularScore score={domain?.seoScoreMobile} label="Mobile" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeoPerformanceSection;
