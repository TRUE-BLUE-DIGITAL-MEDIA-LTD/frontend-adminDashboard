import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/dashboardLayout";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../services/admin/user";
import { Language, User } from "../models";
import Searchbar from "../components/category/searchbar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetAllDomains } from "../services/admin/domain";
import { Skeleton } from "@mui/material";
import { languages } from "../data/languages";
import { GetAllCategories } from "../services/admin/categories";
import Image from "next/image";
import Link from "next/link";
import { GetAllLandingPageService } from "../services/admin/landingPage";
import LandingPageLists from "../components/landingPages/landingPageLists";

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
      GetAllCategories().then((res) => {
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
      <header className="mt-20 flex  h-max w-full flex-col items-start justify-center gap-4 p-10">
        <h1 className="font-Poppins text-7xl font-semibold">
          <span className="text-icon-color">C</span>
          <span>ategories</span>
        </h1>
        <section className="flex h-20 w-full items-end justify-start gap-5   border-b-2 pb-5 ">
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
            className="buttonSuccess px-10 py-2"
          >
            Enter
          </Link>
        </section>
      </header>
      <main className="grid grid-cols-3 gap-10 p-10">
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
              className="group relative flex h-40 cursor-pointer items-center justify-center overflow-hidden bg-white font-Poppins font-semibold no-underline drop-shadow-md "
            >
              <h3
                style={{ backgroundImage: `url(${category.background})` }}
                className={`relative z-20 bg-clip-text text-5xl  text-transparent drop-shadow-lg`}
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
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
