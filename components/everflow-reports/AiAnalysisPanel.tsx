import moment from "moment";
import { Nullable } from "primereact/ts-helpers";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoMdClose } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import {
  AiAnalysisLanguage,
  AiAnalysisResponse,
  GetAiAnalysisService,
} from "../../services/everflow/aiAnalysis";
import { Partner, User } from "../../models";

const LANGUAGE_STORAGE_KEY = "aiAnalysisLanguage";

function getStoredLanguage(): AiAnalysisLanguage {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "th"
    ? "th"
    : "en";
}

const formatPayout = (payout: number) =>
  "$" +
  payout.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function AiAnalysisPanel({
  dates,
  timezone,
  user,
  onClose,
}: {
  dates: Nullable<(Date | null)[]>;
  timezone: string | undefined;
  user: User & { partner: Partner | null };
  onClose: () => void;
}) {
  const [language, setLanguage] =
    useState<AiAnalysisLanguage>(getStoredLanguage);

  const formatRange = () => ({
    start: moment(dates?.[0]).format("YYYY-MM-DD"),
    end: moment(dates?.[1]).format("YYYY-MM-DD"),
  });

  const [analyzedRange, setAnalyzedRange] = useState(formatRange);

  // A query, not a mutation: the panel auto-runs on open, and a mutation
  // fired from a mount effect never delivers its result under StrictMode
  // (the MutationObserver detaches from the in-flight mutation when the
  // simulated unmount drops its last listener, and cannot re-attach).
  // Queries dedupe through the cache and are StrictMode-safe. The query
  // reads the captured `analyzedRange`, not live `dates`: changing dates
  // must never silently re-run the analysis or mislabel the header.
  const analysis = useQuery<AiAnalysisResponse, { message?: string }>({
    queryKey: ["aiAnalysis", analyzedRange, language, timezone],
    queryFn: () =>
      GetAiAnalysisService({
        startDate: moment(analyzedRange.start).toDate(),
        endDate: moment(analyzedRange.end).toDate(),
        timezone: timezone,
        language: language,
      }),
    enabled: !!timezone,
    staleTime: Infinity,
    retry: false,
  });

  const handleReanalyze = () => {
    const next = formatRange();
    if (next.start === analyzedRange.start && next.end === analyzedRange.end) {
      analysis.refetch();
    } else {
      setAnalyzedRange(next);
    }
  };

  const handleLanguageChange = (lang: AiAnalysisLanguage) => {
    setLanguage(lang);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const data = analysis.data;
  const showLoading = analysis.isPending || analysis.isFetching;

  return (
    <div className="w-10/12 rounded-lg bg-white p-5 ring-1 ring-gray-200">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-black">
          <BsStars className="text-purple-600" />
          AI Analysis
          <span className="text-sm font-normal text-gray-500">
            {analyzedRange.start} → {analyzedRange.end}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded border border-gray-300 text-sm">
            {(["en", "th"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                disabled={showLoading}
                className={`px-3 py-1 font-semibold uppercase ${
                  language === lang
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            onClick={handleReanalyze}
            disabled={showLoading}
            className="rounded bg-purple-600 px-3 py-1 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Re-analyze
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <IoMdClose size={20} />
          </button>
        </div>
      </div>

      {showLoading && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="h-6 w-2/3 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-4 w-full animate-pulse rounded-lg bg-gray-100"></div>
          <div className="h-4 w-5/6 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-4 w-4/6 animate-pulse rounded-lg bg-gray-100"></div>
        </div>
      )}

      {!showLoading && analysis.isError && (
        <h3 className="mt-4 font-semibold text-red-600">
          {analysis.error?.message ?? "Analysis failed. Please try again."}
        </h3>
      )}

      {!showLoading && data?.noData && (
        <p className="mt-4 text-gray-600">No data for this date range.</p>
      )}

      {!showLoading && data && !data.noData && (
        <div className="mt-4 flex flex-col gap-4">
          {data.headline && (
            <p className="text-base font-semibold text-black">
              {data.headline}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {data.leaders.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-bold text-black">🏆 Top performers</h3>
                <ul className="flex flex-col gap-2">
                  {data.leaders.map((leader, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      <span className="font-semibold text-black">
                        {leader.name}
                      </span>{" "}
                      — {formatPayout(leader.payout)}
                      <p className="text-gray-500">{leader.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.countries.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-bold text-black">🌍 Hot countries</h3>
                <ul className="flex flex-col gap-2">
                  {data.countries.map((country, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      <span className="font-semibold text-black">
                        {country.country}
                      </span>
                      <p className="text-gray-500">{country.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.bestHours.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-bold text-black">⏰ Best hours</h3>
                <ul className="flex flex-col gap-2">
                  {data.bestHours.map((hour, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      <span className="font-semibold text-black">
                        {hour.country
                          ? `${hour.country} · ${hour.range}`
                          : hour.range}
                      </span>
                      <p className="text-gray-500">{hour.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {data.insights.length > 0 && (
            <div>
              <h3 className="mb-2 font-bold text-black">💡 Insights</h3>
              <ul className="list-inside list-disc text-sm text-gray-700">
                {data.insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AiAnalysisPanel;
