import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ErrorMessages, User } from "../../models";
import Swal from "sweetalert2";
import {
  GenerateTOTPService,
  VerifyTOTPService,
} from "../../services/auth/multi-auth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next-nprogress-bar";
import DashboardLayout from "../../layouts/dashboardLayout";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";

function SetupTotp({ user }: { user: User }) {
  const [qrCode, setQrCode] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    handleGenerateQrCode();
  }, []);

  const handleGenerateQrCode = async () => {
    try {
      setIsLoading(() => true);
      const url = await GenerateTOTPService();
      const generateQrCode = await QRCode.toDataURL(url.url);
      setQrCode(() => generateQrCode);
      setIsLoading(() => false);
    } catch (error) {
      setIsLoading(() => false);
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  const handleConfirm = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      Swal.fire({
        title: "Please wait",
        text: "Verifying the code",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const verify = await VerifyTOTPService({
        code: code,
      });
      console.log(verify);
      Swal.fire({
        title: "Success",
        text: "Two Factor Authentication Setup Successfully",
        icon: "success",
      });
      router.push("/");
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };
  return (
    <DashboardLayout user={user}>
      <div className="bg-slate-50">
        <Head>
          <title>Setup Two Factor Authentication</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <main className="flex min-h-screen flex-col items-center justify-center gap-2">
          <div className="flex h-96 w-96 flex-col items-center justify-start gap-2 rounded-2xl bg-white p-5 font-Poppins drop-shadow-lg">
            <h1 className="text-center text-lg font-semibold">
              Setup Two Factor Authentication
            </h1>
            <h2 className="flex items-center justify-center gap-1 text-icon-color">
              using google authenticator{" "}
              <Image
                src={"/image/Google_Authenticator.png"}
                height={30}
                width={30}
                alt="logo"
              />
            </h2>
            <div
              className={`relative h-52 w-52 rounded-md p-3 ${isLoading && "animate-pulse bg-gradient-to-r from-slate-300 to-slate-500 "}`}
            >
              {qrCode && (
                <Image
                  className="object-contain"
                  src={qrCode}
                  fill
                  alt="qr-code"
                />
              )}
            </div>
            <form onSubmit={handleConfirm} className="flex w-60 flex-col gap-2">
              {isLoading ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-slate-200" />
              ) : (
                <input
                  type="text"
                  onChange={(e) => setCode(e.target.value)}
                  value={code}
                  placeholder="Enter the 6 digit code"
                  className="h-10 w-full rounded-md p-2 text-center ring-1 ring-slate-300 
                focus:outline-none active:outline-none"
                  maxLength={6}
                  minLength={6}
                  pattern="\d{6}"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9]/g, "");
                  }}
                />
              )}
              {isLoading ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-slate-400" />
              ) : (
                <button className="h-10 w-full rounded-md bg-slate-700 text-white hover:bg-slate-800">
                  Confirm
                </button>
              )}
            </form>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default SetupTotp;
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
