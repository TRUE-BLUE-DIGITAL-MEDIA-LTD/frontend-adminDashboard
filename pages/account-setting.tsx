import React, { useState } from "react";
import DashboardLayout from "../layouts/dashboardLayout";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser, UpdateUserService } from "../services/admin/user";
import { ErrorMessages, User } from "../models";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import Swal from "sweetalert2";

function Index({ user }: { user: User }) {
  const [updateUserData, setUpdateUserData] = useState<{
    email?: string;
    name?: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({
    email: user.email,
    name: user.name,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      if (
        updateUserData.newPassword &&
        updateUserData.newPassword !== updateUserData.confirmPassword
      ) {
        throw new Error("Password not match");
      }
      Swal.fire({
        title: "Loading...",
        text: "Please wait.",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await UpdateUserService({
        email: updateUserData.email,
        name: updateUserData.name,
        ...(updateUserData.newPassword && {
          newPassword: updateUserData.newPassword,
        }),
        ...(updateUserData.oldPassword && {
          oldPassword: updateUserData.oldPassword,
        }),
      });

      Swal.fire({
        title: "Success",
        text: "Successfully update your account",
        icon: "success",
      });

      window.location.reload();
    } catch (error) {
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
      <div className="min-h-screen w-full bg-surface font-Poppins text-fg">
      <Form
        onSubmit={handleUpdateUser}
        className="mx-auto flex w-full max-w-7xl flex-col items-center justify-start px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="flex w-full max-w-lg flex-col items-start justify-start gap-5 rounded-2xl border border-line bg-panel p-6 text-fg shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-main-color">
            Profile
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-fg">Account Setting</h1>
          <Label className="text-base font-normal text-fg-muted">
            Update your account information
          </Label>

          <TextField
            isRequired
            className="flex w-full flex-col items-start text-sm font-medium text-fg-muted"
          >
            Email
            <Input
              value={updateUserData?.email}
              onChange={handleChange}
              name="email"
              placeholder="type email"
              type="email"
              className="mt-1 w-full rounded-lg border border-line-strong bg-surface/40 p-2.5 text-sm text-fg outline-none focus:border-main-color focus:ring-2 focus:ring-main-color/30"
            />
            <FieldError className="text-xs text-red-700 dark:text-red-400" />
          </TextField>
          <TextField
            isRequired
            className="flex w-full flex-col items-start text-sm font-medium text-fg-muted"
          >
            Name
            <Input
              value={updateUserData?.name}
              onChange={handleChange}
              name="name"
              placeholder="type name"
              type="text"
              className="mt-1 w-full rounded-lg border border-line-strong bg-surface/40 p-2.5 text-sm text-fg outline-none focus:border-main-color focus:ring-2 focus:ring-main-color/30"
            />
            <FieldError className="text-xs text-red-700 dark:text-red-400" />
          </TextField>
          <TextField className="flex w-full flex-col items-start text-sm font-medium text-fg-muted">
            Old Password
            <Input
              value={updateUserData?.oldPassword}
              onChange={handleChange}
              name="oldPassword"
              placeholder="type old password"
              type="password"
              className="mt-1 w-full rounded-lg border border-line-strong bg-surface/40 p-2.5 text-sm text-fg outline-none focus:border-main-color focus:ring-2 focus:ring-main-color/30"
            />
            <FieldError className="text-xs text-red-700 dark:text-red-400" />
          </TextField>
          <TextField className="flex w-full flex-col items-start text-sm font-medium text-fg-muted">
            New Password
            <Input
              value={updateUserData?.newPassword}
              onChange={handleChange}
              name="newPassword"
              placeholder="type new password"
              type="password"
              className="mt-1 w-full rounded-lg border border-line-strong bg-surface/40 p-2.5 text-sm text-fg outline-none focus:border-main-color focus:ring-2 focus:ring-main-color/30"
            />
            <FieldError className="text-xs text-red-700 dark:text-red-400" />
          </TextField>
          {updateUserData?.newPassword && (
            <TextField className="flex w-full flex-col items-start text-sm font-medium text-fg-muted">
              Confirm Password
              <Input
                value={updateUserData?.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                placeholder="type confirm password"
                type="password"
                className="mt-1 w-full rounded-lg border border-line-strong bg-surface/40 p-2.5 text-sm text-fg outline-none focus:border-main-color focus:ring-2 focus:ring-main-color/30"
              />
              <FieldError className="text-xs text-red-700 dark:text-red-400" />
            </TextField>
          )}
          <Button
            className="mt-2 w-full rounded-full bg-main-color p-2.5 font-semibold text-white transition hover:bg-[#0096c7]"
            type="submit"
          >
            Update
          </Button>
        </div>
      </Form>
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
