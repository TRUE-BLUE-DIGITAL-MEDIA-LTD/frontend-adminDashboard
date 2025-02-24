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
import { useRouter } from "next/router";
import PayslipGenerator from "../../components/payslip/payslipGenerator";
import SmsReceive from "../../components/sms-online/sms";
import SimCard from "../../components/simCard/simCard";
import { OxyClickTools } from "../../data/menus";
import SmsPvas from "../../components/sms-pva/SmsPvas";

function Index({ user }: { user: User }) {
  const router = useRouter();
  const menu = router.query.option as OxyClickTools;

  return (
    <DashboardLayout user={user}>
      <div className="w-full">
        {menu === "partners-performance" && <ParterReport user={user} />}
        {menu === "postcode" && <Postcode />}
        {menu === "payslip" && <PayslipGenerator />}
        {menu === "sms-online" && <SmsReceive />}
        {menu === "sms-etms" && <SimCard user={user} />}
        {menu === "sms-pva" && <SmsPvas user={user} />}
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
