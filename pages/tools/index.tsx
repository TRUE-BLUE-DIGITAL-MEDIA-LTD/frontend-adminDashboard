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
import SmsReceive from "../../components/sms/sms";
import SimCard from "../../components/simCard/simCard";

function Index({ user }: { user: User }) {
  const [selectMenu, setSelectMenu] = useState(0);
  const router = useRouter();
  return (
    <DashboardLayout user={user}>
      <div className="w-full">
        {router.query.option === "partners-performance" && (
          <ParterReport user={user} />
        )}
        {router.query.option === "postcode" && <Postcode />}
        {router.query.option === "payslip" && <PayslipGenerator />}
        {router.query.option === "sms" && <SmsReceive />}
        {router.query.option === "sms-etms" && <SimCard user={user} />}
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
