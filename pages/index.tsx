import { Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { parseCookies } from "nookies";
import { useState } from "react";
import Searchbar from "../components/category/searchbar";
import { languages } from "../data/languages";
import DashboardLayout from "../layouts/dashboardLayout";
import { Language, User } from "../models";
import { GetAllCategoriesByPartnerService } from "../services/admin/categories";
import { GetAllDomains } from "../services/admin/domain";
import { GetUser } from "../services/admin/user";

export type QueryFilterLandingPages = {
  categoryId?: string;
  domainId?: string;
  language?: Language | string;
};
function Index({ user }: { user: User }) {
  const [page, setPage] = useState(1);
  const [queryFilterLandingPages, setQueryFilterLandingPages] =
    useState<QueryFilterLandingPages>({});
  const domains = useQuery({
    queryKey: ["domains"],
    queryFn: () =>
      GetAllDomains().then((res) => {
        const newFormat = res.map((domain) => {
          return { option: domain.name, id: domain.id };
        });
        return newFormat;
      }),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      GetAllCategoriesByPartnerService().then((res) => {
        const newFormat = res.map((category) => {
          return {
            option: category.title,
            id: category.id,
            description: category?.description,
            background: category.background,
          };
        });
        return newFormat;
      }),
  });
  const newFormatLanguage = languages.map((language) => {
    return { option: language.name, id: language.value };
  });

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen w-full bg-black font-Poppins text-white">
        <header className="mx-auto flex h-max w-full max-w-7xl flex-col items-start justify-center gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-main-color">
            Campaign assets
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="text-main-color">C</span>ategories
          </h1>
          <section className="grid h-full w-full grid-cols-2 items-end justify-start gap-5 border-b border-white/10 pb-5 md:flex">
            {categories.isLoading ? (
              <Skeleton width={200} height={60} animation="wave" />
            ) : (
              <Searchbar
                items={categories.data || []}
                title="Categories"
                setQueryFilterLandingPages={setQueryFilterLandingPages}
              />
            )}
            {domains.isLoading ? (
              <Skeleton width={200} height={60} animation="wave" />
            ) : (
              <Searchbar
                items={domains.data || []}
                title="Domains"
                setQueryFilterLandingPages={setQueryFilterLandingPages}
              />
            )}
            <Searchbar
              items={newFormatLanguage}
              title="Languages"
              setQueryFilterLandingPages={setQueryFilterLandingPages}
            />
            <Link
              href={{
                pathname: "/landingPages",
                query: {
                  ...queryFilterLandingPages,
                },
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white bg-white px-8 py-2 text-sm font-semibold text-black transition hover:border-main-color hover:bg-main-color hover:text-white"
            >
              Enter
            </Link>
          </section>
        </header>
        <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:px-8 2xl:grid-cols-3">
          {categories.data?.map((category) => {
            return (
              <Link
                href={{
                  pathname: "/landingPages",
                  query: {
                    categoryId: category.id,
                  },
                }}
                key={category.id}
                className="group relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 font-semibold no-underline  transition hover:border-main-color/40"
              >
                <h3
                  className={` relative z-20 bg-white bg-clip-text text-center text-5xl text-white   drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]`}
                >
                  {category.option}
                </h3>
                <Image
                  src={category.background}
                  fill
                  quality={10}
                  className="object-cover transition duration-700 group-hover:scale-125"
                  alt="image cover"
                />
              </Link>
            );
          })}
        </main>
        <footer></footer>
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
    const node = process.env.NODE_ENV;
    return {
      redirect: {
        permanent: false,
        destination:
          node === "development"
            ? "/auth/sign-in"
            : "https://home.oxyclick.com",
      },
    };
  }
};
