import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import SpinLoading from "../loadings/spinLoading";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../models";
import { ValidatePasscodeTOTPService } from "../../services/auth/multi-auth";
import { setCookie } from "nookies";

function TotpRequire({ email }: { email: string }) {
  const [qrCode, setQrCode] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleValidatePasscode = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      setIsLoading(true);
      const validate = await ValidatePasscodeTOTPService({
        code: code,
        email: email,
      });
      setCookie(null, "access_token", validate.access_token, {
        path: "/", // Cookie path (can be adjusted based on your needs)
        maxAge: 30 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
      });
      router.push("/");
      setIsLoading(false);
      Swal.fire({
        title: "Success",
        text: "Login Success",
        icon: "success",
      });
    } catch (error) {
      setIsLoading(false);
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
    <div className="flex h-min w-96 flex-col items-center justify-start gap-2 rounded-2xl bg-white p-5 font-Poppins drop-shadow-lg">
      <h1 className="text-center text-lg font-semibold">
        Two Factor Authentication Required
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

      <form
        onSubmit={handleValidatePasscode}
        className="flex w-60 flex-col gap-2"
      >
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

        <button
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800"
        >
          {isLoading ? <SpinLoading /> : "Confirm"}
        </button>
      </form>
    </div>
  );
}

export default TotpRequire;
