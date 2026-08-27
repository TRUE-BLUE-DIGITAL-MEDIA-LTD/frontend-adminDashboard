import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import { MdArrowBack, MdDelete, MdRefresh, MdSave } from "react-icons/md";
import Swal from "sweetalert2";
import DomainSettingsSection from "../../components/domain/domainSettingsSection";
import GscTabs from "../../components/domain/gsc/gscTabs";
import LandingPagesSection from "../../components/domain/landingPagesSection";
import SeoPerformanceSection from "../../components/domain/seoPerformanceSection";
import VerifyDomain from "../../components/domain/verifyDomain";
import {
  isLandingPageDistributionValid,
  sumLandingPagePercent,
} from "../../components/forms/domains/landingPageDistribution";
import SpinLoading from "../../components/loadings/spinLoading";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Partner, User } from "../../models";
import { useUpdateSeoScore } from "../../react-query/domain";
import {
  DeleteDomainNameService,
  GetDomainService,
  InputUpdateDomainService,
  ResetGoogleVerificationService,
  UpdateDomainService,
} from "../../services/admin/domain";
import { RemoveDomainNameFromLandingPageService } from "../../services/admin/landingPage";
import { GetUser } from "../../services/admin/user";

function DomainDetail({ user }: { user: User & { partner: Partner } }) {
  const router = useRouter();
  const domainId =
    typeof router.query.domainId === "string" ? router.query.domainId : "";

  const [domainData, setDomainData] = useState<InputUpdateDomainService>({
    landingPages: [{ name: "", id: "", percent: 0 }],
    note: "",
    domainNameId: "",
    googleAnalyticsId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const getDomain = useQuery({
    queryKey: ["domain", domainId],
    queryFn: () => GetDomainService({ domainId }),
    enabled: domainId !== "",
  });
  const updateSeoScore = useUpdateSeoScore();

  const domainName = getDomain.data?.domain.name ?? "";
  const landingPagesList = domainData?.landingPages ?? [];
  const totalPercent =
    Math.round(sumLandingPagePercent(landingPagesList) * 100) / 100;
  const distributionValid = isLandingPageDistributionValid(landingPagesList);

  useEffect(() => {
    if (!getDomain.data) return;
    setDomainData(() => {
      return {
        name: getDomain.data.domain.name as string,
        domainNameId: getDomain.data.domain.id as string,
        googleAnalyticsId: getDomain.data.domain.googleAnalyticsId as string,
        note: getDomain.data.domain.note as string,
        landingPages: getDomain.data.landingPages,
      };
    });
  }, [getDomain.data]);

  const handleUpdateDomain = async () => {
    if (!distributionValid) {
      Swal.fire(
        "Invalid distribution",
        `Landing page percentages must total 100%. Current total: ${totalPercent}%`,
        "error",
      );
      return;
    }
    try {
      setIsLoading(() => true);
      await UpdateDomainService({
        domainNameId: domainId,
        note: domainData.note,
        landingPages: domainData.landingPages,
        ...(domainData.googleAnalyticsId && {
          googleAnalyticsId: domainData?.googleAnalyticsId,
        }),
      });
      await getDomain.refetch();
      Swal.fire("Success", "Domain updated successfully", "success");
      setIsLoading(() => false);
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  const handleUpdateSeoScore = async () => {
    try {
      setIsLoading(() => true);

      await updateSeoScore.mutateAsync({ domainId });
      await getDomain.refetch();

      Swal.fire("Success", "SEO score updated successfully", "success");
    } catch (err: any) {
      console.log(err);
      Swal.fire("Error!", err.message?.toString(), "error");
    } finally {
      setIsLoading(() => false);
    }
  };

  //handle remove domain name from landing page
  const handleRemoveDomainName = ({
    landingPageId,
  }: {
    landingPageId: string;
  }) => {
    Swal.fire({
      title: "Are you sure?",
      text: "To Remove This Landing Page From The Domain",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.isLoading();
          await RemoveDomainNameFromLandingPageService({
            landingPageId: landingPageId,
          });
          await getDomain.refetch();
          Swal.fire(
            "Deleted!",
            "The landing page has been unlinked from this domain",
            "success",
          );
        } catch (err: any) {
          console.log(err);
          Swal.fire("Error!", err.message?.toString(), "error");
        }
      }
    });
  };

  const handleDeleteDomain = async () => {
    const replacedText = domainName.replace(/ /g, "_");
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Domain",
      input: "text",
      footer:
        "Please keep it mind if you delete domain, the landing pages that is connected to this domain also be deleted",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Trying To Delete",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await DeleteDomainNameService({
          domainNameId: domainId,
        });
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
        router.push("/domain");
      } catch (err: any) {
        console.log(err);
        Swal.fire("error!", err.message?.toString(), "error");
      }
    }
  };

  const handleResetGoogleVerification = async () => {
    const result = await Swal.fire({
      title: "Reset Google Verification?",
      text: "This removes the domain's Google Search Console verification. You will need to run Verify again afterwards.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset it",
    });
    if (!result.isConfirmed) return;
    try {
      Swal.fire({
        title: "Resetting Google Verification",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await ResetGoogleVerificationService({ domainId });
      await getDomain.refetch();
      Swal.fire(
        "Reset complete",
        "Google verification removed. Run Verify again to re-verify this domain.",
        "success",
      );
    } catch (err: any) {
      console.log(err);
      Swal.fire("Error!", err.message?.toString(), "error");
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto mt-24 max-w-5xl space-y-8 px-4 pb-20 font-Poppins">
        <header className="flex flex-col gap-3">
          <button
            onClick={() => {
              // Prefer history back so the list's ?search=&page=&partnerId=
              // state is restored; fall back for direct/deep links.
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/domain");
              }
            }}
            className="flex w-max items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
          >
            <MdArrowBack /> Back to Domains
          </button>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                {domainName || "Loading..."}
              </h1>
              {domainName && <VerifyDomain domainName={domainName} />}
            </div>
            <button
              disabled={isLoading}
              onClick={handleUpdateDomain}
              className="flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <SpinLoading />
              ) : (
                <>
                  <MdSave className="text-lg" /> Save Changes
                </>
              )}
            </button>
          </div>
        </header>

        <DomainSettingsSection
          domainData={domainData}
          setDomainData={setDomainData}
          getDomain={getDomain}
        />
        <SeoPerformanceSection
          domain={getDomain.data?.domain}
          isLoading={isLoading}
          onUpdateSeoScore={handleUpdateSeoScore}
        />
        <LandingPagesSection
          landingPages={landingPagesList}
          setDomainData={setDomainData}
          onRemoveLandingPage={handleRemoveDomainName}
          totalPercent={totalPercent}
          distributionValid={distributionValid}
        />

        {domainId && domainName && (
          <GscTabs
            domainId={domainId}
            domainName={domainName}
            user={user}
            googleDomainId={getDomain.data?.domain.google_domain_id}
          />
        )}

        {user.role === "admin" && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-700">
              Danger Zone
            </h2>
            <p className="mb-4 text-sm text-red-600">
              Deleting this domain also deletes the landing pages connected to
              it.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleResetGoogleVerification}
                className="flex items-center gap-2 rounded-lg border border-red-600 bg-white px-6 py-2 font-medium text-red-600 transition hover:bg-red-100 active:scale-95"
              >
                <MdRefresh /> Reset Google Verification
              </button>
              <button
                onClick={handleDeleteDomain}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700 active:scale-95"
              >
                <MdDelete /> Delete Domain
              </button>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DomainDetail;

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
