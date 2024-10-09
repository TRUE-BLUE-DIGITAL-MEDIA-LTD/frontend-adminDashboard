import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { InputSignInService, signInService } from "../../services/auth/sign-in";
import { parseCookies, setCookie } from "nookies";
import { Alert, Snackbar, TextField } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Message } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { GetUser } from "../../services/admin/user";
import TotpRequire from "../../components/auth/totp-require";

function SignIn() {
  const router = useRouter();
  const [triggerRedirect, setTriggerRedirect] = useState(false);
  const [triggerSetupTotp, setTriggerSetupTotp] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message>({
    status: "success",
    message: "",
  });
  const [signInData, setSignInData] = useState<InputSignInService>({
    email: "",
    password: "",
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAudio(() => new Audio("/sounds/notification.mp3"));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    try {
      setIsLoading(() => true);
      event.preventDefault();
      const res = await signInService({
        email: signInData.email,
        password: signInData.password,
      });
      setMessage(() => {
        return {
          status: "success",
          message: "Login Success",
        };
      });
      setIsLoading(() => false);
      setOpen(() => true);
      setCookie(null, "access_token", res.access_token, {
        path: "/", // Cookie path (can be adjusted based on your needs)
        maxAge: 30 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
      });
      setTriggerRedirect(() => true);
      if (!res.user.TOTPsecret || !res.user.TOTPenable) {
        router.push("/auth/setup-totp");
      } else if (res.user.IsResetPassword === false) {
        router.push("/");
      } else if (res.user.IsResetPassword === true) {
        console.log(res.user.IsResetPassword);
        router.push("/auth/new-password");
      }
    } catch (err: any) {
      console.log(err);
      if (err.message === "MULTI-FACTOR AUTHENTICATION REQUIRED") {
        audio?.play();
        setTriggerSetupTotp(() => true);
      }
      setOpen(() => true);
      setIsLoading(() => false);
      setMessage(() => {
        return {
          status: "error",
          message: err.message?.toString(),
        };
      });
    }
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleChangeInputLogin = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    event.preventDefault();
    setSignInData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  return (
    <div className="flex h-screen w-screen flex-col items-center  justify-between bg-gradient-to-b from-second-color to-supper-main-color">
      {triggerRedirect && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-40 m-auto h-screen w-screen animate-pulse bg-blue-300/80 backdrop-blur-sm"></div>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert variant="filled" severity={message.status || "success"}>
          {message?.message}
        </Alert>
      </Snackbar>
      {triggerSetupTotp && signInData.email && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center">
          <TotpRequire email={signInData.email} />
          <footer className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-white/30 backdrop-blur-md "></footer>
        </div>
      )}

      <div className="mt-32 flex w-8/12 flex-col items-center justify-center gap-2">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-black">
          <Image
            src="/favicon.ico"
            fill
            className="object-contain"
            alt="logo oxyclick.com"
          />
        </div>
        <h1 className="font-Poppins text-xl font-semibold md:text-3xl">
          Welcome to OxyClick
        </h1>

        <div className="flex flex-col items-center justify-center gap-1 ">
          <h1 className="font-Poppins text-base font-medium text-icon-color md:text-lg">
            Sign In To Enter Dashboard
          </h1>
          <form className="flex w-80 flex-col" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              type="email"
              id="email"
              label="Email Address"
              name="email"
              onChange={handleChangeInputLogin}
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              onChange={handleChangeInputLogin}
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {isLoading ? (
              <div
                className="animate-pulse rounded-lg bg-blue-500 px-20 py-2 text-center
         font-Poppins text-lg font-semibold text-white
      ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110"
              >
                loading...
              </div>
            ) : (
              <button
                className="rounded-lg bg-blue-500 px-20 py-2
           font-Poppins text-lg font-semibold text-white
        ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110"
              >
                sign in
              </button>
            )}
            <section className="mt-2 flex justify-center gap-2 font-medium">
              <span>Don&apos;t have an account?</span>
              <Link
                href="/auth/sign-up"
                className="cursor-pointer text-blue-600 underline"
              >
                Sign Up
              </Link>
            </section>
          </form>
        </div>
      </div>
      <footer className="mb-4 font-Poppins text-xs text-icon-color">
        <section className="flex h-5 items-center  justify-center gap-1">
          <span className="text text-center">Oxyclick.com</span>
          <div className="h-1 w-1 rounded-full bg-icon-color"></div>
          <span className="text text-center">Support</span>
          <div className="h-1 w-1 rounded-full bg-icon-color"></div>
          <span className="text text-center">Guide</span>
          <div className="h-1 w-1 rounded-full bg-icon-color"></div>
          <span className="text text-center">Pricing</span>
          <div className="h-1 w-1 rounded-full bg-icon-color"></div>
          <span className="text text-center">Term</span>
          <div className="h-1 w-1 rounded-full bg-icon-color"></div>
          <span className="text text-center">Privacy</span>
        </section>
      </footer>
    </div>
  );
}

export default SignIn;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  } catch (err) {
    return {
      props: {},
    };
  }
};
