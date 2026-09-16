import { useRouter } from "next/router";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import Image from "next/image";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  requestSignUpCode,
  verifySignUpCode,
} from "../../services/auth/sign-up";
import {
  isSixDigitCode,
  resendRemainingSeconds,
  sanitizeCodeInput,
} from "../../utils/signupCode";

const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Step = "form" | "code";

function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validateData, setValidateData] = useState({
    name: "please fill data",
    email: "please fill data",
    password: "please fill data",
    confirmPassword: "please fill data",
  });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Turnstile: one widget for the form step, one interaction-only widget for resends.
  const formTurnstile = useRef<TurnstileInstance | null>(null);
  const resendTurnstile = useRef<TurnstileInstance | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Code step state.
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [sentAt, setSentAt] = useState<number>(0);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (step !== "code") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);

  const resendIn = resendRemainingSeconds(sentAt, now);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!turnstileToken) {
      Swal.fire("error!", "Please complete the captcha", "error");
      return;
    }
    try {
      setIsLoading(true);
      await requestSignUpCode({
        email: signUpData.email,
        name: signUpData.name,
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword,
        turnstileToken,
      });
      setSentAt(Date.now());
      setNow(Date.now());
      setCode("");
      setCodeError("");
      setStep("code");
    } catch (err: any) {
      Swal.fire("error!", err.message?.toString(), "error");
    } finally {
      // siteverify tokens are single-use: always get a fresh one.
      formTurnstile.current?.reset();
      setTurnstileToken(null);
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSixDigitCode(code)) return;
    try {
      setIsLoading(true);
      await verifySignUpCode({ email: signUpData.email, code });
      router.replace("/auth/pending");
    } catch (err: any) {
      setCodeError(err.message?.toString() ?? "Invalid or expired code");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || isLoading) return;
    try {
      setIsLoading(true);
      setCodeError("");
      const token = await resendTurnstile.current?.getResponsePromise();
      if (!token) throw { message: "Please complete the captcha" };
      await requestSignUpCode({
        email: signUpData.email,
        name: signUpData.name,
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword,
        turnstileToken: token,
      });
      setSentAt(Date.now());
      setNow(Date.now());
      setCode("");
    } catch (err: any) {
      setCodeError(err.message?.toString() ?? "Could not resend the code");
    } finally {
      resendTurnstile.current?.reset();
      setIsLoading(false);
    }
  };

  const backToForm = () => {
    setStep("form");
    setCode("");
    setCodeError("");
    formTurnstile.current?.reset();
    resendTurnstile.current?.reset();
    setTurnstileToken(null);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.ChangeEvent | MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });

    switch (name) {
      case "email":
        if (emailPattern.test(value)) {
          setValidateData((prev) => {
            return {
              ...prev,
              email: "",
            };
          });
        } else {
          setValidateData((prev) => {
            return {
              ...prev,
              email: "invild email",
            };
          });
        }
        break;
      case "name":
        if (value === "") {
          setValidateData((prev) => {
            return {
              ...prev,
              name: "please fill the value",
            };
          });
        } else {
          setValidateData((prev) => {
            return {
              ...prev,
              name: "",
            };
          });
        }
        break;
      case "password":
        if (value === "") {
          setValidateData((prev) => {
            return {
              ...prev,
              password: "please fill the value",
            };
          });
        } else {
          setValidateData((prev) => {
            return {
              ...prev,
              password: "",
            };
          });
        }
        break;
      case "confirmPassword":
        if (value === signUpData.password) {
          setValidateData((prev) => {
            return {
              ...prev,
              confirmPassword: "",
            };
          });
        } else {
          setValidateData((prev) => {
            return {
              ...prev,
              confirmPassword: "password does not match",
            };
          });
        }
        break;
    }
  };

  const formInvalid =
    !!validateData.confirmPassword ||
    !!validateData.name ||
    !!validateData.email ||
    !!validateData.password;

  return (
    <div className="bg-gradient-to-b from-second-color to-supper-main-color py-10">
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-black">
            <Image
              alt="logo"
              src="/favicon.ico"
              fill
              className="object-contain"
            />
          </div>

          {step === "form" ? (
            <>
              <h1 className="font-Poppins text-xl font-semibold">
                Sign Up to OxyClick
              </h1>
              <Box
                component="form"
                noValidate
                className="flex flex-col gap-5"
                onSubmit={handleSubmit}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <InputLabel>Name</InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      value={signUpData.name}
                      onChange={handleChange}
                      name="name"
                      autoComplete="name"
                    />
                    <InputLabel className="text-red-500">
                      {validateData.name}
                    </InputLabel>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel>Email Address</InputLabel>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      value={signUpData.email}
                      onChange={handleChange}
                      name="email"
                      placeholder="example@xxxx.com"
                      autoComplete="email"
                    />
                    <InputLabel className="text-red-500">
                      {validateData.email}
                    </InputLabel>
                  </Grid>

                  <Grid item xs={12}>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      required
                      fullWidth
                      value={signUpData.password}
                      onChange={handleChange}
                      name="password"
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    <InputLabel className="text-red-500">
                      {validateData.password}
                    </InputLabel>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel>Confirm Password</InputLabel>
                    <OutlinedInput
                      required
                      value={signUpData.confirmPassword}
                      onChange={handleChange}
                      fullWidth
                      name="confirmPassword"
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    <InputLabel className="text-red-500">
                      {validateData.confirmPassword}
                    </InputLabel>
                  </Grid>
                </Grid>

                <Turnstile
                  ref={formTurnstile}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />

                {isLoading ? (
                  <div className="animate-pulse rounded-lg bg-blue-500 px-20 py-2 text-center font-Poppins text-lg font-semibold text-white">
                    loading...
                  </div>
                ) : formInvalid || !turnstileToken ? (
                  <div className="rounded-lg bg-slate-500 px-20 py-2 text-center font-Poppins font-semibold text-white">
                    register
                  </div>
                ) : (
                  <button className="rounded-lg bg-blue-500 px-20 py-2 font-Poppins text-lg font-semibold text-white ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110">
                    register
                  </button>
                )}

                <section className="mt-2 flex justify-center gap-2 font-medium">
                  <span> Already have an account? </span>
                  <Link
                    href="/auth/sign-in"
                    className="cursor-pointer text-blue-600"
                  >
                    Sign in
                  </Link>
                </section>
              </Box>
            </>
          ) : (
            <>
              <h1 className="font-Poppins text-xl font-semibold">
                Check your email
              </h1>
              <p className="mt-2 text-center font-Poppins text-sm text-icon-color">
                We sent a 6-digit code to <b>{signUpData.email}</b>
              </p>
              <Box
                component="form"
                noValidate
                className="mt-5 flex w-full flex-col gap-4"
                onSubmit={handleVerify}
              >
                <TextField
                  fullWidth
                  id="code"
                  name="code"
                  label="Verification code"
                  value={code}
                  onChange={(e) => {
                    setCode(sanitizeCodeInput(e.target.value));
                    setCodeError("");
                  }}
                  inputProps={{
                    inputMode: "numeric",
                    maxLength: 6,
                    autoComplete: "one-time-code",
                  }}
                  autoFocus
                />
                {codeError && (
                  <InputLabel className="text-red-500">{codeError}</InputLabel>
                )}

                <Turnstile
                  ref={resendTurnstile}
                  siteKey={TURNSTILE_SITE_KEY}
                  options={{ appearance: "interaction-only" }}
                />

                {isLoading ? (
                  <div className="animate-pulse rounded-lg bg-blue-500 px-20 py-2 text-center font-Poppins text-lg font-semibold text-white">
                    loading...
                  </div>
                ) : !isSixDigitCode(code) ? (
                  <div className="rounded-lg bg-slate-500 px-20 py-2 text-center font-Poppins font-semibold text-white">
                    verify
                  </div>
                ) : (
                  <button className="rounded-lg bg-blue-500 px-20 py-2 font-Poppins text-lg font-semibold text-white ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110">
                    verify
                  </button>
                )}

                <section className="flex flex-col items-center gap-1 text-sm font-medium">
                  {resendIn > 0 ? (
                    <span className="text-icon-color">
                      Resend in {resendIn}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-blue-600"
                    >
                      Resend code
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={backToForm}
                    className="text-blue-600"
                  >
                    Use a different email
                  </button>
                </section>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </div>
  );
}

export default SignUp;
