import { Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { formatPct } from "./format";
import { GetLanderAnalyticsDetailService } from "../../services/admin/analytics";

const EXIT_LABELS: Record<string, string> = {
  clicked_through: "Clicked through",
  back: "Back button",
  closed: "Closed / left",
  unknown: "Unknown",
};

const EXIT_COLORS: Record<string, string> = {
  clicked_through: "bg-green-500",
  back: "bg-amber-500",
  closed: "bg-red-500",
  unknown: "bg-gray-400",
};

function Bar({
  label,
  count,
  total,
  color = "bg-blue-500",
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-1 flex items-center gap-2 text-sm">
      <span className="w-44 truncate" title={label}>
        {label}
      </span>
      <div className="h-4 flex-1 rounded bg-gray-100">
        <div
          className={`h-4 rounded ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 text-right text-gray-600">
        {count} ({pct}%)
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export default function LanderDetailPanel({
  landingPageId,
  from,
  to,
  live = false,
}: {
  landingPageId: string;
  from: string;
  to?: string;
  live?: boolean;
}) {
  const detail = useQuery({
    queryKey: ["lander-analytics-detail", landingPageId, from, to],
    queryFn: () => GetLanderAnalyticsDetailService(landingPageId, { from, to }),
    refetchInterval: live ? 5000 : false,
  });

  if (detail.isLoading) {
    return <Skeleton variant="rectangular" height={200} className="mt-6" />;
  }
  if (!detail.data) return null;
  const d = detail.data;

  return (
    <div className="mt-6">
      <h2 className="mb-1 text-xl font-bold">
        {d.landingPageName ?? d.landingPageId}
        <span className="ml-2 text-sm font-normal text-gray-500">
          {d.domainName ?? ""} · {d.views} views · bounce {formatPct(d.bounceRate)}
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="What visitors did">
          {d.exitBreakdown.map((e) => (
            <Bar
              key={e.exitType}
              label={EXIT_LABELS[e.exitType] ?? e.exitType}
              count={e.count}
              total={d.views}
              color={EXIT_COLORS[e.exitType]}
            />
          ))}
        </Section>
        <Section title="New vs returning">
          {d.identifiedViews > 0 ? (
            <>
              <Bar
                label="New"
                count={d.identifiedViews - d.returningViews}
                total={d.identifiedViews}
              />
              <Bar
                label="Returning"
                count={d.returningViews}
                total={d.identifiedViews}
                color="bg-purple-500"
              />
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No visitor data in this range (collected from deploy day onward).
            </p>
          )}
        </Section>
        {d.funnel.length > 0 && (
          <Section title={`Step funnel${d.funnelSampled ? " (sampled)" : ""}`}>
            {d.funnel.map((s) => (
              <Bar
                key={s.stepId}
                label={s.label ?? s.stepId}
                count={s.count}
                total={d.views}
              />
            ))}
          </Section>
        )}
        <Section title="Devices">
          {d.devices.map((x) => (
            <Bar key={x.device} label={x.device} count={x.count} total={d.views} />
          ))}
        </Section>
        <Section title="Top countries">
          {d.countries.map((x) => (
            <Bar
              key={x.country ?? "unknown"}
              label={x.country ?? "Unknown"}
              count={x.count}
              total={d.views}
            />
          ))}
        </Section>
        <Section title="Top referrers">
          {d.referrers.map((x) => (
            <Bar
              key={x.referrer ?? "direct"}
              label={x.referrer ?? "Direct / none"}
              count={x.count}
              total={d.views}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}
