import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputSignInService, signInService } from "../../services/auth/sign-in";
import { setCookie } from "nookies";
import { Alert, Snackbar, TextField } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Message } from "../../models";
import { useQuery } from "@tanstack/react-query";

function SignIn() {
  const router = useRouter();
  const [triggerRedirect, setTriggerRedirect] = useState(false);
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
        maxAge: 30 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
        path: "/", // Cookie path (can be adjusted based on your needs)
      });
      setTriggerRedirect(() => true);
      if (res.user.IsResetPassword === false) {
        router.push("/");
      } else if (res.user.IsResetPassword === true) {
        console.log(res.user.IsResetPassword);
        router.push("/auth/new-password");
      }
    } catch (err: any) {
      console.log(err);
      setOpen(() => true);
      setIsLoading(() => false);
      setMessage(() => {
        return {
          status: "error",
          message: err?.props?.response?.data?.message?.toString(),
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
    event: React.ChangeEvent<HTMLInputElement>
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
    <div className="bg-gradient-to-b from-second-color w-screen flex flex-col  items-center justify-between h-screen to-supper-main-color">
      {triggerRedirect && (
        <div className="w-screen animate-pulse h-screen bg-blue-300/80 backdrop-blur-sm absolute top-0 bottom-0 right-0 left-0 m-auto z-40"></div>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert variant="filled" severity={message.status || "success"}>
          {message?.message}
        </Alert>
      </Snackbar>

      <div className="flex flex-col mt-32 items-center justify-center gap-2 w-8/12">
        <div className="w-10 h-10 rounded-full relative bg-black overflow-hidden">
          <Image
            src="/favicon.ico"
            fill
            className="object-contain"
            alt="logo oxyclick.com"
          />
        </div>
        <h1 className="font-Poppins text-3xl font-semibold">
          Welcome to OxyClick
        </h1>
        <h1 className="font-Poppins text-icon-color text-lg font-medium">
          Sign In To Enter Dashboard
        </h1>
        <form className="flex flex-col w-96" onSubmit={handleSubmit}>
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
              className="bg-blue-500 text-center animate-pulse text-lg active:scale-110 hover:bg-blue-600
         hover:ring-2 ring-blue-200 transition duration-150
      font-Poppins font-semibold text-white px-20 rounded-lg py-2"
            >
              loading...
            </div>
          ) : (
            <button
              className="bg-blue-500 text-lg active:scale-110 hover:bg-blue-600
           hover:ring-2 ring-blue-200 transition duration-150
        font-Poppins font-semibold text-white px-20 rounded-lg py-2"
            >
              sign in
            </button>
          )}
          <section className="flex justify-center gap-2 font-medium mt-2">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/auth/sign-up"
              className="cursor-pointer underline text-blue-600"
            >
              Sign Up
            </Link>
          </section>
        </form>
      </div>
      <footer className="mb-4 font-Poppins text-xs text-icon-color">
        <section className="flex justify-center h-5  items-center gap-1">
          <span className="text-center text">Oxyclick.com</span>
          <div className="w-1 h-1 bg-icon-color rounded-full"></div>
          <span className="text-center text">Support</span>
          <div className="w-1 h-1 bg-icon-color rounded-full"></div>
          <span className="text-center text">Guide</span>
          <div className="w-1 h-1 bg-icon-color rounded-full"></div>
          <span className="text-center text">Pricing</span>
          <div className="w-1 h-1 bg-icon-color rounded-full"></div>
          <span className="text-center text">Term</span>
          <div className="w-1 h-1 bg-icon-color rounded-full"></div>
          <span className="text-center text">Privacy</span>
        </section>
      </footer>
    </div>
  );
}

export default SignIn;
