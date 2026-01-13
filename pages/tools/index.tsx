import { GetServerSideProps, GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import PayslipGenerator from "../../components/payslip/payslipGenerator";
import SimCard from "../../components/simCard/simCard";
import SmsDaisy from "../../components/sms-daisy/SmsDaisy";
import SmsPinverify from "../../components/sms-pinverify/SmsPinverify";
import SmsPool from "../../components/sms-pool/SmsPool";
import SmsPvas from "../../components/sms-pva/SmsPvas";
import SmsTextVerified from "../../components/sms-textverified/SmsTextVerified";
import ParterReport from "../../components/everflow-reports/ParterReport";
import { OxyClickTools } from "../../data/menus";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Partner, User } from "../../models";
import { GetUser } from "../../services/admin/user";
import SmsReport from "../../components/sms-report/SmsReport";
import CloudPhone from "@/components/cloud-phone/CloudPhone";
import SmsBowers from "../../components/sms-bower/SmsBowers";

// Dynamically import your component with SSR turned off
const PartnerLeague = dynamic(
  () => import("../../components/partner-league/PartnerLeague"), // Adjust the path to your component
  { ssr: false },
);

function Index({ user }: { user: User & { partner: Partner | null } }) {
  const router = useRouter();
  const menu = router.query.option as OxyClickTools;

  return (
    <DashboardLayout user={user}>
      <div className="w-full">
        {menu === "partners-performance" && <ParterReport user={user} />}
        {menu === "payslip" && <PayslipGenerator />}
        {menu === "sms-etms" && <SimCard user={user} />}
        {menu === "sms-pva" && <SmsPvas user={user} />}
        {menu === "sms-pool" && <SmsPool user={user} />}
        {menu === "sms-textverified" && <SmsTextVerified user={user} />}
        {menu === "league-table" && <PartnerLeague user={user} />}
        {menu === "sms-pinverify" && <SmsPinverify user={user} />}
        {menu === "sms-daisy" && <SmsDaisy user={user} />}
        {menu === "sms-report" && <SmsReport />}
        {menu === "cloud-phone" && <CloudPhone />}
        {menu === "sms-bower" && <SmsBowers user={user} />}
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
