import React, { useEffect, useState } from "react";
import { User } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  GetPostalCodesByStateService,
  GetProvincesInCountryService,
} from "../../services/tools/postcode";
import DashboardLayout from "../../layouts/dashboardLayout";
import { toolsData } from "../../data/tools";
import CountryInput from "../../components/postcode/countryInput";
import ProvinceInput from "../../components/postcode/provinceInput";
import { Skeleton } from "@mui/material";
import { loadingNumber } from "../../data/loadingNumber";
import Cities from "../../components/postcode/cities";
import Postcode from "../../components/postcode/postcode";
import ParterReport from "../../components/tables/parterReport";

function Index({ user }: { user: User }) {
  const [selectMenu, setSelectMenu] = useState(0);
  return (
    <DashboardLayout user={user}>
      <header className="mt-40 flex w-full  items-center justify-center gap-10 font-Poppins">
        <ul className="grid w-11/12 grid-cols-1 place-items-center items-center justify-center gap-10 border-b-2 border-icon-color pb-10 md:grid-cols-2">
          {toolsData.map((tool, index) => {
            return (
              <li
                onClick={() => setSelectMenu(index)}
                className={`flex ${
                  selectMenu === index ? "bg-icon-color" : "bg-white"
                } h-28 w-80 cursor-pointer  select-none flex-col items-center justify-center gap-2 rounded-xl p-3
             py-4 text-black ring-2 ring-icon-color drop-shadow-lg transition duration-100 hover:scale-110 
            hover:bg-icon-color hover:text-black active:ring-2`}
                key={index}
              >
                <h3 className="flex items-center justify-center gap-2  text-base font-semibold">
                  {tool.title} {<tool.icon className="hidden md:block" />}
                </h3>
                <span className="line-clamp-3 text-center text-xs xl:text-sm">
                  {tool.description}
                </span>
              </li>
            );
          })}
        </ul>
      </header>
      <main className="mt-20 flex w-full justify-center">
        {selectMenu === 0 && <ParterReport user={user} />}
        {selectMenu === 1 && <Postcode />}
      </main>
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
