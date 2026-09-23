import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DeleteLandingPageService,
  DuplicateLandingPageService,
  GetAllLandingPageService,
} from "../../services/admin/landingPage";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/dashboardLayout";
import { User } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";
import Link from "next/link";
import { loadingNumber } from "../../data/loadingNumber";
import { Pagination, Skeleton } from "@mui/material";
import SpinLoading from "../../components/loadings/spinLoading";
import { BiCopyAlt, BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { languages } from "../../data/languages";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import Searchbar from "../../components/category/searchbar";
import { toDomainOptions, useGetAllDomains } from "../../react-query/domain";
import { GetAllCategoriesByPartnerService } from "../../services/admin/categories";
import { QueryFilterLandingPages } from "../index";
import { HiPlus } from "react-icons/hi";
import { FiGlobe, FiTag } from "react-icons/fi";

interface handleDuplicateLandingPageParam {
  landingPageId: string;
}
interface handleDeleteLandingPageParams {
  landingPageId: string;
}
export default function Home({ user }: { user: User }) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [searchField, setSearchField] = useState<string>("");
  const [filter, setFilter] = useState<QueryFilterLandingPages>({
    categoryId:
      typeof router.query.categoryId === "string"
        ? router.query.categoryId
        : undefined,
    domainId:
      typeof router.query.domainId === "string"
        ? router.query.domainId
        : undefined,
    language:
      typeof router.query.language === "string"
        ? router.query.language
        : undefined,
  });
  const domains = useGetAllDomains({ select: toDomainOptions });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      GetAllCategoriesByPartnerService().then((res) =>
        res.map((category) => ({ option: category.title, id: category.id })),
      ),
  });
  const landingPages = useQuery({
    queryKey: [
      "landingPages",
      {
        page: page,
        query: { ...router.query, ...filter, searchField: searchField },
      },
    ],
    queryFn: () =>
      GetAllLandingPageService({
        page: page,
        query: { ...router.query, ...filter, searchField: searchField },
      }),
    placeholderData: keepPreviousData,
  });
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // handle delete landingpage
  const handleDeleteLandingPage = async ({
    landingPageId,
  }: handleDeleteLandingPageParams) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00ABE4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(() => true);
          const deleteLandingPage = await DeleteLandingPageService({
            landingPageId: landingPageId,
          });
          Swal.fire("Deleted!", deleteLandingPage.message, "success");
          await landingPages.refetch();
          setIsLoading(() => false);
        } catch (err: any) {
          setIsLoading(() => false);
          console.log(err);
          Swal.fire("error!", err.message?.toString(), "error");
        }
      }
    });
  };

  const handleDuplicateLandingPage = async ({
    landingPageId,
  }: handleDuplicateLandingPageParam) => {
    try {
      setIsLoading(() => true);
      await DuplicateLandingPageService({
        landingPageId: landingPageId,
      });
      Swal.fire(
        "Duplicated!!",
        "Landing Page Successfully Duplicated",
        "success",
      );
      setIsLoading(() => false);
      landingPages.refetch();
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
    }
  };

  const resolveLanguage = (value?: string) =>
    languages.find((language) => language.value === value)?.name ??
    value ??
    "—";

  const renderActions = (landingPageId: string) =>
    isLoading ? (
      <div className="flex items-center justify-center gap-2">
        <SpinLoading />
      </div>
    ) : (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            handleDuplicateLandingPage({
              landingPageId,
            })
          }
          aria-label="Duplicate landing page"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.98]"
        >
          <BiCopyAlt className="text-lg" />
          <span className="hidden sm:inline">Duplicate</span>
        </button>
        <Link
          href={`/landingpage/${landingPageId}`}
          aria-label="Edit landing page"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-main-color bg-main-color px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#0096c7] active:scale-[0.98]"
        >
          <BiSolidMessageSquareEdit className="text-lg" />
          <span className="hidden sm:inline">Edit</span>
        </Link>
        <button
          type="button"
          onClick={() =>
            handleDeleteLandingPage({
              landingPageId,
            })
          }
          aria-label="Delete landing page"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 active:scale-[0.98]"
        >
          <MdDelete className="text-lg" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    );

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen w-full bg-black font-Poppins text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Page header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-main-color">
                Campaign assets
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Landing <span className="text-main-color">Pages</span>
              </h1>
              <p className="max-w-xl text-sm text-white/60 sm:text-base">
                Create, filter, and manage high-performing landers for every
                offer and domain.
              </p>
            </div>
            <Link
              href={"/create-landingpage"}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:border-main-color hover:bg-main-color hover:text-white active:scale-[0.98] sm:text-base"
            >
              <HiPlus className="text-lg" />
              Create landing page
            </Link>
          </header>

          {/* Toolbar */}
          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SearchField
                value={searchField}
                onChange={(e) => {
                  setSearchField(() => e);
                }}
                className="relative flex w-full max-w-md flex-col"
              >
                <Input
                  placeholder="Search landing page name"
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-zinc-900/5 py-2 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-main-color focus:bg-black/60 focus:ring-2 focus:ring-main-color/30"
                />
                <IoSearchCircleSharp className="absolute bottom-0 left-2.5 top-0 m-auto text-3xl text-main-color" />
              </SearchField>

              <div className="flex flex-wrap items-end gap-3">
                {domains.isLoading ? (
                  <Skeleton width={180} height={48} animation="wave" />
                ) : (
                  <Searchbar
                    items={domains.data || []}
                    title="Domains"
                    setQueryFilterLandingPages={setFilter}
                  />
                )}
                {categories.isLoading ? (
                  <Skeleton width={180} height={48} animation="wave" />
                ) : (
                  <Searchbar
                    items={categories.data || []}
                    title="Categories"
                    setQueryFilterLandingPages={setFilter}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Content */}
          <main className="flex w-full flex-col gap-4">
            {/* Mobile / tablet cards */}
            <div className="grid gap-3 md:hidden">
              {landingPages.isLoading
                ? loadingNumber.map((list, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-sm"
                    >
                      <Skeleton height={28} />
                      <Skeleton className="mt-2" />
                      <Skeleton className="mt-2" width="60%" />
                    </div>
                  ))
                : landingPages?.data?.landingPages?.map(
                    (landingPage, index) => {
                      const languageName = resolveLanguage(
                        landingPage.language,
                      );
                      return (
                        <article
                          key={landingPage.id ?? index}
                          className="rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-sm transition hover:border-main-color/30 hover:shadow-md"
                        >
                          <div className="mb-3 space-y-1">
                            <h2 className="text-base font-semibold text-zinc-100">
                              {landingPages.isFetching ? (
                                <Skeleton animation="wave" />
                              ) : (
                                landingPage?.name
                              )}
                            </h2>
                            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/10 px-2.5 py-1 text-zinc-300">
                                <FiGlobe className="text-main-color" />
                                {landingPage?.domain?.id ? (
                                  <Link
                                    href={`/domain/${landingPage.domain.id}`}
                                    title="Open domain"
                                    className="font-medium text-main-color underline-offset-2 hover:underline"
                                  >
                                    {landingPage.domain.name}
                                  </Link>
                                ) : landingPage?.domain?.name ? (
                                  <span className="font-medium text-main-color">
                                    {landingPage.domain.name}
                                  </span>
                                ) : (
                                  "No domain"
                                )}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/5 px-2.5 py-1">
                                {languageName}
                              </span>
                              {landingPage?.category?.title && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/5 px-2.5 py-1">
                                  <FiTag className="text-icon-color" />
                                  {landingPage.category.title}
                                </span>
                              )}
                            </div>
                          </div>
                          {renderActions(landingPage.id)}
                        </article>
                      );
                    },
                  )}
            </div>

            {/* Desktop table */}
            <div className="hidden h-96 overflow-auto rounded-2xl border border-white/10 bg-zinc-900 shadow-sm md:block md:h-[36rem]">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="border-b border-white/10 bg-zinc-900/5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="sticky top-0 z-10 bg-zinc-900/95 px-4 py-3.5">
                        Name
                      </th>
                      <th className="sticky top-0 z-10 bg-zinc-900/95 px-4 py-3.5">
                        Domain
                      </th>
                      <th className="sticky top-0 z-10 bg-zinc-900/95 px-4 py-3.5">
                        Language
                      </th>
                      <th className="sticky top-0 z-10 bg-zinc-900/95 px-4 py-3.5">
                        Category
                      </th>
                      <th className="sticky top-0 z-10 bg-zinc-900 px-4 py-3.5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {landingPages.isLoading
                      ? loadingNumber.map((list, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <Skeleton />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton animation="wave" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton animation="wave" />
                            </td>
                            <td className="px-4 py-3">
                              <Skeleton />
                            </td>
                          </tr>
                        ))
                      : landingPages?.data?.landingPages?.map(
                          (landingPage, index) => {
                            const languageName = resolveLanguage(
                              landingPage.language,
                            );
                            return (
                              <tr
                                className="transition hover:bg-zinc-900/5"
                                key={landingPage.id ?? index}
                              >
                                <td className="px-4 py-3.5 font-medium text-zinc-100">
                                  {landingPages.isFetching ? (
                                    <Skeleton animation="wave" />
                                  ) : (
                                    landingPage?.name
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  {landingPage?.domain?.id ? (
                                    <Link
                                      href={`/domain/${landingPage.domain.id}`}
                                      title="Open domain"
                                      className="inline-flex items-center gap-1.5 rounded-full bg-main-color/15 px-2.5 py-1 text-xs font-medium text-main-color transition hover:bg-main-color/15"
                                    >
                                      <FiGlobe />
                                      {landingPages.isFetching ? (
                                        <Skeleton width={80} />
                                      ) : (
                                        landingPage.domain.name
                                      )}
                                    </Link>
                                  ) : landingPage?.domain?.name ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-main-color/15 px-2.5 py-1 text-xs font-medium text-main-color">
                                      <FiGlobe />
                                      {landingPage.domain.name}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-zinc-400">
                                  {languageName}
                                </td>
                                <td className="px-4 py-3.5 text-zinc-400">
                                  {landingPage?.category?.title || "—"}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex justify-end">
                                    {renderActions(landingPage.id)}
                                  </div>
                                </td>
                              </tr>
                            );
                          },
                        )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex shrink-0 justify-center pb-16 pt-2">
              <div className="rounded-full border border-white/15 bg-zinc-900/5 px-3 py-2">
                <Pagination
                  onChange={(e, page) => setPage(page)}
                  count={landingPages?.data?.totalPages}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "#ffffff",
                      borderColor: "rgba(255,255,255,0.35)",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      backgroundColor: "#00ABE4",
                      color: "#ffffff",
                      "&:hover": { backgroundColor: "#0096c7" },
                    },
                    "& .MuiPaginationItem-root:hover": {
                      backgroundColor: "rgba(0, 171, 228, 0.2)",
                    },
                    "& .MuiPaginationItem-icon": { color: "#ffffff" },
                  }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}

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
