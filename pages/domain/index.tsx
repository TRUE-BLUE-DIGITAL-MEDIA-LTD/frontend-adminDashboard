import { Pagination, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { IoMdPerson } from "react-icons/io";
import { IoSearchCircleSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import ListDomain from "../../components/domain/listDomain";
import DomainLinkAudit from "../../components/domain/domainLinkAudit";
import DomainCreate from "../../components/forms/domains/domainCreate";
import { loadingNumber } from "../../data/loadingNumber";
import DashboardLayout from "../../layouts/dashboardLayout";
import {
  DomainListSort,
  Partner,
  ResponsibilityOnPartner,
  SimCardOnPartner,
  User,
} from "../../models";
import {
  nextDomainListSort,
  parseDomainListSort,
} from "../../components/domain/domainListSort";
import {
  useGetDomainsByPage,
  useRepublishAllLanders,
  useRunSpeedSweep,
} from "../../react-query";
import { GetPartnerByMangegerService } from "../../services/admin/partner";
import { GetUser } from "../../services/admin/user";
import SpinLoading from "../../components/loadings/spinLoading";

function Index({ user }: { user: User & { partner: Partner } }) {
  const router = useRouter();
  const focusDomainId =
    typeof router.query.domainId === "string"
      ? router.query.domainId
      : undefined;
  // When arriving from the Link Audit page (?domainName=...), prefill the
  // search box so the list is filtered to that domain on first load.
  const focusDomainName =
    typeof router.query.domainName === "string" ? router.query.domainName : "";
  // List state lives in the URL (?search=&page=&partnerId=) so coming back
  // from a /domain/[domainId] page restores the same view. router.query is
  // populated on first render because this page uses getServerSideProps.
  const initialSearch =
    typeof router.query.search === "string"
      ? router.query.search
      : focusDomainName;
  const initialPage = Math.max(1, Number(router.query.page) || 1);
  const restorePartnerId =
    typeof router.query.partnerId === "string"
      ? router.query.partnerId
      : undefined;
  const [searchField, setSearchField] = useState<string>(initialSearch);
  const [page, setPage] = useState<number>(initialPage);
  const [sort, setSort] = useState<DomainListSort | undefined>(
    parseDomainListSort(router.query.sort),
  );
  const [selectPartner, setSelectPartner] = useState<Partner>();
  const [totalPage, setTotalPage] = useState(1);
  const [triggerCreateDomain, setTriggerCreateDomain] =
    useState<boolean>(false);

  const runSpeedSweep = useRunSpeedSweep();

  // Same job the 3AM cron enqueues: every landing-page domain in every
  // region. Keyed by UTC date, so clicking during a running sweep adds nothing.
  const handleRunSpeedSweep = async () => {
    const confirm = await Swal.fire({
      title: "Probe all domains?",
      text: "Queues a full speed sweep (every domain × every region). Results arrive over the next hour or so.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Run sweep",
    });
    if (!confirm.isConfirmed) return;
    try {
      const { enqueued, sweep } = await runSpeedSweep.mutateAsync();
      Swal.fire(
        "Sweep queued",
        `${enqueued.toLocaleString()} probes queued for sweep ${sweep}.`,
        "success",
      );
    } catch (err: any) {
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  const republishAll = useRepublishAllLanders();

  // Backfill / recovery: rebuild every domain's lander blob on Netlify.
  const handleRepublishAll = async () => {
    const confirm = await Swal.fire({
      title: "Republish all landers?",
      text: "Rebuilds every domain's lander blob on Netlify. Sites keep serving while this runs.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Republish",
    });
    if (!confirm.isConfirmed) return;
    try {
      const { enqueued } = await republishAll.mutateAsync();
      Swal.fire(
        "Republish queued",
        `${enqueued.toLocaleString()} domains queued.`,
        "success",
      );
    } catch (err: any) {
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  const domains = useGetDomainsByPage({
    page: page,
    searchField: searchField,
    partnerId: selectPartner?.id,
    filter:
      selectPartner?.id === "no-partner"
        ? "no-partner"
        : selectPartner?.id === "no-landing-page"
          ? "no-landing-page"
          : selectPartner?.id === "all"
            ? "all"
            : undefined,
    sort: sort,
  });

  const handleToggleLoadSort = () => {
    setSort((current) => nextDomainListSort(current));
    setPage(1);
  };

  useEffect(() => {
    if (domains.data) {
      setTotalPage(() => domains.data.totalPages);
    }
  }, [domains.data]);

  // Mirror list state into the URL (shallow: no reload, no gSSP re-run) so
  // browser back from a domain page lands on the same search/page/partner.
  useEffect(() => {
    const query: Record<string, string> = {};
    if (focusDomainId) query.domainId = focusDomainId;
    if (searchField) query.search = searchField;
    if (page > 1) query.page = String(page);
    if (sort) query.sort = sort;
    if (selectPartner?.id) query.partnerId = selectPartner.id;
    router.replace({ pathname: "/domain", query }, undefined, {
      shallow: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchField, page, sort, selectPartner?.id, focusDomainId]);

  const partners = useQuery({
    queryKey: ["partners-by-manager"],
    queryFn: () =>
      GetPartnerByMangegerService().then((response) => {
        let addSeeAll = [...response];
        if (user.role === "partner") {
          setSelectPartner(() => response[0]);
          return response;
        }
        addSeeAll.unshift({
          isAllowUsingSmsBerry: true,
          isAllowUsingSmsGetatext: true,
          isAllowManageSmsGetatextAccount: true,
          createAt: new Date(),
          updateAt: new Date(),
          affiliateId: "all",
          userId: "all",
          name: "See All",
          id: "all",
          managerId: "",
          isAllowUsingSMSPOOL: true,
          isAllowUsingSMSPVA: true,
          isAllowManageAssginCategory: true,
          isAllowBonuSystem: true,
          isAllowCloudPhone: true,
          isAllowManagePartner: true,
          isAllowManageAssignDomain: true,
          isAllowManageAssignPhoneNumber: true,
          isAllowManageSmsOxy: true,
          isAllowSmsPoolAccount: true,
          isAllowUsingSMS_TEXTVERIFIED: true,
          responsibilityOnPartner: new Array(domains.data?.totalDomain),
          simCardOnPartner: [],
          account: null,
          isAllowSmsPinverifyAccount: false,
          isAllowUsingSMS_Pinverify: false,
          refill_oxyclick_points: 0,
          currency_id: "",
          isAllowManageSmsBowerAccount: true,
          isAllowUsingSmsBower: true,
          isAllowDomainManage: true,
          isAllowLandingPageManage: true,
          isAllowOxySms: true,
        });
        addSeeAll.push({
          createAt: new Date(),
          isAllowUsingSmsBerry: true,
          isAllowUsingSmsGetatext: true,
          isAllowManageSmsGetatextAccount: true,
          currency_id: "",
          managerId: "",
          isAllowUsingSMS_TEXTVERIFIED: true,
          isAllowManageAssginCategory: true,
          isAllowManageAssignDomain: true,
          isAllowManageAssignPhoneNumber: true,
          isAllowManageSmsOxy: true,
          isAllowSmsPoolAccount: true,
          isAllowBonuSystem: true,
          isAllowCloudPhone: true,
          isAllowManagePartner: true,
          isAllowManageSmsBowerAccount: true,
          isAllowUsingSmsBower: true,
          updateAt: new Date(),
          affiliateId: "none",
          userId: "none",
          isAllowUsingSMSPOOL: true,
          name: "No Partner",
          refill_oxyclick_points: 20,
          id: "no-partner",
          isAllowUsingSMSPVA: true,
          account: null,
          responsibilityOnPartner: new Array(
            domains.data?.totalNoPartnerDomain,
          ),
          simCardOnPartner: [],
          isAllowSmsPinverifyAccount: false,
          isAllowUsingSMS_Pinverify: false,
          isAllowDomainManage: true,
          isAllowLandingPageManage: true,
          isAllowOxySms: true,
        });
        addSeeAll.push({
          createAt: new Date(),
          currency_id: "",
          isAllowUsingSmsBerry: true,
          isAllowUsingSmsGetatext: true,
          isAllowManageSmsGetatextAccount: true,
          managerId: "",
          isAllowUsingSMS_TEXTVERIFIED: true,
          isAllowManageAssginCategory: true,
          isAllowManageAssignDomain: true,
          isAllowManageAssignPhoneNumber: true,
          isAllowManageSmsOxy: true,
          isAllowSmsPoolAccount: true,
          isAllowBonuSystem: true,
          isAllowCloudPhone: true,
          isAllowManagePartner: true,
          isAllowManageSmsBowerAccount: true,
          isAllowUsingSmsBower: true,
          updateAt: new Date(),
          affiliateId: "none",
          userId: "none",
          isAllowUsingSMSPOOL: true,
          name: "No Landing Page",
          refill_oxyclick_points: 20,
          id: "no-landing-page",
          isAllowUsingSMSPVA: true,
          account: null,
          responsibilityOnPartner: [],
          simCardOnPartner: [],
          isAllowSmsPinverifyAccount: false,
          isAllowUsingSMS_Pinverify: false,
          isAllowDomainManage: true,
          isAllowLandingPageManage: true,
          isAllowOxySms: true,
        });

        // Restore the partner picked before navigating away (?partnerId=),
        // covering the pseudo entries (all / no-partner / no-landing-page).
        const restored = restorePartnerId
          ? addSeeAll.find((partner) => partner.id === restorePartnerId)
          : undefined;
        setSelectPartner(() => (restored ?? addSeeAll[0]) as Partner);
        return addSeeAll;
      }),
    enabled: domains.isSuccess,
  });

  return (
    <DashboardLayout user={user}>
      {triggerCreateDomain && (
        <DomainCreate
          domains={domains}
          setTriggerCreateDomain={setTriggerCreateDomain}
        />
      )}

      <div className="min-h-screen w-full bg-surface font-Poppins text-fg">
        <header className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-main-color">
            Infrastructure
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
            <span className="text-main-color">D</span>omains
          </h1>
          {(user.role === "admin" ||
            (user.role === "manager" &&
              user.partner.isAllowCreateDomain === true)) && (
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateDomain(() => true);
              }}
              className="rounded-full border border-fg bg-fg px-12 py-2.5 text-base font-semibold text-surface transition hover:border-main-color hover:bg-main-color hover:text-white active:scale-105"
            >
              Create
            </button>
          )}
          {/* {user.role === "admin" && (
            <>
              <button
                type="button"
                disabled={runSpeedSweep.isPending}
                onClick={handleRunSpeedSweep}
                className="rounded-full border border-line-strong bg-transparent px-8 py-2 text-sm font-semibold text-fg transition hover:border-main-color hover:bg-main-color/10 active:scale-105 disabled:opacity-50"
              >
                {runSpeedSweep.isPending ? "Queuing…" : "Probe all domains"}
              </button>
              <button
                type="button"
                disabled={republishAll.isPending}
                onClick={handleRepublishAll}
                className="rounded-full border border-line-strong bg-transparent px-8 py-2 text-sm font-semibold text-fg transition hover:border-main-color hover:bg-main-color/10 active:scale-105 disabled:opacity-50"
              >
                {republishAll.isPending ? "Queuing…" : "Republish all landers"}
              </button>
            </>
          )} */}
          <div className="flex w-full flex-wrap justify-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <label className="text-sm font-normal text-fg-muted">
                Search Domain
              </label>
              <SearchField
                value={searchField}
                onChange={(e) => {
                  setSearchField(() => e);
                  setPage(1);
                }}
                className="relative  flex w-96 flex-col"
              >
                <Input
                  placeholder="Search Domain Name Or Note"
                  className="h-10 w-full appearance-none rounded-full border border-line-strong bg-surface/40 p-5 pl-10 text-sm text-fg outline-0 ring-2 ring-main-color/30 lg:w-full"
                />
                <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
              </SearchField>
            </div>
            <div className="flex flex-col items-start gap-1">
              <label className="text-sm font-normal text-fg-muted">
                Select Partner
              </label>
              <Dropdown
                value={selectPartner}
                onChange={(e) => {
                  setPage(1);
                  setSelectPartner(() => e.value);
                }}
                itemTemplate={(
                  partner: Partner & {
                    responsibilityOnPartner: ResponsibilityOnPartner[];
                    simCardOnPartner: SimCardOnPartner[];
                  },
                ) => (
                  <div className="n flex w-full items-center gap-2">
                    <IoMdPerson />
                    <span>{partner.name}</span>
                    <span className="rounded-md bg-panel-raised px-2 py-1 text-xs text-fg">
                      Total {partner.responsibilityOnPartner.length}
                    </span>
                  </div>
                )}
                optionLabel="name"
                loading={partners.isLoading}
                options={partners.data ?? []}
                placeholder="Select Partner"
                className="h-10 w-96 rounded-full border border-line-strong bg-surface/40 text-left text-sm text-fg outline-0 ring-2 ring-main-color/30"
                panelClassName="oxy-overlay-panel"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto mt-2 flex w-full max-w-7xl flex-col items-center justify-center gap-5 px-4 pb-20 sm:px-6 lg:px-8">
          {focusDomainId && (
            <div className="w-full overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-none">
              <DomainLinkAudit domainId={focusDomainId} />
            </div>
          )}
          {domains.isFetching && <SpinLoading />}
          <div className="h-96 w-full overflow-hidden rounded-2xl border border-line bg-panel text-fg md:h-[36rem]">
            <div className="h-full w-full overflow-auto">
              <table className="w-max min-w-full border-collapse text-left text-sm">
                <thead className="border-b border-line text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
                  <tr className="sticky top-0 z-40 bg-surface/95 backdrop-blur">
                    <th className="px-4 py-3.5 font-semibold">Domain Name</th>
                    <th className="px-3 py-3.5 font-semibold">Updated At</th>
                    <th className="px-3 py-3.5 font-semibold">Site Status</th>
                    <th className="px-3 py-3.5 font-semibold">
                      Verify On Google
                    </th>
                    <th className="px-3 py-3.5 font-semibold">
                      Sitemap Status
                    </th>
                    <th className="px-3 py-3.5 font-semibold">DNS Status</th>
                    <th className="px-3 py-3.5 font-semibold">Nameserver</th>
                    <th className="px-3 py-3.5 font-semibold">Partners</th>
                    <th className="px-3 py-3.5 font-semibold">Landing Pages</th>
                    <th className="px-3 py-3.5 font-semibold">
                      Average SEO Score
                    </th>
                    <th className="px-3 py-3.5 font-semibold">
                      <button
                        type="button"
                        onClick={handleToggleLoadSort}
                        className="flex items-center gap-1 text-fg-muted transition hover:text-main-color"
                        title="Sort by worst load time across regions"
                      >
                        Worst load
                        {sort === "load-desc" && (
                          <span aria-label="slowest first">▼</span>
                        )}
                        {sort === "load-asc" && (
                          <span aria-label="fastest first">▲</span>
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {domains.isError && (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-8 text-center text-fg-subtle"
                      >
                        No domain found
                      </td>
                    </tr>
                  )}
                  {domains.data?.domains.map((list, index) => {
                    return (
                      <ListDomain
                        key={index}
                        list={list}
                        domains={domains}
                        user={user}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <div className="rounded-full border border-line-strong bg-panel-raised px-3 py-2">
              <Pagination
                onChange={(e, page) => setPage(page)}
                page={page}
                count={totalPage}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "rgb(var(--fg))",
                    borderColor: "var(--line-strong)",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#00ABE4",
                    color: "#ffffff",
                    "&:hover": { backgroundColor: "#0096c7" },
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(0, 171, 228, 0.2)",
                  },
                  "& .MuiPaginationItem-icon": { color: "rgb(var(--fg))" },
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    if (user.TOTPenable === false) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/setup-totp",
        },
      };
    }
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "https://home.oxyclick.com",
      },
    };
  }
};
