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
      <header className="w-full mt-40 font-Poppins  gap-10 flex items-center justify-center">
        <ul className="flex border-b-2 border-icon-color w-9/12 pb-10 justify-center items-center gap-10">
          {toolsData.map((tool, index) => {
            return (
              <li
                onClick={() => setSelectMenu(index)}
                className={`flex ${
                  selectMenu === index ? "bg-icon-color" : "bg-white"
                } flex-col ring-2 ring-icon-color  text-black select-none hover:text-black active:ring-2 hover:scale-110 transition duration-100
             hover:bg-icon-color cursor-pointer justify-center items-center p-3 gap-2 w-72 h-28 
            py-4 rounded-xl drop-shadow-lg`}
                key={index}
              >
                <h3 className="text-lg flex justify-center items-center gap-2 font-semibold">
                  {tool.title} {<tool.icon />}
                </h3>
                <span className="text-center text-sm">{tool.description}</span>
              </li>
            );
          })}
        </ul>
      </header>
      <main className="w-full flex justify-center mt-20">
        {selectMenu === 0 && <ParterReport user={user} />}
        {selectMenu === 1 && <Postcode />}
      </main>
    </DashboardLayout>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
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
