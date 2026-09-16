import { useRouter } from "next/router";
import React, { MouseEvent, useState } from "react";
import { SignUpService } from "../../services/auth/sign-up";
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
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

function SignUp() {
  const router = useRouter();
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsLoading(() => true);
      const signUp = await SignUpService({
        email: signUpData.email,
        name: signUpData.name,
        password: signUpData.password,
        confirmPassword: signUpData.confirmPassword,
      });

      Swal.fire("success", "sing up successfully", "success");
      router.push({
        pathname: "/auth/sign-in",
      });
      setIsLoading(() => false);
    } catch (err: any) {
      setIsLoading(() => false);
      Swal.fire("error!", err.message?.toString(), "error");
    }
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
  return (
    <div className="bg-gradient-to-b from-second-color to-supper-main-color  py-10">
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
              src="/faviconOxy.png"
              fill
              className="object-contain"
            />
          </div>
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
            {isLoading ? (
              <div
                className="animate-pulse rounded-lg bg-blue-500 px-20 py-2 text-center
         font-Poppins text-lg font-semibold text-white
      ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110"
              >
                loading...
              </div>
            ) : validateData.confirmPassword ||
              validateData.name ||
              validateData.email ||
              validateData.password ? (
              <div
                className=" rounded-lg bg-slate-500
        px-20 py-2 text-center
     font-Poppins font-semibold text-white ring-blue-200 transition duration-150"
              >
                register
              </div>
            ) : (
              <button
                className="rounded-lg bg-blue-500 px-20 py-2
           font-Poppins text-lg font-semibold text-white
        ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110"
              >
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
        </Box>
      </Container>
    </div>
  );
}

export default SignUp;
