import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useState } from "react";
import { GetUser } from "../../services/admin/user";
import { Message, User } from "../../models";
import { useRouter } from "next/router";
import { NewPasswordService } from "../../services/auth/new-password";
import { Alert, Avatar, Snackbar, TextField, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
function NewPassword({ user }: { user: User }) {
  const router = useRouter();
  const [triggerRedirect, setTriggerRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState<{ password: string }>({
    password: "",
  });
  const [message, setMessage] = useState<Message>({
    status: "success",
    message: "",
  });
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    try {
      setIsLoading(() => true);
      event.preventDefault();
      await NewPasswordService({
        userId: user.id,
        newPassword: newPasswordData.password as string,
      });
      setMessage(() => {
        return {
          status: "success",
          message: "Successfully Reset Password",
        };
      });
      setIsLoading(() => false);
      setOpen(() => true);

      setTriggerRedirect(() => true);
      router.push("/");
    } catch (err: any) {
      console.log(err);
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
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-second-color to-supper-main-color">
      {triggerRedirect && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-40 m-auto h-screen w-screen animate-pulse bg-blue-300/80 backdrop-blur-sm"></div>
      )}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert variant="filled" severity={message?.status}>
          {message?.message}
        </Alert>
      </Snackbar>

      <div className="flex w-8/12 flex-col items-center justify-center gap-2">
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Enter New Password
        </Typography>
        <form className="flex w-96 flex-col" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNewPasswordData((prev) => {
                return {
                  ...prev,
                  password: event.target.value,
                };
              })
            }
            fullWidth
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
              enter
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default NewPassword;

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
    console.log(err);
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
