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
      <Form
        onSubmit={handleUpdateUser}
        className="mt-10 flex w-full flex-col items-center justify-start py-5"
      >
        <div className="flex w-80 flex-col items-start justify-start gap-5 rounded-md bg-gray-200 p-5 md:w-5/12">
          <h1 className="text-4xl font-bold">Account Setting</h1>
          <Label className="text-lg font-normal">
            Update your account information
          </Label>

          <TextField
            isRequired
            className="flex w-full flex-col items-start text-lg font-normal"
          >
            Email
            <Input
              value={updateUserData?.email}
              onChange={handleChange}
              name="email"
              placeholder="type email"
              type="email"
              className="w-full p-2"
            />
            <FieldError className="text-xs text-red-700" />
          </TextField>
          <TextField
            isRequired
            className="flex w-full flex-col items-start text-lg font-normal"
          >
            Name
            <Input
              value={updateUserData?.name}
              onChange={handleChange}
              name="name"
              placeholder="type name"
              type="text"
              className="w-full p-2"
            />
            <FieldError className="text-xs text-red-700" />
          </TextField>
          <TextField className="flex w-full flex-col items-start text-lg font-normal">
            Old Password
            <Input
              value={updateUserData?.oldPassword}
              onChange={handleChange}
              name="oldPassword"
              placeholder="type old password"
              type="password"
              className="w-full p-2"
            />
            <FieldError className="text-xs text-red-700" />
          </TextField>
          <TextField className="flex w-full flex-col items-start text-lg font-normal">
            New Password
            <Input
              value={updateUserData?.newPassword}
              onChange={handleChange}
              name="newPassword"
              placeholder="type new password"
              type="password"
              className="w-full p-2"
            />
            <FieldError className="text-xs text-red-700" />
          </TextField>
          {updateUserData?.newPassword && (
            <TextField className="flex w-full flex-col items-start text-lg font-normal">
              Confirm Password
              <Input
                value={updateUserData?.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                placeholder="type confirm password"
                type="password"
                className="w-full p-2"
              />
              <FieldError className="text-xs text-red-700" />
            </TextField>
          )}
          <Button
            className="w-full rounded-md bg-blue-400 p-2 font-semibold text-white transition duration-150 hover:bg-blue-600"
            type="submit"
          >
            Update
          </Button>
        </div>
      </Form>
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
