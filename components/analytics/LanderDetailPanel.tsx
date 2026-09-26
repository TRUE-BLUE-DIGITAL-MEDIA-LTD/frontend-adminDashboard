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
  clicked_through: "bg-emerald-500",
  back: "bg-amber-500",
  closed: "bg-rose-500",
  unknown: "bg-fg-subtle",
};

function Bar({
  label,
  count,
  total,
  color = "bg-[#00ABE4]",
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-2 flex items-center gap-2 text-sm">
      <span className="w-36 truncate text-fg-muted sm:w-44" title={label}>
        {label}
      </span>
      <div className="h-2.5 flex-1 rounded-full bg-panel-raised">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right text-xs tabular-nums text-fg-subtle">
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
    <div className="rounded-xl border border-line bg-surface/30 p-4">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
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
    return (
      <div className="mt-2 animate-pulse space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded bg-panel-raised" />
          <div className="h-3 w-72 rounded bg-panel-raised" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-line bg-surface/30 p-4"
            >
              <div className="mb-3 h-3 w-28 rounded bg-panel-raised" />
              <div className="space-y-3">
                <div className="h-2.5 rounded-full bg-panel-raised" />
                <div className="h-2.5 w-[80%] rounded-full bg-panel-raised" />
                <div className="h-2.5 w-[60%] rounded-full bg-panel-raised" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!detail.data) return null;
  const d = detail.data;

  return (
    <div className="mt-1">
      <h2 className="mb-1 text-xl font-semibold tracking-tight text-fg">
        {d.landingPageName ?? d.landingPageId}
      </h2>
      <p className="mb-4 text-sm text-fg-subtle">
        {[
          d.domainName || null,
          `${d.views} views`,
          `bounce ${formatPct(d.bounceRate)}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                color="bg-violet-500"
              />
            </>
          ) : (
            <p className="text-sm text-fg-subtle">
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