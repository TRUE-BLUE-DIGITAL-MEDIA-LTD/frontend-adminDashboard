import { Pagination, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { IoMdPerson } from "react-icons/io";
import { IoSearchCircleSharp } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import ListDomain from "../../components/domain/listDomain";
import DomainCreate from "../../components/forms/domains/domainCreate";
import DomainUpdate from "../../components/forms/domains/domainUpdate";
import { loadingNumber } from "../../data/loadingNumber";
import DashboardLayout from "../../layouts/dashboardLayout";
import {
  Domain,
  Partner,
  ResponsibilityOnPartner,
  SimCardOnPartner,
  User,
} from "../../models";
import { useGetDomainsByPage } from "../../react-query";
import { GetPartnerByMangegerService } from "../../services/admin/partner";
import { GetUser } from "../../services/admin/user";

function Index({ user }: { user: User }) {
  const [searchField, setSearchField] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectPartner, setSelectPartner] = useState<Partner>();
  const [totalPage, setTotalPage] = useState(1);
  const [triggerCreateDomain, setTriggerCreateDomain] =
    useState<boolean>(false);
  const [triggerUpdateDomain, setTriggerUpdateDomain] =
    useState<boolean>(false);
  const [currentUpdateDomain, setCurrentUpdateDomain] = useState<
    Domain | undefined
  >();

  const domains = useGetDomainsByPage({
    page: page,
    searchField: searchField,
    partnerId: selectPartner?.id,
    filter:
      selectPartner?.id === "no-partner"
        ? "no-partner"
        : selectPartner?.id === "all"
          ? "all"
          : undefined,
  });

  useEffect(() => {
    if (domains.data) {
      setTotalPage(() => domains.data.totalPages);
    }
  }, [domains.data]);

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
        });
        addSeeAll.push({
          createAt: new Date(),
          managerId: "",
          isAllowUsingSMS_TEXTVERIFIED: true,
          isAllowManageAssginCategory: true,
          isAllowManageAssignDomain: true,
          isAllowManageAssignPhoneNumber: true,
          isAllowManageSmsOxy: true,
          isAllowSmsPoolAccount: true,
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
        });

        setSelectPartner(() => addSeeAll[0] as Partner);
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

      {triggerUpdateDomain && (
        <DomainUpdate
          domain={currentUpdateDomain as Domain}
          setTriggerUpdateDomain={setTriggerUpdateDomain}
        />
      )}
      <div className="w-full">
        <header className="mt-20 flex w-full flex-col items-center  justify-center gap-7 text-center">
          <h1 className="font-Poppins text-4xl font-semibold md:text-5xl">
            <span className="text-icon-color">D</span>
            <span>omains</span>
          </h1>
          {user.role === "admin" && (
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateDomain(() => true);
              }}
              className="rounded-full bg-main-color px-20 py-2 
    text-xl font-semibold text-white transition duration-150 hover:bg-blue-700 
    active:scale-105"
            >
              Create
            </button>
          )}
          <div className="flex w-full flex-wrap justify-center gap-5">
            <div className="flex flex-col items-start gap-1">
              <label className="text-sm font-normal">Search Domain</label>
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
                  className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
                />
                <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
              </SearchField>
            </div>
            <div className="flex flex-col items-start gap-1">
              <label className="text-sm font-normal">Select Partner</label>
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
                    <span className="rounded-md bg-gray-700 px-2 py-1 text-xs text-white">
                      Total {partner.responsibilityOnPartner.length}
                    </span>
                  </div>
                )}
                optionLabel="name"
                loading={partners.isLoading}
                options={partners.data}
                placeholder="Select Partner"
                className="h-10 w-96  rounded-lg text-left outline-0 ring-2 ring-icon-color "
              />
            </div>
          </div>
        </header>

        <main className="mt-10 flex w-full flex-col items-center justify-center gap-5 pb-20  ">
          <div className="h-96 w-80 justify-center overflow-auto md:h-5/6 md:w-11/12">
            <table className="w-max min-w-full border-collapse">
              <thead className="h-14 border-b-2 border-black font-bold text-blue-700 drop-shadow-md">
                <tr className="sticky top-0 z-40 bg-white">
                  <td className="px-5">Domain Name</td>
                  <td className="">Updated At</td>
                  <td>Site Status</td>
                  <td>Verify On Google</td>
                  <td>Sitemap Status</td>
                  <td>DNS Status</td>
                  <td>Nameserver</td>
                  <td>Partners</td>
                  <td>Landing Pages</td>
                  <td className="flex items-center gap-2">
                    <MdSettings />
                    Options
                  </td>
                </tr>
              </thead>
              <tbody className="">
                {domains.isLoading ? (
                  loadingNumber.map((list, index) => {
                    return (
                      <tr
                        className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                        key={index}
                      >
                        {Array.from({ length: 10 }).map((_, i) => (
                          <th key={i}>
                            <Skeleton />
                          </th>
                        ))}
                      </tr>
                    );
                  })
                ) : domains.isError ? (
                  <tr>NO domain Found</tr>
                ) : (
                  domains.data?.domains.map((list, index) => {
                    return (
                      <ListDomain
                        key={index}
                        list={list}
                        domains={domains}
                        setCurrentUpdateDomain={setCurrentUpdateDomain}
                        setTriggerUpdateDomain={setTriggerUpdateDomain}
                        user={user}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex w-full justify-center">
            <Pagination
              onChange={(e, page) => setPage(page)}
              page={page}
              count={totalPage}
              color="primary"
            />
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
